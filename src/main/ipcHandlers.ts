import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { AutomationExecutor } from "./automationExecutor";
import { SelectorPicker } from "./selectorPicker";
import {
  defaultStorageFolder,
  deleteAutomation,
  initializeExamples,
  listAutomations,
  loadAutomation,
  loadExample,
  saveAutomation,
} from "./treeStore";
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
   * Lists all stored automations from storage
   */
  ipcMain.handle("loopi:listTrees", async (_event) => {
    return listAutomations(defaultStorageFolder);
  });

  /**
   * Loads a stored automation from storage
   */
  ipcMain.handle("loopi:loadTree", async (_event) => {
    return loadAutomation(undefined, defaultStorageFolder);
  });

  /**
   * Saves an automation to storage
   */
  ipcMain.handle("loopi:saveTree", async (_event, config) => {
    return saveAutomation(config, defaultStorageFolder);
  });

  /**
   * Loads all automations from storage
   */
  ipcMain.handle("loopi:loadTrees", async (_event, config) => {
    return loadAutomation(config, defaultStorageFolder);
  });

  /**
   * Delete automation from storage
   */
  ipcMain.handle("loopi:deleteTree", async (_event, automationId: string) => {
    return deleteAutomation(automationId, defaultStorageFolder);
  });

  /**
   * Load example automation from app's examples storage folder
   */
  ipcMain.handle("loopi:loadExample", async (_event, fileName: string) => {
    return loadExample(fileName);
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

  /**
   * Initialize examples storage from source files
   */
  ipcMain.handle("loopi:initExamples", async () => {
    initializeExamples();
    return true;
  });
}
