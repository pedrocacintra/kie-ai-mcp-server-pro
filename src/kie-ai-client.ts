import { 
  KieAiConfig, 
  KieAiResponse, 
  NanoBananaGenerateRequest, 
  NanaBananaEditRequest,
  Veo3GenerateRequest,
  ImageResponse,
  TaskResponse 
} from './types.js';

export class KieAiClient {
  private config: KieAiConfig;

  constructor(config: KieAiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<KieAiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout)
    };

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json() as KieAiResponse<T>;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.msg || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async generateNanoBanana(request: NanoBananaGenerateRequest): Promise<KieAiResponse<ImageResponse>> {
    // Note: Actual endpoint needs verification - using placeholder based on UI discovery
    return this.makeRequest<ImageResponse>('/nano-banana/generate', 'POST', request);
  }

  async editNanaBanana(request: NanaBananaEditRequest): Promise<KieAiResponse<ImageResponse>> {
    // Note: Actual endpoint needs verification - using placeholder based on UI discovery
    return this.makeRequest<ImageResponse>('/nano-banana-edit/generate', 'POST', request);
  }

  async generateVeo3Video(request: Veo3GenerateRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/veo/generate', 'POST', request);
  }

  // Placeholder for task status polling - actual endpoint needs discovery
  async getTaskStatus(taskId: string): Promise<KieAiResponse<any>> {
    return this.makeRequest<any>(`/task/${taskId}`, 'GET');
  }
}