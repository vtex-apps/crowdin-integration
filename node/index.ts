import { ClientsConfig, method, Service } from '@vtex/api'

import { Clients } from './clients/index'
import { unwrap } from './events/crowdinAPI/unwrap'
import { updateCrowdinProject } from './events/crowdinAPI/update'
import { saveInCrowdin } from './events/export'
import { getSettings } from './events/settings'
import { logUpdateInTranslations } from './middlewares/listenToUpdates'
import { saveIOMessage } from './middlewares/saveUpdateInMessages'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    messagesGraphQL: {
      concurrency: TRANSLATION_CONCURRENCY,
      retries: TRANSLATION_RETRIES,
      timeout: TIMEOUT_MS,
    },
  },
}

export default new Service<Clients, State>({
  clients,
  events: {
    receiveExportedMessages: [getSettings, saveInCrowdin],
    updateMessage: [getSettings, unwrap, updateCrowdinProject],
  },
  routes: {
    listenToUpdates: method({
      POST: [getSettings, logUpdateInTranslations, saveIOMessage],
    }),
  },
})
