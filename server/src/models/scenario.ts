import { Campaign, mapToCampaign } from "./campaign";

export interface Scenario {
  id: string;
  name: string;
  index: number;
  campaign: Campaign;
}

export const mapToScenario = (result: { [key: string]: any }) => ({
  id: result.scenario.id,
  name: result.scenario.name,
  index: result.scenario.index,
  campaign: mapToCampaign(result),
});