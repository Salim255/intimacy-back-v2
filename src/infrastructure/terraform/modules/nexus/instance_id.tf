data "aws_ami" "amiID" {
  most_recent = true

  // Search AMI
  filter {
    name   = "name"
    values = ["al2023-ami-2023.7.20250512.0-kernel-6.1-x86_64"]
  }

  // Hardware virtualization type
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["137112412989"] // The owner of the AMI

}