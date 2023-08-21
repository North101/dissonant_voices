import SqliteDB from '../db'
import { Campaign, CampaignResult, mapToCampaign } from '../models/campaign'

export default class CampaignService {
  db: SqliteDB

  constructor(db: SqliteDB) {
    this.db = db
  }

  listCampaign(): Campaign[] {
    return this.db.listCampaignStmt.all().map(e => mapToCampaign(e as CampaignResult))
  }

  getCampaignById(campaignId: string): Campaign | null {
    const result = this.db.getCampaignByIdStmt.get({ id: campaignId }) as CampaignResult | null
    if (!result) return null

    return mapToCampaign(result)
  }
}
