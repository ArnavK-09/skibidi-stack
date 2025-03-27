#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { unwrapSync } from "@arnavk-09/unwrap-go";
import {
	cancel,
	intro,
	isCancel,
	log,
	multiselect,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import {
	initDirectories,
	initEslint,
	initFrontend,
	initGithubActions,
	initPackageJson,
	initPrettier,
	initStyling,
} from "@lib/init";
import initbackendDirectory from "@lib/init/backend";
import { getRelativePath } from "@lib/utils";
import figlet from "figlet";
import kleur from "kleur";

export const getTemplatesPath = (route = ".") => {
	const packageRoot = dirname(new URL(import.meta.url).pathname).replace(
		/^\/([A-Za-z]):/,
		"$1:",
	);
	return join(packageRoot, "templates", route);
};

console.clear();

const initFeatures = (config: SkibdiProjectConfig) => {
	const { features } = config;
	if (features.includes("prettier")) {
		initPrettier(config);
	}
	if (features.includes("gh-actions")) {
		initGithubActions(config);
	}
	if (features.includes("eslint")) {
		initEslint(config);
	}
};

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
	const [, errInitingFrontend] = unwrapSync(() => initFrontend(config));
	if (errInitingFrontend) {
		cancel(
			`Failed to initiate frontend directory:- ${errInitingFrontend.message}`,
		);
	}

	const [, errInitingBackend] = unwrapSync(() => initbackendDirectory(config));
	if (errInitingBackend) {
		cancel(
			`Failed to initiate backend directory:- ${errInitingBackend.message}`,
		);
	}
	const [, errInitingStyling] = unwrapSync(() => initStyling(config));
	if (errInitingStyling) {
		cancel(`Failed to initiate styling:- ${errInitingStyling.message}`);
	}
};

intro(
	`\n${kleur.cyan(
		figlet.textSync("Skibdi Stack", {
			font: "Small",
			horizontalLayout: "fitted",
			verticalLayout: "fitted",
		}),
	)}`,
);

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
const projectPath = join(process.cwd(), userSelectedProjectPath);
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
note(`
📦 Project: ${projectName}
📍 Location: ${getRelativePath(projectPath)}
🔧 Backend: ${backend}
🎨 Styling: ${styling}
✨ Features: ${features?.join(", ") || "none"}
`);

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
		spawnSync("bun", ["install", ...features], {
			cwd: projectPath,
			stdio: "pipe",
		});
	});
	if (errInstallingDeps) {
		cancel(
			"Failed to install dependencies. Please try installing them manually with 'bun install'",
		);
	}
	s.stop("Dependencies installed successfully");
}

outro(
	`\n🎉 Your project is ready! Next steps:
    1. cd ${getRelativePath(projectPath)}
    2. bun install
    3. bun dev
  `,
);
process.exit(0);
