import { ColossusEventContext } from '../typings/Colossus'
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from '../utils/crowdin';
import { CROWDIN_BUCKET } from '../utils/constants';
import { fromPairs } from '@vtex/api/node_modules/@types/ramda';



const  updateCrowdinSrcFile = async ( args: any, {clients: {crowdin, vbase}} : ColossusEventContext) => {

  const {data, groupContext, lang} = args

  // Merge old file with new one

  const {dirPath, fileName} = toCrowdinFilePath(groupContext)
  const vbaseFileName = toVbaseSourceCrowdinFileName(dirPath, fileName)
  const srcFile =  await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true) || {}
  const mergedSrcFile = {
    ...srcFile,
    ...data,
  }
  await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, mergedSrcFile)

  // Try to update source file
  const updated = await crowdin.updateSourceFile(data, dirPath+fileName, lang)

  console.log('---response',updated)

  const added = updated || await crowdin.addDirectory(dirPath, lang).then(()=>crowdin.addSourceFile(data, dirPath+fileName, lang))

  // let added
  // if (!updated){
  //   console.log('ask to add directories if needed')
  //   await crowdin.addDirectory(dirPath, lang)
  //   added = await crowdin.addSourceFile(data, dirPath+fileName, lang)
  //   console.log('---res do add file:', added)
  // }

  return updated || added
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



  // const {from, to, messagesCrowdinByGroupContext} = ctx.state


  const groupContext = 'SKU-Id.37'
  const lang = 'en-US'

  // check if from === to

  const updatedSrc = await updateCrowdinSrcFile({data,groupContext,lang}, ctx)
  console.log('Success of operation: ', updatedSrc)
}
