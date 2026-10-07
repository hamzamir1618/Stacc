provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# CloudFront requires its ACM certificate to live in us-east-1. This aliased
# provider is used only for the certificate + its DNS validation records.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.tags
  }
}

data "aws_route53_zone" "root" {
  name         = "${var.root_domain}."
  private_zone = false
}
