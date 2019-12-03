import { TooManyRequestsError } from '@vtex/api'
import { map as mapP } from 'bluebird'
import { map, toPairs } from 'ramda'

import { ColossusEventContext } from '../../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../../typings/Messages'
import { objToHash } from '../../utils'
import { CROWDIN_BUCKET, STRING_ALREADY_EXPORTED_MESSAGE } from '../../utils/constants'
import { languageLocaleToCrowdinProjectId } from '../../utils/crowdin'

const updateStringBasedCrowdinString = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}, vtex: {logger}}: ColossusEventContext, srcLang: string) => {
  const messagesInPairs = toPairs(args.messages)
  const groupContext = args.groupContext ? args.groupContext : ''
  map(async ([key, {message}]) => {
    const projectId = await languageLocaleToCrowdinProjectId(crowdin, srcLang)
    if (projectId.err) {
      logger.error(projectId.err)
    } else if (projectId.value) {
      const saveMessageInCrowdin = await crowdin.addString({message, key, groupContext}, projectId.value)
      if(saveMessageInCrowdin.err) {
        const statusCode = (saveMessageInCrowdin.err as any).status
        const errorMessage = (saveMessageInCrowdin.err as any).data.errors ? (saveMessageInCrowdin.err as any).data.errors[0].error.errors[0].message : ''
        if(errorMessage !== STRING_ALREADY_EXPORTED_MESSAGE) {
          logger.error(saveMessageInCrowdin.err)
        }
        if (statusCode === 429) {
          throw new TooManyRequestsError()
        }
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
      logger.error(projectId.err)
    } else if (projectId.value) {
      const saveTranslationsInCrowdin = await crowdin.addTranslation({translation: message, to: args.to!, stringId: stringCrowdinId.crowdinId}, projectId.value)
      if(saveTranslationsInCrowdin.err) {
        const statusCode = (saveTranslationsInCrowdin.err as any).status
        logger.error(saveTranslationsInCrowdin.err)
        if (statusCode === 429) {
          throw new TooManyRequestsError()
        }
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
