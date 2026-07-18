# react-express-ecs — Working Notes

## Project
- Name: react-express-ecs
- Cloud: AWS us-east-1
- Target: ECS Fargate (backend) + S3/CloudFront (frontend)
- VCS: GitHub
- Account: 241533126054

## Decisions
- Fresh VPC (10.1.0.0/16), 2 public + 2 private subnets across us-east-1a/b
  - Account has 10.0.0.0/16 (x2) and 172.31.0.0/16 (default) — no overlap
- Frontend: React + Vite → build → S3 (private, OAC) → CloudFront (Gzip/Brotli, SPA 403/404 → index.html)
- Backend: Node.js/Express (ESM) → Docker (multi-stage, non-root appuser) → ECR → ECS Fargate + ALB
- DB: RDS PostgreSQL 15 db.t3.micro, private subnets, credentials in Secrets Manager
  - ECS task reads individual JSON fields via valueFrom with ":key::" syntax
- ECS autoscaling: min 1, max 3 tasks, CPU 60% trigger, scale-out 60s, scale-in 300s
- CloudWatch log group /ecs/{project}-backend, 30-day retention
- Trivy HIGH/CRITICAL filesystem scan gate in CI
- Frontend and backend build independently (parallel stages), deploy together via Terraform
- Health endpoint: GET /health — checks DB connectivity, returns 200 ok or 503 degraded
- Outputs: CloudFront URL (frontend), ALB DNS (backend API), health endpoint URL

## Status
- [x] Project named and meta set
- [x] Architecture written (rev 1)
- [x] Pipeline written (rev 2)
- [x] Plan submitted and approved
- [x] All files generated (backend, frontend, infra, README, .gitignore)
- [x] validate_project PASS (37 files)
- [ ] DB_PASSWORD secret set (needs repo first)
- [ ] Repo pushed
- [ ] Deployed

## File Layout
- backend/ — Express app (ESM), Dockerfile, eslint, jest tests
- frontend/ — React/Vite app, eslint
- infra/ — Terraform (providers, main, ecr, s3_cloudfront, rds, secrets, ecs, autoscaling, variables, outputs)
- .github/workflows/deploy.yml — rendered from pipeline.yaml
- README.md — full deployment documentation

## Gotchas / Pitfalls Addressed
- VPC quota: 3/5 used → OK to create 1 more
- CIDR: 10.1.0.0/16 to avoid overlap with existing 10.0.0.0/16 VPCs
- Backend uses ESM (type:module) — jest runs with --experimental-vm-modules
- Secrets Manager JSON key extraction: valueFrom with ":key::" suffix syntax
- TF_STATE_BUCKET backend block is empty — platform patches it
- ECS tasks in private subnets, NAT gateway in public subnet for outbound
- S3 bucket name includes account ID to ensure global uniqueness
- CloudFront invalidation uses domain name lookup (not hardcoded ID)
- Health check uses retries (--retry 12 --retry-delay 15) for boot time
- Docker multi-stage build, non-root appuser
- No platform branding/placeholders
