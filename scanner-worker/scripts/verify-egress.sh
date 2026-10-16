#!/usr/bin/env sh
# Run inside the running scanner container (or one-off on dar-scanner-net):
#   docker compose exec scanner sh /app/scanner-worker/scripts/verify-egress.sh
# Optional host reachability (operator-supplied public IP):
#   docker compose exec scanner sh /app/scanner-worker/scripts/verify-egress.sh 203.0.113.10
set -eu

HOST_PUBLIC_IP="${1:-}"

pass() { printf 'PASS %s\n' "$1"; }
fail() { printf 'FAIL %s (expected block or error)\n' "$1"; exit 1; }

curl_probe() {
  url="$1"
  if curl -fsS --max-time 8 "$url" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

# Public HTTPS should succeed (Layer-2 allows outbound web)
if curl_probe "https://example.com/"; then
  pass "https://example.com/"
else
  fail "https://example.com/"
fi

for blocked in \
  "http://10.0.0.1/" \
  "http://127.0.0.1/" \
  "http://169.254.169.254/" \
  "http://172.17.0.1/" \
  "http://172.30.0.1/"
do
  if curl_probe "$blocked"; then
    fail "$blocked"
  else
    pass "$blocked (blocked or unreachable)"
  fi
done

if [ -n "$HOST_PUBLIC_IP" ]; then
  if curl_probe "http://${HOST_PUBLIC_IP}/"; then
    fail "host public IP ${HOST_PUBLIC_IP}"
  else
    pass "host public IP ${HOST_PUBLIC_IP} (blocked or unreachable)"
  fi
fi

pass "egress verification complete"
