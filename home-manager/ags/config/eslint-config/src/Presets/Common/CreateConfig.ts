import rulesdirPlugin from "eslint-plugin-rulesdir";
import { baseCommonRules } from "./BaseRules.ts";
import stylistic from "@stylistic/eslint-plugin";

const createCommonConfig = (overrides: Record<string, unknown> = {}) => {
  Object.keys(overrides).forEach((it) => {
    if (!Object.hasOwn(baseCommonRules, it)) {
      throw new Error(`Cannot override ${it} rule because it doesn't enabled in config`);
    }
  });

  return {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },
    plugins: {
      rulesdir: rulesdirPlugin,
      "@stylistic": stylistic
    },
    rules: {
      ...baseCommonRules,
      ...overrides,
    },
  };
};

export { createCommonConfig };

