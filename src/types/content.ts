/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../server/contracts/content.js'

export type TextPrompt = Content & {
  asAssistant: () => Content
  asUser: () => Content
}

export type ImagePrompt = Content & {
  asAssistant: () => Content
  asUser: () => Content
}

export type AudioPrompt = Content & {
  asAssistant: () => Content
  asUser: () => Content
}

export type EmbeddedResource = Content & {
  asAssistant: () => Content
  asUser: () => Content
}

export type Text = Content
export type Blob = Content
export type Image = Content
export type Audio = Content
export type ResourceLink = Content
export type Structured = Content
export type Error = Content
