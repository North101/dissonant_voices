import { Result } from '../types'
import { CircularProgressIndicator } from './CircularProgressIndicator'

interface ResultViewProps<T> {
  result: Result<T>
  children: (result: T) => React.ReactNode
}

export const ResultView = function <T>({ result, children }: ResultViewProps<T>): React.ReactNode {
  if (result.state === 'loading') {
    return <CircularProgressIndicator />
  } else if (result.state === 'error') {
    return <>'Error'</>
  }

  return children(result.result)
}
