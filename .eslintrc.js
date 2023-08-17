module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/no-explicit-any",
    "plugin:@typescript-eslint/interface-name-prefix"
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    complexity: ["warning", 10],
    indent: ["error", 2],
    "linebreak-style": ["error", "windows"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "@typescript-eslint/interface-name-prefix": [
      "error",
      { prefixWithI: "always" }
    ],
    "@typescript-eslint/no-explicit-any": "error"
  }
};
