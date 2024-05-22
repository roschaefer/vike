import type { Config } from 'vike/types'

export default {
  meta: {
    Head: {
      env: { server: true },
      cumulative: true
    },
    ['document.title']: {
      env: { server: true, client: true }
    }
  }
} satisfies Config

declare global {
  namespace Vike {
    interface Config {
      document?: {
        title?: string
      }
      frontmatter?: {
        title: string
      }
      Head?: () => JSX.Element
    }
    interface ConfigResolved {
      Head: (() => JSX.Element)[]
    }
    interface PageContext {
      Page?: any
      pageProps?: Record<string, unknown>
    }
  }
}
