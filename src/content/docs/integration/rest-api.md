---
title: REST API (Tier A)
description: REST API integration for brands, large suppliers, and system-to-system connections.
sidebar:
  order: 1
---

The REST API is the primary integration method for brands, large suppliers, and system-to-system connections (ERP, PLM, certification body APIs). It accepts and returns JSON and uses OAuth 2.0 for authentication.

## Authentication

THREAD supports three authentication methods depending on the integration type.

### API keys — machine-to-machine (ERP / PLM)

Brand back-office systems use API keys for server-to-server integrations. Keys are scoped to a single organisation and issued from the TextileEco dashboard.

**Format:** `thr_live_{32 alphanumeric chars}` (production) · `thr_test_{32 alphanumeric chars}` (sandbox)

```http
X-API-Key: thr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

API keys carry `dpp:brand:write` + `dpp:brand:read` privileges by default. They do not expire but can be revoked instantly from the dashboard. When rotating a key, the old key stays valid for **24 hours** to allow zero-downtime deployments.

### OAuth 2.0 — supplier system integrations

Suppliers with their own systems use OAuth 2.0 client credentials. Each participant is issued a client ID and secret scoped to their tier.

```
POST https://auth.textileeco.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={client_id}
&client_secret={client_secret}
&scope=dpp:tier2:write
```

```http
Authorization: Bearer {access_token}
```

OAuth access tokens expire after **1 hour**. Clients must request a fresh token before expiry — the token response includes `expires_in` for this purpose.

Token scopes map to supply chain roles:

| Scope | Role | Access |
|---|---|---|
| `dpp:brand:write` | Brand | Product shell, care instructions, end-of-life |
| `dpp:tier1:write` | Tier 1 | CMT facility, manufacturing stage, social compliance |
| `dpp:tier2:write` | Tier 2 | Processing facility, chemicals, dyeing |
| `dpp:tier3:write` | Tier 3 | Raw material origin, fibre certifications |
| `dpp:certifier:write` | Certifier | Push verified certification status |
| `dpp:read` | Any | Read own-tier data |
| `dpp:brand:read` | Brand | Read the full DPP across all tiers |

Cross-tier writes are rejected with `403` — a `dpp:tier2:write` token cannot write to Tier-3 fields.

### Scoped invite tokens — supplier onboarding

For suppliers who cannot integrate via API or CSV, brands generate a short-lived invite token scoped to a single tier, GTIN, and batch. The supplier follows the link on any device.

**Generate an invite token:**

```http
POST /products/{gtin}/batches/{batchId}/invite-tokens
X-API-Key: thr_live_...
Content-Type: application/json

{
  "tier": "tier2",
  "expiresIn": 604800
}
```

**Response:**
```json
{
  "token": "thr_inv_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "url": "https://app.textileeco.com/contribute/thr_inv_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "tier": "tier2",
  "scope": {
    "gtin": "0123456789012",
    "batchId": "B2026Q1-001"
  },
  "expiresAt": "2026-05-01T00:00:00Z"
}
```

The brand shares the `url` with the supplier. Opening it on mobile routes to the Tier C web form. To use the token directly against the API, pass it as a bearer token:

```http
Authorization: Bearer thr_inv_q7r8s9t0u1v2...
```

**Invite token constraints:**

- Scoped to exactly one tier, one GTIN, and one batch — no other resource is accessible
- Maximum lifetime is **7 days** (`expiresIn` max: `604800`)
- Invalidated after the first successful data write — single-use per contribution window
- Cannot be renewed; generate a new token for each contribution window

### Token lifetime summary

| Method | Header | Lifetime | Rotation |
|---|---|---|---|
| API key | `X-API-Key` | Non-expiring | Rotate via dashboard; 24 h overlap |
| OAuth token | `Authorization: Bearer` | 1 hour | Client credentials flow |
| Invite token | `Authorization: Bearer` | Up to 7 days | Generate a new token |

## Base URL

```
https://api.textileeco.com/v1
```

---

## Endpoints

### Create or update a product shell

```http
PUT /products/{gtin}
Content-Type: application/json

{
  "gtin": "0123456789012",
  "name": "Organic Cotton T-Shirt",
  "modelNumber": "SS26-TEE-001",
  "category": { "gpc": "10000002", "description": "T-Shirts" },
  "targetMarket": ["EU", "PT"],
  "euImporter": {
    "name": "Example EU Importer Lda",
    "country": "PT",
    "vatNumber": "PT500000000"
  }
}
```

---

### Create a batch DPP

```http
POST /products/{gtin}/batches
Content-Type: application/json

{
  "batchId": "B2026Q1-001",
  "productionDate": "2026-01",
  "quantity": 500,
  "unit": "pieces",
  "countryOfOrigin": "TR"
}
```

**Response:**
```json
{
  "id": "https://api.textileeco.com/v1/products/0123456789012/batches/B2026Q1-001",
  "status": "draft",
  "completenessScore": 0.12,
  "supplierInviteLinks": {
    "tier1": "https://app.textileeco.com/contribute/t1/abc123",
    "tier2": "https://app.textileeco.com/contribute/t2/def456",
    "tier3": "https://app.textileeco.com/contribute/t3/ghi789"
  }
}
```

---

### Submit materials data (Tier 3)

```http
PUT /products/{gtin}/batches/{batchId}/materials
Content-Type: application/json

[
  {
    "fibre": "organic cotton",
    "percentage": 95,
    "origin": { "country": "IN", "region": "Gujarat" },
    "recycledContent": 0,
    "certifications": ["GOTS"]
  },
  {
    "fibre": "elastane",
    "percentage": 5,
    "origin": { "country": "DE" },
    "recycledContent": 0,
    "certifications": []
  }
]
```

---

### Submit manufacturing stage (any tier)

```http
POST /products/{gtin}/batches/{batchId}/manufacturing
Content-Type: application/json

{
  "stage": "dyeing_finishing",
  "facility": {
    "id": "urn:gs1:414:9876543210003",
    "name": "XYZ Dyehouse",
    "country": "TR",
    "city": "Bursa"
  }
}
```

---

### Submit environmental data

```http
PUT /products/{gtin}/batches/{batchId}/environmental
Content-Type: application/json

{
  "carbonFootprint": {
    "value": 4.2,
    "unit": "kgCO2e",
    "scope": "cradle-to-gate",
    "methodology": "Higg MSI"
  },
  "waterConsumption": {
    "value": 2700,
    "unit": "litres_per_unit"
  },
  "chemicalsOfConcern": [],
  "microplasticRisk": "low"
}
```

---

### Get completeness report

```http
GET /products/{gtin}/batches/{batchId}/completeness
```

**Response:**
```json
{
  "score": 0.87,
  "status": "incomplete",
  "espr": {
    "required": 14,
    "present": 12,
    "missing": [
      "environmental.carbonFootprint",
      "compliance.reachSVHC"
    ]
  }
}
```

---

### Publish a DPP

Only callable with `dpp:brand:write` scope. Blocked if ESPR completeness is not met.

```http
POST /products/{gtin}/batches/{batchId}/publish
```

**Response:**
```json
{
  "status": "published",
  "digitalLinkUrl": "https://id.textileeco.com/01/0123456789012/10/B2026Q1-001",
  "registryRef": "https://espr-registry.eu/dpp/0123456789012/B2026Q1-001"
}
```

---

## Webhooks

Subscribe to events on a batch DPP to receive push notifications when state changes.

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-system.textileeco.com/thread-webhook",
  "events": ["batch.created", "batch.completeness_changed", "batch.published"],
  "secret": "your-hmac-secret"
}
```

**Available events:**

| Event | Triggered when |
|---|---|
| `batch.created` | A new batch DPP is initialised |
| `batch.data_submitted` | Any tier submits data |
| `batch.completeness_changed` | Completeness score changes |
| `batch.certification_updated` | A certification is added or revoked |
| `batch.published` | DPP is published to the registry |
| `batch.superseded` | A correction creates a new version |

---

## Error responses

```json
{
  "error": "validation_failed",
  "message": "Material percentages do not sum to 100",
  "fields": [
    { "path": "materials[0].percentage", "issue": "Values sum to 98, expected 100" }
  ]
}
```

Standard HTTP status codes apply: `400` for validation errors, `401` for auth failures, `403` for scope violations, `404` for unknown GTIN/batch, `409` for conflicts on published records.
