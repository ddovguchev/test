import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce exports to be at the end of file",
    },
    messages: {
      reExportBeforeNonExports: "Re-exports should be before non-exports",
      reExportBeforeExports: "Re-exports should be before exports",
      exportAfterReExports: "Exports should be after re-exports",
      exportAfterNonExports: "Exports should be after non-exports",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    function isExport(node: { type: string }): boolean {
      return node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration";
    }

    function isReExport(node: { type: string; source?: unknown }): boolean {
      return ((node.type === "ExportNamedDeclaration" && !!node.source) || node.type === "ExportAllDeclaration");
    }

    return {
      Program(node) {
        let firstNonExport: { range: [number, number] } | null = null;
        let lastNonExport: { range: [number, number] } | null = null;

        let lastReExport: { range: [number, number] } | null = null;

        let firstExport: { range: [number, number] } | null = null;

        node.body.forEach((bodyNode: any) => {
          if (isReExport(bodyNode)) {
            lastReExport = bodyNode;
          } else if (isExport(bodyNode)) {
            if (!firstExport) {
              firstExport = bodyNode;
            }
          } else {
            if (!firstNonExport) {
              firstNonExport = bodyNode;
            }

            lastNonExport = bodyNode;
          }
        });

        node.body.forEach((bodyNode: any) => {
          if (isReExport(bodyNode)) {
            if (firstNonExport && bodyNode.range[1] > firstNonExport.range[0]) {
              context.report({
                node: bodyNode,
                messageId: "reExportBeforeNonExports",
              });
            }

            if (firstExport && bodyNode.range[1] > firstExport.range[0]) {
              context.report({
                node: bodyNode,
                messageId: "reExportBeforeExports",
              });
            }
          } else if (isExport(bodyNode)) {
            if (lastReExport && bodyNode.range[1] < lastReExport.range[0]) {
              context.report({
                node: bodyNode,
                messageId: "exportAfterReExports",
              });
            }

            if (lastNonExport && bodyNode.range[1] < lastNonExport.range[0]) {
              context.report({
                node: bodyNode,
                messageId: "exportAfterNonExports",
              });
            }
          }
        });
      },
    };
  },
};

export default rule

// CommonJS export for eslint-plugin-rulesdir
// @ts-ignore - module.exports for eslint-plugin-rulesdir compatibility
module.exports = rule;
