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
  Dalle3ImageRequest,
  IdeogramImageRequest,
  StableDiffusion3ImageRequest,
  PlaygroundImageRequest,
  RunwayAlephVideoRequest,
  LumaVideoRequest,
  Sora2VideoRequest,
  RunwayGen3VideoRequest,
  KlingVideoRequest,
  PikaVideoRequest,
  HaiperVideoRequest,
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

  async generateDalle3(request: Dalle3ImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/openai/dalle3/generate', 'POST', request);
  }

  async generateIdeogram(request: IdeogramImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/ideogram/generate', 'POST', request);
  }

  async generateStableDiffusion3(request: StableDiffusion3ImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/stability/sd3/generate', 'POST', request);
  }

  async generatePlayground(request: PlaygroundImageRequest): Promise<KieAiResponse<ImageResponse>> {
    return this.makeRequest<ImageResponse>('/playground/v3/generate', 'POST', request);
  }

  async generateRunwayAlephVideo(request: RunwayAlephVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/runway/aleph/generate', 'POST', request);
  }

  async generateLumaVideo(request: LumaVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/luma/generate', 'POST', request);
  }

  async generateSora2Video(request: Sora2VideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/sora/v2/generate', 'POST', request);
  }

  async generateRunwayGen3Video(request: RunwayGen3VideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/runway/gen3/generate', 'POST', request);
  }

  async generateKlingVideo(request: KlingVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/kling/generate', 'POST', request);
  }

  async generatePikaVideo(request: PikaVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/pika/generate', 'POST', request);
  }

  async generateHaiperVideo(request: HaiperVideoRequest): Promise<KieAiResponse<TaskResponse>> {
    return this.makeRequest<TaskResponse>('/haiper/generate', 'POST', request);
  }

  async getTaskStatus(taskId: string, apiType?: string): Promise<KieAiResponse<any>> {
    const endpointMap: Record<string, string[]> = {
      'nano-banana': ['/playground/recordInfo'],
      'nano-banana-edit': ['/playground/recordInfo'],
      'gpt4o-image': ['/gpt4o-image/record-info'],
      'flux-kontext-generate': ['/flux/kontext/record-info'],
      'flux-kontext-edit': ['/flux/kontext/record-info'],
      'midjourney-image': ['/midjourney/record-info'],
      'dalle3-image': ['/openai/dalle3/record-info'],
      'ideogram-image': ['/ideogram/record-info'],
      'stable-diffusion3-image': ['/stability/sd3/record-info'],
      'playground-image': ['/playground/v3/record-info', '/playground/recordInfo'],
      'veo3': ['/veo/record-info'],
      'runway-aleph-video': ['/runway/aleph/record-info'],
      'luma-video': ['/luma/record-info'],
      'sora2-video': ['/sora/v2/record-info'],
      'runway-gen3-video': ['/runway/gen3/record-info'],
      'kling-video': ['/kling/record-info'],
      'pika-video': ['/pika/record-info'],
      'haiper-video': ['/haiper/record-info']
    };

    const endpointsToTry: string[] = [];

    if (apiType && endpointMap[apiType]) {
      endpointsToTry.push(...endpointMap[apiType]);
    }

    // Default fallbacks for unknown task types
    endpointsToTry.push('/playground/recordInfo', '/veo/record-info');

    let lastError: unknown = null;
    for (const endpoint of endpointsToTry) {
      try {
        return await this.makeRequest<any>(`${endpoint}?taskId=${taskId}`, 'GET');
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error('Unable to fetch task status');
  }

  async getVeo1080pVideo(taskId: string, index?: number): Promise<KieAiResponse<any>> {
    const params = new URLSearchParams({ taskId });
    if (index !== undefined) {
      params.append('index', index.toString());
    }
    return this.makeRequest<any>(`/veo/get-1080p-video?${params}`, 'GET');
  }
}