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
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@jrmc/adonis-mcp/mcp_provider')
    rcFile.addCommand('@jrmc/adonis-mcp/commands')
  })
}
