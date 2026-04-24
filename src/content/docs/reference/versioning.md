---
title: Schema Versioning & Migration Policy
description: How the THREAD schema is versioned, what constitutes a breaking change, and how implementors can plan for schema evolution.
sidebar:
  order: 1
---

The THREAD schema will evolve as EU ESPR requirements are finalised (expected 2026–2027) and as the textile industry identifies practical gaps. This policy defines how changes are numbered, communicated, and handled by THREAD-compliant nodes.

---

## Version numbering

THREAD uses **MAJOR.MINOR** semantic versioning (e.g. `1.0`, `1.1`, `2.0`). Patch versions are not used — every schema change is either breaking (MAJOR) or non-breaking (MINOR).

The `schemaVersion` field in the `dpp` object of every DPP record carries this version string. The pattern `^[0-9]+\.[0-9]+$` is enforced by the schema.

---

## Breaking vs non-breaking changes

### Breaking changes — MAJOR increment

A MAJOR version increment is required when a change prevents a node from correctly reading a DPP that was valid under the previous version:

- Removing a required or optional field
- Changing a field's type (e.g. `string` → `object`)
- Renaming or removing an existing `enum` value
- Making an optional field required
- Tightening a validation pattern or constraint

### Non-breaking changes — MINOR increment

A MINOR version increment covers additive or relaxing changes that do not break existing DPPs:

- Adding a new optional field
- Adding a new `enum` value to an existing enum
- Making a previously required field optional
- Adding new `$defs` types
- Improving field descriptions or examples

---

## How nodes handle version mismatches

| Scenario | Node behaviour |
|---|---|
| DPP `schemaVersion` MAJOR == node MAJOR | Accept and validate normally |
| DPP `schemaVersion` MINOR > node MINOR | Accept; unknown optional fields SHOULD be preserved, not stripped |
| DPP `schemaVersion` MAJOR > node MAJOR | Reject with HTTP `409 Conflict`; return `schemaVersion` in error body |
| DPP `schemaVersion` MAJOR < node MAJOR | Accept via compatibility adapter (see [Compatibility bridge](#compatibility-bridge)) |

When rejecting a DPP due to a version mismatch, nodes MUST return a response body that includes the `schemaVersion` value they support, so the sender can route the DPP to an appropriate node or apply an adapter.

---

## Deprecation policy

Before a MAJOR version is released:

1. **12-month notice** — the breaking change is announced in the THREAD changelog and the affected field or value is marked `deprecated` in the schema description.
2. **Dual support window** — for 24 months after a new MAJOR release, nodes SHOULD continue to accept DPPs from the previous MAJOR version via a compatibility adapter.
3. **End-of-life** — after 24 months, support for the old MAJOR version is optional. Nodes MAY reject it.

MINOR deprecations (fields that will be removed in a future MAJOR) follow the same 12-month notice requirement, but do not trigger a support window.

---

## Schema URL strategy

| URL | Content |
|---|---|
| [`/schema.json`](https://thread.textileeco.com/schema.json) | Always resolves to the **latest stable** schema |
| [`/schema/0.1.json`](https://thread.textileeco.com/schema/0.1.json) | Permanent, stable URL for schema version 0.1 |

Both URLs are permanent for the lifetime of that version. Implementors who pin to a specific version SHOULD use the versioned URL. IDE integrations and validators that always want the latest SHOULD use `/schema.json`.

The versioned URL is also the `$id` value inside each versioned schema file, making it self-describing.

---

## Compatibility bridge

**Forward compatibility (older DPP → newer node):** A v1.0 DPP is valid for a v1.1 node. MINOR additions are optional fields, so a v1.0 DPP simply omits them.

**Backward compatibility (newer DPP → older node):** A v1.1 DPP MAY contain fields unknown to a v1.0 node. v1.0 nodes SHOULD preserve unrecognised fields rather than rejecting the record, but are not required to validate them.

**Cross-MAJOR compatibility:** DPPs from a previous MAJOR version are not directly valid against the new MAJOR schema. Compatibility adapters are published alongside each MAJOR release and transform old DPPs into the new shape. Adapters are versioned (e.g. `thread-adapter-v1-to-v2`).

---

## Compatibility matrix

| DPP version | v1.0 node | v1.x node |
|---|---|---|
| v1.0 | Compatible | Compatible |
| v1.x | Partial — unknown fields preserved | Compatible |
| v2.0 | Reject (no adapter yet) | Reject (no adapter yet) |

This matrix will be extended with each new release.

---

## Release history

| Version | Released | Type | Summary |
|---|---|---|---|
| 0.1 | 2026-04 | Initial beta release | Baseline THREAD schema covering all DPP sections |
