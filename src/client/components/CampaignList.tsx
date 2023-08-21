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
            <ListGroup.Item
              key={item.id}
              action
              href={`/campaign/${item.id.replaceAll('.', '-')}`}
              className='text-align-start'
              style={{
                background: item.id == campaignId ? 'rgba(var(--bs-secondary-rgb), var(--bs-text-opacity))' : undefined,
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
