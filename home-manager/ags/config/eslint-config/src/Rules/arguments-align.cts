import type { Rule } from "eslint";

interface Loc {
  start: number;
  end: number;
}

const getLoc = (node: { loc: { start: { line: number }; end: { line: number } } }): Loc => ({
  start: node.loc.start.line,
  end: node.loc.end.line
});

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce proper alignment of function parameters and arguments",
    },
    fixable: "whitespace",
    messages: {
      paramsSingle: `Parameter start must equal opening bracket and end must equal closing bracket or start must be after opening bracket and end must be before closing bracket
Examples:

const func = ({ key: 1 }) => null;

const func = ({
  key: 1,
}) => null;

const func = (
  {
    key: 1,
  },
) => null;`,
      paramsMultiple: `Every parameter start must be after opening bracket or prev parameter end and end must be before next parameter start or closing bracket
Examples:

const func = ({ key: 1 }, 2, { key: 3 }) => null;

const func = (
  { key: 1 },
  2,
  { key: 3 },
) => null;`,
      argumentsSingle: `Argument start must equal opening bracket and end must equal closing bracket or start must be after opening bracket and end must be before closing bracket
Examples:

call({ key: 1 });

call({
  key: 1,
});

call(
  {
    key: 1,
  },
);`,
      argumentsMultiple: `Every argument start must be after opening bracket or prev argument end and end must be before next argument start or closing bracket
Examples:

call({ key: 1 }, 2, { key: 3 });

call(
  { key: 1 },
  2,
  { key: 3 },
);`,
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const splitted = context.getFilename().split(".");

    if (["test", "spec"].includes(splitted[splitted.length - 2] || "")) {
      return {};
    }

    const source = context.getSourceCode().text;

    const perform = (
      node: { params?: unknown[]; arguments?: unknown[] },
      reportNode: { type?: string; loc: { start: { line: number }; end: { line: number } } },
      loc: Loc,
      type: "params" | "arguments"
    ): void => {
      if (loc.start === loc.end) {
        return;
      }

      const items = type === "params" ? node.params : node.arguments;
      if (!items || items.length === 0) {
        return;
      }

      if (items.length === 1) {
        const [value] = items as Array<{ loc: { start: { line: number }; end: { line: number } } }>;

        const valueLoc = getLoc(value);

        if (
          valueLoc.start === loc.start &&
          valueLoc.end === loc.end
        ) {
          return;
        }

        if (
          valueLoc.start > loc.start &&
          valueLoc.end < loc.end
        ) {
          return;
        }

        context.report({
          node: reportNode as unknown as { type: string },
          messageId: `${type}Single`,
          fix(fixer) {
            if (valueLoc.start === loc.start) {
              return fixer.insertTextBefore(value as unknown as { type: string }, "\n");
            }

            return fixer.insertTextAfter(value as unknown as { type: string }, "\n");
          }
        });
        return;
      }

      const valueLocs = (items as Array<{ loc: { start: { line: number }; end: { line: number } } }>).map(getLoc);

      let valid = true;

      let i = 0;

      while (i < valueLocs.length) {
        const valueLoc = valueLocs[i];

        if (i === 0) {
          if (valueLoc.start === loc.start) {
            valid = false;

            break;
          }

          i++;

          continue;
        }

        const prevValueLoc = valueLocs[i - 1];

        if (valueLoc.start === prevValueLoc.end) {
          valid = false;

          break;
        }

        if (i === valueLocs.length - 1) {
          if (valueLoc.end === loc.end) {
            valid = false;
          }
        }

        i++;
      }

      if (valid) {
        return;
      }

      context.report({
        node: reportNode as any,
        messageId: `${type}Multiple`,
        fix(fixer) {
          const fixers: any[] = [];

          valueLocs.forEach((valueLoc, i) => {
            const value = items[i];

            if (i === 0) {
              if (valueLoc.start === loc.start) {
                fixers.push(fixer.insertTextBefore(value as unknown as { type: string }, "\n"));
              }

              return;
            }

            const prevValueLoc = valueLocs[i - 1];

            if (valueLoc.start === prevValueLoc.end) {
              fixers.push(fixer.insertTextBefore(value as unknown as { type: string }, "\n"));
            }

            if (i === valueLocs.length - 1) {
              if (valueLoc.end === loc.end) {
                fixers.push(fixer.insertTextAfter(value as unknown as { type: string }, "\n"));
              }
            }
          });

          return fixers;
        }
      });
    };

    const handleFunction = (node: any): void => {
      if (node.params.length === 0) {
        return;
      }

      const loc: Loc = getLoc(node);

      if (node.typeParameters) {
        loc.start = node.typeParameters.loc.end.line;

        /**
         * For functions like:
         *
         * const x = <T>
         *   (a: any, b: any, c: any) => null
         */
        const firstOpeningBracketIndex = source.slice(node.typeParameters.range[1], node.body.range[0]).split("").indexOf("(");

        if (source.slice(node.typeParameters.range[1] - 1, node.typeParameters.range[1] + firstOpeningBracketIndex + 1).includes("\n")) {
          loc.start += 1;
        }
      }

      const lastParam = node.params[node.params.length - 1] as { loc: { end: { line: number } }; range: [number, number] };
      loc.end = lastParam.loc.end.line;

      let sourceCopy = source;

      if (node.returnType) {
        sourceCopy = sourceCopy.slice(0, node.returnType.range[0]);
      }

      const lastClosingBracketIndex = sourceCopy.slice(node.range[0], node.body.range[0]).split("").lastIndexOf(")");

      const closingBracketOnNextLine = sourceCopy
        .slice(lastParam.range[1], node.range[0] + lastClosingBracketIndex)
        .includes("\n");

      if (closingBracketOnNextLine) {
        loc.end += 1;
      }

      perform(node, node, loc, "params");
    };

    return {
      FunctionDeclaration: handleFunction,
      FunctionExpression: handleFunction,
      ArrowFunctionExpression: handleFunction,
      CallExpression: (node: any) => {
        if (node.arguments.length === 0) {
          return;
        }

        let reportNode: { type?: string; loc: { start: { line: number }; end: { line: number } } } = node;

        const loc: Loc = getLoc(node);

        if (node.callee.type === "MemberExpression" && node.callee.property) {
          loc.start = node.callee.property.loc.start.line;
          reportNode = { type: node.callee.property.type, loc: { start: { line: node.callee.property.loc.start.line }, end: { line: node.callee.property.loc.start.line } } };
        } else if (node.callee.type === "CallExpression" && node.callee.loc) {
          loc.start = node.callee.loc.end.line;
        }

        perform(node, reportNode, loc, "arguments");
      }
    };
  },
};

module.exports = rule;
