export interface OptionInterface {
  grid: boolean,
  textGraphics: boolean
}

export const LOCAL_STORAGE_OPTIONS_KEY = "options";
export const DEFAULT_VALUE_GRID = false;
export const DEFAULT_VALUE_TEXT_GRAPHICS = false;
const DEFAULT_RECORD = {
  grid: DEFAULT_VALUE_GRID,
  textGraphics: DEFAULT_VALUE_TEXT_GRAPHICS,
};

export function getOptionsFromLocalStorage(): OptionInterface {
  const localStorageValue = globalThis.window === undefined ? null : localStorage.getItem(LOCAL_STORAGE_OPTIONS_KEY);
  if (localStorageValue == null) {
    saveOptionsToLocalStorage(DEFAULT_RECORD);
    return DEFAULT_RECORD;
  }
  try {
    const localStorageOptions = JSON.parse(localStorageValue);
    return {
      grid: localStorageOptions.grid ?? DEFAULT_VALUE_GRID,
      textGraphics: localStorageOptions.textGraphics ?? DEFAULT_VALUE_TEXT_GRAPHICS
    };
  } catch {
    return DEFAULT_RECORD;
  }
}

export function saveOptionsToLocalStorage(options: OptionInterface) {
  if (globalThis.window !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_OPTIONS_KEY, JSON.stringify(options));
  }
}