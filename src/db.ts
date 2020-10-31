import Database from "better-sqlite3";
import { AccessToken } from "simple-oauth2";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

const db = Database(":memory:");
db.prepare(`
  CREATE TABLE user(
    id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    is_patron INT NOT NULL,
    last_checked TEXT NOT NULL
  )
`).run();
if (process.env.CREATE_USER_ID && process.env.CREATE_USER_ACCESS_TOKEN) {
  db.prepare(`
    INSERT INTO user
    VALUES (:id, :accessToken, :isPatron, :lastChecked)
  `).run({
    id: process.env.CREATE_USER_ID,
    accessToken: process.env.CREATE_USER_ACCESS_TOKEN,
    isPatron: 0,
    lastChecked: DateTime.utc().toSQL(),
  })
}
db.prepare(`
  CREATE TABLE campaign(
    id TEXT PRIMARY KEY
    name TEXT NOT NULL
  )
`).run();
db.prepare(`
  CREATE TABLE scenario(
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    name TEXT NOT NULL
  )
`).run();
db.prepare(`
  CREATE TABLE scene(
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    name TEXT NOT NULL,
    ext TEXT NOT NULL
  )
`).run();

db.prepare(`
  INSERT INTO campaign
  VALUES (:id, :name)
`).run({
  id: "dreameaters",
  name: "The Dream-Eaters"
});
db.prepare(`
  INSERT INTO scenario
  VALUES(:id, :campaignId, :name)
`).run({
  id: "dreameaters-setup",
  campaignId: "dreameaters",
  name: "Campaign Setup"
});
db.prepare(`
  INSERT INTO scene
  VALUES(:id, :scenarioId, :name, :ext)
`).run({
  id: "dreameaters-prologue",
  scenarioId: "dreameaters-setup",
  name: "Prologue",
  ext: "mp3",
});

const insertUserStmt = db.prepare(`
  INSERT INTO user(id, access_token, is_patron, last_checked)
  VALUES (:id, :accessToken, :isPatron, :lastChecked)
`);
const updateUserStmt = db.prepare(`
  UPDATE user
  SET
    is_patron = :isPatron,
    last_checked = :lastChecked
  WHERE user.id = :id
`);
const getUserByIdStmt = db.prepare(`
  SELECT *
  FROM user
  WHERE user.id = :id
`);
const getCampaignByIdStmt = db.prepare(`
  SELECT *
  FROM campaign
  WHERE campaign.id = :id
`)
const getScenarioByIdStmt = db.prepare(`
  SELECT *
  FROM scenario

  INNER JOIN campaign
    ON campaign.id = scenario.campaign_id

  WHERE scenario.id = :id
`)
const getSceneByIdStmt = db.prepare(`
  SELECT *
  FROM scene

  INNER JOIN scenario
    ON scenario.id = scene.scenario_id

  INNER JOIN campaign
    ON campaign.id = scenario.campaign_id

  WHERE scene.id = :id
`)

interface User {
  id: string;
  accessToken: AccessToken;
  isPatron: boolean;
  lastChecked: DateTime;
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
  ext: string;
  scenario: Scenario;
}

export function createUser(accessToken: AccessToken, isPatron: boolean) {
  const userId = uuidv4();
  insertUserStmt.run({
    id: userId,
    accessToken: JSON.stringify(accessToken.token),
    isPatron: isPatron ? 1 : 0,
    lastChecked: DateTime.utc().toSQL(),
  });
  return userId;
}

export function updateUser(userId: string, isPatron: boolean) {
  updateUserStmt.run({
    id: userId,
    isPatron: isPatron ? 1 : 0,
    lastChecked: DateTime.utc().toSQL(),
  });
}

export function getUserById(userId: string): User | null {
  const result = getUserByIdStmt.get({id: userId});
  if (!result) return null;

  return {
    id: result.id,
    accessToken: JSON.parse(result.access_token),
    isPatron: result.patron === 1,
    lastChecked: DateTime.fromSQL(result.last_checked),
  }
}

export function getCampaignById(campaignId: string): Campaign | null {
  const result = getCampaignByIdStmt.get({id: campaignId});
  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
  }
}

export function getScenarioById(scenarioId: string): Scenario | null {
  const result = getCampaignByIdStmt.get({id: scenarioId});
  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    campaign: {
      id: result["campaign.id"],
      name: result["campaign.name"],
    }
  }
}

export function getSceneById(sceneId: string): Scene | null {
  const result = getSceneByIdStmt.get({id: sceneId});
  if (!result) return null;

  return {
    id: result["scene.id"],
    name: result["scene.name"],
    ext: result['scene.ext'],
    scenario: {
      id: result["scenario.id"],
      name: result["scenario.name"],
      campaign: {
        id: result["campaign.id"],
        name: result["campaign.name"],
      }
    }
  }
}