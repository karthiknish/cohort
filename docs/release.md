# Release and git hooks

Local git hooks (Husky) mirror CI so broken commits are caught before they reach `main`.

## Hooks

| Hook | Command | Purpose |
|------|---------|---------|
| `pre-commit` | `lint-staged` | Biome check + format on staged files only |
| `commit-msg` | `commitlint` | Enforce [Conventional Commits](https://www.conventionalcommits.org/) |
| `pre-push` | `bun run prepush` | `ci:check` + `ci:test` (same static + unit gate as CI, no build) |

Skip hooks when needed (emergency only):

```bash
git commit --no-verify -m "fix: hotfix"
git push --no-verify
```

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run prepush` | Pre-push gate (lint, typecheck, unit tests) |
| `bun run release:gate` | Full pre-release gate: `ci:check` + `ci:test` + `ci:build` |
| `bun run release:gate:fast` | Same without production build |
| `bun run version:patch` | Bump patch in `package.json` (no git tag) |
| `bun run version:minor` | Bump minor |
| `bun run version:major` | Bump major |

## Release workflow

1. Merge to `main` and ensure CI is green.
2. Run the full gate locally:

   ```bash
   bun run release:gate
   ```

3. Bump version and commit:

   ```bash
   bun run version:patch   # or minor / major
   git add package.json
   git commit -m "chore(release): v0.1.1"
   ```

4. Tag and push (triggers the GitHub release workflow):

   ```bash
   git tag v0.1.1
   git push origin main --tags
   ```

## Commit message format

```
<type>(<optional scope>): <subject>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

- `feat(proposals): add deck export`
- `fix(auth): handle expired reset token`
- `chore(release): v0.2.0`

## First-time setup

After `bun install`, the `prepare` script installs Husky hooks automatically.

If hooks are missing:

```bash
bun run prepare
chmod +x .husky/*
```
