import { objToHash } from '.'
import { Crowdin } from '../clients/Crowdin'
import { CrowdinListProjects } from '../typings/Crowdin'

export const toCrowdinFilePath = (groupContext: string) => {
  let dirPath = ''
  if (groupContext.toLowerCase().startsWith('product')){
    dirPath = 'Catalog/Products/'
  }
  if (groupContext.toLowerCase().startsWith('sku')){
    dirPath = 'Catalog/SKUs/'
  }
  if (groupContext.toLowerCase().startsWith('brand')){
    dirPath = 'Catalog/Brands/'
  }
  if (groupContext.toLowerCase().startsWith('category')){
    dirPath = 'Catalog/Categories/'
  }
  if (groupContext.toLowerCase().startsWith('specification')){
    dirPath = 'Catalog/'
  }

  return {
    dirPath,
    fileName: `${groupContext}.json`,
  }
}

export const toVbaseSourceCrowdinFileName = (dirPath: string, fileName: string) => {
  const filePath = `${dirPath}${fileName}`
  return `${objToHash<string>(filePath)}.json`
}

export function languageLocaleToCrowdinLanguageId(lang: string): string {
  switch (lang) {
    case 'en-DV':
      return 'en'
    case 'ja-JP':
      return 'ja'
    default:
      return lang
  }
}

export async function languageLocaleToCrowdinProjectId(crowdin: Crowdin, languageLocale: string) {
  const crowdinLangId = languageLocaleToCrowdinLanguageId(languageLocale)

  if(crowdinProjectsIds[crowdinLangId]) {
    return {value: crowdinProjectsIds[crowdinLangId], err: null}
  } else {
    const projectsInfoObj = await crowdin.listProjects()
    if(projectsInfoObj.err) {
      return {value: null, err: 'Error getting projects list for account'}
    }
    const projectsInfo = (projectsInfoObj.res as CrowdinListProjects).data
    const projectBySrcLang = projectsInfo.filter((projectInfo) => projectInfo.data.sourceLanguageId === crowdinLangId)
    if(projectBySrcLang.length === 0) {
      return {value: null, err: `There is not a project with source language ${crowdinLangId} in Crowdin. You need to create it before saving strings in that language.`}
    }
    projectsInfo.map((project) => crowdinProjectsIds[project.data.sourceLanguageId] = project.data.id)

    return {value: projectBySrcLang[0].data.id, err: null}
  }
}

export const crowdinSettings = { tokenApiV2: '' }
export const crowdinProjectsIds = {} as Record<string, string>
