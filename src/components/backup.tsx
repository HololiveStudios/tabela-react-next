/*layout Desktop

'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { LogOut, Edit2, Save, Wifi, WifiOff } from 'lucide-react';
import { Device } from '@/types';
import { cn } from '@/lib/utils';


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
      if (!deviceToUpdate || !editingDevice) return;

      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDevice),
      });

      if (!response.ok) throw new Error('Erro ao atualizar dispositivo');

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
              <p className="text-gray-500 text-sm tracking-wide">
                Gerencie seus dispositivos e suas configurações
              </p>
            </div>
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
                          value={editingDevice.device_name}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            device_name: e.target.value
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
                          value={editingDevice.type}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            type: e.target.value
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
                          value={editingDevice.sector}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            sector: e.target.value
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
                          value={editingDevice.user}
                          onChange={(e) => setEditingDevice({
                            ...editingDevice,
                            user: e.target.value
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
layout Desktop */


/*layout mobile

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LogOut, Edit2, Save, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Device } from '@/types';
import { cn } from '@/lib/utils';

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
      if (!deviceToUpdate || !editingDevice) return;

      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDevice),
      });

      if (!response.ok) throw new Error('Erro ao atualizar dispositivo');

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
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Gerenciamento de IPs
              </h1>
              <p className="text-gray-500 text-sm tracking-wide mt-1">
                Gerencie seus dispositivos
              </p>
            </div>
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
                            value={editingDevice.device_name}
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
                            value={editingDevice.type}
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
                            value={editingDevice.sector}
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
                            value={editingDevice.user}
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

layout Mobile */