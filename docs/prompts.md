# Prompts

Prompts are reusable templates that help structure AI interactions. They allow you to define structured inputs for AI models with validation, multiple content types, and embedded resources.

## Creating Prompts

To create a new prompt, use the Ace command:

```bash
node ace make:mcp-prompt my_prompt
```

This command will create a file in `app/mcp/prompts/my_prompt.ts` with a base template:

```typescript
import type { PromptContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'

import { Prompt } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  text: { type: "string" }
}>

export default class MyPromptPrompt extends Prompt<Schema> {
  name = 'my_prompt'
  title = 'Prompt title'
  description = 'Prompt description'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text('Hello, world!')
    ]
  }

  schema() {
    return {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Description text argument"
        },
      },
      required: ["text"]
    } as Schema
  }
}
```

### Prompt Properties

Each prompt must define the following properties:

- **name**: A unique identifier for the prompt (required)
- **title**: A human-readable title (optional)
- **description**: A description of what the prompt does (optional)

## Prompt Arguments

Prompts use the same schema definition system as tools, following the [JSON Schema](https://json-schema.org/) specification.

### Basic Schema

```typescript
schema() {
  return {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The code to review"
      },
      language: {
        type: "string",
        description: "Programming language"
      }
    },
    required: ["code", "language"]
  } as Schema
}
```

### Using Zod

You can also use Zod to define your schema:

```typescript
import * as z from 'zod'

const zodSchema = z.object({
  code: z.string(),
  language: z.string().optional()
})

schema() {
  return z.toJSONSchema(
    zodSchema,
    { io: "input" }
  ) as Schema
}
```

### Optional Arguments

Arguments can be optional by not including them in the `required` array:

```typescript
schema() {
  return {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The topic to explain"
      },
      level: {
        type: "string",
        description: "Difficulty level (beginner, intermediate, advanced)",
        default: "beginner"
      }
    },
    required: ["topic"] // level is optional
  } as Schema
}
```

### Complex Schemas

You can define complex schemas with nested objects and arrays:

```typescript
type Schema = BaseSchema<{
  files: {
    type: "array"
    items: {
      type: "object"
      properties: {
        path: { type: "string" }
        content: { type: "string" }
      }
    }
  }
  options: {
    type: "object"
    properties: {
      strict: { type: "boolean" }
      style: { type: "string" }
    }
  }
}>

schema() {
  return {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            content: { type: "string" }
          },
          required: ["path", "content"]
        }
      },
      options: {
        type: "object",
        properties: {
          strict: { type: "boolean" },
          style: { type: "string" }
        }
      }
    },
    required: ["files"]
  } as Schema
}
```

## Prompt Handler

The `handle` method for prompts returns an array of content objects. This allows you to return multiple pieces of content, including embedded resources. The context includes **args**, **request** (see [Validation](/validation) for VineJS validation with `validateUsing()`), **response**, **auth**, and **bouncer**. To signal an error, return `response.error('message')` or throw `JsonRpcException` from `@jrmc/adonis-mcp/exceptions` (see [Tools - Error Response](/tools#error-response)).

### Basic Handler

```typescript
async handle({ args, response }: PromptContext<Schema>) {
  return [
    response.text(`Please review this ${args?.language} code:`),
    response.text(args?.code),
    response.text('Provide feedback on code quality, potential bugs, and improvements.')
  ]
}
```

### With Authentication

```typescript
async handle({ args, auth, response }: PromptContext<Schema>) {
  const user = auth?.user
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return [
    response.text(`Hello ${user.name},`),
    response.text(`Please analyze the following ${args?.language} code:`),
    response.text(args?.code)
  ]
}
```

### With Embedded Resources

You can embed resources in your prompt responses:

```typescript
async handle({ args, response }: PromptContext<Schema>) {
  return [
    response.text('Please review this code:'),
    response.embeddedResource(`file:///${args?.filename}`),
    response.text('Provide detailed feedback.')
  ]
}
```

## Prompt Responses

Prompts support various response methods, and you must always return an array of content items:

### Text Content

```typescript
return [
  response.text('This is plain text content')
]
```

### Image Content

For images, use base64-encoded data:

```typescript
const imageData = await fs.readFile('diagram.png', 'base64')

return [
  response.text('Here is a visual diagram:'),
  response.image(imageData, 'image/png')
]
```

### Audio Content

For audio, use base64-encoded data:

```typescript
const audioData = await fs.readFile('instruction.mp3', 'base64')

return [
  response.text('Listen to this instruction:'),
  response.audio(audioData, 'audio/mpeg')
]
```

### Embedded Resources

Reference other resources in your prompts:

```typescript
return [
  response.text('Review these files:'),
  response.embeddedResource('file:///src/main.ts'),
  response.embeddedResource('file:///src/utils.ts'),
  response.text('Look for any potential issues.')
]
```

### Response Metadata

Add metadata to any response using `withMeta()`:

```typescript
return [
  response.text('Analyze this code:').withMeta({ 
    language: args?.language,
    complexity: 'high'
  }),
  response.text(args?.code),
  response.text('Focus on performance and security.')
]
```

### Multiple Content Types

Combine different content types in a single prompt:

```typescript
return [
  response.text('Code Review Session'),
  response.text(`Language: ${args?.language}`),
  response.text('Code to review:'),
  response.text(args?.code),
  response.embeddedResource('file:///guidelines/coding-standards.md'),
  response.text('Please provide feedback following the guidelines above.')
]
```

## Completions

Prompts can provide argument completions to help users fill in parameters interactively.

First, enable completions in your `config/mcp.ts`:

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
  completions: true, // Enable completions
})
```

Then implement the `complete()` method:

```typescript
import type { PromptContext, CompleteContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema, InferJSONSchema } from '@jrmc/adonis-mcp/types/method'

import { Prompt } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  language: { type: "string" }
  code: { type: "string" }
}>

export default class CodeReviewPrompt extends Prompt<Schema> {
  name = 'code_review'
  title = 'Code Review'
  description = 'Review code and provide feedback'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text(`Please review this ${args?.language} code:`),
      response.text(args?.code)
    ]
  }

  async complete({ args, response }: CompleteContext<InferJSONSchema<Schema>>) {
    // Provide language suggestions when the user types
    if (args?.language !== undefined) {
      return response.complete({
        values: ['python', 'javascript', 'typescript', 'java', 'go', 'rust']
      })
    }
    
    return response.complete({ values: [] })
  }

  schema() {
    return {
      type: "object",
      properties: {
        language: {
          type: "string",
          description: "Programming language"
        },
        code: {
          type: "string",
          description: "Code to review"
        }
      },
      required: ["language", "code"]
    } as Schema
  }
}
```

### Completion Context

The `complete()` method receives a `CompleteContext` that includes:

- **args**: The current argument values (partial or complete)
- **response**: The response object with a `complete()` method

The response format:

```typescript
response.complete({
  values: string[],     // Array of suggested values
  hasMore?: boolean,    // Optional: indicates if more values are available
  total?: number        // Optional: total number of available values
})
```

### Dynamic Completions

You can provide dynamic completions based on the current input or database queries:

```typescript
async complete({ args, response }: CompleteContext<Schema>) {
  if (args?.projectName !== undefined) {
    // Fetch project names from database
    const projects = await Project.query().select('name')
    const names = projects.map(p => p.name)
    
    return response.complete({
      values: names,
      total: names.length
    })
  }
  
  return response.complete({ values: [] })
}
```

## Complete Example

Here is a complete example of a prompt for code review with completions:

```typescript
import type { PromptContext, CompleteContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'

import { Prompt } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  code: { type: "string" }
  language: { type: "string" }
  focus: { type: "string" }
}>

export default class CodeReviewPrompt extends Prompt<Schema> {
  name = 'code_review'
  title = 'Code Review'
  description = 'Review code and provide detailed feedback'

  async handle({ args, response, auth }: PromptContext<Schema>) {
    const user = auth?.user
    const greeting = user ? `Hello ${user.name},` : 'Hello,'
    
    return [
      response.text(greeting),
      response.text(`Please perform a ${args?.focus} review of this ${args?.language} code:`),
      response.text('```' + args?.language),
      response.text(args?.code),
      response.text('```'),
      response.embeddedResource('file:///guidelines/code-review-checklist.md'),
      response.text('Provide feedback following the checklist above.')
    ]
  }

  async complete({ args, response }: CompleteContext<Schema>) {
    // Language suggestions
    if (args?.language !== undefined) {
      return response.complete({
        values: [
          'javascript',
          'typescript',
          'python',
          'java',
          'go',
          'rust',
          'php',
          'ruby'
        ]
      })
    }
    
    // Focus area suggestions
    if (args?.focus !== undefined) {
      return response.complete({
        values: [
          'security',
          'performance',
          'maintainability',
          'best practices',
          'bug detection',
          'code style'
        ]
      })
    }
    
    return response.complete({ values: [] })
  }

  schema() {
    return {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code to review"
        },
        language: {
          type: "string",
          description: "Programming language"
        },
        focus: {
          type: "string",
          description: "Area to focus on (security, performance, etc.)",
          default: "general"
        }
      },
      required: ["code", "language"]
    } as Schema
  }
}
```

## Use Cases

### Documentation Generation

```typescript
export default class GenerateDocsPrompt extends Prompt<Schema> {
  name = 'generate_docs'
  title = 'Generate Documentation'
  description = 'Generate documentation for code'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text('Generate comprehensive documentation for the following code:'),
      response.text(args?.code),
      response.text('Include:'),
      response.text('- Function/class description'),
      response.text('- Parameter explanations'),
      response.text('- Return value description'),
      response.text('- Usage examples'),
      response.text('- Edge cases and error handling')
    ]
  }
}
```

### Code Explanation

```typescript
export default class ExplainCodePrompt extends Prompt<Schema> {
  name = 'explain_code'
  title = 'Explain Code'
  description = 'Get detailed explanation of code'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text(`Explain this ${args?.language} code in detail:`),
      response.text(args?.code),
      response.text(`Explain at ${args?.level || 'intermediate'} level.`),
      response.text('Cover:'),
      response.text('- What the code does'),
      response.text('- How it works step by step'),
      response.text('- Key concepts used'),
      response.text('- Potential improvements')
    ]
  }
}
```

### Test Generation

```typescript
export default class GenerateTestsPrompt extends Prompt<Schema> {
  name = 'generate_tests'
  title = 'Generate Tests'
  description = 'Generate unit tests for code'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text(`Generate unit tests for this ${args?.language} code:`),
      response.text(args?.code),
      response.embeddedResource(`file:///templates/test-template-${args?.language}.txt`),
      response.text('Follow the template above and include:'),
      response.text('- Happy path tests'),
      response.text('- Edge case tests'),
      response.text('- Error handling tests'),
      response.text('- Mock setup if needed')
    ]
  }
}
```