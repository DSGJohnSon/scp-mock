import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js core rules (React, JSX a11y, @next/next) via legacy compat
  ...compat.extends("next/core-web-vitals"),

  // TypeScript rules via native flat config — avoids the FlatCompat + ESLint 9
  // incompatibility in @typescript-eslint's legacy "plugin:recommended" config
  ...tsPlugin.configs["flat/recommended"],

  // Project overrides
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "prefer-const": "off",
      "react-hooks/exhaustive-deps": "warn",
      // @next/next rules using context.getAncestors() removed in ESLint 9
      "@next/next/google-font-display": "off",
      "@next/next/google-font-preconnect": "off",
      "@next/next/inline-script-id": "off",
      "@next/next/next-script-for-ga": "off",
      "@next/next/no-assign-module-variable": "off",
      "@next/next/no-async-client-component": "off",
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/no-document-import-in-page": "off",
      "@next/next/no-duplicate-head": "off",
      "@next/next/no-head-element": "off",
      "@next/next/no-head-import-in-document": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-script-component-in-head": "off",
      "@next/next/no-styled-jsx-in-document": "off",
      "@next/next/no-sync-scripts": "off",
      "@next/next/no-title-in-document-head": "off",
      "@next/next/no-typos": "off",
      "@next/next/no-unwanted-polyfillio": "off",
    },
  },
];
