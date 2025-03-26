import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "bun";

try {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const outDir = path.join(__dirname, "dist");
	const cliFile = path.join(__dirname, "index.ts");

	await fs.rm(outDir, { recursive: true, force: true });

	await build({
		entrypoints: [cliFile],
		splitting: true,
		outdir: outDir,
		target: "node",
	});

	console.log("Build completed successfully.");
} catch (error) {
	console.error(`Build failed: ${error}`);
}
