import { map } from 'bluebird'
import { toPairs } from 'ramda'
import { ColossusEventContext } from '../typings/Colossus'
import { UpdateMessageToCrowdinArg } from '../typings/Messages'
import { CROWDIN_BUCKET } from '../utils/constants'
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from '../utils/crowdin'


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
  await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, mergedSrcFile)

  // Try to update source file
  const updated = await crowdin.updateSourceFile(messages, dirPath+fileName, lang)

  console.log('---Updated? ',updated)

  if (!updated && !dirPath){
    await crowdin.addDirectory(dirPath, lang)
  }
  const added = updated || await crowdin.addSourceFile(messages, dirPath+fileName, lang)

  return added
}


export async function updateCrowdinProject(ctx: ColossusEventContext, next: () => Promise<any>){

   // Mock data
   const data = {
    hashloca1: {
      message: 'Nice day today!',
      description: 'front page greeting',
    },
    hashlocao2: {
      message: 'Don\'t go gentle into that good night',
      description: 'interstellar poem',
    },
    hashlocao3: {
      message: 'Nice day today!',
    },
}

  const {from, to, messagesCrowdinByGroupContext} = ctx.state
  const messagesCrowdinByGroupContextPairs = toPairs(messagesCrowdinByGroupContext)
  await map(
    messagesCrowdinByGroupContextPairs,
    ([groupContext, messages]) => {
      (from === to)? updateCrowdinSrcFile({messages, groupContext, lang: from}, ctx) :
      updateCrowdinTranslation({messages, groupContext, lang: to}, ctx)
    }
  )

  // check if from === to

  // const updatedSrc = await updateCrowdinSrcFile({data,groupContext,lang}, ctx)
  // console.log('Success of operation: ', updatedSrc)
}
