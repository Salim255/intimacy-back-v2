variable "public_key" {
  type        = string
  description = "The public key string for Nexus instance"
}

variable "zone1" {
  type        = string
  description = "The availability zone for Nexus instance"
}

variable "jenkins_security_group_id" {
  type        = string
  description = "The security group ID for Jenkins instance"
}