import encoreBackendConfig from "./encore";
import elysiaBackendConfig from "./elysia";

export interface SkibdiBackendConfig {
    scripts: {
        [key: string]: string;
    };
}

export {
     elysiaBackendConfig,
     encoreBackendConfig
} 