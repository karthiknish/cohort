#!/usr/bin/env node
/**
 * Collapse adjacent `w-*` + `h-*` with identical tokens to `size-*` (Tailwind 3.4+).
 * Matches react-doctor rule design-no-redundant-size-axes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exts = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"]);
const skipDirs = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
]);

const token = String.raw`(?:[\w.%-]+|\[[^\]]*\])`;
/** Space, quotes, or backtick — common boundaries around Tailwind classes */
const boundary = String.raw`[\s"'\x60]`;

function collapsePair(text) {
  let prev;
  let next = text;
  const wThenH = new RegExp(
    `(^|${boundary})w-(${token})\\s+h-\\2(${boundary}|$)`,
    "g",
  );
  const hThenW = new RegExp(
    `(^|${boundary})h-(${token})\\s+w-\\2(${boundary}|$)`,
    "g",
  );
  do {
    prev = next;
    next = prev.replace(wThenH, "$1size-$2$3");
    next = next.replace(hThenW, "$1size-$2$3");
  } while (next !== prev);
  return next;
}

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (skipDirs.has(ent.name)) continue;
      walk(p, files);
    } else if (exts.has(path.extname(ent.name))) {
      files.push(p);
    }
  }
  return files;
}

const root = process.argv[2] ?? path.join(__dirname, "..");
const srcRoot = path.join(root, "src");
if (!fs.existsSync(srcRoot)) {
  console.error("No src/ under", root);
  process.exit(1);
}

let changedFiles = 0;
let totalReplacements = 0;

for (const file of walk(srcRoot)) {
  const before = fs.readFileSync(file, "utf8");
  const after = collapsePair(before);
  if (after !== before) {
    const delta = before.length - after.length;
    totalReplacements += Math.max(0, Math.round(delta / 4));
    fs.writeFileSync(file, after);
    changedFiles++;
    console.log(file);
  }
}

console.error(`Updated ${changedFiles} files (approx shrink ${totalReplacements})`);
