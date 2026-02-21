import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce type names to start with prefix 'T'",
    },
    fixable: "code",
    messages: {
      missingPrefix: 'Type name "{{name}}" must be with prefix "T".',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    function withPrefix(name: string): boolean {
      return /^T[A-Z0-9]/.test(name);
    }

    function checkType(typeNode: any): void {
      if (!withPrefix(typeNode.id.name)) {
        context.report({
          node: typeNode.id as any,
          messageId: "missingPrefix",
          data: {
            name: typeNode.id.name,
          },
        });
      }
    }

    return {
      TSTypeAliasDeclaration: checkType,
    };
  },
};

module.exports = rule;
