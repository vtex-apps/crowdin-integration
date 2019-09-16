

export interface Locales {
  srcLang: string
  translations: Locale
  context?: string
  groupContext?: string
}

export interface Locale {
  [lang: string]: string
}

export type GroupContext = 'Product' | 'Sku' | 'Brand' | 'Category' | 'Specifications-names' | 'Specifications-values'

export type TstringsByGroupContext = Array<[GroupContext,string[]]>
