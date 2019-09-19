
import { ColossusEventContext } from '../typings/Colossus'
import { MessagesCrowdinByGroupContext, MessagesIO, MessagesCrowdin } from '../typings/Messages'
import { objToHash } from '../utils'


export async function doNothing(ctx: ColossusEventContext, next: () => Promise<any>){
  await next ()
}

export async function unwrap(ctx: ColossusEventContext, next: () => Promise<any>){
  console.log('---Unwrap!!!!')
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
          message: targetMessage,
          ...context && { description: context},
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

