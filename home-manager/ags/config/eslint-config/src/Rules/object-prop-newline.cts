import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce object properties to be on new lines",
    },
    fixable: "code",
    messages: {
      bracketNewLine: "Object bracket must be placed on new line",
      propertyNewLine: "Property must be placed on new line",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    function check(node: any): void {
      let properties: any[];

      if (node.type === "ObjectExpression" || node.type === "ObjectPattern") {
        properties = node.properties;
      } else {
        // is ImportDeclaration or ExportNamedDeclaration
        properties = node.specifiers.filter((specifier: any) => specifier.type === "ImportSpecifier" || specifier.type === "ExportSpecifier");
      }

      if (!properties.length) {
        return;
      }

      let isOk = false;

      const placedInLine = node.loc.start.line === node.loc.end.line && properties.every((prop) => prop.loc.start.line === prop.loc.end.line && prop.loc.start.line === node.loc.start.line);

      if (node.type === "ImportDeclaration" && placedInLine) {
        isOk = true;
      } else if (placedInLine && properties.length <= 3) {
        isOk = true;
      }

      if (isOk) {
        return;
      }

      properties.forEach((curProp: any, index: number) => {
        if (index === properties.length - 1) {
          if (curProp.loc.end.line === node.loc.end.line) {
            context.report({
              node: node as any,
              messageId: "bracketNewLine",
              fix(fixer) {
                return fixer.insertTextAfter(curProp, "\n");
              }
            });
          }
        }

        if (index === 0) {
          if (curProp.loc.start.line === node.loc.start.line) {
            context.report({
              node: curProp as any,
              messageId: "propertyNewLine",
              fix(fixer) {
                return fixer.insertTextBefore(curProp, "\n");
              }
            });
          }

          return;
        }

        const prevProp = properties[index - 1];

        if (curProp.loc.start.line === prevProp.loc.end.line) {
          context.report({
            node: curProp as any,
            messageId: "propertyNewLine",
            fix(fixer) {
              return fixer.insertTextBefore(curProp, "\n");
            }
          });
        }
      });
    }

    return {
      ObjectExpression: check,
      ObjectPattern: check,
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
    };
  },
};

module.exports = rule;
