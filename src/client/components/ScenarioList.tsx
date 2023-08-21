import ListGroup from 'react-bootstrap/esm/ListGroup'
import { useCampaignScenarioList } from './Data'
import { ResultView } from './ResultView'

interface ScenarioListProps {
  campaignId: string
  scenarioId?: string
}

export const ScenarioList = ({ campaignId, scenarioId }: ScenarioListProps) => {
  const [scenarioList] = useCampaignScenarioList(campaignId)
  return (
    <ResultView result={scenarioList}>
      {(result) => (
        <ListGroup style={{ flex: 1 }}>
          {result.map(item => (
            <ListGroup.Item
              key={item.id}
              href={`/scenario/${item.id.replaceAll('.', '-')}`}
              action
              className='text-align-start'
              style={{
                background: item.id == scenarioId ? 'rgba(var(--bs-secondary-rgb), var(--bs-text-opacity))' : undefined,
                '--bs-text-opacity': 1,
              } as {}}
            >
              {item.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}
