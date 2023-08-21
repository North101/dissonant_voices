import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { CookiesProvider } from 'react-cookie'
import ReactDOM from 'react-dom/client'
import { Route } from 'wouter'
import { CampaignPage } from './components/CampaignPage'
import { HomePage } from './components/HomePage'
import { ScenarioPage } from './components/ScenarioPage'
import { ScenePage } from './components/ScenePage'
import './index.css'

const App = () => (
  <CookiesProvider>
    <Route path='/'><HomePage /></Route>
    <Route path='/campaign/:campaignId'>{({ campaignId }) => <CampaignPage campaignId={decodeURI(campaignId)} />}</Route>
    <Route path='/scenario/:scenarioId'>{({ scenarioId }) => <ScenarioPage scenarioId={decodeURI(scenarioId)} />}</Route>
    <Route path='/scene/:sceneId'>{({ sceneId }) => <ScenePage sceneId={decodeURI(sceneId)} />}</Route>
  </CookiesProvider>
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
