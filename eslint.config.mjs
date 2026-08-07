import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".next/**",
      ".vinext/**",
      "dist/**",
      "node_modules/**",
      ".agents/**",
      "coverage/**",
      "test-results/**",
      "public/**",
      "scripts/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "warn",
      "no-unused-vars": "off",
    },
  },
];
