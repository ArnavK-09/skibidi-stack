import {
  intro,
  outro,
  text,
  select,
  multiselect,
  spinner,
  isCancel,
  cancel,
  note,
} from "@clack/prompts";
import { existsSync, mkdirSync } from "fs";
import { unwrapPromise, unwrapSync } from "@arnavk-09/unwrap-go";
import path from "path";

import { encoreBackendConfig, elysiaBackendConfig } from "./templates/backend";

interface SkibdiBackendConfig {
  projectName: string;
  projectPath: string;
  backend: "elysia" | "encore" | "none";
  styling: "none" | "tailwind" | "unocss";
}

console.clear();

const initPackageJson = ({
  projectName,
  projectPath,
  backend,
}: SkibdiBackendConfig) => {
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    workspaces: ["apps/*"],
    scripts: {
      "fmt": "prettier apps --write",
      "frontend": "cd apps/frontend && bun run dev",
      "frontend:build": "cd apps/frontend && bun run build",
      "dev": "bun run frontend",
    },
  };

  if (backend === "encore") {
    packageJson.scripts = {
      ...packageJson.scripts,
      ...encoreBackendConfig.scripts
    };
  }
  if (backend === "elysia") {
    packageJson.scripts = {
      ...packageJson.scripts,
      ...elysiaBackendConfig.scripts
    };
  }

  Bun.write(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
};

const initMonoRepoDir = (config: SkibdiBackendConfig) => {
  const { projectPath } = config;
  const appsDir = path.join(projectPath, "apps");
  const frontendDir = path.join(appsDir, "frontend");
  const backendDir = path.join(appsDir, "backend");

  mkdirSync(appsDir, { recursive: true });
  mkdirSync(frontendDir, { recursive: true });
  mkdirSync(backendDir, { recursive: true });

}

const initBasicSetupForProject = (config: SkibdiBackendConfig) => {
  initPackageJson(config);
  initMonoRepoDir(config);
};

intro(`🚀 Skibdi Stack 🚀`);

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
    console.log(value);
    // if (value.length === 0) return "Project path is required!";
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
    { value: "typescript", label: "TypeScript", hint: "Recommended" },
    { value: "eslint", label: "ESLint", hint: "Code linting" },
    { value: "prettier", label: "Prettier", hint: "Code formatting" },
    {
      value: "testing",
      label: "Testing Framework",
      hint: "Unit and integration tests",
    },
  ],
  required: false,
});

if (isCancel(features)) {
  cancel("Operation cancelled");
  process.exit(0);
}

const projectConfig: SkibdiBackendConfig = {
  projectName,
  projectPath,
  backend,
  styling,
};

const [, errorSettingProject] = unwrapSync(() =>
  initBasicSetupForProject(projectConfig)
);

if (errorSettingProject) {
  cancel("Failed to initiate project:- " + errorSettingProject.message);
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
    Project Configuration Summary:
          📦 Project Name: ${projectName}
          📍 Location: ${projectPath}
          🔧 Backend: ${backend}
          🎨 Styling: ${styling}
          ✨ Features: ${features?.join(", ") || "None"}
        `);

const s = spinner();
s.start("Creating project directory");

const [, errorCreatingDir] = unwrapSync(() =>
  mkdirSync(projectPath, { recursive: true })
);
if (errorCreatingDir) {
  cancel("Failed to create project directory:- " + errorCreatingDir.message);
  process.exit(1);
}

s.stop("Project directory created successfully");

if (installDeps === "yes") {
  s.start("Installing dependencies");

  const [, errInstallingDeps] = await unwrapPromise(
    new Promise(async (resolve, reject) => {
      const proc = Bun.spawn(["bun", "install", ...features], {
        cwd: projectPath,
        stdout: "pipe",
        stderr: "pipe",
      });
      const output = await new Response(proc.stdout).text();
      const errors = await new Response(proc.stderr).text();

      if (errors) {
        reject(new Error(errors));
      } else {
        resolve(output);
      }
    })
  );
  if (errInstallingDeps) {
    cancel("Failed to install dependencies:- " + errInstallingDeps.message);
    process.exit(1);
  }
  s.stop("Dependencies installed successfully");
}

outro(`🎉 Your project is ready! Next steps:
    1. cd ${projectPath}
    2. bun install
    3. bun dev
  `);
//process.exit(0);
