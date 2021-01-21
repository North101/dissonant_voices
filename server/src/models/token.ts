import { DateTime } from "luxon";
import { Token as Otoken } from "simple-oauth2";
import { mapToUser, User, UserResult, UserTable } from "./user";

type PartialNull<T> = {
  [P in keyof T]: T[P] | null;
};

export interface TokenTable {
  id: string;
  token: string;
  user_id: string | null,
  is_patron: number;
  created: string;
  last_checked: string;
}

export interface TokenResult {
  token: TokenTable;
  user: PartialNull<UserTable>;
}

export interface Token {
  id: string;
  token: Otoken;
  userId: string | null;
  isPatron: boolean;
  created: DateTime;
  lastChecked: DateTime;
  user: User | null;
}

export const checkIsAdmin = (token: Token | null) => token?.user?.isAdmin ?? false;

export const checkIsPatron = (token: Token | null) => {
  if (token === null) return false;

  return token.isPatron ||
    checkIsAdmin(token) ||
    (token.user?.overridePatronStatus ?? false);
}

export const mapToToken = (result: TokenResult): Token => ({
  id: result.token.id,
  token: JSON.parse(result.token.token),
  userId: result.token.user_id,
  isPatron: result.token.is_patron === 1,
  created: DateTime.fromSQL(result.token.created),
  lastChecked: DateTime.fromSQL(result.token.last_checked),
  user: result.user.id !== null ? mapToUser(result as UserResult) : null,
});