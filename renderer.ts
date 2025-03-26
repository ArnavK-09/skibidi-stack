import { Eta } from "eta";
import path from "path";

const eta = new Eta({ views: path.join(__dirname, "templates") });

export const render =  eta.render