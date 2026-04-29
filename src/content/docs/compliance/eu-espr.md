---
title: EU ESPR Compliance
description: Field-by-field mapping between THREAD schema and EU ESPR requirements for textiles, with completeness scoring weights and ambiguity flags.
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

---

## Field mapping

**Status values:**
- **Required** — expected as mandatory based on CIRPASS-2 outputs and current EU DPP framework
- **Conditional** — required only when a specific condition applies (noted in the table)
- **Recommended** — not yet confirmed as mandatory; tracked and surfaced to implementors
- **Optional** — not in scope for the current ESPR draft for textiles

**Weight** is the scoring coefficient used in `dpp.completenessScore` (see [Scoring algorithm](#scoring-algorithm)). Structural fields are always present when a DPP exists and are excluded from scoring. Recommended and optional fields do not contribute to the score.

⚠ marks fields where the delegated act text is still ambiguous — see [Ambiguous fields](#ambiguous-fields).

| ESPR Requirement | THREAD Field | Status | Weight | Validation rule |
|---|---|---|---|---|
| Unique product identifier | `dpp.id` | Required | — structural | Valid GS1 Digital Link URI |
| Batch/lot identifier | `batch.batchId` | Required | — structural | Alphanumeric, URL-safe, max 20 chars |
| Material composition | `materials[].fibre` + `materials[].percentage` | Required | **0.15** | All percentages sum to 100; at least one entry |
| Carbon footprint | `environmental.carbonFootprint` (`value` + `scope` + `methodology`) | Required | **0.15** | ⚠ All three sub-fields required together |
| Substances of concern (SVHC) | `compliance.reachSVHC` | Required | **0.12** | Array required; empty = none detected (must be explicit) |
| Recycled content | `circularEconomy.recycledContent` | Required | **0.10** | Number 0–100 (% of total product weight) |
| Recyclability | `circularEconomy.recyclabilityScore` + `circularEconomy.recyclabilityBasis` | Required | **0.08** | `circularEconomy.recyclabilityBasis` required when score is `medium` or `low` |
| Durability / repairability | `circularEconomy.repairInfo` | Required | **0.08** | Valid URI to repair instructions or spare parts |
| End-of-life options | `circularEconomy.endOfLifeOptions` | Required | **0.07** | At least one option from the defined enum |
| Care instructions | `care.washSymbols` | Required | **0.07** | At least one valid ISO 3758 / GINETEX code |
| Country of origin | `batch.countryOfOrigin` | Required | **0.07** | ISO 3166-1 alpha-2; country of last substantial transformation |
| Manufacturing facility | `manufacturing[-1].facility` | Required | **0.06** | Last production stage facility with country |
| EU importer identity | `product.euImporter` | Conditional | **0.05** | Required when issuing brand is domiciled outside EU/EEA |
| Water consumption | `environmental.waterConsumption` | Recommended | — | ⚠ Inclusion in delegated act unconfirmed |
| Microplastic shedding risk | `environmental.microplasticRisk` | Recommended | — | ⚠ Assessment methodology not yet standardised |
| Social certifications | `social.certifications` | Optional | — | Not in current ESPR draft scope for textiles |

---

## Scoring algorithm

`dpp.completenessScore` is a weighted ratio of present required fields over all applicable required fields.

```
score = Σ(weight_i × present_i) / Σ(weight_i × applicable_i)
```

Where:
- `weight_i` — the weight from the table above (structural fields excluded)
- `present_i` — `1` if the field is present and passes validation; `0` otherwise
- `applicable_i` — `1` for all required fields except `product.euImporter`, which is `1` only when the issuing brand's country is outside EU/EEA and `0` otherwise

**Example — EU brand, all fields present:**

| Field | Weight | Applicable | Present | Contribution |
|---|---|---|---|---|
| `materials` | 0.15 | 1 | 1 | 0.15 |
| `carbonFootprint` | 0.15 | 1 | 1 | 0.15 |
| `reachSVHC` | 0.12 | 1 | 1 | 0.12 |
| `recycledContent` | 0.10 | 1 | 1 | 0.10 |
| `recyclabilityScore` | 0.08 | 1 | 1 | 0.08 |
| `repairInfo` | 0.08 | 1 | 1 | 0.08 |
| `endOfLifeOptions` | 0.07 | 1 | 1 | 0.07 |
| `washSymbols` | 0.07 | 1 | 1 | 0.07 |
| `countryOfOrigin` | 0.07 | 1 | 1 | 0.07 |
| `manufacturing[-1]` | 0.06 | 1 | 1 | 0.06 |
| `euImporter` | 0.05 | **0** (EU brand) | — | — |
| **Total** | | **0.95** | | **0.95** |

`score = 0.95 / 0.95 = 1.0` → status: `complete`

For a non-EU brand, `euImporter` becomes applicable (`applicable_i = 1`), the denominator is `1.0`, and the brand must also supply `product.euImporter` to achieve a score of `1.0`.

**Status thresholds:**

| Score | `espr.status` | Publishable |
|---|---|---|
| `< 1.0` | `incomplete` | No |
| `1.0` | `complete` | Yes |

---

## Gap report

The completeness report is available at any time and lists each missing field with a human-readable note:

```http
GET /products/{gtin}/batches/{batchId}/completeness
```

```json
{
  "score": 0.73,
  "status": "incomplete",
  "espr": {
    "applicableWeight": 1.0,
    "presentWeight": 0.73,
    "missing": [
      {
        "field": "environmental.carbonFootprint",
        "weight": 0.15,
        "label": "Carbon footprint",
        "note": "Required by ESPR. Must include value, scope, and methodology."
      },
      {
        "field": "compliance.reachSVHC",
        "weight": 0.12,
        "label": "REACH SVHC substances",
        "note": "An explicit declaration is required even if no substances are present. Submit an empty array to confirm none detected."
      }
    ]
  }
}
```

---

## Ambiguous fields

The following fields have requirements that are not yet clearly defined in the available draft delegated act text. THREAD's current interpretation is noted. These will be updated when the delegated act is finalised.

**`environmental.carbonFootprint.scope`**
The draft does not specify whether the carbon footprint must be calculated to cradle-to-gate (production only) or cradle-to-grave (full lifecycle). THREAD accepts both `cradle-to-gate` and `cradle-to-grave` and requires the scope to be declared explicitly. Implementors should use cradle-to-gate as the minimum; cradle-to-grave will likely be required for the published DPP.

**`environmental.waterConsumption`**
Water consumption appears in CIRPASS-2 pilot templates as a recommended field but is not yet confirmed as mandatory in the ESPR textile delegated act. THREAD tracks it as Recommended and will promote it to Required if confirmed.

**`environmental.microplasticRisk`**
The EU Textile Strategy references microplastic shedding as a concern but no standardised assessment methodology has been adopted. THREAD uses a three-level risk rating (`low` / `medium` / `high`) as a placeholder; the exact methodology will be revised once EU standards (e.g. under CEN/TC 248) are published.

**`compliance.reachSVHC` concentration threshold**
The REACH Regulation requires SVHC disclosure above 0.1% by weight in articles. The ESPR delegated act may set a different threshold or require disclosure of all detected substances regardless of concentration. THREAD currently enforces no minimum threshold — implementors should declare all detected substances.

---

## GS1 Digital Link requirement

ESPR requires the DPP to be accessible via a machine-readable carrier (QR code or NFC) on or with the product. The carrier must resolve to the DPP via a GS1 Digital Link URI.

THREAD generates the Digital Link URI automatically when a batch DPP is created. The brand is responsible for printing or encoding this on the product label or packaging.

## Data carrier format

The QR code payload is the Digital Link URI:

```
https://id.{brand-domain}/01/{GTIN}/10/{BatchID}
```

For brands without their own resolver, THREAD provides a hosted resolver at `id.textileeco.com`.

---

## Self-declaration vs. verified data

ESPR does not currently mandate that all DPP data be third-party verified. Self-declared data is acceptable for most fields. However:

- **Carbon footprint** — methodology must be stated; self-declared is accepted but flagged
- **REACH SVHC** — must be based on a chemical test or supply chain declaration; self-declared as "none" is accepted but carries a lower trust score
- **Certifications** — must reference a valid, in-date certificate from an accredited body

THREAD's provenance model records the evidence type for each field so regulators and consumers can assess the basis of each claim.

## ESPR registry export

When the EU ESPR registry becomes operational, brands must submit their DPPs to the registry using a machine-readable format. THREAD nodes expose a JSON-LD export endpoint that produces a registry-ready document for any published DPP.

### Endpoint

```http
GET /products/{gtin}/batches/{batchId}/export/espr-registry
Accept: application/ld+json
```

The endpoint returns `400` for DPPs that are not yet published. Only published DPPs — those with an ESPR completeness score of 1.0 — can be exported.

### JSON-LD context

The export document uses the THREAD ESPR export context:

```
https://thread.textileeco.com/espr-context.jsonld
```

The context maps every THREAD field to its canonical IRI using established vocabularies:

| Namespace prefix | Vocabulary | Used for |
|---|---|---|
| `gs1:` | GS1 Web Vocabulary (`https://gs1.org/voc/`) | Product identifiers, GTIN, batch number, country of origin |
| `schema:` | Schema.org (`http://schema.org/`) | Names, addresses, publication date |
| `thread:` | THREAD Vocabulary (`https://thread.textileeco.com/vocab/`) | All THREAD-specific fields not covered by gs1 or schema.org |
| `xsd:` | XML Schema Datatypes | Numeric and date field types |

### Example export payload

The following is an example export for a published cotton T-shirt DPP.

```json
{
  "@context": "https://thread.textileeco.com/espr-context.jsonld",
  "@type": "thread:BatchDPP",
  "@id": "https://id.textileeco.com/01/0123456789012/10/B2026Q1-001",
  "schemaVersion": "0.1",
  "issuedAt": "2026-04-24T10:00:00Z",
  "status": "published",
  "completenessScore": 1.0,

  "gtin": "0123456789012",
  "batchId": "B2026Q1-001",
  "productName": "Organic Cotton T-Shirt",
  "modelNumber": "SS26-TEE-001",
  "countryOfOrigin": "TR",
  "euImporter": {
    "importerName": "Example EU Importer Lda",
    "importerCountry": "PT",
    "vatNumber": "PT500000000"
  },

  "materials": [
    {
      "fibre": "organic cotton",
      "percentage": 95,
      "fibreRecycledContent": 0,
      "materialOrigin": { "originCountry": "IN", "originRegion": "Gujarat" },
      "certifications": ["GOTS"]
    },
    {
      "fibre": "elastane",
      "percentage": 5,
      "fibreRecycledContent": 0,
      "certifications": []
    }
  ],

  "manufacturing": [
    {
      "stage": "spinning",
      "facilityId": "urn:thread:facility:IN:SPIN-001",
      "facilityName": "Gujarat Spinning Co.",
      "facilityCountry": "IN"
    },
    {
      "stage": "dyeing_finishing",
      "facilityId": "urn:gs1:414:9876543210003",
      "facilityName": "XYZ Dyehouse",
      "facilityCountry": "TR",
      "facilityCity": "Bursa"
    },
    {
      "stage": "cut_make_trim",
      "facilityId": "urn:gs1:414:1234567890123",
      "facilityName": "Istanbul Garment Factory",
      "facilityCountry": "TR",
      "facilityCity": "Istanbul"
    }
  ],

  "environmental": {
    "carbonFootprint": {
      "cfValue": 4.2,
      "cfUnit": "kgCO2e",
      "cfScope": "cradle-to-gate",
      "cfMethodology": "Higg MSI"
    },
    "waterConsumption": {
      "waterValue": 2700,
      "waterUnit": "litres_per_unit"
    },
    "microplasticRisk": "low"
  },

  "compliance": {
    "reachSVHC": [],
    "zdhcMRSL": "compliant"
  },

  "circularEconomy": {
    "recycledContent": 0,
    "recyclabilityScore": "high",
    "recyclabilityBasis": "100% single-fibre natural cotton, no coatings or finishes",
    "repairInfo": "https://brand.textileeco.com/repair/SS26-TEE-001",
    "endOfLifeOptions": ["take-back-scheme", "home-compostable"]
  },

  "care": {
    "washSymbols": ["wash-40", "do-not-bleach", "tumble-dry-low", "iron-medium"]
  }
}
```

### Speculative fields

The EU ESPR delegated act for textiles has not yet been published. The following fields in the export format are based on CIRPASS-2 pilot outputs and EU Commission working documents. Their exact names, structure, and required status in the live registry may change.

| Field | Status | Notes |
|---|---|---|
| `environmental.carbonFootprint` | Speculative | Expected to be required; scope and methodology requirements TBC |
| `environmental.waterConsumption` | Speculative | Likely required; unit definitions subject to delegated act |
| `environmental.microplasticRisk` | Speculative | Inclusion and allowed values pending delegated act |
| `compliance.zdhcMRSL` | Speculative | May be superseded by a broader chemical compliance framework |
| `circularEconomy.*` | Speculative | All circular economy fields are anticipated but not yet mandated |
| `care.washSymbols` | Speculative | Inclusion in the registry payload (vs. the label only) is pending |

Fields not listed above (`gtin`, `batchId`, `countryOfOrigin`, `materials`, `manufacturing`, `compliance.reachSVHC`) are firmly expected based on the ESPR regulation text and CIRPASS-2 consensus outputs.

The machine-readable OpenAPI schema for this response is available in [`/openapi.yaml`](/openapi.yaml) under the `ESPRRegistryExport` component, and the full JSON-LD context is at [`/espr-context.jsonld`](/espr-context.jsonld).

## Keeping up with the delegated act

When the ESPR delegated act for textiles is published, THREAD will:

1. Publish a schema migration guide identifying any new or changed fields
2. Release an updated validation ruleset with revised weights
3. Resolve all ⚠ ambiguous fields based on the final delegated act text
4. Provide a 6-month grace period during which both old and new rulesets are accepted
5. Mark older DPPs with a `schema_update_required` flag

Subscribe to the THREAD changelog at `https://textileeco.com/changelog` to receive notifications when the delegated act is published and the schema is updated.
