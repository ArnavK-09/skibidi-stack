import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
/**
 * IMPORTS
 */
import { getTemplatesPath } from "@/";

/**
 * Initializes GitHub Actions configuration for a Skibdi project
 */
const initGithubActions = (config: SkibdiProjectConfig) => {
	const { projectPath } = config;
	const templateDir = getTemplatesPath("gh-actions");
	const ghActionsDir = join(projectPath, ".github");
	const workflowsDir = join(ghActionsDir, "workflows");

	if (!existsSync(ghActionsDir)) {
		mkdirSync(ghActionsDir, { recursive: true });
	}
	if (!existsSync(workflowsDir)) {
		mkdirSync(workflowsDir, { recursive: true });
	}

	if (!existsSync(templateDir)) {
		throw new Error(
			`Template directory not found: ${templateDir} - ${templateDir} - ${getTemplatesPath()}`,
		);
	}

	const entries = readdirSync(templateDir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isFile()) {
			const sourcePath = join(templateDir, entry.name);
			if (
				entry.name === "format-check.yml" &&
				!config.features.includes("prettier")
			) {
				continue;
			}
			const destPath = join(workflowsDir, entry.name);
			const content = readFileSync(sourcePath, "utf-8");
			writeFileSync(destPath, content);
		}
	}
};

/**
 * EXPORTS
 */
export default initGithubActions;
