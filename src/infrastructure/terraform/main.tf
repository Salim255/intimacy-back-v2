module "jenkins" {
  source     = "./modules/jenkins"
  zone1      = var.zone1 # Pass root var "zone1" to module
  public_key = aws_key_pair.intimacy-key.key_name
}

module "s3-bucket" {
  source = "./modules/s3-bucket"
  //
  iam_user_name = aws_iam_user.intimacy_user.name
}

module "nexus" {
  source                    = "./modules/nexus"
  zone1                     = var.zone1
  public_key                = aws_key_pair.intimacy-key.key_name
  jenkins_security_group_id = module.jenkins.jenkins_security_group_id_output
}

module "sonarqube" {
  source                    = "./modules/sonarqube"
  zone1                     = var.zone1
  public_key                = aws_key_pair.intimacy-key.key_name
  jenkins_security_group_id = module.jenkins.jenkins_security_group_id_output
}

module "google-kub-engine" {
  source        = "./modules/g-Kub-engine"
  google-zone1  = var.google-zone1
  google-region = var.google-region
}

module "google_artifact_registry" {
  source        = "./modules/g_artifact_registry"
  google-zone1  = var.google-zone1
  google-region = var.google-region
}