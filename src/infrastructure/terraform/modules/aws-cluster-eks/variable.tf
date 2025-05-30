variable "region" {
  type        = string
  description = "AWS region"
}
variable "cluster-name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "intimacy-eks"
}