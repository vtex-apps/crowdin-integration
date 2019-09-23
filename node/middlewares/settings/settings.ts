import { settings } from './../../directives/settings'
import { ColossusEventContext } from './../../typings/Colossus'


export async function getSettings (ctx: ColossusEventContext, next: () => Promise<any>) {

  const {clients: { apps }} = ctx

  const maybeAppSettings = await apps.getAppSettings(''+process.env.VTEX_APP_ID)
  const appSettings = await settings(maybeAppSettings)
  ctx.state.settings = appSettings

  console.log('\n---appSettings:',appSettings)

  await next()

}
