import Button from 'react-bootstrap/esm/Button'
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
        <ListGroup style={{flex: 2}}>
          {result.map(item => (
            <ListGroup.Item key={item.id}>
              <Button
                href={`/scenario/${item.id.replaceAll('.', '-')}`}
                variant='link'
                disabled={item.id == scenarioId}
              >
                {item.name}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}
