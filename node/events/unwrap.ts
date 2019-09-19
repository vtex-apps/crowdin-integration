import { Crowdin } from './../clients/Crowdin';
import { pick, pluck } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'

export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrap(ctx: ColossusEventContext, next: () => Promise<any>){
  const {clients: {crowdin, vbase}} = ctx

  console.log('---body',ctx.body)

  console.log('CHEGUEI NO UNWRAP')

  const blerg = {blerg: 'hellooooo', blurg: 'buy'}
  const response = await crowdin.updateSourceFile(blerg,'en-US','kasdjbalskdfAAAH', vbase).catch(err=>{
    console.log(err.response)
  })

  await next ()
}

