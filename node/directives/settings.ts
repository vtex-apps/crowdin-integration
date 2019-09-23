import { ColossusEventContext } from '../typings/Colossus'


export interface Settings {
  projectName: string
  projectKey: string
}

export async function settings (ctx: ColossusEventContext, next: () => Promise<any>) {

  // const { projectName, projectKey }: Settings =   appSettings

  // return

}

