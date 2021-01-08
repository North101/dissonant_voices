import jwt from "jwt-simple";
import { DateTime } from "luxon";
import config from "../config";

export interface AuthToken {
  user_id: string;
  issued: number;
}

export interface AdminToken {
  admin_id: string;
  issued: number;
}

export default class JwtService {
  encodeAuthToken(userId: string) {
    const payload: AuthToken = {
      user_id: userId,
      issued: DateTime.utc().toMillis(),
    };
    return jwt.encode(payload, config.jwt.secret, config.jwt.algorithm);
  }

  decodeToken(token: string) {
    return jwt.decode(token, config.jwt.secret, false, config.jwt.algorithm);
  }

  encodeAdminToken(adminId: string) {
    const payload: AdminToken = {
      admin_id: adminId,
      issued: DateTime.utc().toMillis(),
    };
    return jwt.encode(payload, config.jwt.secret, config.jwt.algorithm);
  }
}
