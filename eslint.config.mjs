import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat configs, so they are spread in
 * directly. The FlatCompat wrapper this file used to carry was for the
 * eslintrc-shaped exports of v15 and throws against v16.
 *
 * Import these WITHOUT a .js extension. The package's "exports" map defines
 * "./core-web-vitals" but not "./core-web-vitals.js", so adding the extension
 * fails with ERR_PACKAGE_PATH_NOT_EXPORTED before a single file is linted.
 * (The extension IS required on eslint-config-next 15, which is a different
 * repo's problem - see whanau-preterm-support-hub.)
 *
 * No rules are disabled here on purpose - the codebase lints clean and should
 * stay that way.
 */
export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTs,
]);
