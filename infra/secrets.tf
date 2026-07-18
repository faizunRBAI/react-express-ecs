resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/db-credentials"
  description             = "RDS PostgreSQL credentials for ${var.project_name}"
  recovery_window_in_days = 0

  tags = { Name = "${var.project_name}-db-secret" }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = aws_db_instance.postgres.address
    port     = 5432
    dbname   = var.db_name
  })
}
