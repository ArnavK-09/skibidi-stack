import type { SkibdiBackendConfig } from ".";

export default {
    scripts: {
        "backend": "cd apps/backend && encore run",
        "backend:gen": "cd apps/backend && encore gen client svelte-encore-app-id--output=../frontend/src/lib/client.ts --env=local",
        "backend:gen:prod": "cd apps/backend && encore gen client svelte-encore-app-id--output=../frontend/src/lib/client.ts --env=staging",
        "dev": "bun run backend & bun run frontend",
        "boot": "bunx concurrently 'bun run backend' 'bun run frontend'",
      },
} as SkibdiBackendConfig