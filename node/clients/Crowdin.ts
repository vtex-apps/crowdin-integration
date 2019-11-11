import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import FormData from 'form-data'
import { DEFAULT_SETTINGS } from '../directives/settings'

export class Crowdin extends ExternalClient {
  // For now using DEFAULT_SETTINGS, but should get this from settings somehow.
  // (Make sort of hash of lang and projectName and key)
  private key = DEFAULT_SETTINGS.projectKey
  private projectName = DEFAULT_SETTINGS.projectName

  constructor(context: IOContext, options?: InstanceOptions ){
    super('http://api.crowdin.com', context, {...options, headers: {['x-vtex-use-https']: 'true'}})
  }

  // This method replaces the entire source file in crowdin if it exists, or creates a new one if it does not.
  public async updateSourceFile(data: any, filePath: string, srcLang: string) {
    console.log('In update source file!!')
    // Check if source path doesn't already exist, if not, create it
    // (!!!!!!) use sourceLang to decide which project to save to
    const formData = new FormData()
    const buf = Buffer.from(JSON.stringify(data))

    formData.append(`files[${filePath}]`, buf, {filename: ' ', json:true})
    formData.append('json', '')

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/update-file?key=${this.key}`,
      formData,
      { headers: {
        ...formData.getHeaders(),
        json: true,
      }}
    ).catch((err) => {errMsg = err.response})
    const response = res || errMsg
    console.log('response: ', response)
    console.log('errMsg: ', errMsg)

    return !errMsg
  }

  public async addDirectory(dirPath: string, srcLang: string){
    console.log('In add directory!!')
    // use srcLang to select Project in the future
    const formData = new FormData()
    formData.append('name', dirPath)
    formData.append('json', '')
    formData.append('recursive', 1)

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/add-directory?key=${this.key}`,
      formData,
      { headers: {
        ...formData.getHeaders(),
        json: true,
      }}
    ).catch((err) => {errMsg = err.response})
    const response = res || errMsg
    console.log('response: ', response)
    console.log('errMsg: ', errMsg)

    return !errMsg
  }

  public async addSourceFile(data: any, filePath: string, srcLang: string){
    console.log('In add source file!!')
    const formData = new FormData()
    const buf = Buffer.from(JSON.stringify(data))

    formData.append(`files[${filePath}]`, buf, {filename: ' '})
    formData.append('json', '')

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/add-file?key=${this.key}`,
      formData,
      { headers: {
        ...formData.getHeaders(),
        json: true,
      }}
    ).catch((err) => {errMsg = err.response})
    const response = res || errMsg
    console.log('response: ', response)
    console.log('errMsg: ', errMsg)

    return !errMsg
  }

  public async addTranslation (data: any, filePath: string, to: string) {
    console.log('In add translation!!')
    const formData = new FormData()
    const buf = Buffer.from(JSON.stringify(data))

    formData.append(`files[${filePath}]`, buf, {filename: 'translation.json'})
    formData.append('language', to)
    formData.append('json', '')

    let errMsg
    const res = await this.http.post<any>(`/api/project/${this.projectName}/upload-translation?key=${this.key}`,
      formData,
      { headers: {
        ...formData.getHeaders(),
        json: true,
      }}
    ).catch((err) => {errMsg = err.response})
    const response = res || errMsg
    console.log('response: ', response)
    console.log('errMsg: ', errMsg)

    return !errMsg
  }

}
