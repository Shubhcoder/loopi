import { BrowserWindow } from "electron";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/**
 * Manages application windows (main window and browser automation window)
 */
export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private browserWindow: BrowserWindow | null = null;

  /**
   * Creates the main application window
   */
  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      height: 800,
      width: 1100,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        contextIsolation: true,
        webviewTag: true,
      },
      icon: "assets/logo.png",
    });

    this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    return this.mainWindow;
  }

  /**
   * Creates or returns the browser automation window
   * @param url - Initial URL to load
   * @param onClosed - Callback when window is closed
   */
  async ensureBrowserWindow(
    url: string = "https://www.google.com/",
    onClosed?: () => void
  ): Promise<BrowserWindow> {
    if (this.browserWindow) {
      return this.browserWindow;
    }

    this.browserWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        contextIsolation: true,
        nodeIntegration: false,
      },
      icon: "assets/logo.png",
    });

    await this.browserWindow.loadURL(url);

    // Uncomment to debug picker script issues
    // this.browserWindow.webContents.openDevTools();

    // Store reference to avoid closure issues
    const onClosedCallback = onClosed;
    this.browserWindow.on("closed", () => {
      this.browserWindow = null;
      if (onClosedCallback) {
        onClosedCallback();
      }
    });

    return this.browserWindow;
  }

  /**
   * Closes the browser automation window
   */
  closeBrowserWindow(): void {
    if (this.browserWindow) {
      this.browserWindow.close();
      this.browserWindow = null;
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getBrowserWindow(): BrowserWindow | null {
    return this.browserWindow;
  }
}
