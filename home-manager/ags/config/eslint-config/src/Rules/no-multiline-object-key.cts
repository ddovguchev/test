import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow multiline object keys",
    },
    messages: {
      singleLine: "Object key must be single line",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    function check(node: any): void {
      node.properties.forEach((prop: any) => {
        if (
          prop.key && prop.key.type === "ConditionalExpression" &&
          prop.key.loc.start.line !== prop.key.loc.end.line
        ) {
          context.report({
            node: prop as any,
            messageId: "singleLine",
          });
        }
      });
    }

    return {
      ObjectExpression: check,
    };
  },
};

module.exports = rule;
