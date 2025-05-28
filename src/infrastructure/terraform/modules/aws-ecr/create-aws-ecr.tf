resource "aws_ecr_repository" "intimacy_repository" {
  name = var.repo-name

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE" # or "IMMUTABLE"
}