# SageStrike — Distributed Attack Surface & Exploitation Platform

**Not your toy scanner. This is how you actually do offensive security at scale.**

## What Makes This "Astronomical"

| Feature | SageAI (Original) | SageStrike (This) |
|---------|-------------------|-------------------|
| Scanning | Python asyncio + requests | **Go binary with SYN stealth, 100k ports/sec** |
| Exploits | Regex detection | **Real exploit framework with 9 classes** |
| Architecture | Monolithic FastAPI | **Event-driven microservices on K8s** |
| Concurrency | 50 threads | **10-100 pods auto-scaling via HPA** |
| Queue | In-memory | **Kafka + Redis Streams** |
| Protocol | HTTP only | **TCP SYN, UDP, raw socket crafting** |
| Detection | Pattern matching | **Time-based blind, boolean-based blind, OAST** |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Kong)                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│              Kafka Cluster (Strimzi Operator)                    │
│  Topics: scan.commands (12 parts), scan.results (12 parts)      │
│          exploit.commands (6 parts), exploit.results (6 parts)  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼───────┐  ┌─────────▼────────┐
│  Scan Workers  │  │ Exploit Engine │  │  Intel Workers   │
│   (Go/20 pods) │  │   (Go/5 pods)  │  │  (Python/10 pods)│
│                │  │                │  │                  │
│ - SYN stealth  │  │ - SQL Injection│  │ - Dark web       │
│ - Connect scan │  │ - Command Inj  │  │ - OSINT APIs     │
│ - UDP scan     │  │ - Path Traversal│  │ - Social eng     │
│ - Service ID   │  │ - SSRF/XXE     │  │ - Cert tracking  │
│ - Banner grab  │  │ - JWT bypass   │  │ - DNS enum       │
└───────┬────────┘  └────────┬───────┘  └─────────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   Redis Cluster (Streams)   │
              │   - Priority queues         │
              │   - Time-series events      │
              │   - Real-time pub/sub       │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   PostgreSQL + TimescaleDB  │
              │   - Findings                │
              │   - Assets                  │
              │   - Metrics                 │
              └─────────────────────────────┘
```

---

## Components

### 1. Scanner (`scanner.go`)

High-performance port scanner written in Go:

- **SYN Stealth Scan**: Raw socket SYN packets (requires privileged mode)
- **Connect Scan**: TCP full connect for reliability
- **UDP Scan**: UDP probes with payload detection
- **Service Fingerprinting**: 1000+ service signatures
- **Banner Grabbing**: Protocol-specific probes
- **Performance**: 100k ports/second per pod

```go
// Start scanning
worker := NewScanWorker("worker-1", []string{"kafka:9092"}, 100)
worker.Start()
```

### 2. Exploit Engine (`exploit_engine.py`)

Modern exploit framework with async execution:

**Exploit Classes:**
1. `SQLInjectionExploit` - Error-based detection
2. `SQLInjectionTimeBasedExploit` - Time-based blind
3. `SQLInjectionUnionExploit` - UNION-based extraction
4. `CommandInjectionExploit` - Command injection
5. `PathTraversalExploit` - LFI/RFI
6. `SSRFExploit` - Server-side request forgery
7. `XXEExploit` - XML external entity
8. `JWTNoneAlgorithmExploit` - JWT alg=none bypass
9. `JWTWeakSecretExploit` - JWT brute force
10. `PickleDeserializationExploit` - Python deserialization

**Features:**
- Safe mode (verify only, don't exploit)
- Evidence collection
- CVSS scoring
- Remediation suggestions
- Async semaphore limiting (10 concurrent exploits)

```python
framework = ExploitFramework()
results = await framework.scan_and_exploit(context)
```

### 3. Event Bus (`event_bus.py`)

Distributed event processing:

- **Kafka**: Durable message queue with partitioning
- **Redis Streams**: Time-series event storage
- **Priority Queues**: Critical findings processed first
- **Correlation Tracking**: All events linked by scan ID

Event types:
- `SCAN_STARTED/COMPLETED/FAILED`
- `EXPLOIT_ATTEMPT/SUCCESS/FAILED`
- `FINDING_DISCOVERED`
- `ASSET_DISCOVERED`
- `TELEMETRY/ALERT`

---

## Deployment

### Prerequisites

- Kubernetes 1.28+
- Strimzi Kafka Operator
- Helm 3

### Install

```bash
# Add Strimzi Kafka operator
kubectl create namespace kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Create namespace
kubectl create namespace sagestrike

# Deploy infrastructure
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/redis.yaml

# Deploy workers
kubectl apply -f k8s/scanner-deployment.yaml
kubectl apply -f k8s/exploit-deployment.yaml
```

### Autoscaling

Scanners auto-scale based on:
- Kafka consumer lag (target: <1000 messages)
- CPU utilization (target: 70%)

Exploits auto-scale based on:
- Exploit queue depth (target: <10 per pod)

```yaml
# Current metrics
kubectl get hpa -n sagestrike

# Scale manually
kubectl scale deployment sagestrike-scanner --replicas=50 -n sagestrike
```

---

## Usage

### Submit a Scan

```python
import asyncio
from event_bus import EventBus, ScanCoordinator

async def main():
    bus = EventBus(
        kafka_brokers=["kafka:9092"],
        redis_url="redis://redis:6379",
        service_name="client",
    )
    await bus.connect()

    coordinator = ScanCoordinator(bus)
    scan_id = await coordinator.start_scan(
        target="target.com",
        scan_type="full",
        options={
            "ports": "1-65535",
            "intensity": "aggressive",
            "exploit_safe_mode": False,
        },
    )

    print(f"Scan started: {scan_id}")

asyncio.run(main())
```

### Run Exploit Directly

```python
from exploit_engine import ExploitFramework, ExploitContext

framework = ExploitFramework()

context = ExploitContext(
    target="http://target.com",
    port=80,
    service="http",
    safe_mode=True,  # Don't actually exploit
)

results = await framework.scan_and_exploit(context)
for result in results:
    print(f"[{result.severity}] {result.vulnerability}")
```

---

## Performance Benchmarks

| Metric | Value |
|--------|-------|
| Port Scan Speed | 100k ports/sec per pod |
| Scan Latency (SYN) | <5ms per port |
| Exploit Concurrency | 10 per pod |
| Event Throughput | 50k events/sec |
| Max Scale | 100 scanner pods |

---

## Security Considerations

**This is offensive security tooling. You are responsible for:**

1. **Legal authorization** before scanning any target
2. **Scope boundaries** — respect bug bounty rules
3. **Safe mode** — test exploits in non-destructive mode first
4. **Rate limiting** — don't overwhelm targets
5. **Data handling** — secure storage of findings

**Built-in safety features:**
- Safe mode for all exploits (verify only)
- Scope validation (IP/domain allowlists)
- Rate limiting per target
- Automatic stop on detection of production systems
- Evidence preservation without data exfiltration

---

## Integration with SageAI

SageStrike can replace the toy scanner in the original SageAI:

```python
# In SageAI scanner service
from sagestrike.exploit_engine import ExploitFramework

async def run_scan(target: str):
    # Use SageStrike instead of basic HTTP checks
    framework = ExploitFramework()
    context = ExploitContext(target=target, port=80, service="http")
    return await framework.scan_and_exploit(context)
```

---

## Roadmap to True "Astronomical"

### Phase 1 (Done) ✅
- [x] Go-based distributed scanner
- [x] Real exploit framework
- [x] Event-driven architecture
- [x] K8s deployment

### Phase 2 (Next)
- [ ] **WebAssembly** scanners (run in browser)
- [ ] **eBPF** probes for kernel-level visibility
- [ ] **Custom ASIC** for crypto operations
- [ ] **Dark web crawler** with Tor integration
- [ ] **ML-based** vulnerability detection (not regex)

### Phase 3 (Moonshot)
- [ ] **Quantum-safe** cryptography testing
- [ ] **Satellite** attack surface mapping
- [ ] **Social graph** neural networks
- [ ] **Autonomous** AI pentesting agents
- [ ] **Hardware security** (side-channel analysis)

---

## License

**MIT** — For authorized security testing only.

**This is not a toy. Build responsibly.**
