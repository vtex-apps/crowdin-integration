import { map as mapP } from 'bluebird'
import { map, toPairs } from 'ramda'

import { ColossusEventContext } from '../../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../../typings/Messages'
import { objToHash } from '../../utils'
import { CROWDIN_BUCKET } from '../../utils/constants'

const updateStringBasedCrowdinString = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}}: ColossusEventContext, srcLang: string) => {
  const messagesInPairs = toPairs(args.messages)
  const groupContext = args.groupContext ? args.groupContext : ''
  map(async ([key, {message}]) => {
    const saveMessageInCrowdin = await crowdin.addStringBySrcLang({message, key, groupContext}, srcLang)
    if(saveMessageInCrowdin.err) {
      console.log(saveMessageInCrowdin.err)
    } else {
      const stringCrowdinId = saveMessageInCrowdin.res.data.id
      if(stringCrowdinId) {
        const vbaseFileName = key
        await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, {crowdinId: stringCrowdinId})
      }
    }
  }, messagesInPairs)
}

const updateStringBasedCrowdinTranslation = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}}: ColossusEventContext, srcLang: string) => {
  const messagesInPairs = toPairs(args.messages)
  map(async ([_, {message, srcMessage, description}]) => {
    const context = description ? description : ''
    const vbaseFileName = objToHash<string>(srcMessage + (context || '') + args.from)
    const stringCrowdinId = await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true)
    const saveTranslationsInCrowdin = await crowdin.addTranslationBySrcLang({translation: message, to: args.to!, stringId: stringCrowdinId.crowdinId}, srcLang)
    if(saveTranslationsInCrowdin.err) {
      console.log(saveTranslationsInCrowdin.err)
    }
  }, messagesInPairs)
}

export async function updateCrowdinProject(ctx: ColossusEventContext, next: () => Promise<any>){
  const {to, messagesCrowdinByGroupContextAndSrcLang} = ctx.state
  const messagesCrowdinByGroupContextPairs = toPairs(messagesCrowdinByGroupContextAndSrcLang)

  await mapP(
    messagesCrowdinByGroupContextPairs,
    ([groupContext, messagesBySrcLang]) => {
      const messagesBySrcLangPairs = toPairs(messagesBySrcLang)
      map(
        ([srcLang, messages]) => {
          (srcLang === to) ?
            updateStringBasedCrowdinString({messages, groupContext, from: srcLang}, ctx, srcLang) :
            updateStringBasedCrowdinTranslation({messages, groupContext, to, from: srcLang}, ctx, srcLang)
        },
        messagesBySrcLangPairs
      )
    }
  )

  await next()
}
