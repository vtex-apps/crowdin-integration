import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

declare global {
  interface State {
    srcMessage: string,
    targetMessage: string,
    srcLang: string,
    targetLang: string,
    groupContext: string
  }

  type Context = ServiceContext<Clients, State, void>
}
