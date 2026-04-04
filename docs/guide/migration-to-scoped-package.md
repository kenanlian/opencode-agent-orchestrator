# Migration to `@kenanlian/opencode-agent-orchestrator`

This project now has one canonical public identity:

- npm package: `@kenanlian/opencode-agent-orchestrator`
- plugin entry: `@kenanlian/opencode-agent-orchestrator`
- CLI command: `opencode-agent-orchestrator`
- CLI alias: `oao`

## 1) Install the new package

```bash
bunx @kenanlian/opencode-agent-orchestrator install
```

## 2) One-time migration behavior

The runtime performs one-time migration for legacy inputs:

- Legacy plugin entry `oh-my-opencode` in `opencode.json` migrates to `@kenanlian/opencode-agent-orchestrator`
- Legacy config basename `oh-my-opencode.json[c]` migrates to `opencode-agent-orchestrator.json[c]`
- Legacy log/cache paths migrate to `opencode-agent-orchestrator`-based paths

Legacy names are migration inputs only, not canonical runtime paths.

## 3) Manual updates for your scripts/docs

If you maintain your own scripts or docs, update these names:

- `bunx oh-my-opencode ...` -> `bunx @kenanlian/opencode-agent-orchestrator ...`
- plugin entry `oh-my-opencode` -> `@kenanlian/opencode-agent-orchestrator`
- config filename `oh-my-opencode.json[c]` -> `opencode-agent-orchestrator.json[c]`
- binary name `oh-my-opencode` -> `opencode-agent-orchestrator` (or `oao`)
