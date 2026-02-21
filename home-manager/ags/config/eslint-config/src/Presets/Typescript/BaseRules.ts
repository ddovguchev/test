const baseTypescriptRules = {
  // off
  "@typescript-eslint/explicit-function-return-type": "off",
  "@typescript-eslint/no-implied-eval": "off",
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/interface-name-prefix": "off",
  "@typescript-eslint/explicit-module-boundary-types": "off",
  "@typescript-eslint/no-misused-promises": "off",
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
  "@typescript-eslint/no-duplicate-type-constituents": "off",
  "@typescript-eslint/unified-signatures": "off",
  "@typescript-eslint/no-dynamic-delete": "off",
  "@typescript-eslint/no-useless-constructor": "off",
  "@typescript-eslint/prefer-literal-enum-member": "off",
  "@typescript-eslint/prefer-ts-expect-error": "off",
  "@typescript-eslint/no-extraneous-class": "off",
  "@typescript-eslint/no-confusing-void-expression": "off",
  "@typescript-eslint/prefer-reduce-type-parameter": "off",
  "@typescript-eslint/no-unnecessary-type-arguments": "off",
  "@typescript-eslint/no-meaningless-void-operator": "off",
  "@typescript-eslint/no-invalid-void-type": "off",
  "@typescript-eslint/no-unsafe-enum-comparison": "off",
  "@typescript-eslint/no-unsafe-declaration-merging": "off",
  "@typescript-eslint/no-redundant-type-constituents": "off",
  "@typescript-eslint/only-throw-error": "off",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
  "@typescript-eslint/no-unnecessary-condition": "off",

  // warn
  "@typescript-eslint/ban-ts-comment": [
    "warn",
    {
      "ts-expect-error": true,
      "ts-ignore": true,
      "ts-nocheck": true,
      "ts-check": false,
    },
  ],
  "@typescript-eslint/no-restricted-types": [
    "warn",
    {
      types: {
        TImplicitAny: {
          message: [
            "The `TImplicitAny` type is a type alias for `any`.",
            '- If you want a type meaning "any value", you probably want `TExplicitAny` in explicit cases or `unknown` instead.',
          ].join("\n"),
        },
      },
    },
  ],
  "@typescript-eslint/no-deprecated": "warn",
  "@typescript-eslint/no-empty-interface": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-base-to-string": "warn",
  "@typescript-eslint/no-non-null-assertion": "warn",

  // error
  "@typescript-eslint/restrict-plus-operands": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/require-await": "error",
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" }],
  "@stylistic/member-delimiter-style": [
    "error",
    {
      multiline: {
        delimiter: "semi",
        requireLast: true,
      },
      singleline: {
        delimiter: "semi",
        requireLast: true,
      },
    },
  ],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      prefer: "type-imports",
      disallowTypeAnnotations: true,
      fixStyle: "inline-type-imports",
    },
  ],
  "@typescript-eslint/consistent-type-exports": ["error", { fixMixedExportsWithInlineTypeSpecifier: true }],
  "@typescript-eslint/restrict-template-expressions": [
    "error",
    {
      allowAny: false,
      allowBoolean: true,
      allowNullish: false,
      allowNumber: true,
      allowRegExp: false,
    },
  ],
  "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
  "@typescript-eslint/array-type": ["error", { default: "array" }],

        // stylistic rules for TypeScript files
        "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
        "@stylistic/quotes": ["error", "double"],
        "@stylistic/semi": ["error", "always"],

        // custom rules from "rulesdir"
        "rulesdir/type-naming-convention": "error",
        "rulesdir/interface-naming-convention": "error",

        // i18next rules
        "i18next/no-literal-string": [
          "error",
          {
            markupOnly: true,
            onlyAttribute: false,
            ignore: [
              "className",
              "class",
              "id",
              "data-testid",
              "data-cy",
              "aria-label",
              "aria-labelledby",
              "aria-describedby",
              "role",
              "type",
              "name",
              "for",
              "href",
              "src",
              "alt",
              "title",
              "placeholder",
              "value",
            ],
          },
        ],
        "i18next/no-raw-text": "off",
      } as const;

export { baseTypescriptRules };

