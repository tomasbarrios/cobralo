import { Eta } from "eta";
import path from "path";

export function render({ template, data }: { template: string, data: {} }) {
  const eta = new Eta({ views: path.join(__dirname, "templates") });

  // Render a template

  const res = eta.render("./" + template, data);
  console.log(res); // Hi Ben!
  return res;
}
