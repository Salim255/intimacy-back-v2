resource "aws_security_group" "sonarqube-sg" {
  name        = "sonarqube-sg"
  description = "sonarqube-sg"
  tags = {
    Name = "sonarqube-sg"
  }
}

// Rules resources
// Inbound
resource "aws_vpc_security_group_ingress_rule" "sshfrommyIP" {
  security_group_id = aws_security_group.sonarqube-sg.id
  cidr_ipv4         = "90.110.234.190/32"
  from_port         = 22    // For ssh
  ip_protocol       = "tcp" // ssh protocol
  to_port           = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.sonarqube-sg.id
  cidr_ipv4         = "90.110.234.190/32"
  from_port         = 80 // Nexus HTTP port
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_jenkins_http" {
  security_group_id = aws_security_group.sonarqube-sg.id
  # This variable should be passed from the parent module where Jenkins security group ID is defined
  # It allows SonarQube to communicate with Jenkins
  # Make sure to define this variable in the parent module
  # and pass the Jenkins security group ID when calling this module.
  referenced_security_group_id = var.jenkins_security_group_id
  from_port                    = 80 // Nexus HTTP port
  ip_protocol                  = "tcp"
  to_port                      = 80
}

// Outbound
resource "aws_vpc_security_group_egress_rule" "allowAllOutbound_ipv4" {
  security_group_id = aws_security_group.sonarqube-sg.id
  cidr_ipv4         = "0.0.0.0/0" // To any where
  ip_protocol       = "-1"        # semantically equivalent to all ports
}
resource "aws_vpc_security_group_egress_rule" "allowAllOutbound_ipv6" {
  security_group_id = aws_security_group.sonarqube-sg.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}
