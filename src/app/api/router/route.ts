;import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import { Router } from '@/types';

export async function GET() {
  try {
    // Verifica se o usuário está autenticado
    const user = await getUser();
    if (!user) {
      // Se não estiver autenticado, retorna um erro 401
      console.log('Usuário não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Conecta ao banco de dados
    const db = await getDb();
    // Recupera os dispositivos do banco de dados
    const Routers = await db.all<Router[]>('SELECT * FROM Router');
    
    // Retorna a lista de dispositivos
    return NextResponse.json(Routers);
  } catch (error) {
    // Em caso de erro, loga o erro no console
    console.error('Erro ao obter dispositivos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
