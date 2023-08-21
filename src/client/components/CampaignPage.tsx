import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Stack from 'react-bootstrap/esm/Stack'
import { AppContainer } from './AppContainer'
import { CampaignList } from './CampaignList'
import { useCampaign, useCampaignList, useCampaignScenarioList } from './Data'
import { ResultView } from './ResultView'
import { ScenarioList } from './ScenarioList'
import Navbar from 'react-bootstrap/esm/Navbar'
import Container from 'react-bootstrap/esm/Container'

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
            <Navbar expand="lg" >
              <Stack gap={2} className='d-flex flex-lg-row' >
                <Navbar.Toggle />
                <Navbar.Collapse className='align-items-start' style={{ flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <CampaignList campaignId={campaign.id} />
                  </div>
                </Navbar.Collapse>
                <div style={{ flex: 2 }}>
                  <ScenarioList campaignId={campaign.id} />
                </div>
              </Stack>
            </Navbar>
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
