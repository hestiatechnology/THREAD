---
title: Introduction
description: What THREAD is, the problem it solves, and who it's for.
sidebar:
  order: 1
---

**THREAD** (Textile Harmonised Record Exchange and Attestation Data) is an open standard for transferring textile supply chain data between systems in support of the EU Digital Product Passport (DPP) mandate under the Ecodesign for Sustainable Products Regulation (ESPR). It is published and maintained by [TextileEco](https://textileeco.com), the hosted platform that implements it.

## The problem

The EU ESPR requires textiles sold in the EU market to carry a Digital Product Passport — a machine-readable record of a product's materials, origin, environmental impact, and end-of-life information. That data doesn't live in one place. It's spread across:

- Brand PLM and ERP systems
- Tier-1 factory management systems
- Tier-2 and Tier-3 supplier records (often spreadsheets)
- Third-party certification bodies (GOTS, OEKO-TEX, Fair Trade)
- Lab testing reports
- Sustainability platforms (Higg Index, etc.)

No single system owns it all. Existing DPP platforms are brand-centric — they collect data *for* the brand but don't solve how data flows *from* a cotton gin in Gujarat or a dyehouse in Bursa into a format the EU registry will accept.

## What THREAD does

THREAD defines:

1. **A canonical data schema** — a single, standardised representation of a batch-level textile DPP, aligned with GS1 EPCIS 2.0 and the UN Transparency Protocol (UNTP)
2. **A transfer layer** — REST API, structured file upload, and guided web forms so every supply chain participant can contribute data regardless of their technical capability
3. **A provenance model** — every data point carries who asserted it, when, and with what evidence, so downstream consumers can assess trust
4. **An ESPR completeness engine** — real-time validation against EU ESPR requirements, with gap reporting before publication

## Who it's for

| Role | How they use THREAD |
|---|---|
| **Brands** | Assemble and publish batch DPPs; invite suppliers; submit to EU registry |
| **Tier-1 suppliers** (CMT factories) | Submit facility, social compliance, and production data per batch |
| **Tier-2 suppliers** (dyeing, finishing) | Submit processing facility and chemical compliance data |
| **Tier-3 suppliers** (spinning, raw material) | Submit fibre origin, composition, and material certifications |
| **Certification bodies** | Push verified certification status directly via API |
| **Retailers / platforms** | Consume DPP data for product pages, sustainability reporting, resale |
| **EU DPP Registry** | Receive published, validated DPPs via GS1 Digital Link |

## THREAD and TextileEco

THREAD is the open standard — the schema, API contracts, validation rules, and CSV templates are freely available for anyone to implement.

[TextileEco](https://textileeco.com) is the company that publishes THREAD and operates the hosted platform built on it. Brands and suppliers can use the TextileEco platform to get THREAD-compliant without building their own implementation. Other platforms and ERPs can implement the standard independently.

This structure follows the open-core model: the standard is open, the hosted service is the product. When another platform adopts THREAD, the ecosystem strengthens rather than fragments.

## Design principles

**Open by default.** THREAD builds on open standards (GS1, UNTP, W3C Verifiable Credentials) and imposes no proprietary lock-in. Any compliant system can produce or consume THREAD data.

**Implementable by everyone.** A large brand's SAP instance and a small supplier's spreadsheet should both be able to produce valid THREAD data. The framework provides three ingestion tiers to make this possible.

**Batch as the primary unit.** Product-level data (care instructions, design) is defined once and inherited by all batches. Variable data (facility, carbon footprint, certifications) is tracked at the batch/lot level.

**Provenance over assertion.** THREAD does not require all data to be third-party verified, but it requires all data to be attributed. Self-declared data is valid; its source is always transparent.

**ESPR-ready, not ESPR-locked.** The EU delegated act for textiles is not yet finalised (expected 2026–2027). THREAD's schema and validation rules are designed to be updated when the act is published without breaking existing integrations.
