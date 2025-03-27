import elysiaBackendConfig from "./elysia";
import encoreBackendConfig from "./encore";

export interface SkibidiBackendConfig {
	// scripts to add in monorepo config
	monorepo_scripts: {
		[key: string]: string;
	};
	// scripts to add in backend package.json
	scripts?: {
		[key: string]: string;
	};
	// dep req in backend to be added in backend package.json
	dependencies?: {
		[key: string]: string;
	};
	frontend?: {
		// dep req in frontend to access this backend
		dependencies: {
			[key: string]: string;
		};
	};
}

export { elysiaBackendConfig, encoreBackendConfig };
