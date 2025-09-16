// export * from './modules/test'

import { apiClient } from './api-client'
import { Cashorcrash } from './codegen/Cashorcrash'

export default {
  cashorcrash: new Cashorcrash(apiClient),
}
