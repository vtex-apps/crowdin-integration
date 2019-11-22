import { TooManyRequestsError } from '@vtex/api'

import { ColossusEventContext } from '../typings/Colossus'
import { ExportedMessageObject } from '../typings/Messages'
import { objToHash } from '../utils'
import { CROWDIN_BUCKET } from '../utils/constants'
import { languageLocaleToCrowdinId } from '../utils/crowdin'

interface ExportErrors {
  from: string
  to: string
  string: string
  status: string
}

export async function saveInCrowdin(ctx: ColossusEventContext, next: () => Promise<any>) {
  const { crowdin, vbase } = ctx.clients
  const { logger } = ctx.vtex
  const { finished, messages } = ctx.body as ExportedMessageObject
  const errors = [] as ExportErrors[]

  if(!finished) {
    await Promise.all(messages.map(async ({srcLang, context, groupContext, translations}) => {
      const crowdinGroupContext = groupContext ? groupContext : ''
      const crowdinContext = context ? context : ''
      let stringCrowdinId = 0

      await Promise.all(translations.map(async ({ lang, translation }) => {
        if(srcLang === lang) {
          const key = objToHash<string>(translation + crowdinContext + srcLang)
          const saveMessageInCrowdin = await crowdin.addStringBySrcLang({message: translation, key, groupContext: crowdinGroupContext}, srcLang)
          if(saveMessageInCrowdin.err) {
            const statusCode = (saveMessageInCrowdin.err as any).status
            errors.push({string: translation, from: lang, to: lang, status: statusCode})
            if (statusCode === 429) {
              throw new TooManyRequestsError()
            }
          }
          if(saveMessageInCrowdin.res) {
            stringCrowdinId = saveMessageInCrowdin.res.data.id
            const vbaseFileName = key
            await vbase.saveJSON(CROWDIN_BUCKET, vbaseFileName, {crowdinId: stringCrowdinId})
          }
        }
      }))

      await Promise.all(translations.map(async ({lang, translation}) => {
        if(srcLang !== lang) {
          const to = languageLocaleToCrowdinId(lang)
          if(stringCrowdinId) {
            const saveTranslationsInCrowdin = await crowdin.addTranslationBySrcLang({translation, to, stringId: stringCrowdinId}, srcLang)
            if(saveTranslationsInCrowdin.err) {
              const statusCode = (saveTranslationsInCrowdin.err as any).status
              errors.push({string: translation, from: srcLang, to, status: statusCode})
              if (statusCode === 429) {
                throw new TooManyRequestsError()
              }
            }
          } else {
            errors.push({string: translation, from: srcLang, to, status: 'Cannot get the Crowdin id of original string'})
          }
        }
      }))

    }))
  }

  logger.error(`Errors in messages export from Messages to Crowdin: ${errors}`)

  await next()
}
