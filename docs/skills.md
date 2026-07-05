# Agent Skills

Adonis MCP ships an [agent skill](https://skills.sh) that teaches AI coding agents (Claude Code, Cursor, Codex, etc.) the package conventions: how to create tools, resources, and prompts, configure the server, secure it with Auth and Bouncer, and test it.

Once installed in your project, your agent automatically applies the right patterns when you ask it things like *"add an MCP tool that lists my articles"* — correct file naming for auto-discovery, JSON Schema definitions, response types, JSON-RPC error handling, and more.

## Installation

From the root of your AdonisJS project:

```bash
npx skills add batosai/adonis-mcp
```

The CLI detects your agent (Claude Code, Cursor, Codex, etc.) and installs the skill in the right location (e.g. `.claude/skills/` for Claude Code).

## What's included

The `adonis-mcp` skill contains:

- **Core guide** — Creating tools, resources, and prompts: mandatory file naming (`_tool.ts`, `_resource.ts`, `_prompt.ts`), ace generators, JSON Schema / Zod / VineJS schemas, response content types, annotations, errors (`JsonRpcException`), completions, dependency injection, and events.
- **Setup reference** — Installation, `config/mcp.ts`, route registration, CSRF exclusion, MCP middleware and sessions, HTTP/stdio transports.
- **Authentication reference** — Auth middleware, Bouncer abilities and policies, `McpContext` type augmentation.
- **Testing reference** — Integration tests with `FakeTransport` and Japa, MCP Inspector.

The skill uses progressive disclosure: the agent loads the core guide when relevant, and only reads the reference files when it needs them — keeping your agent's context lean.

## Source

The skill lives in the [`skills/` directory](https://github.com/batosai/adonis-mcp/tree/main/skills) of the repository and is kept in sync with this documentation. Issues and contributions are welcome.
