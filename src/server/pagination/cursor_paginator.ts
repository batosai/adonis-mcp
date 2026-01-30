/** Decoded cursor payload shape */
interface CursorPayload {
  offset?: number
}

export class CursorPaginator<T> {
  #items: T[]
  #perPage: number
  #cursor?: string

  constructor(items: T[], perPage: number, cursor?: string) {
    this.#items = items
    this.#perPage = perPage
    this.#cursor = cursor
  }

  public paginate<K extends string>(key: K): { [P in K]: T[] } & { nextCursor?: string } {
    const startOffset = this.getStartOffsetFromCursor()

    const paginatedItems = this.#items.slice(startOffset, startOffset + this.#perPage)

    const hasMorePages = this.#items.length > startOffset + this.#perPage

    const result: Record<string, unknown> = {
      [key]: paginatedItems,
    }

    if (hasMorePages) {
      result.nextCursor = this.createCursor(startOffset + this.#perPage)
    }

    return result as { [P in K]: T[] } & { nextCursor?: string }
  }

  protected getStartOffsetFromCursor(): number {
    if (!this.#cursor) {
      return 0
    }

    try {
      const decodedCursor = Buffer.from(this.#cursor, 'base64').toString('utf-8')

      if (!decodedCursor) {
        return 0
      }

      const cursorData = JSON.parse(decodedCursor) as CursorPayload

      if (!cursorData.hasOwnProperty('offset') || typeof cursorData.offset !== 'number') {
        return 0
      }

      return cursorData.offset
    } catch (_error: unknown) {
      //
    }

    return 0
  }

  protected createCursor(offset: number): string {
    return Buffer.from(JSON.stringify({ offset })).toString('base64')
  }
}
