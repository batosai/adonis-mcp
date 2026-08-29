---
layout: home

hero:
  name: "Adonis MCP"
  text: "Your AdonisJS app, ready for AI"
  tagline: Build typed tools, resources, and prompts with the framework conventions you already know.
  actions:
    - theme: brand
      text: Get started
      link: /installation
    - theme: alt
      text: Explore version 2
      link: /protocol

features:
  - icon: "🛠️"
    title: Tools
    details: Turn application services into typed actions that AI clients can discover and call.
    link: /tools
    linkText: Create a tool
  - icon: "📚"
    title: Resources
    details: Expose files, records, and dynamic URI templates as contextual data for models.
    link: /resources
    linkText: Share resources
  - icon: "✨"
    title: Prompts
    details: Package reusable workflows with typed arguments and argument completion.
    link: /prompts
    linkText: Design prompts
---

<div class="home-showcase">
  <section class="home-intro" aria-labelledby="home-intro-title">
    <div class="home-intro-copy">
      <span class="home-eyebrow">Built for AdonisJS</span>
      <h2 id="home-intro-title">From application code to MCP in one expressive API.</h2>
      <p>
        Keep dependency injection, authentication, Bouncer policies, and validation close to your
        domain. Adonis MCP handles discovery, protocol messages, and transport details.
      </p>
      <div class="home-pills" aria-label="Package highlights">
        <span>TypeScript first</span>
        <span>Stateless HTTP</span>
        <span>JSON Schema</span>
      </div>
    </div>

  <div class="home-code-window" aria-label="Example MCP tool">
    <div class="home-code-header">
      <span class="home-window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>app/mcp/tools/greet_tool.ts</span>
    </div>
    <pre v-pre><code><span class="code-keyword">import</span> { Tool } <span class="code-keyword">from</span> <span class="code-string">'@jrmc/adonis-mcp'</span><br><br><span class="code-keyword">export default class</span> <span class="code-type">GreetTool</span> <span class="code-keyword">extends</span> Tool {<br>  name = <span class="code-string">'greet'</span><br>  description = <span class="code-string">'Welcome a user'</span><br><br>  <span class="code-keyword">async</span> handle({ response }) {<br>    <span class="code-keyword">return</span> response.text(<span class="code-string">'Welcome!'</span>)<br>  }<br>}</code></pre>
  </div>
  </section>

  <section class="home-flow" aria-labelledby="home-flow-title">
    <div class="home-section-heading">
      <span class="home-eyebrow">One endpoint, every client</span>
      <h2 id="home-flow-title">A clean bridge between AI and your application.</h2>
    </div>
    <div class="home-flow-grid">
      <div class="home-flow-card">
        <span class="home-flow-index">01</span>
        <strong>AI client</strong>
        <p>Discovers capabilities and sends standard MCP requests.</p>
      </div>
      <span class="home-flow-arrow" aria-hidden="true">→</span>
      <div class="home-flow-card home-flow-card-brand">
        <span class="home-flow-index">02</span>
        <strong>Adonis MCP</strong>
        <p>Routes, validates, authorizes, and formats every exchange.</p>
      </div>
      <span class="home-flow-arrow" aria-hidden="true">→</span>
      <div class="home-flow-card">
        <span class="home-flow-index">03</span>
        <strong>Your domain</strong>
        <p>Runs the application logic you already trust and maintain.</p>
      </div>
    </div>
  </section>

  <section class="home-capabilities" aria-label="Adonis MCP capabilities">
    <a href="/authentication" class="home-capability">
      <span class="home-capability-icon">◆</span>
      <span><strong>Authorization built in</strong><small>Use Auth and Bouncer directly from handler context.</small></span>
    </a>
    <a href="/validation" class="home-capability">
      <span class="home-capability-icon">◇</span>
      <span><strong>Your preferred schema</strong><small>Work with JSON Schema, VineJS, or Zod.</small></span>
    </a>
    <a href="/inspector" class="home-capability">
      <span class="home-capability-icon">◉</span>
      <span><strong>Easy to inspect</strong><small>Debug over HTTP or stdio and test with a fake transport.</small></span>
    </a>
    <a href="/protocol" class="home-capability">
      <span class="home-capability-icon">↗</span>
      <span><strong>Modern protocol</strong><small>Stateless MCP 2026-07-28 with legacy compatibility.</small></span>
    </a>
  </section>

  <section class="home-cta">
    <div>
      <span class="home-eyebrow">Ready when you are</span>
      <h2>Add MCP to your AdonisJS application.</h2>
      <p>Install the package, register a route, and create your first tool.</p>
    </div>
    <div class="home-cta-actions">
      <code>node ace add @jrmc/adonis-mcp</code>
      <a href="/installation">Read the installation guide <span aria-hidden="true">→</span></a>
    </div>
  </section>
</div>
