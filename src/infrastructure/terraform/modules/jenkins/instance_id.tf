// To get information that outside of Terraform we use (data + sources + name of th resource + the resource block with it's args)
// "aws_ami" its resource type, "amiID" the name that we give to this resource
// 1/ here we fetch info
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

  owners = ["099720109477"]
}

