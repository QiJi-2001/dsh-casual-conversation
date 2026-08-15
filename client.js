// ============================================================================
// DS Humor Easter Egg · Client 半（v3.3）
// ----------------------------------------------------------------------------
// 这是 code.client 的函数体（纯 JavaScript，禁止 import/require/JSX/TS）。
// 使用时把本文件内容整个粘贴为 cordis_define 的 code.client。
//
// 已核实的运行时接口（DeepSeek Harness 动态 Cordis 插件系统）：
//  - styles.insert(css)：客户端 Builtin（非 Service）
//  - 客户端无 document → 表情雨为纯 React 渲染
//  - 客户端无"消息开始/完成"事件 → Host agent/status + host.call 轮询
//  - 接管槽位：conversation.chat.node 的 'user' / 'assistant-step'（键域固定，
//    替换官方渲染；停插件即还原）
//  - 消息结构：node.data.blocks[{kind:'reasoning'|'text', text}]，
//    location.turn.{start,end,steps[]}
//  - timer 为硬依赖（inject: ['timer']）
// ============================================================================

const SENDING_LINES = [
  '正在召唤灵感……顺便泡了杯咖啡 ☕',
  '头脑风暴中，请稍候（真的在转）🌀',
  '正在把答案从平行宇宙搬运过来……📦',
  '信号已发出，正在等宇宙回信 📡',
  '正在努力不辜负你的期待……以及电费 💡',
  '编译器有点忙，我先给它讲个笑话缓缓 😂',
  '答案正在路上，堵车了，稍等 🚗',
  '让子弹飞一会儿……💨',
]

const DONE_LINES = [
  '搞定！比预期快了一点点点点 ✨',
  '完工！请查收，不接受差评 😝',
  '新鲜出炉，趁热看 🍞',
  '以上就是全部啦，掌声在哪里 👏',
  '任务完成，系统奖励你一朵小红花 🌸',
]

const HINTS = [
  '在这里输入，奇迹就会发生 ✍️',
  '有想问的尽管打，键盘已热身完毕 ⌨️',
  '空白输入框正在期待你的大作……',
  '先别急着输入，许个愿再发 🎋',
  '这条提示语是随机轮换的，意不意外？😏',
  '输入区今日运势：宜提问，忌沉默 🔮',
]

const MASCOT_QUOTES = [
  '今天也要写点厉害的代码哦！',
  '累了就歇歇，我帮你盯着界面 👀',
  '第 42 条消息了，我知道答案就是 42。',
  '戳我一次，快乐一次，童叟无欺 🐍',
  '别拖我啦，我要晕了 🌀',
  '嘶嘶——蛇蛇不懂，蛇蛇只负责可爱',
  '刚学会了一个冷笑话：蛇为什么没有脚？因为穿鞋太麻烦 🐍',
  '听说点击我的人，今天都会有好运 🍀',
  '我只是条小蛇，别对我要求太高 😅',
  '悄悄告诉你：本界面其实藏着 8 个彩蛋 🥚',
  '我躺着就把班上了，羡慕吧 💼',
  '你的鼠标好温柔，像春风一样 🖱️',
  '再点一下，我就把压箱底的秘密告诉你 🤫',
  '今天的我，比昨天更绿了一点点 🌿',
  '第一百条语录，恭喜你抽中了隐藏款 🎰',
]

const POEM_LINES = [
  '长风破浪会有时，直挂云帆济沧海。——李白',
  '山重水复疑无路，柳暗花明又一村。——陆游',
  '会当凌绝顶，一览众山小。——杜甫',
  '海内存知己，天涯若比邻。——王勃',
  '莫愁前路无知己，天下谁人不识君。——高适',
  '天生我材必有用，千金散尽还复来。——李白',
  '沉舟侧畔千帆过，病树前头万木春。——刘禹锡',
  '不畏浮云遮望眼，自缘身在最高层。——王安石',
  '路漫漫其修远兮，吾将上下而求索。——屈原',
  '欲穷千里目，更上一层楼。——王之涣',
  '采菊东篱下，悠然见南山。——陶渊明',
  '问渠那得清如许？为有源头活水来。——朱熹',
  '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。——苏轼',
  '不识庐山真面目，只缘身在此山中。——苏轼',
  '但愿人长久，千里共婵娟。——苏轼',
  '落红不是无情物，化作春泥更护花。——龚自珍',
  '春风得意马蹄疾，一日看尽长安花。——孟郊',
  '纸上得来终觉浅，绝知此事要躬行。——陆游',
  '少壮不努力，老大徒伤悲。——汉乐府',
  '海阔凭鱼跃，天高任鸟飞。——阮阅',
  '宝剑锋从磨砺出，梅花香自苦寒来。——《警世贤文》',
  '千磨万击还坚劲，任尔东西南北风。——郑燮',
  '人生自古谁无死，留取丹心照汗青。——文天祥',
  '先天下之忧而忧，后天下之乐而乐。——范仲淹',
  '大鹏一日同风起，扶摇直上九万里。——李白',
  '两岸猿声啼不住，轻舟已过万重山。——李白',
  '雄关漫道真如铁，而今迈步从头越。——毛泽东',
  '苔花如米小，也学牡丹开。——袁枚',
  '野火烧不尽，春风吹又生。——白居易',
  '山不在高，有仙则名。水不在深，有龙则灵。——刘禹锡',
  '三人行，必有我师焉。——孔子',
  '千里之行，始于足下。——老子',
  '天行健，君子以自强不息。——《周易》',
  '博观而约取，厚积而薄发。——苏轼',
  '劝君莫惜金缕衣，劝君惜取少年时。——杜秋娘',
  '盛年不重来，一日难再晨。及时当勉励，岁月不待人。——陶渊明',
  '不经一番寒彻骨，怎得梅花扑鼻香。——黄蘖禅师',
  '海到无边天作岸，山登绝顶我为峰。——林则徐',
  '安得广厦千万间，大庇天下寒士俱欢颜。——杜甫',
  '仰天大笑出门去，我辈岂是蓬蒿人。——李白',
]

const MOTTO_LINES = [
  '每天进步一点点，坚持带来大改变 💪',
  '种一棵树最好的时间是十年前，其次是现在 🌱',
  '你只管努力，剩下的交给时间 ⏳',
  '不要等待机会，而要创造机会 🔥',
  '越努力，越幸运 🍀',
  '把简单的事做好，就是不简单 ✨',
  '低谷的每一步，都是向上的路 ⛰️',
  '今天不想跑，所以才去跑 🏃',
  '你的时间有限，别为别人而活 ⏰',
  '失败是成功之母，总结是成功之父 📝',
  '坚持就是胜利，放弃就是结束 🏁',
  '生活不会辜负每一个用力奔跑的人 🌅',
  '熬过无人问津的日子，才有诗和远方 🌄',
  '所有逆袭，都是有备而来 🎯',
  '星光不问赶路人，时光不负有心人 🌠',
  '慢慢来，比较快 🐢',
  '敢想敢干，人生不设限 🚀',
  '比你优秀的人比你还努力 😤',
  '一步一个脚印，总会到达终点 👣',
  '别怕路远，只怕心懒 ❤️‍🔥',
  '保持热爱，奔赴山海 🏔️',
  '眼里有光，心中有梦，脚下有路 ✨',
  '最难的时候，往往离成功最近 📈',
  '与其临渊羡鱼，不如退而结网 🎣',
  '心有多大，舞台就有多大 🎭',
]

const EQ_LINES = [
  '真正的成熟，是懂得控制情绪 🎭',
  '倾听比表达更显情商 👂',
  '夸人要具体，批评要对事 💬',
  '说话让人舒服，是一个人顶级的修养 🌟',
  '情绪稳定，是最好的名片 🃏',
  '看破不说破，是成年人的温柔 🍵',
  '先处理心情，再处理事情 🧘',
  '把"你懂了吗"换成"我说清楚了吗" 🗣️',
  '拒绝别人时，给一个台阶 🪜',
  '道歉不丢脸，嘴硬才掉价 🤝',
  '高情商不是取悦所有人，而是不伤害任何人 🕊️',
  '别人自嘲时，不要附和 😌',
  '赞美要当众，提醒要私下 🎁',
  '少说"但是"，多说"同时" 🔄',
  '关系再好，也要留三分余地 🏠',
  '生气时先数到十，再开口 😤',
  '让别人赢一点，自己赢更多 🏆',
  '记住别人的名字，是最廉价的尊重 📛',
  '幽默是最高级的情商 😄',
  '懂得示弱的人，往往更强大 💧',
]

const PARTY_LINES = ['彩带已发射！🎊', '快乐浓度 +100 🥳', '气氛组就位！🎉']

const EMOJIS = ['🎉', '✨', '🌟', '💫', '🥳', '😄', '🎈', '🔥', '🐳', '🍀', '💖', '🎊']

const PET_SIZE = 104

const THINK_KINDS = ['reasoning', 'thinking', 'thought', 'internal', 'cot']
const TOOL_KINDS = ['tool_use', 'tool_result', 'tool-input', 'tool-output']

const PET_QUOTES = POEM_LINES.concat(MOTTO_LINES, EQ_LINES, MASCOT_QUOTES)

function splitParts(node, who) {
  const thinking = []
  const reply = []
  const seen = []
  const push = (arr, s) => {
    if (s && seen.indexOf(s) < 0) { seen.push(s); arr.push(s) }
  }
  const walk = (n, d, inThinking) => {
    if (d > 9 || n === null || n === undefined) return
    if (typeof n === 'string') { push(inThinking ? thinking : reply, n); return }
    if (typeof n === 'number' || typeof n === 'boolean') return
    if (Array.isArray(n)) {
      for (let i = 0; i < n.length; i++) walk(n[i], d + 1, inThinking)
      return
    }
    if (typeof n === 'object') {
      const k = (typeof n.kind === 'string' && n.kind) || (typeof n.type === 'string' && n.type) || ''
      if (k && TOOL_KINDS.indexOf(k) >= 0) return
      let isThink = inThinking
      if (k && THINK_KINDS.indexOf(k) >= 0) isThink = true
      if (n.thinking !== undefined && n.thinking !== false && n.thinking !== null) isThink = true
      if (typeof n.role === 'string' && THINK_KINDS.indexOf(n.role) >= 0) isThink = true
      const keys = ['content', 'blocks', 'items', 'message', 'messages', 'parts', 'data', 'finalNode', 'steps', 'start', 'end']
      for (let i = 0; i < keys.length; i++) {
        const kk = keys[i]
        if (n[kk] !== undefined) walk(n[kk], d + 1, isThink)
      }
      if (typeof n.thinking === 'string' && n.thinking) push(thinking, n.thinking)
      if (typeof n.text === 'string' && n.text) push(isThink ? thinking : reply, n.text)
      if (typeof n.value === 'string' && n.value) push(isThink ? thinking : reply, n.value)
      if (typeof n.body === 'string' && n.body) push(isThink ? thinking : reply, n.body)
      if (typeof n.markdown === 'string' && n.markdown) push(isThink ? thinking : reply, n.markdown)
      if (typeof n.md === 'string' && n.md) push(isThink ? thinking : reply, n.md)
      if (typeof n.textContent === 'string' && n.textContent) push(isThink ? thinking : reply, n.textContent)
    }
  }
  const roots = []
  if (node && typeof node === 'object') {
    if (node.data !== undefined) roots.push(node.data)
    const turn = node.location && node.location.turn
    if (turn && typeof turn === 'object') {
      if (who === 'assistant') {
        if (turn.end !== undefined) roots.push(turn.end)
        if (Array.isArray(turn.steps)) {
          for (let i = 0; i < turn.steps.length; i++) {
            const s = turn.steps[i]
            if (s && s.end !== undefined) roots.push(s.end)
          }
        }
      } else {
        if (turn.start !== undefined) roots.push(turn.start)
      }
    }
  }
  roots.push(node)
  for (let i = 0; i < roots.length; i++) walk(roots[i], 0, false)
  return { thinking: thinking.join('\n'), reply: reply.join('\n') }
}

const CSS = `
.dsh-fun-layer {
  pointer-events: none;
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
}
.dsh-fun-pet {
  position: fixed; right: 18px; bottom: 18px; z-index: 9990;
  width: 104px; height: 104px;
  pointer-events: auto;
}
.dsh-fun-mascot {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 64px; cursor: grab; user-select: none;
  touch-action: none;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.18));
  animation: dsh-fun-crawl 2.6s ease-in-out infinite;
  transition: transform .2s ease;
}
.dsh-fun-mascot:hover { transform: scale(1.12) rotate(6deg); }
.dsh-fun-mascot-grabbing { cursor: grabbing; }
@keyframes dsh-fun-crawl {
  0%, 100% { transform: rotate(-10deg) translateY(0); }
  50% { transform: rotate(10deg) translateY(-4px); }
}
.dsh-fun-quote {
  position: absolute; left: -68px; width: 240px; bottom: 76px; z-index: 9990;
  max-width: 240px; padding: 8px 12px; border-radius: 12px;
  font-size: 12px; line-height: 1.5; cursor: pointer;
  background: var(--dsw-color-surface, #ffffff);
  color: var(--dsw-color-text, #303030);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
  animation: dsh-fun-pop .25s ease-out;
  pointer-events: auto;
}
@keyframes dsh-fun-pop {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.dsh-fun-toast {
  position: fixed; bottom: 140px; right: 130px; z-index: 9990;
  max-width: 280px; padding: 8px 12px; border-radius: 12px;
  font-size: 12px; line-height: 1.5; pointer-events: none;
  background: var(--dsw-color-surface, #ffffff);
  color: var(--dsw-color-text, #303030);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
  animation: dsh-fun-toastin 4.2s ease forwards;
}
@keyframes dsh-fun-toastin {
  0% { opacity: 0; transform: translateY(10px); }
  8% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
.dsh-fun-emoji {
  position: fixed; top: 0; z-index: 9991; pointer-events: none;
  animation-name: dsh-fun-fall;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}
@keyframes dsh-fun-fall {
  from { transform: translateY(-8vh) rotate(0deg); opacity: 1; }
  to { transform: translateY(108vh) rotate(340deg); opacity: .2; }
}
.dsh-fun-hint {
  font-size: 12px; font-style: italic; opacity: .85;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  animation: dsh-fun-fade .6s ease;
}
@keyframes dsh-fun-fade {
  from { opacity: 0; }
  to { opacity: .85; }
}
.dsh-fun-sidebtn {
  border: none; background: transparent; cursor: pointer;
  font-size: 16px; line-height: 1; padding: 6px 8px; border-radius: 8px;
}
.dsh-fun-sidebtn:hover { background: rgba(128,128,128,.15); }
.dsh-fun-sidebtn-party { animation: dsh-fun-shake .5s ease; }
@keyframes dsh-fun-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-14deg); }
  75% { transform: rotate(14deg); }
}
.dsh-fun-node {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 4px 0; width: 100%; box-sizing: border-box;
}
.dsh-fun-node-user { justify-content: flex-end; }
.dsh-fun-node-avatar {
  font-size: 26px; line-height: 1; flex: none;
  margin-top: 14px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.15));
}
.dsh-fun-node-body { max-width: 82%; min-width: 0; }
.dsh-fun-node-user .dsh-fun-node-body { text-align: right; }
.dsh-fun-node-name { font-size: 11px; opacity: .55; margin-bottom: 2px; }
.dsh-fun-node-bubble {
  display: inline-block; text-align: left;
  padding: 8px 12px; border-radius: 14px;
  font-size: 13px; line-height: 1.6;
  white-space: pre-wrap; word-break: break-word;
  max-height: 460px; overflow-y: auto;
  background: var(--dsw-color-surface, #ffffff);
  color: var(--dsw-color-text, #303030);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  animation: dsh-fun-bubble .3s ease-out;
}
.dsh-fun-node-user .dsh-fun-node-bubble { border-color: rgba(90,140,255,.35); }
.dsh-fun-node-bubble-empty { opacity: .6; font-style: italic; }
.dsh-fun-think {
  margin-bottom: 6px; padding: 6px 8px; border-radius: 8px;
  background: rgba(128,128,128,.08);
  font-size: 12px; opacity: .85; cursor: pointer; user-select: none;
}
.dsh-fun-think-closed {
  font-style: italic;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dsh-fun-think-head { font-weight: 600; }
.dsh-fun-think-body {
  margin-top: 6px; max-height: 260px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-word;
  font-style: italic; opacity: .85;
}
@keyframes dsh-fun-bubble {
  from { opacity: 0; transform: translateY(8px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`

const HAS_MATH = typeof Math !== 'undefined' && typeof Math.random === 'function'
const lcg = (function () {
  let seed = 123457
  return function () {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
})()
function rnd() { return HAS_MATH ? Math.random() : lcg() }
function pick(list) {
  const f = rnd() * list.length
  const i = HAS_MATH ? Math.floor(f) : f - (f % 1)
  return list[i < list.length ? i : list.length - 1]
}

return {
  inject: ['timer'],
  apply(ctx) {
    ctx.effect(() => styles.insert(CSS))

    const store = { running: false, toast: null, toastId: 0, burst: null, burstId: 0, viewport: null }
    const subs = new Set()
    const emitStore = () => { subs.forEach((s) => s()) }
    let seq = 0
    let toastHide = null
    const scheduleToastHide = () => {
      if (toastHide) { toastHide(); toastHide = null }
      const id = store.toastId
      toastHide = ctx.timeout(() => {
        if (store.toastId === id) { store.toast = null; emitStore() }
        toastHide = null
      }, 4200)
    }
    const burst = (count) => {
      store.burst = { id: ++store.burstId, count }
      emitStore()
    }

    function useFunStore() {
      const [snap, setSnap] = React.useState(() => ({
        running: store.running,
        toast: store.toast,
        toastId: store.toastId,
      }))
      React.useEffect(() => {
        const sub = () => setSnap({
          running: store.running,
          toast: store.toast,
          toastId: store.toastId,
        })
        subs.add(sub)
        return () => { subs.delete(sub) }
      }, [])
      return snap
    }

    function EmojiRain() {
      const [pieces, setPieces] = React.useState([])
      React.useEffect(() => {
        let lastBurstId = 0
        const sub = () => {
          const b = store.burst
          if (!b || b.id === lastBurstId) return
          lastBurstId = b.id
          const created = []
          for (let i = 0; i < b.count; i++) {
            const p = {
              id: ++seq,
              emoji: pick(EMOJIS),
              left: 2 + rnd() * 94,
              size: 14 + rnd() * 22,
              dur: 1.6 + rnd() * 1.8,
              delay: rnd() * 0.5,
            }
            created.push(p)
            ctx.timeout(() => {
              setPieces((prev) => prev.filter((x) => x.id !== p.id))
            }, (p.dur + p.delay) * 1000 + 400)
          }
          setPieces(created)
        }
        subs.add(sub)
        return () => { subs.delete(sub) }
      }, [])
      return React.createElement('div', { className: 'dsh-fun-rain' },
        pieces.map((p) => React.createElement('span', {
          key: String(p.id),
          className: 'dsh-fun-emoji',
          style: {
            left: p.left + 'vw',
            fontSize: p.size + 'px',
            animationDuration: p.dur + 's',
            animationDelay: p.delay + 's',
          },
        }, p.emoji)))
    }

    function ThinkingSection(props) {
      const [open, setOpen] = React.useState(false)
      if (!props.text) return null
      if (!open) {
        let preview = props.text.slice(0, 90)
        if (props.text.length > 90) preview = preview + '…'
        preview = preview.replace(/\n/g, ' ')
        return React.createElement('div', { className: 'dsh-fun-think dsh-fun-think-closed', onClick: () => setOpen(true) },
          React.createElement('span', null, '▸ Think · ' + preview))
      }
      return React.createElement('div', { className: 'dsh-fun-think' },
        React.createElement('div', { className: 'dsh-fun-think-head', onClick: () => setOpen(false) },
          React.createElement('span', null, '▾ Think · 点击收起')),
        React.createElement('div', { className: 'dsh-fun-think-body' }, props.text),
      )
    }

    function NodeBubble(props) {
      const who = props.who === 'user' ? 'user' : 'assistant'
      let parts = splitParts(props.node, who)
      if (!parts.reply && !parts.thinking) parts = splitParts(props, who)
      const isUser = who === 'user'
      const avatar = isUser ? '🧑' : '🤖'
      const name = isUser ? '小小奇' : 'D大哥'
      const reply = parts.reply
      const think = parts.thinking
      const empty = !reply && !think
      const body = React.createElement('div', { className: 'dsh-fun-node-body' },
        React.createElement('div', { className: 'dsh-fun-node-name' }, name),
        React.createElement('div', {
          className: 'dsh-fun-node-bubble' + (empty ? ' dsh-fun-node-bubble-empty' : ''),
          key: (reply + think).slice(0, 24),
        },
          think ? React.createElement(ThinkingSection, { text: think }) : null,
          empty ? '🙈 这条例消息暂时隐身了，正在修复…' : reply,
        ),
      )
      const av = React.createElement('span', { className: 'dsh-fun-node-avatar' }, avatar)
      return React.createElement('div', { className: 'dsh-fun-node' + (isUser ? ' dsh-fun-node-user' : '') },
        isUser ? body : av, isUser ? av : body)
    }

    function FunPet() {
      const [open, setOpen] = React.useState(false)
      const [quote, setQuote] = React.useState(() => pick(PET_QUOTES))
      const [pos, setPos] = React.useState(null)
      const [dragging, setDragging] = React.useState(false)
      const [petEl, setPetEl] = React.useState(null)
      const [dragBox] = React.useState(() => ({ data: null }))
      const onDown = (e) => {
        const r = petEl ? petEl.getBoundingClientRect() : null
        dragBox.data = {
          startX: e.clientX, startY: e.clientY,
          origX: r ? r.left : 0, origY: r ? r.top : 0,
          moved: 0,
        }
        if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
      }
      const onMove = (e) => {
        const d = dragBox.data
        if (!d) return
        const dx = e.clientX - d.startX
        const dy = e.clientY - d.startY
        d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy))
        const vp = store.viewport
        let nx = d.origX + dx
        let ny = d.origY + dy
        if (vp && vp.w > PET_SIZE) nx = Math.max(0, Math.min(vp.w - PET_SIZE, nx))
        if (vp && vp.h > PET_SIZE) ny = Math.max(0, Math.min(vp.h - PET_SIZE, ny))
        setPos({ x: Math.round(nx), y: Math.round(ny) })
      }
      const onUp = () => {
        const d = dragBox.data
        if (d && d.moved < 5) {
          if (open) {
            setOpen(false)
          } else {
            setQuote(pick(PET_QUOTES))
            setOpen(true)
            host.call('petNews', {}).then((r) => {
              if (r && r.items && r.items.length && rnd() < 0.5) {
                setQuote('📰 今日要闻 · ' + pick(r.items))
              }
            }).catch(() => {})
          }
        }
        dragBox.data = null
        setDragging(false)
      }
      return React.createElement('div', {
        className: 'dsh-fun-pet',
        ref: (node) => { if (node !== petEl) setPetEl(node) },
        style: pos ? { left: pos.x + 'px', top: pos.y + 'px', right: 'auto', bottom: 'auto' } : null,
      },
        React.createElement('div', {
          className: 'dsh-fun-mascot' + (dragging ? ' dsh-fun-mascot-grabbing' : ''),
          title: '桌宠小蛇：按住拖动，点我聊诗词/励志/高情商/今日要闻',
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerCancel: onUp,
        }, '🐍'),
        open ? React.createElement('div', { className: 'dsh-fun-quote', onClick: () => setOpen(false) }, quote) : null,
      )
    }

    function FunOverlay() {
      const snap = useFunStore()
      const [layerEl, setLayerEl] = React.useState(null)
      React.useEffect(() => {
        const measure = () => {
          if (!layerEl) return
          const w = layerEl.clientWidth
          const h = layerEl.clientHeight
          const prev = store.viewport
          if (!prev || Math.abs(prev.w - w) > 4 || Math.abs(prev.h - h) > 4) {
            store.viewport = { w, h }
          }
        }
        measure()
        return ctx.interval(measure, 1000)
      }, [layerEl])
      return React.createElement('div', { className: 'dsh-fun-layer', ref: (node) => { if (node !== layerEl) setLayerEl(node) } },
        React.createElement(EmojiRain, null),
        React.createElement(FunPet, null),
        snap.toast ? React.createElement('div', { key: 't' + snap.toastId, className: 'dsh-fun-toast' }, snap.toast) : null,
      )
    }

    function FunHint() {
      const snap = useFunStore()
      const running = snap.running
      const [line, setLine] = React.useState(() => pick(HINTS))
      React.useEffect(() => {
        setLine(pick(running ? SENDING_LINES : HINTS))
        return ctx.interval(() => {
          setLine(pick(running ? SENDING_LINES : HINTS))
        }, running ? 3200 : 14000)
      }, [running])
      return React.createElement('div', { className: 'dsh-fun-hint', title: '幽默彩蛋插件' }, line)
    }

    function FunSideButton() {
      const [party, setParty] = React.useState(false)
      const onClick = () => {
        burst(20)
        store.toast = pick(PARTY_LINES)
        store.toastId += 1
        emitStore()
        scheduleToastHide()
        setParty(true)
        ctx.timeout(() => setParty(false), 1400)
      }
      return React.createElement('button', {
        className: 'dsh-fun-sidebtn' + (party ? ' dsh-fun-sidebtn-party' : ''),
        title: '一键彩带！',
        onClick,
      }, party ? '🥳' : '🎉')
    }

    let prevRunning = null
    let polling = false
    const poll = async () => {
      if (polling) return
      polling = true
      try {
        const s = await host.call('funState', {})
        const running = !!(s && typeof s.running === 'number' && s.running > 0)
        if (prevRunning === null) {
          store.running = running
          emitStore()
        } else if (!prevRunning && running) {
          store.running = true
          store.toast = pick(SENDING_LINES)
          store.toastId += 1
          emitStore()
          scheduleToastHide()
        } else if (prevRunning && !running) {
          store.running = false
          store.toast = pick(DONE_LINES)
          store.toastId += 1
          burst(14)
          scheduleToastHide()
        } else if (store.running !== running) {
          store.running = running
          emitStore()
        }
        prevRunning = running
      } catch (e) {
        // Host 半尚未就绪，跳过本轮
      }
      polling = false
    }
    ctx.effect(() => ctx.interval(poll, 800))

    const slots = ctx.get('slots')
    if (slots !== undefined) {
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-fun-overlay', order: 100, label: '幽默彩蛋' },
        () => React.createElement(FunOverlay, null),
      ))
      slots.inject('sidebar.footer.action', () => slots.register(
        { name: 'sidebar.footer.action', id: 'dsh-fun-confetti', order: 10, label: '🎉 彩蛋彩带' },
        () => React.createElement(FunSideButton, null),
      ))
      slots.inject('conversation.input.left', () => slots.register(
        { name: 'conversation.input.left', id: 'dsh-fun-confetti-input', order: 5, label: '一键彩带' },
        () => React.createElement(FunSideButton, null),
      ))
      slots.inject('conversation.composer.dock', () => slots.register(
        { name: 'conversation.composer.dock', id: 'dsh-fun-hint', order: 5, label: '彩蛋提示行' },
        () => React.createElement(FunHint, null),
      ))
      slots.inject('conversation.chat.node', () => slots.register(
        { name: 'conversation.chat.node', key: 'user' },
        (props) => React.createElement(NodeBubble, { node: props ? props.node : null, who: 'user' }),
      ))
      slots.inject('conversation.chat.node', () => slots.register(
        { name: 'conversation.chat.node', key: 'assistant-step' },
        (props) => React.createElement(NodeBubble, { node: props ? props.node : null, who: 'assistant' }),
      ))
    }

    ctx.timeout(() => {
      store.toast = '百条语录上线：诗词+励志+高情商+俏皮+要闻 🐍'
      store.toastId += 1
      burst(10)
      scheduleToastHide()
    }, 1200)
  },
}
