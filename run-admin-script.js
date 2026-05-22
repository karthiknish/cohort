import { config } from 'dotenv'

config({ path: '.env.local' })

await import('./dist/scripts/set-admin-role.js')
