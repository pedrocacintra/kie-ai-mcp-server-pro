#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
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
  VideoFrameRateEnum,
  VideoFrameRateValues,
  KieAiConfig
} from './types.js';

class KieAiMcpServer {
  private server: Server;
  private client: KieAiClient;
  private db: TaskDatabase;

  constructor() {
    this.server = new Server({
      name: 'kie-ai-mcp-server',
      version: '1.0.0',
    });

    // Initialize client with config from environment
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

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_nano_banana',
            description: 'Generate images using Google\'s Gemini 2.5 Flash Image Preview (Nano Banana)',
            inputSchema: {
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
            }
          },
          {
            name: 'edit_nano_banana',
            description: 'Edit images using natural language prompts with Nano Banana Edit',
            inputSchema: {
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
            }
          },
          {
            name: 'generate_gpt4o_image',
            description: 'Generate images using the GPT-4o image generation API',
            inputSchema: {
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
            }
          },
          {
            name: 'generate_flux_image',
            description: 'Generate images using Flux Kontext models',
            inputSchema: {
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
            }
          },
          {
            name: 'edit_flux_image',
            description: 'Edit images using Flux Kontext models',
            inputSchema: {
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
            }
          },
          {
            name: 'generate_midjourney_image',
            description: 'Generate images using the Midjourney API',
            inputSchema: {
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
            }
          },
          {
            name: 'generate_dalle3_image',
            description: 'Generate images using OpenAI\'s DALL·E 3 via Kie.ai',
            inputSchema: {
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
                  description: 'Target image aspect ratio',
                  enum: ImageSizeEnum.options
                },
                quality: {
                  type: 'string',
                  description: 'Image quality level',
                  enum: Dalle3QualityEnum.options
                },
                style: {
                  type: 'string',
                  description: 'Rendering style preset',
                  enum: Dalle3StyleEnum.options
                },
                output_format: {
                  type: 'string',
                  description: 'Output image format',
                  enum: OutputFormatEnum.options
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_ideogram_image',
            description: 'Generate creative designs using Ideogram 3 models',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the desired artwork',
                  minLength: 1,
                  maxLength: 4000
                },
                negative_prompt: {
                  type: 'string',
                  description: 'Elements to avoid in the generation',
                  maxLength: 2000
                },
                image_urls: {
                  type: 'array',
                  description: 'Optional init or reference images (max 5)',
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
                  description: 'Style hint such as typography or illustration',
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
                  description: 'Webhook URL to receive finished images',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_stable_diffusion3_image',
            description: 'Generate photorealistic and artistic renders using Stability AI\'s SD3',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the target image',
                  minLength: 1,
                  maxLength: 4000
                },
                negative_prompt: {
                  type: 'string',
                  description: 'Content to discourage in the output',
                  maxLength: 2000
                },
                image_urls: {
                  type: 'array',
                  description: 'Optional image-to-image sources (max 4)',
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
                  description: 'Guidance strength (0-20)',
                  minimum: 0,
                  maximum: 20
                },
                steps: {
                  type: 'integer',
                  description: 'Number of inference steps',
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
                  description: 'Output format for delivered image',
                  enum: OutputFormatEnum.options
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion notification',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_playground_image',
            description: 'Generate images using Playground v3 models',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the desired image',
                  minLength: 1,
                  maxLength: 4000
                },
                negative_prompt: {
                  type: 'string',
                  description: 'Elements to exclude from the output',
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
                  description: 'Guidance strength (0-20)',
                  minimum: 0,
                  maximum: 20
                },
                steps: {
                  type: 'integer',
                  description: 'Number of inference steps',
                  minimum: 10,
                  maximum: 150
                },
                model: {
                  type: 'string',
                  description: 'Playground model variant',
                  enum: PlaygroundModelEnum.options,
                  default: 'playground-v3'
                },
                output_format: {
                  type: 'string',
                  description: 'Output format for delivered image',
                  enum: OutputFormatEnum.options
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL to receive results',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_veo3_video',
            description: 'Generate professional-quality videos using Google\'s Veo3 API',
            inputSchema: {
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
                enableFallback: {
                  type: 'boolean',
                  description: 'Enable fallback mechanism for content policy failures',
                  default: false
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_runway_aleph_video',
            description: 'Generate cinematic videos using Runway Aleph via Kie.ai',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Text description for the Aleph video generation',
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
                  description: 'Desired duration of the generated video in seconds',
                  minimum: 1,
                  maximum: 120
                },
                aspectRatio: {
                  type: 'string',
                  description: 'Aspect ratio for the generated video',
                  enum: ImageSizeEnum.options
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for task completion notifications',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_luma_video',
            description: 'Generate high-quality videos using Luma via Kie.ai',
            inputSchema: {
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
                  description: 'Desired duration of the generated video in seconds',
                  minimum: 1,
                  maximum: 120
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for task completion notifications',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_sora2_video',
            description: 'Generate blockbuster-quality videos using Sora 2 with watermark removal enabled by default',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Detailed description of the video to generate',
                  minLength: 1,
                  maxLength: 4000
                },
                negative_prompt: {
                  type: 'string',
                  description: 'Elements to avoid in the output',
                  maxLength: 2000
                },
                imageUrls: {
                  type: 'array',
                  description: 'Optional reference images (max 8)',
                  items: { type: 'string', format: 'uri' },
                  maxItems: 8
                },
                duration: {
                  type: 'integer',
                  description: 'Desired duration of the clip in seconds',
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
                  description: 'Target rendering resolution',
                  enum: VideoResolutionEnum.options
                },
                frameRate: {
                  type: 'integer',
                  description: 'Target frame rate (fps)',
                  enum: Array.from(VideoFrameRateValues)
                },
                style: {
                  type: 'string',
                  description: 'High-level style preset',
                  enum: Sora2StyleEnum.options
                },
                cameraMotion: {
                  type: 'string',
                  description: 'Preferred camera motion',
                  enum: Sora2CameraMotionEnum.options
                },
                seed: {
                  type: 'integer',
                  description: 'Random seed (0-999999)',
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
                  description: 'Remove the default Sora watermark (defaults to true)',
                  default: true
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_runway_gen3_video',
            description: 'Generate videos using the latest Runway Gen-3 family',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the desired video',
                  minLength: 1,
                  maxLength: 4000
                },
                imageUrls: {
                  type: 'array',
                  description: 'Optional reference frames (max 4)',
                  items: { type: 'string', format: 'uri' },
                  maxItems: 4
                },
                duration: {
                  type: 'integer',
                  description: 'Duration in seconds',
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
                  description: 'Target resolution',
                  enum: VideoResolutionEnum.options
                },
                frameRate: {
                  type: 'integer',
                  description: 'Target frame rate (fps)',
                  enum: Array.from(VideoFrameRateValues)
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_kling_video',
            description: 'Generate cinematic videos with Kling',
            inputSchema: {
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
                  description: 'Duration in seconds',
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
                  description: 'Target resolution',
                  enum: VideoResolutionEnum.options
                },
                frameRate: {
                  type: 'integer',
                  description: 'Target frame rate (fps)',
                  enum: Array.from(VideoFrameRateValues)
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_pika_video',
            description: 'Generate stylized videos using Pika Labs models',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the desired video',
                  minLength: 1,
                  maxLength: 4000
                },
                imageUrls: {
                  type: 'array',
                  description: 'Optional reference frames (max 4)',
                  items: { type: 'string', format: 'uri' },
                  maxItems: 4
                },
                duration: {
                  type: 'integer',
                  description: 'Duration in seconds (max 30)',
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
                  description: 'Pika style mode',
                  enum: ['creative', 'realistic', 'animation'],
                  default: 'creative'
                },
                resolution: {
                  type: 'string',
                  description: 'Target resolution',
                  enum: VideoResolutionEnum.options
                },
                frameRate: {
                  type: 'integer',
                  description: 'Target frame rate (fps)',
                  enum: Array.from(VideoFrameRateValues)
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'generate_haiper_video',
            description: 'Generate concept videos using Haiper',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Prompt describing the desired Haiper clip',
                  minLength: 1,
                  maxLength: 4000
                },
                imageUrls: {
                  type: 'array',
                  description: 'Optional reference frames (max 4)',
                  items: { type: 'string', format: 'uri' },
                  maxItems: 4
                },
                duration: {
                  type: 'integer',
                  description: 'Duration in seconds',
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
                  description: 'Optional look preset or note',
                  maxLength: 100
                },
                resolution: {
                  type: 'string',
                  description: 'Target resolution',
                  enum: VideoResolutionEnum.options
                },
                frameRate: {
                  type: 'integer',
                  description: 'Target frame rate (fps)',
                  enum: Array.from(VideoFrameRateValues)
                },
                callBackUrl: {
                  type: 'string',
                  description: 'Webhook URL for completion callbacks',
                  format: 'uri'
                }
              },
              required: ['prompt']
            }
          },
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
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'generate_nano_banana':
            return await this.handleGenerateNanoBanana(args);

          case 'edit_nano_banana':
            return await this.handleEditNanoBanana(args);

          case 'generate_gpt4o_image':
            return await this.handleGenerateGpt4oImage(args);

          case 'generate_flux_image':
            return await this.handleGenerateFluxKontext(args);

          case 'edit_flux_image':
            return await this.handleEditFluxKontext(args);

          case 'generate_midjourney_image':
            return await this.handleGenerateMidjourney(args);

          case 'generate_dalle3_image':
            return await this.handleGenerateDalle3(args);

          case 'generate_ideogram_image':
            return await this.handleGenerateIdeogram(args);

          case 'generate_stable_diffusion3_image':
            return await this.handleGenerateStableDiffusion3(args);

          case 'generate_playground_image':
            return await this.handleGeneratePlayground(args);

          case 'generate_veo3_video':
            return await this.handleGenerateVeo3Video(args);

          case 'generate_runway_aleph_video':
            return await this.handleGenerateRunwayAleph(args);

          case 'generate_luma_video':
            return await this.handleGenerateLuma(args);

          case 'generate_sora2_video':
            return await this.handleGenerateSora2(args);

          case 'generate_runway_gen3_video':
            return await this.handleGenerateRunwayGen3(args);

          case 'generate_kling_video':
            return await this.handleGenerateKling(args);

          case 'generate_pika_video':
            return await this.handleGeneratePika(args);

          case 'generate_haiper_video':
            return await this.handleGenerateHaiper(args);

          case 'get_task_status':
            return await this.handleGetTaskStatus(args);

          case 'list_tasks':
            return await this.handleListTasks(args);
          
          case 'get_veo3_1080p_video':
            return await this.handleGetVeo1080pVideo(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
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

  private async handleGenerateNanoBanana(args: any) {
    const request = NanoBananaGenerateSchema.parse(args);
    
    try {
      const response = await this.client.generateNanoBanana(request);
      
      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'nano-banana',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response: response,
              message: 'Nano Banana image generation initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleEditNanoBanana(args: any) {
    const request = NanoBananaEditSchema.parse(args);

    try {
      const response = await this.client.editNanoBanana(request);
      
      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'nano-banana-edit',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response: response,
              message: 'Nano Banana image editing initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Editing failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateGpt4oImage(args: any) {
    const request = Gpt4oImageSchema.parse(args);

    try {
      const response = await this.client.generateGpt4oImage(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'gpt4o-image',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response,
              message: 'GPT-4o image generation initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateFluxKontext(args: any) {
    const request = FluxKontextGenerateSchema.parse(args);

    try {
      const response = await this.client.generateFluxKontext(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'flux-kontext-generate',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response,
              message: 'Flux Kontext image generation initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleEditFluxKontext(args: any) {
    const request = FluxKontextEditSchema.parse(args);

    try {
      const response = await this.client.editFluxKontext(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'flux-kontext-edit',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response,
              message: 'Flux Kontext image editing initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Editing failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateMidjourney(args: any) {
    const request = MidjourneyImageSchema.parse(args);

    try {
      const response = await this.client.generateMidjourney(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'midjourney-image',
          status: 'pending',
          result_url: response.data.imageUrl
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response,
              message: 'Midjourney image generation initiated'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateDalle3(args: any) {
    const request = Dalle3ImageSchema.parse(args);

    try {
      const response = await this.client.generateDalle3(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'dalle3-image',
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
                message: 'DALL·E 3 image generation initiated'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateIdeogram(args: any) {
    const request = IdeogramImageSchema.parse(args);

    try {
      const response = await this.client.generateIdeogram(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'ideogram-image',
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
                message: 'Ideogram image generation initiated'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateStableDiffusion3(args: any) {
    const request = StableDiffusion3ImageSchema.parse(args);

    try {
      const response = await this.client.generateStableDiffusion3(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'stable-diffusion3-image',
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
                message: 'Stable Diffusion 3 image generation initiated'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGeneratePlayground(args: any) {
    const request = PlaygroundImageSchema.parse(args);

    try {
      const response = await this.client.generatePlayground(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'playground-image',
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
                message: 'Playground image generation initiated'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateVeo3Video(args: any) {
    const request = Veo3GenerateSchema.parse(args);

    try {
      const response = await this.client.generateVeo3Video(request);
      
      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'veo3',
          status: 'pending'
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: response.data?.taskId,
              message: 'Veo3 video generation task created successfully',
              note: 'Use get_task_status to check progress'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateRunwayAleph(args: any) {
    const request = RunwayAlephVideoSchema.parse(args);

    try {
      const response = await this.client.generateRunwayAlephVideo(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'runway-aleph-video',
          status: 'pending'
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: response.data?.taskId,
              message: 'Runway Aleph video generation task created successfully',
              note: 'Use get_task_status to check progress'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateLuma(args: any) {
    const request = LumaVideoSchema.parse(args);

    try {
      const response = await this.client.generateLumaVideo(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'luma-video',
          status: 'pending'
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: response.data?.taskId,
              message: 'Luma video generation task created successfully',
              note: 'Use get_task_status to check progress'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateSora2(args: any) {
    const request = Sora2VideoSchema.parse(args);

    try {
      const response = await this.client.generateSora2Video(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'sora2-video',
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
                message: 'Sora 2 video generation task created successfully',
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateRunwayGen3(args: any) {
    const request = RunwayGen3VideoSchema.parse(args);

    try {
      const response = await this.client.generateRunwayGen3Video(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'runway-gen3-video',
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
                message: 'Runway Gen-3 video generation task created successfully',
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateKling(args: any) {
    const request = KlingVideoSchema.parse(args);

    try {
      const response = await this.client.generateKlingVideo(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'kling-video',
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
                message: 'Kling video generation task created successfully',
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGeneratePika(args: any) {
    const request = PikaVideoSchema.parse(args);

    try {
      const response = await this.client.generatePikaVideo(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'pika-video',
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
                message: 'Pika video generation task created successfully',
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGenerateHaiper(args: any) {
    const request = HaiperVideoSchema.parse(args);

    try {
      const response = await this.client.generateHaiperVideo(request);

      if (response.data?.taskId) {
        await this.db.createTask({
          task_id: response.data.taskId,
          api_type: 'haiper-video',
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
                message: 'Haiper video generation task created successfully',
                note: 'Use get_task_status to check progress'
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2)
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
      
      // Always try to get updated status from API, passing api_type if available
      let apiResponse = null;
      try {
        apiResponse = await this.client.getTaskStatus(task_id, localTask?.api_type);
      } catch (error) {
        // API call failed, use local data if available
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              local_task: localTask,
              api_response: apiResponse,
              message: localTask ? 'Task found' : 'Task not found in local database'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get task status';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
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
            text: JSON.stringify({
              success: true,
              tasks: tasks,
              count: tasks.length,
              message: `Retrieved ${tasks.length} tasks`
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list tasks';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
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
            text: JSON.stringify({
              success: true,
              task_id: task_id,
              response: response,
              message: 'Retrieved 1080p video URL',
              note: 'Not available for videos generated with fallback mode'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get 1080p video';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: message
            }, null, 2)
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

// Start the server
const server = new KieAiMcpServer();
server.run().catch(console.error);