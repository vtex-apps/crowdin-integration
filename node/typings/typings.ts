import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

declare global {
  interface State {
    // When a middleware inject some information in `ctx.state` put this information and its type here.
    srcMessage: string,
    targetMessage: string,
    srcLang: string,
    targetLang: string,
    groupContext: string
  }

  type Context = ServiceContext<Clients, State, void>
}
