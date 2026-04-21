---
title: Market Landscape
description: Existing systems, open standards, and where THREAD fits relative to them.
sidebar:
  order: 3
---

Understanding what already exists is important before adopting or contributing to THREAD. This page summarises the current landscape as of 2025–2026.

## Existing platforms

Several commercial platforms address parts of the textile DPP problem:

| Platform | Coverage | Limitation |
|---|---|---|
| **Retraced** | Brand DPP creation, supplier transparency | Brand-centric; proprietary |
| **TrusTrace** | Supply chain data collection, ESPR compliance | Limited SME ingestion methods |
| **Aware / NAFFIC** | Fibre traceability, China–Europe DPP | Proprietary, molecular marker dependent |
| **TextileGenesis** | Fibre-to-product traceability | Proprietary token model |
| **Circularise** | Supply chain transparency, traceability | General-purpose, not textile-specific |
| **Fibretrace** | Embedded fibre tracking | Hardware-dependent |

**Common limitation:** All of these are proprietary and brand-centric. They solve data *presentation* well but not data *exchange* across independent systems and supply chain tiers.

## Open standards

THREAD builds on — not against — existing open standards:

### GS1 Digital Link + EPCIS 2.0

The most mature relevant standard. GS1 Digital Link defines how product identifiers are encoded as resolvable URLs. EPCIS 2.0 defines a standardised event model for supply chain visibility (what happened, where, when, to what).

**THREAD alignment:** Uses GS1 Digital Link as the DPP URI format. Aligns batch events with EPCIS 2.0 event structure.

**Official status:** Recommended by the EU for DPP implementation.

### UN Transparency Protocol (UNTP)

The conceptually closest existing standard to THREAD. UNTP defines:
- **Digital Product Passport** — a structured product data record
- **Digital Traceability Events** — linking input materials to output products at batch level
- **Digital Credentials** — W3C Verifiable Credentials for tamper-proof attestation
- **Digital Conformity Credentials** — certification claims

**THREAD alignment:** THREAD's provenance model and schema are designed to be UNTP-compatible. UNTP credentials can be used as evidence references in THREAD's attestation layer.

**Limitation:** UNTP is still in draft as of 2025. The textile extension is not yet finalised.

### Trace4Value DPP Protocol

An open-source data protocol developed by TrusTrace and GS1 Sweden. SME-friendly schema, freely downloadable.

**THREAD alignment:** Used as a reference for SME-accessible field definitions.

**Limitation:** Early stage; limited industry adoption.

### Higg Index / SAC

Industry-standard methodology for measuring environmental and social impact in textiles. The Higg Facility Environmental Module (FEM) is widely used for carbon and water footprint data.

**THREAD alignment:** THREAD's `environmental.carbonFootprint.methodology` field accepts `"Higg FEM"` as a recognised methodology identifier.

## EU regulatory context

### ESPR (Ecodesign for Sustainable Products Regulation)

Entered into force July 2024. Requires Digital Product Passports for product categories defined by delegated acts.

**For textiles:**
- Delegated act expected **2026–2027**
- DPP mandatory for textiles sold in EU estimated **2028**
- Exact required data fields are **not yet finalised**

### CIRPASS-2

EU-funded consortium of 30+ partners piloting DPP implementation across textiles, electronics, batteries, and construction. Running through 2027.

CIRPASS-2 is actively shaping what the final ESPR delegated act will require. THREAD's validation ruleset tracks CIRPASS-2 outputs.

## Where THREAD fits

THREAD does not duplicate what standards bodies are doing. It implements them and fills the gaps they leave open:

| Gap | Status in standards | THREAD approach |
|---|---|---|
| Ingestion methods for SMEs | Not defined by any standard | Three-tier ingestion (API, CSV, web form) |
| Cross-tier supply chain data flow | UNTP covers conceptually, not operationally | Scoped ownership model with brand assembly |
| Per-field provenance and attestation | UNTP VC model covers this in theory | Implemented as a first-class field on every record |
| Batch/lot granularity | EPCIS 2.0 supports it; few implementations use it | Native batch-level data model |
| Multi-system adapter layer | Not defined by any standard | Adapter contracts for ERP, PLM, cert APIs |
| ESPR completeness scoring | Not defined until delegated act | Live completeness engine, updatable when TA publishes |

The goal is that a THREAD-compliant system is also GS1-compliant and UNTP-compatible — not a fork from the standards ecosystem, but a working implementation of it.
