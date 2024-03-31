import ListGroup from 'react-bootstrap/esm/ListGroup'
import { CircularProgressIndicator } from './CircularProgressIndicator'
import { UseQueryResult } from '@tanstack/react-query'

interface ResultViewProps<T> {
  result: UseQueryResult<T, Error>
  children: (result: T) => React.ReactNode
}

export const ResultView = function <T>({ result, children }: ResultViewProps<T>): React.ReactNode {
  if (result.status === 'pending') {
    return <CircularProgressIndicator />
  } else if (result.status === 'error') {
    return <>'Error'</>
  }

  return children(result.data!)
}

interface ResultListViewProps<T> {
  list: UseQueryResult<T[], Error>
  children: (item: T) => React.ReactNode
}

export const ResultListView = function <T>({ list, children }: ResultListViewProps<T>): React.ReactNode {
  return <ResultView result={list}>
    {(value) => (
      <ListGroup>
        {value.map(children)}
      </ListGroup>
    )}
  </ResultView>
}

interface ResultListItemProps extends React.PropsWithChildren {
  className?: string
  href?: string
  active?: boolean
}

export const ResultListItem = function ({ className, href, active = false, children }: ResultListItemProps): React.ReactNode {
  return <ListGroup.Item
    action={href != undefined}
    href={href}
    className={className ?? 'text-align-start'}
    style={{
      background: active ? 'rgba(var(--bs-secondary-rgb), var(--bs-text-opacity))' : undefined,
      '--bs-text-opacity': 1,
    } as {}}
  >
    {children}
  </ListGroup.Item>
}
