import { map as mapP } from 'bluebird'
import { map, toPairs } from 'ramda'

import { ColossusEventContext } from '../../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../../typings/Messages'
import { objToHash } from '../../utils'
import { CROWDIN_BUCKET } from '../../utils/constants'
import { languageLocaleToCrowdinProjectId } from '../../utils/crowdin'

const updateStringBasedCrowdinString = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}, vtex: {logger}}: ColossusEventContext, srcLang: string) => {
  const messagesInPairs = toPairs(args.messages)
  const groupContext = args.groupContext ? args.groupContext : ''
  map(async ([key, {message}]) => {
    const projectId = await languageLocaleToCrowdinProjectId(crowdin, srcLang)
    if (projectId.err) {
      logger.error(`Error getting projectId from Crowdin. Returned error: ${projectId.err}`)
    } else if (projectId.value) {
      const saveMessageInCrowdin = await crowdin.addString({message, key, groupContext}, projectId.value)
      if(saveMessageInCrowdin.err) {
        logger.error(`Error saving string in Crowdin. Returned error: ${saveMessageInCrowdin.err}`)
      } else {
        const stringCrowdinId = saveMessageInCrowdin.res.data.id
        if(stringCrowdinId) {
          const vbaseFileName = key
          await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, {crowdinId: stringCrowdinId})
        }
      }
    }
  }, messagesInPairs)
}

const updateStringBasedCrowdinTranslation = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}, vtex: {logger}}: ColossusEventContext, srcLang: string) => {
  const messagesInPairs = toPairs(args.messages)
  map(async ([_, {message, srcMessage, description}]) => {
    const context = description ? description : ''
    const vbaseFileName = objToHash<string>(srcMessage + (context || '') + args.from)
    const stringCrowdinId = await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true)
    const projectId = await languageLocaleToCrowdinProjectId(crowdin, srcLang)
    if (projectId.err) {
      logger.error(`Error getting projectId from Crowdin. Returned error: ${projectId.err}`)
    } else if (projectId.value) {
      const saveTranslationsInCrowdin = await crowdin.addTranslation({translation: message, to: args.to!, stringId: stringCrowdinId.crowdinId}, projectId.value)
      if(saveTranslationsInCrowdin.err) {
        logger.error(`Error saving translation in Crowdin. Returned error: ${saveTranslationsInCrowdin.err}`)
      }
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
