# Multi-stage build for Go scanner
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY scanner.go ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o scanner scanner.go

# Final minimal image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /

COPY --from=builder /app/scanner .

# Run as non-root
RUN adduser -D -u 1000 scanner
USER scanner

EXPOSE 8080

ENTRYPOINT ["./scanner"]
