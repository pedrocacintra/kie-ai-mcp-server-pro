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

export const VideoResolutionEnum = z.enum([
  '720p',
  '1080p',
  '4k',
  '8k',
  'auto'
]);

export const VideoFrameRateValues = [12, 15, 24, 25, 30, 48, 50, 60] as const;

export const VideoFrameRateEnum = z.union([
  z.literal(12),
  z.literal(15),
  z.literal(24),
  z.literal(25),
  z.literal(30),
  z.literal(48),
  z.literal(50),
  z.literal(60)
]);

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

export const Dalle3QualityEnum = z.enum(['standard', 'hd']);

export const Dalle3StyleEnum = z.enum(['vivid', 'natural']);

export const Dalle3ImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  image_urls: z.array(z.string().url()).min(1).max(5).optional(),
  size: ImageSizeEnum.optional(),
  quality: Dalle3QualityEnum.optional(),
  style: Dalle3StyleEnum.optional(),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const IdeogramModelEnum = z.enum([
  'ideogram-2',
  'ideogram-3',
  'ideogram-3-rapid'
]);

export const IdeogramImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negative_prompt: z.string().max(2000).optional(),
  image_urls: z.array(z.string().url()).min(1).max(5).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  style: z.string().max(100).optional(),
  model: IdeogramModelEnum.default('ideogram-3'),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const StableDiffusionSchedulerEnum = z.enum([
  'ddim',
  'pndm',
  'euler',
  'euler_a',
  'heun',
  'dpmpp_2m'
]);

export const StableDiffusion3ImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negative_prompt: z.string().max(2000).optional(),
  image_urls: z.array(z.string().url()).min(1).max(4).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  guidance_scale: z.number().min(0).max(20).optional(),
  steps: z.number().int().min(10).max(150).optional(),
  scheduler: StableDiffusionSchedulerEnum.optional(),
  output_format: OutputFormatEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const PlaygroundModelEnum = z.enum(['playground-v2', 'playground-v2.5', 'playground-v3']);

export const PlaygroundImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negative_prompt: z.string().max(2000).optional(),
  image_urls: z.array(z.string().url()).min(1).max(4).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  guidance_scale: z.number().min(0).max(20).optional(),
  steps: z.number().int().min(10).max(150).optional(),
  model: PlaygroundModelEnum.default('playground-v3'),
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

export const Sora2StyleEnum = z.enum([
  'cinematic',
  'photorealistic',
  'animation',
  'stylized',
  'documentary',
  'surreal'
]);

export const Sora2CameraMotionEnum = z.enum([
  'static',
  'handheld',
  'dolly',
  'crane',
  'drone',
  'steadicam'
]);

export const Sora2VideoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negative_prompt: z.string().max(2000).optional(),
  imageUrls: z.array(z.string().url()).max(8).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  resolution: VideoResolutionEnum.optional(),
  frameRate: VideoFrameRateEnum.optional(),
  style: Sora2StyleEnum.optional(),
  cameraMotion: Sora2CameraMotionEnum.optional(),
  seed: z.number().int().min(0).max(999999).optional(),
  guidance_scale: z.number().min(0).max(20).optional(),
  remove_watermark: z.boolean().default(true),
  callBackUrl: z.string().url().optional()
});

export const RunwayGen3ModelEnum = z.enum(['runway-gen3', 'runway-gen3-light', 'runway-gen3-alpha']);

export const RunwayGen3VideoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  model: RunwayGen3ModelEnum.default('runway-gen3'),
  resolution: VideoResolutionEnum.optional(),
  frameRate: VideoFrameRateEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const KlingVideoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  mode: z.enum(['standard', 'fast', 'turbo']).default('standard'),
  resolution: VideoResolutionEnum.optional(),
  frameRate: VideoFrameRateEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const PikaVideoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(30).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  mode: z.enum(['creative', 'realistic', 'animation']).default('creative'),
  resolution: VideoResolutionEnum.optional(),
  frameRate: VideoFrameRateEnum.optional(),
  callBackUrl: z.string().url().optional()
});

export const HaiperVideoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  duration: z.number().int().min(1).max(120).optional(),
  aspectRatio: ImageSizeEnum.optional(),
  look: z.string().max(100).optional(),
  resolution: VideoResolutionEnum.optional(),
  frameRate: VideoFrameRateEnum.optional(),
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
export type Dalle3ImageRequest = z.infer<typeof Dalle3ImageSchema>;
export type IdeogramImageRequest = z.infer<typeof IdeogramImageSchema>;
export type StableDiffusion3ImageRequest = z.infer<typeof StableDiffusion3ImageSchema>;
export type PlaygroundImageRequest = z.infer<typeof PlaygroundImageSchema>;
export type RunwayAlephVideoRequest = z.infer<typeof RunwayAlephVideoSchema>;
export type LumaVideoRequest = z.infer<typeof LumaVideoSchema>;
export type Sora2VideoRequest = z.infer<typeof Sora2VideoSchema>;
export type RunwayGen3VideoRequest = z.infer<typeof RunwayGen3VideoSchema>;
export type KlingVideoRequest = z.infer<typeof KlingVideoSchema>;
export type PikaVideoRequest = z.infer<typeof PikaVideoSchema>;
export type HaiperVideoRequest = z.infer<typeof HaiperVideoSchema>;

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
    | 'dalle3-image'
    | 'ideogram-image'
    | 'stable-diffusion3-image'
    | 'playground-image'
    | 'runway-aleph-video'
    | 'luma-video'
    | 'sora2-video'
    | 'runway-gen3-video'
    | 'kling-video'
    | 'pika-video'
    | 'haiper-video';
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