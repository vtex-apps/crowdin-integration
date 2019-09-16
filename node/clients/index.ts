import { IOClients } from '@vtex/api'
import { Crowdin } from './Crowdin'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get crowdin() {
    return this.getOrSet('crowdin', Crowdin)
  }
}
