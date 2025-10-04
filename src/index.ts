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
  RunwayAlephVideoSchema,
  LumaVideoSchema,
  ImageSizeEnum,
  OutputFormatEnum,
  FluxKontextModelEnum,
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

          case 'generate_veo3_video':
            return await this.handleGenerateVeo3Video(args);

          case 'generate_runway_aleph_video':
            return await this.handleGenerateRunwayAleph(args);

          case 'generate_luma_video':
            return await this.handleGenerateLuma(args);

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