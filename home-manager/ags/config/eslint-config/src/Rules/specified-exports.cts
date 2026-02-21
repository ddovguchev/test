import type { Rule } from "eslint";

interface NamedExport {
  declaration?: {
    declarations?: Array<{ id: { name: string } }>;
    id: { name: string };
  };
  exportKind: "type" | "value";
}

interface SpecifiedExport {
  specifiers: Array<{ local: { name: string }; exported: { name: string } }>;
  exportKind: "type" | "value";
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using specified exports instead of named exports",
    },
    fixable: "code",
    messages: {
      onlyOneSpecified: "Only one specified export allowed",
      useSpecified: "Named exports are not allowed. Use specified export instead",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    const lastNode = sourceCode.ast.body[sourceCode.ast.body.length - 1];
    const namedExports: { type: NamedExport[]; value: NamedExport[] } = { type: [], value: [] };
    const specifiedExports: { type: SpecifiedExport[]; value: SpecifiedExport[] } = { type: [], value: [] };

    sourceCode.ast.body.forEach((n: any) => {
      if (n.type === "ExportNamedDeclaration" && n.declaration) {
        const kind = n.exportKind as "type" | "value";
        namedExports[kind].push(n);
      }
    });

    sourceCode.ast.body.forEach((n: any) => {
      if (n.type === "ExportNamedDeclaration" && !n.declaration && !n.source) {
        const kind = n.exportKind as "type" | "value";
        specifiedExports[kind].push(n);
      }
    });

    return {
      ExportNamedDeclaration(node: any) {
        if (Object.values(specifiedExports).some((s) => s.length > 1)) {
          context.report({
            node,
            messageId: "onlyOneSpecified",
          });
        }

        if (node.declaration) {
          context.report({
            node: node as any,
            messageId: "useSpecified",
            fix(fixer) {
              const kind = node.exportKind as "type" | "value";
              const specifiedExport = specifiedExports[kind].length > 0 ? specifiedExports[kind][0] : null;
              const last = namedExports[kind].length > 0 && namedExports[kind][namedExports[kind].length - 1] === node;

              const exportPostfix = node.exportKind === "type"
                ? " type"
                : "";

              const fixers = [
                fixer.replaceText(node, sourceCode.getText(node).split("export ").slice(1).join("")),
              ];

              if (last) {
                const names = namedExports[kind]
                  .map((declaration: any) => {
                    if (declaration.declaration?.declarations) {
                      return declaration.declaration.declarations.map((d: any) => d.id.name);
                    } else if (declaration.declaration?.id) {
                      return declaration.declaration.id.name;
                    }
                    return [];
                  })
                  .reduce((acc: string[], cur: any) => {
                    if (Array.isArray(cur)) {
                      return [...acc, ...cur];
                    } else {
                      return [...acc, cur];
                    }
                  }, []);

                if (specifiedExport) {
                  fixers.push(fixer.remove(specifiedExport));

                  names.unshift(...specifiedExport.specifiers.map((specifier: any) => {
                    if (specifier.local.name === specifier.exported.name) {
                      return specifier.local.name;
                    } else {
                      return `${specifier.local.name} as ${specifier.exported.name}`;
                    }
                  }));
                }

                fixers.push(fixer.insertTextAfter(lastNode, `\n\nexport${exportPostfix} { ${names.join(", ")} };`));
              }

              return fixers;
            }
          });
        }
      },
    };
  },
};

module.exports = rule;
