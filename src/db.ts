import Database from "better-sqlite3";
import { AccessToken } from "simple-oauth2";
import { v4 as uuidv4 } from "uuid";

const db = Database(":memory:");
db.prepare(`
  CREATE TABLE user(
    id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    is_patron INT NOT NULL,
    last_checked TEXT NOT NULL
  )
`).run();
db.prepare(`
  CREATE TABLE scene(
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL
  )
`).run();
db.prepare(`
  INSERT INTO scene(id, url)
  VALUES(?, ?)
`).run("dreameaters-prologue", "dreameaters-prologue.mp3");

const insertUserStmt = db.prepare(`
  INSERT INTO user(id, access_token, is_patron, last_checked)
  VALUES (?, ?, ?, ?)
`);
const updateUserStmt = db.prepare(`
  UPDATE user
  SET
    is_patron = ?,
    last_checked = ?
  WHERE id = ?
`);
const getUserByIdStmt = db.prepare(`
  SELECT *
  FROM user
  WHERE id = ?
`);
const getSceneByIdStmt = db.prepare(`
  SELECT *
  FROM scene
  WHERE id = ?
`)

interface User {
  id: string;
  accessToken: AccessToken;
  isPatron: boolean;
  lastChecked: Date;
}

interface Scene {
  id: string;
  url: string;
}

export function createUser(accessToken: AccessToken, isPatron: boolean) {
  const userId = uuidv4();
  insertUserStmt.run(
    userId,
    JSON.stringify(accessToken.token),
    isPatron ? 1 : 0,
    Date.now(),
  );
  return userId;
}

export function updateUser(userId: string, isPatron: boolean) {
  updateUserStmt.run(isPatron ? 1 : 0, Date.now(), userId);
}

export function getUserById(userId: string): User | null {
  const result = getUserByIdStmt.get(userId);
  if (!result) return null;

  return {
    id: result.id,
    accessToken: JSON.parse(result.access_token),
    isPatron: result.patron === 1,
    lastChecked: new Date(result.last_checked)
  }
}

export function getSceneById(sceneId: string): Scene | null {
  const result = getSceneByIdStmt.get(sceneId);
  if (!result) return null;

  return {
    id: result.id,
    url: result.url,
  }
}