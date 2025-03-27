import elysiaBackendConfig from "./elysia";
import encoreBackendConfig from "./encore";

export interface SkibdiBackendConfig {
	monorepo_scripts: {
		[key: string]: string;
	};
	scripts?: {
		[key: string]: string;
	};
	dependencies?: {
		[key: string]: string;
	};
	backend?: {
		dependencies: {
			[key: string]: string;
		};
	};
}

export { elysiaBackendConfig, encoreBackendConfig };
