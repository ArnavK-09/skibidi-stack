/**
 * IMPORTS
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { elysiaBackendConfig, encoreBackendConfig } from "@configs";

/**
 * Initializes a package.json file for a Skibdi project
 */
const initPackageJson = ({
	projectName,
	projectPath,
	backend,
}: SkibdiProjectConfig) => {
	const packageJson: PackageJson = {
		name: projectName,
		version: "1.0.0",
		workspaces: ["apps/*"],
		scripts: {
			frontend: "cd apps/frontend && bun run dev",
			"frontend:build": "cd apps/frontend && bun run build",
			dev: "bun run frontend",
		},
	};

	if (backend === "encore") {
		packageJson.scripts = {
			...packageJson.scripts,
			...encoreBackendConfig.monorepo_scripts,
		};
	}
	if (backend === "elysia") {
		packageJson.scripts = {
			...packageJson.scripts,
			...elysiaBackendConfig.monorepo_scripts,
		};
	}
	writeFileSync(
		join(projectPath, "package.json"),
		JSON.stringify(packageJson, null, 2),
	);
};

/**
 * EXPORTS
 */
export default initPackageJson;
