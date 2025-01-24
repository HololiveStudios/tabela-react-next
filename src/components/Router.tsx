'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    LogOut,
  ChevronDown, 
  ChevronUp, 
  QrCode, 
  X, 
  Wifi, 
  Lock, 
  Server, 
  ToggleLeft, 
  Download 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Router as RouterType } from '@/types';
import QRCode from "react-qr-code";
import Link from 'next/link';

const RouterCard = ({ 
    router, 
    isExpanded, 
    onToggleExpand, 
    onStatusChange, 
    onQRCodeView 
  }: {
    router: RouterType;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
    onStatusChange: (id: number, status: boolean) => void;
    onQRCodeView: (router: RouterType) => void;
  }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-t-xl"
        onClick={() => onToggleExpand(router.id)} // Toggling the expand/collapse behavior
      >
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Wifi className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{router.wifi}</h3>
            <p className="text-sm text-gray-500 flex items-center space-x-2">
              <Server className="w-4 h-4 mr-1" />
              {router.ip} 
              <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                {router.sector}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Switch
            checked={Boolean(router.status)}
            onCheckedChange={(checked) => onStatusChange(router.id, checked)}
            className="data-[state=checked]:bg-green-500"
          />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
  
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <Wifi className="w-4 h-4 mr-2 text-blue-500" /> Wi-Fi
              </label>
              <p className="text-sm text-gray-900 font-medium">{router.wifi}</p>
            </div>
            <div>
              <label className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <Lock className="w-4 h-4 mr-2 text-blue-500" /> Senha Wi-Fi
              </label>
              <p className="text-sm text-gray-900 font-medium">{router.wifi_pass}</p>
            </div>
            <div>
              <label className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <ToggleLeft className="w-4 h-4 mr-2 text-blue-500" /> Login
              </label>
              <p className="text-sm text-gray-900 font-medium">{router.login}</p>
            </div>
            <div>
              <label className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <Lock className="w-4 h-4 mr-2 text-blue-500" /> Senha Login
              </label>
              <p className="text-sm text-gray-900 font-medium">{router.login_pass}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => onQRCodeView(router)}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <QrCode className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
const QRCodeModal = ({ 
  router, 
  onClose, 
  onDownload 
}: {
  router: RouterType;
  onClose: () => void;
  onDownload: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">QR Code Wi-Fi</h2>
        <p className="text-sm text-gray-600 mb-4">{router.wifi}</p>
        
        <div className="flex justify-center mb-6">
          <QRCode 
            value={`WIFI:T:WPA;S:${router.wifi};P:${router.wifi_pass};;`} 
            size={256} 
          />
        </div>
        
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Baixar QR Code
        </button>
      </div>
    </div>
  </div>
);

export default function RouterManagement() {
  const [routers, setRouters] = useState<RouterType[]>([]);
  const [expandedRouter, setExpandedRouter] = useState<number | null>(null);
  const [selectedRouter, setSelectedRouter] = useState<RouterType | null>(null);
  const router = useRouter();

    const handleLogout = async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
    };
  const fetchRouters = useCallback(async () => {
    try {
      const response = await fetch('/api/router');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao buscar roteadores');
      }
      const data = await response.json();
      setRouters(data);
    } catch (error) {
      console.error('Erro ao buscar roteadores:', error);
    }
  }, [router]);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  const handleRouterStatusChange = async (id: number, status: boolean) => {
    try {
      await fetch(`/api/router/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status ? 1 : 0 }),
      });

      setRouters(prev => 
        prev.map(r => r.id === id ? { ...r, status: status ? 1 : 0 } : r)
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleQRCodeDownload = () => {
    if (!selectedRouter) return;

    try {
      const svg = document.createElement('div');
      svg.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 256 256">
          ${QRCode.toString(`WIFI:T:WPA;S:${selectedRouter.wifi};P:${selectedRouter.wifi_pass};;`, { type: 'svg', width: 256 })}
        </svg>
      `;

      const link = document.createElement('a');
      link.download = `qrcode_${selectedRouter.wifi}.svg`;
      link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.innerHTML)}`;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const toggleExpandRouter = (id: number) => {
    setExpandedRouter(prev => prev === id ? null : id); // Toggling expand/contract
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
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
              onClick={handleLogout} 
              size="sm"
              className="flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <span className="font-medium">Sair</span>
            </Button>
        </div>

        <div className="space-y-4">
          {routers.map(routerItem => (
            <RouterCard 
              key={routerItem.id}
              router={routerItem}
              isExpanded={expandedRouter === routerItem.id}
              onToggleExpand={toggleExpandRouter}
              onStatusChange={handleRouterStatusChange}
              onQRCodeView={setSelectedRouter}
            />
          ))}
        </div>

        {selectedRouter && (
          <QRCodeModal 
            router={selectedRouter}
            onClose={() => setSelectedRouter(null)}
            onDownload={handleQRCodeDownload}
          />
        )}
      </div>
    </div>
  );
}