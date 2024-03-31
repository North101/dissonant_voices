import { scenarioUrl } from '../types'
import { useCampaignScenarioList } from './Data'
import { ResultListItem, ResultListView } from './ResultView'

interface ScenarioListProps {
  campaignId: string
  scenarioId?: string
}

export const ScenarioList = ({ campaignId, scenarioId }: ScenarioListProps) => {
  const scenarioList = useCampaignScenarioList(campaignId)
  return (
    <ResultListView list={scenarioList}>
      {item => (
        <ResultListItem
          key={item.id}
          href={scenarioUrl(item)}
          active={item.id == scenarioId}
        >
          {item.name}
        </ResultListItem>
      )}
    </ResultListView>
  )
}
