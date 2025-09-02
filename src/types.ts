import { z } from 'zod';

// Zod schemas for request validation
export const NanoBananaGenerateSchema = z.object({
  prompt: z.string().min(1).max(1000)
});

export const NanoBananaEditSchema = z.object({
  prompt: z.string().min(1).max(1000),
  image_urls: z.array(z.string().url()).min(1).max(5)
});

export const Veo3GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  imageUrls: z.array(z.string().url()).max(1).optional(),
  model: z.enum(['veo3', 'veo3_fast']).default('veo3'),
  watermark: z.string().max(100).optional(),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  seeds: z.number().int().min(10000).max(99999).optional(),
  callBackUrl: z.string().url().optional(),
  enableFallback: z.boolean().default(false)
});

// TypeScript types
export type NanoBananaGenerateRequest = z.infer<typeof NanoBananaGenerateSchema>;
export type NanaBananaEditRequest = z.infer<typeof NanoBananaEditSchema>;
export type Veo3GenerateRequest = z.infer<typeof Veo3GenerateSchema>;

export interface KieAiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

export interface ImageResponse {
  imageUrl?: string;
  taskId?: string;
}

export interface TaskResponse {
  taskId: string;
}

export interface TaskRecord {
  id?: number;
  task_id: string;
  api_type: 'nano-banana' | 'nano-banana-edit' | 'veo3';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result_url?: string;
  error_message?: string;
}

export interface KieAiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}