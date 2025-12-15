/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../server/contracts/content.js'

type HasMeta = {
  withMeta: (meta: Record<string, unknown>) => Content
}

export type TextPrompt = Content &
  HasMeta & {
    asAssistant: () => Content
    asUser: () => Content
  }

export type ImagePrompt = Content &
  HasMeta & {
    asAssistant: () => Content
    asUser: () => Content
  }

export type AudioPrompt = Content &
  HasMeta & {
    asAssistant: () => Content
    asUser: () => Content
  }

export type EmbeddedResource = Content &
  HasMeta & {
    asAssistant: () => Content
    asUser: () => Content
  }

export type Text = Content & HasMeta
export type Blob = Content & HasMeta
export type Image = Content & HasMeta
export type Audio = Content & HasMeta
export type ResourceLink = Content & HasMeta
export type Structured = Content
export type Error = Content
