export const fixUrl = (url: string) => url.replaceAll('.', '-')

export interface LoadingResult {
  state: 'loading'
}

export interface SuccessResult<R> {
  state: 'success'
  value: R
}

export interface ErrorResult {
  state: 'error'
}

export type Result<R> = LoadingResult | SuccessResult<R> | ErrorResult

export interface Campaign {
  id: string
  name: string
}

export const campaignUrl = (item: Campaign) => fixUrl(`/campaign/${item.id}`)

export interface Scenario {
  id: string
  name: string
  campaign: Campaign
}

export const scenarioUrl = (item: Scenario) => fixUrl(`/scenario/${item.id}`)

export interface Scene {
  id: string
  name: string
  scenario: Scenario
}

export const sceneUrl = (item: Scene) => fixUrl(`/scene/${item.id}`)
