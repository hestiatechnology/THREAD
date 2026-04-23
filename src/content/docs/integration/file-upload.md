---
title: File Upload (Tier B)
description: CSV and JSON file upload for suppliers with ERP exports but no API capability.
sidebar:
  order: 2
---

Tier B ingestion is designed for suppliers who can export data from their systems (ERP, spreadsheet, factory management software) but do not have the capability to integrate directly with the REST API.

Files are uploaded via the THREAD web portal. Validation runs on upload and errors are returned with row-level references before the data is accepted.

## Supported formats

| Format | Use case |
|---|---|
| CSV (per template) | ERP exports, spreadsheet data |
| JSON file | Structured exports from factory management systems |
| Excel (.xlsx) | Manual data entry using the THREAD template |

All formats are validated against the same schema rules as the REST API. A CSV upload and an API call produce identical canonical records.

---

## CSV templates

A separate template is provided for each data type. Templates are versioned and downloadable from the portal.

### Materials template

```
gtin,batch_id,fibre,percentage,origin_country,origin_region,recycled_content_pct,certifications
0123456789012,B2026Q1-001,organic cotton,95,IN,Gujarat,0,"GOTS,OE100"
0123456789012,B2026Q1-001,elastane,5,DE,,0,
```

**Column reference:**

| Column | Required | Format | Notes |
|---|---|---|---|
| `gtin` | Yes | 13-digit numeric | Must match a product registered in THREAD |
| `batch_id` | Yes | Alphanumeric | Must match the batch created by the brand |
| `fibre` | Yes | String | ISO 2076 fibre name preferred |
| `percentage` | Yes | Number 0–100 | All rows for same batch must sum to 100 |
| `origin_country` | Yes | ISO 3166-1 alpha-2 | |
| `origin_region` | No | String | Sub-national region |
| `recycled_content_pct` | Yes | Number 0–100 | 0 if none |
| `certifications` | No | Comma-separated codes | See [Standards](/compliance/standards/) |

---

### Manufacturing template

```
gtin,batch_id,stage,facility_id,facility_name,facility_country,facility_city
0123456789012,B2026Q1-001,dyeing_finishing,urn:gs1:414:9876543210003,XYZ Dyehouse,TR,Bursa
0123456789012,B2026Q1-001,cut_make_trim,urn:gs1:414:9876543210004,Garment Factory Co,BD,Dhaka
```

---

### Environmental template

```
gtin,batch_id,carbon_kgco2e_per_unit,carbon_scope,carbon_methodology,water_litres_per_unit,microplastic_risk
0123456789012,B2026Q1-001,4.2,cradle-to-gate,Higg MSI,2700,low
```

---

### Certifications template

For certifiers or suppliers submitting certification data:

```
gtin,batch_id,certification_code,issuing_body,certificate_number,valid_from,valid_until,scope
0123456789012,B2026Q1-001,GOTS,Control Union,CU-GOTS-2025-001,2025-01-01,2026-01-01,spinning and dyeing
```

---

## Uploading files

1. Log in to the THREAD portal at `https://app.textileeco.com`
2. Navigate to the relevant batch (shared by the brand via an invite link)
3. Select your data type (Materials / Manufacturing / Environmental / Certifications)
4. Download the template for that data type
5. Fill in your data
6. Upload the completed file

The portal validates the file immediately on upload and displays any errors before saving:

```
Row 3: material percentages for batch B2026Q1-001 sum to 98, expected 100
Row 5: origin_country "IND" is not a valid ISO 3166-1 alpha-2 code (did you mean "IN"?)
```

Files are not saved until all rows pass validation. Partial saves are not supported.

---

## Multi-batch files

A single CSV file can contain data for multiple batches of the same product. Rows are grouped by `batch_id` and processed independently.

```
gtin,batch_id,fibre,percentage,...
0123456789012,B2026Q1-001,organic cotton,95,...
0123456789012,B2026Q1-001,elastane,5,...
0123456789012,B2026Q2-001,organic cotton,95,...
0123456789012,B2026Q2-001,elastane,5,...
```

---

## Excel template

The Excel template includes:
- One sheet per data type (Materials, Manufacturing, Environmental, Certifications)
- Dropdown validation for controlled fields (stage, scope, certification codes, country codes)
- A `README` sheet with field descriptions and examples
- A `Validate` button (macro) that checks basic consistency before upload

Download the latest template from the portal under **Templates → Download Excel template**.

---

## Provenance for file uploads

All data submitted via file upload is tagged with `"method": "csv-upload"` or `"method": "excel-upload"` in the provenance log. The portal user's identity and timestamp are recorded automatically.
