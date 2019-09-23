import { objToHash } from '.'



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
  return `${objToHash<string>(dirPath+fileName)}.json`
}
