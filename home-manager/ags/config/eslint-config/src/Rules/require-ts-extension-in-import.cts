import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Requires .ts extension in relative imports",
      recommended: false
    },
    fixable: "code",
    messages: {
      missingTsExtension: "Relative import must have .ts extension"
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const isRelativePath = (candidate: string): boolean =>
      candidate.startsWith("./") || candidate.startsWith("../");

    const maybeReport = (litNode: any): void => {
      if (litNode?.type !== "Literal" || typeof litNode.value !== "string") return;
      const raw = litNode.value;

      if (!isRelativePath(raw)) return;
      
      // Skip if already has .ts extension
      if (raw.endsWith(".ts")) return;
      
      // Skip if has other extensions (.js, .json, etc.)
      if (raw.match(/\.[a-z]+$/i) && !raw.endsWith(".ts")) return;

      context.report({
        node: litNode,
        messageId: "missingTsExtension",
        fix: function(fixer) {
          return fixer.replaceTextRange(litNode.range, JSON.stringify(raw + ".ts"));
        },
      });
    };

    return {
      ImportDeclaration(node: any) {
        if (node.source) maybeReport(node.source);
      },
      ExportAllDeclaration(node: any) {
        if (node.source) maybeReport(node.source);
      },
      ExportNamedDeclaration(node: any) {
        if (node.source) maybeReport(node.source);
      },
      ImportExpression(node: any) {
        if (node.source?.type === "Literal") maybeReport(node.source);
      },
      CallExpression(node: any) {
        if (node.callee?.type === "Identifier" && node.callee.name === "require") {
          const arg = node.arguments?.[0];
          if (arg?.type === "Literal") maybeReport(arg);
        }
      }
    };
  },
};

module.exports = rule;


