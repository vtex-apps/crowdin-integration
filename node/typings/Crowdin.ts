export interface StringToCrowdin {
  message: string,
  key: string,
  groupContext: string
}

export interface TranslationToCrowdin {
  translation: string,
  to: string,
  stringId: number
}

export interface CrowdinListProjects {
  data: CrowdinGetProjectResponse[]
}

export interface CrowdinGetProjectResponse {
  data: CrowdinGetProjectResponseData
}

interface CrowdinGetProjectResponseData {
  id: string,
  groupId: string,
  userId: string,
  sourceLanguageId: string,
  targetLanguageIds: string[],
  joinPolicy: string,
  languageAccessPolicy: string,
  name: string,
  cname: string,
  identifier: string,
  description: string,
  visibility: string,
  logo: string,
  background: string,
  isExternal: boolean,
  externalType: string,
  advancedWorkflowId: number,
  hasCrowdsourcing: boolean,
  createdAt: string,
  updatedAt: string
}

export interface CrowdinGetStringResponse {
  data: CrowdinGetStringResponseData
}

interface CrowdinGetStringResponseData {
  id: number,
  projectId: number,
  fileId: number,
  identifier: string,
  text: string,
  type: string,
  context: string,
  maxLength: number,
  isHidden: boolean,
  revision: number,
  isIc: boolean,
  createdAt: string,
  updatedAt: string
}

export interface CrowdinGetTranslationResponse {
  data: CrowdinGetTranslationResponseData
}

interface CrowdinGetTranslationResponseData {
  id: number,
  text: string,
  pluralCategoryName: string,
  user: CrowdinUser,
  rating: number
}

interface CrowdinUser {
  id: number,
  login: string
}

export interface CrowdinNewTranslationApprovedEvent {
  event: string,
  project: string,
  project_id: string,
  language: string,
  source_string_id: string,
  translation_id: string,
  user: string,
  user_id: string,
  file_id: string,
  file: string
}
