# Job Portal - Deployment Options

## Your Stack's Resource Profile

| Component | Estimated RAM | Notes |
|-----------|-------------|-------|
| 5× Go services | ~50 MB each = **250 MB** | Static binaries, very efficient |
| Embedding service (Python + ONNX) | **500–800 MB** | ML model loaded in memory |
| Next.js frontend | **150–250 MB** | Node.js runtime |
| Redis | **50–100 MB** | Depends on cached data |
| Kafka + Zookeeper | **800 MB–1.5 GB** | JVM-based, memory hungry |
| **Total** | **~2–3 GB** | Minimum for all services |

> [!IMPORTANT]
> Kafka + Zookeeper alone consume ~1+ GB RAM. Consider replacing with a managed message queue on lower-end servers.

---

## Option 1: VPS (Hetzner / DigitalOcean / Vultr)

**Best for:** Full control, lowest cost, learning DevOps

| Attribute | Details |
|-----------|---------|
| 💰 **Price** | **$7–20/month** (4 GB RAM VPS) |
| 🔧 **Difficulty** | ⭐⭐⭐⭐ Hard — you manage everything |
| 🔄 **Flexibility** | ⭐⭐⭐⭐⭐ Full root access, any config |
| 🧠 **RAM** | 4 GB minimum, **8 GB recommended** |

### Pricing Examples

| Provider | Plan | RAM | vCPU | Storage | Price |
|----------|------|-----|------|---------|-------|
| **Hetzner** CX22 | Shared | 4 GB | 2 | 40 GB | **€3.99/mo** (~$4.30) |
| **Hetzner** CX32 | Shared | 8 GB | 4 | 80 GB | **€7.49/mo** (~$8.10) |
| **DigitalOcean** | Basic | 4 GB | 2 | 80 GB | **$24/mo** |
| **Vultr** | Cloud | 4 GB | 2 | 100 GB | **$24/mo** |

### What You'd Need to Set Up
- Docker & Docker Compose on the VPS  
- Nginx reverse proxy + SSL (Let's Encrypt)  
- Firewall rules (UFW)  
- CI/CD pipeline (GitHub Actions → SSH deploy)  
- Log management & monitoring  
- Backup strategy  

### Pros & Cons
✅ Cheapest option by far (Hetzner is unbeatable)  
✅ Full control over everything  
✅ Great for learning  
❌ You are the DevOps team  
❌ Have to handle security, updates, backups yourself  
❌ Downtime risk if server fails  

---

## Option 2: Railway

**Best for:** Fast deployment, zero DevOps, growing projects

| Attribute | Details |
|-----------|---------|
| 💰 **Price** | **$20–50/month** (usage-based) |
| 🔧 **Difficulty** | ⭐ Very Easy — git push to deploy |
| 🔄 **Flexibility** | ⭐⭐⭐ Good, some limitations |
| 🧠 **RAM** | 8 GB shared across services (Pro plan) |

### Pricing Breakdown

| Plan | RAM | vCPU | Price | Notes |
|------|-----|------|-------|-------|
| **Trial** | 512 MB | 0.5 | Free (500 hrs) | Testing only |
| **Hobby** | 8 GB | 8 | **$5/mo** + usage | ~$20-30/mo for your stack |
| **Pro** | 32 GB | 32 | **$20/mo** + usage | ~$40-60/mo for your stack |

### How It Works
1. Connect your GitHub repo  
2. Railway auto-detects Dockerfiles  
3. Push to `main` → auto deploy  
4. Built-in Redis & PostgreSQL addons  
5. Free SSL & custom domains  

### Pros & Cons
✅ Easiest deployment experience  
✅ Auto-scaling, zero config  
✅ Built-in Redis/Postgres addons  
✅ Preview environments per PR  
❌ Cost scales with usage (can get expensive)  
❌ Less control than VPS  
❌ Kafka needs external provider (Upstash/Confluent Cloud)  

---

## Option 3: Fly.io

**Best for:** Global edge deployment, good balance of control & ease

| Attribute | Details |
|-----------|---------|
| 💰 **Price** | **$15–40/month** |
| 🔧 **Difficulty** | ⭐⭐ Easy — CLI-based deploy |
| 🔄 **Flexibility** | ⭐⭐⭐⭐ Edge regions, custom machines |
| 🧠 **RAM** | Choose per-machine (256 MB – 8 GB) |

### Pricing Breakdown

| Resource | Free Tier | Paid |
|----------|-----------|------|
| Shared CPU VMs | 3 free | $1.94/mo each (256 MB) |
| Dedicated CPU | — | $30/mo (1 GB) |
| Upstash Redis | 200 commands free | $0.20/100K commands |

### Estimated Monthly Cost

| Service | Machine | RAM | Cost |
|---------|---------|-----|------|
| 5× Go services | shared-cpu-1x | 256 MB | $1.94 × 5 = **$9.70** |
| Embedding | performance-1x | 1 GB | **$5.70** |
| Frontend | shared-cpu-1x | 512 MB | **$3.57** |
| Upstash Redis | — | — | **~$1** |
| **Total** | | | **~$20/mo** |

### Pros & Cons
✅ Deploy to multiple regions (low latency worldwide)  
✅ Built-in scaling & health checks  
✅ Excellent CLI tooling  
✅ Good pricing for lightweight services  
❌ No native Kafka (need external: Upstash Kafka ~$2/mo)  
❌ Slightly more complex than Railway  

---

## Option 4: AWS (ECS Fargate / Lightsail)

**Best for:** Production-grade, enterprise scalability

| Attribute | Details |
|-----------|---------|
| 💰 **Price** | **$50–150+/month** |
| 🔧 **Difficulty** | ⭐⭐⭐⭐⭐ Expert — steep learning curve |
| 🔄 **Flexibility** | ⭐⭐⭐⭐⭐ Unlimited scalability |
| 🧠 **RAM** | Configurable, 512 MB–30 GB per task |

### ECS Fargate Pricing (ap-southeast-1)

| Service | vCPU | RAM | Monthly Cost |
|---------|------|-----|-------------|
| 5× Go services | 0.25 each | 512 MB each | $9 × 5 = **$45** |
| Embedding | 0.5 | 1 GB | **$18** |
| Frontend | 0.25 | 512 MB | **$9** |
| ALB (Load Balancer) | — | — | **$16** + data |
| ElastiCache Redis | cache.t3.micro | 512 MB | **$13** |
| MSK Kafka | kafka.t3.small | — | **$50+** |
| **Total** | | | **~$150+/mo** |

### Lightsail Alternative (Simpler AWS)

| Plan | RAM | vCPU | Storage | Price |
|------|-----|------|---------|-------|
| Standard | 4 GB | 2 | 80 GB | **$20/mo** |
| Standard | 8 GB | 2 | 160 GB | **$40/mo** |

> [!TIP]
> **AWS Lightsail** gives you a VPS-like experience at AWS pricing, without the ECS complexity. Best of both worlds if you want AWS ecosystem access.

### Pros & Cons
✅ Industry standard, unlimited scale  
✅ Managed services for everything  
✅ Great monitoring (CloudWatch)  
✅ Free tier for 12 months  
❌ Very expensive for small projects  
❌ Complex setup (IAM, VPC, ECS, ECR, etc.)  
❌ Overkill for early-stage products  

---

## Comparison Summary

| | VPS (Hetzner) | Railway | Fly.io | AWS ECS |
|---|---|---|---|---|
| 💰 **Monthly Cost** | **$4–8** | $20–50 | $15–40 | $50–150+ |
| 🔧 **Difficulty** | Hard | Very Easy | Easy | Expert |
| 🔄 **Flexibility** | Full control | Limited | Good | Unlimited |
| 🧠 **Min RAM** | 4 GB | Managed | Per-service | Per-task |
| 📈 **Scalability** | Manual | Auto | Auto | Auto |
| 🌍 **Regions** | Pick one | US/EU | Global | Global |
| 🔒 **SSL** | Manual (LE) | Auto | Auto | ACM |
| 🚀 **Deploy Speed** | ~10 min | ~2 min | ~3 min | ~10 min |
| 📊 **Monitoring** | DIY | Built-in | Built-in | CloudWatch |

---

## 🏆 Recommendations

### For Learning & Portfolio → **Hetzner VPS (CX32, 8 GB)**
> **~$8/mo.** Best value. You'll learn real DevOps. Great for interviews. Use Docker Compose directly on the VPS.

### For Speed & Simplicity → **Railway**
> **~$25/mo.** Push and forget. Best DX. Focus on features, not infrastructure.

### For Production with Budget → **Fly.io**
> **~$20/mo.** Good balance. Global edge, fair pricing, solid tooling.

### For Enterprise Scale → **AWS ECS**
> **$100+/mo.** When you need serious scale, compliance, and managed services.

---

## Quick Start: Deploy to VPS with Docker Compose

```bash
# 1. SSH into your VPS
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone your repo
git clone https://github.com/your-repo/job-portal.git
cd job-portal

# 4. Configure environment
cp .env.docker docker/.env
# Edit docker/.env with your real credentials

# 5. Build and run everything
cd docker
docker compose -f docker-compose.prod.yml up --build -d

# 6. Check all services are healthy
docker compose -f docker-compose.prod.yml ps
```
