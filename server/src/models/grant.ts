import { DateTime } from "luxon";

export interface GrantTable {
    id: string;
    expires: string;
    is_admin: number;
    override_patron_status: number;
  }
  
  export interface GrantResult {
    grant: GrantTable;
  }
  
  export interface Grant {
    id: string;
    expires: DateTime;
    isAdmin: boolean | null;
    overridePatronStatus: boolean | null;
  }
  
  export const mapToGrant = (result: GrantResult): Grant => ({
    id: result.grant.id,
    expires: DateTime.fromSQL(result.grant.expires),
    isAdmin: result.grant.is_admin ? result.grant.is_admin === 1 : null,
    overridePatronStatus: result.grant.override_patron_status ? result.grant.override_patron_status === 1 : null,
  });