import { map } from 'bluebird'
import { toPairs } from 'ramda'
import { ColossusEventContext } from '../../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../../typings/Messages'
import { CROWDIN_BUCKET } from '../../utils/constants'
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from '../../utils/crowdin'


const updateCrowdinTranslation = async ( args: UpdateMessageToCrowdinArg, {clients: {crowdin}} : ColossusEventContext) => {
  const {messages, groupContext, lang} = args
  const {dirPath, fileName} = toCrowdinFilePath(groupContext)
  return await crowdin.addTranslation(messages, dirPath+fileName, lang)
}


const  updateCrowdinSrcFile = async ( args: UpdateMessageToCrowdinArg, {clients: {crowdin, vbase}} : ColossusEventContext) => {

  const {messages, groupContext, lang} = args

  // Merge old file with new one

  const {dirPath, fileName} = toCrowdinFilePath(groupContext)
  const vbaseFileName = toVbaseSourceCrowdinFileName(dirPath, fileName)
  const srcFile =  await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true) || {}
  const mergedSrcFile = {
    ...srcFile,
    ...messages,
  }
  console.log('\n ---dirPath: ', dirPath, '\n ---fileName', fileName, '\n ---vbaseFileName: ',vbaseFileName,'\n---srcFile: ',srcFile,'\n---mergedSrcFile:',mergedSrcFile)
  await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, mergedSrcFile)

  // Try to update source file
  const updated = await crowdin.updateSourceFile(mergedSrcFile, dirPath+fileName, lang)

  console.log('---Updated? ',updated)

  if (!updated && dirPath){
    await crowdin.addDirectory(dirPath, lang)
  }
  const added = updated || await crowdin.addSourceFile(messages, dirPath+fileName, lang)

  return added
}


export async function updateCrowdinProject(ctx: ColossusEventContext, next: () => Promise<any>){


  const {from, to, messagesCrowdinByGroupContext} = ctx.state
  const messagesCrowdinByGroupContextPairs = toPairs(messagesCrowdinByGroupContext)
  await map(
    messagesCrowdinByGroupContextPairs,
    ([groupContext, messages]) => {
      (from === to)? updateCrowdinSrcFile({messages, groupContext, lang: from}, ctx) :
      updateCrowdinTranslation({messages, groupContext, lang: to}, ctx)
    }
  )

  await next()

}
