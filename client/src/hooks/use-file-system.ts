import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useFileSystem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get file tree
  const useFileTree = () => {
    return useQuery({
      queryKey: ["/api/files/tree"],
    });
  };

  // Get file content
  const useFileContent = (path: string) => {
    return useQuery({
      queryKey: ["/api/files/content", path],
      enabled: !!path,
    });
  };

  // Save file
  const useSaveFile = () => {
    return useMutation({
      mutationFn: async ({ path, content }: { path: string; content: string }) => {
        return apiRequest("POST", "/api/files/save", { path, content });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/files/tree"] });
        toast({
          title: "File saved",
          description: "File has been saved successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error saving file",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Create file or directory
  const useCreateFile = () => {
    return useMutation({
      mutationFn: async ({ 
        path, 
        isDirectory = false, 
        content = "" 
      }: { 
        path: string; 
        isDirectory?: boolean; 
        content?: string; 
      }) => {
        return apiRequest("POST", "/api/files/create", { path, isDirectory, content });
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["/api/files/tree"] });
        toast({
          title: `${variables.isDirectory ? 'Directory' : 'File'} created`,
          description: `${variables.path} has been created successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error creating file",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Delete file or directory
  const useDeleteFile = () => {
    return useMutation({
      mutationFn: async (path: string) => {
        return apiRequest("DELETE", `/api/files?path=${encodeURIComponent(path)}`);
      },
      onSuccess: (_, path) => {
        queryClient.invalidateQueries({ queryKey: ["/api/files/tree"] });
        toast({
          title: "File deleted",
          description: `${path} has been deleted successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error deleting file",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    useFileTree,
    useFileContent,
    useSaveFile,
    useCreateFile,
    useDeleteFile,
  };
}
