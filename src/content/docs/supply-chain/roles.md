---
title: Roles & Responsibilities
description: What each supply chain participant contributes to a batch DPP and how they interact with THREAD.
sidebar:
  order: 2
---

A textile DPP aggregates data from multiple actors. This page defines what each role contributes, what access they have, and how they are expected to interact with the THREAD platform.

## Brand

The brand is the **DPP owner and publisher**. They hold responsibility for the accuracy and completeness of the final DPP under EU ESPR.

**Responsibilities:**
- Register products and create batch records
- Invite supply chain participants and manage the contribution workflow
- Add brand-layer data (care instructions, repair info, end-of-life programme)
- Review completeness and chase missing data from suppliers
- Publish the DPP to the EU registry
- Manage corrections and supersessions after publication

**Data layer:** Product identity, care, circular economy info, EU importer details

**Recommended integration:** REST API (Tier A) via ERP or PLM connector

**Access:** Read access to all tiers; write access to brand layer only

---

## Tier-1 Supplier (Cut, Make, Trim)

The CMT factory is typically the brand's **direct supplier** — the facility that assembles the finished garment. They are usually the most technically capable supplier and often the one with the most direct relationship with the brand.

**Responsibilities:**
- Submit CMT facility data (GLN, country, city)
- Confirm production quantity and date for the batch
- Submit social compliance certifications and audit references
- Cascade invites to Tier-2 suppliers if the brand delegates this

**Data layer:** Last manufacturing stage facility, production confirmation, social certifications

**Recommended integration:** REST API (Tier A) or CSV upload (Tier B)

---

## Tier-2 Supplier (Processing — dyeing, finishing, spinning)

Processing facilities often have environmental data that is critical for ESPR compliance — particularly chemical use, water consumption, and carbon footprint.

**Responsibilities:**
- Submit processing facility data
- Submit environmental data (carbon footprint, water consumption)
- Declare chemical compliance (ZDHC MRSL, REACH SVHC)

**Data layer:** Processing facility, environmental data, chemical compliance

**Recommended integration:** CSV upload (Tier B) or web form (Tier C)

---

## Tier-3 Supplier (Raw Material / Fibre)

Raw material suppliers are often the most geographically distant and least digitally equipped participants. They hold critical data about fibre origin, certifications, and recycled content.

**Responsibilities:**
- Submit fibre type, percentage, and origin
- Provide material certifications (GOTS, GRS, OCS, etc.)
- Declare recycled content percentage

**Data layer:** Material composition, fibre origin, material certifications

**Recommended integration:** Web form (Tier C) or CSV upload (Tier B)

---

## Certifier

Accredited certification bodies can push verified certification data directly to THREAD via the certifier API, without relying on the supplier to manually enter or upload it.

**Responsibilities:**
- Push certification validity, scope, and expiry for relevant products and facilities
- Update or revoke certifications when status changes

**Data layer:** Certification records (any tier)

**Recommended integration:** REST API (Tier A) — certifier-to-platform integration

**Notes:** Certifier-submitted data carries `evidenceType: "certification"` and the highest trust score in the provenance model. Brands can request that suppliers nominate their certifiers to enable direct push.

---

## EU Importer

For brands based outside the EU, an EU importer is required under ESPR. The importer's details are captured in the brand layer of the DPP.

**Responsibilities:**
- Provide name, country, and VAT number for the DPP record
- No direct THREAD access required — data is submitted by the brand on their behalf

---

## Retailer / Consumer

Retailers and consumers are **read-only consumers** of published DPPs. They access the DPP via the GS1 Digital Link URL (QR code scan or NFC tap).

**Access:** Public-facing subset of the DPP (facility addresses and some supplier data are redacted for commercial confidentiality)

Retailers with THREAD platform access can consume DPP data via the REST API for integration into product pages, sustainability reporting, or resale/recommerce platforms.

---

## Summary table

| Role | Creates records | Submits data | Reads data | Publishes |
|---|---|---|---|---|
| Brand | Products + batches | Brand layer | All tiers | Yes |
| Tier-1 supplier | No | Tier-1 layer | Own data only | No |
| Tier-2 supplier | No | Tier-2 layer | Own data only | No |
| Tier-3 supplier | No | Tier-3 layer | Own data only | No |
| Certifier | No | Certification layer | Own certs only | No |
| Retailer | No | No | Published DPP | No |
| Public / consumer | No | No | Published DPP (QR) | No |
