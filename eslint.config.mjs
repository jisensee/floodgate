import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import _import from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["src/generated/**/*", "**/next.config.js", "**/tailwind.config.js"],
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "next",
    "next/core-web-vitals",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "unused-imports": unusedImports,
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "unused-imports/no-unused-imports": "error",
        "import/order": "error",
    },
}];