# Grafana Monitoring Guide

This guide covers how to use Grafana for monitoring the Job Portal services.

## 🚀 Quick Start

```bash
# Start monitoring stack
cd docker && docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
# Login: admin / admin
```

## 📊 Accessing Dashboards

1. **Login** → Go to http://localhost:3001
2. **Navigate** → Click ☰ (hamburger menu) → Dashboards
3. **Select** → "Job Portal - Services Overview"

---

## 📈 Adding Custom Metrics

### Request Rate (RPS)
```promql
# Total requests per second by service
sum(rate(http_requests_total[1m])) by (job)

# Requests per second by endpoint
sum(rate(http_requests_total[1m])) by (path)
```

### Latency Percentiles

| Metric | PromQL |
|--------|--------|
| **p50** (median) | `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))` |
| **p95** | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))` |
| **p99** | `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))` |
| **Average** | `sum(rate(http_request_duration_seconds_sum[5m])) / sum(rate(http_request_duration_seconds_count[5m]))` |

### Error Rate
```promql
# Error rate (5xx responses)
sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)
  / sum(rate(http_requests_total[5m])) by (job) * 100
```

### Active Requests
```promql
http_requests_in_flight
```

---

## 🖥️ CPU & Memory Metrics

> **Note:** CPU/Memory metrics require additional setup with **cAdvisor** or **node_exporter**.

### Option 1: Add cAdvisor (for Docker containers)

Add to `docker-compose.monitoring.yml`:
```yaml
cadvisor:
  image: gcr.io/cadvisor/cadvisor:latest
  container_name: cadvisor
  ports:
    - "8080:8080"
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:rw
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  networks:
    - job-portal-network
```

Add scrape target in `prometheus.yml`:
```yaml
- job_name: 'cadvisor'
  static_configs:
    - targets: ['cadvisor:8080']
```

### CPU Queries (with cAdvisor)
```promql
# CPU usage by container
rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100

# Memory usage by container
container_memory_usage_bytes{name!=""} / 1024 / 1024
```

### Option 2: Add node_exporter (for host metrics)

```yaml
node-exporter:
  image: prom/node-exporter:latest
  container_name: node-exporter
  ports:
    - "9100:9100"
  networks:
    - job-portal-network
```

---

## 📝 Viewing Logs with Loki

Loki is now integrated into the monitoring stack for centralized log viewing.

### Viewing Logs in Grafana

1. **Open Grafana**: http://localhost:3001
2. **Go to Explore**: Click ☰ → Explore
3. **Select Loki**: Choose "Loki" from the datasource dropdown
4. **Query logs**:

```logql
# View all logs from job-service
{job="job-service"}

# View all logs from auth-service
{job="auth-service"}

# View all logs from embedding-service
{job="embedding-service"}

# Search for errors across all services
{job=~".*-service"} |= "error"

# Filter by log level
{job="job-service"} |= "ERROR"

# View all logs from all services
{job="job-portal"}
```

### LogQL Cheat Sheet

| Query | Description |
|-------|-------------|
| `{job="job-service"}` | All logs from job-service |
| `{service=~".*"}` | All services |
| `|= "error"` | Contains "error" |
| `!= "debug"` | Does not contain "debug" |
| `| json` | Parse JSON logs |
| `| line_format` | Format output |

### Log Labels Available
- `job`: Service name (auth-service, user-service, job-service, etc.)
- `service`: Same as job
- `filename`: Log file path

---

## 🎨 Creating a Dashboard Panel

1. **Go to Dashboard** → Click "Add" → "Visualization"
2. **Select Data Source** → Prometheus
3. **Enter Query** → e.g., `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))`
4. **Configure**:
   - Title: "P95 Latency"
   - Legend: `{{job}}`
   - Unit: seconds (s)
5. **Save**

---

## 📊 Recommended Dashboard Panels

| Panel | Query | Unit |
|-------|-------|------|
| Request Rate | `sum(rate(http_requests_total[1m])) by (job)` | req/s |
| P95 Latency | `histogram_quantile(0.95, ...)` | seconds |
| P99 Latency | `histogram_quantile(0.99, ...)` | seconds |
| Error Rate | `sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)` | percent |
| Active Requests | `http_requests_in_flight` | short |
| Service Status | `up` | short |

---

## 🔧 Metrics Port Reference

| Service | App Port | Metrics Port |
|---------|----------|--------------|
| auth-service | 8001 | 9101 |
| user-service | 8002 | 9102 |
| job-service | 8003 | 9103 |
| utility-service | 8004 | 9104 |
| embedding-service | 8005 | 9105 |
| Prometheus | 9090 | - |
| Grafana | 3001 | - |

---

## 🚨 Setting Up Alerts

1. Go to **Alerting** → **Alert Rules** → **New**
2. Create condition:
   ```promql
   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
   ```
3. Set evaluation: every 1m, for 5m
4. Add notification channel (Slack, Email, etc.)

---

## 🔗 Useful Links

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Prometheus Targets**: http://localhost:9090/targets
- **PromQL Docs**: https://prometheus.io/docs/prometheus/latest/querying/basics/
