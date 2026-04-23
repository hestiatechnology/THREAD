---
title: Web Form (Tier C)
description: Guided web form for small suppliers, artisans, and low-tech factories.
sidebar:
  order: 3
---

Tier C ingestion is designed for the smallest actors in the supply chain — small factories, artisan producers, raw material suppliers, and any participant who doesn't have an ERP or the time to work with a CSV template.

The web form asks the same questions as the API and CSV templates, but presents them as a guided, step-by-step process with contextual help, plain-language descriptions, and validation in real time.

## Accessing the form

Suppliers do not need to create an account. The brand generates a scoped invite link for each tier and shares it with the relevant supplier:

```
https://app.textileeco.com/contribute/t3/ghi789abc
```

The link:
- Is pre-scoped to the supplier's tier (they only see their section)
- Is pre-populated with the GTIN and batch ID
- Expires after 60 days
- Can be shared with any team member at the supplier

## Form structure

The form is divided into short sections. Suppliers only see sections relevant to their tier.

### Tier-3 suppliers (raw material / fibre)

1. **About your material** — Fibre type, percentage, where it was grown or produced
2. **Certifications** — Organic, recycled, or other certifications you hold for this batch
3. **Recycled content** — Is any of this material made from recycled inputs?

### Tier-2 suppliers (processing — dyeing, finishing, spinning)

1. **Your facility** — Name, country, city of the facility that processed this batch
2. **Environmental data** — Carbon footprint and water consumption (optional but encouraged)
3. **Chemical compliance** — ZDHC MRSL status, any substances of concern

### Tier-1 suppliers (cut, make, trim)

1. **Your facility** — Name, country, city of the CMT facility
2. **Production details** — Quantity produced, production date
3. **Social compliance** — Certifications, audit status

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

Language is detected from the browser and can be changed at any time via the language selector at the top of the form.

---

## Contextual help

Every field in the form has a **?** icon that opens a plain-language explanation:

> **What is "recycled content"?**
> This is the percentage of your material that came from recycled sources — for example, cotton from post-consumer garments, or polyester from recycled plastic bottles. If none of your material is recycled, enter 0.

Certification codes are explained with logos and descriptions so suppliers can identify which apply to them without prior knowledge of the code system.

---

## Draft saving

The form auto-saves after every section. Suppliers can close the browser and return via the same invite link to continue where they left off. Drafts are retained for 90 days.

---

## Mobile support

The form is fully responsive and optimised for mobile browsers. Suppliers in regions where mobile is the primary internet device can complete the form on a smartphone without loss of functionality.

No app download is required.

---

## Submitting

After completing all sections, the supplier reviews a summary screen showing everything they entered. They confirm submission by clicking **Submit data**.

On submission:
- The data is validated
- A confirmation email is sent to the supplier (if an email address was provided)
- The brand is notified that the supplier has submitted
- The batch completeness score is updated in real time

If validation fails (e.g. fibre percentages don't sum to 100%), the form highlights the issue and prevents submission until it is corrected.

---

## Provenance for web form submissions

All data submitted via the web form is tagged with `"method": "web-form"` in the provenance log. The invite link token identifies the supplier, and the submission timestamp is recorded.

If the supplier provides their email, it is stored as part of the provenance entry but is not exposed in the public-facing DPP.
