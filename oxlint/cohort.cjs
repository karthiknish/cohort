const fs = require("fs");
const path = require("path");

const DIRECT_COLOR_CLASS_RE =
  /(?:^|[^A-Za-z0-9_-])(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|from|via|to|accent|caret|placeholder|divide|outline|shadow|decoration)-(?:\[(?:[^\]]*(?:#|rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color\())[^\]]*\]|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)-\d{2,3}(?:\/\d{1,3})?)(?=$|[^A-Za-z0-9_-])/i;

const DIRECT_COLOR_VALUE_RE =
  /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(|(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blue|brown|coral|crimson|cyan|fuchsia|gold|gray|green|indigo|khaki|lavender|lime|magenta|maroon|navy|olive|orange|orchid|pink|plum|purple|red|salmon|silver|tan|teal|tomato|violet|white|yellow)\b)/i;

const ALLOWED_COLOR_FILE_RE =
  /(?:^|[\\/])src[\\/]lib[\\/]colors\.ts$|(?:^|[\\/])src[\\/]lib[\\/]themes[\\/]/;

const ALLOWED_COLOR_TEMPLATE_RE =
  /(?:^|[\\/])src[\\/]lib[\\/]notifications[\\/]email-templates[\\/]/;

const SHADCN_WRAPPER_FILE_RE =
  /(?:^|[\\/])src[\\/]shared[\\/]/;

const RATE_LIMIT_CONFIG_FILE_RE =
  /(?:^|[\\/])(?:src[\\/]lib[\\/](?:rate-limiter(?:-convex)?|geminiRateLimits)\.ts|convex[\\/].*\.ts)$/;

const ROUTE_FILE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

const ROUTE_BOUNDARY_REQUIREMENTS = [
  {
    messageId: "missingLoading",
    conventions: [{ baseName: "loading", scope: "ancestors" }],
  },
  {
    messageId: "missingError",
    conventions: [
      { baseName: "error", scope: "ancestors" },
      { baseName: "global-error", scope: "root" },
    ],
  },
  {
    messageId: "missingNotFound",
    conventions: [{ baseName: "not-found", scope: "ancestors" }],
  },
];

const routeConventionExistsCache = new Map();

const BANNED_UI_IMPORTS = [
  /^@radix-ui\//,
  /^cmdk$/,
  /^react-day-picker$/,
  /^recharts$/,
  /^sonner$/,
  /^framer-motion$/,
  /^react-resizable-panels$/,
  /^react-leaflet$/,
  /^leaflet$/,
  /^emoji-picker-react$/,
  /^react-syntax-highlighter$/,
  /^react-icons(?:\/|$)/,
  /^@livekit\/components-react$/,
  /^@livekit\/components-styles$/,
  /^driver\.js$/,
];

function normalizeFilename(context) {
  const filename = typeof context.getFilename === "function" ? context.getFilename() : context.filename;
  return String(filename || "").replace(/\\/g, "/");
}

function hasRouteFileExtension(filename) {
  return ROUTE_FILE_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function getRouteConventionBaseName(filename) {
  if (!hasRouteFileExtension(filename)) {
    return null;
  }

  const basename = path.basename(filename);
  for (const extension of ROUTE_FILE_EXTENSIONS) {
    if (basename.endsWith(extension)) {
      return basename.slice(0, -extension.length);
    }
  }

  return null;
}

function getAppRoot(filename) {
  let currentDir = path.dirname(path.normalize(filename));

  while (true) {
    if (path.basename(currentDir) === "app" && path.basename(path.dirname(currentDir)) === "src") {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function isWithinDirectory(targetDir, rootDir) {
  const relativePath = path.relative(rootDir, targetDir);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function isAppPageFile(filename) {
  return getRouteConventionBaseName(filename) === "page" && getAppRoot(filename) !== null;
}

function hasConventionFileInDir(dir, baseName) {
  const cacheKey = `${dir}::${baseName}`;
  if (routeConventionExistsCache.has(cacheKey)) {
    return routeConventionExistsCache.get(cacheKey);
  }

  const exists = ROUTE_FILE_EXTENSIONS.some((extension) => fs.existsSync(path.join(dir, `${baseName}${extension}`)));
  routeConventionExistsCache.set(cacheKey, exists);
  return exists;
}

function hasConventionFileAtOrAbove(startDir, appRoot, baseName) {
  let currentDir = path.normalize(startDir);
  const normalizedAppRoot = path.normalize(appRoot);

  while (isWithinDirectory(currentDir, normalizedAppRoot)) {
    if (hasConventionFileInDir(currentDir, baseName)) {
      return true;
    }

    if (currentDir === normalizedAppRoot) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  return false;
}

function isBoundaryRequirementSatisfied(pageDir, appRoot, requirement) {
  return requirement.conventions.some((convention) => {
    if (convention.scope === "root") {
      return hasConventionFileInDir(appRoot, convention.baseName);
    }

    return hasConventionFileAtOrAbove(pageDir, appRoot, convention.baseName);
  });
}

function isIgnoredColorFile(filename) {
  return ALLOWED_COLOR_FILE_RE.test(filename) || ALLOWED_COLOR_TEMPLATE_RE.test(filename);
}

function isFrameworkColorFile(filename) {
  return (
    /(?:^|[\\/])src[\\/]app[\\/]global-error\.tsx$/.test(filename) ||
    /(?:^|[\\/])src[\\/]app[\\/]manifest\.ts$/.test(filename)
  )
}

function isStyleProperty(node) {
  return (
    node &&
    node.type === "Property" &&
    !node.computed &&
    ((node.key.type === "Identifier" &&
      /^(?:color|backgroundColor|borderColor|outlineColor|textDecorationColor|fill|stroke|caretColor|accentColor|columnRuleColor|boxShadow)$/i.test(
        node.key.name,
      )) ||
      (node.key.type === "Literal" &&
        typeof node.key.value === "string" &&
        /^(?:color|backgroundColor|borderColor|outlineColor|textDecorationColor|fill|stroke|caretColor|accentColor|columnRuleColor|boxShadow)$/i.test(
          node.key.value,
        )))
  );
}

function getLiteralText(node, sourceCode) {
  if (!node) return "";
  if (node.type === "Literal") {
    return typeof node.value === "string" ? node.value : String(node.value ?? "");
  }
  if (node.type === "TemplateLiteral") {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("${}");
  }
  return sourceCode.getText(node);
}

function reportDirectColor(context, node, messageId) {
  context.report({
    node,
    messageId,
  });
}

function createNoDirectColorsRule() {
  return {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow direct color values in component and feature code.",
      },
      messages: {
        directColorClass: "Use semantic shadcn/Tailwind tokens instead of direct color utilities.",
        directColorValue: "Use semantic tokens or CSS variables instead of direct color values.",
      },
    },
    create(context) {
      const filename = normalizeFilename(context);
      if (isIgnoredColorFile(filename) || isFrameworkColorFile(filename)) {
        return {};
      }

      const sourceCode = context.getSourceCode();

      return {
        Literal(node) {
          if (typeof node.value !== "string") {
            return;
          }

          if (/var\(--/i.test(node.value)) {
            return;
          }

          if (DIRECT_COLOR_CLASS_RE.test(node.value)) {
            reportDirectColor(context, node, "directColorClass");
            return;
          }

          if (DIRECT_COLOR_VALUE_RE.test(node.value) && !/var\(--/i.test(node.value) && !/^(?:currentColor|transparent|inherit|initial|unset|revert)$/i.test(node.value)) {
            reportDirectColor(context, node, "directColorValue");
          }
        },
        TemplateElement(node) {
          const text = node.value.cooked ?? node.value.raw;
          if (/var\(--/i.test(text)) {
            return;
          }
          if (DIRECT_COLOR_CLASS_RE.test(text)) {
            reportDirectColor(context, node, "directColorClass");
            return;
          }

          if (DIRECT_COLOR_VALUE_RE.test(text) && !/var\(--/i.test(text)) {
            reportDirectColor(context, node, "directColorValue");
          }
        },
        JSXAttribute(node) {
          if (node.name.type !== "JSXIdentifier") {
            return;
          }

          if (node.name.name !== "style" || !node.value || node.value.type !== "JSXExpressionContainer") {
            return;
          }

          const expression = node.value.expression;
          if (!expression || expression.type !== "ObjectExpression") {
            return;
          }

          for (const property of expression.properties) {
            if (!isStyleProperty(property)) {
              continue;
            }

            const valueNode = property.value;
            const text = getLiteralText(valueNode, sourceCode).trim();
            if (!text) {
              continue;
            }

            if (
              DIRECT_COLOR_VALUE_RE.test(text) ||
              /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\()/i.test(
                text,
              )
            ) {
              reportDirectColor(context, valueNode, "directColorValue");
            }
          }
        },
      };
    },
  };
}

function createOnlyShadcnComponentsRule() {
  return {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow direct imports of non-shadcn UI component libraries outside the shared UI layer.",
      },
      messages: {
        directUiImport:
          "Import the shadcn wrapper from `@/shared/ui/*` instead of using `{{source}}` directly here.",
      },
    },
    create(context) {
      const filename = normalizeFilename(context);
      if (SHADCN_WRAPPER_FILE_RE.test(filename) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filename)) {
        return {};
      }

      function checkSourceLiteral(node) {
        if (!node || node.type !== "Literal" || typeof node.value !== "string") {
          return;
        }

        if (node.value.endsWith("-styles")) {
          return
        }

        if (!BANNED_UI_IMPORTS.some((pattern) => pattern.test(node.value))) {
          return;
        }

        context.report({
          node,
          messageId: "directUiImport",
          data: { source: node.value },
        });
      }

      return {
        ImportDeclaration(node) {
          checkSourceLiteral(node.source);
        },
        ImportExpression(node) {
          checkSourceLiteral(node.source);
        },
      };
    },
  };
}

function createNoAdHocRateLimitRule() {
  const rateLimitPropertyNames = new Set(["maxRequests", "windowMs"])

  return {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow ad hoc rate limit configs outside the shared rate limit modules.",
      },
      messages: {
        adHocRateLimit:
          "Define rate limit presets in `src/lib/rate-limiter.ts` or `src/lib/geminiRateLimits.ts` instead of inlining `{ maxRequests, windowMs }` here.",
      },
    },
    create(context) {
      const filename = normalizeFilename(context);
      if (RATE_LIMIT_CONFIG_FILE_RE.test(filename) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filename)) {
        return {};
      }

      return {
        ObjectExpression(node) {
          const keys = new Set()

          for (const property of node.properties) {
            if (!property || property.type !== "Property" || property.computed) {
              continue
            }

            if (property.key.type === "Identifier") {
              keys.add(property.key.name)
            } else if (property.key.type === "Literal" && typeof property.key.value === "string") {
              keys.add(property.key.value)
            }
          }

          if (rateLimitPropertyNames.has("maxRequests") && rateLimitPropertyNames.has("windowMs")) {
            if (keys.has("maxRequests") && keys.has("windowMs")) {
              context.report({
                node,
                messageId: "adHocRateLimit",
              })
            }
          }
        },
      };
    },
  };
}

function createRequireRouteBoundariesRule() {
  return {
    meta: {
      type: "problem",
      docs: {
        description: "Require App Router pages to be covered by loading, error, and not-found UI.",
      },
      messages: {
        missingLoading:
          "This route page is not covered by a `loading` boundary file in the current segment or an ancestor segment.",
        missingError:
          "This route page is not covered by an `error` boundary file in the current segment or an ancestor segment, and no `global-error` boundary file exists at the app root.",
        missingNotFound:
          "This route page is not covered by a `not-found` boundary file in the current segment or an ancestor segment.",
      },
    },
    create(context) {
      const filename = normalizeFilename(context);
      if (!isAppPageFile(filename) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filename)) {
        return {};
      }

      const appRoot = getAppRoot(filename);
      if (!appRoot) {
        return {};
      }

      const pageDir = path.dirname(path.normalize(filename));

      return {
        Program(node) {
          for (const requirement of ROUTE_BOUNDARY_REQUIREMENTS) {
            if (isBoundaryRequirementSatisfied(pageDir, appRoot, requirement)) {
              continue;
            }

            context.report({
              node,
              messageId: requirement.messageId,
            });
          }
        },
      };
    },
  };
}

module.exports = {
  meta: {
    name: "cohort",
    version: "1.0.0",
  },
  rules: {
    "no-direct-colors": createNoDirectColorsRule(),
    "only-shadcn-components": createOnlyShadcnComponentsRule(),
    "no-ad-hoc-rate-limits": createNoAdHocRateLimitRule(),
    "require-route-boundaries": createRequireRouteBoundariesRule(),
  },
};
