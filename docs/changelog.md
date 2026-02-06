# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0-beta.6

> Released at *2026-02-06*

- `request.validateUsing()` for validating request data using MCP schemas

## 1.0.0-beta.5

> Released at *2026-01-23*

- Dependency injection

## 1.0.0-beta.1

> Released at *2025-12-22*

### Added

- Initial release of Adonis MCP
- MCP tools support with type-safe schemas
- MCP resources support with URI templates
- MCP prompts support with argument validation
- HTTP transport for web applications
- Stdio transport for command-line tools
- Fake transport for testing
- Advanced cursor-based pagination
- Response metadata support with `withMeta()`
- Tool annotations: `@isReadOnly()`, `@isDestructive()`, `@isIdempotent()`, `@isOpenWorld()`
- Resource annotations: `@priority()`, `@audience()`, `@lastModified()`
- Argument completion support for prompts and resources
- MCP Inspector for debugging and testing
- Session management support
- Authentication and Bouncer integration
- JSON Schema support for input validation
- Zod integration for schema definition
- Multiple response types: text, structured, image, audio, blob
- Resource links and embedded resources
- Comprehensive documentation
- Unit testing utilities and examples
