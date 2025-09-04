// src/lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

// Tipe untuk payload yang sudah didekode
interface DecodedToken {
  id: string;
  [key: string]: any;
}

/**
 * Memverifikasi token JWT dan mengembalikan payload jika valid.
 * @param token Token JWT dari header Authorization.
 * @returns Promise yang resolve dengan payload pengguna.
 * @throws Error jika token tidak valid atau tidak ada.
 */
export async function verifyJWT(token: string | undefined | null): Promise<DecodedToken> {
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    // Pastikan Anda memiliki JWT_SECRET di file .env.local
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    const decoded = jwt.verify(token, secret);

    // Pastikan hasil decode adalah objek dan memiliki 'id'
    if (typeof decoded === 'string' || !('id' in decoded)) {
      throw new Error('Unauthorized: Invalid token payload');
    }

    return decoded as DecodedToken;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}