import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Button from 'react-bootstrap/esm/Button'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Campaign, Result } from '../types'
import { AppContainer } from './AppContainer'
import { useCampaignList } from './Data'
import { ResultView } from './ResultView'

interface CampaignListProps {
  data: Result<Campaign[]>
}

const CampaignList = ({ data }: CampaignListProps) => {
  return (
    <ResultView result={data}>
      {(result) => (
        <ListGroup>
          {result.map(item => (
            <ListGroup.Item key={item.id}>
              <Button href={`/campaign/${item.id.replaceAll('.', '-')}`} variant='link'>{item.name}</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}

export const HomePage = () => {
  const [campaignList] = useCampaignList()
  return (
    <AppContainer>
      <Breadcrumb>
        <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
      </Breadcrumb>
      <CampaignList data={campaignList} />
    </AppContainer>
  )
}
