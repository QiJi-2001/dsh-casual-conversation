# DS Humor Easter Egg 🎭

为 **DeepSeek Harness Web GUI** 打造的幽默彩蛋插件——把严肃的对话界面变成两个卡通角色的聊天剧场。

基于官方内置的**动态 Cordis 插件系统**（`cordis_define` / `cordis_run`）实现：无需编译、无需重启、不修改任何安装目录文件。

## ✨ 功能一览

| 功能 | 效果 |
|------|------|
| 🧑🤖 角色气泡 | 对话消息改造为两个角色：**小小奇**（你，靠右蓝边）和 **D大哥**（AI，靠左） |
| 💭 Think 折叠 | AI 思考内容折叠为 "▸ Think · 开头预览…"，点击展开全文，思考中逐行更新 |
| 🐍 桌宠小蛇 | 无背景小蛇，鼠标拖动任意摆放；点击随机吐出一条语录 |
| 📜 百条语录 | 40 句古诗词 + 25 句励志 + 20 句高情商 + 15 句俏皮话 |
| 📰 今日要闻 | 点击小蛇时尝试联网抓取新闻热点（失败自动回退本地语录） |
| 🎉 一键彩带 | 输入框左端 + 侧边栏底部两个按钮，点击下 20 个 emoji 彩带雨 |
| ✍️ 轮换提示行 | 输入框下方随机搞笑占位语（AI 运行中自动切换等待语） |
| 💬 俏皮话 | 发送消息弹等待语；回复完成弹收尾语 + 全屏表情雨 |

## 🚀 快速开始

> 需要"创造模式"（cordis agent 预设）会话中的动态 Cordis 插件系统。

1. 在创造模式会话中，让智能体读取本仓库的 `host.js` 与 `client.js`；
2. 智能体调用 `cordis_define`（host 代码填 `host.js` 内容、client 代码填 `client.js` 内容）→ 返回 `pluginId` / `packageId`；
3. 调用 `cordis_run` 激活（首次需要你在界面上批准）；
4. 刷新页面，彩蛋立刻生效 🎉

停止插件（`cordis_stop`）即可随时还原官方界面。

## 📁 文件说明

```
ds-humor-easter-egg/
├── README.md       本文件
├── LICENSE         MIT 许可证
├── CHANGELOG.md    版本历史
├── host.js         插件 Host 半（函数体，供 cordis_define 的 code.host 使用）
├── client.js       插件 Client 半（函数体，供 cordis_define 的 code.client 使用）
└── docs/
    └── DESIGN.md   原始设计文档（彩蛋功能清单与实现路径）
```

## ⚠️ 注意事项

- 动态插件是**进程级临时**的：dsh 服务重启后需重新 define/run；
- AI 消息以纯文本渲染（Markdown 代码高亮退化为纯文本，保留换行；超长气泡可滚动）；
- "今日要闻"依赖 Host 环境的 `web` 服务，不可用时自动回退本地语录；
- 想固化永久插件可走 profile 静态插件路线（见 `docs/DESIGN.md`）。

## 📄 License

MIT © The DS Humor Easter Egg Authors
