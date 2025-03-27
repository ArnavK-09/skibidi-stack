/**
 * IMPORTS
 */
import { join } from "node:path";
import { fetchPackageJson, getDepVersion, writePackageJson } from "@lib/utils";

/**
 * Initializes Prettier configuration for a Skibidi project
 */
const initPrettier = (config: SkibidiProjectConfig) => {
	const { projectPath } = config;
	const prettierConfigPath = join(projectPath, ".prettierrc");
	Bun.write(
		prettierConfigPath,
		JSON.stringify(
			{
				semi: true,
				arrowParens: "always",
				plugins: ["prettier-plugin-svelte"],
				overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
			},
			null,
			2,
		),
	);

	const packageJson = fetchPackageJson(config);
	packageJson["scripts"] = {
		...packageJson.scripts,
		fmt: "prettier apps --write",
		"fmt:check": "prettier apps --check",
	};
	packageJson["devDependencies"] = {
		...packageJson.devDependencies,
		prettier: getDepVersion("prettier"),
		"prettier-plugin-svelte": getDepVersion("prettier-plugin-svelte"),
	};
	writePackageJson(packageJson, config);
};

/**
 * EXPORTS
 */
export default initPrettier;
