import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

import { DEFAULT_SETTINGS } from '../directives/settings'
import {
  CrowdinGetProjectResponse,
  CrowdinGetStringResponse,
  CrowdinGetTranslationResponse,
  CrowdinListStringsResponse,
  StringToCrowdin,
  TranslationToCrowdin
} from '../typings/Crowdin'

export class Crowdin extends ExternalClient {
  // For now using DEFAULT_SETTINGS, but should get this and tokenApiV2 from settings somehow.
  private projectId = DEFAULT_SETTINGS.projectId

  constructor(context: IOContext, options?: InstanceOptions){
    super('http://api.crowdin.com', context, {
      ...options,
      headers: {
        ['x-vtex-use-https']: 'true',
        Authorization: `Bearer ${DEFAULT_SETTINGS.tokenApiV2}`,
      }
    })
  }

  public async addString(data: StringToCrowdin) {
    const dataToCrowdin = {
      context: data.groupContext,
      identifier: data.key,
      text: data.message,
    }

    let errMsg
    const res = await this.http.post<any>(`/api/v2/projects/${this.projectId}/strings`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async addTranslationString(data: TranslationToCrowdin) {
    const dataToCrowdin = {
      languageId: data.to,
      stringId: data.stringId,
      text: data.translation,
    }

    let errMsg
    const res = await this.http.post<any>(`/api/v2/projects/${this.projectId}/translations`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getString(stringId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetStringResponse>(`/api/v2/projects/${this.projectId}/strings/${stringId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async listStrings() {
    let errMsg
    const res = await this.http.get<CrowdinListStringsResponse>(`/api/v2/projects/${this.projectId}/strings`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getTranslation(translationId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetTranslationResponse>(`/api/v2/projects/${this.projectId}/translations/${translationId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getProject() {
    let errMsg
    const res = await this.http.get<CrowdinGetProjectResponse>(`/api/v2/projects/${this.projectId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }
}
