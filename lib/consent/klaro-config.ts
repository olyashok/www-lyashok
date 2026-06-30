export interface KlaroConfigOpts {
  brand: string
  privacyPolicyUrl: string
}

export interface KlaroConfig {
  version: number
  elementID: string
  storageMethod: string
  cookieName: string
  cookieExpiresAfterDays: number
  privacyPolicy: string
  default: boolean
  mustConsent: boolean
  acceptAll: boolean
  hideDeclineAll: boolean
  htmlTexts: boolean
  services: KlaroService[]
  translations: Record<string, unknown>
}

interface KlaroService {
  name: string
  title: string
  purposes: string[]
  cookies: (RegExp | string)[]
  required: boolean
  optOut: boolean
  onlyOnce: boolean
}

export function buildKlaroConfig(opts: KlaroConfigOpts): KlaroConfig {
  return {
    version: 1,
    elementID: 'klaro',
    storageMethod: 'cookie',
    cookieName: 'klaro',
    cookieExpiresAfterDays: 365,
    privacyPolicy: opts.privacyPolicyUrl,
    default: true,
    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false,
    htmlTexts: true,
    services: [
      {
        name: 'google-analytics',
        title: 'Google Analytics',
        purposes: ['analytics'],
        cookies: [/^_ga.*/i, /^_gid$/i, /^_gat.*/i],
        required: false,
        optOut: true,
        onlyOnce: true,
      },
    ],
    translations: {
      zz: { privacyPolicyUrl: opts.privacyPolicyUrl },
      en: {
        privacyPolicyUrl: opts.privacyPolicyUrl,
        consentNotice: {
          description: `${opts.brand} uses cookies to understand how visitors use this site. See the {privacyPolicy} for details.`,
          learnMore: 'Choose what to allow',
        },
        consentModal: {
          title: 'Privacy choices',
          description: `Pick which technologies ${opts.brand} can use.`,
        },
        ok: 'Accept all',
        decline: 'Decline',
        save: 'Save choices',
        purposes: {
          analytics: {
            title: 'Analytics',
            description: 'Helps understand visitor patterns and improve the site.',
          },
        },
        purposeItem: { service: 'service', services: 'services' },
      },
    },
  }
}

export function configToJs(value: unknown): string {
  if (value instanceof RegExp) return value.toString()
  if (Array.isArray(value)) return '[' + value.map(configToJs).join(',') + ']'
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(
      ([key, item]) => `${JSON.stringify(key)}:${configToJs(item)}`,
    )
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}
