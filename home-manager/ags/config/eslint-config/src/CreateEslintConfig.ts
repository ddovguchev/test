import rulesdirPlugin from "eslint-plugin-rulesdir";
import { createCommonConfig } from "./Presets/Common/CreateConfig.ts";
import { createTypescriptConfig } from "./Presets/Typescript/CreateConfig.ts";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Register ts-node to load TypeScript files for eslint-plugin-rulesdir
// This must be done before setting RULES_DIR
// Using .cts extension allows CommonJS compilation despite "type": "module"
try {
  const require = createRequire(import.meta.url);
  const tsNode = require("ts-node");

  // Register ts-node for .cts files (CommonJS TypeScript)
  // .cts extension automatically makes files CommonJS, regardless of package.json "type"
  tsNode.register({
    transpileOnly: true,
    compilerOptions: {
      module: "CommonJS",
      moduleResolution: "node",
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      target: "ES2020",
    },
    esm: false,
    experimentalSpecifierResolution: "node",
  });

  // Register .cts extension handler for ts-node
  // This allows require() to load .cts files as CommonJS modules
  // Reuse the .ts handler since ts-node is already registered with CommonJS settings
  if (require.extensions[".ts"]) {
    require.extensions[".cts"] = require.extensions[".ts"];
  }
} catch {
  console.log("something went wrong");
}

rulesdirPlugin.RULES_DIR = path.resolve(__dirname, "Rules");

interface ICreateEslintConfigParams {
  pathToTsConfigDir: string;
  ignores?: string[];
  commonOverrides?: Record<string, unknown>;
  typescriptOverrides?: Record<string, unknown>;
}

const createEslintConfig = ({
  pathToTsConfigDir,
  ignores = [],
  commonOverrides = {},
  typescriptOverrides = {},
  requireTsExtension = false,
}: ICreateEslintConfigParams) => {
  if (!pathToTsConfigDir) {
    throw new Error("pathToTsConfigDir not provided");
  }

  const finalCommonOverrides = {
    ...(requireTsExtension ? { "rulesdir/require-ts-extension-in-import": "error" } : {}),
    ...commonOverrides,
  };

  return [
    createCommonConfig(finalCommonOverrides),
    createTypescriptConfig(pathToTsConfigDir, typescriptOverrides),
    ...(ignores.length > 0 ? [{ ignores }] : []),
  ];
};

export { createEslintConfig };
export type { ICreateEslintConfigParams };

