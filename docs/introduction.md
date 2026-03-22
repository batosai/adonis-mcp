# Introduction

Adonis MCP provides a simple and elegant way for AI clients to interact with your AdonisJS application through the [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro). It offers an expressive, fluent interface for defining tools, resources, and prompts that enable AI-powered interactions with your application.

## What is the Model Context Protocol?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to AI models. It enables AI assistants to interact with your application in a structured and type-safe manner.

## Core Concepts

### Tools

Tools are functions that AI models can call to perform actions in your application. They have:

- A unique name and description
- A JSON Schema defining their input parameters
- A handler that executes the tool's logic
- Type-safe response methods

Example use cases:
- Creating or updating records in your database
- Sending emails or notifications
- Performing calculations or data transformations
- Interacting with external APIs

### Resources

Resources represent data or content that AI models can access. They have:

- A unique URI (with support for templates)
- Optional metadata (name, description, MIME type, size)
- A handler that returns the resource content
- Support for both text and binary content

Example use cases:
- Exposing documentation or help files
- Providing access to database records
- Sharing configuration files
- Serving generated reports

### Prompts

Prompts are reusable templates that help structure AI interactions. They have:

- A unique name and description
- Optional arguments with validation
- A handler that returns prompt content
- Support for multiple content types and embedded resources

Example use cases:
- Code review templates
- Documentation generation prompts
- Structured question-answer formats
- Multi-step workflows

## Features

### 🚀 Type Safety

Full TypeScript support with type-safe schemas, validated arguments, and typed response methods.

### 🔌 Multiple Transports

Support for HTTP, stdio, and fake transports to fit your deployment needs:

- **HTTP**: Perfect for web applications and APIs
- **Stdio**: Ideal for command-line tools and local integrations
- **Fake**: Useful for testing and development

### 🏷️ Annotations

Annotate your tools and resources with metadata to help AI clients understand their behavior:

- Tool annotations: `@isReadOnly()`, `@isDestructive()`, `@isIdempotent()`, `@isOpenWorld()`
- Resource annotations: `@priority()`, `@audience()`, `@lastModified()`

### 📄 Pagination

Efficient cursor-based pagination for listing large numbers of tools and resources.

### 🔍 Inspector

Built-in debugging tool to test and inspect your MCP implementation during development.

### 🧪 Testing Support

Fake transport for easy testing of your MCP tools, resources, and prompts.

### 🔐 Authentication & Authorization

Built-in support for AdonisJS authentication and Bouncer authorization in your MCP handlers.

## Roadmap

- [x] MCP tools support
- [x] MCP resources support
- [x] MCP prompts support
- [x] HTTP transport
- [x] Stdio transport
- [x] Fake transport (for testing)
- [x] Advanced pagination support
- [x] Meta support
- [x] Annotations
- [x] Completion
- [x] Inspector
- [x] Session
- [x] Documentation
- [x] Inject support
- [x] VineJs integration
- [x] JSON Schema with VineJs
- [x] Bouncer integration
- [x] Auth helpers
- [x] Starter kit
- [x] Demo applications
- [x] Events
- [x] Logger
- [ ] Alternative transports (SSE)
- [ ] Output tool

## Inspiration

This package is inspired by [Laravel MCP](https://github.com/laravel/mcp) and follows similar patterns adapted for the AdonisJS ecosystem.