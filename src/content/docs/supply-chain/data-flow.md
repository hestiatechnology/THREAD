---
title: Batch Data Flow
description: Step-by-step walkthrough of how a batch DPP is built from brand to raw material and back.
sidebar:
  order: 1
---

This page walks through the complete lifecycle of a batch DPP — from the brand creating the product shell to the final DPP being published to the EU registry.

## Overview

```
Brand                Tier 1 (CMT)         Tier 2 (Processing)    Tier 3 (Raw Material)
  │                      │                       │                        │
  ├─ Create product ──▶  │                       │                        │
  ├─ Create batch ─────▶ │                       │                        │
  ├─ Generate invite ──▶ │                       │                        │
  │                      ├─ Submit T1 data ────▶ │                        │
  │                      │   (facility, qty)     ├─ Submit T2 data ─────▶ │
  │                      │                       │   (dyeing, chemicals)  ├─ Submit T3 data
  │                      │                       │                        │   (fibre, certs)
  │◀─────────────────────┼───────────────────────┼────────────────────────┘
  ├─ Add brand layer ──▶ │                       │
  │   (care, EOL info)   │                       │
  ├─ Review completeness │                       │
  ├─ Publish DPP ──────▶ EU Registry             │
  └─ Activate QR code    │                       │
```

## Step 1: Brand creates the product shell

The brand registers the product in THREAD with its GTIN and product-level data. This only needs to happen once per product model — all batches of that product inherit this record.

```json
PUT /products/0123456789012
{
  "name": "Organic Cotton T-Shirt",
  "modelNumber": "SS26-TEE-001",
  "category": { "gpc": "10000002" },
  "targetMarket": ["EU"],
  "care": {
    "washSymbols": ["wash-30", "do-not-bleach", "iron-medium"],
    "expectedLifetimeWashes": 50
  },
  "circularEconomy": {
    "repairInfo": "https://brand.example/repair/SS26-TEE-001",
    "endOfLifeOptions": ["take-back-scheme"]
  }
}
```

## Step 2: Brand creates a batch

For each production run, the brand creates a batch record with the lot ID and production details.

```json
POST /products/0123456789012/batches
{
  "batchId": "B2026Q1-001",
  "productionDate": "2026-01",
  "quantity": 500,
  "unit": "pieces",
  "countryOfOrigin": "TR"
}
```

THREAD generates scoped invite links for each supply chain tier.

## Step 3: Brand shares invite links with suppliers

The brand shares the relevant invite link with each supplier tier. This can be done:
- Via email directly from the THREAD portal
- By copying the link and sharing via their existing supplier communication channel

Each link is pre-scoped — a Tier-3 raw material supplier sees only the materials section; they cannot access or modify Tier-1 or brand data.

## Step 4: Supply chain fills in data (bottom-up)

Suppliers contribute their data independently, in any order. The batch DPP is assembled progressively as each tier submits.

**Tier-3 (raw material supplier) submits:**
- Fibre type and percentage
- Country and region of origin
- Certifications (e.g. GOTS, OCS)
- Recycled content percentage

**Tier-2 (processing facility) submits:**
- Processing facility identity (GLN, name, country)
- Carbon footprint and water consumption data
- Chemical compliance (ZDHC MRSL status, SVHC declaration)

**Tier-1 (CMT factory) submits:**
- CMT facility identity
- Production quantity and date confirmation
- Social compliance certifications (SA8000, audit references)

Each submission updates the batch completeness score in real time.

## Step 5: Certifiers push certification data (optional)

Certification bodies (GOTS, OEKO-TEX, Fair Trade) can push verified certification status directly via the certifier API, bypassing the need for manual submission by the supplier.

When a certifier submits a certification, it is tagged with `evidenceType: "certification"` and automatically carries a higher trust score than a self-declared equivalent.

## Step 6: Brand reviews and adds brand layer

Once supplier data is in, the brand reviews the record and adds any remaining brand-layer data not captured at product level:

- EU importer details (if applicable)
- Any additional sustainability claims
- Product-level repair or end-of-life programme updates

## Step 7: Validate completeness

The brand runs the completeness check to confirm all ESPR-required fields are present:

```http
GET /products/0123456789012/batches/B2026Q1-001/completeness
```

If fields are missing, the response identifies which fields and from which tier they are expected. The brand can chase the relevant supplier or, for non-critical fields, submit a self-declaration.

## Step 8: Publish

Once completeness score reaches 1.0, the brand publishes the DPP:

```http
POST /products/0123456789012/batches/B2026Q1-001/publish
```

On publication:
- The DPP is registered with the EU ESPR registry
- The GS1 Digital Link URL is activated
- The QR code/NFC payload resolves to the live DPP
- All supply chain participants are notified

## Step 9: DPP goes live

The published DPP is accessible to anyone who scans the QR code on the product. The data visible to the public is a subset of the full record — facility addresses and some supplier-specific fields are redacted for commercial confidentiality.

## Corrections after publication

If incorrect data is discovered after publication, the brand can submit a correction. This creates a new DPP version; the original is marked `superseded` and the new version becomes active. The full version history is preserved in the audit log.

The GS1 Digital Link URL continues to resolve to the latest active version automatically.

## Timing guidance

| Activity | Recommended timing |
|---|---|
| Create product shell | When product is confirmed for production |
| Create batch and send invites | When production order is placed |
| Tier-3 data submission | Within 2 weeks of production order |
| Tier-2 data submission | Within 2 weeks of processing completion |
| Tier-1 data submission | Within 1 week of shipment |
| Brand review and publication | Before product is placed on EU market |
