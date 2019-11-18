
export interface Settings {
  projectId: string
  tokenApiV2: string
}

export const DEFAULT_SETTINGS: Settings = {
  // Change the default when setting via admin will be available. This is ony for testing.
  projectId: '',
  tokenApiV2: '',
}

export const settings = async (appSettings: any): Promise<Settings> => {
  const {projectId, tokenApiV2}: Settings = {...DEFAULT_SETTINGS, ...appSettings}
  return {
    projectId,
    tokenApiV2,
  }
}

