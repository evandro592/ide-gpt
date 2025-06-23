import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Code2, 
  Settings, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff,
  Bot,
  Activity
} from 'lucide-react';

interface HeaderProps {
  projetoAtivo?: any;
  onToggleTheme?: () => void;
  tema?: 'light' | 'dark';
}

export function Header({ projetoAtivo, onToggleTheme, tema = 'dark' }: HeaderProps) {
  const [mostrarStatus, setMostrarStatus] = useState(false);

  // Verificar status da aplicação
  const { data: status, isError } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 30000, // Atualizar a cada 30s
  });

  const statusConexao = isError ? 'desconectado' : 'conectado';
  const statusIA = status?.ia === 'configurado';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b">
      {/* Logo e título */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold">IDE Português</h1>
        </div>
        
        {projetoAtivo && (
          <>
            <div className="w-px h-4 bg-border" />
            <span className="text-sm text-muted-foreground">
              {projetoAtivo.name}
            </span>
          </>
        )}
      </div>

      {/* Controles do usuário */}
      <div className="flex items-center gap-2">
        {/* Status da aplicação */}
        <div 
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setMostrarStatus(!mostrarStatus)}
        >
          {statusConexao === 'conectado' ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          
          {statusIA ? (
            <Bot className="w-4 h-4 text-blue-500" />
          ) : (
            <Bot className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Status expandido */}
        {mostrarStatus && (
          <div className="absolute top-16 right-4 bg-popover border rounded-lg p-3 shadow-lg z-50 min-w-[200px]">
            <div className="text-sm font-medium mb-2">Status do Sistema</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Conexão:</span>
                <span className={statusConexao === 'conectado' ? 'text-green-500' : 'text-red-500'}>
                  {statusConexao === 'conectado' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Banco de dados:</span>
                <span className="text-green-500">
                  {status?.database || 'Conectado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assistente IA:</span>
                <span className={statusIA ? 'text-green-500' : 'text-orange-500'}>
                  {statusIA ? 'Configurado' : 'Não configurado'}
                </span>
              </div>
              {status?.timestamp && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Última atualização: {new Date(status.timestamp).toLocaleTimeString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alternar tema */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          title={`Alternar para tema ${tema === 'dark' ? 'claro' : 'escuro'}`}
        >
          {tema === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Configurações */}
        <Button
          variant="ghost"
          size="sm"
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Overlay para fechar status */}
      {mostrarStatus && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setMostrarStatus(false)}
        />
      )}
    </header>
  );
}