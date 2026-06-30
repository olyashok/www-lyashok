import {
  buildKlaroConfig,
  configToJs,
  type KlaroConfigOpts,
} from '@/lib/consent/klaro-config'

export interface ConsentAnalyticsProps extends KlaroConfigOpts {
  measurementId: string
  klaroSrc?: string
}

const DEFAULT_KLARO_SRC = 'https://cdn.kiprotect.com/klaro/v0.7/klaro.js'

export function ConsentAnalytics({
  measurementId,
  klaroSrc = DEFAULT_KLARO_SRC,
  ...config
}: ConsentAnalyticsProps) {
  const klaroConfig = buildKlaroConfig(config)

  const consentDefault = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('consent','default',{",
    "ad_storage:'denied',",
    "ad_user_data:'denied',",
    "ad_personalization:'denied',",
    "analytics_storage:'granted',",
    'wait_for_update:500',
    '});',
  ].join('')

  const analyticsInit = [
    "window.dataLayer=window.dataLayer||[];",
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js',new Date());",
    `gtag('config','${measurementId}',{send_page_view:true});`,
  ].join('')

  const klaroBridge = [
    '(function(){function attach(){',
    "if(!window.klaro||typeof window.klaro.getManager!=='function'){return setTimeout(attach,100);}",
    'var m=window.klaro.getManager();',
    "function u(){var c=m.consents['google-analytics']!==false;",
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('consent','update',{",
    "ad_storage:'denied',",
    "ad_user_data:'denied',",
    "ad_personalization:'denied',",
    "analytics_storage:c?'granted':'denied'",
    '});}',
    'm.watch({update:u});u();}attach();})();',
  ].join('')

  return (
    <>
      <script
        id="ga-consent-default"
        dangerouslySetInnerHTML={{ __html: consentDefault }}
      />
      <script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        async
      />
      <script
        id="ga-init"
        dangerouslySetInnerHTML={{ __html: analyticsInit }}
      />
      <script
        id="klaro-config"
        dangerouslySetInnerHTML={{
          __html: `window.klaroConfig=${configToJs(klaroConfig)};`,
        }}
      />
      <script
        id="klaro-ga-bridge"
        dangerouslySetInnerHTML={{ __html: klaroBridge }}
      />
      <script src={klaroSrc} defer />
    </>
  )
}
