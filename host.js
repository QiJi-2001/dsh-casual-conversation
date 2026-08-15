// ============================================================================
// DS Humor Easter Egg · Host 半
// ----------------------------------------------------------------------------
// 这是 code.host 的函数体（纯 JavaScript，禁止 import/require）。
// 使用时把本文件内容整个粘贴为 cordis_define 的 code.host。
//
// 职责：
//  1. 监听 agent/status（emit 事件）统计运行中的 agent 数；
//  2. funState RPC：供客户端轮询（800ms）检测 idle⇄running 转换，
//     驱动"发送俏皮话 / 完成小剧场 + 表情雨"；
//  3. petNews RPC：点击桌宠小蛇时，尝试用 web 服务搜索今日要闻并缓存，
//     失败返回 null（客户端自动回退本地百条语录）。
// ============================================================================

return {
  apply(ctx) {
    let running = 0
    ctx.on('agent/status', (payload) => {
      if (!payload) return
      if (payload.status === 'running') running += 1
      else if (payload.status === 'idle' && running > 0) running -= 1
    })
    harness.handle('funState', async () => {
      return { running }
    })
    let newsCache = null
    const collectTitles = (v) => {
      const out = []
      const walk = (n, d) => {
        if (d > 4 || n === null || n === undefined || out.length >= 8) return
        if (typeof n === 'string') return
        if (Array.isArray(n)) {
          for (let i = 0; i < n.length; i++) walk(n[i], d + 1)
          return
        }
        if (typeof n === 'object') {
          const ks = ['title', 'headline', 'name', 'text']
          for (let i = 0; i < ks.length; i++) {
            const s = n[ks[i]]
            if (typeof s === 'string' && s.length > 6 && s.length < 120 && out.indexOf(s) < 0) out.push(s)
          }
          const keys = Object.keys(n)
          for (let i = 0; i < keys.length && out.length < 8; i++) walk(n[keys[i]], d + 1)
        }
      }
      walk(v, 0)
      return out
    }
    harness.handle('petNews', async () => {
      if (newsCache !== null) return { items: newsCache }
      const webSvc = ctx.get('web')
      if (!webSvc) return null
      try {
        const r = await webSvc.search({ query: '今日要闻 重大新闻 热点' })
        const items = collectTitles(r)
        if (items.length) {
          newsCache = items.slice(0, 6)
          return { items: newsCache }
        }
      } catch (e) {
        // 忽略搜索失败
      }
      return null
    })
  },
}
