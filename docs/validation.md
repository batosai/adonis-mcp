# Validation with VineJS

You can validate tool, resource, or prompt arguments with [VineJS](https://vinejs.dev/) for complex validation rules or to reuse validators from your AdonisJS routes.

## Installation and configuration

When you install the package with:

```bash
node ace add @jrmc/adonis-mcp
```

the installer asks **"Is Vinejs used for validation?"** (Yes / No). If you choose **Yes**, the VineJS provider is registered and `request.validateUsing()` is available in your MCP handlers. If you choose **No**, the provider is not added and you use only JSON Schema (or Zod) for validation.

To enable VineJS after installation, add the provider manually in `adonisrc.ts`:

```typescript
providers: [
  // ...
  '@jrmc/adonis-mcp/vinejs_provider',
]
```

## Usage

`request.validateUsing()` is available in **Tools**, **Resources**, and **Prompts** handlers. Two approaches are available.

### Standard approach

Validate manually and handle errors with try/catch:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'
import Article from '#models/article'
import { ArticleValidator } from '#validators/article'

export default class CreateArticleTool extends Tool {
  // ...

  async handle({ args, response }: ToolContext) {
    try {
      const payload = await ArticleValidator.validate(args)

      const article = await Article.create(payload)
      return response.text(`Article "${article.title}" created successfully with id: ${article.id}`)
    } catch (error) {
      return response.error('Error: ' + error.message)
    }
  }
}
```

### Recommended approach (AdonisJS-style)

Use `request.validateUsing()`. Validation errors are automatically turned into JSON-RPC error responses, so no try/catch is needed:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'
import Article from '#models/article'
import { ArticleValidator } from '#validators/article'

export default class CreateArticleTool extends Tool {
  // ...

  async handle({ response, request }: ToolContext) {
    const payload = await request.validateUsing(ArticleValidator)

    const article = await Article.create(payload)
    return response.text(`Article "${article.title}" created successfully with id: ${article.id}`)
  }
}
```

The same pattern applies in **Resources** and **Prompts**: inject `request` in your handler and call `request.validateUsing(YourValidator)` with the same VineJS validators you use in your HTTP routes.
