import { mapToScenario, Scenario } from "./scenario";

export interface Scene {
  id: string;
  name: string;
  ext: string;
  index: number;
  scenario: Scenario;
}

export const mapToScene = (result: { [key: string]: any }) => ({
  id: result.scene.id,
  name: result.scene.name,
  ext: result.scene.ext,
  index: result.scene.index,
  scenario: mapToScenario(result),
});