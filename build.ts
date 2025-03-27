/**
 * IMPORTS
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro, outro, spinner } from "@clack/prompts";
import { build } from "bun";

/**
 * Builds the project by compiling TypeScript files and outputting to the dist directory
 */
try {
	intro("Building project...");

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const outDir = path.join(__dirname, "dist");
	const cliFile = path.join(__dirname, "index.ts");

	const cleanSpin = spinner();
	cleanSpin.start("Cleaning output directory");
	await fs.rm(outDir, { recursive: true, force: true });
	cleanSpin.stop("Output directory cleaned");

	const buildSpin = spinner();
	buildSpin.start("Compiling TypeScript files");
	await build({
		entrypoints: [cliFile],
		splitting: true,
		outdir: outDir,
		target: "node",
	});
	buildSpin.stop("Compilation complete");

	outro("Build completed successfully! ✨");
} catch (error) {
	outro(`Build failed: ${error} ❌`);
}
