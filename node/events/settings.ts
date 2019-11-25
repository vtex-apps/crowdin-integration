import { ColossusEventContext } from '../typings/Colossus'
import { crowdinSettings } from './../utils/crowdin'

export async function getSettings(ctx: Context | ColossusEventContext, next: () => Promise<any>) {
  const {clients: { apps }} = ctx

  const appSettings = await apps.getAppSettings(`${process.env.VTEX_APP_ID}`)
  crowdinSettings.tokenApiV2 = appSettings.CrowdinAPIToken

  await next()
}
