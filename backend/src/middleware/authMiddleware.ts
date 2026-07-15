import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Socket } from "socket.io";

dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;

const client = jwksClient({
  jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }

    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

export function authenticateSocket(socket: Socket, next: (err?: any) => void) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.data.isGuest = true;
    next();
    return;
  }

  jwt.verify(token, getKey, { algorithms: ["ES256"] }, (err, decoded) => {
    if (err) {
      next(err);
      return;
    }

    socket.data.isGuest = false;
    socket.data.userId = (decoded as any).sub; // unique identifier for who owns the token
    next();
  });
}
