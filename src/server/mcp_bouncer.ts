/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { type Bouncer, errors, AuthorizationResponse } from '@adonisjs/bouncer'
import type {
  LazyImport,
  Constructor,
  BouncerAbility,
  AuthorizerResponse,
  NarrowAbilitiesForAUser,
} from '@adonisjs/bouncer/types'

import { ErrorCode } from '../enums/error.js'
import JsonRpcException from './exceptions/jsonrpc_exception.js'

/**
 * Given a Bouncer instance type, extract the return type of `.with(policy)`
 * so we can wrap it without importing the unexported PolicyAuthorizer class.
 */
type PolicyAuthorizerOf<B extends Bouncer<any, any, any>, Policy> = B extends {
  with(policy: Policy): infer R
}
  ? R
  : never

/**
 * Replaces each async method's return‑type with one that converts
 * E_AUTHORIZATION_FAILURE → JsonRpcException, while keeping the
 * original parameter signatures intact.
 */
type WrappedPolicyAuthorizer<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<R>
    : T[K]
}

/**
 * Convert any caught error to a JsonRpcException.
 */
function handleError(error: unknown, requestId: string | number): never {
  if (error instanceof errors.E_AUTHORIZATION_FAILURE) {
    const message = error.response?.message || error.message || 'Access denied'
    throw new JsonRpcException(message, ErrorCode.InvalidRequest, requestId)
  }

  if (error instanceof JsonRpcException) {
    throw error
  }

  const message = error instanceof Error ? error.message : 'Authorization error'
  throw new JsonRpcException(message, ErrorCode.InternalError, requestId)
}

/**
 * Wrap a PolicyAuthorizer so that every async method (`execute`,
 * `allows`, `denies`, `authorize`) converts authorization failures
 * into JsonRpcException.
 */
function wrapPolicyAuthorizer<T extends Record<string, any>>(
  authorizer: T,
  requestId: string | number
): WrappedPolicyAuthorizer<T> {
  const wrapped = ['execute', 'allows', 'denies', 'authorize']

  return new Proxy(authorizer, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)

      if (typeof value === 'function' && typeof prop === 'string' && wrapped.includes(prop)) {
        const fn = value as Function
        return async (...args: any[]) => {
          try {
            return await fn.apply(target, args)
          } catch (error: unknown) {
            handleError(error, requestId)
          }
        }
      }

      return value
    },
  }) as WrappedPolicyAuthorizer<T>
}

/**
 * McpBouncer wraps the AdonisJS Bouncer instance and converts
 * authorization exceptions (`E_AUTHORIZATION_FAILURE`) into
 * `JsonRpcException` so they are properly serialized as JSON-RPC
 * error responses instead of leaking HTTP-centric error handling.
 *
 * Every public method signature is kept identical to the original
 * Bouncer class so that consumers get full type-safety.
 */
export default class McpBouncer<
  User extends Record<any, any>,
  Abilities extends Record<string, BouncerAbility<any>> | undefined = undefined,
  Policies extends Record<string, LazyImport<Constructor<any>>> | undefined = undefined,
> {
  #bouncer: Bouncer<User, Abilities, Policies>
  #requestId: string | number

  constructor(bouncer: Bouncer<User, Abilities, Policies>, requestId: string | number) {
    this.#bouncer = bouncer
    this.#requestId = requestId
  }

  /**
   * Access the underlying bouncer abilities.
   */
  get abilities(): Abilities | undefined {
    return this.#bouncer.abilities
  }

  /**
   * Access the underlying bouncer policies.
   */
  get policies(): Policies | undefined {
    return this.#bouncer.policies
  }

  // ---------------------------------------------------------------------------
  // with() – Policy authorizer
  // ---------------------------------------------------------------------------

  /**
   * Returns a wrapped PolicyAuthorizer for a pre-registered policy name.
   */
  with<Policy extends keyof Policies>(
    policy: Policy
  ): Policies extends Record<string, LazyImport<Constructor<any>>>
    ? WrappedPolicyAuthorizer<PolicyAuthorizerOf<Bouncer<User, Abilities, Policies>, Policy>>
    : never

  /**
   * Returns a wrapped PolicyAuthorizer for a policy class constructor.
   */
  with<Policy extends Constructor<any>>(
    policy: Policy
  ): WrappedPolicyAuthorizer<PolicyAuthorizerOf<Bouncer<User, Abilities, Policies>, Policy>>

  with(policy: any): any {
    const authorizer = this.#bouncer.with(policy)
    return wrapPolicyAuthorizer(authorizer, this.#requestId)
  }

  // ---------------------------------------------------------------------------
  // execute()
  // ---------------------------------------------------------------------------

  /**
   * Execute an ability by reference.
   */
  execute<Ability extends BouncerAbility<User>>(
    ability: Ability,
    ...args: Ability extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<AuthorizationResponse>

  /**
   * Execute an ability from the list of pre-defined abilities.
   */
  execute<Ability extends NarrowAbilitiesForAUser<User, Abilities>>(
    ability: Ability,
    ...args: Abilities[Ability] extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<AuthorizationResponse>

  async execute(ability: any, ...args: any[]): Promise<AuthorizationResponse> {
    try {
      return await this.#bouncer.execute(ability, ...args)
    } catch (error: unknown) {
      handleError(error, this.#requestId)
    }
  }

  // ---------------------------------------------------------------------------
  // allows()
  // ---------------------------------------------------------------------------

  /**
   * Check if a user is allowed to perform an action using
   * the ability provided by reference.
   */
  allows<Ability extends BouncerAbility<User>>(
    ability: Ability,
    ...args: Ability extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<boolean>

  /**
   * Check if a user is allowed to perform an action using
   * the ability from the pre-defined list of abilities.
   */
  allows<Ability extends NarrowAbilitiesForAUser<User, Abilities>>(
    ability: Ability,
    ...args: Abilities[Ability] extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<boolean>

  async allows(ability: any, ...args: any[]): Promise<boolean> {
    try {
      return await this.#bouncer.allows(ability, ...args)
    } catch (error: unknown) {
      handleError(error, this.#requestId)
    }
  }

  // ---------------------------------------------------------------------------
  // denies()
  // ---------------------------------------------------------------------------

  /**
   * Check if a user is denied from performing an action using
   * the ability provided by reference.
   */
  denies<Action extends BouncerAbility<User>>(
    action: Action,
    ...args: Action extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<boolean>

  /**
   * Check if a user is denied from performing an action using
   * the ability from the pre-defined list of abilities.
   */
  denies<Action extends NarrowAbilitiesForAUser<User, Abilities>>(
    action: Action,
    ...args: Abilities[Action] extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<boolean>

  async denies(action: any, ...args: any[]): Promise<boolean> {
    try {
      return await this.#bouncer.denies(action, ...args)
    } catch (error: unknown) {
      handleError(error, this.#requestId)
    }
  }

  // ---------------------------------------------------------------------------
  // authorize()
  // ---------------------------------------------------------------------------

  /**
   * Authorize a user against a given ability.
   *
   * @throws {JsonRpcException}
   */
  authorize<Action extends BouncerAbility<User>>(
    action: Action,
    ...args: Action extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<void>

  /**
   * Authorize a user against a given ability.
   *
   * @throws {JsonRpcException}
   */
  authorize<Ability extends NarrowAbilitiesForAUser<User, Abilities>>(
    ability: Ability,
    ...args: Abilities[Ability] extends {
      original: (
        user: User,
        ...args: infer Args
      ) => AuthorizerResponse | Promise<AuthorizerResponse>
    }
      ? Args
      : never
  ): Promise<void>

  async authorize(ability: any, ...args: any[]): Promise<void> {
    try {
      return await this.#bouncer.authorize(ability, ...args)
    } catch (error: unknown) {
      handleError(error, this.#requestId)
    }
  }

  // ---------------------------------------------------------------------------
  // deny()
  // ---------------------------------------------------------------------------

  /**
   * Create AuthorizationResponse to deny access.
   * This is a pass-through since it doesn't throw.
   */
  deny(message: string, status?: number): AuthorizationResponse {
    return this.#bouncer.deny(message, status)
  }
}
