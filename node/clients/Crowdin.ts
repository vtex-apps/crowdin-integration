import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

import {
  CrowdinGetProjectResponse,
  CrowdinGetStringResponse,
  CrowdinGetTranslationResponse,
  CrowdinListProjects,
  StringToCrowdin,
  TranslationToCrowdin
} from '../typings/Crowdin'
import { crowdinSettings } from '../utils/crowdin'

export class Crowdin extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions){
    super('http://api.crowdin.com', context, {
      ...options,
      headers: {
        Authorization: `Bearer ${crowdinSettings.tokenApiV2}`,
        'content-type': 'application/json',
        'x-vtex-use-https': 'true',
      },
    })
  }

  public async addString(data: StringToCrowdin, projectId: string) {
    const dataToCrowdin = {
      context: data.groupContext,
      identifier: data.key,
      text: data.message,
    }

    let errMsg
    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/strings`,
      dataToCrowdin,
      {
        metric: 'crowdin-add-string',
      })
      .catch((err) => {errMsg = err.response}
    )

    return {
      err: errMsg,
      res,
    }
  }

  public async addTranslation(data: TranslationToCrowdin, projectId: string) {
    const dataToCrowdin = {
      languageId: data.to,
      stringId: data.stringId,
      text: data.translation,
    }
    let errMsg

    const res = await this.http.post<any>(`/api/v2/projects/${projectId}/translations`,
      dataToCrowdin,
      {
        metric: 'crowdin-add-translation',
      })
      .catch((err) => {errMsg = err.response}
    )

    return {
      err: errMsg,
      res,
    }
  }

  public async getString(stringId: string, projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetStringResponse>(`/api/v2/projects/${projectId}/strings/${stringId}`,
      {
        metric: 'crowdin-get-string',
      }
    )
    .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }

  public async getTranslation(translationId: string, projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetTranslationResponse>(`/api/v2/projects/${projectId}/translations/${translationId}`,
      {
        metric: 'crowdin-get-translation',
      }
    )
    .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }

  public async getProject(projectId: string) {
    let errMsg
    const res = await this.http.get<CrowdinGetProjectResponse>(`/api/v2/projects/${projectId}`,
      {
        metric: 'crowdin-get-project',
      }
    )
    .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }

  public async listProjects() {
    let errMsg
    const res = await this.http.get<CrowdinListProjects>(`/api/v2/projects`,
      {
        metric: 'crowdin-list-projects',
      }
    )
    .catch((err) => {errMsg = err.response})

    return {
      err: errMsg,
      res,
    }
  }
}
