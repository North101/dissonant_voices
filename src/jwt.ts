import jwt from "jwt-simple";

const JWT_ALGORITHM = "HS512";

export interface AuthToken {
  user_id: string;
  issued: number;
  expires: number;
}

export function encodeAuthToken(userId: string, expires: number) {
  const payload: AuthToken = {
    user_id: userId,
    issued: Date.now(),
    expires,
  };
  return jwt.encode(payload, process.env.JWT_SECRET, JWT_ALGORITHM);
}

export function decodeAuthToken(token: string) {
  return jwt.decode(token, process.env.JWT_SECRET, false, JWT_ALGORITHM);
}
