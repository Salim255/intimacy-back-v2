resource "aws_iam_policy" "ecr_access_policy" {
  name        = "ECRAccessPolicy"
  description = "Policy to allow access to ECR"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ],
        Resource = "*"
      }
    ]
  })
}


# Attach the Policy to the IAM User:
resource "aws_iam_user_policy_attachment" "intimacy_user_policy_attachment" {
  user       = var.iam_user_name
  policy_arn = aws_iam_policy.ecr_access_policy.arn
}