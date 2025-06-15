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
        ...globals.node, // Use Node.js globals
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Add any custom rules here if you want
      // e.g., "no-unused-vars": "warn"
    },
  }
];