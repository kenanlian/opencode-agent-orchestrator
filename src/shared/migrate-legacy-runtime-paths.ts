import { appendFileSync, copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs"
import { homedir, tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { CACHE_DIR_NAME, LEGACY_CONFIG_BASENAME, LOG_FILENAME } from "./plugin-identity"

const LEGACY_LOG_FILENAME = `${LEGACY_CONFIG_BASENAME}.log`

function migrateFilePath(legacyPath: string, canonicalPath: string): boolean {
  if (!existsSync(legacyPath)) {
    return false
  }

  mkdirSync(dirname(canonicalPath), { recursive: true })

  if (existsSync(canonicalPath)) {
    try {
      const legacyContents = readFileSync(legacyPath)
      appendFileSync(canonicalPath, legacyContents)
      rmSync(legacyPath, { force: true })
      return true
    } catch {
      return false
    }
  }

  try {
    renameSync(legacyPath, canonicalPath)
    return true
  } catch {
    try {
      copyFileSync(legacyPath, canonicalPath)
      rmSync(legacyPath, { force: true })
      return true
    } catch {
      return false
    }
  }
}

function migrateDirectoryPath(legacyPath: string, canonicalPath: string): boolean {
  if (!existsSync(legacyPath)) {
    return false
  }

  mkdirSync(dirname(canonicalPath), { recursive: true })

  if (existsSync(canonicalPath)) {
    try {
      cpSync(legacyPath, canonicalPath, { recursive: true, force: false, errorOnExist: false })
      rmSync(legacyPath, { recursive: true, force: true })
      return true
    } catch {
      return false
    }
  }

  try {
    renameSync(legacyPath, canonicalPath)
    return true
  } catch {
    try {
      cpSync(legacyPath, canonicalPath, { recursive: true })
      rmSync(legacyPath, { recursive: true, force: true })
      return true
    } catch {
      return false
    }
  }
}

export function migrateLegacyLogPath(): boolean {
  const legacyPath = join(tmpdir(), LEGACY_LOG_FILENAME)
  const canonicalPath = join(tmpdir(), LOG_FILENAME)
  return migrateFilePath(legacyPath, canonicalPath)
}

export function migrateLegacyCacheDir(): boolean {
  const cacheRoot = process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache")
  const legacyPath = join(cacheRoot, LEGACY_CONFIG_BASENAME)
  const canonicalPath = join(cacheRoot, CACHE_DIR_NAME)
  return migrateDirectoryPath(legacyPath, canonicalPath)
}

export function migrateLegacyRuntimePaths(): void {
  migrateLegacyLogPath()
  migrateLegacyCacheDir()
}
