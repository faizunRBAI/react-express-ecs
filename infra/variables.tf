variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used as resource prefix"
  type        = string
}

variable "image_uri" {
  description = "Full ECR image URI including tag"
  type        = string
}

variable "db_password" {
  description = "RDS master password (injected from CI secret)"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "appuser"
}

variable "ecs_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "ECS task memory in MiB"
  type        = number
  default     = 1024
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 3
}

variable "ecs_autoscale_cpu_target" {
  description = "Target CPU utilization percentage for autoscaling"
  type        = number
  default     = 60
}
