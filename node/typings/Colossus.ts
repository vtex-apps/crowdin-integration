import { EventContext } from '@vtex/api'

import { Clients } from '../clients'
import { MessagesCrowdinByGroupContextAndSrcLang } from './Messages'

export interface ColossusEventContext extends EventContext<Clients, State> {
  status: number
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}

export interface State {
  to: string
  messagesCrowdinByGroupContextAndSrcLang: MessagesCrowdinByGroupContextAndSrcLang
}
