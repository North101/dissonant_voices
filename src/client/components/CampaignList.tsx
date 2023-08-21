import Button from 'react-bootstrap/esm/Button'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { useCampaignList } from './Data'
import { ResultView } from './ResultView'

interface CampaignListProps {
  campaignId?: string
}

export const CampaignList = ({ campaignId }: CampaignListProps) => {
  const [campaignList] = useCampaignList()
  return (
    <ResultView result={campaignList}>
      {(result) => (
        <ListGroup>
          {result.map(item => (
            <ListGroup.Item key={item.id}>
              <Button
                href={`/campaign/${item.id.replaceAll('.', '-')}`}
                variant='link'
                disabled={item.id == campaignId}
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
