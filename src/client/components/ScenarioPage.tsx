import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Stack from 'react-bootstrap/esm/Stack'
import { AppContainer } from './AppContainer'
import { useScenario } from './Data'
import { ResultView } from './ResultView'
import { ScenarioList } from './ScenarioList'
import { SceneList } from './SceneList'
import Navbar from 'react-bootstrap/esm/Navbar'

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
              <Breadcrumb.Item href={`/campaign/${scenario.campaign.id.replaceAll('.', '-')}`}>{scenario.campaign.name}</Breadcrumb.Item>
              <Breadcrumb.Item active>{scenario.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Navbar expand="lg" >
              <Stack gap={2} className='d-flex flex-lg-row' >
                <Navbar.Toggle />
                <Navbar.Collapse className='align-items-start' style={{ flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <ScenarioList campaignId={scenario.campaign.id} scenarioId={scenario.id} />
                  </div>
                </Navbar.Collapse>
                <div style={{ flex: 2 }}>
                  <SceneList scenarioId={scenario.id} />
                </div>
              </Stack>
            </Navbar>
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
