import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'carlosfallen'
);

// Função para criar um token JWT
export async function createToken(payload: User): Promise<string> {
  return await new SignJWT({ ...payload }) // Garante que os campos de User estão no payload
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

// Função para verificar um token JWT
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log('Payload do token:', payload);

    // Validação do payload
    if (
      (typeof payload.id === 'string' || typeof payload.id === 'number') &&
      typeof payload.username === 'string'
    ) {
      return payload as unknown as User;
    } else {
      throw new Error('Payload inválido');
    }
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return null;
  }
}

// Função para obter o usuário atual com base no token armazenado nos cookies
export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies(); // Certifique-se de usar await
  const token = cookieStore.get('token');

  if (!token) return null;

  return await verifyToken(token.value);
}
