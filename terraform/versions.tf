terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # Remote state keeps the deploy infra reproducible across machines and CI.
  # Fill in an existing bucket/table and re-run `terraform init -reconfigure`,
  # or delete this block to use local state while bootstrapping.
  # backend "s3" {
  #   bucket         = "meredianandco-tfstate"
  #   key            = "bannisi-dee/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}
