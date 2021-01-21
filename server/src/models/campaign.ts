export interface CampaignTable {
  id: string;
  name: string;
  index: number;
}

export interface CampaignResult {
  campaign: CampaignTable;
}

export interface Campaign {
  id: string;
  name: string;
  index: number;
}

export const mapToCampaign = (result: CampaignResult): Campaign => ({
  id: result.campaign.id,
  name: result.campaign.name,
  index: result.campaign.index,
});