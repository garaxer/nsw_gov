import js from "@eslint/js";
import globals from "globals";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import parser from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

export default defineConfig([
  {
    files: ["handlers/**/*.{js,mjs,cjs,ts,mts,cts}", "infrastructure/**/*.ts"],
    ignores: [
      "dist/**",
      "node_modules/**",
      "infrastructure/cdk.out/**",
      ".build/**"
    ],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      parser,
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./handlers/tsconfig.json",
          "./infrastructure/tsconfig.json",
        ],
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    rules: {
      "no-param-reassign": "error",
      "no-return-await": "error",
      "no-else-return": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
  },
  ...compat.extends("plugin:@typescript-eslint/recommended"),
]);
