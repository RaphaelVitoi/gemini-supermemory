/**
 * Per-project configuration, loaded from .gemini/.supermemory/config.json
 * Allows project-specific API keys, container tag overrides, etc.
 */

import fs from "node:fs";
import path from "node:path";
import { getGitRoot } from "./git-utils.js";

const CONFIG_DIR_NAME = ".supermemory";
const CONFIG_FILE_NAME = "config.json";

function readVerifiedConfigFile(baseDir, relativeTarget) {
  const basePath = path.normalize(path.resolve(baseDir));
  const fullPath = path.normalize(path.resolve(basePath, relativeTarget));
  const relativePath = path.relative(basePath, fullPath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    return null;
  }
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, "utf-8");
}

export function loadProjectConfig(cwd = process.cwd()) {
  const gitRoot = getGitRoot(cwd);
  const basePath = path.normalize(path.resolve(gitRoot || cwd));

  // Check .gemini/.supermemory/config.json first
  const geminiRel = path.join(".gemini", CONFIG_DIR_NAME, CONFIG_FILE_NAME);
  const geminiRaw = readVerifiedConfigFile(basePath, geminiRel);
  if (geminiRaw) {
    try {
      return JSON.parse(geminiRaw);
    } catch {
      return null;
    }
  }

  // Fallback: .supermemory/config.json in project root
  const rootRel = path.join(CONFIG_DIR_NAME, CONFIG_FILE_NAME);
  const rootRaw = readVerifiedConfigFile(basePath, rootRel);
  if (rootRaw) {
    try {
      return JSON.parse(rootRaw);
    } catch {
      return null;
    }
  }

  return null;
}

export function getProjectApiKey(cwd = process.cwd()) {
  const config = loadProjectConfig(cwd);
  return config?.apiKey || null;
}

export function getProjectContainerOverrides(cwd = process.cwd()) {
  const config = loadProjectConfig(cwd);
  return {
    personalContainerTag: config?.personalContainerTag || null,
    repoContainerTag: config?.repoContainerTag || null,
  };
}
