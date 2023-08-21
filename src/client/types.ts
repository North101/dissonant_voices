export interface LoadingResult {
  state: 'loading'
}

export interface SuccessResult<R> {
  state: 'success'
  result: R
}

export interface ErrorResult {
  state: 'error'
}

export type Result<R> = LoadingResult | SuccessResult<R> | ErrorResult

export interface Campaign {
  id: string
  name: string
}

export interface Scenario {
  id: string
  name: string
  campaign: Campaign
}

export interface Scene {
  id: string
  name: string
  scenario: Scenario
}
