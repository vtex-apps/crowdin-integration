import { MessagesCrowdin, MessagesCrowdinByGroupContext } from './Messages';
import { EventContext, IOClients } from '@vtex/api'
import { Clients } from '../clients'
import { Locales } from './IOMessages'



export interface ColossusEventContext extends EventContext<Clients,State> {
  status: number
  key: string
  sender: string
  body: any
  clients: Clients
  state: State
}


export interface State {
  to: string
  from: string
  messagesCrowdinByGroupContext: MessagesCrowdinByGroupContext
}


export interface ColossusEvent {
  appId: string
  key: string
  message: string
  sender: string
  senderName: string
  trigger: string
  buildId: string
  buildCode: string
  routeId: string
}
