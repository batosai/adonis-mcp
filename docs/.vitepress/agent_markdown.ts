import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

const DOCS_DIR = 'docs'
const DIST_DIR = join(DOCS_DIR, '.vitepress', 'dist')
const EXCLUDED_FILES = new Set(['AGENTS.md', 'README.md', 'TODO.md'])

interface Page {
  description?: string
  path: string
  title?: string
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        if (entry.name === '.vitepress') return []
        return findMarkdownFiles(path)
      }

      return entry.isFile() && entry.name.endsWith('.md') && !EXCLUDED_FILES.has(entry.name)
        ? [path]
        : []
    }),
  )

  return files.flat()
}

function frontmatterValue(frontmatter: string, name: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*["']?(.+?)["']?\\s*$`, 'm'))
  return match?.[1]
}

function toAgentMarkdown(source: string): Pick<Page, 'description' | 'title'> & { content: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  const frontmatter = match?.[1] ?? ''
  const frontmatterTitle = frontmatterValue(frontmatter, 'title')
  const sourceContent = source.slice(match?.[0].length ?? 0).trim()
  const sourceTitle = sourceContent.match(/^#\s+(.+)$/m)?.[1]

  return {
    title: frontmatterTitle ?? sourceTitle,
    description: frontmatterValue(frontmatter, 'description'),
    content:
      !frontmatterTitle && sourceTitle
        ? sourceContent.replace(/^#\s+.+\n*/, '')
        : sourceContent,
  }
}

/**
 * Writes a Markdown twin for every public documentation page. Caddy serves
 * these files only after an explicit `Accept: text/markdown` request.
 */
export async function buildAgentMarkdown(): Promise<void> {
  const files = await findMarkdownFiles(DOCS_DIR)
  const pages = await Promise.all(
    files.map(async (file) => {
      const path = relative(DOCS_DIR, file)
      const { content, description, title } = toAgentMarkdown(await readFile(file, 'utf8'))
      const markdown = [title && `# ${title}`, description && `> ${description}`, content, '']
        .filter(Boolean)
        .join('\n\n')
      const output = join(DIST_DIR, path)

      await mkdir(dirname(output), { recursive: true })
      await writeFile(output, markdown, 'utf8')

      return { path, title, description } satisfies Page
    }),
  )

  const llmsTxt = [
    '# Adonis MCP',
    '> Documentation for @jrmc/adonis-mcp, an MCP server package for AdonisJS.',
    '## Documentation',
    ...pages
      .sort((left, right) => left.path.localeCompare(right.path))
      .map((page) => {
        const path = page.path.replace(/index\.md$/, '').replace(/\.md$/, '')
        const url = `https://adonis-mcp.jrmc.dev/${path}`
        return `- [${page.title ?? page.path}](${url}): ${page.description ?? 'Documentation Adonis MCP.'}`
      }),
    '',
  ].join('\n')

  await writeFile(join(DIST_DIR, 'llms.txt'), llmsTxt, 'utf8')
}
