'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LogOut, Edit2, Save, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Device } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MobileView() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState<number | null>(null);
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
    setExpandedDevice(device.id);
  };

  const handleSave = async (deviceId: number) => {
    try {
      const deviceToUpdate = devices.find(device => device.id === deviceId);
      if (!deviceToUpdate || !editingDevice) {
        console.error("Dispositivo para atualizar não encontrado ou dados inválidos:", { deviceToUpdate, editingDevice });
        return;
      }
  
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
      await fetchDevices();
      setEditingDevice(null);
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
    }
  };
  
  const handleSwitchChange = async (deviceId: number, checked: boolean) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: checked ? 1 : 0 }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      await fetchDevices();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const toggleExpand = (deviceId: number) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start mb-2">
          <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <Link href="/">Iniçio</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <Link href="/router">Roteadores</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              size="sm"
              className="flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <span className="font-medium">Sair</span>
            </Button>
          </div>

          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={cn(
                  "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all",
                  editingDevice?.id === device.id && "border-blue-200 shadow-md"
                )}
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(device.id)}
                >
                  <div className="flex items-center gap-3">
                    {device.status ? 
                      <Wifi className="w-4 h-4 text-green-500 flex-shrink-0" /> : 
                      <WifiOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                    <div>
                      <div className="font-medium text-gray-900">{device.device_name}</div>
                      <div className="text-sm font-mono text-gray-500">{device.ip}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean(device.status)}
                      onCheckedChange={(checked) => handleSwitchChange(device.id, checked)}
                      className="data-[state=checked]:bg-green-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {expandedDevice === device.id ? 
                      <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>

                {expandedDevice === device.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Nome</label>
                        {editingDevice?.id === device.id ? (
                          <Input
                            value={editingDevice.device_name || ''}
                            onChange={(e) => setEditingDevice({
                              ...editingDevice,
                              device_name: e.target.value
                            })}
                            className="minimal-input"
                            placeholder="Nome do dispositivo"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{device.device_name}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Tipo</label>
                        {editingDevice?.id === device.id ? (
                          <Input
                            value={editingDevice.type || ''}
                            onChange={(e) => setEditingDevice({
                              ...editingDevice,
                              type: e.target.value
                            })}
                            className="minimal-input"
                            placeholder="Tipo"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{device.type}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Setor</label>
                        {editingDevice?.id === device.id ? (
                          <Input
                            value={editingDevice.sector || ''}
                            onChange={(e) => setEditingDevice({
                              ...editingDevice,
                              sector: e.target.value
                            })}
                            className="minimal-input"
                            placeholder="Setor"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{device.sector}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Usuário</label>
                        {editingDevice?.id === device.id ? (
                          <Input
                            value={editingDevice.user || ''}
                            onChange={(e) => setEditingDevice({
                              ...editingDevice,
                              user: e.target.value
                            })}
                            className="minimal-input"
                            placeholder="Usuário"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{device.user}</div>
                        )}
                      </div>
                      <div className="pt-3">
                        {editingDevice?.id === device.id ? (
                          <Button 
                            onClick={() => handleSave(device.id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                          >
                            <Save size={14} className="mr-1.5" />
                            Salvar Alterações
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEdit(device)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Edit2 size={14} className="mr-1.5" />
                            Editar Dispositivo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
