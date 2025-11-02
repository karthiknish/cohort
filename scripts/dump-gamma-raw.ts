import 'dotenv/config'

import { gammaService } from '../src/services/gamma'

async function main() {
  const generationId = process.argv[2]
  
  if (!generationId) {
    console.error('Usage: ts-node scripts/dump-gamma-raw.ts <generation-id>')
    process.exit(1)
  }

  if (!process.env.GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY is not configured')
  }

  console.log('[DumpGamma] Fetching generation:', generationId)
  
  const status = await gammaService.getGeneration(generationId)
  
  console.log('\n[DumpGamma] Full raw response:')
  console.log(JSON.stringify(status.raw, null, 2))
  
  console.log('\n[DumpGamma] Parsed status:')
  console.log(JSON.stringify({
    generationId: status.generationId,
    status: status.status,
    webAppUrl: status.webAppUrl,
    shareUrl: status.shareUrl,
    generatedFiles: status.generatedFiles,
  }, null, 2))
}

void main()
