---
title: Web Form (Tier C)
description: Guided web form for small suppliers, artisans, and low-tech factories. Covers invite link generation, token format, field set per tier, and validation error UX.
sidebar:
  order: 3
---

Tier C ingestion is designed for the smallest actors in the supply chain — small factories, artisan producers, raw material suppliers, and any participant who doesn't have an ERP or the time to work with a CSV template.

The web form asks the same questions as the API and CSV templates, but presents them as a guided, step-by-step process with contextual help, plain-language descriptions, and validation in real time.

---

## How invite links work

The invite link mechanism is the entry point for Tier C. The brand generates a scoped token and shares a URL; the supplier opens it on any device with no account required.

### Generating an invite link

Brands generate invite tokens via the REST API. Each token is scoped to exactly one tier, GTIN, and batch.

```http
POST /products/{gtin}/batches/{batchId}/invite-tokens
X-API-Key: thr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "tier": "tier2",
  "expiresIn": 604800
}
```

| Field | Type | Description |
|---|---|---|
| `tier` | string | Supply chain tier: `tier1`, `tier2`, `tier3`, or `certifier` |
| `expiresIn` | integer | Token lifetime in seconds. Min `3600` (1 hour), max `604800` (7 days). Defaults to 7 days. |

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

Share the `url` with the supplier. Opening it routes to the web form pre-populated with their tier, GTIN, and batch context.

The token can also be used directly as a bearer token against the REST API if the supplier has a system integration:

```http
Authorization: Bearer thr_inv_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Token format and security policy

| Property | Value |
|---|---|
| Format | `thr_inv_{32 alphanumeric chars}` |
| Maximum lifetime | 7 days |
| Scope | One tier · one GTIN · one batch |
| Use | Single-use — invalidated after the first successful data write |
| Renewal | Cannot be renewed; generate a new token for each contribution window |
| Revocation | Tokens can be revoked from the TextileEco dashboard before use |

Tokens do not grant read access — a supplier holding an invite token cannot read other tiers' data or browse other batches.

---

## Accessing the form

Suppliers open the invite URL on any device — no account, no app download required.

```
https://app.textileeco.com/contribute/thr_inv_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

The link:
- Is pre-scoped to the supplier's tier (they only see their section)
- Is pre-populated with the GTIN and batch ID
- Expires at the time set by the brand (up to 7 days from generation)
- Is invalidated after the first successful submission

---

## Field set by tier

Each tier's form maps to a defined section of the canonical THREAD schema. The table below lists the canonical field path alongside the plain-language label shown in the form.

### Tier 3 — Raw material / fibre

Tier 3 submissions write to the `materials[]` array.

| Form label | Canonical field | Type | Required |
|---|---|---|---|
| Fibre type | `materials[].fibre` | string (ISO 2076 name, lowercase) | Yes |
| Percentage | `materials[].percentage` | number 0–100 | Yes |
| Country of origin | `materials[].origin.country` | ISO 3166-1 alpha-2 | Yes |
| Region (optional) | `materials[].origin.region` | string | No |
| Recycled content | `materials[].recycledContent` | number 0–100 | Yes |
| Certifications | `materials[].certifications[]` | string array | No |
| Supplier reference | `materials[].supplierRef` | URI (GLN or THREAD URN) | No |

The form allows multiple fibre entries. A running total shows the sum of all percentages; the form prevents submission until they sum to exactly 100.

### Tier 2 — Processing (dyeing, finishing, spinning)

Tier 2 submissions write to `manufacturing[]`, `environmental`, and `compliance`.

**Facility (required):**

| Form label | Canonical field | Type | Required |
|---|---|---|---|
| Facility name | `manufacturing[].facility.name` | string | Yes |
| Country | `manufacturing[].facility.country` | ISO 3166-1 alpha-2 | Yes |
| City | `manufacturing[].facility.city` | string | No |
| Facility ID | `manufacturing[].facility.id` | GLN URN or THREAD URN | No |
| Processing stage | `manufacturing[].stage` | enum | Yes |

Valid values for `stage`: `spinning`, `weaving_knitting`, `dyeing_finishing`, `embellishment`.

**Environmental data (optional but encouraged):**

| Form label | Canonical field | Type |
|---|---|---|
| Carbon footprint | `environmental.carbonFootprint.value` | number (kgCO2e) |
| CF scope | `environmental.carbonFootprint.scope` | `cradle-to-gate` or `cradle-to-grave` |
| CF methodology | `environmental.carbonFootprint.methodology` | string (e.g. "Higg MSI") |
| Water consumption | `environmental.waterConsumption.value` | number (litres per unit) |
| Microplastic risk | `environmental.microplasticRisk` | `low`, `medium`, or `high` |
| Chemicals of concern | `environmental.chemicalsOfConcern[]` | CAS number + name + concentration |

**Chemical compliance:**

| Form label | Canonical field | Type | Required |
|---|---|---|---|
| ZDHC MRSL status | `compliance.zdhcMRSL` | `compliant`, `non-compliant`, or `not-assessed` | Yes |

### Tier 1 — Cut, make, trim

Tier 1 submissions write to `manufacturing[]` and `social`.

**Facility (required):**

| Form label | Canonical field | Type | Required |
|---|---|---|---|
| Facility name | `manufacturing[].facility.name` | string | Yes |
| Country | `manufacturing[].facility.country` | ISO 3166-1 alpha-2 | Yes |
| City | `manufacturing[].facility.city` | string | No |
| Facility ID | `manufacturing[].facility.id` | GLN URN or THREAD URN | No |
| Processing stage | `manufacturing[].stage` | `cut_make_trim` | Yes |

**Social compliance:**

| Form label | Canonical field | Type | Required |
|---|---|---|---|
| Certifications held | `social.certifications[]` | string array | No |
| Living wage status | `social.livingWageStatus` | `self-declared`, `third-party-assured`, or `not-assessed` | Yes |
| Audit report URL | `social.auditRef` | URI | No |

### Certifier

Certifier submissions push verified certification status onto existing data. The form presents the batch's current self-declared certifications and allows the certifier to confirm, reject, or annotate each.

| Form label | Canonical field | Type |
|---|---|---|
| Certification name | `materials[].certifications[]` or `social.certifications[]` | string |
| Verification status | `provenance[].evidenceType` | `certification` |
| Evidence reference | `provenance[].evidenceRef` | URI |
| Audit date | `provenance[].assertedAt` | ISO 8601 date-time |

The certifier's provenance entry is written with `evidenceType: "certification"` and `method: "web-form"`.

---

## Validation and error UX

Validation runs in two stages: real-time as the supplier types, and again on submission.

### Real-time validation

| Condition | UX behaviour |
|---|---|
| Fibre percentages don't sum to 100 | Running total shown below the fibre list. Highlighted in red until the sum reaches exactly 100. Submit button disabled. |
| Country code not recognised | Inline error below the field. Dropdown suggestions offered for partial text. |
| Value out of allowed range | Inline error with the allowed range (e.g. "Must be between 0 and 100"). |
| Invalid certification code | Suggestion list shown from known certification schemes (GOTS, OEKO-TEX, Fair Trade, etc.). Free text accepted if code is not in the list. |
| Required field left empty | Field border turns red on blur. Error message appears below. |

### Submission errors

If server-side validation fails after the supplier clicks **Submit data**, the form returns to the section containing the error and highlights the affected field(s):

```json
{
  "error": "validation_failed",
  "message": "Material percentages do not sum to 100",
  "fields": [
    { "path": "materials[0].percentage", "issue": "Values sum to 98, expected 100" }
  ]
}
```

The error message is shown in the supplier's selected language. Each field path is mapped to the corresponding form input so the supplier is taken directly to the problem.

### Token errors

| Condition | Message shown |
|---|---|
| Token expired | "This link has expired. Ask the brand to generate a new one." |
| Token already used | "This link has already been used to submit data. Contact the brand if you need to make changes." |
| Token revoked | "This link is no longer valid. Ask the brand to generate a new one." |
| Wrong tier attempted | Never shown — the form only presents the tier the token is scoped to. |

---

## Multilingual support

The form is available in the following languages:

- English (EN)
- Portuguese (PT)
- Turkish (TR)
- Bengali (BN)
- Hindi (HI)
- Mandarin Chinese (ZH)
- Vietnamese (VI)

Language is detected from the browser and can be changed at any time via the language selector at the top of the form. Validation messages and token error messages are also translated.

---

## Contextual help

Every field in the form has a **?** icon that opens a plain-language explanation:

> **What is "recycled content"?**
> This is the percentage of your material that came from recycled sources — for example, cotton from post-consumer garments, or polyester from recycled plastic bottles. If none of your material is recycled, enter 0.

Certification codes are explained with logos and descriptions so suppliers can identify which apply to them without prior knowledge of the code system.

---

## Draft saving

The form auto-saves after every section. Suppliers can close the browser and return via the same invite link to continue where they left off. Drafts are retained for 90 days from the last edit.

Note: the invite link itself expires at the time set by the brand (up to 7 days). A saved draft is accessible as long as the token is still valid. If the token expires before submission, the brand must generate a new invite link — the draft data is preserved server-side and reattached when the supplier opens the new link.

---

## Mobile support

The form is fully responsive and optimised for mobile browsers. Suppliers in regions where mobile is the primary internet device can complete the form on a smartphone without loss of functionality.

No app download is required.

---

## Submitting

After completing all sections, the supplier reviews a summary screen showing everything they entered. They confirm submission by clicking **Submit data**.

On submission:
- The data is validated against the canonical schema
- A confirmation email is sent to the supplier (if an email address was provided)
- The invite token is invalidated
- The brand is notified that the supplier has submitted
- The batch completeness score is updated in real time

---

## Provenance for web form submissions

All data submitted via the web form is tagged in the provenance log:

```json
{
  "assertedBy": {
    "role": "tier2-supplier"
  },
  "assertedAt": "2026-04-29T10:00:00Z",
  "evidenceType": "self-declared",
  "method": "web-form"
}
```

The invite link token identifies the submitting party. If the supplier provides their email address, it is stored as part of the provenance entry but is not exposed in the public-facing DPP.
