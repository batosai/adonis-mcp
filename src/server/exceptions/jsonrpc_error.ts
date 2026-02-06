import Error from '../contents/error.js'

export default class JsonRpcError {
  #messages: Record<string, string>[]

  constructor(messages: Record<string, string>[]) {
    this.#messages = messages
  }

  toJsonRpcResponse(): Error[] {
    console.log(this.#messages)
    return this.#messages.map((m) => new Error(m.message))
  }
}
