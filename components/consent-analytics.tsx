import {
  buildKlaroConfig,
  configToJs,
  type KlaroConfigOpts,
} from '@/lib/consent/klaro-config'
import Script from 'next/script'

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
    "analytics_storage:'denied',",
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
    "function u(){var c=m.consents['google-analytics']||false;",
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
      <Script
        id="ga-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: consentDefault }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: analyticsInit }}
      />
      <Script
        id="klaro-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.klaroConfig=${configToJs(klaroConfig)};`,
        }}
      />
      <Script
        id="klaro-ga-bridge"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: klaroBridge }}
      />
      <Script src={klaroSrc} strategy="afterInteractive" />
    </>
  )
}
