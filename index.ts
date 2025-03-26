import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { unwrapSync } from "@arnavk-09/unwrap-go";
import {
	cancel,
	intro,
	isCancel,
	multiselect,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import { depVersions } from "./consts";
import { elysiaBackendConfig, encoreBackendConfig } from "./templates/backend";

interface SkibdiProjectConfig {
	projectName: string;
	projectPath: string;
	backend: "elysia" | "encore" | "none";
	styling: "none" | "tailwind" | "unocss";
	features: string[];
}

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

console.clear();

const getDepVersion = (depName: string) => {
	return depVersions[depName] || "latest";
};
const getRelativePath = (fullPath: string): string => {
	const [, err] = unwrapSync(() =>
		fullPath.split(process.cwd())[1]?.substring(1),
	);
	if (err) return fullPath;
	return fullPath.split(process.cwd())[1]?.substring(1) || fullPath;
};
const fetchPackageJson = ({
	projectPath,
}: SkibdiProjectConfig): PackageJson => {
	const packageJsonPath = path.join(projectPath, "package.json");
	const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
	return JSON.parse(packageJsonContent);
};
const writePackageJson = (
	content: PackageJson,
	config: SkibdiProjectConfig,
) => {
	const { projectPath } = config;
	const packageJsonPath = path.join(projectPath, "package.json");
	Bun.write(packageJsonPath, JSON.stringify(content, null, 2));
};

const initPrettier = (config: SkibdiProjectConfig) => {
	const { projectPath } = config;
	const prettierConfigPath = path.join(projectPath, ".prettierrc");
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
			...encoreBackendConfig.scripts,
		};
	}
	if (backend === "elysia") {
		packageJson.scripts = {
			...packageJson.scripts,
			...elysiaBackendConfig.scripts,
		};
	}
	writeFileSync(
		path.join(projectPath, "package.json"),
		JSON.stringify(packageJson, null, 2),
	);
};

const initGhActions = (config: SkibdiProjectConfig) => {
	const { projectPath } = config;
	const ghActionsDir = path.join(projectPath, ".github");
	const workflowsDir = path.join(ghActionsDir, "workflows");

	if (!existsSync(ghActionsDir)) {
		mkdirSync(ghActionsDir, { recursive: true });
	}
	if (!existsSync(workflowsDir)) {
		mkdirSync(workflowsDir, { recursive: true });
	}

	const frontendBuildYml = Bun.file(
		"./templates/gh-actions/frontend-build.yml",
	);
	Bun.write(
		path.join(workflowsDir, "frontend-build.yml"),
		frontendBuildYml.toString(),
	);

	if (config.features.includes("prettier")) {
		const formatCheckYml = Bun.file("./templates/gh-actions/format-check.yml");
		Bun.write(
			path.join(workflowsDir, "format-check.yml"),
			formatCheckYml.toString(),
		);
	}
};

const initFeatures = (config: SkibdiProjectConfig) => {
	const { features } = config;
	if (features.includes("prettier")) {
		initPrettier(config);
	}
	if (features.includes("gh-actions")) {
		initGhActions(config);
	}
};

const initDirectories = (config: SkibdiProjectConfig) => {
	const { projectPath } = config;
	const appsDir = path.join(projectPath, "apps");
	const frontendDir = path.join(appsDir, "frontend");
	const backendDir = path.join(appsDir, "backend");

	mkdirSync(appsDir, { recursive: true });
	mkdirSync(frontendDir, { recursive: true });
	mkdirSync(backendDir, { recursive: true });
};

const initStyling = (config: SkibdiProjectConfig) => {};
const initBasicSetupForProject = (config: SkibdiProjectConfig) => {
	const [, errInitingDirectories] = unwrapSync(() => initDirectories(config));
	if (errInitingDirectories) {
		cancel(`Failed to initiate project:- ${errInitingDirectories.message}`);
		process.exit(1);
	}

	const [, errInitingPackageJson] = unwrapSync(() => initPackageJson(config));
	if (errInitingPackageJson) {
		cancel(
			`Failed to initiate package.json:- ${errInitingPackageJson.message}`,
		);
		process.exit(1);
	}

	const [, errInitingFeatures] = unwrapSync(() => initFeatures(config));
	if (errInitingFeatures) {
		cancel(`Failed to initiate features:- ${errInitingFeatures.message}`);
	}

	const [, errInitingStyling] = unwrapSync(() => initStyling(config));
	if (errInitingStyling) {
		cancel(`Failed to initiate styling:- ${errInitingStyling.message}`);
	}
};

intro("🚀 Skibdi Stack 🚀");

const projectName = await text({
	message: "What is your project name?",
	placeholder: "my-skibdi-app",
	defaultValue: "my-skibdi-app",
	validate(value) {
		if (value.includes(" ")) return "Project name cannot contain spaces!";

		const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
		if (invalidChars.test(value)) {
			return 'Project name contains invalid characters! Cannot use: < > : " / \\ | ? *';
		}
		if (value.startsWith(".") || value.endsWith(".") || value.endsWith(" ")) {
			return "Project name cannot start or end with dots or spaces!";
		}

		return;
	},
});

if (isCancel(projectName)) {
	cancel("Operation cancelled");
	process.exit(0);
}
const randomNo = Math.floor(Math.random() * 1000);
const userSelectedProjectPath = await text({
	message: "Where would you like to create your project?",
	placeholder: existsSync(`./${projectName}`)
		? `./${projectName}-${randomNo}`
		: `./${projectName}`,
	defaultValue: existsSync(`./${projectName}`)
		? `./${projectName}-${randomNo}`
		: `./${projectName}`,
	validate(value) {
		if (existsSync(value)) return "Directory already exists!";
		return;
	},
});
if (isCancel(userSelectedProjectPath)) {
	cancel("Operation cancelled");
	process.exit(0);
}
const projectPath = path.join(process.cwd(), userSelectedProjectPath);
const backend = await select({
	message: "Select your backend framework:",
	options: [
		{
			value: "elysia",
			label: "Elysia - Fast and flexible Bun web framework",
		},
		{
			value: "encore",
			label: "Encore - Development platform for building backends",
		},
		{ value: "none", label: "None - No backend framework" },
	],
});

if (isCancel(backend)) {
	cancel("Operation cancelled");
	process.exit(0);
}

const styling = await select({
	message: "Choose your styling solution:",
	options: [
		{ value: "tailwind", label: "Tailwind CSS - Utility-first CSS framework" },
		{ value: "unocss", label: "UnoCSS - Instant On-demand Atomic CSS" },
		{ value: "none", label: "None - No styling framework" },
	],
});

if (isCancel(styling)) {
	cancel("Operation cancelled");
	process.exit(0);
}

const features = await multiselect({
	message: "Select additional features:",
	options: [
		{ value: "eslint", label: "ESLint", hint: "Code linting" },
		{ value: "prettier", label: "Prettier", hint: "Code formatting" },
		{ value: "gh-actions", label: "General GitHub Actions", hint: "CI/CD" },
	],
	required: false,
	initialValues: ["prettier"],
});

if (isCancel(features)) {
	cancel("Operation cancelled");
	process.exit(0);
}

const projectConfig: SkibdiProjectConfig = {
	projectName,
	projectPath,
	backend,
	styling,
	features,
};

const [, errorSettingProject] = unwrapSync(() =>
	initBasicSetupForProject(projectConfig),
);

if (errorSettingProject) {
	console.error(errorSettingProject);
	cancel(`Failed to initiate project:- ${errorSettingProject.message}`);
	process.exit(1);
}

const installDeps = await select({
	message: "Would you like to install dependencies now?",
	initialValue: "no",
	options: [
		{ value: "yes", label: "Yes - Install dependencies immediately" },
		{ value: "no", label: "No - I'll install them later" },
	],
});

if (isCancel(installDeps)) {
	cancel("Operation cancelled");
	process.exit(0);
}
// note(`
//     Project Configuration Summary:
//           📦 Project Name: ${projectName}
//           📍 Location: ${getRelativePath(projectPath)}
//           🔧 Backend: ${backend}
//           🎨 Styling: ${styling}
//           ✨ Features: ${features?.join(", ") || "None"}
//         `);

const s = spinner();
s.start("Creating project directory");

const [, errorCreatingDir] = unwrapSync(() =>
	mkdirSync(projectPath, { recursive: true }),
);
if (errorCreatingDir) {
	cancel(`Failed to create project directory:- ${errorCreatingDir.message}`);
	process.exit(1);
}

s.stop("Project directory created successfully");

if (installDeps === "yes") {
	s.start("Installing dependencies");

	const [, errInstallingDeps] = unwrapSync(() => {
		Bun.spawnSync({
			cmd: ["bun", "install", ...features],
			cwd: projectPath,
			stdout: "pipe",
			stderr: "pipe",
		});
	});
	if (errInstallingDeps) {
		cancel(
			"Failed to install dependencies. Please try installing them manually with 'bun install'",
		);
	}
	s.stop("Dependencies installed successfully");
}

outro(`🎉 Your project is ready! Next steps:
    1. cd ${getRelativePath(projectPath)}
    2. bun install
    3. bun dev
  `);
process.exit(0);
