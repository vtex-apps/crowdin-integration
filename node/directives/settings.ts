
export interface Settings {
  projectName: string
  projectKey: string
}

export const DEFAULT_SETTINGS: Settings = {
  projectKey: '1bd13aade43525ad0b16e845ae21c629', // Change the default when setting via admin will be available. This is ony for testing.
  projectName: 'messagesio',
}

export const settings = async (appSettings: any): Promise<Settings> => {
  const {projectName, projectKey}: Settings = {...DEFAULT_SETTINGS, ...appSettings}
  return {
    projectKey,
    projectName,
  }
}

