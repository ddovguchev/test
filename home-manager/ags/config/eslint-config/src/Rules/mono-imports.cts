import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce monorepo import rules",
    },
    messages: {
      selfImport: "Import from package itself by absolute path is not allowed",
      srcImport: "Import from src of mono packages is not allowed",
      outsideImport: "Relative import from outside of package is not allowed",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const physicalFilename = context.getPhysicalFilename();

    // Try different project structures
    let tail: string | undefined;
    if (physicalFilename.includes("/typescript/packages/")) {
      [, tail] = physicalFilename.split("/typescript/packages/");
    } else if (physicalFilename.includes("/packages/")) {
      [, tail] = physicalFilename.split("/packages/");
    } else if (physicalFilename.includes("/config/")) {
      // For config packages, use the config directory as base
      [, tail] = physicalFilename.split("/config/");
    } else {
      // If no known structure found, skip this rule
      return {};
    }

    if (!tail) {
      return {};
    }

    const splittedTail = tail.split("/");

    let packageName = splittedTail[0];

    /**
     * Chat have nested structure
     * In general to detect package package.json must be found
     * But reading file is slower that just splitting and comparing strings
     * For now crutch for chat is better solution
     */
    if (packageName === "chat") {
      packageName = splittedTail[1];
    }

    const nest = (tail.match(/\//g) || []).length;

    return {
      ImportDeclaration(node: any) {
        const { source: { value } } = node;
        const valueStr = String(value);

        if (valueStr.startsWith("@devops/")) {
          const [, sourcePackageName] = valueStr.split("/");

          if (sourcePackageName === packageName) {
            context.report({
              node,
              messageId: "selfImport",
            });
          }

          if (valueStr.includes("/src/") || valueStr.endsWith("/src")) {
            context.report({
              node,
              messageId: "srcImport",
            });
          }
        }

        const out = valueStr.split("..").length - 1;

        if (out >= nest) {
          context.report({
            node,
            messageId: "outsideImport",
          });
        }
      },
    };
  },
};

module.exports = rule;
