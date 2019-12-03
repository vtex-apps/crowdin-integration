import { TooManyRequestsError } from '@vtex/api'

import { ColossusEventContext } from '../typings/Colossus'
import { ExportedMessageObject } from '../typings/Messages'
import { objToHash } from '../utils'
import { CROWDIN_BUCKET, STRING_ALREADY_EXPORTED_MESSAGE } from '../utils/constants'
import { languageLocaleToCrowdinLanguageId, languageLocaleToCrowdinProjectId } from '../utils/crowdin'

interface ExportErrors {
  type: 'string' | 'translation'
  from: string
  to: string
  string: string
  status: string
  projectId?: string
  originalStringId?: number
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
      const projectId = await languageLocaleToCrowdinProjectId(crowdin, srcLang)
      let stringCrowdinId = 0
      let shouldLogError = true

      await Promise.all(translations.map(async ({ lang, translation }) => {
        shouldLogError = true
        if(srcLang === lang) {
          if(projectId.err) {
            errors.push({type: 'string', string: translation, from: lang, to: lang, status: `Error getting projectId. Returned error: ${projectId.err}`})
          } else if (projectId.value) {
            const key = objToHash<string>(translation + crowdinContext + srcLang)
            const saveMessageInCrowdin = await crowdin.addString({message: translation, key, groupContext: crowdinGroupContext}, projectId.value)
            if(saveMessageInCrowdin.err) {
              const statusCode = (saveMessageInCrowdin.err as any).status
              const errorMessage = (saveMessageInCrowdin.err as any).data.errors[0].error.errors[0].message
              if(errorMessage === STRING_ALREADY_EXPORTED_MESSAGE) {
                shouldLogError = false
              } else {
                errors.push({type: 'string', string: translation, from: lang, to: lang, status: errorMessage, projectId: projectId.value})
              }
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
        }
      }))

      await Promise.all(translations.map(async ({lang, translation}) => {
        if(srcLang !== lang) {
          const to = languageLocaleToCrowdinLanguageId(lang)
          if(projectId.err) {
            errors.push({type: 'translation', string: translation, from: srcLang, to, status: `Error getting projectId. Returned error: ${projectId.err}`})
          } else if (projectId.value) {
            if(stringCrowdinId) {
              const saveTranslationsInCrowdin = await crowdin.addTranslation({translation, to, stringId: stringCrowdinId}, projectId.value)
              if(saveTranslationsInCrowdin.err) {
                const statusCode = (saveTranslationsInCrowdin.err as any).status
                const errorMessage = (saveTranslationsInCrowdin.err as any).data.errors[0].error.errors[0].message
                errors.push({type: 'translation', string: translation, from: srcLang, to, status: errorMessage, originalStringId: stringCrowdinId, projectId: projectId.value})
                if (statusCode === 429) {
                  throw new TooManyRequestsError()
                }
              }
            } else if(shouldLogError){
              errors.push({type: 'translation', string: translation, from: srcLang, to, status: 'Cannot get the Crowdin id of original string', projectId: projectId.value})
            }
          }
        }
      }))

    }))
  }

  logger.error(errors)

  await next()
}
