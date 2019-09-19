

export interface MessagesIO {
  srcMessage: string
  targetMessage: string
  groupContext?: string
  context?: string
}

export interface MessagesCrowdin {
  [key: string] : {
    message: string
    description?: string
  }
}

export interface MessagesCrowdinByGroupContext {
  [groupContext: string]: MessagesCrowdin
}
