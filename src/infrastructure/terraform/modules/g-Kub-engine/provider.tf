provider "kubernetes" {
  host                   = "https://${module.gke.endpoit}"
  token                  = ""
  cluster_ca_certificate = base64decode(module.gke.ca_certificate)
}