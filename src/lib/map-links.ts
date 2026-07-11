export const resolveMapLinkTemplate = (template: string, appUrl: string) =>
  template.replaceAll('{APP_URL}', encodeURIComponent(appUrl))

export const isAndroidDevice = (userAgent: string) => /Android/i.test(userAgent)

export const getPreferredMapLaunchHref = ({
  appHref,
  androidIntentHref,
  userAgent,
}: {
  appHref: string
  androidIntentHref?: string
  userAgent: string
}) => {
  if (androidIntentHref && isAndroidDevice(userAgent)) {
    return androidIntentHref
  }

  return appHref
}
