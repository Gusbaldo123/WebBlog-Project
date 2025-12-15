import { AuthorResponseDTO } from '../models/dtos';

const jwt = require('jsonwebtoken');

const decodeJwt = (token: string):JwtPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

interface JwtPayload {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  user: AuthorResponseDTO;
}

const authSigner = (resPost: AuthorResponseDTO): string => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must have at least 32 characters');
  }

  const duration: number = parseInt(process.env.JWT_SESSION_DURATION || "3600");
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: resPost.id.toString(),
    iss: process.env.JWT_ISSUER || 'backend',
    aud: process.env.JWT_AUD || 'frontend',
    exp: now + duration,
    iat: now,
    user: resPost
  };
  const token: string = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256' });
  return token;
}

export { authSigner, decodeJwt, JwtPayload }