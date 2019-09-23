
export interface Settings {
  projectName: string
  projectKey: string
}

export const DEFAULT_SETTINGS: Settings = {
  projectKey: 'af2e938c45b8c104ab3222c6e6e4ba98', // Change the default when setting via admin will be available. This is ony for testing.
  projectName: 'experimental',
}

export const settings = async (appSettings: any): Promise<Settings> => {
  const { projectName, projectKey}: {
    projectName: string,
    projectKey: string
  } = { ...DEFAULT_SETTINGS, ...appSettings}
  return {
    projectKey,
    projectName,
  }
}

