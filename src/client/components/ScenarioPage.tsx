import Breadcrumb from 'react-bootstrap/esm/Breadcrumb'
import Button from 'react-bootstrap/esm/Button'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Result, Scene } from '../types'
import { AppContainer } from './AppContainer'
import { useScenario, useScenarioSceneList } from './Data'
import { ResultView } from './ResultView'

interface SceneListProps {
  data: Result<Scene[]>
}

const SceneList = ({ data }: SceneListProps) => {
  return (
    <ResultView result={data}>
      {(result) => (
        <ListGroup>
          {result.map(item => (
            <ListGroup.Item key={item.id}>
              <Button href={`/scene/${item.id.replaceAll('.', '-')}`} variant='link'>{item.name}</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}

interface ScenarioPageProps {
  scenarioId: string
}

export const ScenarioPage = ({ scenarioId }: ScenarioPageProps) => {
  const [scenario] = useScenario(scenarioId)
  const [sceneList] = useScenarioSceneList(scenarioId)
  return (
    <AppContainer>
      <ResultView result={scenario}>
        {(scenario) => (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
              <Breadcrumb.Item href={`/campaign/${scenario.campaign.id.replaceAll('.', '-')}`}>{scenario.campaign.name}</Breadcrumb.Item>
              <Breadcrumb.Item href={`/scenario/${scenario.id.replaceAll('.', '-')}`}>{scenario.name}</Breadcrumb.Item>
            </Breadcrumb>
            <SceneList data={sceneList} />
          </>
        )}
      </ResultView>
    </AppContainer>
  )
}
