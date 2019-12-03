import { ColossusEventContext } from '../typings/Colossus'
import { APP_ID } from '../utils/constants'
import { crowdinSettings } from './../utils/crowdin'

export async function getSettings(ctx: Context | ColossusEventContext, next: () => Promise<any>) {
  const {clients: { apps }} = ctx

  if(!crowdinSettings.tokenApiV2) {
    const appSettings = await apps.getAppSettings(`${APP_ID}`)
    crowdinSettings.tokenApiV2 = appSettings.CrowdinAPIToken
  }

  await next()
}
