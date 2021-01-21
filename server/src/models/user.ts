export interface UserTable {
  id: string;
  name: string;
  is_admin: number;
  override_patron_status: number;
}

export interface UserResult {
  user: UserTable;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  overridePatronStatus: boolean;
}

export const mapToUser = (result: UserResult): User => ({
  id: result.user.id,
  name: result.user.name,
  isAdmin: result.user.is_admin === 1,
  overridePatronStatus: result.user.override_patron_status === 1,
});