'use client';

import { useState, FormEvent} from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateForm = () => {
    if (!username.trim()) {
      setError('Usuário é obrigatório');
      return false;
    }
    if (!password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro de autenticação');
      }
    } catch (error) {
      setError('Não foi possível conectar ao servidor');
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <Card className="w-full max-w-sm shadow-lg">
    <CardHeader className="space-y-1">
      <CardTitle className="text-xl font-bold text-center">Login</CardTitle>
    </CardHeader>
    <CardContent>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="username" className="text-sm font-bold">Usuário</Label>
          <Input
            id="username"
            type="text"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-sm"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sm font-bold">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          variant="outline" 
          className="font-bold w-full flex items-center justify-center gap-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </CardContent>
  </Card>
</div>

  );
}