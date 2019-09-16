
import {ExternalClient, InstanceOptions, IOContext} from '@vtex/api'
import FormData from 'form-data'

export class Crowdin extends ExternalClient {
  private key = 'af2e938c45b8c104ab3222c6e6e4ba98' // get this from settings somehow
  private projectName = 'experimental' // get this from settings somehow. Make sort of hash of lang and projectName and key
  constructor(context: IOContext, options?: InstanceOptions ){
    super('http://api.crowdin.com',context, {...options, headers:{['x-vtex-use-https']: 'true'}})
  }
  public updateSourceFile( ){ // data: any, srcLang: string, groupContext: string
    // check if source file doesn't already exist, if not, create it
    // use sourceLang to decide which project to save to
    // const blerg = {
    //   ['files[client_test.json]']: {
    //     key1:{
    //       description: 'enfatic',
    //       value: 'hello',
    //     },
    //   },
    // }

   const formData = new FormData()
   const obj = { teste4: 'Hi!!!',}
   const buf = Buffer.from(JSON.stringify(obj))

   formData.append('files[nano1.json]',buf,{filename: 'nano1.json'})
   return this.http.post(`/api/project/${this.projectName}/update-file?key=${this.key}`,formData,{headers:formData.getHeaders()})
  }
}

// class form-data
