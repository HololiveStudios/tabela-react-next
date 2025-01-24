'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { LogOut, Edit2, Save, Wifi, WifiOff } from 'lucide-react';
import { Device } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DesktopView() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch('/api/devices');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao buscar dispositivos');
      }
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      fetchDevices();
    }
  }, [mounted, fetchDevices]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
  };

  const handleSave = async (deviceId: number) => {
    try {
      const deviceToUpdate = devices.find(device => device.id === deviceId);
      if (!deviceToUpdate || !editingDevice) {
        console.error("Dispositivo para atualizar não encontrado ou dados inválidos:", { deviceToUpdate, editingDevice });
        return;
      }
  
      // Atualizando diretamente o estado para refletir a mudança imediatamente
      const updatedDevices = devices.map((device) =>
        device.id === deviceId ? { ...device, ...editingDevice } : device
      );
      setDevices(updatedDevices);
  
      // Log para verificar os dados enviados
      console.log("Dados enviados:", JSON.stringify(editingDevice));
  
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDevice),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro do servidor:", errorData);
        throw new Error(errorData.error || 'Erro ao atualizar dispositivo');
      }
  
      console.log("Atualização bem-sucedida!");
      setEditingDevice(null);
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
    }
  };
  
  
  const handleSwitchChange = async (deviceId: number, checked: boolean) => {
    // Atualize o estado localmente primeiro
    setDevices(prevDevices => prevDevices.map(device => 
      device.id === deviceId ? { ...device, status: checked ? 1 : 0 } : device
    ));
  
    try {
      const response = await fetch(`/api/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: checked ? 1 : 0 }),
      });
  
      if (!response.ok) throw new Error('Erro ao atualizar status');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };
  
  if (!mounted) {
    return null;
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
                Gerenciamento de IPs
              </h1>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <Link href="/router">Roteadores</Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <Link href="/map">Mapa de Dispositivos</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
          
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">IP</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Nome</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Tipo</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Setor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Usuário</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium text-gray-500">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow 
                    key={device.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      editingDevice?.id === device.id && "bg-blue-50/40"
                    )}
                  >
                    <TableCell className="font-mono text-sm text-gray-600">{device.ip}</TableCell>
                    <TableCell>
                      {editingDevice?.id === device.id ? (
                        <Input
                          value={editingDevice.device_name || ''}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            device_name: e.target.value  === '' ? null : e.target.value
                          })}
                          className="minimal-input max-w-[200px]"
                          placeholder="Nome do dispositivo"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{device.device_name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDevice?.id === device.id ? (
                        <Input
                          value={editingDevice.type || ''}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            type: e.target.value  === '' ? null : e.target.value
                          })}
                          className="minimal-input max-w-[150px]"
                          placeholder="Tipo"
                        />
                      ) : (
                        <span className="text-gray-700">{device.type}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDevice?.id === device.id ? (
                        <Input
                          value={editingDevice.sector || ''}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            sector: e.target.value  === '' ? null : e.target.value
                          })}
                          className="minimal-input max-w-[150px]"
                          placeholder="Setor"
                        />
                      ) : (
                        <span className="text-gray-700">{device.sector}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDevice?.id === device.id ? (
                        <Input
                          value={editingDevice.user || ''}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            user: e.target.value  === '' ? null : e.target.value
                          })}
                          className="minimal-input max-w-[150px]"
                          placeholder="Usuário"
                        />
                      ) : (
                        <span className="text-gray-700">{device.user}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={Boolean(device.status)}
                          onCheckedChange={(checked) => handleSwitchChange(device.id, checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        {device.status ? 
                          <Wifi className="w-4 h-4 text-green-500" /> : 
                          <WifiOff className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingDevice?.id === device.id ? (
                        <Button 
                          onClick={() => handleSave(device.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Save size={14} />
                          <span className="font-medium">Salvar</span>
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleEdit(device)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 size={14} />
                          <span className="font-medium">Editar</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}