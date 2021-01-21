import { Campaign, CampaignResult, mapToCampaign } from "./campaign";

export interface ScenarioTable {
  id: string;
  name: string;
  index: number;
  campaign_id: string;
}

export interface ScenarioResult extends CampaignResult {
  scenario: ScenarioTable;
}

export interface Scenario {
  id: string;
  name: string;
  index: number;
  campaign: Campaign;
}

export const mapToScenario = (result: ScenarioResult): Scenario => ({
  id: result.scenario.id,
  name: result.scenario.name,
  index: result.scenario.index,
  campaign: mapToCampaign(result),
});