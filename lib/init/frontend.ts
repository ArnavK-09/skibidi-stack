/**
 * IMPORTS
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log, spinner } from "@clack/prompts";
import { elysiaBackendConfig, encoreBackendConfig } from "@configs";
import { getTemplatesPath } from "@index";
import { copyDirTemplates } from "@lib/utils";

/**
 * Initializes a new Svelte frontend project directory with specific backend configurations
 */
const initFrontendDirectory = (config: SkibidiProjectConfig) => {
	const { projectPath } = config;
	const frontendDir = join(projectPath, "apps", "frontend");

	const s = spinner();
	s.start("Initializing Svelte project");

	copyDirTemplates(getTemplatesPath("frontend/base"), frontendDir, config);

	s.stop("Svelte project initialized successfully");

	if (config.backend === "elysia") {
		const frontendPackageJsonPath = join(frontendDir, "package.json");
		const frontendPackageJson = JSON.parse(
			readFileSync(frontendPackageJsonPath, "utf-8"),
		);

		frontendPackageJson.dependencies = {
			...frontendPackageJson.dependencies,
			...elysiaBackendConfig.frontend.dependencies,
		};

		writeFileSync(
			frontendPackageJsonPath,
			JSON.stringify(frontendPackageJson, null, 2),
		);
		copyDirTemplates(
			getTemplatesPath("frontend/with-elysia"),
			frontendDir,
			config,
		);

		log.info("Elysia frontend templates copied successfully");
	}
	if (config.backend === "encore") {
		const frontendPackageJsonPath = join(frontendDir, "package.json");
		const frontendPackageJson = JSON.parse(
			readFileSync(frontendPackageJsonPath, "utf-8"),
		);

		frontendPackageJson.dependencies = {
			...frontendPackageJson.dependencies,
			...encoreBackendConfig.frontend.dependencies,
		};

		writeFileSync(
			frontendPackageJsonPath,
			JSON.stringify(frontendPackageJson, null, 2),
		);
		copyDirTemplates(
			getTemplatesPath("frontend/with-encore"),
			frontendDir,
			config,
		);

		log.info("Encore frontend templates copied successfully");
	}
};

/**
 * EXPORTS
 */
export default initFrontendDirectory;
