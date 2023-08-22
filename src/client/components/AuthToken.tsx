import { BoxArrowInRight, BoxArrowLeft } from 'react-bootstrap-icons'
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

const LogoutButton = () => {
  const onClick = () => {
    setAuthToken('')
    window.close()
  }

  return (
    <Button variant='outline-link' href='#logout' onClick={onClick}>
      <BoxArrowLeft size={24} />
    </Button>
  )
}

const LoginButton = () => {
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

  return (
    <OauthPopup
      title='Dissonant Voices'
      url='/api/authorize?client_id=web'
      width={500}
      height={500}
      onCode={onCode}
      onClose={onClose}
    >
      <Button variant='outline-link' href='#login'>
        <BoxArrowInRight size={24} />
      </Button>
    </OauthPopup>
  )
}

export const AuthButton = () => {
  const token = useAuthToken()
  return token ? <LogoutButton /> : <LoginButton />
}
