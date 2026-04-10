import {
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle,
} from 'electron'
import Store from 'electron-store'

interface WindowState extends Rectangle {
  isMaximized?: boolean;
  isFullscreen?: boolean;
}

export const createWindow = (
  windowName: string,
  options: BrowserWindowConstructorOptions
): BrowserWindow => {
  // const key = 'window-state';
  const name = `window-state-${windowName}`
const store = new Store<WindowState>({ name })
  
  const defaultSize: WindowState = {
    width: options.width as number,
    height: options.height as number,
    x: 0,
    y: 0
  }

  let state = store.get('state', defaultSize)

  const restore = (): WindowState => {
    return store.get('state', defaultSize);
  }

  const getCurrentPosition = (win: BrowserWindow) => {
    const position = win.getPosition()
    const size = win.getSize()
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    }
  }

  const windowWithinBounds = (windowState: Rectangle, bounds: Rectangle) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    )
  }

  const resetToDefaults = (): WindowState => {
    const bounds = screen.getPrimaryDisplay().bounds
    return {
      ...defaultSize,
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height!) / 2,
    }
  }

  const ensureVisibleOnSomeDisplay = (windowState: WindowState): WindowState => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds)
    })
    if (!visible) {
      return resetToDefaults()
    }
    return windowState
  }

  const saveState = (win: BrowserWindow) => {
    if (!win.isMinimized() && !win.isMaximized()) {
      store.set('state', getCurrentPosition(win))
    } else if (win.isMaximized()) {
      store.set('state', { ...state, isMaximized: true })
    }
  }

  state = ensureVisibleOnSomeDisplay(restore())

  const win = new BrowserWindow({
    ...state,
    ...options,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      ...options.webPreferences,
    },
  })

  win.on('resize', () => saveState(win))
  win.on('move', () => saveState(win))
  win.on('close', () => saveState(win))

  return win
}
