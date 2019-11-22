import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import { prop } from 'ramda'

import { DEFAULT_SETTINGS } from '../directives/settings'
import {
  CrowdinGetProjectResponse,
  CrowdinGetStringResponse,
  CrowdinGetTranslationResponse,
  StringToCrowdin,
  TranslationToCrowdin
} from '../typings/Crowdin'

const errorProjectNotExists = (lang: string) =>
`There is not a project in the lang ${lang} in Crowdin. You need to create it before saving strings in that language.`

export class Crowdin extends ExternalClient {
  // For now using DEFAULT_SETTINGS, but should get this and tokenApiV2 from settings somehow.
  private projectId = DEFAULT_SETTINGS.projectId

  constructor(context: IOContext, options?: InstanceOptions){
    super('http://api.crowdin.com', context, {
      ...options,
      headers: {
        ['x-vtex-use-https']: 'true',
        Authorization: `Bearer ${DEFAULT_SETTINGS.tokenApiV2}`,
      },
    })
  }

  public async addStringBySrcLang(data: StringToCrowdin, lang: string) {
    const dataToCrowdin = {
      context: data.groupContext,
      identifier: data.key,
      text: data.message,
    }
    const projectId = prop(lang, this.projectId)
    let errMsg

    if(!projectId) {
      return {
        err: errorProjectNotExists(lang),
        res: null,
      }
    }

    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/strings`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }

  public async addStringByProjectId(data: StringToCrowdin, projectId: string) {
    const dataToCrowdin = {
      context: data.groupContext,
      identifier: data.key,
      text: data.message,
    }

    let errMsg
    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/strings`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }

  public async addTranslationBySrcLang(data: TranslationToCrowdin, lang: string) {
    const dataToCrowdin = {
      languageId: data.to,
      stringId: data.stringId,
      text: data.translation,
    }
    const projectId = prop(lang, this.projectId)
    let errMsg

    if(!projectId) {
      return {
        err: errorProjectNotExists(lang),
        res: null,
      }
    }
    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/translations`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async addTranslationByProjectId(data: TranslationToCrowdin, projectId: string) {
    const dataToCrowdin = {
      languageId: data.to,
      stringId: data.stringId,
      text: data.translation,
    }
    let errMsg

    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/translations`,
      dataToCrowdin,
      { headers: { json: true }})
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getStringBySrcLang(stringId: string, lang: string) {
    let errMsg
    const projectId = prop(lang, this.projectId)

    if(!projectId) {
      return {
        err: errorProjectNotExists(lang),
        res: null,
      }
    }
    const res = await this.http.get<CrowdinGetStringResponse>(`/api/v2/projects/${projectId}/strings/${stringId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getStringByProjectId(stringId: string, projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetStringResponse>(`/api/v2/projects/${projectId}/strings/${stringId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getTranslationBySrcLang(translationId: string, lang: string) {
    let errMsg
    const projectId = prop(lang, this.projectId)

    if(!projectId) {
      return {
        err: errorProjectNotExists(lang),
        res: null,
      }
    }
    const res = await this.http.get<CrowdinGetTranslationResponse>(`/api/v2/projects/${projectId}/translations/${translationId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getTranslationByProjectId(translationId: string, projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetTranslationResponse>(`/api/v2/projects/${projectId}/translations/${translationId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getProjectBySrcLang(lang: string) {
    let errMsg
    const projectId = prop(lang, this.projectId)

    if(!projectId) {
      return {
        err: errorProjectNotExists(lang),
        res: null,
      }
    }
    const res = await this.http.get<CrowdinGetProjectResponse>(`/api/v2/projects/${projectId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }

  public async getProjectByProjectId(projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetProjectResponse>(`/api/v2/projects/${projectId}`)
      .catch((err) => {errMsg = err.response})
    return {
      err: errMsg,
      res,
    }
  }
}
