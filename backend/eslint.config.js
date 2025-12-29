import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/"],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
  }
];