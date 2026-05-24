if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  console.error(
    'Refusing to start the production server with NODE_TLS_REJECT_UNAUTHORIZED=0. Use bun run dev:insecure-tls only for local development.'
  )
  process.exit(1)
}