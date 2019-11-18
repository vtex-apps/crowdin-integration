export async function saveIOMessage(ctx: Context, next:() => Promise<any>) {
  const {
    clients: {messagesGraphQL},
    state: {
      groupContext,
      srcLang,
      srcMessage,
      targetLang,
      targetMessage,
    },
  } = ctx

  const messages = [{
    groupContext,
    srcLang,
    srcMessage,
    targetMessage,
  }]

  await messagesGraphQL.saveV2({
    fireEvent: false,
    messages,
    to: targetLang,
  })

  ctx.status = 200
  await next()
}
