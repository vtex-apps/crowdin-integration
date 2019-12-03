import { ClientsConfig, LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { unwrap } from './events/crowdinAPI/unwrap'
import { updateCrowdinProject } from './events/crowdinAPI/update'
import { saveInCrowdin } from './events/export'
import { getSettings } from './events/settings'
import { getInfosFromCrowdin } from './middlewares/listenToUpdates'
import { saveIOMessage } from './middlewares/saveUpdateInMessages'

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3
const SHORT_TIMEOUT_MS = 1 * 1000
const CONCURRENCY = 10

const appsCacheStorage = new LRUCache<string, any>({
  max: 10,
})

metrics.trackCache('apps', appsCacheStorage)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    apps: {
      concurrency: CONCURRENCY,
      memoryCache: appsCacheStorage,
      retries: 1,
      timeout: SHORT_TIMEOUT_MS,
    },
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
      POST: [getSettings, getInfosFromCrowdin, saveIOMessage],
    }),
  },
})
