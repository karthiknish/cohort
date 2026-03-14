import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import convexPlugin from "@convex-dev/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...convexPlugin.configs.recommended,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Custom project ignores
    ".vercel/**",
    "convex/_generated/**",
    "convex/**/_generated/**",
    "dist/**",
    "scripts/**",
    "run-admin-script.js",
    "set-admin-direct.js",
  ]),
  {
    files: ["**/convex/**/*.ts"],
    rules: {
      "@convex-dev/require-args-validator": ["error", { ignoreUnusedArguments: true }],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/features/*"],
              message: "Shared modules must stay independent of app routes and feature modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/features/**/*.{ts,tsx}",
      "src/shared/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
      "src/services/**/*.{ts,tsx}",
      "src/types/**/*.{ts,tsx}",
      "src/constants/**/*.{ts,tsx}",
      "src/config/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*"],
              message: "Import route logic through shared or feature modules, never from src/app.",
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-require-imports': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
    },
  },
])

export default eslintConfig;
