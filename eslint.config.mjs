import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Os .mjs de docs/ são utilitários de cálculo de cor, rodados à mão
    // (`node docs/paleta.mjs`). Não entram no bundle.
    "docs/**",
    
  ]),
]);

export default eslintConfig;
