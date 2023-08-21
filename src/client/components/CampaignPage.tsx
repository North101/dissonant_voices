import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Button from 'react-bootstrap/esm/Button'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Result, Scenario } from '../types'
import { AppContainer } from './AppContainer'
import { useCampaign, useCampaignScenarioList } from './Data'
import { ResultView } from './ResultView'

interface ScenarioListProps {
  data: Result<Scenario[]>
}

const ScenarioList = ({ data }: ScenarioListProps) => {
  return (
    <ResultView result={data}>
      {(result) => (
        <ListGroup>
          {result.map(item => (
            <ListGroup.Item key={item.id}>
              <Button href={`/scenario/${item.id.replaceAll('.', '-')}`} variant='link'>{item.name}</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}

interface CampaignPageProps {
  campaignId: string
}

export const CampaignPage = ({ campaignId }: CampaignPageProps) => {
  const [campaign] = useCampaign(campaignId)
  const [scenarioList] = useCampaignScenarioList(campaignId)
  return (
    <AppContainer>
      <ResultView result={campaign}>
        {(campaign) => (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
              <Breadcrumb.Item href={`/campaign/${campaign.id.replaceAll('.', '-')}`}>{campaign.name}</Breadcrumb.Item>
            </Breadcrumb>
            <ScenarioList data={scenarioList} />
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
