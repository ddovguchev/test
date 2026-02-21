import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import rulesdirPlugin from "eslint-plugin-rulesdir";
import stylistic from "@stylistic/eslint-plugin";
import i18nextPlugin from "eslint-plugin-i18next";
import path from "node:path";
import { baseTypescriptRules } from "./BaseRules.ts";

const createTypescriptConfig = (tsConfigRootDir: string, overrides: Record<string, unknown> = {}) => {
  Object.keys(overrides).forEach((it) => {
    if (!Object.hasOwn(baseTypescriptRules, it)) {
      throw new Error(`Cannot override ${it} rule because it doesn't enabled in config`);
    }
  });

  return {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        project: tsConfigRootDir ? path.join(tsConfigRootDir, "tsconfig.json") : undefined,
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: tsConfigRootDir || undefined,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      "@stylistic": stylistic,
      rulesdir: rulesdirPlugin,
      i18next: i18nextPlugin,
    },
    rules: {
      ...baseTypescriptRules,
      ...overrides,
    },
  };
};

export { createTypescriptConfig };

