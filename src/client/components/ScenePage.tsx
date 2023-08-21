import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Container from 'react-bootstrap/esm/Container'
import { AppContainer } from './AppContainer'
import { useAuthToken } from './AuthToken'
import { useScene } from './Data'
import { ResultView } from './ResultView'

interface ScenePageProps {
  sceneId: string
}

export const ScenePage = ({ sceneId }: ScenePageProps) => {
  const token = useAuthToken()
  const [scene] = useScene(sceneId)
  return (
    <AppContainer>
      <ResultView result={scene}>
        {(scene) => (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
              <Breadcrumb.Item href={`/campaign/${scene.scenario.campaign.id.replaceAll('.', '-')}`}>{scene.scenario.campaign.name}</Breadcrumb.Item>
              <Breadcrumb.Item href={`/scenario/${scene.scenario.id.replaceAll('.', '-')}`}>{scene.scenario.name}</Breadcrumb.Item>
              <Breadcrumb.Item href={`/scenario/${scene.id.replaceAll('.', '-')}`}>{scene.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Container className='d-flex align-items-center justify-content-center h-100'>
              <audio controls src={token ? `/api/scene/${scene.id}/listen` : undefined} />
            </Container>
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
