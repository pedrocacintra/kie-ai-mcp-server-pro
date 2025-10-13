#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { KieAiClient } from './kie-ai-client.js';
import { TaskDatabase } from './database.js';
import {
  NanoBananaGenerateSchema,
  NanoBananaEditSchema,
  Veo3GenerateSchema,
  Gpt4oImageSchema,
  FluxKontextGenerateSchema,
  FluxKontextEditSchema,
  MidjourneyImageSchema,
  Dalle3ImageSchema,
  Dalle3QualityEnum,
  Dalle3StyleEnum,
  IdeogramImageSchema,
  IdeogramModelEnum,
  StableDiffusion3ImageSchema,
  StableDiffusionSchedulerEnum,
  PlaygroundImageSchema,
  PlaygroundModelEnum,
  RunwayAlephVideoSchema,
  LumaVideoSchema,
  Sora2VideoSchema,
  Sora2StyleEnum,
  Sora2CameraMotionEnum,
  RunwayGen3VideoSchema,
  RunwayGen3ModelEnum,
  KlingVideoSchema,
  PikaVideoSchema,
  HaiperVideoSchema,
  ImageSizeEnum,
  OutputFormatEnum,
  FluxKontextModelEnum,
  VideoResolutionEnum,
  VideoFrameRateValues,
  KieAiConfig
} from './types.js';

interface ImageToolConfig {
  name: string;
  description: string;
  schema: any;
  jsonSchema: Record<string, unknown>;
  apiType:
    | 'nano-banana'
    | 'nano-banana-edit'
    | 'gpt4o-image'
    | 'flux-kontext-generate'
    | 'flux-kontext-edit'
    | 'midjourney-image'
    | 'dalle3-image'
    | 'ideogram-image'
    | 'stable-diffusion3-image'
    | 'playground-image';
  successMessage: string;
  call: (client: KieAiClient, request: any) => Promise<any>;
}

interface VideoToolConfig {
  name: string;
  description: string;
  schema: any;
  jsonSchema: Record<string, unknown>;
  apiType:
    | 'veo3'
    | 'runway-aleph-video'
    | 'luma-video'
    | 'sora2-video'
    | 'runway-gen3-video'
    | 'kling-video'
    | 'pika-video'
    | 'haiper-video';
  successMessage: string;
  call: (client: KieAiClient, request: any) => Promise<any>;
}

class KieAiMcpServer {
  private server: Server;
  private client: KieAiClient;
  private db: TaskDatabase;
  private readonly imageTools: ImageToolConfig[];
  private readonly videoTools: VideoToolConfig[];

  constructor() {
    this.server = new Server({
      name: 'kie-ai-mcp-server',
      version: '1.0.0'
    });

    const config: KieAiConfig = {
      apiKey: process.env.KIE_AI_API_KEY || '',
      baseUrl: process.env.KIE_AI_BASE_URL || 'https://api.kie.ai/api/v1',
      timeout: parseInt(process.env.KIE_AI_TIMEOUT || '60000')
    };

    if (!config.apiKey) {
      throw new Error('KIE_AI_API_KEY environment variable is required');
    }

    this.client = new KieAiClient(config);
    this.db = new TaskDatabase(process.env.KIE_AI_DB_PATH);

    this.imageTools = this.buildImageTools();
    this.videoTools = this.buildVideoTools();

    this.setupHandlers();
  }

  private buildImageTools(): ImageToolConfig[] {
    return [
      {
        name: 'generate_nano_banana',
        description: "Generate images using Google's Gemini 2.5 Flash Image Preview (Nano Banana)",
        schema: NanoBananaGenerateSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for image generation',
              minLength: 1,
              maxLength: 1000
            },
            image_size: {
              type: 'string',
              description: 'Desired aspect ratio for the output image',
              enum: ImageSizeEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            }
          },
          required: ['prompt']
        },
        apiType: 'nano-banana',
        successMessage: 'Nano Banana image generation initiated',
        call: (client, request) => client.generateNanoBanana(request)
      },
      {
        name: 'edit_nano_banana',
        description: 'Edit images using natural language prompts with Nano Banana Edit',
        schema: NanoBananaEditSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for image editing',
              minLength: 1,
              maxLength: 1000
            },
            image_urls: {
              type: 'array',
              description: 'URLs of input images for editing (max 5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            image_size: {
              type: 'string',
              description: 'Desired aspect ratio for the edited image',
              enum: ImageSizeEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            }
          },
          required: ['prompt', 'image_urls']
        },
        apiType: 'nano-banana-edit',
        successMessage: 'Nano Banana image editing initiated',
        call: (client, request) => client.editNanoBanana(request)
      },
      {
        name: 'generate_gpt4o_image',
        description: 'Generate images using the GPT-4o image generation API',
        schema: Gpt4oImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for GPT-4o image generation',
              minLength: 1,
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference images (max 5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            size: {
              type: 'string',
              description: 'Image aspect ratio/size',
              enum: ImageSizeEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL to receive the generated image',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'gpt4o-image',
        successMessage: 'GPT-4o image generation initiated',
        call: (client, request) => client.generateGpt4oImage(request)
      },
      {
        name: 'generate_flux_image',
        description: 'Generate images using Flux Kontext models',
        schema: FluxKontextGenerateSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Flux Kontext image',
              minLength: 1,
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference or init images (max 5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            model: {
              type: 'string',
              description: 'Flux Kontext model variant',
              enum: FluxKontextModelEnum.options,
              default: 'flux-kontext-pro'
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task completion notifications',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'flux-kontext-generate',
        successMessage: 'Flux Kontext image generation initiated',
        call: (client, request) => client.generateFluxKontext(request)
      },
      {
        name: 'edit_flux_image',
        description: 'Edit images using Flux Kontext models',
        schema: FluxKontextEditSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Instructions for editing the image',
              minLength: 1,
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Source images to edit (1-5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            model: {
              type: 'string',
              description: 'Flux Kontext model variant',
              enum: FluxKontextModelEnum.options,
              default: 'flux-kontext-pro'
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task completion notifications',
              format: 'uri'
            }
          },
          required: ['prompt', 'image_urls']
        },
        apiType: 'flux-kontext-edit',
        successMessage: 'Flux Kontext image editing initiated',
        call: (client, request) => client.editFluxKontext(request)
      },
      {
        name: 'generate_midjourney_image',
        description: 'Generate images using the Midjourney API',
        schema: MidjourneyImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Midjourney image',
              minLength: 1,
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 4
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL to receive finished images',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'midjourney-image',
        successMessage: 'Midjourney image generation initiated',
        call: (client, request) => client.generateMidjourney(request)
      },
      {
        name: 'generate_dalle3_image',
        description: "Generate images using OpenAI's DALL·E 3 via Kie.ai",
        schema: Dalle3ImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired image',
              minLength: 1,
              maxLength: 4000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference or editing images (max 5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            size: {
              type: 'string',
              description: 'Image size or aspect ratio',
              enum: ImageSizeEnum.options
            },
            quality: {
              type: 'string',
              description: 'DALL·E 3 quality mode',
              enum: Dalle3QualityEnum.options
            },
            style: {
              type: 'string',
              description: 'DALL·E 3 style preset',
              enum: Dalle3StyleEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL to receive task results',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'dalle3-image',
        successMessage: 'DALL·E 3 image generation initiated',
        call: (client, request) => client.generateDalle3(request)
      },
      {
        name: 'generate_ideogram_image',
        description: 'Generate images using Ideogram 3 models',
        schema: IdeogramImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Ideogram image',
              minLength: 1,
              maxLength: 4000
            },
            negative_prompt: {
              type: 'string',
              description: 'Optional negative prompt to avoid concepts',
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference images (max 5)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 5
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            style: {
              type: 'string',
              description: 'Named style preset',
              maxLength: 100
            },
            model: {
              type: 'string',
              description: 'Ideogram model variant',
              enum: IdeogramModelEnum.options,
              default: 'ideogram-3'
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL to receive the generated image',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'ideogram-image',
        successMessage: 'Ideogram image generation initiated',
        call: (client, request) => client.generateIdeogram(request)
      },
      {
        name: 'generate_stable_diffusion3_image',
        description: 'Generate images using Stability AI\'s Stable Diffusion 3 models',
        schema: StableDiffusion3ImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Stable Diffusion image',
              minLength: 1,
              maxLength: 4000
            },
            negative_prompt: {
              type: 'string',
              description: 'Optional negative prompt to avoid concepts',
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 4
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            guidance_scale: {
              type: 'number',
              description: 'Classifier-free guidance scale (0-20)',
              minimum: 0,
              maximum: 20
            },
            steps: {
              type: 'integer',
              description: 'Number of inference steps (10-150)',
              minimum: 10,
              maximum: 150
            },
            scheduler: {
              type: 'string',
              description: 'Diffusion scheduler',
              enum: StableDiffusionSchedulerEnum.options
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task completion notifications',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'stable-diffusion3-image',
        successMessage: 'Stable Diffusion 3 image generation initiated',
        call: (client, request) => client.generateStableDiffusion3(request)
      },
      {
        name: 'generate_playground_image',
        description: 'Generate images using Playground v3 models',
        schema: PlaygroundImageSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Playground image',
              minLength: 1,
              maxLength: 4000
            },
            negative_prompt: {
              type: 'string',
              description: 'Optional negative prompt to avoid concepts',
              maxLength: 2000
            },
            image_urls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              minItems: 1,
              maxItems: 4
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              enum: ImageSizeEnum.options
            },
            guidance_scale: {
              type: 'number',
              description: 'Classifier-free guidance scale (0-20)',
              minimum: 0,
              maximum: 20
            },
            steps: {
              type: 'integer',
              description: 'Number of diffusion steps (10-150)',
              minimum: 10,
              maximum: 150
            },
            model: {
              type: 'string',
              description: 'Playground model version',
              enum: PlaygroundModelEnum.options,
              default: 'playground-v3'
            },
            output_format: {
              type: 'string',
              description: 'Output image format',
              enum: OutputFormatEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task completion notifications',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'playground-image',
        successMessage: 'Playground image generation initiated',
        call: (client, request) => client.generatePlayground(request)
      }
    ];
  }

  private buildVideoTools(): VideoToolConfig[] {
    return [
      {
        name: 'generate_veo3_video',
        description: "Generate professional-quality videos using Google's Veo3 API",
        schema: Veo3GenerateSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt describing desired video content',
              minLength: 1,
              maxLength: 2000
            },
            imageUrls: {
              type: 'array',
              description: 'Image URLs for image-to-video generation (max 1)',
              items: { type: 'string', format: 'uri' },
              maxItems: 1
            },
            model: {
              type: 'string',
              enum: ['veo3', 'veo3_fast'],
              description: 'Model type: veo3 (quality) or veo3_fast (cost-efficient)',
              default: 'veo3'
            },
            watermark: {
              type: 'string',
              description: 'Watermark text to add to video',
              maxLength: 100
            },
            aspectRatio: {
              type: 'string',
              enum: ['16:9', '9:16'],
              description: 'Video aspect ratio',
              default: '16:9'
            },
            seeds: {
              type: 'integer',
              description: 'Random seed for consistent results',
              minimum: 10000,
              maximum: 99999
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            },
            enableFallback: {
              type: 'boolean',
              description: 'Enable fallback mechanism for content policy failures',
              default: false
            }
          },
          required: ['prompt']
        },
        apiType: 'veo3',
        successMessage: 'Veo3 video generation task created successfully',
        call: (client, request) => client.generateVeo3Video(request)
      },
      {
        name: 'generate_runway_aleph_video',
        description: 'Generate videos using Runway Aleph',
        schema: RunwayAlephVideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Runway Aleph video',
              minLength: 1,
              maxLength: 2000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'runway-aleph-video',
        successMessage: 'Runway Aleph video generation initiated',
        call: (client, request) => client.generateRunwayAlephVideo(request)
      },
      {
        name: 'generate_luma_video',
        description: 'Generate videos using Luma AI',
        schema: LumaVideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Luma video',
              minLength: 1,
              maxLength: 2000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'luma-video',
        successMessage: 'Luma video generation initiated',
        call: (client, request) => client.generateLumaVideo(request)
      },
      {
        name: 'generate_sora2_video',
        description: 'Generate videos using OpenAI Sora 2 with watermark removal enabled by default',
        schema: Sora2VideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Sora 2 video',
              minLength: 1,
              maxLength: 4000
            },
            negative_prompt: {
              type: 'string',
              description: 'Optional negative prompt to avoid concepts',
              maxLength: 2000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference frames or storyboards (max 8)',
              items: { type: 'string', format: 'uri' },
              maxItems: 8
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            resolution: {
              type: 'string',
              description: 'Target video resolution',
              enum: VideoResolutionEnum.options
            },
            frameRate: {
              type: 'integer',
              description: 'Target frame rate',
              enum: VideoFrameRateValues
            },
            style: {
              type: 'string',
              description: 'High-level style preset',
              enum: Sora2StyleEnum.options
            },
            cameraMotion: {
              type: 'string',
              description: 'Camera motion preset',
              enum: Sora2CameraMotionEnum.options
            },
            seed: {
              type: 'integer',
              description: 'Random seed for repeatable generations',
              minimum: 0,
              maximum: 999999
            },
            guidance_scale: {
              type: 'number',
              description: 'Guidance scale (0-20)',
              minimum: 0,
              maximum: 20
            },
            remove_watermark: {
              type: 'boolean',
              description: 'Remove watermark from output (enabled by default)',
              default: true
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'sora2-video',
        successMessage: 'Sora 2 video generation initiated',
        call: (client, request) => client.generateSora2Video(request)
      },
      {
        name: 'generate_runway_gen3_video',
        description: 'Generate videos using Runway Gen-3 models',
        schema: RunwayGen3VideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Runway Gen-3 video',
              minLength: 1,
              maxLength: 4000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            model: {
              type: 'string',
              description: 'Runway Gen-3 model variant',
              enum: RunwayGen3ModelEnum.options,
              default: 'runway-gen3'
            },
            resolution: {
              type: 'string',
              description: 'Target video resolution',
              enum: VideoResolutionEnum.options
            },
            frameRate: {
              type: 'integer',
              description: 'Target frame rate',
              enum: VideoFrameRateValues
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'runway-gen3-video',
        successMessage: 'Runway Gen-3 video generation initiated',
        call: (client, request) => client.generateRunwayGen3Video(request)
      },
      {
        name: 'generate_kling_video',
        description: 'Generate videos using Kling models',
        schema: KlingVideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Kling video',
              minLength: 1,
              maxLength: 4000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            mode: {
              type: 'string',
              description: 'Kling generation mode',
              enum: ['standard', 'fast', 'turbo'],
              default: 'standard'
            },
            resolution: {
              type: 'string',
              description: 'Target video resolution',
              enum: VideoResolutionEnum.options
            },
            frameRate: {
              type: 'integer',
              description: 'Target frame rate',
              enum: VideoFrameRateValues
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'kling-video',
        successMessage: 'Kling video generation initiated',
        call: (client, request) => client.generateKlingVideo(request)
      },
      {
        name: 'generate_pika_video',
        description: 'Generate videos using Pika models',
        schema: PikaVideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Pika video',
              minLength: 1,
              maxLength: 4000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-30)',
              minimum: 1,
              maximum: 30
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            mode: {
              type: 'string',
              description: 'Pika generation mode',
              enum: ['creative', 'realistic', 'animation'],
              default: 'creative'
            },
            resolution: {
              type: 'string',
              description: 'Target video resolution',
              enum: VideoResolutionEnum.options
            },
            frameRate: {
              type: 'integer',
              description: 'Target frame rate',
              enum: VideoFrameRateValues
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'pika-video',
        successMessage: 'Pika video generation initiated',
        call: (client, request) => client.generatePikaVideo(request)
      },
      {
        name: 'generate_haiper_video',
        description: 'Generate videos using Haiper models',
        schema: HaiperVideoSchema,
        jsonSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt describing the desired Haiper video',
              minLength: 1,
              maxLength: 4000
            },
            imageUrls: {
              type: 'array',
              description: 'Optional reference images (max 4)',
              items: { type: 'string', format: 'uri' },
              maxItems: 4
            },
            duration: {
              type: 'integer',
              description: 'Video duration in seconds (1-120)',
              minimum: 1,
              maximum: 120
            },
            aspectRatio: {
              type: 'string',
              description: 'Video aspect ratio',
              enum: ImageSizeEnum.options
            },
            look: {
              type: 'string',
              description: 'Optional look preset name',
              maxLength: 100
            },
            resolution: {
              type: 'string',
              description: 'Target video resolution',
              enum: VideoResolutionEnum.options
            },
            frameRate: {
              type: 'integer',
              description: 'Target frame rate',
              enum: VideoFrameRateValues
            },
            callBackUrl: {
              type: 'string',
              description: 'Webhook URL for task updates',
              format: 'uri'
            }
          },
          required: ['prompt']
        },
        apiType: 'haiper-video',
        successMessage: 'Haiper video generation initiated',
        call: (client, request) => client.generateHaiperVideo(request)
      }
    ];
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const imageToolSchemas = this.imageTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.jsonSchema
      }));

      const videoToolSchemas = this.videoTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.jsonSchema
      }));

      const utilityTools = [
        {
          name: 'get_task_status',
          description: 'Get the status of a generation task',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Task ID to check status for'
              }
            },
            required: ['task_id']
          }
        },
        {
          name: 'list_tasks',
          description: 'List recent tasks with their status',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'integer',
                description: 'Maximum number of tasks to return',
                default: 20,
                maximum: 100
              },
              status: {
                type: 'string',
                description: 'Filter by status',
                enum: ['pending', 'processing', 'completed', 'failed']
              }
            }
          }
        },
        {
          name: 'get_veo3_1080p_video',
          description: 'Get 1080P high-definition version of a Veo3 video (not available for fallback mode videos)',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'Veo3 task ID to get 1080p video for'
              },
              index: {
                type: 'integer',
                description: 'Video index (optional, for multiple video results)',
                minimum: 0
              }
            },
            required: ['task_id']
          }
        }
      ];

      return {
        tools: [...imageToolSchemas, ...videoToolSchemas, ...utilityTools]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        const imageTool = this.imageTools.find((tool) => tool.name === name);
        if (imageTool) {
          return await this.runImageTool(imageTool, args);
        }

        const videoTool = this.videoTools.find((tool) => tool.name === name);
        if (videoTool) {
          return await this.runVideoTool(videoTool, args);
        }

        switch (name) {
          case 'get_task_status':
            return await this.handleGetTaskStatus(args);
          case 'list_tasks':
            return await this.handleListTasks(args);
          case 'get_veo3_1080p_video':
            return await this.handleGetVeo1080pVideo(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new McpError(ErrorCode.InternalError, message);
      }
    });
  }

  private async runImageTool(tool: ImageToolConfig, args: unknown) {
    const request = tool.schema.parse(args);

    try {
      const response = await tool.call(this.client, request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: tool.apiType,
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                response,
                message: tool.successMessage
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image request failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: message
              },
              null,
              2
            )
          }
        ]
      };
    }
  }

  private async runVideoTool(tool: VideoToolConfig, args: unknown) {
    const request = tool.schema.parse(args);

    try {
      const response = await tool.call(this.client, request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: tool.apiType,
          status: 'pending'
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                task_id: response.data?.taskId,
                response,
                message: tool.successMessage,
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video request failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: message
              },
              null,
              2
            )
          }
        ]
      };
    }
  }

  private async handleGetTaskStatus(args: any) {
    const { task_id } = args;

    if (!task_id || typeof task_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'task_id is required and must be a string');
    }

    try {
      const localTask = await this.db.getTask(task_id);

      let apiResponse = null;
      try {
        apiResponse = await this.client.getTaskStatus(task_id, localTask?.api_type);
      } catch (error) {
        // Ignore API error and fall back to local data
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                local_task: localTask,
                api_response: apiResponse,
                message: localTask ? 'Task found' : 'Task not found in local database'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get task status';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: message
              },
              null,
              2
            )
          }
        ]
      };
    }
  }

  private async handleListTasks(args: any) {
    const { limit = 20, status } = args;

    try {
      let tasks;
      if (status) {
        tasks = await this.db.getTasksByStatus(status, limit);
      } else {
        tasks = await this.db.getAllTasks(limit);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                tasks,
                count: tasks.length,
                message: `Retrieved ${tasks.length} tasks`
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list tasks';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: message
              },
              null,
              2
            )
          }
        ]
      };
    }
  }

  private async handleGetVeo1080pVideo(args: any) {
    const { task_id, index } = args;

    if (!task_id || typeof task_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'task_id is required and must be a string');
    }

    try {
      const response = await this.client.getVeo1080pVideo(task_id, index);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                task_id,
                response,
                message: 'Retrieved 1080p video URL',
                note: 'Not available for videos generated with fallback mode'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get 1080p video';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: message
              },
              null,
              2
            )
          }
        ]
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new KieAiMcpServer();
server.run().catch(console.error);
