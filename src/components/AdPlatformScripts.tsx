"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AdPlatformScriptsProps {
  googleAdsConversionId?: string | null;
  googleAdsConversionLabel?: string | null;
  metaPixelId?: string | null;
}

/**
 * Injects Google Ads and Meta (Facebook) Pixel tracking scripts
 * 
 * - Google Ads: gtag.js for conversion tracking (fires on page load)
 * - Meta Pixel: Facebook Pixel for conversion tracking (fires PageView + exposes fbq globally)
 * 
 * These are legitimate first-party tracking for YOUR OWN ad campaigns, not affiliate pixels.
 */
export function AdPlatformScripts({ 
  googleAdsConversionId, 
  googleAdsConversionLabel,
  metaPixelId 
}: AdPlatformScriptsProps) {
  
  // Fire Google Ads conversion event on page load
  useEffect(() => {
    if (googleAdsConversionId && googleAdsConversionLabel) {
      // Wait for gtag to load
      const checkGtag = setInterval(() => {
        if (typeof (window as any).gtag === 'function') {
          clearInterval(checkGtag);
          
          (window as any).gtag('event', 'conversion', {
            'send_to': `${googleAdsConversionId}/${googleAdsConversionLabel}`,
            'value': 1.0,
            'currency': 'USD'
          });
          
          console.log('[AdPlatformScripts] Google Ads conversion fired:', googleAdsConversionId);
        }
      }, 100);
      
      // Cleanup after 5 seconds if gtag never loads
      setTimeout(() => clearInterval(checkGtag), 5000);
    }
  }, [googleAdsConversionId, googleAdsConversionLabel]);

  return (
    <>
      {/* Google Ads Global Site Tag (gtag.js) */}
      {googleAdsConversionId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsConversionId}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsConversionId}');
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
            
            console.log('[AdPlatformScripts] Meta Pixel loaded:', '${metaPixelId}');
          `}
        </Script>
      )}

      {/* Meta Pixel noscript fallback */}
      {metaPixelId && (
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }} 
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}
