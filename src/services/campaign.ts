import SqliteDB from "../db";
import { Campaign, mapToCampaign } from "../models/campaign";

export default class CampaignService {
  db: SqliteDB;

  constructor(db: SqliteDB) {
    this.db = db;
  }

  listCampaign(): Campaign[] {
    return this.db.listCampaignStmt.all().map(mapToCampaign);
  }

  getCampaignById(campaignId: string): Campaign | null {
    const result = this.db.getCampaignByIdStmt.get({ id: campaignId });
    if (!result) return null;

    return mapToCampaign(result);
  }
}