import jwt from "jwt-simple";
import { DateTime } from "luxon";
import config from "../config";

export interface JwtPayload {
  user_id: string;
  issued: number;
}

export default class JwtService {
  encodeToken(userId: string) {
    const payload: JwtPayload = {
      user_id: userId,
      issued: DateTime.utc().toMillis(),
    };
    return jwt.encode(payload, config.jwt.secret, config.jwt.algorithm);
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token, config.jwt.secret, false, config.jwt.algorithm);
  }
}
