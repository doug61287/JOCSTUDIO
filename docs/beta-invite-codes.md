# JOCHero Beta Invite Codes

**Generated:** February 10, 2026  
**Status:** Active  
**Max Uses:** 1 per code  
**Expiration:** None (initial batch)

## Active Invite Codes

| Code | Status | Used By |
|------|--------|---------|
| `JOCHERO-A7B3C9D2` | 🟢 Available | — |
| `JOCHERO-K8M4N6P1` | 🟢 Available | — |
| `JOCHERO-Q2W5E8R3` | 🟢 Available | — |
| `JOCHERO-T9Y7U4I6` | 🟢 Available | — |
| `JOCHERO-H3J5L7Z2` | 🟢 Available | — |
| `JOCHERO-X1C4V6B9` | 🟢 Available | — |
| `JOCHERO-F8G2D5S4` | 🟢 Available | — |
| `JOCHERO-M6N1P3Q7` | 🟢 Available | — |
| `JOCHERO-W4E9R2T8` | 🟢 Available | — |
| `JOCHERO-Y5U7I1O3` | 🟢 Available | — |

## Usage Notes

- Each code can only be used once
- Codes are case-insensitive (will be normalized to uppercase)
- Beta users get early access to all JOCHero features
- Track usage in the admin panel at `/invites`

## API Endpoints

```bash
# Validate a code (public)
curl -X POST https://api.jochero.com/invites/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "JOCHERO-A7B3C9D2"}'

# Redeem a code (requires auth)
curl -X POST https://api.jochero.com/invites/redeem \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "JOCHERO-A7B3C9D2"}'

# Generate more codes (admin only)
curl -X POST https://api.jochero.com/invites/generate-batch \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

## Generating More Codes

To generate additional codes, use the admin API or run:

```bash
# Via API
POST /invites/generate-batch
Body: { "count": 10, "maxUses": 1 }

# Returns array of new codes
```

---

**⚠️ Keep this document private** - Do not share publicly or commit to public repos.
