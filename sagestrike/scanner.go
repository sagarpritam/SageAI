// scanner.go - High-performance distributed scanner
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/segmentio/kafka-go"
	"github.com/sirupsen/logrus"
)

var log = logrus.New()

// ScanTarget represents a target to scan
type ScanTarget struct {
	ID        string   `json:"id"`
	Host      string   `json:"host"`
	Ports     []int    `json:"ports"`
	ScanType  string   `json:"scan_type"` // syn, connect, udp
	Priority  int      `json:"priority"`
	Source    string   `json:"source"`
	Timestamp int64    `json:"timestamp"`
}

// ScanResult represents a single port scan result
type ScanResult struct {
	TargetID   string            `json:"target_id"`
	Host       string            `json:"host"`
	Port       int               `json:"port"`
	Protocol   string            `json:"protocol"`
	State      string            `json:"state"` // open, closed, filtered
	Service    string            `json:"service"`
	Banner     string            `json:"banner"`
	TTL        uint8             `json:"ttl"`
	RTT        int64             `json:"rtt_ms"`
	Metadata   map[string]string `json:"metadata"`
	Timestamp  int64             `json:"timestamp"`
	WorkerID   string            `json:"worker_id"`
}

// ScanWorker is the main scanning engine
type ScanWorker struct {
	ID            string
	KafkaReader   *kafka.Reader
	KafkaWriter   *kafka.Writer
	WorkerCount   int
	Timeout       time.Duration
	ResultsChan   chan ScanResult
	ctx           context.Context
	cancel        context.CancelFunc
}

// NewScanWorker creates a new scanning worker
func NewScanWorker(id string, brokers []string, workerCount int) *ScanWorker {
	ctx, cancel := context.WithCancel(context.Background())

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:         brokers,
		Topic:           "scan.commands",
		GroupID:         "scan-workers",
		MinBytes:        10e3,
		MaxBytes:        10e6,
		MaxWait:         time.Second,
		ReadLagInterval: time.Second,
	})

	writer := kafka.NewWriter(kafka.WriterConfig{
		Brokers:  brokers,
		Topic:    "scan.results",
		Balancer: &kafka.LeastBytes{},
		Async:    true,
	})

	return &ScanWorker{
		ID:          id,
		KafkaReader: reader,
		KafkaWriter: writer,
		WorkerCount: workerCount,
		Timeout:     30 * time.Second,
		ResultsChan: make(chan ScanResult, 10000),
		ctx:         ctx,
		cancel:      cancel,
	}
}

// Start begins the scanning loop
func (w *ScanWorker) Start() {
	log.Infof("Scan worker %s starting with %d goroutines", w.ID, w.WorkerCount)

	// Start result processor
	go w.processResults()

	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < w.WorkerCount; i++ {
		wg.Add(1)
		go w.worker(i, &wg)
	}

	wg.Wait()
}

// worker processes scan jobs
func (w *ScanWorker) worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	log.Infof("Worker %d-%d started", w.ID, id)

	for {
		select {
		case <-w.ctx.Done():
			return
		default:
			msg, err := w.KafkaReader.ReadMessage(w.ctx)
			if err != nil {
				if w.ctx.Err() != nil {
					return
				}
				log.Errorf("Failed to read message: %v", err)
				continue
			}

			var target ScanTarget
			if err := json.Unmarshal(msg.Value, &target); err != nil {
				log.Errorf("Failed to unmarshal target: %v", err)
				continue
			}

			w.scanTarget(target)
		}
	}
}

// scanTarget performs the actual scanning
func (w *ScanWorker) scanTarget(target ScanTarget) {
	startTime := time.Now()

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 1000) // Limit concurrent connections

	for _, port := range target.Ports {
		wg.Add(1)
		semaphore <- struct{}{}

		go func(p int) {
			defer wg.Done()
			defer func() { <-semaphore }()

			result := w.scanPort(target, p)
			w.ResultsChan <- result
		}(port)
	}

	wg.Wait()

	log.Infof("Scan completed for %s in %v", target.Host, time.Since(startTime))
}

// scanPort scans a single port
func (w *ScanWorker) scanPort(target ScanTarget, port int) ScanResult {
	result := ScanResult{
		TargetID:  target.ID,
		Host:      target.Host,
		Port:      port,
		Protocol:  "tcp",
		State:     "filtered",
		Timestamp: time.Now().UnixNano(),
		WorkerID:  w.ID,
	}

	address := fmt.Sprintf("%s:%d", target.Host, port)

	switch target.ScanType {
	case "syn":
		result = w.synScan(target, port)
	case "connect":
		result = w.connectScan(target, port)
	case "udp":
		result = w.udpScan(target, port)
	default:
		result = w.connectScan(target, port)
	}

	// Service detection and banner grabbing if port is open
	if result.State == "open" {
		result.Service = w.detectService(target.Host, port)
		result.Banner = w.grabBanner(address, result.Service)
	}

	return result
}

// connectScan performs a TCP connect scan (most reliable but logged)
func (w *ScanWorker) connectScan(target ScanTarget, port int) ScanResult {
	result := ScanResult{
		TargetID:  target.ID,
		Host:      target.Host,
		Port:      port,
		Protocol:  "tcp",
		WorkerID:  w.ID,
	}

	address := fmt.Sprintf("%s:%d", target.Host, port)
	start := time.Now()

	conn, err := net.DialTimeout("tcp", address, w.Timeout)
	if err != nil {
		if opErr, ok := err.(*net.OpError); ok {
			if opErr.Timeout() {
				result.State = "filtered"
			} else {
				result.State = "closed"
			}
		} else {
			result.State = "closed"
		}
		return result
	}
	defer conn.Close()

	result.State = "open"
	result.RTT = time.Since(start).Milliseconds()

	// Get TTL from connection if possible
	if tcpConn, ok := conn.(*net.TCPConn); ok {
		if rawConn, err := tcpConn.SyscallConn(); err == nil {
			rawConn.Control(func(fd uintptr) {
				// Platform-specific TTL reading would go here
				result.TTL = 64 // Default assumption
			})
		}
	}

	return result
}

// synScan performs a SYN scan (stealthy, requires root)
func (w *ScanWorker) synScan(target ScanTarget, port int) ScanResult {
	result := ScanResult{
		TargetID:  target.ID,
		Host:      target.Host,
		Port:      port,
		Protocol:  "tcp",
		WorkerID:  w.ID,
	}

	// SYN scan requires raw sockets - implementation depends on platform
	// This is a simplified version that falls back to connect scan
	// Real implementation would craft raw SYN packets

	// For now, use connect scan with reduced timeout
	address := fmt.Sprintf("%s:%d", target.Host, port)
	start := time.Now()

	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
			result.State = "filtered"
		} else {
			result.State = "closed"
		}
		return result
	}
	conn.Close()

	result.State = "open"
	result.RTT = time.Since(start).Milliseconds()
	return result
}

// udpScan performs a UDP scan
func (w *ScanWorker) udpScan(target ScanTarget, port int) ScanResult {
	result := ScanResult{
		TargetID:  target.ID,
		Host:      target.Host,
		Port:      port,
		Protocol:  "udp",
		State:     "open|filtered",
		WorkerID:  w.ID,
	}

	address := fmt.Sprintf("%s:%d", target.Host, port)
	conn, err := net.DialTimeout("udp", address, w.Timeout)
	if err != nil {
		result.State = "closed"
		return result
	}
	defer conn.Close()

	// Send UDP payload
	payload := []byte("\x00") // Null byte probe
	conn.SetWriteDeadline(time.Now().Add(w.Timeout))
	_, err = conn.Write(payload)
	if err != nil {
		result.State = "closed"
		return result
	}

	// Try to read response
	conn.SetReadDeadline(time.Now().Add(w.Timeout))
	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err == nil && n > 0 {
		result.State = "open"
		result.Banner = string(buf[:n])
	}

	return result
}

// detectService identifies the service running on a port
func (w *ScanWorker) detectService(host string, port int) string {
	// Common port mappings
	commonPorts := map[int]string{
		21:    "ftp",
		22:    "ssh",
		23:    "telnet",
		25:    "smtp",
		53:    "dns",
		80:    "http",
		110:   "pop3",
		143:   "imap",
		443:   "https",
		445:   "smb",
		3306:  "mysql",
		3389:  "rdp",
		5432:  "postgresql",
		6379:  "redis",
		8080:  "http-proxy",
		9200:  "elasticsearch",
		27017: "mongodb",
	}

	if service, ok := commonPorts[port]; ok {
		return service
	}

	return "unknown"
}

// grabBanner attempts to grab service banner
func (w *ScanWorker) grabBanner(address string, service string) string {
	// Service-specific probes
	probes := map[string][]byte{
		"http":    []byte("HEAD / HTTP/1.0\r\n\r\n"),
		"https":   []byte("HEAD / HTTP/1.0\r\n\r\n"),
		"ssh":     []byte(nil), // SSH sends banner immediately
		"ftp":     []byte(nil),
		"smtp":    []byte(nil),
		"telnet":  []byte(nil),
		"mysql":   []byte(nil),
		"redis":   []byte("PING\r\n"),
		"mongodb": []byte(nil),
	}

	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		return ""
	}
	defer conn.Close()

	// Send probe if applicable
	if probe, ok := probes[service]; ok && len(probe) > 0 {
		conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		conn.Write(probe)
	}

	// Read response
	conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err != nil || n == 0 {
		return ""
	}

	banner := string(buf[:n])
	if len(banner) > 256 {
		banner = banner[:256] + "..."
	}

	return banner
}

// processResults handles sending results to Kafka
func (w *ScanWorker) processResults() {
	batch := make([]ScanResult, 0, 100)
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-w.ctx.Done():
			w.flushResults(batch)
			return
		case result := <-w.ResultsChan:
			batch = append(batch, result)
			if len(batch) >= 100 {
				w.flushResults(batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				w.flushResults(batch)
				batch = batch[:0]
			}
		}
	}
}

// flushResults sends batched results to Kafka
func (w *ScanWorker) flushResults(results []ScanResult) {
	if len(results) == 0 {
		return
	}

	messages := make([]kafka.Message, len(results))
	for i, result := range results {
		data, err := json.Marshal(result)
		if err != nil {
			log.Errorf("Failed to marshal result: %v", err)
			continue
		}
		messages[i] = kafka.Message{
			Key:   []byte(result.TargetID),
			Value: data,
		}
	}

	if err := w.KafkaWriter.WriteMessages(context.Background(), messages...); err != nil {
		log.Errorf("Failed to write results: %v", err)
	}
}

// Stop gracefully shuts down the worker
func (w *ScanWorker) Stop() {
	log.Infof("Shutting down worker %s", w.ID)
	w.cancel()
	w.KafkaReader.Close()
	w.KafkaWriter.Close()
	close(w.ResultsChan)
}

func main() {
	log.SetLevel(logrus.InfoLevel)

	// Get configuration from environment
	workerID := getEnv("WORKER_ID", "worker-1")
	brokers := []string{getEnv("KAFKA_BROKERS", "localhost:9092")}
	workerCount := 10

	worker := NewScanWorker(workerID, brokers, workerCount)

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go worker.Start()

	<-sigChan
	worker.Stop()
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
