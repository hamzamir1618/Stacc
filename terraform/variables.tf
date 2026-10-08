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
  description = "Apex domain the site is served at (www is added automatically). DNS is managed externally (Namecheap)."
  type        = string
  default     = "delistacc.com"
}

variable "bucket_name" {
  description = "Origin S3 bucket name. Kept at the original value so the domain change does not replace the bucket."
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
  description = "Branch the CD workflow deploys from (enforced by the workflow_run trigger)."
  type        = string
  default     = "main"
}

# This GitHub org customizes the OIDC subject claim to include numeric org and
# repo IDs: repo:<owner>@<org_id>/<repo>@<repo_id>:... — so the trust policy
# must match that form (see the existing exerra-deploy-* roles).
variable "github_org_id" {
  description = "Numeric GitHub org id used in the customized OIDC subject claim."
  type        = string
  default     = "226608819"
}

variable "github_repo_id" {
  description = "Numeric GitHub repo id used in the customized OIDC subject claim."
  type        = string
  default     = "1408752472"
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
