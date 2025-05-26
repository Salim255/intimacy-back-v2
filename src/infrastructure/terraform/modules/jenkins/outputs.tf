// Prints 
// here we print fetched info
output "jenkins_inst_id" {
  description = "AMI ID of ubuntu instance"
  value       = data.aws_ami.amiID.id
}
output "jenkins_security_group_id_output" {
  description = "value of the security group ID for Jenkins instance"
  value = aws_security_group.jenkins-sg.id
}
