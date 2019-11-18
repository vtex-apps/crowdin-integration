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
