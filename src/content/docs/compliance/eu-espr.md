---
title: EU ESPR Compliance
description: Field-by-field mapping between THREAD schema and EU ESPR requirements for textiles.
sidebar:
  order: 1
---

The EU Ecodesign for Sustainable Products Regulation (ESPR) requires Digital Product Passports for textiles sold in the EU market. The specific data requirements for textiles will be defined in a delegated act, expected in 2026–2027, with DPP mandatory for all textiles estimated from 2028.

THREAD tracks the CIRPASS-2 pilot outputs and EU Commission working documents to keep its ESPR validation rules current. This page reflects the expected requirements based on available draft guidance.

## Regulatory timeline

| Milestone | Date | Status |
|---|---|---|
| ESPR enters into force | July 2024 | Complete |
| CIRPASS-2 pilot programme | 2024–2027 | In progress |
| Delegated act for textiles published | 2026–2027 | Pending |
| DPP mandatory for textiles in EU | ~2028 | Pending |

## Required data fields (expected)

The table below maps each expected ESPR requirement to the THREAD schema field and indicates how THREAD validates it.

| ESPR Requirement | THREAD Field | Validation rule |
|---|---|---|
| **Unique product identifier** | `dpp.id` (GS1 Digital Link) | Must be a valid GS1 Digital Link URI |
| **Material composition** | `materials[].fibre` + `percentage` | All percentages must sum to 100; at least one material required |
| **Country of origin** (last substantial transformation) | `batch.countryOfOrigin` | Valid ISO 3166-1 alpha-2 code |
| **EU importer identity** | `product.euImporter` | Required when brand's `issuedBy.country` is outside EU/EEA |
| **Durability / repairability info** | `circularEconomy.repairInfo` | Valid URI |
| **Recycled content (%)** | `circularEconomy.recycledContent` | Number 0–100 |
| **Recyclability information** | `circularEconomy.recyclabilityScore` + `recyclabilityBasis` | Score present; basis required when score is `medium` or `low` |
| **Carbon footprint** | `environmental.carbonFootprint.value` + `scope` + `methodology` | All three sub-fields required together |
| **Substances of concern (SVHC)** | `compliance.reachSVHC` | Array required (empty = none detected; must be explicitly declared) |
| **Care instructions** | `care.washSymbols` | At least one valid ISO 3758 code |
| **End-of-life information** | `circularEconomy.endOfLifeOptions` | At least one option required |
| **Manufacturing country / facility** | `manufacturing[-1].facility.country` | Last stage facility required |
| **Batch/lot identifier** | `batch.batchId` | Alphanumeric, URL-safe, max 20 chars |

## ESPR completeness scoring

The THREAD validation engine calculates an **ESPR completeness score** (0–1) for every batch DPP. The score is the ratio of present required fields to total required fields.

A DPP cannot be published until its ESPR completeness score reaches **1.0** (all required fields present and valid).

The completeness report is available at any time:

```http
GET /products/{gtin}/batches/{batchId}/completeness
```

```json
{
  "score": 0.86,
  "status": "incomplete",
  "espr": {
    "required": 14,
    "present": 12,
    "missing": [
      {
        "field": "environmental.carbonFootprint",
        "label": "Carbon footprint",
        "note": "Required by ESPR. Must include value, scope, and methodology."
      },
      {
        "field": "compliance.reachSVHC",
        "label": "REACH SVHC substances",
        "note": "An explicit declaration is required even if no substances are present. Submit an empty array to confirm no substances of concern."
      }
    ]
  }
}
```

## GS1 Digital Link requirement

ESPR requires the DPP to be accessible via a machine-readable carrier (QR code or NFC) on or with the product. The carrier must resolve to the DPP via a GS1 Digital Link URI.

THREAD generates the Digital Link URI automatically when a batch DPP is created. The brand is responsible for printing or encoding this on the product label or packaging.

## Data carrier format

The QR code payload is the Digital Link URI:

```
https://id.{brand-domain}/01/{GTIN}/10/{BatchID}
```

For brands without their own resolver, THREAD provides a hosted resolver at `id.thread-dpp.org`.

## Self-declaration vs. verified data

ESPR does not currently mandate that all DPP data be third-party verified. Self-declared data is acceptable for most fields. However:

- **Carbon footprint** — methodology must be stated; self-declared is accepted but flagged
- **REACH SVHC** — must be based on a chemical test or supply chain declaration; self-declared as "none" is accepted but carries a lower trust score
- **Certifications** — must reference a valid, in-date certificate from an accredited body

THREAD's provenance model records the evidence type for each field so regulators and consumers can assess the basis of each claim.

## Keeping up with the delegated act

When the ESPR delegated act for textiles is published, THREAD will:

1. Publish a schema migration guide identifying any new or changed fields
2. Release an updated validation ruleset
3. Provide a 6-month grace period during which both old and new rulesets are accepted
4. Mark older DPPs with a `schema_update_required` flag

Subscribe to the THREAD changelog at `https://thread-dpp.org/changelog` to receive notifications when the delegated act is published and the schema is updated.
