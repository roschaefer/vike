export { analyzePage }

import type { ClientDependency } from '../../../shared/getPageFiles/analyzePageClientSide/ClientDependency.js'
import { getVikeClientEntry } from '../../../shared/getPageFiles/analyzePageClientSide/determineClientEntry.js'
import type { PageFile } from '../../../shared/getPageFiles/getPageFileObject.js'
import type { PageConfigRuntime } from '../../../shared/page-configs/PageConfig.js'
import { type AnalysisResult, analyzePageClientSide } from '../../../shared/getPageFiles/analyzePageClientSide.js'
import { getVirtualFileIdPageConfigValuesAll } from '../../shared/virtual-files/virtualFilePageConfigValuesAll.js'
import { analyzeClientSide } from '../../../shared/getPageFiles/analyzeClientSide.js'
import { getGlobalContext } from '../globalContext.js'
import { getConfigValueRuntime } from '../../../shared/page-configs/getConfigValue.js'

function analyzePage(pageFilesAll: PageFile[], pageConfig: null | PageConfigRuntime, pageId: string): AnalysisResult {
  if (pageConfig) {
    const { clientEntryLoaded, isClientRouting } = analyzeClientSide(pageConfig, pageFilesAll, pageId)
    const clientEntries: string[] = []
    const clientFilePath = getConfigValueRuntime(pageConfig, 'client', 'string')?.value ?? null
    if (clientFilePath) clientEntries.push(clientFilePath)
    if (clientEntryLoaded) clientEntries.push(getVikeClientEntry(isClientRouting))
    const clientDependencies: ClientDependency[] = []
    clientDependencies.push({
      id: getVirtualFileIdPageConfigValuesAll(pageConfig.pageId, true),
      onlyAssets: clientEntryLoaded ? false : true,
      eagerlyImported: false
    })
    // In production we inject the import of the server virtual module with ?extractAssets inside the client virtual module
    if (!getGlobalContext().isProduction) {
      clientDependencies.push({
        id: getVirtualFileIdPageConfigValuesAll(pageConfig.pageId, false),
        onlyAssets: true,
        eagerlyImported: false
      })
    }
    /* Remove?
    Object.values(pageConfig.configElements).forEach((configElement) => {
      if (configElement.importPath) {
        const { env } = configElement
        assert(env)
        const onlyAssets = env === { server: true }
        const eagerlyImported = env === { server: true, client: 'if-client-routing', eager: true }
        if (onlyAssets || eagerlyImported) {
          clientDependencies.push({
            id: configElement.importPath,
            onlyAssets,
            eagerlyImported
          })
        }
      }
    })
    */
    clientEntries.forEach((clientEntry) => {
      clientDependencies.push({
        id: clientEntry,
        onlyAssets: false,
        eagerlyImported: false
      })
    })
    return {
      isHtmlOnly: !clientEntryLoaded,
      isClientRouting,
      clientEntries,
      clientDependencies,
      // pageFilesClientSide and pageFilesServerSide are only used for debugging
      pageFilesClientSide: [],
      pageFilesServerSide: []
    }
  } else {
    return analyzePageClientSide(pageFilesAll, pageId)
  }
}
