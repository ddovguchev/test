import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce interface names to start with prefix 'I' and not end with 'Interface'",
    },
    fixable: "code",
    messages: {
      missingPrefix: 'Interface name "{{name}}" must be with prefix "I".',
      hasPostfix: 'Interface name "{{name}}" must be without postfix "Interface".',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    function withPrefix(name: string): boolean {
      return /^I[A-Z0-9]/.test(name);
    }

    function withPostfix(name: string): boolean {
      return /[A-Z0-9]*Interface$/.test(name);
    }

    function checkInterface(node: {
      id: { name: string };
      parent?: {
        type: string;
        parent?: {
          type: string;
          kind?: string;
        };
      };
    }): void {
      if (
        node.parent?.type === "TSModuleBlock" &&
        node.parent.parent?.type === "TSModuleDeclaration" &&
        node.parent.parent.kind === "global"
      ) {
        return;
      }

      if (!withPrefix(node.id.name)) {
        context.report({
          node: node.id as { type: string; name: string },
          messageId: "missingPrefix",
          data: {
            name: node.id.name,
          },
        });
      }

      if (withPostfix(node.id.name)) {
        context.report({
          node: node.id as { type: string; name: string },
          messageId: "hasPostfix",
          data: {
            name: node.id.name,
          },
        });
      }
    }

    return {
      TSInterfaceDeclaration: checkInterface,
    };
  },
};

module.exports = rule;
