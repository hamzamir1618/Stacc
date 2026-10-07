# Deployment

**STACC-DELI** is a static Vite build served from **S3 → CloudFront** at
<https://stacc-deli.meredianandco.com>.

```
Users → CloudFront (CDN + HTTPS, ACM cert) → S3 (private, OAC) ← dist/
```

- **S3** holds the built `dist/` (private; reachable only via CloudFront OAC).
- **CloudFront** terminates HTTPS with an ACM cert and caches globally.
- **Route 53** aliases `stacc-deli.meredianandco.com` to the distribution.
- **GitHub Actions** builds on every push, and **deploys on `main` after CI
  passes**, authenticating with short-lived OIDC credentials (no stored keys).

## Pipeline

1. **CI** (`.github/workflows/ci.yml`) — typecheck + build on every push/PR.
2. **CD** (`.github/workflows/cd.yml`) — triggered by a successful CI run on
   `main`. Rebuilds, syncs to S3 (hashed assets cached immutably, HTML
   `no-cache`), and invalidates CloudFront.

## One-time infrastructure setup (`terraform/`)

Requires AWS credentials with admin-ish rights and the Route 53 hosted zone for
`meredianandco.com` already in the account.

```bash
cd terraform
terraform init
# The account already has a GitHub OIDC provider, so reuse it:
terraform apply -var='create_github_oidc_provider=false'
```

Terraform provisions the bucket, CloudFront distribution + OAC, the ACM
certificate (us-east-1, DNS-validated), the Route 53 alias records, and the
least-privilege deploy role.

After apply, wire the outputs into the repo as **Actions variables**
(Settings → Secrets and variables → Actions → *Variables*):

| Repo variable                  | Terraform output              |
| ------------------------------ | ----------------------------- |
| `AWS_DEPLOY_ROLE_ARN`          | `deploy_role_arn`             |
| `S3_BUCKET`                    | `s3_bucket`                   |
| `CLOUDFRONT_DISTRIBUTION_ID`   | `cloudfront_distribution_id`  |
| `AWS_REGION`                   | `us-east-1`                   |

```bash
# from terraform/, with gh authenticated to the repo:
R=exerra-ai-org/STACC-DELI
gh variable set AWS_DEPLOY_ROLE_ARN        -R $R -b "$(terraform output -raw deploy_role_arn)"
gh variable set S3_BUCKET                  -R $R -b "$(terraform output -raw s3_bucket)"
gh variable set CLOUDFRONT_DISTRIBUTION_ID -R $R -b "$(terraform output -raw cloudfront_distribution_id)"
gh variable set AWS_REGION                 -R $R -b "us-east-1"
```

These are **variables, not secrets** — the role ARN is not sensitive because the
OIDC trust policy restricts it to `main` on this repo.

## Deploying

Merge to `main`. CI runs; on success CD ships automatically. The first CloudFront
deploy can take ~15 min to propagate and for DNS to resolve.
