---
title: Identifiers
description: How products, batches, and facilities are identified in THREAD using GS1 standards.
sidebar:
  order: 1
---

THREAD uses GS1 standards for all canonical identifiers. Proprietary system identifiers (PLM style numbers, ERP batch codes) are stored as `externalRefs` alongside the canonical form but are never used as primary keys.

## Identifier types

| Entity | Identifier | Format | Example |
|---|---|---|---|
| Product (style/model) | GTIN-13 | 13-digit numeric | `0123456789012` |
| Batch / lot | GTIN + AI(10) | GTIN + alphanumeric lot | `B2024Q3-001` |
| Facility | GLN-13 | 13-digit numeric | `4061234500003` |
| DPP record | GS1 Digital Link URI | HTTPS URL | see below |
| Certifier / issuer | GLN or URI | GLN or HTTPS URI | `urn:gs1:414:4061234500003` |

## GS1 Digital Link

The Digital Link URI is the primary key for a batch DPP. It is also the payload of the QR code or NFC tag attached to physical products or shipping documentation.

### Format

```
https://id.{resolver-domain}/01/{GTIN}/10/{BatchID}
```

**Example:**
```
https://id.textileeco.com/01/0123456789012/10/B2024Q3-001
```

Resolving this URL returns the DPP record. The resolver can be hosted by the brand, a platform provider, or the EU registry — the URL format is stable regardless.

### GS1 Application Identifiers used

| AI | Meaning | Encoding |
|---|---|---|
| `01` | GTIN | `/01/{13-digit GTIN}` |
| `10` | Batch / lot number | `/10/{batch-id}` |
| `414` | GLN (facility/location) | `/414/{13-digit GLN}` |
| `3103` | Net weight (kg) | `/3103/{6-digit value}` |
| `11` | Production date | `/11/{YYMMDD}` |

## Batch ID format

Batch IDs are assigned by the brand or manufacturer. THREAD does not mandate a specific format but recommends a structure that encodes enough information to be useful without being opaque:

```
{OriginCode}-{Year}{Quarter}-{Sequence}
```

Example: `IND-2026Q1-0042` — produced in India, Q1 2026, 42nd batch of the period.

The batch ID must be:
- Unique within the GTIN scope
- Alphanumeric, max 20 characters
- URL-safe (no spaces or special characters other than `-` and `_`)

## External reference mapping

Suppliers and brands will have their own internal identifiers. These are stored in the `externalRefs` array and are never used for routing or querying:

```json
"externalRefs": [
  { "system": "SAP-ERP", "id": "MAT-00049281" },
  { "system": "Centric-PLM", "id": "SS26-TEE-001-BLK" },
  { "system": "GOTS-DB", "id": "CERT-2025-IN-00341" }
]
```

This allows each system to maintain its own identifiers while THREAD provides the canonical cross-system reference.

## Facility identification

Facilities are identified by GLN (Global Location Number). If a supplier does not have a GLN, they can apply through GS1 or their national GS1 member organisation. As an interim measure during onboarding, THREAD accepts a self-assigned URN in the format:

```
urn:thread:facility:{iso-country-code}:{internal-id}
```

This interim identifier is flagged in validation output as non-canonical and should be migrated to a GLN before DPP publication.
