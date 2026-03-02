# Story 30.1: Dokploy + LAN Reachability Validation (Spike)

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-03-02
**Priority**: HIGH — GO/NO-GO gate for the entire epic
**Type**: Investigation Spike — Timeboxed to 2 hours

---

## 📋 User Story

**As an** infrastructure engineer,
**I want** to verify that MinIO can be exposed on the LAN alongside the Cloudflare-proxied domain,
**So that** we can confidently proceed with building internal network routing.

---

## ✅ Acceptance Criteria

- [ ] **Given** the MinIO service runs in Dokploy
- [ ] **When** port 9000 is exposed via Dokploy's "Advanced → Ports"
- [ ] **Then** `curl http://<server-LAN-IP>:9000/minio/health/live` returns a success response from any LAN machine
- [ ] **And** a pre-signed GET URL generated with the internal endpoint loads an asset in a LAN browser
- [ ] **And** the public Cloudflare-proxied domain continues to work without disruption

---

## 🔧 Investigation Steps

### Step 1: Expose MinIO Port

1. Open Dokploy dashboard
2. Navigate to the MinIO service
3. Go to **Advanced → Ports**
4. Add port mapping: `9000:9000` (host:container)
5. Deploy/restart the service

### Step 2: Verify LAN Connectivity

```bash
# From any machine on the LAN:
curl http://<server-LAN-IP>:9000/minio/health/live

# Expected response: HTTP 200
```

### Step 3: Test Pre-Signed URL with Internal Endpoint

Generate a pre-signed URL using the internal endpoint and verify it loads:

```bash
# This can be tested by temporarily changing MINIO_ENDPOINT in a local dev
# to http://<server-LAN-IP>:9000 and generating a signed URL via Convex
```

### Step 4: Verify Public Route Unaffected

```bash
# The existing Cloudflare-proxied URL should still work:
curl https://assets.primeeditz.com/minio/health/live  # (or equivalent)
```

### Step 5: Document Results

Record the following:

- Server LAN IP: `___________`
- MinIO internal port: `___________`
- Internal endpoint URL: `http://___________:9000`
- CORS headers needed? (yes/no)
- Any firewall rules needed? (yes/no)

---

## 📝 Outcome

### If PASS → Proceed with Stories 30.2-30.7

Set the following env vars:

- `MINIO_INTERNAL_ENDPOINT=http://<LAN-IP>:9000`
- `NEXT_PUBLIC_MINIO_INTERNAL_URL=http://<LAN-IP>:9000`

### If FAIL → Document Blockers

Possible failures:

- Docker network isolation prevents host port access → Try Docker compose `network_mode: host`
- Firewall blocking port 9000 → Configure UFW/iptables
- CORS issues on health endpoint → Configure MinIO CORS policy

---

## 🚀 Definition of Done

- [ ] MinIO service accessible on LAN via direct IP:port
- [ ] Pre-signed URLs with internal endpoint work in browser
- [ ] Public Cloudflare route remains functional
- [ ] Results documented (LAN IP, port, CORS needs)
- [ ] GO/NO-GO decision made
- [ ] Story marked as `done`

---

**Previous Story**: None (first in epic — gate for all others)
**Next Story**: 30-2 - Network detection utility
