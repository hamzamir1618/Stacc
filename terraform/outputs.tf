output "site_url" {
  description = "Public URL of the deployed site."
  value       = "https://${var.site_domain}"
}

output "s3_bucket" {
  description = "Origin bucket name — set as the S3_BUCKET repo variable."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "Distribution id — set as the CLOUDFRONT_DISTRIBUTION_ID repo variable."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain (the Route 53 alias target)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "deploy_role_arn" {
  description = "IAM role for GitHub Actions — set as the AWS_DEPLOY_ROLE_ARN repo variable."
  value       = aws_iam_role.deploy.arn
}
