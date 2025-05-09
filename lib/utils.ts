import { spawnSync } from "node:child_process";
/**
 * IMPORTS
 */
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { unwrapSync } from "@arnavk-09/unwrap-go";
import { depVersions } from "@lib/consts";

/**
 * Checks if Bun is installed by attempting to run 'bun --version'
 */
export const isBunInstalled = (): boolean => {
	const result = spawnSync("bunx", ["--version"], {
		stdio: "ignore",
	});

	return result.status === 0;
};

/**
 * Gets the version of a dependency from the depVersions object
 */
export const getDepVersion = (depName: string) => {
	return depVersions[depName] || "latest";
};

/**
 * Converts a full path to a relative path based on the current working directory
 */
export const getRelativePath = (fullPath: string): string => {
	const [, err] = unwrapSync(() =>
		fullPath.split(process.cwd())[1]?.substring(1),
	);
	if (err) return fullPath;
	return fullPath.split(process.cwd())[1]?.substring(1) || fullPath;
};

/**
 * Reads and parses the package.json file from the project directory
 */
export const fetchPackageJson = ({
	projectPath,
}: SkibidiProjectConfig): PackageJson => {
	const packageJsonPath = join(projectPath, "package.json");
	const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
	return JSON.parse(packageJsonContent);
};

/**
 * Writes content to the package.json file in the project directory
 */
export const writePackageJson = (
	content: PackageJson,
	config: SkibidiProjectConfig,
) => {
	const { projectPath } = config;
	const packageJsonPath = join(projectPath, "package.json");
	writeFileSync(packageJsonPath, JSON.stringify(content, null, 2));
};

/**
 * Copies and processes template files from one directory to another
 */
export const copyDirTemplates = (
	templateDir: string,
	to: string,
	data = {},
) => {
	const readdirRecursive = (dir: string): string[] => {
		if (!existsSync(dir)) {
			throw new Error(`Template directory not found: ${dir}`);
		}

		const entries = readdirSync(dir, { withFileTypes: true });

		return entries.reduce<string[]>((files, entry) => {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				return [...files, ...readdirRecursive(fullPath)];
			}
			if (entry.isFile() && entry.name.endsWith(".eta")) {
				return [...files, fullPath];
			}
			return files;
		}, []);
	};

	const files = readdirRecursive(templateDir);

	for (const sourcePath of files) {
		const relativePath = relative(templateDir, sourcePath);
		const destPath = join(to, relativePath.replace(".eta", ""));

		const destDir = dirname(destPath);
		if (!existsSync(destDir)) {
			mkdirSync(destDir, { recursive: true });
		}

		const templateReplacer = (
			template: string,
			data: Record<string, unknown>,
		) => {
			return template.replace(/\{\{([^}]+)\}\}/g, (match, key): string => {
				const trimmedKey = key.trim();
				return `${data[trimmedKey] !== undefined ? data[trimmedKey] : match}`;
			});
		};

		const content = templateReplacer(readFileSync(sourcePath, "utf-8"), data);
		writeFileSync(destPath, content);
	}
};
