// export * from './modules/test'

import { apiClient } from './api-client'
import { Cashorcrash } from './codegen/Cashorcrash'
import { Common } from './codegen/Common'

export default {
  cashorcrash: new Cashorcrash(apiClient),
  common: new Common(apiClient)
}
