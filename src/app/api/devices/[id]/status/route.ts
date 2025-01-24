import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';

// Define handler type explicitly
type HandlerType = (
  request: NextRequest,
  context: { params: { id: string } }
) => Promise<NextResponse>;

// Use type assertion
export const PATCH: HandlerType = async (request, { params }) => {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Espera a resolução do parâmetro `id` antes de usá-lo
    const { id } = await params; // Aguarda a resolução do parâmetro `id`
    const { status } = await request.json();
    
    const db = await getDb();
    
    const result = await db.run(
      `UPDATE devices
       SET status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status ? 1 : 0, id]
    );
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Dispositivo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
};
