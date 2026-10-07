variable "aws_region" {
  description = "Region for the S3 bucket and IAM/OIDC resources. CloudFront is global; ACM for CloudFront is always us-east-1 regardless of this."
  type        = string
  default     = "us-east-1"
}

variable "root_domain" {
  description = "The Route 53 hosted zone apex. Nameservers already point here."
  type        = string
  default     = "meredianandco.com"
}

variable "site_domain" {
  description = "Fully-qualified subdomain the site is served at."
  type        = string
  default     = "stacc-deli.meredianandco.com"
}

variable "github_owner" {
  description = "GitHub org/user that owns the repo (OIDC trust subject)."
  type        = string
  default     = "exerra-ai-org"
}

variable "github_repo" {
  description = "Repository name (OIDC trust subject)."
  type        = string
  default     = "STACC-DELI"
}

variable "github_deploy_branch" {
  description = "Only pushes to this branch may assume the deploy role."
  type        = string
  default     = "main"
}

variable "cloudfront_price_class" {
  description = "PriceClass_100 (NA+EU, cheapest), PriceClass_200, or PriceClass_All."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Tags applied to all taggable resources."
  type        = map(string)
  default = {
    Project   = "stacc-deli"
    ManagedBy = "terraform"
  }
}
