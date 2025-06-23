import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { ChatIA } from '@/components/ChatIA';

import type { Project, File } from '@shared/schema';

export default function App() {
  const [tema, setTema] = useState<'light' | 'dark'>('dark');
  const [projetoAtivo, setProjetoAtivo] = useState<Project | null>(null);
  const [arquivoAtivo, setArquivoAtivo] = useState<File | null>(null);
  const [codigoSelecionado, setCodigoSelecionado] = useState<string>('');

  // Gerenciar tema
  useEffect(() => {
    const temaLocal = localStorage.getItem('tema') as 'light' | 'dark' || 'dark';
    setTema(temaLocal);
    document.documentElement.classList.toggle('light', temaLocal === 'light');
  }, []);

  const alternarTema = () => {
    const novoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(novoTema);
    localStorage.setItem('tema', novoTema);
    document.documentElement.classList.toggle('light', novoTema === 'light');
  };

  // Salvar arquivo
  const handleSalvarArquivo = async (conteudo: string) => {
    if (!arquivoAtivo) return;

    try {
      const response = await fetch(`/api/arquivos/${arquivoAtivo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: conteudo,
          size: conteudo.length,
        }),
      });

      if (response.ok) {
        const arquivoAtualizado = await response.json();
        setArquivoAtivo(arquivoAtualizado);
        
        // Invalidar queries para atualizar a interface
        queryClient.invalidateQueries({
          queryKey: ['/api/projetos', projetoAtivo?.id, 'arquivos']
        });
      }
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
    }
  };

  // Analisar código com IA
  const handleAnalisarCodigo = async (codigo: string, linguagem: string) => {
    try {
      const response = await fetch('/api/analisar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, linguagem }),
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('Análise da IA:', resultado.analise);
        // Você pode implementar um toast ou modal para mostrar a análise
      }
    } catch (error) {
      console.error('Erro na análise:', error);
    }
  };

  // Aplicar código gerado pela IA
  const handleCodigoGerado = (codigo: string) => {
    if (arquivoAtivo) {
      // Aqui você pode implementar a lógica para inserir o código no editor
      // Por exemplo, substituir o conteúdo atual ou inserir em uma posição específica
      console.log('Código gerado pela IA:', codigo);
    }
  };

  // Modificar arquivo pela IA
  const handleArquivoModificado = (arquivo: File, novoConteudo: string) => {
    if (arquivo.id === arquivoAtivo?.id) {
      setArquivoAtivo({
        ...arquivo,
        content: novoConteudo,
      });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="ide-layout">
        {/* Cabeçalho */}
        <Header
          projetoAtivo={projetoAtivo}
          onToggleTheme={alternarTema}
          tema={tema}
        />

        {/* Barra lateral */}
        <Sidebar
          projetoAtivo={projetoAtivo}
          arquivoAtivo={arquivoAtivo}
          onSelectProject={setProjetoAtivo}
          onSelectFile={setArquivoAtivo}
        />

        {/* Editor principal */}
        <div className="ide-editor">
          <Editor
            arquivo={arquivoAtivo}
            onSave={handleSalvarArquivo}
            onAnalyzeCode={handleAnalisarCodigo}
          />
        </div>

        {/* Chat da IA */}
        <div className="ide-chat">
          <ChatIA
            projectId={projetoAtivo?.id}
            fileId={arquivoAtivo?.id}
            selectedCode={codigoSelecionado}
            language={arquivoAtivo?.nome?.split('.').pop()}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}