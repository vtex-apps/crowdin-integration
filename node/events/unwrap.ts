import { Crowdin } from './../clients/Crowdin';
import { pick, pluck } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'

export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrap(ctx: ColossusEventContext, next: () => Promise<any>){
  const {clients: {crowdin}} = ctx

  console.log('CHEGUEI NO UNWRAP')


  const response = await crowdin.updateSourceFile().catch(err=>{
    console.log(err.response)
  })

  console.log('---response',response)
  await next ()
}

