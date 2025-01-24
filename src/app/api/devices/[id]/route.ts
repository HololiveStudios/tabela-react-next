import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import { Server } from 'socket.io';  // Importando o Server do socket.io

// Inicializando o WebSocket Server (Certifique-se de configurá-lo no seu servidor)
const io = new Server();

type HandlerType = (
  request: NextRequest,
  context: { params: { id: string } }
) => Promise<NextResponse>;

export const PUT: HandlerType = async (request, { params }) => {
  try {
    const user = await getUser();
    console.log("Usuário autenticado:", user);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const { ip, device_name, type, user: deviceUser, sector, status } = await request.json();

    console.log("Dados recebidos:", { ip, device_name, type, user: deviceUser, sector, status });
    console.log("ID recebido:", id);
    
    if (!ip || !device_name || !type || !deviceUser || !sector || typeof status === 'undefined') {
      return NextResponse.json(
        { error: 'Dados incompletos ou inválidos' },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      console.error("Falha ao conectar ao banco de dados");
      return NextResponse.json(
        { error: 'Erro ao conectar ao banco de dados' },
        { status: 500 }
      );
    }

    const result = await db.run(
      `UPDATE devices
       SET ip = ?, device_name = ?, type = ?, user = ?, sector = ?, status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ip, device_name, type, deviceUser, sector, status ? 1 : 0, id]
    );
    console.log("Resultado da atualização:", result);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Dispositivo não encontrado' },
        { status: 404 }
      );
    }

    // Emitir evento WebSocket para notificar sobre a atualização
    io.emit('device-status-updated', { deviceId: id, status: status ? 1 : 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
};
