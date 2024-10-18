import path from 'node:path'
import type { Config } from 'drizzle-kit'

const wranglerConfigPath = path.resolve(__dirname, "./wrangler.toml")

const remoteD1Config = {
    driver: 'd1',
    dbCredentials: {
      wranglerConfigPath,
      dbName: "notes-block-api-database",
    },
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
} satisfies Config;

export { remoteD1Config }
