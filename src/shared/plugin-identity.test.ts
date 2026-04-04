import { describe, it, expect } from "bun:test"
import { PLUGIN_NAME, CONFIG_BASENAME, LOG_FILENAME, CACHE_DIR_NAME } from "./plugin-identity"

describe("plugin-identity constants", () => {
  describe("PLUGIN_NAME", () => {
    it("equals @kenanlian/opencode-agent-orchestrator", () => {
      // given

      // when

      // then
      expect(PLUGIN_NAME).toBe("@kenanlian/opencode-agent-orchestrator")
    })
  })

  describe("CONFIG_BASENAME", () => {
    it("equals opencode-agent-orchestrator", () => {
      // given

      // when

      // then
      expect(CONFIG_BASENAME).toBe("opencode-agent-orchestrator")
    })
  })

  describe("LOG_FILENAME", () => {
    it("equals opencode-agent-orchestrator.log", () => {
      // given

      // when

      // then
      expect(LOG_FILENAME).toBe("opencode-agent-orchestrator.log")
    })
  })

  describe("CACHE_DIR_NAME", () => {
    it("equals opencode-agent-orchestrator", () => {
      // given

      // when

      // then
      expect(CACHE_DIR_NAME).toBe("opencode-agent-orchestrator")
    })
  })
})
