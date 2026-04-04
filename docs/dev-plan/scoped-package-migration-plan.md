# `@kenanlian/opencode-agent-orchestrator` Scoped Package 迁移实施方案

## 文档目的

这不是讨论性方案，也不是方向性建议。

这是一份**已经冻结关键决策、可直接驱动 AI 实施**的迁移实施文档。执行者应当把本文视为本次迁移的唯一基线，并遵守以下原则：

- 不再重复讨论命名方向
- 不再保留上游的双 canonical 状态
- 不再把 `oh-my-opencode` / `oh-my-openagent` 视为长期兼容对象
- 所有修改必须围绕单一新身份一次性收敛

如果代码现状与本文冲突，以本文为准；但执行时必须先识别冲突面并一并收敛，而不是局部修补。

---

## 目标

将当前 fork 从上游遗留的 rename transition 中彻底抽离，迁移为一个长期可维护、命名一致、可独立发布的 scoped 包发行体系。

本次迁移的目标不是“把 `package.json.name` 改成 scoped 包名”，而是一次性完成以下收敛：

- 统一 npm 发布身份
- 统一 plugin entry
- 统一 CLI 命令与短别名策略
- 统一平台二进制包命名
- 统一 schema 文件名与 schema URL
- 统一运行时日志 / 缓存 / 配置文件 basename
- 统一发布工作流、标签、GitHub Release 流程
- 清除上游 `oh-my-opencode` / `oh-my-openagent` 双轨并存造成的长期维护负担

---

## 已冻结决策

以下决策已经确认，执行者不得再次改写为“待确认”“建议”“可选项”。

### 1. 命名矩阵

| 维度 | 最终值 | 备注 |
| --- | --- | --- |
| 产品显示名 | `OpenCode Agent Orchestrator` | README、文档标题、GitHub Release 展示名 |
| canonical slug | `opencode-agent-orchestrator` | 文档、schema、日志、缓存、配置 basename 统一前缀 |
| npm 主包名 | `@kenanlian/opencode-agent-orchestrator` | 唯一官方 npm 包 |
| plugin canonical entry | `@kenanlian/opencode-agent-orchestrator` | `opencode.json` 中唯一 canonical plugin entry |
| CLI 主命令 | `opencode-agent-orchestrator` | 官方主命令 |
| CLI 短别名 | `oao` | 需要一并支持 |
| 平台包前缀 | `@kenanlian/opencode-agent-orchestrator-<platform>` | 平台二进制包分发 |
| schema 文件名 | `opencode-agent-orchestrator.schema.json` | 资产文件名和 dist 文件名统一 |
| schema URL | `https://raw.githubusercontent.com/kenanlian/opencode-agent-orchestrator/dev/assets/opencode-agent-orchestrator.schema.json` | `$schema` 与 `$id` 的公开地址 |
| 配置文件 basename | `opencode-agent-orchestrator` | 默认配置文件名 |
| 日志文件名 | `opencode-agent-orchestrator.log` | 替代 `oh-my-opencode.log` |
| 缓存目录名 | `opencode-agent-orchestrator` | 替代 `oh-my-opencode` |

### 2. 发布与仓库事实

- 最终仓库地址：`https://github.com/kenanlian/opencode-agent-orchestrator`
- 默认发布源分支：`dev`
- 发布体系：只发布 `@kenanlian/opencode-agent-orchestrator` 及其平台包族
- npm 包均为**公开 scoped 包**

### 3. 兼容 / 迁移边界

本次迁移**不保留长期兼容窗口**。

但为了让已有安装能够完成迁移，需要保留**一次性迁移动作**，范围仅限：

1. 旧配置文件 basename 自动迁移到新 basename
2. 旧 plugin entry 自动迁移到新 plugin entry
3. 旧日志路径与旧缓存路径迁移到新路径

注意：

- 这不是长期 dual-read / dual-write 兼容层
- 迁移完成后，新身份是唯一正常路径
- 旧名字只作为迁移输入，不再作为 canonical 正常入口

### 4. 不采用的方案

以下方案已经明确否决，不应在实施中重新引入：

- 不发布任何 `oh-my-opencode` / `oh-my-openagent` 新版本
- 不支持无 scope plugin alias，例如 `opencode-agent-orchestrator`
- 不保留上游双命名状态作为长期兼容策略
- 不采用 `master` 作为发布输入分支
- 不采用 release 后强制重写 `master` 历史的流程

---

## 当前仓库状态摘要

根据当前仓库代码与工作流，项目仍处于上游 rename transition 中，存在以下关键冲突：

- 根包仍是 `oh-my-opencode`，CLI bin 也是 `oh-my-opencode`
- `src/shared/plugin-identity.ts` 的 canonical plugin 名已切到 `oh-my-openagent`
- 但日志文件名和缓存目录名仍是 `oh-my-opencode`
- `.github/workflows/publish.yml` 仍双发 `oh-my-opencode` 与 `oh-my-openagent`
- `.github/workflows/publish-platform.yml` 仍双发两个平台包族
- 主发布 workflow 仍绑定上游仓库 identity
- schema 产物、schema URL、CLI 文案、README、测试仍大量引用旧名字
- 部分 runtime 逻辑并未完全通过 identity 常量统一，而是散落硬编码

因此，本次迁移必须被视为一次**全链路 identity 收敛工程**，而不是局部 rename。

---

## 实施总原则

### 1. 单一真实名称原则

迁移完成后，整个项目对外只能有一个官方身份：

- npm：`@kenanlian/opencode-agent-orchestrator`
- plugin entry：`@kenanlian/opencode-agent-orchestrator`
- CLI：`opencode-agent-orchestrator`
- CLI alias：`oao`

### 2. 先收敛发布链，再收敛代码命名

必须先保证 fork 可以用自己的仓库和自己的 scoped 包独立发版，然后再完成全仓字符串和运行时 identity 收敛。

否则容易出现：

- 发布 workflow 继续引用旧包或上游仓库
- npm registry 检查命中错误包名
- 平台包与主包命名不一致
- tag / Release 指向的源码状态与已发布 npm 内容不一致

### 3. 一次性改完整条安装链路

以下层必须视为同一个事务处理，不允许拆散上线：

- root package name / bin
- root `optionalDependencies`
- 平台包 package name / bin
- `bin` wrapper
- `postinstall`
- 平台包推导逻辑
- 构建输出文件名
- Windows / Unix 二进制文件名

### 4. 一次性迁移，而非长期兼容

对于旧配置、旧 plugin entry、旧日志、旧缓存：

- 允许迁移
- 不允许长期双 canonical
- 不允许文档继续把旧名写成“正常可选路径”

### 5. 发布、tag、Release 必须指向同一源码事实

发布流程必须保证以下三者对应同一个 release commit：

- npm 上已发布的包版本
- Git tag（如 `v1.0.0`）
- GitHub Release

不得出现“npm 已发版，但 tag 是另一个工作树状态”的漂移。

---

## 最终目标状态

迁移完成后，项目应满足：

- 对外只存在一个官方主包：`@kenanlian/opencode-agent-orchestrator`
- 对外只存在一个官方 plugin entry：`@kenanlian/opencode-agent-orchestrator`
- 对外只存在一个官方主 CLI：`opencode-agent-orchestrator`
- 对外提供一个短命令别名：`oao`
- 平台包全部为 `@kenanlian/opencode-agent-orchestrator-<platform>`
- 所有 schema、配置、日志、缓存、文档、测试都围绕 `opencode-agent-orchestrator` 统一
- 旧名字只作为迁移来源，不再作为文档主路径或长期运行时 canonical

---

## 分阶段实施方案

## 阶段 0：冻结基线并移除文档中的歧义

### 目标

将本文件从“分析建议”改造成“可执行实施规范”，保证后续 AI 不再猜测。

### 本阶段必须完成的文档收敛

- 删除所有“建议”“可评估”“后续再决定”类表述
- 删除“CLI 不提供短别名”的旧结论，改为明确支持 `oao`
- 删除“保留 1 个 major 兼容窗口”的表述
- 明确新 plugin entry 是唯一 canonical
- 明确旧名只用于一次性迁移，不用于长期兼容
- 明确完整 schema URL，而不是仅给文件名

### 阶段验收

- 执行者读取本文件后，不需要再向用户追问命名决策
- 本文件内部不存在互相冲突的结论

---

## 阶段 1：发布链与仓库元数据收敛

### 目标

让 fork 拥有独立且唯一的发布身份，彻底脱离上游双发布逻辑。

### 重点修改面

#### 1. 根包元数据

关注：

- `package.json`

需要修改：

- `name` -> `@kenanlian/opencode-agent-orchestrator`
- `bin` 至少包含：
  - `opencode-agent-orchestrator`
  - `oao`
- `repository.url` -> `git+https://github.com/kenanlian/opencode-agent-orchestrator.git`
- `bugs.url` -> `https://github.com/kenanlian/opencode-agent-orchestrator/issues`
- `homepage` -> `https://github.com/kenanlian/opencode-agent-orchestrator#readme`
- `exports["./schema.json"]` -> `./dist/opencode-agent-orchestrator.schema.json`
- `optionalDependencies` 前缀统一改为 `@kenanlian/opencode-agent-orchestrator-<platform>`
- 增加 `publishConfig.access = "public"`，避免 scoped public publish 行为依赖隐式约定

#### 2. 平台包元数据

关注：

- `packages/*/package.json`

需要修改：

- 包名统一迁移到 `@kenanlian/opencode-agent-orchestrator-<platform>`
- 描述文本改为新产品名
- `repository.url` 指向 `https://github.com/kenanlian/opencode-agent-orchestrator`
- `bin` 同时提供：
  - `opencode-agent-orchestrator`
  - `oao`

#### 3. 发布工作流

关注：

- `.github/workflows/publish.yml`
- `.github/workflows/publish-platform.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/refresh-model-capabilities.yml`

需要修改：

- 移除对上游仓库的 repository guard
- 删除双发布 `oh-my-opencode` / `oh-my-openagent` 逻辑
- 所有 npm registry 检查改为 scoped 包族
- 平台包发布改为只发布 `@kenanlian/opencode-agent-orchestrator-*`
- schema 文件名变更后，同步更新 `ci.yml` 中 schema 产物路径
- `refresh-model-capabilities.yml` 中上游仓库 identity 也要一并改掉

### 发布流冻结规则

本项目发布流固定为：

1. 从 `dev` 手动触发发布 workflow
2. 先计算 / 验证版本号与 `dist_tag`
3. 先执行测试、typecheck、build
4. 先发布 npm 包
5. npm 发布成功后，再提交 release commit
6. 基于该 release commit 创建并推送 `vX.Y.Z` tag
7. 最后创建 GitHub Release

### 禁止事项

- 不再从 `master` 发版
- 不再在 release 后 `git reset --hard` + `git push -f origin master`
- 不再保留第二套包名转换逻辑

### 认证策略冻结

发布认证分两阶段：

#### Phase 1：bootstrap 首发

- 使用短期 `NODE_AUTH_TOKEN` 完成第一版 scoped 包全量发布
- 所有公开 scoped 包发布都必须确保 `npm publish --access public`
- 继续保留 `id-token: write` 与 provenance 配置，为下一阶段切换做准备

#### Phase 2：trusted publishing cutover

- 在 npm 中为主包和全部平台包配置 trusted publisher
- 验证通过后移除 `NODE_AUTH_TOKEN`
- 最终只保留 OIDC / provenance 路径

### 为什么必须这样做

- npm trusted publisher 依赖已存在包，无法直接替代首发
- 当前仓库已经具备 `id-token: write` 的基础条件
- 先 token bootstrap 再切 OIDC，是最稳的最小迁移路径

### 阶段验收

- fork 仓库可以独立运行 publish workflow
- workflow 不会再尝试发布任何 `oh-my-*` 包
- workflow 不依赖上游仓库 identity
- `npm pack --dry-run` 对主包和平台包都通过
- 发布文档中明确写出 bootstrap -> trusted publishing 的切换步骤

---

## 阶段 2：安装链路与 CLI 身份收敛

### 目标

保证“安装 -> postinstall -> 平台包 -> CLI 启动 -> 二进制 fallback -> 用户看到的命令名”整条链路都使用新身份。

### 重点修改面

#### 1. wrapper / postinstall / 平台解析

关注：

- `bin/oh-my-opencode.js`
- `bin/platform.js`
- `postinstall.mjs`
- `script/build-binaries.ts`
- `.github/workflows/publish-platform.yml`

需要修改：

- wrapper 文件名切到新命名
- 内部错误文案、日志文案、帮助文案改为新命名
- 平台包推导逻辑支持新的 scoped 前缀
- 二进制相对路径改为新命名
- Windows / Unix 输出文件名改为新命名
- `oao` 别名与主命令需要在 root 包和平台包上保持一致

#### 2. CLI 对外身份

关注：

- `src/cli/cli-program.ts`
- 相关 installer / doctor / version 输出

需要修改：

- `program.name()` 改为 `opencode-agent-orchestrator`
- help 示例统一改成新命令
- 为 `oao` 提供一致的 bin alias
- 版本输出、doctor 文案、installer 文案都必须只展示新名字

#### 3. baseline 环境变量

关注：

- `bin/oh-my-opencode.js` 中的 `OH_MY_OPENCODE_FORCE_BASELINE`

需要修改：

- 迁移为与新 canonical slug 对齐的环境变量名
- 文档与测试同步更新

### 阶段验收

- 新安装默认可执行 `opencode-agent-orchestrator`
- 新安装默认可执行 `oao`
- 各平台二进制输出名、包内路径、wrapper 查找逻辑一致
- 所有 CLI 帮助输出中不再出现旧命令名

---

## 阶段 3：运行时 identity、配置、日志、缓存收敛

### 目标

让 plugin identity、配置 basename、日志文件名、缓存目录名、运行时迁移行为全部统一到新 canonical slug。

### 重点修改面

#### 1. 统一 identity 常量

关注：

- `src/shared/plugin-identity.ts`

需要修改：

- `PLUGIN_NAME` -> `@kenanlian/opencode-agent-orchestrator`
- `LEGACY_PLUGIN_NAME` 保留为迁移输入，不作为长期 canonical
- `CONFIG_BASENAME` -> `opencode-agent-orchestrator`
- `LEGACY_CONFIG_BASENAME` 仍用于迁移识别
- `LOG_FILENAME` -> `opencode-agent-orchestrator.log`
- `CACHE_DIR_NAME` -> `opencode-agent-orchestrator`

#### 2. 消除 identity 常量之外的硬编码

注意：不能只改 `plugin-identity.ts`。

还必须检查并收敛所有 identity 硬编码，例如：

- `src/index.ts` 中的 plugin name
- `src/shared/logger.ts`
- `src/shared/data-path.ts`
- `src/shared/opencode-config-dir.ts`
- `src/cli/model-fallback.ts`
- `src/tools/call-omo-agent/tools.ts`
- `src/features/background-agent/task-poller.ts`
- `src/tools/delegate-task/category-resolver.ts`
- 其他直接写死 `oh-my-opencode` / `oh-my-openagent` 的 runtime 文案

#### 3. 配置文件默认路径

关注：

- `src/plugin-config.ts`
- `src/shared/jsonc-parser.ts`
- `src/shared/migrate-legacy-config-file.ts`
- `src/shared/opencode-config-dir.ts`
- `src/cli/config-manager/*`

需要修改：

- 默认配置文件从 `oh-my-opencode.json[c]` 切到 `opencode-agent-orchestrator.json[c]`
- 自动把旧 basename 迁移到新 basename
- 安装器和 config manager 默认写入新 basename
- 文档只展示新 basename

#### 4. 旧 plugin entry 一次性迁移

关注：

- `src/shared/plugin-entry-migrator.ts`
- `src/shared/migrate-legacy-plugin-entry.ts`
- `src/shared/log-legacy-plugin-startup-warning.ts`
- `src/hooks/legacy-plugin-toast/*`
- `src/cli/doctor/checks/system*.ts`

需要修改：

- 将旧 plugin entry 迁移目标改为 `@kenanlian/opencode-agent-orchestrator`
- 停止把旧 plugin entry 当成长期兼容正常路径
- warning / toast / doctor 文案改为“需要迁移”而不是“双路径都可用”
- 避免每次运行都维持永久兼容语义

#### 5. 日志与缓存路径迁移

关注：

- `src/shared/logger.ts`
- `src/shared/data-path.ts`
- `src/tools/ast-grep/downloader.ts`
- `src/hooks/comment-checker/downloader.ts`
- `src/shared/connected-providers-cache.ts`
- `src/shared/model-capabilities-cache.ts`

需要修改：

- 运行时新写入路径切到新日志名、新缓存目录名
- 旧路径中的已有文件 / 目录在合理范围内迁移到新路径
- 不保留长期双写

### 阶段验收

- 新安装默认只写新配置文件名
- 老配置文件能自动迁移到新 basename
- 老 plugin entry 能迁移到新 plugin entry
- 日志和缓存新写入全部走新路径
- 旧路径迁移逻辑存在且不会形成长期双 canonical

---

## 阶段 4：schema、文档、用户入口收敛

### 目标

让所有用户可见入口统一为新身份，并且 schema 文件名、schema URL、示例配置、CLI 示例全部一致。

### 重点修改面

#### 1. schema 产物与 URL

关注：

- `script/build-schema.ts`
- `script/build-schema-document.ts`
- `assets/oh-my-opencode.schema.json`
- `package.json`
- `src/cli/model-fallback.ts`

需要修改：

- schema 资产文件名改为 `assets/opencode-agent-orchestrator.schema.json`
- dist schema 文件名改为 `dist/opencode-agent-orchestrator.schema.json`
- `$id` 改为 `https://raw.githubusercontent.com/kenanlian/opencode-agent-orchestrator/dev/assets/opencode-agent-orchestrator.schema.json`
- 所有生成器、引用器、导出路径全部同步更新

#### 2. 文档与 README

关注：

- `README.md` 与多语言 README
- `docs/guide/installation.md`
- `docs/reference/cli.md`
- `docs/reference/configuration.md`
- `docs/reference/features.md`
- `docs/guide/overview.md`
- `docs/guide/agent-model-matching.md`
- `docs/examples/*.jsonc`
- 各 `AGENTS.md` 中对配置文件、日志文件、命令名的说明

需要修改：

- 安装命令统一写为 `bunx @kenanlian/opencode-agent-orchestrator`
- CLI 主命令统一写为 `opencode-agent-orchestrator`
- 如需展示短别名，明确说明 `oao` 是 CLI alias，不是 plugin entry，也不是 npm package name
- plugin entry 统一写为 `@kenanlian/opencode-agent-orchestrator`
- 配置文件示例统一切到 `opencode-agent-orchestrator.json[c]`
- schema URL 全部切到新地址
- 删除所有“当前仍处于 rename transition”“旧名仍是 canonical 正常路径”类说明

#### 3. 新增迁移说明页

必须新增一页简短迁移说明，内容仅包括：

1. 新包如何安装
2. 旧配置 / 旧 plugin entry / 旧日志缓存如何迁移
3. 用户若手动维护脚本或文档，需要修改哪些名字

### 阶段验收

- 所有主文档入口只出现新身份
- 新用户文档不再解释上游 rename history
- 所有 `$schema`、安装命令、plugin entry、CLI 命令示例都能直接复制运行

---

## 阶段 5：测试与迁移断言收敛

### 目标

确保更名不是停留在文案层面，而是测试、迁移逻辑、工作流断言全部与新身份对齐。

### 测试策略

测试只保留两类：

#### 1. canonical 新名称测试

验证：

- 新包名是唯一主路径
- 新 plugin entry 是唯一 canonical
- 新配置 basename 是默认值
- 新 schema URL 是默认值
- `opencode-agent-orchestrator` 与 `oao` 都能正确工作

#### 2. 一次性迁移测试

验证：

- 旧配置文件 basename 会迁移到新 basename
- 旧 plugin entry 会迁移到 scoped canonical entry
- 旧日志 / 缓存路径会迁移到新路径
- doctor / warning / toast 会指导迁移，而不是宣告双路径长期有效

### 不再保留的测试方向

不得继续保留以下思路：

- `oh-my-opencode` 与 `oh-my-openagent` 都是 canonical 正常路径
- 旧 plugin entry 是长期正常入口
- 旧配置 basename 是长期主路径
- 旧日志 / 缓存路径长期双写或双读

### 重点测试文件群

至少需要系统性检查并更新：

- `src/shared/migrate-legacy-config-file.test.ts`
- `src/shared/migrate-legacy-plugin-entry.test.ts`
- `src/shared/jsonc-parser.test.ts`
- `src/plugin-config.test.ts`
- `src/shared/log-legacy-plugin-startup-warning.test.ts`
- `src/hooks/legacy-plugin-toast/*.test.ts`
- `src/hooks/auto-update-checker/**/*test.ts`
- `src/cli/config-manager/*.test.ts`
- `src/cli/doctor/checks/*.test.ts`
- `bin/platform.test.ts`
- 与 schema URL、config basename、CLI 文案相关的其他测试

### 阶段验收

- 测试覆盖 canonical + 一次性迁移两条路径
- 不再为上游双命名状态背长期测试负担

---

## 阶段 6：发布前验证与首发执行

### 目标

在首个 scoped 正式版本发布前，完成一次全链路 dry-run 验证，并执行 bootstrap 首发。

### 发布前检查清单

- 主包 `npm pack --dry-run` 成功
- 平台包 `npm pack --dry-run` 成功
- `bun run build` 成功
- `bun run build:all` 成功
- `bun run typecheck` 成功
- 相关测试成功
- 本地安装后可执行：
  - `opencode-agent-orchestrator`
  - `oao`
- `opencode.json` 使用 `@kenanlian/opencode-agent-orchestrator` 能正常加载
- installer / doctor / version / README / 配置文档全部已切到新身份
- schema 资产文件名、dist 文件名、schema URL 全部一致

### npm / 权限检查清单

在自动化发布前，维护者应手动确认：

- `npm whoami` 返回正确账号
- `npm access list packages @kenanlian` 可正常执行
- 首个主包发布后，可验证：
  - `npm owner ls @kenanlian/opencode-agent-orchestrator`
  - `npm access get status @kenanlian/opencode-agent-orchestrator`

### 首发执行要求

- 使用短期 `NODE_AUTH_TOKEN` 完成第一版全量 scoped 发布
- 每个公开 scoped 包发布确保 `--access public`
- 主包和平台包版本号保持一致
- 发布成功后再创建 tag 和 GitHub Release

### 首发后动作

- 为主包和全部平台包配置 trusted publisher
- 验证 trusted publishing 可用
- 移除 `NODE_AUTH_TOKEN` 路径
- 发布一页迁移说明

### 阶段验收

- 首个 scoped 版本成功发布
- Git tag、GitHub Release、npm 包版本三者一致
- 后续发布可进入 trusted publishing-only 模式

---

## 风险与对策

## 风险 1：scoped npm 包、plugin entry、CLI 命令被混淆

### 风险

用户容易把安装包名、plugin entry、CLI 名、显示名当成同一个概念。

### 对策

所有文档统一使用以下格式：

- 安装：`bunx @kenanlian/opencode-agent-orchestrator`
- plugin entry：`@kenanlian/opencode-agent-orchestrator`
- CLI：`opencode-agent-orchestrator`
- CLI alias：`oao`

---

## 风险 2：平台包没有一起改，导致安装成功但运行失败

### 风险

如果主包、wrapper、platform package、optionalDependencies、binary path 改得不一致，会出现安装成功但 CLI 找不到二进制。

### 对策

把根包、平台包、postinstall、bin 解析逻辑、build 输出名视为同一个事务处理，禁止拆散上线。

---

## 风险 3：tag / Release / npm 版本不一致

### 风险

如果先打 tag、后发 npm，或者从未提交的工作树状态直接发版，容易让源码事实和 npm 发布结果漂移。

### 对策

发布流程固定为：

1. publish from `dev`
2. npm 发布成功
3. 提交 release commit
4. 创建 tag
5. 创建 GitHub Release

---

## 风险 4：继续沿用上游双发布逻辑

### 风险

这会让 fork 永久背负 `oh-my-opencode` / `oh-my-openagent` 两套历史包袱。

### 对策

首次发版前必须彻底删除双发布逻辑，只保留新的 scoped 包体系。

---

## 风险 5：把一次性迁移误做成长期兼容层

### 风险

如果旧配置、旧 plugin entry、旧日志、旧缓存继续被文档和运行时视为长期正常入口，迁移会失败为“换了一套名字的永久双轨维护”。

### 对策

本次迁移必须明确区分：

- **migration input**：旧名字，允许被识别和迁移
- **canonical runtime path**：只有新名字

---

## 推荐实施顺序

1. 先更新本文档，删除所有歧义与过时结论
2. 改根包与平台包元数据
3. 改发布工作流与发布策略
4. 改 bin / postinstall / 平台包解析 / CLI alias
5. 改 runtime identity、配置 basename、日志、缓存迁移
6. 改 schema 文件名、schema URL、schema 生成器与引用方
7. 改 README / 安装文档 / 配置文档 / AGENTS 文案
8. 改测试与一次性迁移断言
9. 做完整 dry-run 验证
10. 进行 bootstrap 首发
11. 切换 trusted publishing

---

## 执行约束

执行本方案的 AI 必须遵守：

- 不得把旧名字重新引入为长期 canonical
- 不得把 `master` 重新纳入发布输入链路
- 不得保留双发布逻辑
- 不得只修改 `package.json` 而忽略 schema、workflow、runtime、tests 等隐性 surface
- 不得在未完成全链路验证前宣称迁移已完成

如果在实施中发现新的硬编码 rename surface，应当将其纳入同一次迁移，而不是留作“后续清理”。

---

## 结论

这次迁移的关键不是“给包名加一个 scope”，而是**为 fork 建立唯一、稳定、可发布、可维护的命名真相**。

最终目标是：

- 对外唯一 npm 主包：`@kenanlian/opencode-agent-orchestrator`
- 对外唯一 plugin canonical entry：`@kenanlian/opencode-agent-orchestrator`
- 对外唯一 CLI 主命令：`opencode-agent-orchestrator`
- 对外提供短别名：`oao`
- 对内所有配置、日志、缓存、schema、平台包、workflow、测试全部围绕 `opencode-agent-orchestrator` 统一

只有达到这个状态，这个 fork 才算真正从上游的 rename transition 中脱离出来。
