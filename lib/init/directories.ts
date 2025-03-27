/**
 * IMPORTS
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Initializes the directory structure for a Skibdi project
 */
const initDirectories = (config: SkibdiProjectConfig) => {
	const { projectPath } = config;
	const appsDir = join(projectPath, "apps");
	const frontendDir = join(appsDir, "frontend");
	const backendDir = join(appsDir, "backend");

	mkdirSync(appsDir, { recursive: true });
	mkdirSync(frontendDir, { recursive: true });
	if (config.backend !== "none") {
		mkdirSync(backendDir, { recursive: true });
	}
};

/**
 * EXPORTS
 */
export default initDirectories;
