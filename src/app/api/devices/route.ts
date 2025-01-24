import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import { Device } from '@/types';

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
    const devices = await db.all<Device[]>('SELECT * FROM devices');
    
    // Retorna a lista de dispositivos
    return NextResponse.json(devices);
  } catch (error) {
    // Em caso de erro, loga o erro no console
    console.error('Erro ao obter dispositivos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
