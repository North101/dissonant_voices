export interface Campaign {
  id: string
  name: string
}

export const campaignUrl = (item: Campaign) => `/campaign/${item.id}`

export interface Scenario {
  id: string
  name: string
  campaign: Campaign
}

export const scenarioUrl = (item: Scenario) => `/scenario/${item.id}`

export interface Scene {
  id: string
  name: string
  scenario: Scenario
}

export const sceneUrl = (item: Scene) => `/scene/${item.id}`
