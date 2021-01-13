import React, { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import OauthPopup from 'react-oauth-popup';
import {
  BrowserRouter as Router,
  Link,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { singletonHook } from 'react-singleton-hook';
import { CookieSetOptions } from 'universal-cookie';

let globalSetAuthToken: (name: string, value: any, options?: CookieSetOptions | undefined) => void = () => {
  throw new Error('you must useAuthToken before setting its state');
};

const useAuthToken = singletonHook(null, () => {
  const [cookies, setCookie] = useCookies(['token']);
  globalSetAuthToken = setCookie;
  return cookies.token;
});

const setAuthToken = (token: string | null) => globalSetAuthToken('token', token, { path: '/' });

interface BreadCrumbProps {
  title: string;
  url: string;
  state: {
    [key: string]: any;
  };
}

const BreadCrumbView = ({title, url, state}: BreadCrumbProps) => {
  return <span className="breadcrumb">
    <Link to={{ pathname: url, state: state }}>{title}</Link>
  </span>;
}

interface Campaign {
  id: string;
  name: string;
}

interface Scenario {
  id: string;
  name: string;
  campaign: Campaign;
}

interface Scene {
  id: string;
  name: string;
  scenario: Scenario;
}

const CampaignListView = () => {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch('/api/campaign');
        if (result.status === 200) {
          setCampaignList(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  let body;
  if (isLoading) {
    body = <></>;
  } else if (isError) {
    body = <>Error</>;
  } else {
    body = <ol>
      {campaignList.map((campaign) => <CampaignItemView key={campaign.id} campaign={campaign} />)}
    </ol>
  }

  return <div className="wrapper">
    <LoginButton />
    <div className="underline">
      <h1>Campaigns</h1>
    </div>
    {body}
  </div>;
}

const CampaignItemView = ({ campaign }: { campaign: Campaign }) => {
  return <li><Link to={{ pathname: `/campaign/${campaign.id}`, state: { campaign } }}>{campaign.name}</Link></li>;
}

interface CampaignParams {
  campaignId: string;
}
interface CampaignState {
  campaign: Campaign | undefined;
}
interface CampaignProps extends RouteComponentProps<CampaignParams, {}, CampaignState> {}

const CampaignView = (props: CampaignProps) => {
  const { campaignId } = props.match.params;
  const [campaign, setCampaign] = useState<Campaign | undefined>(props.location.state.campaign);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (campaign !== undefined) return;

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch(`/api/campaign/${campaignId}`);
        if (result.status === 200) {
          setCampaign(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [campaign, campaignId]);

  let body;
  if (isLoading) {
    body = <></>;
  } else if (isError || campaign === undefined) {
    body = <>Error</>;
  } else {
    body = <div>
      <div className="underline">
        <h1>{campaign.name}</h1>
        <div>
          <BreadCrumbView title='Home' url='/'state={{}}/>
        </div>
      </div>
      <ScenarioListView campaignId={campaignId} />
    </div>;
  }

  return <div className="wrapper">
    <LoginButton />
    {body}
  </div>;
}

const ScenarioListView = ({ campaignId }: { campaignId: string }) => {
  const [scenarioList, setScenarioList] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch(`/api/campaign/${campaignId}/scenario`);
        if (result.status === 200) {
          setScenarioList(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [campaignId]);
  if (isLoading) {
    return <></>;
  } else if (isError) {
    return <>Error</>;
  }

  return <ol>
    {scenarioList.map((scenario) => <ScenarioItemView key={scenario.id} scenario={scenario} />)}
  </ol>;
}

const ScenarioItemView = ({ scenario }: { scenario: Scenario }) => {
  return <li>
    <Link to={{ pathname: `/scenario/${scenario.id}`, state: { scenario } }}>{scenario.name}</Link>
  </li>;
}

interface ScenarioParams {
  scenarioId: string;
}
interface ScenarioState {
  scenario: Scenario | undefined;
}
interface ScenarioProps extends RouteComponentProps<ScenarioParams, {}, ScenarioState> {}

const ScenarioView = (props: ScenarioProps) => {
  const { scenarioId } = props.match.params;
  const [scenario, setScenario] = useState<Scenario | undefined>(props.location.state.scenario);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (scenario !== undefined) return;

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch(`/api/scenario/${scenarioId}`);
        if (result.status === 200) {
          setScenario(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [scenario, scenarioId]);

  let body;
  if (isLoading) {
    body = <></>;
  } else if (isError || scenario === undefined) {
    body = <>Error</>;
  } else {
    const { campaign } = scenario;
    body = <div>
      <div className="underline">
        <h1>{scenario.name}</h1>
        <div>
          <BreadCrumbView title='Home' url='/'state={{}}/>
          <BreadCrumbView title={campaign.name} url={`/campaign/${campaign.id}`} state={{ campaign }}/>
        </div>
      </div>
      <SceneListView scenarioId={scenarioId} />
    </div>;
  }

  return <div className="wrapper">
    <LoginButton />
    {body}
  </div>;
}

const SceneListView = ({ scenarioId }: { scenarioId: string }) => {
  const [sceneList, setSceneList] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch(`/api/scenario/${scenarioId}/scene`);
        if (result.status === 200) {
          setSceneList(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [scenarioId]);
  if (isLoading) {
    return <></>;
  } else if (isError) {
    return <>Error</>;
  }

  return <ol>
    {sceneList.map((scene) => <SceneItemView key={scene.id} scene={scene} />)}
  </ol>;
}

const SceneItemView = ({ scene }: { scene: Scene }) => {
  return <li>
    <Link to={{ pathname: `/scene/${scene.id}`, state: { scene } }}>{scene.name}</Link>
  </li>;
}

interface SceneParams {
  sceneId: string;
}
interface SceneState {
  scene: Scene | undefined;
}
interface SceneProps extends RouteComponentProps<SceneParams, {}, SceneState> {}

const SceneView = (props: SceneProps) => {
  const { sceneId } = props.match.params;
  const [scene, setScene] = useState<Scene | undefined>(props.location.state.scene);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const token = useAuthToken();

  useEffect(() => {
    if (scene !== undefined) return;

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await fetch(`/api/scene/${sceneId}`);
        if (result.status === 200) {
          setScene(await result.json());
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [scene, sceneId]);

  let body;
  if (isLoading) {
    body = <></>;
  } else if (isError || scene === undefined) {
    body = <>Error</>;
  } else {
    const { scenario } = scene;
    const { campaign } = scenario;

    body = <div>
      <div className="underline">
        <h1>{scene.name}</h1>
        <div>
          <BreadCrumbView title='Home' url='/'state={{}}/>
          <BreadCrumbView title={campaign.name} url={`/campaign/${campaign.id}`} state={{ campaign }}/>
          <BreadCrumbView title={scenario.name} url={`/scenario/${scenario.id}`} state={{ scenario }}/>
        </div>
      </div>
      <audio controls src={token ? `/api/scene/${scene.id}/listen` : ''} />
    </div>;
  }

  return <div className="wrapper">
    <LoginButton />
    {body}
  </div>;
}

const LoginButton = () => {
  const token = useAuthToken();

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
    });
    const data = await result.json();
    setAuthToken(data.token);
  }
  const onClose = () => {}

  if (token) {
    return <a href='#logout' onClick={(e) => {
      e.preventDefault();
      setAuthToken('');
      window.close();
    }}>Logout</a>
  } else {
    return <OauthPopup
      title='Dissonant Voices'
      url='/api/authorize?client_id=web'
      width={500}
      height={500}
      onCode={onCode}
      onClose={onClose}
    >
      <a href='#login' onClick={(e) => {
        e.preventDefault();
      }}>Login</a>
    </OauthPopup>;
  }
}

export default function App() {
  return <CookiesProvider>
    <Router>
      <div>
        <Switch>
          <Route exact path="/campaign/:campaignId" component={CampaignView} />
          <Route exact path="/scenario/:scenarioId" component={ScenarioView} />
          <Route exact path="/scene/:sceneId" component={SceneView} />
          <Route exact path="/" component={CampaignListView} />
        </Switch>
      </div>
    </Router>
  </CookiesProvider>;
}
