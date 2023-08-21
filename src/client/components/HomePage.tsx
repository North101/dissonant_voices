import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import { AppContainer } from './AppContainer'
import { CampaignList } from './CampaignList'

export const HomePage = () => (
  <AppContainer>
    <Breadcrumb>
      <Breadcrumb.Item active>Home</Breadcrumb.Item>
    </Breadcrumb>
    <CampaignList />
  </AppContainer>
)
