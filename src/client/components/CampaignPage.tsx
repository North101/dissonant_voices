import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import { AppContainer } from './AppContainer'
import { CampaignList } from './CampaignList'
import { useCampaign } from './Data'
import { MainPanel, Panel, SidePanel } from './Panel'
import { ResultView } from './ResultView'
import { ScenarioList } from './ScenarioList'

interface CampaignPageProps {
  campaignId: string
}

export const CampaignPage = ({ campaignId }: CampaignPageProps) => {
  const [campaign] = useCampaign(campaignId)
  return (
    <AppContainer>
      <ResultView result={campaign}>
        {(campaign) => (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>{campaign.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Panel>
              <SidePanel>
                <CampaignList campaignId={campaign.id} />
              </SidePanel>
              <MainPanel>
                <ScenarioList campaignId={campaign.id} />
              </MainPanel>
            </Panel>
          </>
        )}
      </ResultView >
    </AppContainer >
  )
}
