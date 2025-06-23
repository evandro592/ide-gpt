export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}_${endpoint}`;
  
  // Check cache for GET requests
  if (!options.method || options.method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  // Cache successful GET responses
  if (response.ok && (!options.method || options.method === 'GET')) {
    try {
      const data = await response.clone().json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
    } catch {
      // Skip caching if response is not JSON
    }
  }

  return response;
}

export async function get(endpoint: string): Promise<Response> {
  return apiCall(endpoint, { method: "GET" });
}

export async function post(endpoint: string, data?: any): Promise<Response> {
  return apiCall(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function put(endpoint: string, data?: any): Promise<Response> {
  return apiCall(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function del(endpoint: string): Promise<Response> {
  return apiCall(endpoint, { method: "DELETE" });
}

// File system API functions
export async function getFileTree() {
  const response = await get("/api/files/tree");
  return response.json();
}

export async function getFileContent(path: string) {
  const response = await get(`/api/files/content?path=${encodeURIComponent(path)}`);
  return response.json();
}

export async function saveFile(path: string, content: string) {
  const response = await post("/api/files/save", { path, content });
  return response.json();
}

export async function createFile(path: string, isDirectory: boolean = false, content: string = "") {
  const response = await post("/api/files/create", { path, isDirectory, content });
  return response.json();
}

export async function deleteFile(path: string) {
  const response = await del(`/api/files?path=${encodeURIComponent(path)}`);
  return response.json();
}

// Chat API functions
export async function getChatMessages() {
  const response = await get("/api/chat/messages");
  return response.json();
}

export async function sendChatMessage(content: string, context?: string) {
  const response = await post("/api/chat/send", { content, context });
  return response.json();
}

export async function clearChatHistory() {
  const response = await del("/api/chat/clear");
  return response.json();
}

// AI API functions
export async function analyzeCode(code: string, language: string = "javascript") {
  const response = await post("/api/ai/analyze", { code, language });
  return response.json();
}

export async function generateCode(prompt: string, language: string = "javascript") {
  const response = await post("/api/ai/generate", { prompt, language });
  return response.json();
}

export async function explainCode(code: string, language: string = "javascript") {
  const response = await post("/api/ai/explain", { code, language });
  return response.json();
}

// Scripts API functions
export async function getScriptTemplates() {
  const response = await get("/api/scripts/templates");
  return response.json();
}

export async function generateScript(scriptName: string) {
  const response = await post("/api/scripts/generate", { scriptName });
  return response.json();
}

// Settings API functions
export async function getSettings() {
  const response = await get("/api/settings");
  return response.json();
}

export async function updateSettings(settings: any) {
  const response = await post("/api/settings", settings);
  return response.json();
}
