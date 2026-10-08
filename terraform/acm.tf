# Certificate for the apex + www, in us-east-1 for CloudFront.
# DNS is managed externally (Namecheap), so the validation CNAME records are
# added there by hand — this config does not create Route 53 records. The cert
# was requested out-of-band and is imported into state (see DEPLOY.md), so the
# owner's validation records keep working.
resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = var.site_domain
  subject_alternative_names = ["www.${var.site_domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Waits for the externally-added DNS records to validate the cert. No
# validation_record_fqdns because the records live at the external registrar.
resource "aws_acm_certificate_validation" "site" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.site.arn
}
