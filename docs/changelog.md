# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0-beta.9

> Released at *2026-03-04*

### Added

- `McpBouncer` wrapper class — wraps AdonisJS Bouncer and converts `E_AUTHORIZATION_FAILURE` into `JsonRpcException` for proper JSON-RPC error responses
- Full type-safe Bouncer integration with generic support (`McpBouncer<User, Abilities, Policies>`)
- Wrapped `PolicyAuthorizer` — calls to `.authorize()`, `.allows()`, `.denies()`, `.execute()` on policies are also converted
- `@adonisjs/bouncer` as optional `peerDependency`
- Authentication & Authorization documentation page
- Module augmentation support — users can declare their concrete Bouncer types on `McpContext` via `declare module` in the MCP middleware

### Changed

- `McpContext` interface no longer declares `bouncer` directly — it is extended by the user's app via declaration merging for full type-safety

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
