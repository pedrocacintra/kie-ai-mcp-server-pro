# Kie.ai MCP Server

An MCP (Model Context Protocol) server that provides access to Kie.ai's AI APIs including Nano Banana image generation/editing and Veo3 video generation.

## Features

- **Nano Banana Image Generation**: Text-to-image generation using Google's Gemini 2.5 Flash Image Preview
- **Nano Banana Image Editing**: Natural language image editing with up to 5 input images
- **Veo3 Video Generation**: Professional-quality video generation with text-to-video and image-to-video capabilities
- **Task Management**: SQLite-based task tracking with status polling
- **Error Handling**: Comprehensive error handling and validation

## Prerequisites

- Node.js 18+ 
- Kie.ai API key from https://kie.ai/api-key

## Installation

```bash
# Clone or navigate to the server directory
cd kie-ai-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Set the following environment variables:

```bash
# Required
export KIE_AI_API_KEY="your-api-key-here"

# Optional
export KIE_AI_BASE_URL="https://api.kie.ai/api/v1"  # Default
export KIE_AI_TIMEOUT="60000"                      # Default: 60 seconds
export KIE_AI_DB_PATH="./tasks.db"                 # Default: ./tasks.db
```

## Usage

### Starting the Server

```bash
# Production
npm start

# Development
npm run dev
```

### Available Tools

#### 1. `generate_nano_banana`
Generate images using Nano Banana.

**Parameters:**
- `prompt` (string, required): Text description of the image to generate

**Example:**
```json
{
  "prompt": "A surreal painting of a giant banana floating in space"
}
```

#### 2. `edit_nano_banana`
Edit images using natural language prompts.

**Parameters:**
- `prompt` (string, required): Description of edits to make
- `image_urls` (array, required): URLs of images to edit (max 5)

**Example:**
```json
{
  "prompt": "turn this photo into a character figure",
  "image_urls": ["https://example.com/image.jpg"]
}
```

#### 3. `generate_veo3_video`
Generate videos using Veo3.

**Parameters:**
- `prompt` (string, required): Video description
- `imageUrls` (array, optional): Image for image-to-video (max 1)
- `model` (enum, optional): "veo3" or "veo3_fast" (default: "veo3")
- `aspectRatio` (enum, optional): "16:9" or "9:16" (default: "16:9")
- `seeds` (integer, optional): Random seed 10000-99999
- `watermark` (string, optional): Watermark text
- `enableFallback` (boolean, optional): Enable fallback mechanism

**Example:**
```json
{
  "prompt": "A dog playing in a park",
  "model": "veo3",
  "aspectRatio": "16:9",
  "seeds": 12345
}
```

#### 4. `get_task_status`
Check the status of a generation task.

**Parameters:**
- `task_id` (string, required): Task ID to check

#### 5. `list_tasks`
List recent tasks.

**Parameters:**
- `limit` (integer, optional): Max tasks to return (default: 20, max: 100)
- `status` (string, optional): Filter by status ("pending", "processing", "completed", "failed")

## API Endpoints

The server interfaces with these Kie.ai API endpoints:

- **Veo3 Video**: `POST /veo/generate` ✅ **VALIDATED**
- **Nano Banana**: `POST /nano-banana/generate` ⚠️ **NEEDS VERIFICATION**
- **Nano Banana Edit**: `POST /nano-banana-edit/generate` ⚠️ **NEEDS VERIFICATION**

> **Note**: Nano Banana endpoint paths are inferred from UI interfaces and require verification with Kie.ai support.

## Database Schema

The server uses SQLite to track tasks:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT UNIQUE NOT NULL,
  api_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result_url TEXT,
  error_message TEXT
);
```

## Error Handling

The server handles these HTTP error codes from Kie.ai:

- **401**: Unauthorized (invalid API key)
- **402**: Insufficient credits
- **422**: Validation error or content policy violation
- **429**: Rate limited
- **455**: Service maintenance
- **500**: Server error
- **501**: Generation failed
- **505**: Feature disabled

## Development

```bash
# Run tests
npm test

# Development mode with auto-reload
npm run dev

# Type checking
npx tsc --noEmit
```

## Pricing

Based on Kie.ai documentation:
- **Nano Banana**: $0.020 per image (4 credits)
- **Veo3 Quality**: Higher cost tier
- **Veo3 Fast**: ~20% of Quality model pricing

See https://kie.ai/billing for detailed pricing.

## Limitations

1. **Nano Banana Endpoints**: Require verification with Kie.ai support
2. **Task Status Polling**: API endpoint for status checking needs discovery
3. **Fallback Videos**: Cannot access 1080P endpoint for fallback-generated content
4. **Image Limits**: Max 5 images for editing, max 1 for video generation

## Support

For issues related to:
- **MCP Server**: Check logs and validate environment variables
- **Kie.ai API**: Contact support@kie.ai or check https://docs.kie.ai/
- **API Keys**: Visit https://kie.ai/api-key

## License

MIT License - see LICENSE file for details.