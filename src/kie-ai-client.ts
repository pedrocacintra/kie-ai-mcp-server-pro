import {
  KieAiConfig,
  KieAiResponse,
  NanoBananaGenerateRequest,
  NanaBananaEditRequest,
  Veo3GenerateRequest,
  Gpt4oImageRequest,
  FluxKontextGenerateRequest,
  FluxKontextEditRequest,
  MidjourneyImageRequest,
  RunwayAlephVideoRequest,
  LumaVideoRequest,
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
    const playgroundRequest = {
      model: 'google/nano-banana',
      input: {
        prompt: request.prompt,
        ...(request.image_size ? { image_size: request.image_size } : {}),
        ...(request.output_format ? { output_format: request.output_format } : {})
      }
    };
    return this.makeRequest<ImageResponse>('/playground/createTask', 'POST', playgroundRequest);
  }

  async editNanoBanana(request: NanaBananaEditRequest): Promise<KieAiResponse<ImageResponse>> {
    const playgroundRequest = {
      model: 'google/nano-banana-edit',
      input: {
        prompt: request.prompt,
        image_urls: request.image_urls,
        ...(request.image_size ? { image_size: request.image_size } : {}),
        ...(request.output_format ? { output_format: request.output_format } : {})
      }
    };
    return this.makeRequest<ImageResponse>('/playground/createTask', 'POST', playgroundRequest);
  }

  async generateVeo3Video(request: Veo3GenerateRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/veo/generate', 'POST', request);
  }

  async generateGpt4oImage(request: Gpt4oImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/gpt4o-image/generate', 'POST', request);
  }

  async generateFluxKontext(request: FluxKontextGenerateRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/flux/kontext/generate', 'POST', request);
  }

  async editFluxKontext(request: FluxKontextEditRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/flux/kontext/edit', 'POST', request);
  }

  async generateMidjourney(request: MidjourneyImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/midjourney/generate', 'POST', request);
  }

  async generateRunwayAlephVideo(request: RunwayAlephVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/runway/aleph/generate', 'POST', request);
  }

  async generateLumaVideo(request: LumaVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/luma/generate', 'POST', request);
  }

  async getTaskStatus(taskId: string, apiType?: string): Promise<KieAiResponse<any>> {
    // Use api_type to determine correct endpoint, with fallback strategy
    if (apiType === 'veo3') {
      return this.makeRequest<any>(`/veo/record-info?taskId=${taskId}`, 'GET');
    } else if (apiType === 'nano-banana' || apiType === 'nano-banana-edit') {
      return this.makeRequest<any>(`/playground/recordInfo?taskId=${taskId}`, 'GET');
    }
    
    // Fallback: try playground first, then veo (for tasks not in database)
    try {
      return await this.makeRequest<any>(`/playground/recordInfo?taskId=${taskId}`, 'GET');
    } catch (error) {
      try {
        return await this.makeRequest<any>(`/veo/record-info?taskId=${taskId}`, 'GET');
      } catch (veoError) {
        throw error;
      }
    }
  }

  async getVeo1080pVideo(taskId: string, index?: number): Promise<KieAiResponse<any>> {
    const params = new URLSearchParams({ taskId });
    if (index !== undefined) {
      params.append('index', index.toString());
    }
    return this.makeRequest<any>(`/veo/get-1080p-video?${params}`, 'GET');
  }
}