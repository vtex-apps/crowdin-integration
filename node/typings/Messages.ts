export interface MessagesCrowdin {
  [key: string] : {
    message: string,
    srcMessage?: string,
    description?: string
  }
}

export interface MessagesCrowdinBySrcLang {
  [from: string]: MessagesCrowdin
}

export interface MessagesCrowdinByGroupContextAndSrcLang {
  [groupContext: string]: MessagesCrowdinBySrcLang
}

export interface UpdateMessageToCrowdinArg {
  to?: string,
  from: string,
  groupContext: string,
  messages: MessagesCrowdin
}

export interface Translations {
  lang: string
  translation: string
}

export interface ExportedMessage {
  srcLang: string
  groupContext?: string
  context: string
  translations: Translations[]
}

export interface Range {
  from: number
  to: number
}

export interface ExportedMessageObject {
  finished: boolean,
  range: Range
  messages: ExportedMessage[]
}
