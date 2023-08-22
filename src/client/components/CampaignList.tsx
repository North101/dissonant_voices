import { campaignUrl } from '../types'
import { useCampaignList } from './Data'
import { ResultListItem, ResultListView } from './ResultView'

interface CampaignListProps {
  campaignId?: string
}

export const CampaignList = ({ campaignId }: CampaignListProps) => {
  const [campaignList] = useCampaignList()
  return (
    <ResultListView list={campaignList}>
      {item => (
        <ResultListItem
          key={item.id}
          href={campaignUrl(item)}
          active={item.id == campaignId}
        >
          {item.name}
        </ResultListItem>
      )}
    </ResultListView>
  )
}
