import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Changes .js to .ts in imports/exports/require()/import()",
      recommended: false
    },
    fixable: "code",
    messages: {
      noJs: "Change .js to .ts in import/export/require()/import()"
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const isRelativePath = (candidate: string): boolean =>
      candidate.startsWith("./") || candidate.startsWith("../");

    const maybeReport = (litNode: any): void => {
      if (litNode?.type !== "Literal" || typeof litNode.value !== "string") return;
      const raw = litNode.value;

      if (!isRelativePath(raw) || !raw.endsWith(".js")) return;

      context.report({
        node: litNode,
        messageId: "noJs",
        fix: function(fixer) {
          return fixer.replaceTextRange(litNode.range, JSON.stringify(raw.replace(/\.js$/, ".ts")));
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
