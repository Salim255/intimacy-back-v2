resource "aws_iam_policy" "intimacy_user_s3_policy" {
  name        = "intimacyUserS3Policy"
  description = "Allow intimacy user to access the S3 bucket"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:PutObjectAcl" # Add this to allow modifying ACLs
        ]
        Resource = [
          "arn:aws:s3:::intimacy-s3",
          "arn:aws:s3:::intimacy-s3/*",
          "arn:aws:s3:::intimacy-s3/users/*"
        ]
      }
    ]
  })
}



# Attach the Policy to the IAM User:
resource "aws_iam_user_policy_attachment" "intimacy_user_policy_attachment" {
  user       = var.iam_user_name
  policy_arn = aws_iam_policy.intimacy_user_s3_policy.arn
}

// Generate access keys that your application can use to authenticate with AWS.
resource "aws_iam_access_key" "intimacy_user_access_key" {
  user = var.iam_user_name
}

