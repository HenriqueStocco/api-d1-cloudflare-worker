import { z } from 'zod'

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),
})

export const env = envSchema.parse(process.env)
