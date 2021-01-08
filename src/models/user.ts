import { DateTime } from "luxon";
import { Token } from "simple-oauth2";

export interface User {
  id: string;
  token: Token;
  isPatron: boolean;
  created: DateTime;
  lastChecked: DateTime;
}

export const mapToUser = (result: { [key: string]: any }) => ({
  id: result.user.id,
  token: JSON.parse(result.user.token),
  isPatron: result.user.patron === 1,
  created: DateTime.fromSQL(result.user.created),
  lastChecked: DateTime.fromSQL(result.user.last_checked),
});