/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Create default config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config.ts.stub', {})

  /**
   * Create and configuredefault middleware file
   */
  await codemods.makeUsingStub(stubsRoot, 'make/middleware/mcp_middleware.ts.stub', {})
  await codemods.registerMiddleware('router', [
    { path: '#middleware/mcp_middleware', position: 'after' },
  ])

  const useVine = await command.prompt.toggle('Is Vinejs used for validation?', ['Yes', 'No'])

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('@jrmc/adonis-mcp/commands')
    rcFile.addProvider('@jrmc/adonis-mcp/mcp_provider')
    if (useVine) {
      rcFile.addProvider('@jrmc/adonis-mcp/vinejs_provider')
    }
  })
}
