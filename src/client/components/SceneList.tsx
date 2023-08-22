import { fixUrl, sceneUrl } from '../types'
import { useAuthToken } from './AuthToken'
import { useScenarioSceneList } from './Data'
import { ResultListItem, ResultListView } from './ResultView'

interface SceneListProps {
  scenarioId: string
}

export const SceneList = ({ scenarioId }: SceneListProps) => {
  const token = useAuthToken()
  const [sceneList] = useScenarioSceneList(scenarioId)
  return (
    <ResultListView list={sceneList}>
      {item => (
        <ResultListItem
          key={item.id}
          className='d-flex align-items-center justify-content-between'
          href={''}
          active={false}
        >
          {item.name}
          <audio
            controls
            preload='none'
            src={token ? fixUrl(`/api/scene/${item.id}/listen`) : undefined}
          />
        </ResultListItem>
      )}
    </ResultListView>
  )
}
