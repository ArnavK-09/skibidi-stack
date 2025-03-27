import type { SkibidiBackendConfig } from ".";
import { getDepVersion } from "../lib/utils";

export default {
	monorepo_scripts: {
		backend: "cd apps/backend && bun run dev",
	},
	scripts: {
		dev: "bun run --watch index.ts",
	},
	dependencies: {
		elysia: getDepVersion("elysia"),
	},
	frontend: {
		dependencies: {
			"@elysiajs/eden": getDepVersion("@elysiajs/eden"),
			backend: "workspace:*",
		},
	},
} satisfies SkibidiBackendConfig;
