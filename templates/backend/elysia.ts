import type { SkibdiBackendConfig } from ".";

export default {
  scripts: {
    "backend": "cd apps/backend && bun run dev"
  },
} satisfies SkibdiBackendConfig
