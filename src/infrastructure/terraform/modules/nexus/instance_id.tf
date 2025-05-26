data "aws_ami" "amiID" {
  most_recent = true

  // Search AMI
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  // Hardware virtualization type
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] // The owner of the AMI
  
}