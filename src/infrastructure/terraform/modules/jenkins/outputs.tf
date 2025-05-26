// Prints 
// here we print fetched info
output "jenkins_inst_id" {
  description = "AMI ID of ubuntu instance"
  value       = data.aws_ami.amiID.id
}