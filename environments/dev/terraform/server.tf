resource "cloudflare_record" "api_cname_record" {
  zone_id = var.CLOUDFLARE_ZONE_ID
  name    = "wwww.prixfixe.dev"
  type    = "CNAME"
  value   = "ghs.googlehosted.com"
  ttl     = 1
  proxied = true
}
