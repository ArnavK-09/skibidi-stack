import path from "node:path";
import { Eta } from "eta";

export const eta = new Eta({ views: path.join(__dirname, "templates") });

eta.render("./frontend/with-elysia/src/lib/api.ts.eta", {});
console.log(eta.render("./frontend/with-elysia/src/lib/api.ts.eta", {}));
