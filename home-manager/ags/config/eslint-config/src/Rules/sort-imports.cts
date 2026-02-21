import type { Rule } from "eslint";

interface ImportNode {
  specifiers: Array<{ type: string }>;
  source: { value: string };
  range: [number, number];
  loc: { start: { line: number }; end: { line: number } };
}

function getSpecifierSignificance(node: ImportNode): number {
  if (node.specifiers.length === 0) {
    return 3_000;
  } else if (node.specifiers[0].type === "ImportNamespaceSpecifier") {
    return 2_000;
  } else if (node.specifiers[0].type === "ImportDefaultSpecifier") {
    return 1_000;
  }

  return 0;
}

function getSourceSignificance(node: ImportNode): number {
  const additionalNumber = getSpecifierSignificance(node);

  const { value } = node.source;

  // Relative imports (./ or ../) - lowest priority
  if (value.startsWith("./") || value.startsWith("../")) {
    let backCount = 0;

    if (value.startsWith("../")) {
      backCount = value.split("../").length;
    }

    return 10_000 + backCount + additionalNumber;
  }

  // Internal absolute imports (shared/, app/, widgets/, etc.)
  if (value.match(/^(shared|app|widgets|entities|features|pages)/)) {
    return 15_000 + additionalNumber;
  }

  // @devops/ packages
  if (value.startsWith("@devops/")) {
    return 20_000 + additionalNumber;
  }

  // External libraries (node_modules) - highest priority (react, react-dom, etc.)
  // Everything else that's not relative, not internal absolute, and not @devops/
  return 30_000 + additionalNumber;
}

function isLineBetween(firstNode: ImportNode, secondNode: ImportNode): boolean {
  return firstNode.loc.end.line < secondNode.loc.start.line - 1;
}

function sortAndFixAllNodes(initial: string, nodes: ImportNode[]): string {
  const rich = nodes.map((node) => [node, initial.substring(node.range[0], node.range[1])] as const);
  const betweens = nodes
    .map((node, i) => i !== (nodes.length - 1) ? initial.substring(node.range[1], nodes[i + 1].range[0]) : null)
    .filter((n): n is string => n !== null);

  // Group by ImportDeclarations that are consecutive (no non-empty lines between)
  const sections = rich.reduce((sections, current) => {
    const lastSection = sections[sections.length - 1];

    if (lastSection.length === 0) {
      lastSection.push(current);
    } else {
      const lastFixed = lastSection[lastSection.length - 1];

      if (isLineBetween(lastFixed[0], current[0])) {
        sections.push([current]);
      } else {
        lastSection.push(current);
      }
    }
    return sections;
  }, [[]] as Array<Array<readonly [ImportNode, string]>>);

  // Sort each grouping
  const sorted = sections.map(section => {
    return section.sort((a, b) => {
      const currentSignificance = getSourceSignificance(b[0]);
      const previousSignificance = getSourceSignificance(a[0]);

      if (currentSignificance > previousSignificance) {
        return 1;
      }

      if (currentSignificance < previousSignificance) {
        return -1;
      }

      // If same significance, sort alphabetically by source
      const aValue = a[0].source.value;
      const bValue = b[0].source.value;
      return aValue.localeCompare(bValue);
    });
  }).reduce((a, c) => a.concat(c), []);

  return sorted.map((n) => n[1])
    .reduce((done, current, i) => (`${done}${i !== 0 ? betweens[i - 1] : ""}${current}`), "");
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce sorted import statements",
    },
    fixable: "code",
    messages: {
      shouldBeSorted: "Imports should be sorted by source",
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();
    const initialSource = sourceCode.getText();
    const importDeclarations = sourceCode.ast.body.filter((n: any) => n.type === "ImportDeclaration") as ImportNode[];

    if (importDeclarations.length === 0) {
      return {};
    }

    // Check if imports are sorted correctly
    let needsSorting = false;
    for (let i = 1; i < importDeclarations.length; i++) {
      const prev = importDeclarations[i - 1];
      const curr = importDeclarations[i];

      // Only check consecutive imports (no empty lines between)
      if (!isLineBetween(prev, curr)) {
        const prevSig = getSourceSignificance(prev);
        const currSig = getSourceSignificance(curr);

        if (currSig > prevSig) {
          needsSorting = true;
          break;
        }

        // If same significance, check alphabetical order
        if (currSig === prevSig) {
          const prevValue = prev.source.value;
          const currValue = curr.source.value;
          if (currValue.localeCompare(prevValue) < 0) {
            needsSorting = true;
            break;
          }
        }
      }
    }

    if (needsSorting) {
      return {
        Program() {
          context.report({
            node: importDeclarations[0] as any,
            messageId: "shouldBeSorted",
            fix(fixer) {
              return fixer.replaceTextRange(
                [importDeclarations[0].range[0], importDeclarations[importDeclarations.length - 1].range[1]],
                sortAndFixAllNodes(initialSource, importDeclarations),
              );
            }
          });
        }
      };
    }

    return {};
  },
};

module.exports = rule;
