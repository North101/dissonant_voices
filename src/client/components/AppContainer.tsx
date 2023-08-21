import Container from 'react-bootstrap/esm/Container'
import Nav from 'react-bootstrap/esm/Nav'
import Navbar from 'react-bootstrap/esm/Navbar'
import NavbarCollapse from 'react-bootstrap/esm/NavbarCollapse'
import Stack from 'react-bootstrap/esm/Stack'
import { AuthButton } from './AuthToken'

const Header = () => (
  <Navbar expand='sm' className='bg-body-tertiary' sticky='top'>
    <Container>
      <Navbar.Brand href='/'>Dissonant Voices</Navbar.Brand>
      <Navbar.Toggle />
      <NavbarCollapse>
        <Nav className='d-flex justify-content-start flex-fill'>
          <span className='flex-fill' />
          <AuthButton />
        </Nav>
      </NavbarCollapse>
    </Container>
  </Navbar>
)

interface AppContainerProps extends React.PropsWithChildren { }

export const AppContainer = ({ children }: AppContainerProps) => {
  return (
    <Stack gap={2} className='d-flex h-100'>
      <Header />
      <div className='d-flex flex-fill overflow-auto'>
        <Container>
          {children}
        </Container>
      </div>
      <div />
    </Stack>
  )
}
