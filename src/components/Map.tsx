'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FaWifi, FaDesktop, FaPrint, FaQuestionCircle, FaCouch, FaDoorOpen, FaTable } from 'react-icons/fa';
import { Device, map } from '@/types';

const DEVICE_ICONS = {
  'Roteador': FaWifi,
  'Computador': FaDesktop,
  'Impressora': FaPrint,
  'default': FaQuestionCircle
};
const ICONS = {
    'Sofá': FaCouch,
    'Porta': FaDoorOpen,
    'Mesa': FaTable, // Ícone para Mesa (ou crie um SVG próprio)
    'default': FaQuestionCircle,
  };
  
  
  const BlueprintDeviceMap: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [maps, setmaps] = useState<map[]>([]);
  
    const groupedDevices = useMemo(() => {
        return devices.reduce<Record<string, Device[]>>((acc, device) => {
          const sector = device.sector || 'Unknown'; // Valor padrão para evitar problemas
          if (!acc[sector]) {
            acc[sector] = [];
          }
          acc[sector].push(device);
          return acc;
        }, {});
      }, [devices]);
      
      const groupedmaps = useMemo(() => {
        return maps.reduce<Record<string, map[]>>((acc, obj) => {
          const sector = obj.sector || 'Unknown'; // Valor padrão
          if (!acc[sector]) {
            acc[sector] = [];
          }
          acc[sector].push(obj);
          return acc;
        }, {});
      }, [maps]);
      
  
      useEffect(() => {
        const fetchDevices = async () => {
          try {
            const response = await fetch('/api/devices');
            const dataD = await response.json();
            setDevices(dataD);
          } catch (error) {
            console.error('Failed to fetch devices:', error);
          }
        };
      
        const fetchMaps = async () => {
          try {
            const responseM = await fetch('/api/map');
            const dataM = await responseM.json();
            setmaps(dataM);

          } catch (error) {
            console.error('Failed to fetch maps:', error);

          }
        };
      
        // Chamando ambas as funções de forma independente
        fetchDevices();
        fetchMaps();
      }, []); // O array vazio garante que o efeito seja executado apenas uma vez
      
  
    const renderObject = (obj: map) => {
        if (obj.type === 'Mesa') {
          return (
            <div
              key={obj.id}
              className="map-object table"
              style={{
                left: `${obj.posX}%`,
                top: `${obj.posY}%`,
                width: obj.width ? `${obj.width}%` : '100px', // Tamanho do retângulo (mesa)
                height: obj.height ? `${obj.height}%` : '60px', // Tamanho do retângulo (mesa)
                transform: `rotate(${obj.rotation || 0}deg)`, // Rotação opcional
                backgroundColor: '#D3D3D3', // Cor de fundo do retângulo (mesa)
                border: '2px solid #A9A9A9', // Borda do retângulo
              }}
            >
              <div className="object-tooltip">
                <p>{obj.type}</p>
              </div>
            </div>
          );
        }
      
        // Renderização padrão para outros tipos
        const Icon = ICONS[obj.type] || ICONS['default'];
        return (
          <div
            key={obj.id}
            className="map-object"
            style={{
              left: `${obj.posX}%`,
              top: `${obj.posY}%`,
              width: obj.width ? `${obj.width}%` : 'auto',
              height: obj.height ? `${obj.height}%` : 'auto',
              transform: `rotate(${obj.rotation || 0}deg)`,
            }}
          >
            <div className="object-marker">
              <Icon />
            </div>
            <div className="object-tooltip">
              <p>{obj.type}</p>
            </div>
          </div>
        );
      };
      
    return (
      <div className="blueprint-container">
        {Object.keys({ ...groupedDevices, ...groupedmaps }).map((sector) => (
          <div key={sector} className="sector-blueprint">
            <div className="sector-header">
              <h3>{sector}</h3>
              <span>
                {groupedDevices[sector]?.length || 0} dispositivos, {groupedmaps[sector]?.length || 0} objetos
              </span>
            </div>
            <div className="blueprint-grid">
              <div className="blueprint-overlay">
                {/* Renderizar Objetos */}
                {groupedmaps[sector]?.map(renderObject)}
  
                {/* Renderizar Dispositivos */}
                {groupedDevices[sector]?.map((device) => {
                  const Icon = DEVICE_ICONS[device.type] || DEVICE_ICONS['default'];
                  return (
                    <div
                      key={device.id}
                      className={`device ${device.status === 1 ? 'active' : 'inactive'}`}
                      style={{
                        left: `${device.posX}%`,
                        top: `${device.posY}%`,
                      }}
                    >
                      <div className="device-marker">
                        <Icon />
                      </div>
                      <div className="device-tooltip">
                        <p><strong>IP:</strong> {device.ip}</p>
                        <p><strong>Nome:</strong> {device.device_name}</p>
                        <p><strong>Tipo:</strong> {device.type}</p>
                        <p><strong>Usuário:</strong> {device.user}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default BlueprintDeviceMap;
  