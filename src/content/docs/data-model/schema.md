---
title: Canonical Schema
description: Full field definitions for the THREAD batch-level textile DPP.
sidebar:
  order: 2
---

The THREAD canonical schema defines the complete data model for a batch-level textile DPP. It is serialised as JSON and validated against a JSON Schema definition.

## Top-level structure

```json
{
  "dpp": { },         // Record metadata
  "product": { },     // Product-level identity (inherited from ProductDPP)
  "batch": { },       // Batch-level identity
  "materials": [ ],   // Fibre composition and origins
  "manufacturing": [ ],// Supply chain facility chain
  "environmental": { },// Carbon, water, chemicals
  "social": { },      // Certifications, labour standards
  "circularEconomy": { },// Recycled content, recyclability, end-of-life
  "care": { },        // Wash instructions, expected lifetime
  "compliance": { },  // ESPR, REACH SVHC, ZDHC
  "externalRefs": [ ],// Proprietary system identifiers
  "provenance": [ ]   // Per-field attribution
}
```

---

## `dpp` — Record metadata

```json
"dpp": {
  "id": "https://id.example.com/01/0123456789012/10/B2026Q1-001",
  "schemaVersion": "1.0",
  "status": "draft",
  "issuedAt": "2026-04-21T00:00:00Z",
  "issuedBy": {
    "id": "urn:gs1:414:1234567890123",
    "name": "Example Brand SA",
    "role": "brand"
  },
  "completenessScore": 0.87,
  "espr": {
    "status": "incomplete",
    "missingFields": ["environmental.carbonFootprint", "compliance.reachSVHC"]
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | URI | Yes | GS1 Digital Link URI — canonical identifier for this batch DPP |
| `schemaVersion` | string | Yes | THREAD schema version |
| `status` | enum | Yes | `draft` / `published` / `superseded` |
| `issuedAt` | ISO 8601 | Yes | Timestamp of last update |
| `issuedBy` | object | Yes | Brand/issuer identity |
| `completenessScore` | number | No | 0–1 ESPR completeness ratio |
| `espr.status` | enum | No | `incomplete` / `complete` / `published` |
| `espr.missingFields` | string[] | No | Field paths missing for ESPR compliance |

---

## `product` — Product identity

```json
"product": {
  "gtin": "0123456789012",
  "name": "Organic Cotton T-Shirt",
  "modelNumber": "SS26-TEE-001",
  "category": {
    "gpc": "10000002",
    "description": "T-Shirts"
  },
  "targetMarket": ["EU", "UK"],
  "euImporter": {
    "name": "Example EU Importer Lda",
    "country": "PT",
    "vatNumber": "PT500000000"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `gtin` | string | Yes | GTIN-13 |
| `name` | string | Yes | Product name |
| `modelNumber` | string | No | Internal model/SKU |
| `category.gpc` | string | Yes | GS1 Global Product Classification brick code |
| `targetMarket` | string[] | Yes | ISO 3166-1 alpha-2 country codes |
| `euImporter` | object | If non-EU brand | Required for ESPR compliance when brand is outside EU |

---

## `batch` — Batch identity

```json
"batch": {
  "batchId": "B2026Q1-001",
  "productionDate": "2026-01",
  "quantity": 500,
  "unit": "pieces",
  "countryOfOrigin": "TR"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `batchId` | string | Yes | Unique lot/batch identifier within the GTIN scope |
| `productionDate` | string | Yes | ISO 8601 year-month (`YYYY-MM`) |
| `quantity` | number | Yes | Number of units |
| `unit` | enum | Yes | `pieces` / `kg` / `metres` |
| `countryOfOrigin` | string | Yes | ISO 3166-1 alpha-2 — country of last substantial transformation |

---

## `materials` — Fibre composition

Array of material entries. Percentages must sum to 100.

```json
"materials": [
  {
    "fibre": "organic cotton",
    "percentage": 95,
    "origin": {
      "country": "IN",
      "region": "Gujarat"
    },
    "recycledContent": 0,
    "certifications": ["GOTS", "OE100"],
    "supplierRef": "urn:gs1:414:9876543210001"
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

| Field | Type | Required | Description |
|---|---|---|---|
| `fibre` | string | Yes | Fibre type (lowercase, ISO 2076 name preferred) |
| `percentage` | number | Yes | Percentage by weight; all entries must sum to 100 |
| `origin.country` | string | Yes | ISO 3166-1 alpha-2 country of raw material origin |
| `origin.region` | string | No | Sub-national region |
| `recycledContent` | number | Yes | Percentage of recycled input by weight |
| `certifications` | string[] | No | Certification codes (see [Standards](/compliance/standards/)) |
| `supplierRef` | URI | No | GLN or URN of the raw material supplier |

---

## `manufacturing` — Facility chain

Ordered array from raw material to finished product. Each entry represents one processing stage.

```json
"manufacturing": [
  {
    "stage": "spinning",
    "facility": {
      "id": "urn:gs1:414:9876543210002",
      "name": "ABC Spinning Mill",
      "country": "IN",
      "city": "Coimbatore"
    }
  },
  {
    "stage": "dyeing_finishing",
    "facility": {
      "id": "urn:gs1:414:9876543210003",
      "name": "XYZ Dyehouse",
      "country": "TR",
      "city": "Bursa"
    }
  },
  {
    "stage": "cut_make_trim",
    "facility": {
      "id": "urn:gs1:414:9876543210004",
      "name": "Garment Factory Co",
      "country": "BD",
      "city": "Dhaka"
    }
  }
]
```

Valid `stage` values: `raw_material` / `ginning` / `spinning` / `weaving_knitting` / `dyeing_finishing` / `cut_make_trim` / `embellishment` / `logistics`

---

## `environmental` — Environmental data

```json
"environmental": {
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

| Field | Type | Required | Description |
|---|---|---|---|
| `carbonFootprint.value` | number | ESPR | kgCO2e per unit |
| `carbonFootprint.scope` | enum | ESPR | `cradle-to-gate` / `cradle-to-grave` |
| `carbonFootprint.methodology` | string | ESPR | Calculation methodology (e.g. `Higg MSI`, `ISO 14067`) |
| `waterConsumption.value` | number | No | Litres per unit |
| `chemicalsOfConcern` | object[] | ESPR | SVHC substances identified; empty array = none detected |
| `microplasticRisk` | enum | No | `low` / `medium` / `high` + basis |

---

## `social` — Social compliance

```json
"social": {
  "certifications": ["GOTS", "Fair Trade Certified"],
  "livingWageStatus": "third-party-assured",
  "auditRef": "https://audit-platform.example/report/12345"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `certifications` | string[] | No | Social certification codes |
| `livingWageStatus` | enum | No | `self-declared` / `third-party-assured` / `not-assessed` |
| `auditRef` | URI | No | Link to audit report or summary |

---

## `circularEconomy` — End-of-life and circularity

```json
"circularEconomy": {
  "recycledContent": 0,
  "recyclabilityScore": "high",
  "recyclabilityBasis": "100% single-fibre natural, no coatings",
  "repairInfo": "https://brand.example/repair/SS26-TEE-001",
  "endOfLifeOptions": ["take-back-scheme", "home-compostable"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `recycledContent` | number | ESPR | % recycled input by total weight |
| `recyclabilityScore` | enum | ESPR | `high` / `medium` / `low` |
| `recyclabilityBasis` | string | No | Plain-language rationale for score |
| `repairInfo` | URI | ESPR | URL to repair instructions or spare parts |
| `endOfLifeOptions` | string[] | ESPR | Valid values: `take-back-scheme` / `kerbside-recyclable` / `home-compostable` / `industrial-compostable` / `textile-recycler` |

---

## `care` — Care instructions

```json
"care": {
  "washSymbols": ["wash-30", "do-not-bleach", "tumble-dry-low", "iron-medium"],
  "expectedLifetimeWashes": 50
}
```

Wash symbol codes follow ISO 3758 (GINETEX symbol set). Valid codes:
`wash-30` / `wash-40` / `wash-60` / `hand-wash` / `do-not-wash` / `do-not-bleach` / `bleach-when-needed` / `tumble-dry-low` / `tumble-dry-normal` / `do-not-tumble-dry` / `iron-low` / `iron-medium` / `iron-high` / `do-not-iron` / `dry-clean` / `do-not-dry-clean`

---

## `compliance` — Regulatory compliance

```json
"compliance": {
  "reachSVHC": [],
  "zdhcMRSL": "compliant",
  "espr": {
    "status": "complete",
    "verifiedAt": "2026-04-21T00:00:00Z"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `reachSVHC` | object[] | ESPR | Substances of Very High Concern under REACH; empty = none detected |
| `reachSVHC[].cas` | string | If present | CAS registry number |
| `reachSVHC[].name` | string | If present | Substance name |
| `reachSVHC[].concentration` | number | If present | % by weight |
| `zdhcMRSL` | enum | No | `compliant` / `non-compliant` / `not-assessed` |

---

## `provenance` — Attestation log

Array of attestation entries, one per asserted data block. Written automatically by the platform when data is submitted.

```json
"provenance": [
  {
    "field": "materials",
    "assertedBy": {
      "id": "urn:gs1:414:9876543210001",
      "name": "ABC Spinning Mill",
      "role": "tier3-supplier"
    },
    "assertedAt": "2026-02-10T14:30:00Z",
    "evidenceType": "certification",
    "evidenceRef": "GOTS-IN-2025-00341",
    "method": "api"
  },
  {
    "field": "environmental.carbonFootprint",
    "assertedBy": {
      "id": "urn:gs1:414:9876543210003",
      "name": "XYZ Dyehouse",
      "role": "tier2-supplier"
    },
    "assertedAt": "2026-02-15T09:00:00Z",
    "evidenceType": "self-declared",
    "method": "csv-upload"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `field` | string | Dot-notation path to the asserted field |
| `assertedBy.role` | enum | `brand` / `tier1-supplier` / `tier2-supplier` / `tier3-supplier` / `certifier` |
| `evidenceType` | enum | `self-declared` / `third-party-audit` / `certification` / `lab-test` / `epr-report` |
| `evidenceRef` | string | Certificate number, audit report ID, or URI |
| `method` | enum | `api` / `csv-upload` / `web-form` / `edi` — ingestion method used |
