import { AccessToken } from "simple-oauth2";

export {}

declare global {
  namespace Express {
    export interface Request {
      token: AccessToken;
    }
  }
}
