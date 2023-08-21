import ListGroup from 'react-bootstrap/esm/ListGroup'
import { useAuthToken } from './AuthToken'
import { useScenarioSceneList } from './Data'
import { ResultView } from './ResultView'

interface SceneListProps {
  scenarioId: string
}

export const SceneList = ({ scenarioId }: SceneListProps) => {
  const token = useAuthToken()
  const [sceneList] = useScenarioSceneList(scenarioId)
  return (
    <ResultView result={sceneList}>
      {(result) => (
        <ListGroup>
          {result.map(item => (
            <ListGroup.Item key={item.id} className='d-flex align-items-center justify-content-between'>
              {item.name}
              <audio
                controls
                preload='none'
                src={token ? `/api/scene/${item.id}/listen` : undefined}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </ResultView>
  )
}
