import Navbar from "react-bootstrap/esm/Navbar";
import Stack from "react-bootstrap/esm/Stack";

export const SidePanel = ({ children }: React.PropsWithChildren) => (
  <Navbar.Collapse className='align-items-start' style={{ flex: 1 }}>
    <div style={{ flex: 1 }}>
      {children}
    </div>
  </Navbar.Collapse>
)

export const MainPanel = ({ children }: React.PropsWithChildren) => (
  <div style={{ flex: 2 }}>
    {children}
  </div>
)

export const Panel = ({ children }: React.PropsWithChildren) => (
  <Navbar expand="lg" >
    <Stack gap={2} className='d-flex flex-lg-row' >
      <Navbar.Toggle />
      {children}
    </Stack>
  </Navbar>
)
