// To get information that outside of Terraform we use (data + sources + name of th resource + the resource block with it's args)
// "aws_ami" its resource type, "amiID" the name that we give to this resource
// 1/ here we fetch info
data "aws_ami" "amiID" {
  most_recent = true

  // Search AMI
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }

  // Hardware virtualization type
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"]
}

// Prints 
// here we print fetched info
output "jenkins_inst_id" {
  description = "AMI ID of ubuntu instance"
  value       = data.aws_ami.amiID.id
}