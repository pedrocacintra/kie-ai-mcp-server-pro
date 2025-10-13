# Kie.ai MCP Server Pro

Model Context Protocol server that exposes the latest Kie.ai image and video generation APIs – including Google Nano Banana, GPT-4o Images, Flux Kontext, DALL·E 3, Ideogram 3, Stable Diffusion 3, Playground v3, and the newest video models such as Veo3, Sora 2, Runway Gen-3, Kling, Pika, Haiper, Runway Aleph, and Luma. All incoming requests are validated with Zod, forwarded to the correct REST endpoint, and tracked in a lightweight SQLite task database for status polling.

## Features

- **Unified model catalog** – trigger every public Kie.ai image and video model from one MCP server.
- **Aspect ratio & format controls** – Nano Banana and the other image APIs accept shared `image_size` and `output_format` enums.
- **Sora 2 defaults** – watermark removal is enabled automatically (`remove_watermark: true`) while leaving every other parameter configurable.
- **Task persistence** – generation tasks are stored in SQLite so you can inspect history or resume polling after restarts.
- **MCP ready** – ships as a CLI (`kie-ai-mcp-server`) with JSON schema definitions for each tool.

## Prerequisites

- Node.js 18+
- A Kie.ai API key from <https://kie.ai/api-key>

## Installation

### Install from npm

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
