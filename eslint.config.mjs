import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json", // <-- aponta para seu tsconfig
      tsconfigRootDir: __dirname,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "semi": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/strict-boolean-expressions": "error", 
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
