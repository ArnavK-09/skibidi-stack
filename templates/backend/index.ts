import elysiaBackendConfig from "./elysia";
import encoreBackendConfig from "./encore";

export interface SkibdiBackendConfig {
	scripts: {
		[key: string]: string;
	};
}

export { elysiaBackendConfig, encoreBackendConfig };
