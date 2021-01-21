import { mapToScenario, Scenario, ScenarioResult } from "./scenario";

export interface SceneTable {
  id: string;
  name: string;
  ext: string;
  index: number;
  scenario_id: string;
}

export interface SceneResult extends ScenarioResult {
  scene: SceneTable;
}

export interface Scene {
  id: string;
  name: string;
  ext: string;
  index: number;
  scenario: Scenario;
}

export const mapToScene = (result: SceneResult): Scene => ({
  id: result.scene.id,
  name: result.scene.name,
  ext: result.scene.ext,
  index: result.scene.index,
  scenario: mapToScenario(result),
});