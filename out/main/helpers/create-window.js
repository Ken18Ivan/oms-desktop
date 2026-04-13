import { screen, BrowserWindow, } from 'electron';
import Store from 'electron-store';
export const createWindow = (windowName, options) => {
    // const key = 'window-state';
    const name = `window-state-${windowName}`;
    const store = new Store({ name });
    const defaultSize = {
        width: options.width,
        height: options.height,
        x: 0,
        y: 0
    };
    let state = store.get('state', defaultSize);
    const restore = () => {
        return store.get('state', defaultSize);
    };
    const getCurrentPosition = (win) => {
        const position = win.getPosition();
        const size = win.getSize();
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1],
        };
    };
    const windowWithinBounds = (windowState, bounds) => {
        return (windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height);
    };
    const resetToDefaults = () => {
        const bounds = screen.getPrimaryDisplay().bounds;
        return {
            ...defaultSize,
            x: (bounds.width - defaultSize.width) / 2,
            y: (bounds.height - defaultSize.height) / 2,
        };
    };
    const ensureVisibleOnSomeDisplay = (windowState) => {
        const visible = screen.getAllDisplays().some((display) => {
            return windowWithinBounds(windowState, display.bounds);
        });
        if (!visible) {
            return resetToDefaults();
        }
        return windowState;
    };
    const saveState = (win) => {
        if (!win.isMinimized() && !win.isMaximized()) {
            store.set('state', getCurrentPosition(win));
        }
        else if (win.isMaximized()) {
            store.set('state', { ...state, isMaximized: true });
        }
    };
    state = ensureVisibleOnSomeDisplay(restore());
    const win = new BrowserWindow({
        ...state,
        ...options,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            ...options.webPreferences,
        },
    });
    win.on('resize', () => saveState(win));
    win.on('move', () => saveState(win));
    win.on('close', () => saveState(win));
    return win;
};
