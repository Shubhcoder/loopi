import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  /**
   * Main entry point for the Electron main process
   */
  entry: "./src/main/index.ts",
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
