import { getDb } from './db';
import { ping } from 'tcp-ping';

export async function runDevicePingCron() {
  try {
    const db = await getDb();
    const devices = await db.all('SELECT id, ip FROM devices');

    const pingResults = await Promise.all(
      devices.map(device => new Promise<{id: number, status: number}>(resolve => {
        ping({ address: device.ip, port: 80, timeout: 2000 }, (err) => {
          resolve({ 
            id: device.id, 
            status: err ? 0 : 1 
          });
        });
      }))
    );

    for (const result of pingResults) {
      await db.run(
        'UPDATE devices SET status = ?, last_ping = CURRENT_TIMESTAMP WHERE id = ?', 
        [result.status, result.id]
      );
    }

    console.log('Ping cron job completed');
  } catch (error) {
    console.error('Cron ping error:', error);
  }
}