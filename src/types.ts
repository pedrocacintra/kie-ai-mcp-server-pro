import { z } from 'zod';

// Common enums
export const ImageSizeEnum = z.enum([
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
  'auto'
]);

export const OutputFormatEnum = z.enum(['png', 'jpeg']);

// Zod schemas for request validation
export const NanoBananaGenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  image_size: ImageSizeEnum.optional(),
  output_format: OutputFormatEnum.optional()
});

export const NanoBananaEditSchema = z.object({
  prompt: z.string().min(1).max(1000),
  image_urls: z.array(z.string().url()).min(1).max(5),
  image_size: ImageSizeEnum.optional(),
  output_format: OutputFormatEnum.optional()
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

export const Gpt4oImageSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image_urls: z.array(z.string().url()).min(1).max(5).optional(),
  size: ImageSizeEnum.optional(),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const FluxKontextModelEnum = z.enum(['flux-kontext-pro', 'flux-kontext-max']);

export const FluxKontextGenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image_urls: z.array(z.string().url()).min(1).max(5).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  model: FluxKontextModelEnum.default('flux-kontext-pro'),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const FluxKontextEditSchema = FluxKontextGenerateSchema.extend({
  image_urls: z.array(z.string().url()).min(1).max(5)
});

export const MidjourneyImageSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image_urls: z.array(z.string().url()).min(1).max(4).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const RunwayAlephVideoSchema = z.object({
  prompt: z.string().min(1).max(2000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const LumaVideoSchema = z.object({
  prompt: z.string().min(1).max(2000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  callBackUrl: z.string().url().optional()
});

// TypeScript types
export type NanoBananaGenerateRequest = z.infer<typeof NanoBananaGenerateSchema>;
export type NanaBananaEditRequest = z.infer<typeof NanoBananaEditSchema>;
export type Veo3GenerateRequest = z.infer<typeof Veo3GenerateSchema>;
export type Gpt4oImageRequest = z.infer<typeof Gpt4oImageSchema>;
export type FluxKontextGenerateRequest = z.infer<typeof FluxKontextGenerateSchema>;
export type FluxKontextEditRequest = z.infer<typeof FluxKontextEditSchema>;
export type MidjourneyImageRequest = z.infer<typeof MidjourneyImageSchema>;
export type RunwayAlephVideoRequest = z.infer<typeof RunwayAlephVideoSchema>;
export type LumaVideoRequest = z.infer<typeof LumaVideoSchema>;

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
  api_type:
    | 'nano-banana'
    | 'nano-banana-edit'
    | 'veo3'
    | 'gpt4o-image'
    | 'flux-kontext-generate'
    | 'flux-kontext-edit'
    | 'midjourney-image'
    | 'runway-aleph-video'
    | 'luma-video';
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