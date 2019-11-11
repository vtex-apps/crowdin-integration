export interface MessagesCrowdin {
  [key: string] : {
    message: string
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
  lang: string,
  groupContext: string,
  messages: MessagesCrowdin
}
