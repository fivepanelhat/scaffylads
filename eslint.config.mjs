import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

/**
 * eslint-config-next 16 ships native flat configs, so they are spread in
 * directly. The FlatCompat wrapper this file used to carry was for the
 * eslintrc-shaped exports of v15 and throws against v16.
 *
 * No rules are disabled here on purpose - the codebase currently lints clean
 * and should stay that way.
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
