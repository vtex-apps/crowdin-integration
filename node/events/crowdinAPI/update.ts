import { map as mapP } from 'bluebird'
import { map, toPairs } from 'ramda'

import { ColossusEventContext } from '../../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../../typings/Messages'
import { CROWDIN_BUCKET } from '../../utils/constants'
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from '../../utils/crowdin'

const updateCrowdinTranslation = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin}}: ColossusEventContext) => {
  const {messages, groupContext, lang} = args
  const {dirPath, fileName} = toCrowdinFilePath(groupContext)
  return await crowdin.addTranslation(messages, `${dirPath}${fileName}`, lang)
}

const  updateCrowdinSrcFile = async (args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}}: ColossusEventContext) => {
  const {messages, groupContext, lang} = args

  // Merge old file with new messages and save updated file in vbase
  const {dirPath, fileName} = toCrowdinFilePath(groupContext)
  const vbaseFileName = toVbaseSourceCrowdinFileName(dirPath, fileName)
  const srcFile =  await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true) || {}
  const mergedSrcFile = {
    ...srcFile,
    ...messages,
  }
  console.log('dirPath: ', dirPath, '\nfileName', fileName, '\nvbaseFileName: ', vbaseFileName, '\nsrcFile: ', srcFile, '\nmergedSrcFile:', mergedSrcFile)
  await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, mergedSrcFile)

  // Try to update source file in crowdin
  const updated = await crowdin.updateSourceFile(mergedSrcFile, `${dirPath}${fileName}`, lang)
  if (!updated && dirPath){
    await crowdin.addDirectory(dirPath, lang)
  }
  const added = updated || await crowdin.addSourceFile(messages, `${dirPath}${fileName}`, lang)
  console.log('Updated? ', updated)
  console.log('Added? ', added)

  return added
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
            updateCrowdinSrcFile({messages, groupContext, lang: srcLang}, ctx) :
            updateCrowdinTranslation({messages, groupContext, lang: to}, ctx)
        },
        messagesBySrcLangPairs
      )
    }
  )
  await next()
}
