import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { createEslintConfig } = await import("./eslint-config/src/index.ts");

export default createEslintConfig({
  pathToTsConfigDir: path.join(__dirname, "src"),
  ignores: ["node_modules", "assets", "eslint-config", "env.d.ts", "src/ags.d.ts", "src/astal-stub"],
});
