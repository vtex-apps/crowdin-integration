import { IOClients } from '@vtex/api'

import { Crowdin } from './Crowdin'

export class Clients extends IOClients {
  public get crowdin() {
    return this.getOrSet('crowdin', Crowdin)
  }
}
