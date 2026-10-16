# Scanner worker deployment (Layer 2)

Layer 1 controls in the Next.js app and scanner worker code reduce SSRF risk but **cannot replace network egress controls**. DNS rebinding and browser edge cases mean production must deny private, loopback, link-local, and metadata destinations at the infrastructure layer.

## Kubernetes NetworkPolicy

See [network-policy.example.yaml](./network-policy.example.yaml). Treat it as a starting point:

- Many CNIs enforce **IPv4 only** in `ipBlock` rules. Plan separate IPv6 egress controls (`::1/128`, `fc00::/7`, `fe80::/10`) via Cilium/Calico, cloud security groups, or host firewalls.
- `0.0.0.0/0` with `except` private ranges is **not** the same as “public IPs only”; it still allows any non-listed destination. For strict public-only egress, use an egress gateway, cloud firewall with explicit allow lists, or FQDN filtering where available.
- Allow DNS (UDP/TCP 53) to your cluster resolver; blocking DNS breaks scans without stopping determined rebinding attacks by itself.

## When NetworkPolicy is insufficient

Apply equivalent controls on your platform:

| Platform | Typical controls |
|----------|------------------|
| AWS | Security group egress: deny RFC1918, `169.254.169.254`, loopback; restrict to HTTPS from worker subnets |
| GCP | VPC firewall rules denying private/metadata ranges from scanner node tags |
| Azure | NSG outbound deny rules for private and link-local CIDRs |
| Docker | Custom bridge/firewall or run scanner in isolated network namespace without host network |

Also deny egress to **internal cluster service CIDRs** and metadata hostnames at DNS or proxy layer where possible.

## Production checklist

- Scanner worker runs in an isolated network segment (not `hostNetwork`).
- Egress policy applied and **verified** (packet test or policy audit), not only example YAML committed.
- `WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK` unset in production; application guard fails startup if set.
- `SCANNER_SERVICE_TOKEN` required; worker not reachable from the public internet without auth.
