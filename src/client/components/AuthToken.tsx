import { Person, PersonLock } from 'react-bootstrap-icons'
import Button from 'react-bootstrap/esm/Button'
import { useCookies } from 'react-cookie'
import OauthPopup from 'react-oauth-popup'
import { CookieSetOptions } from 'universal-cookie'

let globalSetAuthToken: (name: 'token', value: any, options?: CookieSetOptions | undefined) => void = () => {
  throw new Error('you must useAuthToken before setting its state')
}

export const useAuthToken = () => {
  const [cookies, setCookie] = useCookies(['token'])
  globalSetAuthToken = setCookie
  return cookies.token
}

const setAuthToken = (token: string | null) => globalSetAuthToken('token', token, { path: '/' })

export const AuthButton = () => {
  const token = useAuthToken()

  const onCode = async (code: string) => {
    const result = await fetch(`/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'web',
        code,
      }),
    })
    const data = await result.json()
    setAuthToken(data.token)
  }
  const onClose = () => { }

  if (token) {
    const onLogout = () => {
      setAuthToken('')
      window.close()
    }
    return (
      <Button variant='outline-link' href='#logout' onClick={onLogout}>
        <Person />
      </Button>
    )
  } else {
    return <OauthPopup
      title='Dissonant Voices'
      url='/api/authorize?client_id=web'
      width={500}
      height={500}
      onCode={onCode}
      onClose={onClose}
    >
      <Button variant='outline-link' href='#login'>
        <PersonLock />
      </Button>
    </OauthPopup>
  }
}