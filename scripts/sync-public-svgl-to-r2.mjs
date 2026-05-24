#!/usr/bin/env node
/**
 * Uploads /public/svgl assets to Cloudflare R2 under the `svgl/` prefix.
 *
 * Required env:
 * - R2_BUCKET (default: cohort)
 * - R2_ENDPOINT (e.g. https://<account>.r2.cloudflarestorage.com)
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 *
 * Optional:
 * - R2_SVGL_PREFIX (default: svgl)
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const svglDir = path.join(repoRoot, 'public', 'svgl')
const prefix = (process.env.R2_SVGL_PREFIX || 'svgl').replace(/\/$/, '')

const bucket = process.env.R2_BUCKET || 'cohort'
const endpoint = process.env.R2_ENDPOINT
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2 credentials. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.')
  process.exit(1)
}

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

function contentTypeFor(fileName) {
  if (fileName.endsWith('.svg')) return 'image/svg+xml'
  if (fileName.endsWith('.png')) return 'image/png'
  if (fileName.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}

const files = (await readdir(svglDir)).filter((name) => !name.startsWith('.'))

for (const fileName of files) {
  const filePath = path.join(svglDir, fileName)
  const key = `${prefix}/${fileName}`
  const body = await readFile(filePath)

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentTypeFor(fileName),
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  console.log(`uploaded ${key}`)
}

console.log(`Done. Set NEXT_PUBLIC_R2_PUBLIC_BASE_URL to your public R2 domain to serve /svgl/* from R2.`)
