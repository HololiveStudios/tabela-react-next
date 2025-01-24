// Interface para usuários
export interface User {
  id: string; // Usando string para maior compatibilidade com JWT
  username: string;
  email?: string; // Campo opcional
}

// Interface para dispositivos
export interface Device {
  id: number;
  ip: string;
  device_name: string | null;
  type: string | null;
  user: string | null;
  sector: string | null;
  status: number;
  created_at?: string;
  updated_at?: string;
  posX: number;
  posY: number;
}

export interface Router {
  id: number;
  ip: string;
  wifi: string;
  wifi_pass: string;
  login: string;
  login_pass: string;
  sector: string;
  status: number;
}

export interface map {
  id: number;
  type: string;
  sector: string;
  posX: number;
  posY: number;
  width: number; 
  height: number;
  rotation: number;
}