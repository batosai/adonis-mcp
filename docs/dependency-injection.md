# Dependency Injection

You can inject dependencies with the `@inject()` decorator in your tool/resource/prompt classes and methods like you would expect in AdonisJS.

```ts
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'

import { inject } from '@adonisjs/core'
import { Resource } from '@jrmc/adonis-mcp'

@inject()
export default class MyResourceResource extends Resource {
  name = 'example.txt'
  uri = 'file:///example.txt'
  mimeType = 'text/plain'
  title = 'Resource title'
  description = 'Resource description'
  size = 0
  
  constructor(private helloService: HelloService) {
    super()
  }

  @inject()
  async handle({ response }: ResourceContext, anotherService: AnotherService) {
    this.size = 1000
    const text = `${this.helloService.world()} ${anotherService.method()}`
    return response.text(text)
  }
}

```