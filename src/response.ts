/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

// import Role from './enums/role.js'

export default class Response {
  // constructor(_content: string, _role: Role = Role.USER) {}

  
  static notification(_method: string, _params: Record<string, any>) {}

  text(text: string) {
    return {
      content: [{ type: 'text' as const, text }],
    }
  }

  static json(_content: Record<string, any>) {}

  static blob(_content: string) {}

  static error(_text: string) {}

  content() {}

  static audio() {}

  static image() {}

  asAssistant() {}

  isNotification() {}

  isError() {}

  role() {}

  static result(id: number | string, result: Record<string, any>) {
    return this.resultRpc({
      id,
      result,
    })
  }

  static resultRpc(result: Record<string, any>) {
    return {
      jsonrpc: '2.0',
      ...result,
    } as const
  }
}