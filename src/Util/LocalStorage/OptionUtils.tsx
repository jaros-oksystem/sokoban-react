export interface OptionInterface {
  grid: boolean,
  textGraphics: boolean
}

export const LOCAL_STORAGE_OPTIONS_NAME = "options";
export const DEFAULT_VALUE_GRID = false;
export const DEFAULT_VALUE_TEXT_GRAPHICS = false;

export function getOptionsFromLocalStorage(): OptionInterface {
  const localStorageValue = globalThis.window === undefined ? null : localStorage.getItem(LOCAL_STORAGE_OPTIONS_NAME);
  if (localStorageValue == null) {
    return {
      grid: DEFAULT_VALUE_GRID,
      textGraphics: DEFAULT_VALUE_TEXT_GRAPHICS,
    };
  }
  const localStorageOptions = JSON.parse(localStorageValue);
  return {
    grid: localStorageOptions.grid ?? DEFAULT_VALUE_GRID,
    textGraphics: localStorageOptions.textGraphics ?? DEFAULT_VALUE_TEXT_GRAPHICS
  };
}

export function saveOptionsToLocalStorage(options: OptionInterface) {
  localStorage.setItem(LOCAL_STORAGE_OPTIONS_NAME, JSON.stringify(options));
}