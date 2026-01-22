import type { Application } from '@adonisjs/core/app'
import type { ContainerBindings } from '@adonisjs/core/types'

export const fakeApp = {
  container: {
    make: (Obj: any) => new Obj(),
    call: (obj: any, method: string, args: any[]) => obj[method](...args),
  },
} as unknown as Application<ContainerBindings>
