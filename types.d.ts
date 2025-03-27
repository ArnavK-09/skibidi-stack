/**
 * Configuration interface for Skibdi project settings
 */
interface SkibdiProjectConfig {
	projectName: string;
	projectPath: string;
	backend: "elysia" | "encore" | "none";
	styling: "none" | "tailwind" | "unocss";
	features: string[];
}

/**
 * Interface representing the structure of a package.json file
 */
interface PackageJson {
	name: string;
	version: string;
	workspaces: string[];
	scripts: {
		[key: string]: string;
	};
	devDependencies?: {
		[key: string]: string;
	};
}
