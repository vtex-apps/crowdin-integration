import parseBody = require('co-body')
import { isEmpty, toPairs } from 'ramda'

import {
  CrowdinGetProjectResponse,
  CrowdinGetStringResponse,
  CrowdinGetTranslationResponse,
  CrowdinNewTranslationApprovedEvent
} from '../typings/Crowdin'
import { CROWDIN_BUCKET } from '../utils/constants'
import { crowdinProjectsIds } from '../utils/crowdin'

export async function getInfosFromCrowdin(ctx: Context, next: () => Promise<void>) {
  const { crowdin, vbase } = ctx.clients
  const { logger } = ctx.vtex
  const body = await parseBody(ctx.req) as CrowdinNewTranslationApprovedEvent

  const vbaseFileName = body.source_string_id
  const stringCrowdinId = await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true)
  const stringId = stringCrowdinId.crowdinId
  const srcMessageInfoFromCrowdin = await crowdin.getString(stringId, body.project_id)
  if(srcMessageInfoFromCrowdin.err) {
    logger.error(srcMessageInfoFromCrowdin.err)
    return
  }
  if(!(srcMessageInfoFromCrowdin.res as CrowdinGetStringResponse).data) {
    logger.error('Unexpected data format returned from Crowdin')
    return
  }
  const srcMessage = (srcMessageInfoFromCrowdin.res as CrowdinGetStringResponse).data.text
  const groupContext = (srcMessageInfoFromCrowdin.res as CrowdinGetStringResponse).data.context

  const targetMessageCrowdinId = body.translation_id
  const targetMessageInfoFromCrowdin = await crowdin.getTranslation(targetMessageCrowdinId, body.project_id)
  if(targetMessageInfoFromCrowdin.err) {
    logger.error(targetMessageInfoFromCrowdin.err)
    return
  }
  if(!(targetMessageInfoFromCrowdin.res as CrowdinGetTranslationResponse).data) {
    logger.error('Unexpected data format returned from Crowdin')
    return
  }
  const targetMessage = (targetMessageInfoFromCrowdin.res as CrowdinGetTranslationResponse).data.text

  const crowdinProjectsIdsArray = toPairs(crowdinProjectsIds)
  const maybeProject = crowdinProjectsIdsArray.filter(([_, projectId]) => body.project_id === projectId)
  let srcLang
  if(isEmpty(maybeProject)) {
    const projectInfoFromCrowdin = await crowdin.getProject(body.project_id)
    if(projectInfoFromCrowdin.err) {
      logger.error(projectInfoFromCrowdin.err)
      return
    }
    srcLang = (projectInfoFromCrowdin.res as CrowdinGetProjectResponse).data.sourceLanguageId
  } else {
    srcLang = maybeProject[0][0]
  }

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
