import { ClientsConfig, LRUCache, Service } from '@vtex/api'
import { Clients } from './clients/index'
import { doNothing, unwrap } from './crowdinAPI/unwrap'
import { State } from './typings/Colossus'
import { updateCrowdinProject } from './crowdinAPI/update';

const TIMEOUT_MS = 3000
const TRANSLATION_CONCURRENCY = 5
const TRANSLATION_RETRIES = 3

const memoryCache = new LRUCache<string, any>({max: 5000})
metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
      verbose: true,
    },
    messagesGraphQL: {
      concurrency: TRANSLATION_CONCURRENCY,
      retries: TRANSLATION_RETRIES,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}




export default new Service<Clients, State>({
  clients,
  events: {
    userLocalesUpdate: [unwrap, updateCrowdinProject],
  },
})
