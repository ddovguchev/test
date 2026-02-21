declare module "eslint-plugin-rulesdir" {
  interface RulesdirPlugin {
    RULES_DIR: string;
  }

  const plugin: RulesdirPlugin;
  export default plugin;
}




