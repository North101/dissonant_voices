import { Campaign, Scenario, Scene } from '../types'
import { useQuery } from '@tanstack/react-query'

export const useFetch = <T>(url: string) => {
  return useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then((res) => res.json()),
    select: (data) => data as unknown as T,
    staleTime: Infinity,
  })
}

export const useCampaignList = () => {
  return useFetch<Campaign[]>(`/api/campaign`)
}

export const useCampaign = (campaignId: string) => {
  return useFetch<Campaign>(`/api/campaign/${campaignId}`)
}

export const useCampaignScenarioList = (campaignId: string) => {
  return useFetch<Scenario[]>(`/api/campaign/${campaignId}/scenario`)
}

export const useScenario = (scenarioId: string) => {
  return useFetch<Scenario>(`/api/scenario/${scenarioId}`)
}

export const useScenarioSceneList = (scenarioId: string) => {
  return useFetch<Scene[]>(`/api/scenario/${scenarioId}/scene`)
}

export const useScene = (sceneId: string) => {
  return useFetch<Scene>(`/api/scene/${sceneId}`)
}
