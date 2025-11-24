/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export abstract class Content {
  abstract toTool(): unknown
  abstract toPrompt(): unknown
  abstract toResource(): unknown
}