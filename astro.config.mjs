// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://thread.textileeco.com',

  integrations: [
      mermaid({ autoTheme: true }),
      starlight({
          plugins: [starlightLlmsTxt()],
          title: 'THREAD',
          description: 'Textile Harmonised Record Exchange and Attestation Data — an open standard for textile Digital Product Passports, published by TextileEco.',
          social: [],
          customCss: [],
          components: {},
          head: [
              {
                  tag: 'meta',
                  attrs: { name: 'og:site_name', content: 'THREAD by TextileEco' },
              },
          ],
          sidebar: [
              {
                  label: 'Overview',
                  items: [
                      { label: 'Introduction', slug: 'overview/introduction' },
                      { label: 'Architecture', slug: 'overview/architecture' },
                      { label: 'Market Landscape', slug: 'overview/landscape' },
                      { label: 'Federation & Interoperability', slug: 'overview/federation' },
                  ],
              },
              {
                  label: 'Data Model',
                  items: [
                      { label: 'Identifiers', slug: 'data-model/identifiers' },
                      { label: 'Canonical Schema', slug: 'data-model/schema' },
                      { label: 'Provenance & Attestation', slug: 'data-model/provenance' },
                  ],
              },
              {
                  label: 'Integration',
                  items: [
                      { label: 'REST API (Tier A)', slug: 'integration/rest-api' },
                      { label: 'File Upload (Tier B)', slug: 'integration/file-upload' },
                      { label: 'Web Form (Tier C)', slug: 'integration/web-form' },
                  ],
              },
              {
                  label: 'Supply Chain',
                  items: [
                      { label: 'Batch Data Flow', slug: 'supply-chain/data-flow' },
                      { label: 'Roles & Responsibilities', slug: 'supply-chain/roles' },
                  ],
              },
              {
                  label: 'Compliance',
                  items: [
                      { label: 'EU ESPR', slug: 'compliance/eu-espr' },
                      { label: 'Standards Alignment', slug: 'compliance/standards' },
                  ],
              },
          ],
      }),
  ],

  adapter: cloudflare({ prerenderEnvironment: 'node' }),
});
