export class CursorPaginator {
  constructor(private items: unknown[], private perPage: number, private cursor?: string) {}

  public paginate(key: string = 'items'): { [key: string]: unknown } {
    const startOffset = this.getStartOffsetFromCursor()
    console.log('startOffset', startOffset)
    const paginatedItems = this.items.slice(startOffset, startOffset + this.perPage)

    const hasMorePages = this.items.length > (startOffset + this.perPage)
    console.log('hasMorePages', hasMorePages)
    console.log('paginatedItems', paginatedItems.length)
    const result: Record<string, unknown> = {
      [key]: paginatedItems,
    }

    if (hasMorePages) {
      result.nextCursor = this.createCursor(startOffset + this.perPage)
    }

    return result
  }

  protected getStartOffsetFromCursor() {
    if (!this.cursor) {
      return 0
    }

    try {
      const decodedCursor = Buffer.from(this.cursor, 'base64').toString('utf-8')

      if (!decodedCursor) {
        return 0
      }

      const cursorData = JSON.parse(decodedCursor)

      if (!cursorData.hasOwnProperty('offset')) {
        return 0
      }

      return parseInt(cursorData.offset)
    } catch (error) {
      //
    }

    return 0
  }

  protected createCursor(offset: number) {
    return Buffer.from(JSON.stringify({ offset })).toString('base64')
  }
}