// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://escueladeveranomurialdo.com.ar',
  trailingSlash: 'never',
  // Conservar los espacios entre elementos inline al migrar a Astro 7.
  compressHTML: true,
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },
  env: {
    schema: {
      SECRET_KEY: envField.string({ context: "client", access: "public", optional: true }),
      SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),
      ENDPOINT: envField.string({ context: "client", access: "public", optional: true }),
      CMS_URL: envField.string({ context: "server", access: "secret", default: "http://127.0.0.1:8000" }),
      CMS_SITE: envField.string({ context: "server", access: "secret", default: "escuela-de-verano" }),
      CMS_TOKEN: envField.string({ context: "server", access: "secret", default: "" }),
    }
  }
});
