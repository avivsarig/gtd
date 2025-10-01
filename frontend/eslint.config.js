import { config as defaultConfig } from "@epic-web/config/eslint"

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...defaultConfig,
  {
    rules: {
      "import/order": "off",
    },
  },
]
