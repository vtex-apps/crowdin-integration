import { SaveArgsV2 as MessagesObject } from '@vtex/api'
import { reduce } from 'ramda'

import { ColossusEventContext } from '../../typings/Colossus'
import { MessagesCrowdinByGroupContextAndSrcLang } from '../../typings/Messages'
import { objToHash } from '../../utils'
import { languageLocaleToCrowdinLanguageId } from '../../utils/crowdin'

export async function unwrap(ctx: ColossusEventContext, next: () => Promise<any>){
  const messagesObject = ctx.body as MessagesObject
  const to = languageLocaleToCrowdinLanguageId(messagesObject.to)
  const messages = messagesObject.messages.map((message) => {
    message.srcLang = languageLocaleToCrowdinLanguageId(message.srcLang)
    return message
  })
  if(!messages || ! to) {
    return
  }

  const messagesCrowdinByGroupContextAndSrcLang = reduce(
    (acc, {srcLang, srcMessage, targetMessage, groupContext = 'Sorted', context}) => {
      const messageHash = objToHash<string>(srcMessage + (context || '') + srcLang)
      if(!acc[groupContext]) {
        acc[groupContext] = {}
      }
      acc[groupContext][srcLang] = {
        ...acc[groupContext][srcLang],
        [messageHash] : {
          message: targetMessage,
          srcMessage,
          ...context && {description: context},
        },
      }
      return acc
    },
    {} as MessagesCrowdinByGroupContextAndSrcLang,
    messages
  )

  ctx.state.messagesCrowdinByGroupContextAndSrcLang = messagesCrowdinByGroupContextAndSrcLang
  ctx.state.to = to

  await next()
}

