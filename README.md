# Kie.ai MCP Server Pro

Model Context Protocol server that exposes the latest Kie.ai image and video generation APIs – including Google Nano Banana, GPT-4o Images, Flux Kontext, DALL·E 3, Ideogram 3, Stable Diffusion 3, Playground v3, and the newest video models such as Veo3, Sora 2, Runway Gen-3, Kling, Pika, Haiper, Runway Aleph, and Luma. All incoming requests are validated with Zod, forwarded to the correct REST endpoint, and tracked in a lightweight SQLite task database for status polling.

## Features

- **Unified model catalog** – trigger every public Kie.ai image and video model from one MCP server.
- **Aspect ratio & format controls** – Nano Banana and the other image APIs accept shared `image_size` and `output_format` enums.
- **Sora 2 defaults** – watermark removal is enabled automatically (`remove_watermark: true`) while leaving every other parameter configurable.
- **Task persistence** – generation tasks are stored in SQLite so you can inspect history or resume polling after restarts.
- **MCP ready** – ships as a CLI (`kie-ai-mcp-server`) with JSON schema definitions for each tool.
An MCP (Model Context Protocol) server that provides access to Kie.ai's AI APIs including Nano Banana image generation/editing, GPT-4o and Flux Kontext image synthesis, Midjourney rendering, Veo3 video generation, and additional Runway and Luma video models.

## Features

- **Nano Banana Image Generation**: Text-to-image generation using Google's Gemini 2.5 Flash Image Preview with aspect ratio and format control
- **Nano Banana Image Editing**: Natural language image editing with up to 5 input images, configurable aspect ratios, and output formats
- **GPT-4o Image Generation**: OpenAI's GPT-4o image API with webhook support
- **Flux Kontext Image Generation & Editing**: Access Flux Kontext Pro/Max models for generation and editing flows
- **Midjourney Image Generation**: Trigger Midjourney renders with optional reference images
- **Veo3 Video Generation**: Professional-quality video generation with text-to-video and image-to-video capabilities
- **Runway Aleph & Luma Videos**: Request cinematic videos from Runway Aleph and Luma directly through Kie.ai
- **1080p Video Upgrade**: Get high-definition versions of Veo3 videos
- **Task Management**: SQLite-based task tracking with status polling
- **Smart Endpoint Routing**: Automatic detection of task types for status checking
- **Error Handling**: Comprehensive error handling and validation

## Prerequisites

- Node.js 18+
- A Kie.ai API key from <https://kie.ai/api-key>

## Installation

### Install from npm
### From npm

```bash
npm install -g kie-ai-mcp-server-pro
```

### Install from source

```bash
# Clone the repository
git clone https://github.com/pedrocacintra/kie-ai-mcp-server-pro.git
cd kie-ai-mcp-server-pro

# Install dependencies
npm install

# Type-check and emit the build
npm run build
```

## Publishing

1. Confirm you are authenticated with your npm account using `npm whoami` (or run `npm login` if needed).
2. Ensure the version in `package.json` is correct for your release.
3. Run `npm run build` to generate the compiled JavaScript and type declarations in `dist/`.
4. Verify the package contents with `npm pack` if desired.
5. Publish to npm with `npm publish --access public`.

## Configuration

### Environment variables

```bash
# Required
export KIE_AI_API_KEY="your-api-key-here"

# Optional overrides
export KIE_AI_BASE_URL="https://api.kie.ai/api/v1"  # Default base URL
export KIE_AI_TIMEOUT="60000"                       # Default timeout (ms)
export KIE_AI_DB_PATH="./tasks.db"                  # SQLite file used for task history
```

### MCP client entry

Add this block to your MCP client (Claude Desktop, Continue, etc.):

```json
{
  "kie-ai-mcp-server": {
    "command": "npx",
    "args": ["-y", "kie-ai-mcp-server-pro"],
    "command": "node",
    "args": ["/path/to/kie-ai-mcp-server-pro/dist/index.js"],
    "env": {
      "KIE_AI_API_KEY": "your-api-key-here"
    }
  }
}
```

If you built from source, point to the compiled entry:

```json
{
  "kie-ai-mcp-server": {
    "command": "node",
    "args": ["/absolute/path/to/kie-ai-mcp-server-pro/dist/index.js"],
    "env": {
      "KIE_AI_API_KEY": "your-api-key-here"
  {
    "kie-ai-mcp-server": {
      "command": "npx",
      "args": ["-y", "kie-ai-mcp-server-pro"],
      "env": {
        "KIE_AI_API_KEY": "your-api-key-here"
      }
    }
  }
```

## Available tools

Every tool exposes a JSON schema so IDEs and MCP clients can prompt for valid values. Shared enums:

- `image_size`: `1:1`, `9:16`, `16:9`, `3:4`, `4:3`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`, `auto`
- `output_format`: `png`, `jpeg`
- `video.resolution`: `720p`, `1080p`, `4k`, `8k`, `auto`
- `video.frameRate`: `12`, `15`, `24`, `25`, `30`, `48`, `50`, `60`

### Image generation & editing

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `generate_nano_banana` | Google Gemini 2.5 Flash Preview (Nano Banana) text-to-image | `prompt`*, `image_size`, `output_format` |
| `edit_nano_banana` | Nano Banana editing with up to 5 source images | `prompt`*, `image_urls`* (1-5), `image_size`, `output_format` |
| `generate_gpt4o_image` | GPT-4o image API | `prompt`*, `image_urls`, `size`, `output_format`, `callBackUrl` |
| `generate_flux_image` | Flux Kontext generation | `prompt`*, `image_urls`, `aspectRatio`, `model` (`flux-kontext-pro`, `flux-kontext-max`), `output_format`, `callBackUrl` |
| `edit_flux_image` | Flux Kontext editing | `prompt`*, `image_urls`* (1-5), `aspectRatio`, `model`, `output_format`, `callBackUrl` |
| `generate_midjourney_image` | Midjourney API proxy | `prompt`*, `image_urls`, `aspectRatio`, `output_format`, `callBackUrl` |
| `generate_dalle3_image` | OpenAI DALL·E 3 | `prompt`*, `image_urls`, `size`, `quality` (`standard`, `hd`), `style` (`vivid`, `natural`), `output_format`, `callBackUrl` |
| `generate_ideogram_image` | Ideogram 3/3-rapid | `prompt`*, `negative_prompt`, `image_urls`, `aspectRatio`, `style`, `model`, `output_format`, `callBackUrl` |
| `generate_stable_diffusion3_image` | Stability AI Stable Diffusion 3 | `prompt`*, `negative_prompt`, `image_urls`, `aspectRatio`, `guidance_scale`, `steps`, `scheduler`, `output_format`, `callBackUrl` |
| `generate_playground_image` | Playground v2/v2.5/v3 | `prompt`*, `negative_prompt`, `image_urls`, `aspectRatio`, `guidance_scale`, `steps`, `model`, `output_format`, `callBackUrl` |

`*` Required parameter.

### Video generation

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `generate_veo3_video` | Google Veo3 text/image-to-video | `prompt`*, `imageUrls`, `model` (`veo3`, `veo3_fast`), `watermark`, `aspectRatio` (`16:9`, `9:16`), `seeds`, `callBackUrl`, `enableFallback` |
| `generate_runway_aleph_video` | Runway Aleph | `prompt`*, `imageUrls`, `duration` (1-120 s), `aspectRatio`, `callBackUrl` |
| `generate_luma_video` | Luma Labs | `prompt`*, `imageUrls`, `duration`, `callBackUrl` |
| `generate_sora2_video` | OpenAI Sora 2 (watermark removed by default) | `prompt`*, `negative_prompt`, `imageUrls`, `duration`, `aspectRatio`, `resolution`, `frameRate`, `style`, `cameraMotion`, `seed`, `guidance_scale`, `remove_watermark` (defaults `true`), `callBackUrl` |
| `generate_runway_gen3_video` | Runway Gen-3 | `prompt`*, `imageUrls`, `duration`, `aspectRatio`, `model`, `resolution`, `frameRate`, `callBackUrl` |
| `generate_kling_video` | Kling video models | `prompt`*, `imageUrls`, `duration`, `aspectRatio`, `mode` (`standard`, `fast`, `turbo`), `resolution`, `frameRate`, `callBackUrl` |
| `generate_pika_video` | Pika Labs | `prompt`*, `imageUrls`, `duration` (1-30 s), `aspectRatio`, `mode` (`creative`, `realistic`, `animation`), `resolution`, `frameRate`, `callBackUrl` |
| `generate_haiper_video` | Haiper video | `prompt`*, `imageUrls`, `duration`, `aspectRatio`, `look`, `resolution`, `frameRate`, `callBackUrl` |

### Task utilities

- `get_task_status`: supply a `task_id` to view the API response plus any cached DB record.
- `list_tasks`: inspect recent tasks, optionally filtering by `status`.
- `get_veo3_1080p_video`: request the HD upgrade for Veo3 tasks.

## Publishing checklist

1. Bump the version in `package.json`.
2. Run `npm run build` to emit `dist/`.
3. `npm publish --access public` (ensure you are logged in as `pedrocintra`).

## License

MIT © Pedro C. Cintra
### `generate_nano_banana`
Generate images using Nano Banana with fine-grained control.

**Parameters:**
- `prompt` (string, required): Text description of the image to generate
- `image_size` (enum, optional): One of `1:1`, `9:16`, `16:9`, `3:4`, `4:3`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`, `auto`
- `output_format` (enum, optional): `png` or `jpeg`

### `edit_nano_banana`
Edit images using natural language prompts.

**Parameters:**
- `prompt` (string, required): Description of edits to make
- `image_urls` (array, required): URLs of images to edit (1-5)
- `image_size` (enum, optional): See values above
- `output_format` (enum, optional): `png` or `jpeg`

### `generate_gpt4o_image`
Generate images using OpenAI's GPT-4o image API.

**Parameters:**
- `prompt` (string, required)
- `image_urls` (array of URLs, optional, max 5)
- `size` (enum, optional): Allowed ratios listed above
- `output_format` (enum, optional): `png` or `jpeg`
- `callBackUrl` (URL, optional): Webhook to receive results

### `generate_flux_image`
Generate images with Flux Kontext models.

**Parameters:**
- `prompt` (string, required)
- `image_urls` (array of URLs, optional, max 5)
- `aspectRatio` (enum, optional): Allowed ratios listed above
- `model` (enum, optional): `flux-kontext-pro` (default) or `flux-kontext-max`
- `output_format` (enum, optional): `png` or `jpeg`
- `callBackUrl` (URL, optional)

### `edit_flux_image`
Edit images using Flux Kontext models.

**Parameters:**
- `prompt` (string, required)
- `image_urls` (array of URLs, required, 1-5)
- `aspectRatio` (enum, optional)
- `model` (enum, optional): `flux-kontext-pro` (default) or `flux-kontext-max`
- `output_format` (enum, optional): `png` or `jpeg`
- `callBackUrl` (URL, optional)

### `generate_midjourney_image`
Trigger Midjourney image generation.

**Parameters:**
- `prompt` (string, required)
- `image_urls` (array of URLs, optional, max 4)
- `aspectRatio` (enum, optional)
- `output_format` (enum, optional): `png` or `jpeg`
- `callBackUrl` (URL, optional)

### `generate_veo3_video`
Generate videos using Veo3.

**Parameters:**
- `prompt` (string, required): Video description
- `imageUrls` (array, optional): Image for image-to-video (max 1)
- `model` (enum, optional): `veo3` or `veo3_fast` (default: `veo3`)
- `aspectRatio` (enum, optional): `16:9` or `9:16` (default: `16:9`)
- `seeds` (integer, optional): Random seed 10000-99999
- `watermark` (string, optional): Watermark text
- `enableFallback` (boolean, optional): Enable fallback mechanism

### `generate_runway_aleph_video`
Generate cinematic videos using Runway Aleph.

**Parameters:**
- `prompt` (string, required)
- `imageUrls` (array of URLs, optional, max 4)
- `duration` (integer seconds, optional, 1-120)
- `aspectRatio` (enum, optional)
- `callBackUrl` (URL, optional)

### `generate_luma_video`
Generate premium videos using Luma.

**Parameters:**
- `prompt` (string, required)
- `imageUrls` (array of URLs, optional, max 4)
- `duration` (integer seconds, optional, 1-120)
- `callBackUrl` (URL, optional)

### `get_task_status`
Check the status of any generation task by task ID.

### `list_tasks`
List recent tasks with optional status filtering.

### `get_veo3_1080p_video`
Retrieve a 1080p upgrade for Veo3 videos (when available).

## API Endpoints

The server interfaces with these Kie.ai API endpoints:

- **Nano Banana Generation/Edit**: `POST /api/v1/playground/createTask`
- **Nano Banana Status**: `GET /api/v1/playground/recordInfo`
- **GPT-4o Image Generation**: `POST /api/v1/gpt4o-image/generate`
- **Flux Kontext Generation**: `POST /api/v1/flux/kontext/generate`
- **Flux Kontext Editing**: `POST /api/v1/flux/kontext/edit`
- **Midjourney Image Generation**: `POST /api/v1/midjourney/generate`
- **Veo3 Video Generation**: `POST /api/v1/veo/generate`
- **Veo3 Video Status**: `GET /api/v1/veo/record-info`
- **Veo3 1080p Upgrade**: `GET /api/v1/veo/get-1080p-video`
- **Runway Aleph Video Generation**: `POST /api/v1/runway/aleph/generate`
- **Luma Video Generation**: `POST /api/v1/luma/generate`

## Database Schema

The server uses SQLite to track tasks:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT UNIQUE NOT NULL,
  api_type TEXT NOT NULL,  -- e.g. 'nano-banana', 'gpt4o-image', 'runway-aleph-video'
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result_url TEXT,
  error_message TEXT
);
```

## Usage Examples

### Basic Image Generation
```bash
# Generate an image
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "generate_nano_banana",
    "arguments": {
      "prompt": "A cat wearing a space helmet"
    }
  }'
```

### Video Generation with Options
```bash
# Generate a video
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "generate_veo3_video",
    "arguments": {
      "prompt": "A peaceful garden with blooming flowers",
      "aspectRatio": "16:9",
      "model": "veo3_fast"
    }
  }'
```

## Error Handling

The server handles these HTTP error codes from Kie.ai:

- **200**: Success
- **400**: Content policy violation / English prompts only
- **401**: Unauthorized (invalid API key)
- **402**: Insufficient credits
- **404**: Resource not found
- **422**: Validation error / record is null
- **429**: Rate limited
- **451**: Image access limits
- **455**: Service maintenance
- **500**: Server error / timeout
- **501**: Generation failed

## Development

```bash
# Run tests
npm test

# Development mode with auto-reload
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## Pricing

Based on Kie.ai documentation:
- **Nano Banana**: $0.020 per image (4 credits)
- **Veo3 Quality**: Higher cost tier
- **Veo3 Fast**: ~20% of Quality model pricing

See https://kie.ai/billing for detailed pricing.

## Production Tips

1. **Database Location**: Set `KIE_AI_DB_PATH` to a persistent location
2. **API Key Security**: Never commit API keys to version control
3. **Rate Limiting**: Implement client-side rate limiting for high-volume usage
4. **Monitoring**: Monitor task status and handle failed generations appropriately
5. **Storage**: Consider automatic cleanup of old task records

## Troubleshooting

### Common Issues

**"Unauthorized" errors**
- Verify `KIE_AI_API_KEY` is set correctly
- Check API key is valid at https://kie.ai/api-key

**"Task not found" errors**
- Tasks may expire after 14 days
- Check task ID format matches expected pattern

**Generation failures**
- Check content policy compliance
- Verify prompt is in English
- Ensure sufficient API credits

## Support

For issues related to:
- **MCP Server**: Open an issue at https://github.com/pedrocacintra/kie-ai-mcp-server-pro/issues
- **Kie.ai API**: Contact support@kie.ai or check https://docs.kie.ai/
- **API Keys**: Visit https://kie.ai/api-key

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### v1.0.0
- Initial release
- Nano Banana image generation and editing
- Veo3 video generation
- 1080p video upgrade support
- SQLite task tracking
- Smart endpoint routing
- Comprehensive error handling
