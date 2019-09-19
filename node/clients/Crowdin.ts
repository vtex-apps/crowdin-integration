import { CROWDIN_BUCKET, FILE_NOT_FOUND } from './../utils/constants'
import { toCrowdinFilePath, toVbaseSourceCrowdinFileName } from './../utils/crowdin'

import {ExternalClient, InstanceOptions, IOContext, VBase} from '@vtex/api'
import FormData from 'form-data'
import { path } from 'ramda'

export class Crowdin extends ExternalClient {
  private key = 'af2e938c45b8c104ab3222c6e6e4ba98' // get this from settings somehow
  private projectName = 'experimental' // get this from settings somehow. Make sort of hash of lang and projectName and key
  constructor(context: IOContext, options?: InstanceOptions ){
    super('http://api.crowdin.com',context, {...options, headers:{['x-vtex-use-https']: 'true'}})
  }

  // This method replaces the entire source file in crowdin if it exists, or creates a new one if it does not.
  public async updateSourceFile(data: any, filePath: string, srcLang: string){


    // Check if source path doesn't already exist, if not, create it
    // (!!!!!!) use sourceLang to decide which project to save to

   const formData = new FormData()
   const buf = Buffer.from(JSON.stringify(data))

   formData.append(`files[${filePath}]`,buf,{filename: ' ',json:true})
   formData.append('json','')


   let errMsg
   const res = await this.http.post<any>(`/api/project/${this.projectName}/update-file?key=${this.key}`,formData,{headers:{
    ...formData.getHeaders(),
   json:true}}).catch((err)=>{errMsg = err.response})
   const response = res || errMsg
   console.log(response)

   return !errMsg

  }

  public async addDirectory(dirPath: string, srcLang: string){
    // use srcLang to select Project in the future

    const formData = new FormData()
    formData.append('name', dirPath)
    formData.append('json','')
    formData.append('recursive', 1)

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/add-directory?key=${this.key}`,formData,{headers:{
    ...formData.getHeaders(),
    json:true}}).catch((err)=>{errMsg = err.response})
    const response = res || errMsg
    console.log(response)

    return !errMsg
  }

  public async addSourceFile(data: any, filePath: string, srcLang: string){

    const formData = new FormData()
    const buf = Buffer.from(JSON.stringify(data))

    formData.append(`files[${filePath}]`,buf,{filename: ' '})
    formData.append('json','')


    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/add-file?key=${this.key}`,formData,{headers:{
      ...formData.getHeaders(),
    json:true}}).catch((err)=>{errMsg = err.response})
    const response = res || errMsg
    console.log(response)

    return !errMsg
  }

  public async addTranslation (data: any, filePath: string, to: string){

    const formData = new FormData()
    const buf = Buffer.from(JSON.stringify(data))

    formData.append(`files[${filePath}]`,buf,{filename: 'translation.json'})
    formData.append('language', to)
    formData.append('json','')

    console.log('\n---translations to upload: ',data, '\n---lang:', to)

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/upload-translation?key=${this.key}`,formData,{headers:{
    ...formData.getHeaders(),
    verbose: true,
    json:true}}).catch((err)=>{errMsg = err.response})
    const response = res || errMsg
    console.log(response)

    return !errMsg

  }


}

// class form-data
