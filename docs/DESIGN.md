# DSH 界面"幽默彩蛋"插件 · 设计与协作文档

## 目标

把 DeepSeek Harness Web GUI（http://127.0.0.1:3080）变得生动活泼有趣，主题：**幽默彩蛋**。
采用官方内置的**动态 Cordis 插件系统**（`cordis_define` / `cordis_run`）实现，无需编译、无需重启、不修改任何安装目录文件。

## 实现路径（已确认）

1. 动态插件系统由 `@deepseek-ai/dsh-tool-cordis` 提供，挂在 **cordis agent 预设**（界面显示名：**创造模式**）上。
2. 在"创造模式"会话中，智能体使用 `cordis_inspect_list` / `cordis_inspect_query` 查询运行时真实接口（Slots、Theme tokens、客户端 Services/Events），再用 `cordis_define` 定义插件、`cordis_run` 激活。
3. 客户端代码为**纯 JavaScript 函数体**（返回 Cordis Plugin），React UI 必须用 `React.createElement`，样式用 `styles.insert(css)`，禁止 import/JSX/TS。
4. 激活需要用户在界面上批准（单勾 = 仅当前版本；双勾 = 未来版本也自动授权）。

## 彩蛋功能清单（v1 草案）

| # | 彩蛋 | 说明 | 候选接入点（待运行时查询核实） |
|---|------|------|-------------------------------|
| 1 | 搞笑发送文案 | 每次发送消息时，随机显示一句俏皮等待语 | 需查客户端"消息/流"相关 Event |
| 2 | 完成小剧场 | 助手回复完成时随机一句收尾俏皮话 | 同上（完成事件） |
| 3 | 表情雨 | 回复完成时飘落随机 emoji 动画 | React 组件 + CSS 动画（局部 DOM） |
| 4 | 吉祥物小伙伴 | 角落一个 CSS/emoji 小吉祥物，眨眼、hover 冒泡语录 | `shell.overlay`（待核实） |
| 5 | 🎉 一键彩带 | 侧边栏小按钮，点击触发彩带/表情爆发 | `sidebar.footer.action`（待核实） |
| 6 | 随机输入框占位语 | composer 占位文字随机化 | composer 相关 slot（待核实） |
| 7 | （可选）音效 | 完成提示音 | 需确认浏览器 Audio 可用性，不可用则砍掉 |

## 硬性约束（来自官方技能文档）

- 所有副作用必须挂 `ctx.effect()` / 保留 disposer，停止插件时全部移除。
- 服务优先用 `ctx.get(name)` 软获取并处理缺失；不要滥声明 `inject`。
- 不碰 `document.body` / 全局 DOM 选择器 / 硬编码产品 DOM；用 Slot 体系。
- 不把内部活动数据整体拷贝或展示；只取所需叶子字段。
- 插件是**进程级临时**的：dsh 服务重启后消失，需重跑 `cordis_run`（或走静态插件路线固化，见下）。

## 创造模式会话的执行清单（给下一个会话的智能体）

1. 读本目录 `plugin-draft.js`。
2. `cordis_inspect_list` → 查 Client 侧 `Slots.listSubTree`（选 slot）、`Theme.listTokens`、`Event.listEvents`、`Service.listService`（确认 `styles` 服务接口）。
3. 按查询结果定稿 `code.client`（纯 JS、无 import/JSX）。
4. `cordis_define`（让用户预览代码）→ `cordis_run`。
5. 返回 `awaiting-approval` 或 `starting` 后**结束本轮**，等系统回报结果；失败则用 `cordis_inspect_self` 读诊断、新 Package 修复，不要覆盖失败的 Package。
6. 效果验证后告知用户；迭代新彩蛋 = 同一 Plugin 下追加新 Package（`update` 模式）。

## 回滚与生命周期

- `cordis_stop`：暂停插件（保留 Package 与授权）。
- `cordis_undefine`：永久删除插件（仅确认不要了才用）。
- 最粗暴回滚：重启 dsh 服务，所有动态插件自动消失（进程级）。

## 固化为永久插件（第二阶段，可选）

动态插件重启即失效；若想永久保留，需走 **profile 静态插件**路线：
- 在工作区建正式插件包（`exports["./client"]` 指向预构建 bundle + `dsh.client` 元数据，用 tsdown 构建）；
- 经 `npx @deepseek-ai/dsh plugin --profile web add <本包>` 装进 profile（需用户授权写 `~/.dsh/profiles/web`）；
- 在 profile 的 `cordis.patch.yml` 插入 `dsh.client` 行；
- 重启 `dsh web` 生效（会短暂中断会话，可恢复）。
该路线涉及工作区外写入 + 服务重启，需用户逐项授权，暂缓。
