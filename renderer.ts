import path from "node:path";
import { Eta } from "eta";

const eta = new Eta({ views: path.join(__dirname, "templates") });

export const render = eta.render;
