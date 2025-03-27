/**
 * IMPORTS
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "@clack/prompts";
import { elysiaBackendConfig, encoreBackendConfig } from "@configs";
import { getTemplatesPath } from "@index";
import { copyDirTemplates } from "@lib/utils";

/**
 * Initializes the backend directory based on the provided configuration
 */
const initbackendDirectory = (config: SkibdiProjectConfig) => {
	const { projectPath, backend } = config;
	const backendDir = join(projectPath, "apps", "backend");

	if (backend === "elysia") {
		copyDirTemplates(
			getTemplatesPath("backend/with-elysia"),
			backendDir,
			config,
		);
		const backendPackageJsonPath = join(backendDir, "package.json");
		const backendPackageJson = JSON.parse(
			readFileSync(backendPackageJsonPath, "utf-8"),
		);

		backendPackageJson.name = "backend";

		backendPackageJson.dependencies = {
			...backendPackageJson.dependencies,
			...elysiaBackendConfig.dependencies,
		};

		backendPackageJson.scripts = {
			...backendPackageJson.scripts,
			...elysiaBackendConfig.scripts,
		};

		writeFileSync(
			backendPackageJsonPath,
			JSON.stringify(backendPackageJson, null, 2),
		);
		log.info("Elysia backend templates copied successfully");
	}
	if (backend === "encore") {
		copyDirTemplates(
			getTemplatesPath("backend/with-encore"),
			backendDir,
			config,
		);
		const backendPackageJsonPath = join(backendDir, "package.json");
		const backendPackageJson = JSON.parse(
			readFileSync(backendPackageJsonPath, "utf-8"),
		);

		backendPackageJson.name = "backend";

		backendPackageJson.dependencies = {
			...backendPackageJson.dependencies,
			...encoreBackendConfig.dependencies,
		};

		backendPackageJson.scripts = {
			...backendPackageJson.scripts,
			...encoreBackendConfig.scripts,
		};

		writeFileSync(
			backendPackageJsonPath,
			JSON.stringify(backendPackageJson, null, 2),
		);
		log.info("Encore backend templates copied successfully");
	}
};

/**
 * EXPORTS
 */
export default initbackendDirectory;
