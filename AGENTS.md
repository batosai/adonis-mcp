# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Project Overview

`@jrmc/adonis-mcp` is an AdonisJS package that provides a Model Context Protocol (MCP) server for AdonisJS applications. It allows AdonisJS apps to expose tools, resources, and prompts over MCP via HTTP, stdio, or fake (testing) transports.

## Commands

- **Build:** `npm run build` (cleans, runs tsc, copies stubs; postbuild indexes ace commands)
- **Type check:** `npm run typecheck`
- **Format:** `npm run format` (prettier, `@adonisjs/prettier-config`)
- **Run all tests:** `npm test`
- **Run a single test file:** `node --loader ts-node/esm --enable-source-maps bin/test.ts -- tests/unit/path/to/file.spec.ts`
- **Docs (VitePress):** `npm run docs:dev` / `docs:build` / `docs:preview`

Tests use Japa (`@japa/runner`) with `assert` and `expect-type` plugins. Test files live under `tests/unit/` with the `.spec.ts` extension; fixtures (sample tools/resources/prompts) under `tests/fixtures/`, helpers (fake app, context/request factories) under `tests/helpers/`.

## Architecture

### Entry Point and Exports

- `index.ts` — Public API: exports `Tool`, `Resource`, `Prompt`, `McpResponse`, `defineConfig`, and `configure`.
- `configure.ts` — AdonisJS package configuration hook (runs on `node ace add`); publishes `stubs/config.ts.stub` and the MCP middleware stub.
- `package.json` `exports` — many subpath exports consumers rely on (`./types/*`, `./contents/*`, `./annotations`, `./transports/*`, `./bouncer`, `./exceptions`, …). When adding a new public module, add the corresponding subpath here.

### Core Server (`src/server.ts`)

The `Server` class is the central orchestrator. It:
- Holds registered tools, resources, and prompts as path maps (name/uri → file path)
- Dispatches JSON-RPC requests to lazily-imported method handlers
- Binds a transport for sending responses
- Creates `ServerContext` instances per request

### Providers (`providers/`)

- `mcp_provider.ts` — registers the server as a singleton (`jrmc.mcp`), extends the AdonisJS router with `router.mcp(path?)`, and auto-discovers tool/resource/prompt files from `app/mcp/{tools,resources,prompts}/` by scanning for files ending in `_tool.ts`, `_resource.ts`, or `_prompt.ts`.
- `vinejs_provider.ts` — adds a `validateUsing()` macro on `McpRequest` (VineJS validation inside handlers). Optional, registered separately by the consumer app.

### MCP Primitives (`src/server/tool.ts`, `resource.ts`, `prompt.ts`)

Base classes for the three MCP primitive types. Each defines a `handle()` method receiving a typed context and a `schema()` method returning JSON Schema for input validation. Resources also support URI templates (RFC 6570, see `src/utils/uri_template.ts`).

### Method Handlers (`src/server/methods/`)

Each JSON-RPC method (`initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/templates/list`, `resources/read`, `prompts/list`, `prompts/get`, `completion/complete`, `ping`) is a separate lazily-loaded module implementing a `handle(context)` method. The `*/list` methods support cursor-based pagination via `src/server/pagination/cursor_paginator.ts`.

### Transports (`src/server/transports/`)

- `http_transport.ts` — HTTP-based transport (default, used via `router.mcp()`)
- `stdio_transport.ts` — Standard I/O transport for CLI-based MCP servers
- `fake_transport.ts` — For testing; captures sent messages

### Content Types (`src/server/contents/`)

Response content objects: `text`, `image`, `audio`, `blob`, `structured`, `error`, `resource_link`, `embedded_resource`. All support `.withMeta()`.

### Annotations (`src/server/annotations/`)

Decorators split into two groups:
- **Tool annotations** (`tool_annotations.ts`): `@isReadOnly()`, `@isOpenWorld()`, `@isDestructive()`, `@isIdempotent()`
- **Resource/general annotations** (`annotations.ts`): `@priority()`, `@audience()`, `@lastModified()`

### Auth and Authorization

- The MCP context picks up `auth` and `bouncer` from the `HttpContext` when middleware sets them (consumer apps declare them on `McpContext` via module augmentation — see README "Setting up Authentication and Bouncer").
- `src/server/mcp_bouncer.ts` — `McpBouncer` wraps `@adonisjs/bouncer` (optional peer dependency) with identical method signatures, converting `E_AUTHORIZATION_FAILURE` into `JsonRpcException` so failures serialize as JSON-RPC errors.

### Errors (`src/server/exceptions/`)

Throw `JsonRpcException` (with an `ErrorCode` from `src/enums/error.ts`) for anything that must reach the client as a JSON-RPC error response.

### Commands (`commands/`)

Ace commands: `make:mcp-tool`, `make:mcp-resource`, `make:mcp-prompt` (scaffold from `stubs/make/`; tools/prompts use the `with_vine` stub automatically when the app uses VineJS), `mcp:inspector` (debug UI over HTTP or stdio), and `mcp:start` (stdio server).

### Agent Skills (`skills/`)

`skills/adonis-mcp/` contains an installable agent skill (`npx skills add batosai/adonis-mcp`) for consumers of the package: `SKILL.md` (creating tools/resources/prompts) plus `references/` (setup, authentication, testing). It is condensed from `docs/` — when a feature or API changes in `docs/`, update the skill accordingly.

### Key Conventions

- File naming: MCP primitives must end with `_tool.ts`, `_resource.ts`, or `_prompt.ts` to be auto-discovered.
- Schemas use JSON Schema format; Zod (`z.toJSONSchema`) or VineJS ≥ v4 (`vine.create(...).toJSONSchema()`) can be used to produce it.
- The server uses JSON-RPC 2.0 as the wire protocol.
- Node.js 22+ (pinned via Volta in package.json).
- ESM-only (`"type": "module"`); internal imports use `.js` extensions.
- Consumer gotcha documented in README: the MCP route must be excluded from CSRF (shield `exceptRoutes`).
