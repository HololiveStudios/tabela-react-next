// app/home/page.tsx

import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/auth';
import DeviceDetect from "@/components/DiveceDetect";

export default async function Home() {
  const user = await getUser();
  
  // Se não houver usuário, redireciona para a página de login
  if (!user) {
    redirect('/login');
  }

  // Caso o usuário esteja autenticado, renderiza o componente
  return <DeviceDetect />;
}
