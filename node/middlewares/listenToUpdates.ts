import parseBody = require('co-body')

import {
  CrowdinGetProjectResponse,
  CrowdinGetStringResponse,
  CrowdinGetTranslationResponse,
  CrowdinNewTranslationApprovedEvent
} from '../typings/Crowdin'
import { CROWDIN_BUCKET } from '../utils/constants'

export async function logUpdateInTranslations(ctx: Context, next: () => Promise<void>) {
  const { crowdin, vbase } = ctx.clients
  const { logger } = ctx.vtex
  const body = await parseBody(ctx.req) as CrowdinNewTranslationApprovedEvent

  const vbaseFileName = body.source_string_id
  const stringCrowdinId = await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true)
  const stringId = stringCrowdinId.crowdinId
  const srcMessageInfoFromCrowdin = await crowdin.getString(stringId)
  if(srcMessageInfoFromCrowdin.err) {
    logger.error('Error getting updated message from Crowdin')
    return
  }
  const srcMessage = (srcMessageInfoFromCrowdin.res as CrowdinGetStringResponse).data.text
  const groupContext = (srcMessageInfoFromCrowdin.res as CrowdinGetStringResponse).data.context

  const targetMessageCrowdinId = body.translation_id
  const targetMessageInfoFromCrowdin = await crowdin.getTranslation(targetMessageCrowdinId)
  if(targetMessageInfoFromCrowdin.err) {
    logger.error('Error getting updated message from Crowdin')
    return
  }
  const targetMessage = (targetMessageInfoFromCrowdin.res as CrowdinGetTranslationResponse).data.text

  const projectInfoFromCrowdin = await crowdin.getProject()
  if(projectInfoFromCrowdin.err) {
    logger.error('Error getting project info from Crowdin')
    return
  }
  const srcLang = (projectInfoFromCrowdin.res as CrowdinGetProjectResponse).data.sourceLanguageId

  const targetLang = body.language

  ctx.state = {
    groupContext,
    srcLang,
    srcMessage,
    targetLang,
    targetMessage,
  }
  await next()
}
