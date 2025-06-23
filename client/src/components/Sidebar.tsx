import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderIcon, 
  FileIcon, 
  Plus, 
  FolderPlus, 
  Trash2,
  Settings,
  Search
} from 'lucide-react';
import type { Project, File } from '@shared/schema';

interface SidebarProps {
  projetoAtivo?: Project | null;
  arquivoAtivo?: File | null;
  onSelectProject?: (projeto: Project) => void;
  onSelectFile?: (arquivo: File) => void;
  onCreateProject?: () => void;
}

export function Sidebar({ 
  projetoAtivo, 
  arquivoAtivo, 
  onSelectProject, 
  onSelectFile,
  onCreateProject 
}: SidebarProps) {
  const [busca, setBusca] = useState('');
  const [novoProjeto, setNovoProjeto] = useState('');
  const [novoArquivo, setNovoArquivo] = useState('');
  const [criandoProjeto, setCriandoProjeto] = useState(false);
  const [criandoArquivo, setCriandoArquivo] = useState(false);

  // Buscar projetos
  const { data: projetos = [], isLoading: carregandoProjetos } = useQuery({
    queryKey: ['/api/projetos'],
  });

  // Buscar arquivos do projeto ativo
  const { data: arquivos = [], isLoading: carregandoArquivos } = useQuery({
    queryKey: ['/api/projetos', projetoAtivo?.id, 'arquivos'],
    queryFn: () => projetoAtivo 
      ? apiRequest(`/api/projetos/${projetoAtivo.id}/arquivos`)
      : [],
    enabled: !!projetoAtivo,
  });

  // Criar projeto
  const criarProjetoMutation = useMutation({
    mutationFn: (dados: any) => apiRequest('/api/projetos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projetos'] });
      setNovoProjeto('');
      setCriandoProjeto(false);
    },
  });

  // Criar arquivo
  const criarArquivoMutation = useMutation({
    mutationFn: (dados: any) => apiRequest('/api/arquivos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
    onSuccess: () => {
      if (projetoAtivo) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/projetos', projetoAtivo.id, 'arquivos'] 
        });
      }
      setNovoArquivo('');
      setCriandoArquivo(false);
    },
  });

  // Deletar projeto
  const deletarProjetoMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/projetos/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projetos'] });
    },
  });

  // Deletar arquivo
  const deletarArquivoMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/arquivos/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      if (projetoAtivo) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/projetos', projetoAtivo.id, 'arquivos'] 
        });
      }
    },
  });

  const handleCriarProjeto = () => {
    if (novoProjeto.trim()) {
      criarProjetoMutation.mutate({
        name: novoProjeto.trim(),
        description: `Projeto ${novoProjeto}`,
        path: `/projetos/${novoProjeto.toLowerCase().replace(/\s+/g, '-')}`,
        language: 'javascript',
      });
    }
  };

  const handleCriarArquivo = () => {
    if (novoArquivo.trim() && projetoAtivo) {
      const extensao = novoArquivo.split('.').pop();
      const linguagem = extensao === 'js' ? 'javascript' 
        : extensao === 'ts' ? 'typescript'
        : extensao === 'py' ? 'python'
        : extensao === 'html' ? 'html'
        : extensao === 'css' ? 'css'
        : 'text';

      criarArquivoMutation.mutate({
        name: novoArquivo.trim(),
        path: `${projetoAtivo.path}/${novoArquivo.trim()}`,
        content: `// ${novoArquivo}\n// Criado em ${new Date().toLocaleString('pt-BR')}\n\n`,
        projectId: projetoAtivo.id,
        type: 'file',
        language: linguagem,
        size: 0,
      });
    }
  };

  const projetosFiltrados = projetos.filter((projeto: Project) =>
    projeto.name.toLowerCase().includes(busca.toLowerCase())
  );

  const arquivosFiltrados = arquivos.filter((arquivo: File) =>
    arquivo.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Cabeçalho */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-3">Explorador</h2>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCriandoProjeto(true)}
            title="Novo projeto"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
          
          {projetoAtivo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCriandoArquivo(true)}
              title="Novo arquivo"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">
        {/* Criar projeto */}
        {criandoProjeto && (
          <div className="p-4 border-b bg-muted/50">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do projeto"
                value={novoProjeto}
                onChange={(e) => setNovoProjeto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCriarProjeto();
                  if (e.key === 'Escape') setCriandoProjeto(false);
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCriarProjeto}
                disabled={!novoProjeto.trim() || criarProjetoMutation.isPending}
              >
                Criar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de projetos */}
        <div className="p-2">
          <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
            PROJETOS
          </div>
          
          {carregandoProjetos ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando projetos...
            </div>
          ) : projetosFiltrados.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {projetos.length === 0 ? 'Nenhum projeto encontrado' : 'Nenhum resultado'}
            </div>
          ) : (
            projetosFiltrados.map((projeto: Project) => (
              <div
                key={projeto.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent group ${
                  projetoAtivo?.id === projeto.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectProject?.(projeto)}
              >
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{projeto.name}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Deletar projeto "${projeto.name}"?`)) {
                      deletarProjetoMutation.mutate(projeto.id);
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Arquivos do projeto ativo */}
        {projetoAtivo && (
          <div className="p-2 border-t">
            {/* Criar arquivo */}
            {criandoArquivo && (
              <div className="mb-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="nome-do-arquivo.js"
                    value={novoArquivo}
                    onChange={(e) => setNovoArquivo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCriarArquivo();
                      if (e.key === 'Escape') setCriandoArquivo(false);
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleCriarArquivo}
                    disabled={!novoArquivo.trim() || criarArquivoMutation.isPending}
                  >
                    Criar
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
              ARQUIVOS - {projetoAtivo.name}
            </div>
            
            {carregandoArquivos ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando arquivos...
              </div>
            ) : arquivosFiltrados.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {arquivos.length === 0 ? 'Nenhum arquivo encontrado' : 'Nenhum resultado'}
              </div>
            ) : (
              arquivosFiltrados.map((arquivo: File) => (
                <div
                  key={arquivo.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent group ${
                    arquivoAtivo?.id === arquivo.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => onSelectFile?.(arquivo)}
                >
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{arquivo.name}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Deletar arquivo "${arquivo.name}"?`)) {
                        deletarArquivoMutation.mutate(arquivo.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}