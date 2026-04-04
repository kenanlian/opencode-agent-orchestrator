import { afterEach, describe, expect, test } from "bun:test"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { migrateLegacyCacheDir, migrateLegacyLogPath } from "./migrate-legacy-runtime-paths"

const testCacheRoot = join(tmpdir(), `oao-cache-migration-${Date.now()}-${Math.random().toString(36).slice(2)}`)
const legacyCacheDir = join(testCacheRoot, "oh-my-opencode")
const canonicalCacheDir = join(testCacheRoot, "opencode-agent-orchestrator")
const legacyLogPath = join(tmpdir(), "oh-my-opencode.log")
const canonicalLogPath = join(tmpdir(), "opencode-agent-orchestrator.log")
const originalXdgCacheHome = process.env.XDG_CACHE_HOME

afterEach(() => {
  if (originalXdgCacheHome === undefined) {
    delete process.env.XDG_CACHE_HOME
  } else {
    process.env.XDG_CACHE_HOME = originalXdgCacheHome
  }

  rmSync(testCacheRoot, { recursive: true, force: true })
  rmSync(legacyLogPath, { force: true })
  rmSync(canonicalLogPath, { force: true })
})

describe("migrateLegacyRuntimePaths", () => {
  test("migrates legacy tmp log file to canonical filename", () => {
    writeFileSync(legacyLogPath, "legacy log\n")

    const migrated = migrateLegacyLogPath()

    expect(migrated).toBe(true)
    expect(existsSync(legacyLogPath)).toBe(false)
    expect(readFileSync(canonicalLogPath, "utf-8")).toBe("legacy log\n")
  })

  test("migrates legacy cache directory to canonical directory", () => {
    process.env.XDG_CACHE_HOME = testCacheRoot
    mkdirSync(legacyCacheDir, { recursive: true })
    writeFileSync(join(legacyCacheDir, "cache.json"), '{"ok":true}\n')

    const migrated = migrateLegacyCacheDir()

    expect(migrated).toBe(true)
    expect(existsSync(legacyCacheDir)).toBe(false)
    expect(readFileSync(join(canonicalCacheDir, "cache.json"), "utf-8")).toBe('{"ok":true}\n')
  })
})
