import { CROWDIN_BUCKET } from './../utils/constants';
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from './../utils/crowdin';

import {ExternalClient, InstanceOptions, IOContext, VBase} from '@vtex/api'
import FormData from 'form-data'

export class Crowdin extends ExternalClient {
  private key = 'af2e938c45b8c104ab3222c6e6e4ba98' // get this from settings somehow
  private projectName = 'experimental' // get this from settings somehow. Make sort of hash of lang and projectName and key
  constructor(context: IOContext, options?: InstanceOptions ){
    super('http://api.crowdin.com',context, {...options, headers:{['x-vtex-use-https']: 'true'}})
  }

  // This method replaces the entire source file in crowdin if it exists, or creates a new one if it does not.
  public async updateSourceFile(data: any, srcLang: string, groupContext: string, vbase: VBase){

    const {dirPath, fileName} = toCrowdinFilePath(groupContext)

    // Merge old file with new one
    const vbaseFileName = toVbaseSourceCrowdinFileName(dirPath, fileName)
    const srcFile =  await vbase.getJSON<any>(CROWDIN_BUCKET, vbaseFileName, true) || {}
    const mergedSrcFile = {
      ...srcFile,
      ...data,
    }
    await vbase.saveJSON<any>(CROWDIN_BUCKET, vbaseFileName, mergedSrcFile)

    // Check if source path doesn't already exist, if not, create it
    // use sourceLang to decide which project to save to

   const formData = new FormData()
   const buf = Buffer.from(JSON.stringify(data))

   formData.append(`files[Products/${groupContext}.json]`,buf,{filename: ' ',json:true})
   formData.append('json','')

   console.log('---formData.getHeaders()',formData.getHeaders())

   let errMsg
   const res = await this.http.post<any>(`/api/project/${this.projectName}/update-file?key=${this.key}`,formData,{headers:{
    ...formData.getHeaders(),
   json:true}}).catch((err)=>{errMsg = err.response.data})
   const response = res || errMsg

   console.log('---response',response)

  //  if (!response){


  //  }

  //  if (response.success === ){
  //     return response
  //  }

   return res
  }
}

// class form-data
