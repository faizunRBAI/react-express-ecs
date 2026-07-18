output "alb_dns_name" {
  description = "ALB DNS name for the backend API"
  value       = aws_lb.main.dns_name
}

output "cloudfront_url" {
  description = "CloudFront distribution domain for the frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend assets"
  value       = aws_s3_bucket.frontend.id
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for ECS tasks"
  value       = aws_cloudwatch_log_group.ecs_backend.name
}
