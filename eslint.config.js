import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.config({
    root: true,
    env: {
      es2024: true,
      browser: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/stylistic",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["dist/**", "src-tauri/target/**", "vite.config.ts"],
    overrides: [
      {
        files: ["scripts/**/*.mjs"],
        env: {
          node: true,
          browser: false,
        },
      },
    ],
  }),
];
