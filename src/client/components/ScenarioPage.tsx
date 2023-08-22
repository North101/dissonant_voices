import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import { AppContainer } from './AppContainer'
import { useScenario } from './Data'
import { MainPanel, Panel, SidePanel } from './Panel'
import { ResultView } from './ResultView'
import { ScenarioList } from './ScenarioList'
import { SceneList } from './SceneList'
import { campaignUrl } from '../types'

interface ScenarioPageProps {
  scenarioId: string
}

export const ScenarioPage = ({ scenarioId }: ScenarioPageProps) => {
  const [scenario] = useScenario(scenarioId)
  return (
    <AppContainer>
      <ResultView result={scenario}>
        {(scenario) => (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
              <Breadcrumb.Item href={campaignUrl(scenario.campaign)}>{scenario.campaign.name}</Breadcrumb.Item>
              <Breadcrumb.Item active>{scenario.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Panel>
              <SidePanel>
                <ScenarioList campaignId={scenario.campaign.id} scenarioId={scenario.id} />
              </SidePanel>
              <MainPanel>
                <SceneList scenarioId={scenario.id} />
              </MainPanel>
            </Panel>
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
