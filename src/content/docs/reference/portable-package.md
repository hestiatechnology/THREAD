---
title: Portable Package Format
description: Specification for the THREAD Portable Package — a JWS-signed envelope for cross-platform supplier data exchange.
sidebar:
  order: 2
---

A **THREAD Portable Package** is a self-contained, cryptographically signed JSON document that a supplier (or their THREAD-compliant platform) can export and submit to any other THREAD node. It solves the cross-platform data portability problem: a supplier on Platform B can contribute their tier's data to a brand on Platform A without requiring direct platform-to-platform integration.

## Envelope structure

```json
{
  "threadPackage": "1.0",
  "gtin": "0123456789012",
  "batchId": "B2026Q1-001",
  "tier": "tier2",
  "data": { ... },
  "provenance": [ ... ],
  "signature": {
    "issuer": "https://platform-b.example.com",
    "issuedAt": "2026-04-24T10:00:00Z",
    "algorithm": "ES256",
    "value": "eyJhbGciOiJFUzI1NiIsImtpZCI6InRocmVhZC1zaWduaW5nLTIwMjYtMDQifQ.eyJ0aHJlYWRQYWNrYWdlIjoiMS4wIiwiZ3RpbiI6IjAxMjM0NTY3ODkwMTIiLCJiYXRjaElkIjoiQjIwMjZRMS0wMDEiLCJ0aWVyIjoidGllcjIifQ.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `threadPackage` | string | Package format version. Currently `"1.0"`. |
| `gtin` | string | 13-digit GTIN of the product. |
| `batchId` | string | Batch identifier — must match the target DPP. |
| `tier` | string | One of `brand`, `tier1`, `tier2`, `tier3`, `certifier`. |
| `data` | object | The tier's canonical data fields (see [tier data mapping](#tier-data-mapping)). |
| `provenance` | array | Provenance entries for each asserted field. |
| `signature` | object | JWS signing metadata and compact serialisation. |

---

## Tier data mapping

The `data` object contains the canonical THREAD fields for the issuing tier. Only fields relevant to the tier's role are included.

| Tier | Expected fields in `data` |
|---|---|
| `brand` | `product` (name, modelNumber, category, targetMarket, euImporter), `care`, `circularEconomy` |
| `tier1` | `manufacturing` entries for CMT/assembly stage, `socialCompliance` (audit reports, certifications) |
| `tier2` | `manufacturing` entries for dyeing/finishing/processing stages, `environmental`, `compliance.chemicals` |
| `tier3` | `materials` (fibre, percentage, origin, recycledContent, certifications), `manufacturing` entries for spinning/yarn stages |
| `certifier` | `certifications` (status, certificate ID, scope, validity, body) |

A package may include a subset of the tier's fields. The receiving node merges the imported data with any existing data for that tier, with provenance recorded per field.

---

## JWS signing

### What is signed

The JWS payload is the canonical JSON encoding of the package **excluding the `signature` field**. Canonical JSON means:
- Object keys sorted lexicographically
- No insignificant whitespace
- UTF-8 encoding

The fields included in the payload are:

```json
{
  "batchId": "B2026Q1-001",
  "data": { ... },
  "gtin": "0123456789012",
  "provenance": [ ... ],
  "threadPackage": "1.0",
  "tier": "tier2"
}
```

### JWS structure

THREAD uses JWS compact serialisation (RFC 7515):

```
BASE64URL(header) . BASE64URL(payload) . BASE64URL(signature)
```

**Protected header:**

```json
{
  "alg": "ES256",
  "kid": "thread-signing-2026-04",
  "typ": "thread-package+json"
}
```

| Header field | Requirement |
|---|---|
| `alg` | Must be `ES256` (preferred) or `RS256`. |
| `kid` | Key ID matching an entry in the issuer's JWKS endpoint. |
| `typ` | Must be `thread-package+json`. |

**Supported algorithms:**

| Algorithm | Key type | Notes |
|---|---|---|
| `ES256` | EC P-256 | Preferred. Smaller signatures, faster verification. |
| `RS256` | RSA 2048+ | Accepted for nodes that cannot use EC keys. |

### Signing process

1. Construct the `data`, `provenance`, and envelope fields.
2. Serialise the payload as canonical JSON (keys sorted, no whitespace).
3. Compute the JWS: `BASE64URL(header) || '.' || BASE64URL(payload)`.
4. Sign the JWS signing input using the node's private key.
5. Set `signature.value` to the resulting compact serialisation.
6. Set `signature.algorithm` to match the `alg` header value.
7. Set `signature.issuedAt` to the current UTC time.

---

## Public key discovery

Every THREAD-compliant node must expose its signing public keys at a well-known endpoint:

```http
GET /.well-known/thread-keys.json
```

The response is a JSON Web Key Set (JWKS, RFC 7517):

```json
{
  "keys": [
    {
      "kid": "thread-signing-2026-04",
      "use": "sig",
      "kty": "EC",
      "crv": "P-256",
      "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
      "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0"
    }
  ]
}
```

- Multiple keys are allowed (key rotation).
- The `kid` in the JWS header must match a key in this set.
- Keys are indexed by `kid`. The verifier selects the key matching the JWS header's `kid`.
- Nodes should cache JWKS responses. The recommended TTL is 1 hour; responses may include `Cache-Control` headers to override.

---

## Verification flow

When a receiving node processes an import:

```mermaid
sequenceDiagram
    participant C as Submitter
    participant A as Platform A (receiving)
    participant B as Platform B (issuer)

    C->>A: POST /import-package {portable package}
    A->>A: Parse envelope, extract signature.issuer
    A->>B: GET /.well-known/thread-keys.json
    B-->>A: JWKS
    A->>A: Verify JWS signature using matched key
    A->>A: Validate gtin + batchId match target DPP
    A->>A: Validate data fields against schema
    A->>A: Merge data into DPP with provenance
    A-->>C: 200 OK
```

**Verification steps:**

1. Parse the compact serialisation in `signature.value`.
2. Decode the JWS header and extract `kid` and `alg`.
3. Fetch `{signature.issuer}/.well-known/thread-keys.json`.
4. Find the key with matching `kid`. Fail with `401` if not found.
5. Verify the JWS signature. Fail with `401` if invalid.
6. Check `signature.issuedAt` is no more than **30 days** in the past. Fail with `400` if stale.
7. Confirm `gtin` and `batchId` in the payload match the target DPP. Fail with `409` if mismatched.
8. Validate `data` fields against the THREAD schema for the declared `tier`. Fail with `422` if invalid.
9. Import `data` into the DPP and record provenance entries with `method: "portable-package"`.

---

## Import endpoint

```http
POST /products/{gtin}/batches/{batchId}/import-package
Content-Type: application/json
Authorization: Bearer {invite_token}

{ ...portable package... }
```

**Successful response:**

```json
{
  "status": "imported",
  "tier": "tier2",
  "fieldsImported": ["manufacturing", "environmental", "compliance.chemicals"],
  "completenessScore": 0.74
}
```

**Error responses:**

| Status | Error code | Cause |
|---|---|---|
| `400` | `malformed_package` | Envelope is missing required fields or is not valid JSON |
| `400` | `stale_package` | `signature.issuedAt` is older than 30 days |
| `401` | `signature_invalid` | JWS signature failed verification |
| `401` | `key_not_found` | `kid` not present in issuer's JWKS |
| `409` | `gtin_batchid_mismatch` | Package `gtin`/`batchId` does not match the target DPP |
| `422` | `data_validation_failed` | `data` fields fail THREAD schema validation |

---

## Export endpoint

A node generates a Portable Package for export on request:

```http
GET /products/{gtin}/batches/{batchId}/export/thread-package?tier={tier}
Authorization: Bearer {access_token}
```

The node signs the package using its current active signing key and returns the complete envelope. The `tier` parameter filters which data block is included; if omitted, the requesting token's scope determines the tier.

---

## Complete example

A full Portable Package from a Tier-2 supplier:

```json
{
  "threadPackage": "1.0",
  "gtin": "0123456789012",
  "batchId": "B2026Q1-001",
  "tier": "tier2",
  "data": {
    "manufacturing": [
      {
        "stage": "dyeing_finishing",
        "facility": {
          "id": "urn:gs1:414:9876543210003",
          "name": "XYZ Dyehouse",
          "country": "TR",
          "city": "Bursa"
        }
      }
    ],
    "environmental": {
      "carbonFootprint": {
        "value": 1.8,
        "unit": "kgCO2e",
        "scope": "cradle-to-gate",
        "methodology": "Higg MSI"
      },
      "waterConsumption": {
        "value": 450,
        "unit": "litres_per_unit"
      },
      "chemicalsOfConcern": []
    }
  },
  "provenance": [
    {
      "field": "manufacturing[0]",
      "assertedBy": {
        "id": "urn:thread:org:xyz-dyehouse",
        "name": "XYZ Dyehouse",
        "role": "tier2-supplier"
      },
      "issuedBy": "https://platform-b.example.com",
      "evidenceType": "self-declared",
      "method": "portable-package"
    },
    {
      "field": "environmental.carbonFootprint",
      "assertedBy": {
        "id": "urn:thread:org:xyz-dyehouse",
        "name": "XYZ Dyehouse",
        "role": "tier2-supplier"
      },
      "issuedBy": "https://platform-b.example.com",
      "evidenceType": "self-declared",
      "method": "portable-package"
    }
  ],
  "signature": {
    "issuer": "https://platform-b.example.com",
    "issuedAt": "2026-04-24T10:00:00Z",
    "algorithm": "ES256",
    "value": "eyJhbGciOiJFUzI1NiIsImtpZCI6InRocmVhZC1zaWduaW5nLTIwMjYtMDQiLCJ0eXAiOiJ0aHJlYWQtcGFja2FnZStqc29uIn0.eyJiYXRjaElkIjoiQjIwMjZRMS0wMDEiLCJkYXRhIjp7fSwiZ3RpbiI6IjAxMjM0NTY3ODkwMTIiLCJwcm92ZW5hbmNlIjpbXSwidGhyZWFkUGFja2FnZSI6IjEuMCIsInRpZXIiOiJ0aWVyMiJ9.EXAMPLE_SIGNATURE_VALUE_NOT_VALID"
  }
}
```

---

## Relationship to UNTP

The UN Transparency Protocol (UNTP) uses W3C Verifiable Credentials as portable, self-verifying attestations. A UNTP Digital Conformity Credential is conceptually equivalent to a THREAD Portable Package.

As UNTP matures, THREAD's portable package format will align with UNTP's VC model:

- A UNTP-issued VC will be accepted as a valid `import-package` payload.
- THREAD nodes will export UNTP-compatible VCs on request (`Accept: application/vc+ld+json`).

The `signature` envelope in THREAD Portable Package v1 is intentionally similar to JWS-secured VCs, making this convergence straightforward.

---

## Schema

The JSON Schema for the portable package envelope is published at:

```
https://thread.textileeco.com/portable-package.schema.json
```
