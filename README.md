# react-express-ecs

Full-stack web application: React/Vite frontend on S3 + CloudFront, Node.js/Express backend on ECS Fargate, PostgreSQL on RDS — all on AWS us-east-1.

---

## Architecture

```
Internet
  │
  ├──► CloudFront ──► S3 (React/Vite static assets)
  │
  └──► ALB (port 80) ──► ECS Fargate (Express API, min 1 / max 3 tasks)
                                │
                                └──► RDS PostgreSQL 15 (db.t3.micro, private subnet)
                                └──► Secrets Manager (DB credentials)
                                └──► CloudWatch Logs
```

## Services

| Service | Purpose |
|---|---|
| S3 | Private bucket for frontend static assets |
| CloudFront | CDN — Gzip/Brotli, HTTPS redirect, SPA routing |
| ECR | Docker image registry (scan on push, keep last 10) |
| ECS Fargate | Backend container runtime |
| ALB | Load balancer with health checks on `/health` |
| RDS PostgreSQL 15 | Managed database (private subnet) |
| Secrets Manager | DB credentials (injected into ECS at runtime) |
| CloudWatch | ECS task logs (30-day retention) |
| App Autoscaling | CPU 60% trigger — min 1, max 3 tasks |

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker
- PostgreSQL (or Docker Compose)

### Backend

```bash
cd backend
cp .env.example .env   # edit DB credentials
npm install
npm run dev            # http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # set VITE_API_URL if needed
npm install
npm run dev                  # http://localhost:5173
```

### Docker (backend)

```bash
docker build -t react-express-ecs-backend ./backend
docker run -p 3000:3000 --env-file backend/.env react-express-ecs-backend
```

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/deploy.yml`) — triggered on push to `main`:

```
lint ──┬── test ──┬── build_frontend ──┬── provision ── configure ── verify
       └── security ─┘                 │
                      build_push ───────┘
```

| Stage | Description |
|---|---|
| `lint` | ESLint — backend + frontend |
| `test` | Jest unit tests with coverage |
| `security` | Trivy HIGH/CRITICAL filesystem scan |
| `build_frontend` | `vite build` → upload artifact |
| `build_push` | Docker build → push to ECR |
| `provision` | Terraform apply (VPC, ECS, RDS, S3, CloudFront) |
| `configure` | S3 sync, CloudFront invalidation, ECS stability wait |
| `verify` | Health check retries + print deployment URLs |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check (database connectivity) |
| `GET` | `/api/status` | Service status |

### Health Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0",
  "checks": {
    "database": "ok"
  }
}
```

---

## Infrastructure

All Terraform is in `infra/`. Managed by the CI pipeline — do not apply manually in production.

```
infra/
├── providers.tf      # AWS provider + S3 backend
├── variables.tf      # Input variables
├── outputs.tf        # ALB DNS, CloudFront URL, S3 bucket, ECR URL
├── main.tf           # VPC, subnets, IGW, NAT, route tables, security groups
├── ecr.tf            # ECR repository + lifecycle policy
├── s3_cloudfront.tf  # S3 bucket + CloudFront OAC distribution
├── rds.tf            # RDS PostgreSQL 15
├── secrets.tf        # Secrets Manager DB credentials
├── ecs.tf            # ECS cluster, task definition, ALB, service
└── autoscaling.tf    # App autoscaling (CPU 60% → min 1, max 3)
```

### Key Variables

| Variable | Default | Description |
|---|---|---|
| `aws_region` | `us-east-1` | AWS region |
| `project_name` | (required) | Resource name prefix |
| `image_uri` | (required) | ECR image URI + tag |
| `db_password` | (required) | RDS master password |
| `ecs_min_capacity` | `1` | Minimum Fargate tasks |
| `ecs_max_capacity` | `3` | Maximum Fargate tasks |

---

## Deployment Outputs

After a successful deploy, the verify stage prints:

```
Frontend:  https://<cloudfront-domain>.cloudfront.net
Backend:   http://<alb-dns>.us-east-1.elb.amazonaws.com
Health:    http://<alb-dns>.us-east-1.elb.amazonaws.com/health
```

---

## Cost Estimate (us-east-1)

| Resource | Approx/month |
|---|---|
| NAT Gateway | ~$35 |
| ALB | ~$18 |
| RDS db.t3.micro | ~$15 |
| ECS Fargate (1 task 24/7) | ~$10 |
| CloudFront + S3 | <$5 at low traffic |
| **Total** | **~$80–85/month** |

> To reduce costs: replace NAT Gateway with a NAT Instance (~$4/month t4g.nano).

---

## Security

- S3 bucket is fully private — accessible only via CloudFront OAC
- ECS tasks run as non-root (`appuser`)
- DB credentials stored in Secrets Manager, never in environment variables directly
- RDS in private subnets — no public access
- ECR images scanned on push
- Trivy HIGH/CRITICAL scan gate in CI
- Helmet.js security headers on Express
