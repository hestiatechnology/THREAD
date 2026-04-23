---
title: REST API (Tier A)
description: REST API integration for brands, large suppliers, and system-to-system connections.
sidebar:
  order: 1
---

The REST API is the primary integration method for brands, large suppliers, and system-to-system connections (ERP, PLM, certification body APIs). It accepts and returns JSON and uses OAuth 2.0 for authentication.

## Authentication

THREAD uses OAuth 2.0 with scoped tokens. Each supply chain participant is issued a token scoped to their tier and organisation.

```http
Authorization: Bearer {access_token}
```

Token scopes map to supply chain roles:

| Scope | Access |
|---|---|
| `dpp:brand:write` | Brand layer (product, care, end-of-life) |
| `dpp:tier1:write` | Tier-1 layer (CMT facility, social certs) |
| `dpp:tier2:write` | Tier-2 layer (processing, chemicals) |
| `dpp:tier3:write` | Tier-3 layer (raw material, fibre certs) |
| `dpp:certifier:write` | Certification layer (push verified cert status) |
| `dpp:read` | Read-only access to own-tier data |
| `dpp:brand:read` | Read access to full DPP (brand only) |

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
