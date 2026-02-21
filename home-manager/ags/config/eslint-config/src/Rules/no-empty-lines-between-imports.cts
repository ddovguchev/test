import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow empty lines between import statements",
    },
    fixable: "code",
    messages: {
      noEmptyLines: "No empty lines between imports",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    function isEmptyLinesBetween(previous: any, current: any): boolean {
      const linesBetweenImports = sourceCode.lines.slice(previous.loc.end.line, current.loc.start.line - 1);

      if (linesBetweenImports.length === 0) {
        return false;
      }

      return linesBetweenImports.every((line) => !line.trim().length);
    }

    let previousDeclaration: any = null;

    return {
      ImportDeclaration(node: any) {
        if (previousDeclaration && isEmptyLinesBetween(previousDeclaration, node)) {
          context.report({
            node,
            messageId: "noEmptyLines",
            fix(fixer) {
              return fixer.replaceTextRange([previousDeclaration.range[1], node.range[0]], "\n");
            }
          });
        }

        previousDeclaration = node;
      }
    };
  },
};

module.exports = rule;
