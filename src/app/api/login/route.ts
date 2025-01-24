import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getDb } from '@/app/lib/db';
import { createToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { User } from '@/types'; // Ensure this path matches your project structure
import { verifyToken } from '@/app/lib/auth'; // Adjust import path as needed

export async function POST(request: Request) {
  try {
    // Log de entrada para ver a requisição
    console.log('Requisição recebida:', request);

    const { username, password } = await request.json();
    console.log('Dados recebidos:', { username, password });

    // Conexão com o banco de dados
    const db = await getDb();
    console.log('Conexão com o banco de dados estabelecida');

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    console.log('Usuário encontrado:', user);

    if (!user) {
      console.log('Usuário não encontrado');
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }
    
    console.log('Senha armazenada no banco (hash):', user.password);
    console.log('Senha recebida no login:', password);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Senha válida:', validPassword);
    
    if (!validPassword) {
      console.log('Senha inválida');
      return NextResponse.json(
        { error: 'Senha inválida' },
        { status: 401 }
      );
    }

    const token = await createToken({ id: user.id, username: user.username });
    console.log('Token gerado:', token);

    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Try 'strict' instead of 'lax'
      maxAge: 60 * 60 * 24
    });

    console.log('Resposta enviada com sucesso');
    return response;
  } catch (error) {
    // Log de erro para verificar o que deu errado
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Add more logging in getUser()
export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  console.log('Token from cookies:', token);

  if (!token) {
    console.log('No token found');
    return null;
  }

  return await verifyToken(token.value);
}