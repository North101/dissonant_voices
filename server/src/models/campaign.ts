export interface Campaign {
  id: string;
  name: string;
  index: number;
}

export const mapToCampaign = (result: { [key: string]: any }) => ({
  id: result.campaign.id,
  name: result.campaign.name,
  index: result.campaign.index,
});