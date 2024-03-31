import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { CookiesProvider } from 'react-cookie'
import ReactDOM from 'react-dom/client'
import { Route } from 'wouter'
import { CampaignPage } from './components/CampaignPage'
import { HomePage } from './components/HomePage'
import { ScenarioPage } from './components/ScenarioPage'
import './index.css'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CookiesProvider>
      <Route path='/'><HomePage /></Route>
      <Route path='/campaign/:campaignId'>{({ campaignId }) => <CampaignPage campaignId={decodeURI(campaignId)} />}</Route>
      <Route path='/scenario/:scenarioId'>{({ scenarioId }) => <ScenarioPage scenarioId={decodeURI(scenarioId)} />}</Route>
    </CookiesProvider>
  </QueryClientProvider>
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
