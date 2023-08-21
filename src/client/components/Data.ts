import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Campaign, Result, Scenario, Scene } from '../types'

export const useFetch = <T>(url: string): [Result<T>, Dispatch<SetStateAction<Result<T>>>] => {
  const [data, setData] = useState<Result<T>>({
    state: 'loading',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(url)
        if (result.ok) {
          setData({
            state: 'success',
            result: await result.json(),
          })
        } else {
          setData({
            state: 'error',
          })
        }
      } catch (error) {
        setData({
          state: 'error',
        })
      }
    }

    fetchData()
  }, [url])

  return [data, setData]
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
