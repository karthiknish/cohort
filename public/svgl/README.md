# SVGL brand assets

Logos from [svgl.app](https://svgl.app), served from Cloudflare R2 in production.

## Deploy to R2

1. Configure Convex R2 credentials (`R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
2. Run `bun run r2:sync-svgl` (uploads `public/svgl/*` to the `svgl/` prefix).
3. Set `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` to your public R2 domain (custom domain or `r2.dev` URL).

Local dev falls back to `/public/svgl` when `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` is unset.
