
import { ColossusEventContext } from '../typings/Colossus'
import { MessagesCrowdinByGroupContext, MessagesIO } from '../typings/Messages'
import { objToHash } from '../utils'


export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrap(ctx: ColossusEventContext, next: () => Promise<any>){
  const {from, to, messages: inputMessages} = ctx.body

  if (!inputMessages || !from || !to){
    return
  }

  const messagesByGroupContext = (inputMessages as MessagesIO[]).reduce(
    (acc, {srcMessage, targetMessage, groupContext = 'Sorted', context}) => {
      const messageHash = objToHash<string>(srcMessage + (context || '') + from)
      acc[groupContext] = {
        ...(acc[groupContext] || {}),
        [messageHash] : {
          ...context && { description: context},
          message: targetMessage,
        },
      }
      return acc
    },
    {} as MessagesCrowdinByGroupContext
  )

  ctx.state.messagesCrowdinByGroupContext = messagesByGroupContext
  ctx.state.from = from
  ctx.state.to = to

  console.log('\n---inputMessages',inputMessages, '\n---messagesByGroupContext: ', messagesByGroupContext)

  await next()

}

