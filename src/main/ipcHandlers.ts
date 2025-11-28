import { ipcMain } from "electron";
import { AutomationExecutor } from "./automationExecutor";
import { SelectorPicker } from "./selectorPicker";
import { WindowManager } from "./windowManager";

/**
 * Registers all IPC handlers for communication between renderer and main process
 */
export function registerIPCHandlers(
  windowManager: WindowManager,
  executor: AutomationExecutor,
  picker: SelectorPicker
): void {
  /**
   * Opens the browser automation window
   */
  ipcMain.handle("browser:open", async (_event, url: string) => {
    const mainWindow = windowManager.getMainWindow();
    await windowManager.ensureBrowserWindow(url, () => {
      mainWindow?.webContents.send("browser:closed");
    });
  });

  /**
   * Closes the browser automation window
   */
  ipcMain.handle("browser:close", () => {
    windowManager.closeBrowserWindow();
    const mainWindow = windowManager.getMainWindow();
    mainWindow?.webContents.send("browser:closed");
  });

  /**
   * Executes an automation step in the browser window
   */
  ipcMain.handle("browser:runStep", async (_event, step) => {
    const browserWindow = windowManager.getBrowserWindow();
    if (!browserWindow) {
      throw new Error("Browser window not available");
    }
    return await executor.executeStep(browserWindow, step);
  });

  /**
   * Initialize executor variable context from renderer
   */
  ipcMain.handle(
    "executor:initVariables",
    async (_event, vars: Record<string, string> | undefined) => {
      executor.initVariables(vars);
      return true;
    }
  );

  /**
   * Return a copy of current executor variables
   */
  ipcMain.handle("executor:getVariables", async () => {
    return executor.getVariables();
  });

  /**
   * Evaluates a conditional node (for loops and branching logic)
   */
  ipcMain.handle("browser:runConditional", async (_event, config) => {
    const browserWindow = windowManager.getBrowserWindow();
    if (!browserWindow) {
      throw new Error("Browser window not available");
    }
    return await executor.evaluateConditional(browserWindow, config);
  });

  /**
   * Initiates element selector picking mode
   */
  ipcMain.handle("pick-selector", async (_event, url: string) => {
    const mainWindow = windowManager.getMainWindow();
    if (!mainWindow) {
      throw new Error("Main window not available");
    }

    // Ensure browser window is open and ready
    const browserWindow = await windowManager.ensureBrowserWindow(url, () => {
      mainWindow.webContents.send("browser:closed");
    });

    picker.injectNavigationBar(browserWindow);
    browserWindow.focus();

    return await picker.pickSelector(browserWindow);
  });
}
