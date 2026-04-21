---
title: Provenance & Attestation
description: How THREAD tracks who asserted what, when, and with what evidence.
sidebar:
  order: 3
---

The provenance model is one of THREAD's core differentiators. Every data point in a batch DPP carries attribution — who submitted it, what role they hold in the supply chain, what evidence backs it, and how it was submitted.

## Why provenance matters

A batch DPP aggregates data from multiple actors who have different levels of accountability and different types of evidence. A carbon footprint figure might be:

- Self-declared by a supplier with no third-party verification
- Calculated using the Higg FEM methodology and reviewed by an auditor
- Backed by an ISO 14067-compliant EPD from an accredited body

All three scenarios produce a `kgCO2e` number. Without provenance, the consumer of the data has no way to assess confidence. With provenance, they can.

THREAD does not require all data to be third-party verified. It requires all data to be attributed. The trust level is transparent, not hidden.

## Evidence types

| `evidenceType` | Meaning |
|---|---|
| `self-declared` | The submitter asserts this without supporting documentation |
| `third-party-audit` | An independent auditor has reviewed and confirmed this claim |
| `certification` | An accredited certification body has certified this claim (e.g. GOTS, Fair Trade) |
| `lab-test` | A laboratory test result supports this claim (e.g. SVHC testing) |
| `epr-report` | An Environmental Product Declaration or equivalent formal report |

## Immutability and versioning

Once a provenance entry is written, it is immutable. If a supplier submits updated data — for example, a revised carbon figure after receiving Higg FEM results — the new submission creates a new provenance entry. The original entry is retained in the audit log.

The batch DPP record exposes the current (latest) value for each field, with the full provenance log available to authorised viewers.

## Trust hierarchy

When multiple provenance entries exist for the same field (e.g. a self-declaration later superseded by a certification), the validation engine applies a **trust hierarchy** to determine which value is authoritative:

1. `epr-report` (highest)
2. `certification`
3. `third-party-audit`
4. `lab-test`
5. `self-declared` (lowest)

The current authoritative value is the most recent entry at the highest trust level. Both values remain in the provenance log.

## Verifiable Credentials (UNTP compatibility)

THREAD's provenance model is designed to be compatible with W3C Verifiable Credentials as used in the UN Transparency Protocol (UNTP). When a certifier submits data via the THREAD API, they can optionally include a signed Verifiable Credential as the `evidenceRef`.

A VC-backed provenance entry carries cryptographic proof of the issuer's identity and the claim content — it cannot be forged or tampered with after issuance.

Support for UNTP Digital Conformity Credentials as first-class evidence types will be added when the UNTP textile extension is finalised.

## Submitter roles

Each provenance entry records the submitter's role in the supply chain:

| Role | Typical data submitted |
|---|---|
| `brand` | Product identity, care instructions, end-of-life info |
| `tier1-supplier` | CMT facility, social certifications, production quantity |
| `tier2-supplier` | Processing facility, dyeing chemicals, water and energy use |
| `tier3-supplier` | Raw material origin, fibre composition, material certifications |
| `certifier` | Certification validity, scope, expiry |

Roles are scoped at the token level — a Tier-2 supplier's API token cannot write to the `materials` block (Tier-3 data) or the `product` block (brand data).

## Data visibility

| Actor | Can read | Can write |
|---|---|---|
| Brand | All tiers | Brand layer only |
| Tier-1 supplier | Their own data only | Tier-1 layer |
| Tier-2 supplier | Their own data only | Tier-2 layer |
| Tier-3 supplier | Their own data only | Tier-3 layer |
| Certifier | Their issued certifications | Certification layer |
| Retailer / public | Published DPP (post-publication) | None |

Scoped access is enforced at the API level via OAuth 2.0 token scopes. Suppliers cannot read competitor data even if they share a supply chain tier.
