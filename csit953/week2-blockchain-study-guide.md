# CSIT953 第 2 周 · 区块链：从共享账本到威胁模型

> **学习目标 (Learning objectives)** — 读完本章你应该能够：
> - 用一句话给出区块链的定义，并说明它和"由一个管理员维护的多副本数据库"有什么本质区别；
> - 说出哈希函数的五条性质，解释哈希链接为什么让历史记录"篡改可被发现、越往前越难改"；
> - 解释双花问题 (double-spending)，以及为什么数字签名本身解决不了它；
> - 复述分布式共识的三条性质，说明节点故障、网络延迟和不可能性结果为什么让共识很难；
> - 区分 Proof of Work、Proof of Stake 和 BFT 投票，算出哈希谜题的期望尝试次数，解释"确认数越多越安全"的含义；
> - 说明 Ethereum 的两种账户、智能合约、gas 和 PoS 怎样把区块链变成可编程的系统；
> - 用五层威胁模型分析一起攻击事件，并按"预防 / 检测与响应"给出控制措施。

> 📚 **材料说明** — 本笔记依据 Week 2 slides（S1–S47）和 Week 2 课程录音。Week 2 的录音讲到 Proof of Work（S35）就结束了；S36–S46（Ethereum 与威胁模型）由 **Week 3 录音的开头**补讲，本笔记一并采用。S44–S45 课上跳过，对应的参考答案由笔记补写，已标注。正文里的 S 编号是 slide 页码。

一群互不相识、也不完全信任彼此的人，能不能在**没有中心管理员**的情况下，共同维护一份大家都承认的记录？老师用这个问题开场，并给了一个具体场景：几家并不完全互信的机构共用一份**安全事件日志 (incident log)**。每家都希望看到同样的事件顺序，但谁都不希望别家能偷偷改动"昨天已经写下的记录"。

这样一份日志需要哪些安全性质？至少要有**完整性 (integrity)**——写进去的记录不能被悄悄改掉；**认证 (authentication)**——知道每条记录是谁写的；**可用性 (availability)**——需要时随时能读、能写；还要有**顺序 (ordering)**——大家对先后次序看法一致；以及**可问责性 (accountability)**——事后有人能来审计。其中完整性和可用性，再加上**机密性 (confidentiality)**，就是安全领域常说的 **CIA 三要素 (CIA triad)**。

区块链是回答开场问题的一种方案：它把密码学、分布式系统和经济激励拼在一起，造出一个"没有老板、但大家都认账"的账本。这一章沿着老师的五个问题，看这个方案怎样工作、又会在哪里失效。

## 引子：热度退了，安全风险没退

### 为什么说区块链仍是"新兴"话题 (S2)

老师坦言，区块链已经不像几年前那样时髦了，但它依然是一个**新兴的安全话题**。S2 给了四条理由，每一条都对应一种安全上的麻烦：

1. **它横跨四个领域**：密码学 (cryptography)、分布式系统 (distributed systems)、软件 (software) 和经济学 (economics)。任何一个领域出问题，整个系统都可能跟着出问题。
2. **攻击面很宽**：攻击者可以针对用户（偷私钥）、针对代码（利用智能合约漏洞）、针对基础设施（节点、API），也可以针对共识本身（操纵治理和激励）。
3. **失败会转走真金白银，而且往往无法撤回**。老师举了一个对比：有人黑进你的银行账户、转走 1 万澳元，你可以报警（澳洲打 000），银行调查之后能把钱追回来。在区块链上，一笔已经确认的转账几乎不可能撤销，没有哪个机构有权把它"改回去"。
4. **技术、监管和防御实践都还在演进**：新设计、新法律、新的托管模式 (custody models) 不断出现，安全措施往往跟不上技术普及的速度。

### 市场有多大，风险就有多大 (S3)

S3 的标题很精炼：*The hype cooled; the security stakes did not*——热度降了，安全上的赌注没降。看几个数字：

- 2024 年，美国批准了**现货比特币 ETP (spot Bitcoin ETPs)**，普通投资者可以通过受监管的渠道投资比特币。
- **稳定币 (stablecoin)** 仍是支付和结算领域的重要试验。老师以 USDT 为例：它的价格锚定美元，1 USDT 约等于 1 美元；有些网站已经接受用 USDT 代替信用卡付款。
- FBI 的互联网犯罪投诉中心 (IC3) 在 2024 年收到 **149,686 起**与加密货币相关的投诉，报告损失达 **93 亿美元**，同比增长 **66%**。

> 📎 **拓展(超出 slides)** — **ETP (exchange-traded product，交易所交易产品)** 是在证券交易所买卖的基金类产品。现货比特币 ETP 由发行方持有真实的比特币，投资者在券商账户里买份额即可，不用自己保管私钥。美国 SEC 在 2024 年 1 月批准了第一批这类产品。

老师想说明的是：这个生态已经大到值得**系统化的安全分析**。市场大，意味着用户多、基础设施多、值得攻击的目标多，控制措施一旦失效，后果会波及整个系统。大市场还会产生**安全外部性 (security externalities)**：一家交易所、一个稳定币发行方或一座跨链桥出事，可能连累从来没和它直接打过交道的用户。

### 区块链是一摞安全层 (S4)

要系统地分析，先得知道系统由哪几层组成。S4 把区块链拆成五层，每层负责一件事：

| 层 | 负责什么 |
|---|---|
| 密钥 (keys) | 标识用户、授权操作 |
| 交易 (transactions) | 转移价值、改变状态 |
| 智能合约 (smart contracts) | 执行应用层的规则 |
| 共识 (consensus) | 选出大家共同接受的历史 |
| 跨链桥、预言机、托管方 (bridges, oracles, custodians) | 把外部世界的信任接进来 |

分层有什么用？老师用一个钓鱼事故讲得很清楚（图 1）。用户签了一条**看起来无害**的消息；攻击者拿着这份授权，通过一个去中心化应用 (dApp) 发起转账；交易签名有效，共识就正常地把它写进区块；最后资产经跨链桥转到了别的链上。顺着图 1 往下看：每一步在密码学上都完全"正确"，结果却是用户丢了钱。

```d2 图 1 · 一次钓鱼事故：每一步在密码学上都"有效"，结果却是用户亏钱
direction: down
U: "① 密钥层\n用户签了一条“无害”的消息"
D: "② 交易 / 合约层\ndApp 用这份授权发起转账"
C: "③ 共识层\n交易被正常写进区块"
B: "④ 跨链桥\n资产被转到别的链"
R: "结果：用户的钱没了 ✗" {class: warn}
U -> D: "✓ 签名有效"
D -> C: "✓ 交易合法"
C -> B: "✓ 共识接受"
B -> R
```

这引出本章反复出现的一句话：**一笔有效的交易 (valid transaction) 仍然可能是有害的。** 签名只证明"有人用这把私钥批准了"，并不证明"这是主人的本意"。交易之所以有害，可能是攻击者拿到了密钥，可能是智能合约里有逻辑漏洞，也可能是预言机喂进来的数据是假的。问题出在哪一层，就要在那一层防——第 5 节会把这个思路展开成完整的威胁模型。

### 本章路线 (S5)

本章跟着老师的五个问题走，每一节回答一个：

1. 区块链到底改变了什么？——给出精确的定义；
2. Bitcoin 怎样使用它？——看一个具体的系统；
3. 为什么分布式共识很难？——解释一份共享历史是怎样形成的；
4. Ethereum 怎样扩展这个模型？——账本变得可编程；
5. 网络安全失效发生在哪里？——把技术接回安全实践。

老师特别提醒：目标**不是背下每个术语**，而是理解这些部件为什么复杂、又怎样彼此依赖。

<details>
<summary>自测：一笔交易签名有效，也被共识写进了区块，能不能说它是"安全"的？举一个反例。</summary>

不能。图 1 的钓鱼事故就是反例：用户被骗签了名，签名有效、交易合法、共识也接受了，结果却是资产被转走。签名只证明私钥批准过，不证明用户本意如此。

</details>

## 1. 区块链到底改变了什么？

### 1.1 它不是凭空冒出来的 (S6)

S6 是一张区块链历史时间线，按阶段整理如下：

| 阶段 | 年份 | 事件（slide 原图要点） |
|---|---|---|
| 积木准备期 | 1991 | Stuart Haber 和 W. Scott Stornetta 发表了他们的密码学研究 |
| | 1992 | 方案中加入了 Merkle 树 (Merkle trees) |
| | 2000 | 关于密码学保护的链 (cryptographically secured chains) 的理论发表 |
| | 2004 | Hal Finney 推出一个数字现金系统 |
| Bitcoin 诞生 | 2008 | Satoshi Nakamoto 记述了分布式区块链的概念 |
| | 2009 | 原图写作"发布 Bitcoin 白皮书"（见下方说明） |
| 可编程时代 | 2014 | "区块链 2.0"诞生 |
| | 2015 | Vitalik Buterin 创建并上线 Ethereum Frontier 网络 |
| | 2016 | Bitfinex 交易所被黑，约 12 万枚比特币被盗 |
| | 2017 | EOS 上线 |
| | 2018 | Bitcoin 满十岁 |
| | 2019 | Ethereum 网络日交易量超过 100 万笔 |
| | 2020 | Ethereum 上线信标链 (Beacon Chain)，为 Ethereum 2.0 做准备 |
| 应用热潮 | 2021 | NFT（非同质化代币）流行 |
| | 2022 | 元宇宙 (metaverse) 流行 |
| | 2023 | 各行业的企业都在探索区块链，Web 3.0 被寄予厚望 |

> 📎 **拓展(超出 slides)** — 1991 年 Haber 和 Stornetta 的工作是给数字文档盖上"无法回改"的时间戳，这正是"链"的雏形。另外，时间线和 S20 有一处不一致：Bitcoin 白皮书发表于 **2008 年 10 月 31 日**（S20 是对的）；2009 年 1 月 3 日挖出的是第一个区块，即**创世区块 (genesis block)**，Bitcoin 网络从那时起开始运行。2017 年那一格的 EOS 指 EOS.IO 区块链平台，原图写成 "Electro-Optical System" 是笔误。

时间线想说明的是：**区块链不是凭空出现的**。哈希函数、数字签名、拜占庭容错 (Byzantine fault tolerance)、点对点网络 (peer-to-peer networking) 早在 Bitcoin 之前就都有了。Bitcoin 的主要贡献，是把这些现成的想法和**经济激励 (economic incentives)** 组合起来，做成一个开放的数字货币系统，而且没有中心所有者也能一直运行下去。用老师的话说，这项创新**主要是架构上的 (architectural)**。

各个部件在这个架构里分工如下：

| 部件 | 在区块链里负责什么 |
|---|---|
| 哈希函数 (hash function) | 提供"数据有没有变"的紧凑证据 |
| 数字签名 (digital signature) | 授权操作：证明这笔交易由谁批准 |
| 点对点网络 (P2P network) | 把消息传播到所有节点 |
| 共识 (consensus) | 让节点对同一份历史达成一致 |
| 激励 (incentives) | 引导理性的参与者守规矩 |

单拿出其中任何一个，都撑不起区块链的安全性。老师说这在网络安全里很常见：一个系统强在哪、弱在哪，常常取决于成熟的机制**怎样组合**。

### 1.2 定义：一份共享的、只能追加的账本 (S7)

有了这些积木，S7 给出本课程的定义（建议记住原文）：

> **A blockchain is a shared, append-only ledger maintained by multiple nodes under common validation rules.**

逐个词拆开看：

- **账本 (ledger)**：按时间记下"谁给了谁多少"的记录本；
- **共享 (shared)**：不归某一方独有，参与者看到的是同一份；
- **只能追加 (append-only)**：新记录只能接在末尾，旧记录不能改、不能删——这正是开头那份事件日志想要的"别人改不了昨天的记录"；
- **多个节点 (multiple nodes) 维护**：没有一台"主服务器"；
- **共同的验证规则 (common validation rules)**：每个节点用同一套规则检查新记录，不合规的直接拒绝。

S7 用三个词概括它的结构：

- **Replicated（多副本）**：许多节点各自保存一份副本；
- **Linked（相互链接）**：每个区块都引用前一个区块（§1.5 详解）；
- **Agreed（达成共识）**：由共识决定哪段历史被接受（第 3 节详解）。

S7 右侧的两张小图对应后两个词：*LINKED BLOCKS* 表示记录被串成一段历史，*DISTRIBUTED NODES* 表示验证工作分散在许多节点上。老师特地强调："记住 **distributed** 这个词。"

**它和"复制了很多份的数据库"有什么不同？** 这是最容易混淆的一点。银行（老师举的是 NAB）的数据库由银行自己维护；一家公司也常把数据库复制好几份做备份。但无论有多少副本，背后都只有**一个管理员**，由他决定表结构 (schema)、谁有权限、哪个版本算数。区块链没有这样的角色：

| | 公司的多副本数据库 | 区块链 |
|---|---|---|
| 有几份数据 | 多份 | 多份 |
| 谁说了算 | 一个管理员决定 schema、权限和权威版本 | 多个独立节点各自验证更新，再用共识决定跟随哪段历史 |
| 改动旧记录 | 管理员有权限就能改 | 哈希链接和共识让改动可被发现，而且越来越难 |
| 你要信任谁 | 那个管理员 | 不必信任某一方，只信任规则和"多数参与者诚实" |

所以区块链远不止"一个复制了很多遍的数据库"。它的关键特征是：**没有单一控制者**，参与者依然能验证记录、同步状态，并按共享的规则接受更新。

**区块链的两项核心工作。** 老师把区块链的任务归结为两件事：**记录交易**和**保护历史**。两者缺一不可：

- 只记录、不保护：余额可以被人改写；
- 只保护、没有大家认同的记录：各个节点会各自守着不同版本的"现实"。

区块、哈希和共识都为这两件事服务。

**完整性和可用性要分开看。** 哈希链接和签名帮节点**发现**未经授权的改动，这属于完整性；但它们不保证用户随时都能提交交易、读取数据，那是可用性的事。反过来，一个高可用的网络也可能非常稳定地存下一笔错误的、或被恶意授权的交易。好的设计两种性质都要有，还必须明确规定**谁有权写入**。

### 1.3 去掉中间人：直接转账与公共账本 (S8–S10)

S8 说区块链在两方面"根本不同"：**交易**和**安全**。S9 讲交易怎样变成点对点的，S10–S12 讲安全靠什么保证。

传统支付要经过一家或几家银行，或者 PayPal 这样的平台，由它们记账、批准。S9 画的是另一种方式：钱在**两方之间直接发送**，中间的银行被划掉了。在点对点 (peer-to-peer, P2P) 系统里，Alice 把交易直接广播到网络上，网络里每个节点都能看到、都能验证。

"直接"很容易被误解，老师专门澄清：**直接不等于基础设施消失了**，而是说**没有哪一个机构必须批准每一笔付款**。P2P 描述的是协议层面的通信和权力模型：协议里没有中间人。现实中，很多用户依然依赖钱包服务商、节点服务商、交易所等第三方。于是出现一种常见局面：协议是去中心化的，用户体验却集中在少数几家服务上。这个区别在威胁模型里很重要：攻击共识非常难，攻击者往往转而攻击这些"方便下手"的基础设施（第 5 节）。

S10 讲的是另一半——**公共账本 (public ledger)**：

- 一份共享的记录由许多用户共同保存；
- 各个副本不需要单一中介就能保持同步；
- 任何人都能验证历史，参与方式遵守网络规则。

> **边界：可验证 ≠ 真实。** 公共账本提高的是**可验证性 (verifiability)**，它不保证写进去的数据本身是真的。老师举了供应链的例子：区块链能保护一条已经写入的记录不被改动，却发现不了某件商品被贴上了假标签。"公开可验证"的意思是参与者能检查**协议规则有没有被遵守**，而不是链上的每条陈述都为真。如果传感器、员工或供应商提供了假数据，共识会**忠实地保存这份假数据**。这就是**垃圾进、垃圾出 (garbage in, garbage out, GIGO)** 的边界。数据在上链之前，它的来源和质量由谁来认证？区块链自己回答不了这个问题，§1.7 和 §5.4 还会遇到它。

### 1.4 哈希函数：数据的数字指纹 (S11)

账本要能"察觉"改动，就需要这样一种工具：把任意数据压成一小段摘要，数据一变，摘要就跟着变。这就是**哈希函数 (hash function)**。它接受任意长度的输入，输出一个固定长度的值，叫**摘要 (digest)** 或**哈希值 (hash)**。老师把它比作**数字指纹 (digital fingerprint)**：指纹很小，却能认出一个人；可是光凭指纹，复原不出这个人。

S11 列出五条性质：

1. **任何输入都变成固定长度的摘要。** Bitcoin 用的 SHA-256 永远输出 256 位（64 个十六进制字符），不管输入是一个字母还是一个 4 GB 的文件。
2. **同样的输入永远得到同样的摘要**——函数是确定的 (deterministic)。
3. **输入改一点点，摘要就面目全非。** 这叫**雪崩效应 (avalanche effect)**。
4. **正着算很容易，倒着推不可行。** 算一个哈希用不了一秒，从摘要反推原文在计算上不可行。
5. **Bitcoin 用 SHA-256 来标识数据，并对数据做出承诺 (commit)。**

> **🔑 例：亲手看雪崩效应** — 用 SHA-256 算两句只差一个字符的话（笔记作者实际运行的结果）：
>
> | 输入 | SHA-256 摘要（64 个十六进制字符） |
> |---|---|
> | `Alice pays Bob 1 BTC` | `123684d93fa44e3d3aefc69c02950f4aabf8c56f6176d981d4266ccfee4f88bd` |
> | `Alice pays Bob 2 BTC` | `d9537fd1b3dfc44e8082b8a4222e6ec188a9bdfec253c4cdd9c9004fc5c8ef69` |
> | `a` | `ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb` |
>
> 前两行只差"1"和"2"，256 个比特里却有 **126 个**不同，差不多正好一半。理想的哈希函数就该这样：看到一个摘要，猜不出另一个。第三行的输入只有一个字母，摘要照样是 64 个字符，这就是"固定长度"。

**哈希不是加密。** 这是老师专门强调的边界。**加密 (encryption)** 生来就是要被还原的：用一把密钥加密，持有对应解密密钥的人就能解密。密码学哈希**没有"解密"这回事**，从摘要重建原始输入在计算上不可行。老师在课上这样问："我只给你这个哈希值，你能把原文件还原出来吗？"——不可能。可要是把文件给你、让你算哈希，一秒钟都用不了。

**日常里你其实一直在用它。** 有同学说，下载文件后会核对 MD5。老师补充了自己的做法：刷手机系统时，他会在电脑上下载固件，再把文件的 SHA-256 和官网公布的值比一比。只要有一个比特不同（比如数据 010111 里有一个 1 翻成了 0），哈希值就完全不一样，说明文件被改动或损坏了——把这样的固件刷进去，手机可能直接"变砖"。严格地说，哈希函数并不能"阻止"改动，但它让我们能**检查**完整性。

> 📎 **拓展(超出 slides)** — 命令行算 SHA-256：macOS / Linux 用 `shasum -a 256 文件名`，Windows 用 `certutil -hashfile 文件名 SHA256`。MD5 和 SHA-1 已经被人找到了**碰撞 (collision)**，即两个不同的输入得到同一个摘要：用它们检查"下载时意外损坏"还行，防"有人故意替换文件"就不够了，安全场景请用 SHA-256。"对数据做出承诺"也依赖这一点：公开某份数据的哈希，就等于承诺了数据的内容；想换一份数据而不被发现，就得找到哈希相同的另一份输入，这对 SHA-256 来说在计算上不可行。

哈希在 Bitcoin 里承担三项工作（老师的总结）：**标识**交易和区块（每笔交易、每个区块都用自己的哈希当"名字"）；支撑 **Proof of Work**（§3.6）；让后来的数据**承诺**之前的数据（§1.5）。最后再提一次边界：哈希能揭示"被承诺的数据有没有被改过"，**不能证明原始数据是真实的**——又是 GIGO。

### 1.5 每个区块都"承诺"了前一个区块 (S12–S13)

区块链不是"一个文件夹里装着一堆互不相关的区块"。每个区块都存着**前一个区块的哈希**（*previous hash*，下文简称 prev）。S12 的简化例子是：

- Block 100：hash = 7a9c…
- Block 101：previous = 7a9c…，hash = 19f2…
- Block 102：previous = 19f2…

图 2 上半部分画的就是这条链，箭头表示"引用"：每个块都指回它的父块。颜色相同的两个值必须相等，链接才成立。

```svg 图 2 · 上：每个块都存着前一个块的 hash；下：改动 Block 100 之后它的 hash 变了，Block 101 存的 prev 就对不上了
<svg viewBox="0 0 640 330">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="solid-ink"/>
    </marker>
  </defs>
  <text x="20" y="22" class="muted">正常的链：箭头表示"引用前一个块"</text>
  <rect x="20" y="34" width="170" height="92" rx="8" class="ink fill-muted" stroke-width="1.5"/>
  <text x="105" y="58" text-anchor="middle">Block 100</text>
  <text x="105" y="84" text-anchor="middle" class="muted">prev = 3e1b…</text>
  <text x="105" y="110" text-anchor="middle" class="accent">hash = 7a9c…</text>
  <rect x="235" y="34" width="170" height="92" rx="8" class="ink fill-muted" stroke-width="1.5"/>
  <text x="320" y="58" text-anchor="middle">Block 101</text>
  <text x="320" y="84" text-anchor="middle" class="accent">prev = 7a9c…</text>
  <text x="320" y="110" text-anchor="middle" class="good">hash = 19f2…</text>
  <rect x="450" y="34" width="170" height="92" rx="8" class="ink fill-muted" stroke-width="1.5"/>
  <text x="535" y="58" text-anchor="middle">Block 102</text>
  <text x="535" y="84" text-anchor="middle" class="good">prev = 19f2…</text>
  <text x="535" y="110" text-anchor="middle" class="muted">hash = 5d07…</text>
  <line x1="233" y1="80" x2="194" y2="80" class="ink" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="448" y1="80" x2="409" y2="80" class="ink" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="20" y="176" class="warn">篡改 Block 100 里的一笔交易之后</text>
  <rect x="20" y="188" width="170" height="92" rx="8" class="warn fill-warn" stroke-width="2"/>
  <text x="105" y="212" text-anchor="middle">Block 100（被改）</text>
  <text x="105" y="238" text-anchor="middle" class="muted">prev = 3e1b…</text>
  <text x="105" y="264" text-anchor="middle" class="warn">hash = c41e…</text>
  <rect x="235" y="188" width="170" height="92" rx="8" class="ink fill-muted" stroke-width="1.5"/>
  <text x="320" y="212" text-anchor="middle">Block 101</text>
  <text x="320" y="238" text-anchor="middle" class="accent">prev = 7a9c…</text>
  <text x="320" y="264" text-anchor="middle" class="muted">hash = 19f2…</text>
  <rect x="450" y="188" width="170" height="92" rx="8" class="muted fill-muted dashed" stroke-width="1.5"/>
  <text x="535" y="212" text-anchor="middle" class="muted">Block 102</text>
  <text x="535" y="238" text-anchor="middle" class="muted">prev = 19f2…</text>
  <text x="535" y="264" text-anchor="middle" class="muted">……</text>
  <line x1="233" y1="234" x2="194" y2="234" class="warn dashed" stroke-width="1.5"/>
  <text x="213" y="228" text-anchor="middle" class="warn">✗</text>
  <text x="213" y="310" text-anchor="middle" class="warn">7a9c… ≠ c41e…：链接断了</text>
  <text x="535" y="310" text-anchor="middle" class="muted">要掩盖，只能往后逐块重算</text>
</svg>
```

现在假设有人改了 Block 100 里的一笔交易（图 2 下半部分）。顺着因果走一遍：

1. Block 100 的内容变了，它作为哈希的输入也就变了，所以它的哈希随之改变（比如变成 c41e…）；
2. Block 101 里存的还是旧值 7a9c…，**链接对不上了**，任何节点一查就能发现；
3. 想补上这个破绽，就得改写 Block 101 的 prev，而这又会改变 Block 101 自己的哈希；
4. 于是 Block 102 也得重建，一路改到链的最末端。

在 Bitcoin 里，重建每一个区块还要**重新做一遍 Proof of Work**（§3.6），同时追上诚实节点那条还在不断变长的链。所以老师说，已确认的历史**篡改可被发现 (tamper-evident)**，而且**越往前越难改写 (increasingly difficult to rewrite)**。也正因为块与块之间有这种先后次序，它才叫"链"。

> **课堂问答：只改最后一个区块呢？** 有同学问，最新的块后面没有别的块引用它，改它是不是就不会被发现？老师的回答是：你当然可以改自己电脑上的那份副本，这很容易；但其他节点都按规则行事，不会跟着你改。你的最新区块和全网接受的不一致时，你的节点会按规则下载别人的区块，把你改过的那个覆盖掉。想让全网接受你的版本，你得比其他所有人加起来出块还快——这就是 **51% 攻击 (51% attack)**。

> 📎 **拓展(超出 slides)** — 课上对 51% 攻击只是一带而过，准确的含义是：攻击者掌握了全网**超过一半的算力 (hash power)**。在 Bitcoin 里，节点跟随的是"累计工作量最多的链"（通常就是最长的链），算力过半的人能比诚实节点更快地造出区块，从而让自己的版本胜出。这和副本数量无关：你把假账本复制一万份，也抵不过别人多算出一个合法区块。

S13 换成了真实数据：它是一个 Bitcoin **区块浏览器 (block explorer)** 的截图。表 1 摘录了截图里最新的三个区块（节选部分列）。

**表 1 · S13 截图里最新的三个 Bitcoin 区块**

| Number | Hash | Mined | Tx Count | Nonce | Size (Bytes) |
|---|---|---|---|---|---|
| 854332 | `0000…c65d` | 11m 36s | 5,253 | 3,064,064,566 | 1,621,054 |
| 854331 | `0000…4248` | 16m 6s | 6,727 | 2,971,806,516 | 1,584,619 |
| 854330 | `0000…f032` | 19m 4s | 5,999 | 51,426,854 | 1,663,754 |

读表 1 时注意几列：

- **Number** 是**区块高度 (block height)**，标明这个块在链上的位置；三个块的高度正好首尾相接；
- **Hash** 列全部以 `0000` 开头——这不是巧合，而是 Proof of Work 留下的痕迹（§3.6 解释原因）。网页只显示了哈希开头和结尾的几位，实际开头的 0 远不止四个；
- **Mined** 是出块距今的时间：这三个块之间分别隔了约 3 分钟和 4.5 分钟，单个间隔有长有短；
- **Nonce** 列是矿工为了让哈希满足条件而反复尝试的那个数；
- **Tx Count** 显示一个块装了五六千笔交易，**Size** 约 1.6 MB。

界面上最新的块排在最前面，但在逻辑上，每个块的头部 (block header) 都存着前一个块的哈希，指向它的父块。S13 的标题说"每 X 分钟，交易就被永久记录进一个新区块"。老师建议大家去 blockchain.com 亲自看看。

> 📎 **拓展(超出 slides)** — 对 Bitcoin 来说，S13 里的 "X" 大约是 **10 分钟**，也就是每小时约 6 个块。课上老师记不清具体数字，举例时说的是"每小时 20 个块"，请以 10 分钟为准。§3.6 会讲协议怎样把出块间隔维持在 10 分钟左右。

<details>
<summary>自测：攻击者改了 Block 100 里的一笔交易，然后把 Block 100 到最新区块的哈希全部重算了一遍。在 Bitcoin 里，他成功了吗？还缺什么？</summary>

还没成功。光重算哈希不够：在 Bitcoin 里，每个重建的区块都要重新满足 Proof of Work，开销巨大；而且其他节点手里都有原来的链，只认累计工作量最多的那条。他必须比整个诚实网络出块更快，才能后来居上，这实际上要求他掌握过半的算力（51% 攻击）。

</details>

### 1.6 中心化与去中心化 (S14, S23)

S14 只有一个标题 *Centralization vs. decentralization*，内容由老师口头展开，S23 再给出正式定义。先看图 3 的两种结构。

```svg 图 3 · 左：中心化，所有节点都连向中心，中心一倒全体失联；右：去中心化，每个节点都有副本，坏掉几个也能运转
<svg viewBox="0 0 640 280">
  <text x="160" y="24" text-anchor="middle">中心化 centralized</text>
  <line x1="160" y1="140" x2="250" y2="140" class="muted" stroke-width="1.5"/>
  <line x1="160" y1="140" x2="205" y2="62" class="muted" stroke-width="1.5"/>
  <line x1="160" y1="140" x2="115" y2="62" class="muted" stroke-width="1.5"/>
  <line x1="160" y1="140" x2="70" y2="140" class="muted" stroke-width="1.5"/>
  <line x1="160" y1="140" x2="115" y2="218" class="muted" stroke-width="1.5"/>
  <line x1="160" y1="140" x2="205" y2="218" class="muted" stroke-width="1.5"/>
  <circle cx="160" cy="140" r="20" class="warn fill-warn" stroke-width="2"/>
  <circle cx="250" cy="140" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <circle cx="205" cy="62" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <circle cx="115" cy="62" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <circle cx="70" cy="140" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <circle cx="115" cy="218" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <circle cx="205" cy="218" r="11" class="ink fill-muted" stroke-width="1.5"/>
  <text x="160" y="264" text-anchor="middle" class="warn">单点故障 single point of failure</text>
  <line x1="320" y1="40" x2="320" y2="250" class="muted dashed" stroke-width="1"/>
  <text x="480" y="24" text-anchor="middle">去中心化 decentralized</text>
  <line x1="400" y1="80" x2="480" y2="58" class="muted" stroke-width="1.5"/>
  <line x1="480" y1="58" x2="565" y2="92" class="muted" stroke-width="1.5"/>
  <line x1="400" y1="80" x2="420" y2="165" class="muted" stroke-width="1.5"/>
  <line x1="480" y1="58" x2="520" y2="150" class="muted" stroke-width="1.5"/>
  <line x1="565" y1="92" x2="520" y2="150" class="muted" stroke-width="1.5"/>
  <line x1="420" y1="165" x2="520" y2="150" class="muted" stroke-width="1.5"/>
  <line x1="420" y1="165" x2="445" y2="228" class="muted" stroke-width="1.5"/>
  <line x1="520" y1="150" x2="560" y2="215" class="muted" stroke-width="1.5"/>
  <line x1="445" y1="228" x2="560" y2="215" class="muted" stroke-width="1.5"/>
  <line x1="565" y1="92" x2="560" y2="215" class="muted" stroke-width="1.5"/>
  <circle cx="400" cy="80" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="480" cy="58" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="565" cy="92" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="420" cy="165" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="520" cy="150" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="445" cy="228" r="11" class="good fill-good" stroke-width="1.5"/>
  <circle cx="560" cy="215" r="11" class="good fill-good" stroke-width="1.5"/>
  <text x="480" y="264" text-anchor="middle" class="good">每个节点都有副本、都能验证</text>
</svg>
```

**中心化系统 (centralized system)** 把最终决定权交给一个组织（图 3 左）：所有节点都连向中心服务器，由它给出"最终答案"。**去中心化系统 (decentralized system)** 把权力分散出去（图 3 右）：没有哪台服务器总能给出最终答案；节点可能离线、可能延迟，也可能心怀恶意，但交易仍然得被处理。

两种结构各有代价。去中心化能减少**单点故障 (single point of failure)**——图 3 左边的中心一倒，整个系统就停了；但它也带来**协调成本**，安全假设也更复杂。老师的概括是：去中心化提升了韧性 (resilience)，同时把"谁说了算"变成了一个协议问题——不再由某个人拍板，而由所有节点共同遵守的规则来决定。

S23 的两条定义建议记住原文：

> - **Decentralisation** is the process by which the activities of an organization, particularly those regarding planning and decision making, are distributed or delegated away from a central, authoritative location or group.
> - **Decentralized computing** is the allocation of resources, both hardware and software, to each individual workstation.

S23 举的例子是点对点网络和**文件共享应用 (file sharing applications)**。

> 📎 **拓展(超出 slides)** — BitTorrent 就是典型的文件共享应用：一个文件被切成许多小块，由成千上万台电脑互相传输，没有中心服务器。

**去中心化不是一个开关，而是好几个维度。** 老师列出了几个可以分别追问的维度：

| 维度 | 要问的问题 |
|---|---|
| 运营 | 谁在运行节点？ |
| 出块 | 谁在提议新区块？ |
| 开发 | 谁在开发软件？ |
| 治理 | 谁控制规则的修改？ |
| 接入 | 用户从哪里接入网络？ |

一个系统可能在某个维度上很分散，在另一个维度上却很集中。老师的例子是：挖矿、验证、客户端软件的实现、服务提供商，都可能被少数几家主导。

### 1.7 区块链用在哪？什么时候其实不需要它 (S15–S16)

S15 列出了一批实际项目：

| 项目 | 用途 |
|---|---|
| Provenance | 可验证的供应链 (verifiable supply chains) |
| Everledger | 追踪和保护贵重资产的数字账本 |
| Maersk + IBM | 提升供应链效率 (supply chain efficiency) |
| DTCC | 衍生品的交易后处理 (derivatives post-trade processing) |
| Digital Asset Holdings + ASX | 交易后处理 (post-trade processing) |
| Keybase | 身份管理 (identity management) |
| Tierion | 数据验证 (verified data) |
| BitFury | 格鲁吉亚政府记录 (Georgia government records) |

老师提醒：区块链被提议用于供应链、身份、资产登记和数字货币，**但不是每个数据库都需要它**。一个好用的判断标准是：**是否有好几方需要共享同一份记录，但谁都不愿意让其中一方完全控制它？** 如果大家本来就信任某一个管理员，传统数据库通常更简单。老师的例子很直白：我们信任银行，才把工资存进去，没必要把银行改造成去中心化的银行。图 4 把这个判断过程画成了流程。

```d2 图 4 · 要不要用区块链：先问信任，再问数据源头
direction: down
Q1: "多方需要共享\n同一份记录？" {shape: diamond}
Q2: "大家都信任\n同一个管理员？" {shape: diamond}
DB: "用传统数据库\n更简单" {class: good}
BC: "区块链能保护\n共享的历史" {class: key}
Q3: "数据上链前\n来源可信吗？" {shape: diamond}
G: "垃圾进，垃圾出\n链会忠实保存假数据" {class: warn}
OK: "区块链的价值\n才真正成立" {class: good}
Q1 -> DB: 否
Q1 -> Q2: 是
Q2 -> DB: 是
Q2 -> BC: 否
BC -> Q3
Q3 -> G: 否
Q3 -> OK: 是
```

**供应链同时展示了价值和局限 (S16)。** S16 写道：借助分布式账本，供应链上的公司能看清货运追踪、交付以及其他供应商的进度——而这些公司之间**本来就没有天然的信任**。好几家公司共享追踪记录，任何一方都很难事后改写历史，这是价值所在。局限在于：区块链判断不了**实物和记录是否一致**。

老师用苹果举例：我在农场摘了一批苹果寄给你，摘果这件事发生在链外 (off-chain)，也就是现实世界里。摘果日期明明是 8 月 5 日，我写上链的却是 8 月 10 日——区块链能发现吗？不能，它根本不知道。这就是**预言机问题 (oracle problem)**：链上的系统怎样才能信任链外的事实？它和 §1.3 的 GIGO 是同一条边界，§5.4 还会再见到它。

> 📎 **拓展(超出 slides)** — S15 里有两个项目后来恰好印证了"不是每个数据库都需要区块链"：Maersk 和 IBM 合作的供应链平台 TradeLens 在 2022 年宣布关停，原因是没能吸引到足够多的行业参与者；ASX 用分布式账本替换 CHESS 结算系统的项目也在 2022 年叫停，并为此核销了约 2.5 亿澳元。技术之外，"各方愿不愿意共用同一套系统"往往才是决定性因素。

<details>
<summary>自测 1：几家医院想共享病人的转诊记录，谁都不希望别家单方面改记录，但它们都信任卫生部统一运营的系统。需要区块链吗？</summary>

通常不需要。图 4 的第二个问题答"是"：各方已经信任一个共同的管理员（卫生部），用传统数据库加上权限控制和审计日志更简单，开销也更小。

</details>

<details>
<summary>自测 2：一家公司把"这批苹果是有机种植的"写进了区块链。这条记录因此就可信了吗？</summary>

不一定。区块链只保证这条记录写入之后不被篡改、写入过程符合协议规则；记录本身真不真，取决于上链之前的数据来源（GIGO，也就是预言机问题）。

</details>

## 2. Bitcoin 怎样使用区块链？

我们已经知道区块链是什么，现在看第一个、也是最出名的具体系统。老师说，大多数人都是因为 Bitcoin 才知道区块链的，而 Bitcoin 正好给了我们一个具体的例子。

### 2.1 先问什么是货币，再问什么是加密货币 (S17)

S17 先退一步问：**货币 (currency)** 是什么？它引用了 Merriam-Webster 词典，高亮的释义有三条：*circulation as a medium of exchange*（作为交换媒介流通）；*something (such as coins, treasury notes, and banknotes) that is in circulation as a medium of exchange*（作为交换媒介流通的东西，如硬币、国库券、纸币）；*a common article for bartering*（常用来物物交换的物品）。三条的共同点是**交换媒介 (medium of exchange)**：货币的本质，是大家愿意接受它来换东西。§2.4 的披萨故事会回到这一点。

**加密货币 (cryptocurrency)** 是一种数字资产，它的**授权使用密码学**，它的**状态由一个网络来维护**。老师提醒：别把所有加密货币都当成 Bitcoin，它们在发行方式、治理、共识和用途上各不相同；今天讲 Bitcoin，只是因为它把区块链的设计展示得最清楚。"加密货币"其实是一个**统称 (umbrella term)**：

| 类型 | 说明 | 例子 |
|---|---|---|
| 原生币 (native coins) | 支撑自己所在网络的运行 | BTC、ETH |
| 代币 (tokens) | 由智能合约发行 | 各种项目代币 |
| 稳定币 (stablecoins) | 试图跟踪另一种资产的价格 | USDT 跟踪美元 |
| 治理代币 (governance tokens) | 可能附带投票权 | — |
| 托管类资产 | 代表由托管方 (custodian) 管理的某种权益 | — |

不同类型的**风险模型各不相同**。

> 📎 **拓展(超出 slides)** — 举个例子：稳定币能不能兑回 1 美元，取决于发行方的储备和信用，发行方还能冻结某个地址上的币；原生币则没有发行方可依赖，它的安全取决于整个网络的共识。

### 2.2 线上现金要满足什么？——双花问题 (S18)

S18 列出了"线上现金"的几条理想要求：

- **防止双花** (protection against double-spending)；
- **匿名**，付款方和收款方都匿名 (anonymity for both spender and recipient)；
- **能离线使用** (should work in an offline fashion)；
- **自由浮动**，并能获得真实价值 (free-floating that acquires real value)：价值由市场决定，不挂钩任何东西；
- 最好是**去中心化的** (preferably decentralized)。

要从零造出一种满足部分或全部要求的线上现金，需要把人们熟知的**密码学原语 (cryptographic primitives)** 和计算范式巧妙地组合起来——所以叫 **Crypto + Currencies**。

> 📎 **拓展(超出 slides)** — 拿这张清单对照 Bitcoin：防双花、去中心化、自由浮动，它都做到了；"匿名"只做到了**假名 (pseudonymity)**——所有交易公开可查，地址虽然不是真名，但链上分析常能把地址和真人关联起来；"离线使用"基本做不到，确认交易离不开网络。S18 说"满足部分或全部"，指的正是这种取舍。

清单里最核心的是第一条。**双花 (double-spending)** 为什么是数字现金特有的难题？纸币交出去，你手里就没有了；数字资产却只是一串数据，而数据可以**被复制**。同一份数字资产，可以复制两份，分别交给两个收款人。老师说，数字现金必须先解决**伪造**和**双花**这两个问题。

- **银行怎样解决？** 把所有交易按顺序记进**同一个数据库**。第一笔付款扣了余额，第二笔自然因余额不足被拒。
- **Bitcoin 难在哪？** 它没有银行，必须在**不依赖银行**的前提下，让所有人对交易的先后顺序达成一致。

**数字签名为什么不够？** 签名证明"谁授权了这笔交易"，**却不能排序**：两笔互相冲突的付款可以各自带着完全有效的签名。老师的提问值得想一想：*为什么数字签名能证明是谁批准了付款，却证明不了这笔钱当时还没被花掉？* 因为签名只把"私钥"和"这条消息"绑在一起；"钱还没花"是**整段历史**的性质，单看一条消息永远看不出来。所以网络还需要一条规则，从相互冲突的版本里**选出一段历史**——这就是第 3 节的共识。

### 2.3 银行 vs Bitcoin：信任搬到了哪里 (S19)

S19 把两种体系并排对比：

| | 银行 (Banking) | Bitcoin (BTC) |
|---|---|---|
| 控制者 | 中心机构 (central authority) | 网络 (the network) |
| 费用 | 照常收费 ("standard" fees apply) | 费用更低 (lower fees) |
| 安全 | 容易出现欺诈 (prone to fraud) | 安全性更高 (higher security) |

老师的解读更细：银行体系依靠一个中心机构维护余额、解决纠纷；Bitcoin 由网络规则控制，两者的成本和安全模型都不同。Bitcoin 减少了对单一机构的依赖，却把更多**责任转给了用户**——尤其是**保管私钥**和**核对交易**。

去掉中心运营方，出错和纠纷的处理方式也跟着变了。银行可以冻结账户、撤回某些转账，还能在核实身份后帮你恢复访问：网银密码忘了也不要紧，带上护照去柜台，验明身份就能重置。Bitcoin 钱包给了你更强的个人控制权，代价是**私钥一旦丢失，可能就永远丢了**。老师说得很重：昨天生成的私钥今天找不到了，通常就意味着永远找不回来，没有人能帮你恢复。信任从**机构**转移到了**协议规则和用户自己的责任**上。

> **边界：S19 的 "higher security" 指什么？** 它指协议层面：没有一个中心账本可以被黑或被内部人员篡改，没有私钥也伪造不了交易。它**不**等于用户更不容易被骗——S3 的 IC3 数据恰好说明，风险转移到了用户这一侧（私钥、钓鱼、诈骗）。第 5 节会专门分析这一层。

### 2.4 2008 年的白皮书与一个披萨的故事 (S20–S22)

**白皮书 (S20)。** 2008 年，Satoshi Nakamoto 发表了白皮书 *Bitcoin: A Peer-to-Peer Electronic Cash System*。这篇 8 页的论文提出了一种去中心化数字货币的构想。

> 📎 **拓展(超出 slides)** — Satoshi Nakamoto 是化名，真实身份至今不明。

老师强调，它的核心贡献**不是发明了什么新的数据格式**，而是给出了一整套方法：在开放网络里**给交易排序**、**限制双花**，并**奖励帮助保障系统安全的参与者**。读这篇白皮书时，要把**问题**和**机制**分开：问题是"在不完全依赖可信中介的情况下实现电子支付"；机制包括交易、时间戳、Proof of Work、激励和验证。它的贡献在于把这些部分**组合**到一起——又是 §1.1 说的"架构上的创新"。老师还提到，这篇论文发表之后，大批研究者涌进了区块链领域；比特币的价格也从最初不到 1 美元一路涨了上去，尽管当初很多人根本不相信它能活下来。

**Bitcoin 是什么 (S21)。** Bitcoin **不是实体硬币**，而是**数字货币**；那些金光闪闪的硬币照片只是纪念品或示意图。老师补充，Bitcoin 既是一种数字货币，也是一套网络协议。没有中心发行方批准每笔转账：**节点 (nodes)** 验证规则，**矿工 (miners)** 竞争提议新区块，**用户**用私钥授权支出。要分清三样东西：

1. **货币单位**：BTC；
2. **网络**：相互通信的节点；
3. **规则**：节点执行的软件规则。

**第一笔真实交易 (S22)。** 2010 年 5 月 22 日，Laszlo Hanyecz 用 **10,000 BTC**（当时约合 40 美元）买了两个 Papa John's 披萨，折合每个 BTC 不到半美分。这个故事常被用来标志 Bitcoin 从公开实验走向了经济用途。老师指出，重点不在那些币今天值多少钱，而在于**一套协议第一次被用来换取了真实的商品**。货币系统需要**被人接受**，光有正确的代码是不够的——这正好呼应 §2.1 词典定义里的"交换媒介"。

### 2.5 一笔交易的一生 (S24)

现在把前面的零件串起来。S24 用四句话概括区块链的工作方式：

1. 用户把交易**广播**到网络；
2. 有效的交易被**打包**进区块；
3. 每个区块用**哈希**引用前一个区块；
4. **共识**选出共享的历史。

老师把它浓缩成四个关键词：**交易 (transactions)、区块 (blocks)、哈希 (hashes)、共识 (consensus)**。

> **🔑 例：Alice 转 1 BTC 给 Bob**
>
> 1. **构造**：Alice 的钱包 (wallet) 写出一条消息——"从地址 A 转 1 BTC 到地址 B"。这条消息就是交易。
> 2. **谁都能写，只有她能签**：链上一切公开，Mallory 也能查到 A 有 100 BTC，于是写下"从地址 A 转 1 BTC 到 Mallory 的地址"。她能构造这条消息，却**签不了名**：签名需要地址 A 对应的**私钥 (private key)**，而她没有。没有有效签名的交易是无效的，没有节点会接受。
> 3. **地址由私钥单向推出**：从私钥可以算出地址，从地址却推不回私钥（具体推导 Week 3 讲）。所以地址可以公开，私钥绝不能泄露。
> 4. **签名并广播**：Alice 用私钥签名，把交易广播到 P2P 网络。
> 5. **节点验证**：每个节点检查两件事——签名是否有效，以及**花费条件 (spending conditions)** 是否满足。老师的例子：如果 A 的余额是 0，还能转出 1 BTC 吗？显然不能。
> 6. **打包上链**：有效交易先在交易池里排队，矿工把它选进候选区块；区块带上前一个块的哈希，矿工再完成 Proof of Work（§3.6）。
> 7. **确认 (confirmation)**：这个块之后每多接上一个新块，"这段历史会一直被接受"的把握就更大一分（§3.4）。

图 5 把这个过程画成了流程：Alice 这边只有两步，难点都在网络那边的验证和排队。

```d2 图 5 · 一笔交易的一生：谁都能"写"交易，只有私钥持有者能让它生效
direction: down
user: Alice 这边 {
  label.near: top-left
  W: "钱包构造交易\nA → B：1 BTC"
  S: "用 A 的私钥签名" {class: key}
  W -> S
}
net: 网络那边 {
  label.near: top-left
  V: "签名有效？\n余额够？" {shape: diamond}
  X: "丢弃" {class: warn}
  P: "进入交易池\n排队等待打包"
  B: "矿工打包进区块\n含 prev hash + nonce"
  K: "后续区块叠加\n确认数 ↑" {class: good}
  V -> X: 否
  V -> P: 是
  P -> B -> K
}
user.S -> net.V: 广播 broadcast
```

> 📎 **拓展(超出 slides)：Bitcoin 的"余额"其实是一堆 UTXO** — 第 5 步的"花费条件"在 Bitcoin 里有更精确的含义。Bitcoin 并不给每个地址记一个"余额"，它记的是一张张**未花费的交易输出 (unspent transaction output, UTXO)**，很像面额任意的纸币。花钱时，交易必须把作为输入的 UTXO **整张花掉**，再造出新的输出：一部分付给收款人，多出来的作为**找零 (change)** 回到自己手里，输入减去输出的差额就是付给矿工的手续费。图 6 里，Alice 用 0.7 BTC 和 0.5 BTC 两张"旧钞"付给 Bob 1 BTC，找零 0.19 BTC，手续费 0.01 BTC。在这个模型里，双花就是"把同一张 UTXO 花两次"：第二笔交易引用的输出已经被花掉了，节点直接判它无效。S46 说 Bitcoin 采用 "UTXO model"，指的就是这个；Ethereum 用的则是更像银行账户的余额模型（§4.2）。

```d2 图 6 · UTXO 模型：交易把旧的 UTXO 整张花掉，再造出新的 UTXO
direction: right
in: 输入 inputs {
  i1: "Alice 的 UTXO\n0.7 BTC"
  i2: "Alice 的 UTXO\n0.5 BTC"
}
tx: "交易 Tx\nAlice 签名" {class: key}
out: 输出 outputs {
  o1: "给 Bob\n1.0 BTC" {class: good}
  o2: "找零给 Alice\n0.19 BTC"
}
fee: "差额 0.01 BTC\n= 矿工手续费" {shape: text}
in.i1 -> tx
in.i2 -> tx
tx -> out.o1
tx -> out.o2
tx -> fee
```

<details>
<summary>自测 1：Mallory 知道 Alice 的地址和余额，她能构造一笔"Alice 转 5 BTC 给 Mallory"的交易吗？这笔交易会被接受吗？</summary>

能构造，但不会被接受。交易只是一条消息，谁都能写；要生效，就必须带上地址 A 对应私钥的有效签名。Mallory 没有私钥，签不出有效签名，节点在验证这一步就会丢弃它。

</details>

<details>
<summary>自测 2：Alice 手里只有一张 10 BTC 的 UTXO。她签了两笔交易，把它分别转给 Bob 和 Carol，两个签名都有效。节点会怎样处理？</summary>

两笔交易只有一笔能上链：一旦其中一笔被写进区块，那张 UTXO 就算花掉了，另一笔再引用它就是无效交易（双花）。至于**哪一笔**胜出，签名回答不了，要由共识决定的交易顺序来回答——这正是第 3 节的主题。

</details>

## 3. 为什么分布式共识很难？

### 3.1 共识到底要"共"什么 (S25–S28)

老师这样过渡：前半节课讲的是账本里**装了什么**，后半节课要问一个关于账本的难题——各个节点收到的消息不一样，还可能看到互相冲突的交易，它们怎样才能收敛到**同一段共享历史**上？这是一个在不确定条件下的协调问题。

S26 给出了**分布式共识 (distributed consensus)** 的经典定义（建议记住原文）：

> There are "n" nodes, each have an input value. Some nodes are faulty or malicious. A distributed consensus protocol has the following two properties:
>
> 1. The protocol terminates and all honest nodes are in agreement on the same value
> 2. This value must have been proposed by some honest node

老师把它拆成三个可用的性质：

| 性质 | 含义 | 对应 S26 |
|---|---|---|
| **Agreement（一致性）** | 诚实的参与者不会决定出相互冲突的值 | 第 1 条后半句 |
| **Validity（有效性）** | 决定出的值满足协议的接受规则（由诚实节点提出） | 第 2 条 |
| **Termination（终止性）** | 最终一定会做出决定 | 第 1 条前半句 |

老师强调："**记住 honest 这个词**。"这些要求只约束**诚实节点**；出故障的、恶意的节点可以做任何事，协议不指望它们配合。另外，共识**不是**说每个人观点相同，而是在一个明确的**故障模型 (fault model)** 下，产生一份大家都能照着执行的共享状态。

**放到 Bitcoin 里，"值"是什么？** S26 底部用红字问了这个问题，S27 给出回答。节点需要达成一致的是：

- 哪些有效交易被广播过？
- 它们发生的**先后顺序**？

结果就是**一段共享的交易历史 (one shared transaction history)**。在区块链里，这个"值"通常就是一个区块，或者说一组排好序的交易。

> **🔑 例：为什么顺序这么要紧** — 某账户有 10 个单位，它同时广播两笔付款：给 Bob 10 个、给 Carol 10 个。单独看，每一笔都签名有效、余额充足；可账户里只有 10 个单位，**只有先被接受的那笔能成功**，另一笔必须被拒绝。如果节点 X 先看到给 Bob 的那笔，节点 Y 先看到给 Carol 的那笔，又没有共识，两个节点就会对"钱到底给了谁"各执一词。这就是双花。老师的结论：区块链必须**协调整段历史**，而不只是逐个验证签名；顺序本身就会改变应用的状态。

**任一时刻，网络处在什么状态？** S28 描述了 Bitcoin P2P 网络里的情形：

- 所有节点都有一串**已达成共识的区块序列**，也就是账本 (ledger / block chain)；
- 每个节点还有一个**待处理交易池**：听说过、但还没被写进链的交易。这些交易**尚未**达成共识，而且不同节点的池子可能略有差别。

> 📎 **拓展(超出 slides)** — 这个待处理交易池通常叫 **mempool**（memory pool），就是图 5 里的"交易池"。

老师把共识过程简化成三步：**提议 (proposal) → 验证 (validation) → 接受 (acceptance)**。节点收到候选区块后，检查签名、余额和协议规则，再用共识机制决定要不要跟随它。具体怎样"提议"、怎样"接受"，不同的共识家族做法不同，§3.5 会对比。

### 3.2 为什么难 (S29)

S29 列出了共识难的原因：

- **节点可能崩溃** (crash)；
- **节点可能是恶意的** (malicious)：故意给不同的人发相互矛盾的信息；
- **P2P 网络不完美**：不是任意两个节点之间都有连接；网络本身会出故障；消息有**延迟** (latency)。

S29 的黄色框补了最关键的一句：**没有共享的全局时钟 (no shared global clock)**，这限制了哪些共识算法能保证系统持续推进。想想为什么：没有统一的时钟，节点之间就没法对"现在几点""谁先发的"取得一致；一个节点迟迟没有回音，你也分不清它是**崩溃了**还是**网络太慢**。

老师接着引入一对重要概念。**安全性 (safety)** 指不出现相互冲突的、都被接受的历史；**活性 (liveness)** 指系统一直在推进，新交易最终会被确认。用**网络分区 (network partition)** 来看两者怎样冲突（图 7）：网络断成两半，两边互相收不到消息。

```svg 图 7 · 网络分区：两边互相收不到消息，各自确认了不同的第三个块，出现两段冲突的历史
<svg viewBox="0 0 640 270">
  <line x1="320" y1="34" x2="320" y2="250" class="warn dashed" stroke-width="2"/>
  <text x="320" y="22" text-anchor="middle" class="warn">网络分区 partition：消息过不去</text>
  <rect x="70" y="60" width="44" height="30" rx="4" class="ink fill-muted" stroke-width="1.5"/>
  <text x="92" y="80" text-anchor="middle">A</text>
  <rect x="134" y="60" width="44" height="30" rx="4" class="ink fill-muted" stroke-width="1.5"/>
  <text x="156" y="80" text-anchor="middle">B</text>
  <rect x="198" y="60" width="44" height="30" rx="4" class="warn fill-warn" stroke-width="2"/>
  <text x="220" y="80" text-anchor="middle">C1</text>
  <line x1="114" y1="75" x2="134" y2="75" class="ink" stroke-width="1.5"/>
  <line x1="178" y1="75" x2="198" y2="75" class="ink" stroke-width="1.5"/>
  <text x="156" y="118" text-anchor="middle">左边确认了 C1</text>
  <rect x="398" y="60" width="44" height="30" rx="4" class="ink fill-muted" stroke-width="1.5"/>
  <text x="420" y="80" text-anchor="middle">A</text>
  <rect x="462" y="60" width="44" height="30" rx="4" class="ink fill-muted" stroke-width="1.5"/>
  <text x="484" y="80" text-anchor="middle">B</text>
  <rect x="526" y="60" width="44" height="30" rx="4" class="warn fill-warn" stroke-width="2"/>
  <text x="548" y="80" text-anchor="middle">C2</text>
  <line x1="442" y1="75" x2="462" y2="75" class="ink" stroke-width="1.5"/>
  <line x1="506" y1="75" x2="526" y2="75" class="ink" stroke-width="1.5"/>
  <text x="484" y="118" text-anchor="middle">右边确认了 C2</text>
  <line x1="100" y1="215" x2="156" y2="165" class="muted" stroke-width="1.5"/>
  <line x1="156" y1="165" x2="212" y2="215" class="muted" stroke-width="1.5"/>
  <line x1="100" y1="215" x2="212" y2="215" class="muted" stroke-width="1.5"/>
  <circle cx="100" cy="215" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <circle cx="156" cy="165" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <circle cx="212" cy="215" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <line x1="428" y1="215" x2="484" y2="165" class="muted" stroke-width="1.5"/>
  <line x1="484" y1="165" x2="540" y2="215" class="muted" stroke-width="1.5"/>
  <line x1="428" y1="215" x2="540" y2="215" class="muted" stroke-width="1.5"/>
  <circle cx="428" cy="215" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <circle cx="484" cy="165" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <circle cx="540" cy="215" r="12" class="ink fill-soft" stroke-width="1.5"/>
  <text x="156" y="258" text-anchor="middle" class="muted">左半边的节点</text>
  <text x="484" y="258" text-anchor="middle" class="muted">右半边的节点</text>
</svg>
```

- 如果两边**都继续确认**各自的新区块，就会出现图 7 里两段冲突的历史——**safety 失效**；
- 如果协议让一边或两边**暂停**，safety 可能保住了，但系统停止推进——**liveness 受损**。

鱼和熊掌不可兼得：网络出问题时，协议必须在两者之间取舍。

> 📎 **拓展(超出 slides)** — 不同系统的取舍不同。Bitcoin 偏向 liveness：分区时两边都继续挖矿，网络恢复后，累计工作量较少那一边的区块会被抛弃，这叫**链重组 (reorg)**；这也是 Bitcoin 的最终性只能是"概率性的"（§3.4）的原因。BFT 类协议偏向 safety：凑不齐足够的投票就停下来等，宁可不出块，也不出现冲突。

### 3.3 不可能性结果：不是"做不到"，而是"不能什么都要" (S30)

理论上，人们已经证明了一批**不可能性结果 (impossibility results)**，S30 列了两个。

**拜占庭将军问题 (Byzantine generals problem)。** 几位拜占庭将军各带一支军队围住一座城，只能靠信使传话，必须一致决定"进攻"还是"撤退"——如果只有一部分人进攻，就会全军覆没。麻烦在于，其中有些将军是**叛徒 (traitors)**，会故意给不同的人传相反的消息。S30 的结论是：**如果三分之一或更多的将军是叛徒，就不可能达成共识。**

> 📎 **拓展(超出 slides)** — 这个结论常写成 $n \ge 3f + 1$：要容忍 $f$ 个叛徒，至少需要 $3f+1$ 个参与者。最小的反例是 3 个将军里有 1 个叛徒：一位忠诚的副将收到指挥官"进攻"的命令，另一位副将却转告"指挥官让撤退"——他无法判断是指挥官在撒谎，还是另一位副将在撒谎。§4.4 会看到，"三分之一"这条线在 Ethereum 的 PoS 里再次出现。

**FLP 不可能性 (Fischer–Lynch–Paterson)。** 对于**确定性 (deterministic)** 的节点，在某些条件下，**只要有一个节点可能出故障，共识就不可能保证达成**。这里的"某些条件"主要指**异步网络**：消息延迟没有上限。直觉就是 §3.2 的那个困境——分不清对方是崩溃了还是太慢：一直等下去，可能永远等不到（失去 termination）；不等了直接决定，又可能和那个慢吞吞的节点决定得不一样（失去 agreement）。

老师特别强调，这些结果**并不是说共识永远行不通**，而是说**不可能在所有条件下保证所有性质**。实际的协议都会引入**假设 (assumptions)**，比如：诚实的参与者占多数；网络最终会恢复；攻击者能调动的资源有限。

> 📎 **拓展(超出 slides)** — Bitcoin 绕开 FLP 的方式有两点：一是引入**随机性**——谁先解出 PoW 谜题本质上是抽签，协议不再是确定性的；二是**放弃绝对的最终性**，只提供概率性的保证。

<details>
<summary>自测 1：S30 说"三分之一或更多是叛徒就不可能达成共识"。一条许可链有 10 个验证者，最多能容忍几个恶意验证者？</summary>

3 个。3/10 小于 1/3，还能达成共识；4/10 已经超过 1/3，就不行了。用 $n \ge 3f+1$ 算也一样：$10 \ge 3f+1$，所以 $f \le 3$。

</details>

<details>
<summary>自测 2：网络分区时，一个协议让少数派那一边停止出块，等网络恢复再说。它保住了什么、牺牲了什么？</summary>

保住了 safety（不会出现两段都被确认的冲突历史），牺牲了 liveness（少数派那一边的用户在分区期间确认不了交易）。

</details>

### 3.4 Bitcoin 的共识：理论遇到实践 (S31)

S31 把理论和实践摆在一起：

- **理论**：没有任何协议能在所有网络条件下保证所有性质；能保证什么，取决于对时序 (timing) 和故障 (fault) 的假设。
- **实践**：Proof of Work 让改写历史在经济上开销巨大；**确认数 (confirmations) 越多**，运营上的信心就越足。
- **结论（原文）**：***security is probabilistic and assumption-dependent***——安全是概率性的，并且依赖于假设。

老师补充：Bitcoin 的**最终性 (finality)** 是概率性的，而不是一张"立即生效的证书"。一笔交易所在的区块接上链，它就有 1 个确认；之后每多一个块，确认数加 1。确认数越多，攻击者要改写的区块就越多，追上诚实链的机会随之迅速减小。

> 📎 **拓展(超出 slides)：把"概率性"算出来** — Bitcoin 白皮书第 11 节给出了一个公式：假设攻击者掌握的算力占全网的比例为 $q$，商家等了 $z$ 个确认，攻击者最终追上诚实链的概率是多少？图 8 用这个公式画出了两条曲线。

```plot 图 8 · 确认数越多，攻击者追上的概率越小；但永远不为 0，而且取决于攻击者的算力
import math
def p_catch(q, z):
    p = 1 - q
    lam = z * q / p
    return 1 - sum(math.exp(-lam) * lam ** k / math.factorial(k) * (1 - (q / p) ** (z - k)) for k in range(z + 1))
zs = np.arange(0, 11)
for q, c in ((0.1, "C1"), (0.3, "C2")):
    plt.semilogy(zs, [p_catch(q, z) for z in zs], "o-", color=c, label=f"攻击者算力占比 q = {q:.0%}")
plt.axvline(6, color="C3", ls="--", lw=1)
plt.annotate("q = 10%：约 0.024%", xy=(6, p_catch(0.1, 6)), xytext=(6.6, 1.5e-3), arrowprops=dict(arrowstyle="->"))
plt.annotate("q = 30%：约 13%", xy=(6, p_catch(0.3, 6)), xytext=(6.6, 0.45), arrowprops=dict(arrowstyle="->"))
plt.text(6.15, 3e-6, "6 个确认", color="C3")
plt.yticks([1, 1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6], ["100%", "10%", "1%", "0.1%", "0.01%", "0.001%", "0.0001%"])
plt.minorticks_off()
plt.xlabel("确认数 confirmations z")
plt.ylabel("攻击者最终追上的概率（对数刻度）")
plt.legend(loc="lower left")
```

图 8 里有三件事值得看：

1. 两条曲线都随确认数迅速下降（纵轴是对数刻度，每一格差 10 倍）——这就是 "more confirmations increase operational confidence"；
2. 曲线永远碰不到 0——安全是**概率性的**；
3. 两条曲线差别巨大：攻击者有 10% 的算力时，等 6 个确认，追上的概率只有约 0.024%；有 30% 的算力时，同样等 6 个确认，概率仍有约 13%——安全**取决于假设**。如果攻击者算力过半（51% 攻击），无论等多少个确认，追上的概率都是 1。

> 📎 **拓展(超出 slides)** — 实践中，大额付款常见的做法是等 6 个确认（约 1 小时）再认为"足够安全"。

### 3.5 实践中的三类共识 (S32)

S32 把实际系统分成三个共识家族：

| | Proof of Work (PoW) | Proof of Stake (PoS) | BFT 式投票 (BFT-style voting) |
|---|---|---|---|
| 代表 | Bitcoin | Ethereum | 许可链 (permissioned networks) |
| 怎样决定谁出块 | 比拼算力 (compete with computation) | 锁定价值并投票证明 (lock value and attest) | 已知的验证者投票 (known validators vote) |
| 特点 | 开放参与 (open participation) | 经济惩罚 (economic penalties) | 最终性快 (fast finality) |

老师补充了两点。第一，Ethereum 以前也和 Bitcoin 一样用 PoW，后来才改成了 PoS。第二，**许可链 (permissioned blockchain)**，有时也叫私有链 (private blockchain)，只有经过批准的人才能加入——比如只给这个班或者只给学校内部用的一条链，由你决定谁能加入。这种链参与者少、身份已知，很难用 PoW 或 PoS，适合用 BFT 投票。

> 📎 **拓展(超出 slides)** — Ethereum 在 **2022 年 9 月 15 日**完成了从 PoW 到 PoS 的切换，这次升级称为 **The Merge**。BFT 适合许可链，是因为成员身份已知，可以直接"数票"。按 §3.3 的结论，它要求作恶的验证者不超过三分之一；一旦收集到三分之二以上的投票，区块就立即最终确定，所以"最终性快"。

### 3.6 Proof of Work：用算力"抽签"选出下一个出块者 (S33–S35)

**为什么要"选一个随机节点"？(S33)** 一种简单的共识思路是：每一轮随机选一个节点来提议下一个区块，其他节点检查这个区块，有效就接受。S33 说，要**近似地**随机选出一个节点，可以**按某种没有人能垄断的资源的比例来选**——slide 上还加了一句耐人寻味的 "(we hope)"：

- 按**计算能力**的比例选：**proof-of-work**，Bitcoin 用这种；
- 按**持有货币的多少**来选：**proof-of-stake**，Bitcoin 不用，但它是其他加密货币采用的正当模型。

> 📎 **拓展(超出 slides)：为什么不能"一人一票"？** 开放网络里没有身份证，新建一个节点几乎零成本，攻击者可以一口气伪造成千上万个身份来"刷票"，这叫**女巫攻击 (Sybil attack)**。所以不能按节点个数选，只能按一种**伪造不了、要付出真实代价**的资源来选：算力要买矿机、付电费，币要真金白银去买。"(we hope)" 指的就是这个假设：没有人能垄断这种资源，否则就会出现 51% 攻击。

**哈希谜题 (S34)。** 要创建一个区块，矿工必须找到一个 **nonce**，使得

$$H(\text{nonce} \,\|\, \text{prev\_hash} \,\|\, tx \,\|\, \cdots \,\|\, tx) < \text{target}$$

逐个解释符号：$H$ 是哈希函数（Bitcoin 用 SHA-256）；$\|$ 表示把几段数据**首尾拼接**起来；**prev_hash** 是前一个区块的哈希（§1.5 的链接）；**tx** 是要打包的交易；**nonce** 是矿工唯一可以随意改动的一个数；**target**（目标值）是协议规定的上限。用大白话说：找一个 nonce，让整个区块的哈希值"非常小"。

为什么这很难？回到 §1.4：哈希输出看起来完全随机，nonce 改一下，输出就面目全非。S34 的图把所有可能的哈希输出画成一条长带，左端一小截是**目标区间 (target space)**，只有落在这一截里的输出才算合格。图 9 进一步对比了两种难度：目标值越小，合格区间越窄，平均要试的次数就越多。

```svg 图 9 · 哈希谜题：所有可能的输出排成一条长带，只有落进最左边合格区的才算数；target 越小，合格区越窄，要试的次数越多
<svg viewBox="0 0 640 240">
  <text x="20" y="34">难度低：target 较大</text>
  <text x="620" y="34" text-anchor="end" class="muted">合格区占 1/4 → 平均约试 4 次</text>
  <rect x="20" y="44" width="600" height="32" class="muted fill-muted" stroke-width="1"/>
  <rect x="20" y="44" width="150" height="32" class="accent fill-soft" stroke-width="2"/>
  <text x="95" y="65" text-anchor="middle" class="accent">hash &lt; target</text>
  <text x="20" y="124">难度高：target 较小（要求更多前导 0）</text>
  <text x="620" y="124" text-anchor="end" class="muted">合格区占 1/20 → 平均约试 20 次</text>
  <rect x="20" y="134" width="600" height="32" class="muted fill-muted" stroke-width="1"/>
  <rect x="20" y="134" width="30" height="32" class="accent fill-soft" stroke-width="2"/>
  <circle cx="130" cy="150" r="5" class="solid-muted"/>
  <circle cx="265" cy="150" r="5" class="solid-muted"/>
  <circle cx="390" cy="150" r="5" class="solid-muted"/>
  <circle cx="520" cy="150" r="5" class="solid-muted"/>
  <circle cx="35" cy="150" r="5" class="solid-accent"/>
  <text x="20" y="190" class="muted">0</text>
  <text x="620" y="190" text-anchor="end" class="muted">2²⁵⁶ − 1</text>
  <text x="320" y="190" text-anchor="middle" class="muted">哈希输出的全部可能取值 output space</text>
  <text x="320" y="226" text-anchor="middle" class="muted">每试一个 nonce ≈ 在长条上随机落一个点（灰点落空，绿点命中）</text>
</svg>
```

S34 底部的黄色框说：如果哈希函数是安全的（满足 **puzzle-friendliness**，谜题友好性），**唯一的办法就是不停地试 nonce，直到碰上好运气**。所谓谜题友好性，就是不存在比"一个一个试"更快的捷径：你没法根据目标值反推出该用哪个 nonce。

老师的讲法更直观：给你一个哈希输出，让你找出对应的输入，这做不到（§1.4 的单向性）；但如果只要求"输出小于某个值"，就可以靠多试几次碰运气。目标值是 9123……这样一个大数，找一个比它小的输出很容易；目标值换成 01……，就难一些；换成 0012……，更难。**目标值开头的 0 越多，就越难。**

> **🔑 例：亲手"挖"一次矿** — 在一个玩具区块的内容 `block 101 | prev=7a9c... | Alice->Bob 1 BTC | nonce=` 后面依次接上 0、1、2、3……，逐个算 SHA-256，直到摘要以 k 个十六进制的 0 开头（笔记作者实际运行的结果）：
>
> | 要求的前导 0 个数 k | 期望尝试次数 $16^k$ | 这次找到的 nonce | 实际尝试次数 |
> |---|---|---|---|
> | 1 | 16 | 1 | 2 |
> | 2 | 256 | 89 | 90 |
> | 3 | 4,096 | 4,886 | 4,887 |
> | 4 | 65,536 | 5,383 | 5,384 |
> | 5 | 1,048,576 | 1,021,197 | 1,021,198 |
> | 6 | 16,777,216 | 7,825,481 | 7,825,482 |
>
> 三点观察：
>
> 1. 每多要求一个 0，**期望**尝试次数就乘以 16，因为每个十六进制位是 0 的概率是 1/16。
> 2. 实际次数有起有落：k = 4 这次运气好，5,384 次就碰上了，只比 k = 3 多了几百次。这就是 slide 说的 "get lucky"：每次尝试都是一次独立的抽签。
> 3. 不管找的时候试了多少次，**验证**都只需要算一次哈希：把 nonce 放回去算一下，看开头有没有 k 个 0。找 k = 6 的那个 nonce 花了几秒，验证它不到一毫秒。

**为什么要不断调高难度？** 有同学问了这个问题。老师解释：Bitcoin 规定了出块的节奏。如果矿工越来越多、出块太快，协议就要求更多的前导 0（调低目标值），让找 nonce 变得更难；出块太慢，就反过来降低难度。

> 📎 **拓展(超出 slides)** — 实际规则是：Bitcoin 把**平均出块间隔维持在 10 分钟**左右，每 **2016 个区块**（约两周）根据这段时间的实际出块速度重新计算一次目标值。

老师还讲了一个相关的现象：每个区块能装的交易有上限（表 1 里一个块装了五六千笔）。交易太多时就要排队，形成**网络拥堵**。他自己就遇到过：发出的一笔交易 7 天后才被确认。

> 📎 **拓展(超出 slides)** — 区块装不下时，矿工会优先打包手续费高的交易，所以手续费给得低的交易可能要等很久。

**找到 nonce 之后**，矿工把交易、前一个块的哈希和这个 nonce 一起组成新区块，广播出去；其他节点只需算一次哈希就能验证。找 nonce 的过程，就是常说的**挖矿 (mining)**。

**PoW 换来了什么 (S35)？**

- **开放竞争**：谁都可以参与提议下一个区块；
- **生成开销大，验证开销小**：其他人检查它几乎不费力；
- **没有协调者**：不需要任何人指定谁来出块。

代价 (trade-off) 是**能源消耗**和**专用硬件**。

老师强调，这些计算**本意不是要完成什么有用的工作**，而是制造一种**公开可验证的成本**，让改写历史需要投入巨大的资源。挖矿消耗的电力可以理解为系统**安全预算 (security budget)** 的一部分：诚实矿工持续支付运营成本；攻击者想替换历史，就得调动相当的资源，还要放弃本来能拿到的诚实挖矿奖励。老师也说明，这并没有终结关于环境影响的争论，只是解释了这些计算**为什么存在**。

"开放竞争"在理论上成立，实践中个人基本没有机会了。老师说，十年前有几块好显卡还能挖；现在就算有 100 块 RTX 5080 也挖不动。

> 📎 **拓展(超出 slides)：专用矿机，以及 51% 攻击能做什么** — 如今挖矿用的是专为 SHA-256 设计的 **ASIC 矿机**，矿工还会组成**矿池 (mining pool)** 共享收益，这也是 §1.6 说的"出块权可能集中在少数几家"。掌握过半算力的攻击者能做的事：改写**最近**的区块来实施双花（先付款、拿到货，再造一条不含这笔付款的更长的链）；拒绝打包某些交易。他**做不到**的事：伪造签名去花别人的币，或者凭空增发超出规则的币——不合规则的区块会被所有诚实节点直接拒绝。

<details>
<summary>自测 1：把目标值 target 调小一半，矿工的期望尝试次数怎么变？其他节点验证一个区块的开销又怎么变？</summary>

期望尝试次数翻倍（合格区间窄了一半，每次尝试命中的概率减半）；验证开销不变，仍然只算一次哈希。这正是 PoW "生成开销大、验证开销小" 的不对称性。

</details>

<details>
<summary>自测 2：一个商家收到一笔付款，交易刚被打包进最新的区块（1 个确认）。如果某个攻击者掌握了 30% 的算力，商家该放心发货吗？</summary>

不该。按图 8，攻击者有 30% 算力时，只有 1 个确认的交易被推翻的概率约 63%，即使等到 6 个确认也还有约 13%。安全是概率性的、依赖假设的：攻击者算力越大，需要等的确认就越多。

</details>

## 4. Ethereum 怎样扩展这个模型？

Bitcoin 的账本记的是"谁拥有多少币"。Ethereum 进一步问：如果账本还能运行一段大家都认可的**程序**呢？

### 4.1 从记账到"可编程的共享状态机" (S36)

老师在 Week 3 开头这样概括：Ethereum 把区块链从一个**支付账本**扩展成了一台**可编程的共享状态机 (programmable shared state machine)**。交易可以转账，也可以调用代码；每个验证节点执行同样的程序，得到同样的新状态。这让各种应用成为可能，也意味着**软件漏洞可以直接控制链上的贵重资产**。

S36 的四条要点：

- **Ether (ETH)** 用来支付计算和存储的费用；
- **账户 (accounts)** 向一台共享的状态机提交交易；
- **智能合约 (smart contracts)** 是存储在链上、在链上执行的程序；
- **以太坊虚拟机 (Ethereum Virtual Machine, EVM)** 保证所有验证节点算出相同的结果。

"状态机"听上去抽象，其实很朴素。**状态 (state)** 就是此刻链上的全部数据：每个账户有多少 ETH、每个合约里存着什么。一笔交易是一个输入，EVM 按固定的规则把"旧状态 + 交易"变成"新状态"。图 10 画的就是这件事：

```d2 图 10 · 同样的旧状态 + 同样的交易 + 同一套 EVM 规则 → 每个节点算出同一个新状态
direction: right
IN: "同一个旧状态\n+ 同一笔交易 Tx" {class: key}
N1: "节点 1 的 EVM"
N2: "节点 2 的 EVM"
N3: "节点 3 的 EVM"
OUT: "同一个新状态\n全网一致" {class: good}
IN -> N1
IN -> N2
IN -> N3
N1 -> OUT
N2 -> OUT
N3 -> OUT
```

### 4.2 两种账户 (S37)

| | 外部账户 (externally owned account, EOA) | 合约账户 (contract account) |
|---|---|---|
| 由谁控制 | 私钥 (private keys) | 部署的代码 (deployed code) |
| 能否主动发起交易 | 能：私钥可以生成签名 | 不能：只在被调用时按代码行事 |
| 有没有私钥 | 有 | 没有，至少不像 EOA 那样持有私钥 |
| 地址 | 20 字节 | 20 字节 |

S37 还补充了两点：两种账户都用 **20 字节的地址**（地址怎样从密钥推出来，Week 3 讲）；一笔交易可以**转 ETH**，也可以**调用合约代码**。老师指出，区分这两种账户有助于**定位权力 (locate authority)**：一个账户能做什么、凭什么做——凭私钥签名，还是凭一段代码的逻辑。

### 4.3 智能合约：代码、状态和规则 (S38)

S38 的四条要点：

- 合约在一个**地址**上存放**代码**和**持久化的状态 (persistent state)**；
- 一笔交易**触发一次函数调用**；
- **gas** 计量计算量，**防止无限制地执行**；
- **确定性执行 (deterministic execution)** 让每个验证节点对新状态达成一致。

> **🔑 例：一个最小的"金库"合约** — 下面是用 Solidity 语言写的简化合约（示例代码为笔记补充）：
>
> ```solidity
> contract Vault {
>     mapping(address => uint) public balances;   // 持久化状态：每个地址存了多少
>
>     function deposit() external payable {       // 调用时附带 ETH
>         balances[msg.sender] += msg.value;      // 记账
>     }
> }
> ```
>
> Alice 发一笔交易调用 `deposit()`，附带 1 ETH。每个验证节点都在自己的 EVM 里执行这几行代码，都给 `balances[Alice]` 加上 1 ETH，得到同一个新状态（图 10）。§5.3 会给它加一个有漏洞的 `withdraw()` 函数。

**gas 是什么？** 每执行一步运算、每存一份数据，都要消耗一定量的 gas，由用户用 ETH 支付。老师说，给别人转 ETH 时要付的交易费，就是这么来的。

> 📎 **拓展(超出 slides)：为什么必须给计算"计价"** — EVM 能运行任意程序，可以写循环，而计算机科学里有一个著名的结论（**停机问题 halting problem**）：没有办法提前判断任意一个程序会不会永远跑下去。如果没有 gas，一个死循环合约就能让全世界的节点一起卡住。有了 gas，每笔交易都要预先设一个 **gas 上限 (gas limit)**，用完就强制停止，已做的状态修改全部撤销，但已消耗的 gas 费照付——节点的计算毕竟已经做了。

**边界：确定性 ≠ 正确。** 这是老师在 Week 3 开头特别强调的一点。确定性执行保证所有节点算出**一样**的结果，却不保证结果是**对**的。如果合约里有逻辑错误，每一个验证节点都会**一致地执行同一个漏洞**。共识让漏洞被忠实地复制到全网——这就是第 5 节要专门讨论智能合约风险的原因。

> 📎 **拓展(超出 slides)** — 合约一经部署，代码通常就改不了了。有些项目为了能修 bug，把合约设计成**可升级的 (upgradeable)**，由一把管理员密钥控制升级，这又带来了新的风险——§5.5 的小练习就是这种情况。

### 4.4 Ethereum 用 Proof of Stake (S39)

S39 的五条要点：

- **验证者 (validators)** 把 ETH 锁定为**质押 (stake)**；
- 一个**提议者 (proposer)** 提出区块，其他验证者为它**投票证明 (attest)**；
- **奖励 (rewards)** 鼓励正确地参与；
- **惩罚 (penalties)** 打击不诚实或不在线的验证者；
- **最终性 (finality)** 让人确信已接受的区块不会再变。

老师补充：PoS 免去了 PoW 那样的大量计算，但**仍然依赖经济和网络方面的假设**。

和 PoW 对照着看最清楚：

| | PoW (Bitcoin) | PoS (Ethereum) |
|---|---|---|
| 稀缺资源 | 算力（矿机 + 电力） | 锁定的 ETH |
| 谁来出块 | 先解出哈希谜题的矿工 | 被选中的提议者 |
| 作恶的代价 | 电费白花，奖励也拿不到 | 质押的 ETH 被罚没 |
| 最终性 | 概率性的：确认越多越可靠 | 有明确的最终确定点 |

> 📎 **拓展(超出 slides)** — 几个具体数字：成为验证者需要质押 **32 ETH**；时间被切成 12 秒一个的**时隙 (slot)**，每个时隙选一个提议者，32 个时隙组成一个**轮次 (epoch)**；区块通常在约两个 epoch（约 13 分钟）后被最终确定。验证者如果对同一个时隙签了两个相互冲突的区块，它的质押会被**罚没 (slashing)**，这对应 S39 的 "dishonest"；只是掉线，罚得较轻，对应 "unavailable"。要推翻一个已最终确定的区块，至少要有三分之一的质押被罚没——又是 §3.3 拜占庭将军的那条"三分之一线"。

### 4.5 Bitcoin 和 Ethereum 解决的是不同问题 (S46)

| | Bitcoin | Ethereum |
|---|---|---|
| 首要目标 | 数字货币 (digital money) | 可编程的共享状态 (programmable shared state) |
| 账本模型 | UTXO 模型 + 保守的脚本 (conservative scripting) | 账户 + 智能合约 (accounts + smart contracts) |
| 共识 | Proof of Work | Proof of Stake |

老师总结：两者的**首要目标不同**，这个选择又影响了它们的账户模型、脚本能力和共识方式。Ethereum 起初也用 PoW，后来改成了 PoS；Bitcoin 直到今天仍然使用 PoW。

> 📎 **拓展(超出 slides)** — "保守的脚本"指 Bitcoin Script 故意设计得很受限，比如不支持循环：能表达的逻辑少，攻击面也就小。EVM 能运行任意程序，表达力强，风险也随之变大。两种设计在功能和安全之间的取舍正好相反。

<details>
<summary>自测 1：一个合约在全网所有节点上的执行结果完全一致，能不能说明它没有漏洞？</summary>

不能。确定性只保证"一致"，不保证"正确"。有漏洞的合约会在每个节点上一致地执行同一个漏洞，共识反而让错误被忠实地写进了历史。

</details>

<details>
<summary>自测 2：PoW 里，攻击者作恶要付出什么代价？PoS 里呢？</summary>

PoW：攻击者要投入相当规模的算力（矿机和电费），还要放弃本来能拿到的诚实挖矿奖励。PoS：攻击者必须锁定大量 ETH 作为质押，作恶（例如签两个相互冲突的区块）会被罚没质押。两者都把"作恶"变成一件经济上不划算的事。

</details>

## 5. 网络安全失效发生在哪里？

技术讲完了，现在把它接回网络安全。回忆引子里的那句话：一笔有效的交易仍然可能是有害的。问题是，害处从哪一层来？

### 5.1 跨越五层的威胁模型 (S40)

**威胁模型 (threat model)** 是一份系统化的分析：系统由哪些部分组成、攻击者可能从哪里下手、各会造成什么后果。老师说，好用的区块链威胁模型**从用户开始，一直延伸到外部依赖**。S40 把它分成五层：

| 层 | S40 列出的风险 | 本章里的例子 |
|---|---|---|
| **用户与密钥 (User & key)** | 钓鱼、恶意软件、私钥丢失、恢复机制差 | 引子里被骗签名的用户（图 1） |
| **应用 (Application)** | 合约逻辑和访问控制缺陷 | §5.3 的四类合约漏洞 |
| **协议 (Protocol)** | 共识、激励和升级治理 | §3.6 的 51% 攻击 |
| **基础设施 (Infrastructure)** | 节点、网络、API 和端点 | §1.3 说的钱包、节点服务商 |
| **依赖 (Dependencies)** | 跨链桥、预言机、托管方和稳定币发行方 | §5.4 |

老师强调，**一次事件可能同时跨越好几层**，所以必须分层地看。把它和 S4 的五层对照一下：S4 按系统**由哪些部件组成**来分（密钥、交易、合约、共识、桥），S40 按**攻击面**来分，还把基础设施单独拎了出来——它不属于协议本身，却是攻击者最爱下手的地方（§1.3）。

### 5.2 私钥是一种运营安全风险 (S41)

S41 有五条，逐条看：

1. **被盗的私钥，看起来和合法授权一模一样。** 老师说，数字签名证明的是"某把私钥批准了这笔交易"，而不是"主人本人有这个意图"。攻击者拿到你的私钥，签出来的交易在协议看来完全合法，你拦不住他。
2. **私钥丢失，可能意味着永久锁死。** 回忆 §2.3：没有银行柜台能帮你重置。
3. **恶意软件和社会工程常常绕过协议。** 攻击者根本不用破解密码学，他们骗你，或者感染你的电脑，直接拿到私钥。
4. **防御手段**：**硬件隔离 (hardware isolation)**、**多重签名 (multisig)** 和**经过验证的备份 (verified backups)**。
5. **签名之前，永远先核对目标地址和交易内容。**

> 📎 **拓展(超出 slides)：把防御手段说具体** — **硬件钱包 (hardware wallet)** 把私钥存放在一个独立的小设备里，签名在设备内完成，私钥从不离开设备，电脑中了毒也偷不走它。**多重签名**要求 n 把私钥里至少有 m 把同时签名（例如 3 选 2），只偷到一把私钥还不够。**经过验证的备份**指不光要备份（比如抄下**助记词 seed phrase**），还要真的用备份恢复一次，确认它能用。常见的"绕过协议"手法有：仿冒的钱包应用、要你输入助记词的钓鱼网站、偷偷把剪贴板里的收款地址换成攻击者地址的恶意软件——最后这种正是第 5 条要你"签名前核对地址"的原因。

老师还给了一条实用建议：如果怀疑私钥泄露了，**第一件事就是把余额全部转到一个新的、安全的地址**，必须抢在攻击者之前转走。

> 📎 **拓展(超出 slides)：真实案例** — 2025 年 2 月，交易所 Bybit 被盗了价值约 15 亿美元的 ETH，是迄今规模最大的加密货币盗窃案之一。据公开调查，攻击者没有破解任何密码学：他们入侵了 Bybit 所用多签钱包服务的前端界面，签名人在屏幕上看到的是一笔正常的转账，实际签下的却是一笔把钱包控制权交给攻击者的交易。多签用上了，最终失守的恰恰是第 5 条：签名人没能核对出自己真正签的是什么。

### 5.3 智能合约放大了软件风险 (S42)

合约代码本质上是软件，所以有普通软件的老问题；它又直接掌管着钱，所以风险被**放大**了。S42 列出四类典型漏洞，以及防御原则。

> 📎 **拓展(超出 slides)：为什么说"放大"** — 合约代码是公开的，攻击者可以慢慢研究；它直接持有资产，漏洞一被利用，钱就没了；它自动执行，没有人工复核；部署后难以修补；交易一旦确认又无法撤回（见引子）。

**1. 访问控制失效 (broken access control)。** 本该只有管理员能调用的函数，忘了加权限检查：

```solidity
function mint(address to, uint amount) external {   // 漏了 onlyOwner：任何人都能调用
    totalSupply += amount;
    balances[to] += amount;                          // 攻击者可以给自己凭空印钱
}
```

**2. 价格预言机操纵 (price-oracle manipulation)。** 合约需要知道某个资产的价格（比如判断抵押品值多少钱），就要从预言机读取数据。如果它读的价格来源容易被操纵，攻击者就可以先把价格砸低或拉高，在价格失真的那一瞬间和合约交易。

> 📎 **拓展(超出 slides)** — 典型手法是**闪电贷 (flash loan)**：一种在同一笔交易里借出、又在同一笔交易里还清的巨额无抵押贷款。攻击者借来巨款，在一个流动性很浅的交易池里大量买入，把价格暂时抬高；借贷合约恰好以这个池子的即时价格当预言机，于是高估了攻击者的抵押品，借给他远超实际价值的资产。防御办法是采用一段时间内的平均价格，或者聚合多个独立的价格来源。

**3. 逻辑错误和缺少输入校验 (logic errors and missing input validation)。** 和普通软件一样：边界条件没考虑到、比较符号写反、没检查参数是否合法（比如没检查转账金额是否大于 0、是否超过余额）。区别在于，这里的每个 bug 都直接对应着真金白银。

**4. 重入和未检查的外部调用 (reentrancy and unchecked external calls)。** 这是区块链上的经典漏洞。给 §4.3 的金库加一个提款函数：

```solidity
function withdraw() external {
    uint amount = balances[msg.sender];
    (bool ok, ) = msg.sender.call{value: amount}("");   // ① 先把 ETH 转给调用者（外部调用）
    require(ok);
    balances[msg.sender] = 0;                            // ② 最后才记账——太晚了
}
```

问题出在顺序上：合约**先转账、后记账**。如果调用者本身是一个攻击合约，它收到 ETH 时会自动执行一段回调代码，而在这段代码里，它可以**再次调用 `withdraw()`**。此时第 ② 行还没执行，账上的存款记录仍是 1 ETH，于是金库又转出 1 ETH……如此反复，直到金库被掏空（图 11）。

```d2 图 11 · 重入攻击：金库"先转账、后记账"，攻击合约在收款回调里一次次重新调用 withdraw()
shape: sequence_diagram
A: "攻击合约 Attacker"
V: "金库合约 Vault"
A -> V: "① 调用 withdraw()，存款记录是 1 ETH"
V -> A: "② 先转出 1 ETH（外部调用）"
A -> A: "③ 收到 ETH，自动执行回调代码"
A -> V: "④ 在回调里再次调用 withdraw()"
V -> A: "⑤ 记录还没清零，又转出 1 ETH"
A -> V: "⑥ ……如此反复，直到金库见底"
V -> V: "⑦ 最后才把记录改成 0：太晚了"
```

修复方法是调换顺序：**先检查、再记账、最后才和外部交互**（*checks-effects-interactions* 模式），也就是把 `balances[msg.sender] = 0` 挪到转账之前，或者加一把防止重入的锁。**未检查的外部调用**是同一家族的另一个问题：有些写法在外部调用失败时只返回一个 `false` 而不报错，代码如果不检查这个返回值，就会把失败当成成功，继续往下执行。

> 📎 **拓展(超出 slides)** — 2016 年的 **The DAO** 事件就是重入攻击：攻击者从这个众筹合约里取走了约 360 万枚 ETH。社区最终决定硬分叉，把被盗资金"改回去"；不同意这么做的人留在了原来的链上，那条链就是今天的 Ethereum Classic。这也说明：在区块链上撤回一笔交易，需要整个社区改写历史，代价极大。

S42 给出的防御原则是：**最小权限 (least privilege)**、**测试 (testing)**、**代码审查 (review)**、**监控 (monitoring)** 和**恢复预案 (recovery plans)**。

### 5.4 跨链桥和预言机把信任集中到了一处 (S43)

S43 的四条：

- **跨链桥 (bridge)** 控制着跨链转移的资产或消息；
- **预言机 (oracle)** 提供区块链自己观察不到的外部事实；
- 它们一旦被攻破，**本来正确的链上逻辑也会被绕过**；
- 应当把两者当作**特权依赖 (privileged dependencies)**，并**限制爆炸半径 (limit the blast radius)**。

为什么需要它们？老师解释：区块链没法直接看到外部世界的价格；A 链也没法直接验证 B 链上发生了什么。这些组件把信息和资产带进系统，自己也就成了**高价值的信任边界 (trust boundaries)**。只要外部数据或管理员密钥被攻破，链上代码完全正确也照样会出事。这和 §1.7 的苹果例子是同一条边界：链管得了链上，管不了链外。

> 📎 **拓展(超出 slides)：跨链桥怎样工作、怎样出事** — 最常见的是"锁定—铸造 (lock-and-mint)"：你在 A 链把 10 ETH 锁进桥合约，桥的验证者确认之后，在 B 链给你铸造 10 枚"包装 ETH"。这里有一条必须时刻成立的**不变量 (invariant)**：B 链上的包装币总量 ≤ A 链上锁定的总量。谁控制了桥的验证者密钥，谁就能在没有锁定的情况下铸币。2022 年 3 月的 **Ronin 跨链桥**事件正是如此：这座桥由 9 个验证者签名放行、需要其中 5 个同意，攻击者拿到了 5 把密钥，盗走了约 6 亿美元的资产，而且过了好几天才被发现。"限制爆炸半径"的做法包括：给单笔和单位时间内的转移量设上限、分散验证者密钥、聚合多个独立的预言机来源。

### 5.5 小练习：沿着各层追踪一次失效 (S44)

S44 给了一个场景（课上跳过了，留作练习）：

> 攻击者偷到一把**管理员密钥 (admin key)**，用它**升级了跨链桥合约**，**铸造出没有抵押支撑的代币 (unbacked tokens)**，并在运营方反应过来之前把它们**换成了其他资产**。
>
> 哪一层失效了？什么遥测数据 (telemetry) 能发现它？哪种控制措施能限制损失——又有哪些东西是真正能追回的？

**参考答案**（slides 只提了问题，下面是按本章框架推出的一种答案）。先把攻击链画出来，见图 12。

```d2 图 12 · 小练习的攻击链（橙色）跨越了三层，每一环都有能拦住它的控制措施（蓝色）
direction: down
a1: "① 用户与密钥层\n偷到 admin 私钥" {class: warn}
a2: "② 应用层\n用它升级跨链桥合约" {class: warn}
a3: "③ 应用层\n铸造无抵押的代币" {class: warn}
a4: "④ 依赖层（损失外溢）\n在交易池换成真实资产" {class: warn}
a1 -> a2 -> a3 -> a4
c1: "多签 + 硬件隔离" {class: good}
c2: "升级 timelock\n+ 监控 admin 操作" {class: good}
c3: "铸币上限 + 不变量监控\n+ 暂停开关" {class: good}
c1 -> a1: 拦截
c2 -> a2: 拦截
c3 -> a3: 拦截
```

**哪一层失效了？** 不止一层，这正是练习的用意。

- **用户与密钥层**最先失守：管理员私钥被盗，属于运营安全问题（钓鱼、恶意软件或保管不当）。
- **应用层**有设计缺陷：单独一把密钥就能升级合约，没有多签、没有延迟，这是访问控制的问题。
- **依赖层**扩散了损失：跨链桥是许多协议和用户共同依赖的特权组件，无抵押代币流进交易池，损失落到了从没碰过这把密钥的人身上——这就是引子里说的"安全外部性"。
- 值得注意的是，**密码学和共识都没有失效**：每一笔交易都签名有效，共识也忠实地把它们写进了历史。

**什么遥测能发现它？**

- 管理员密钥的异常使用：新设备、陌生 IP、非工作时间的操作；
- 链上的合约升级事件——任何一次升级都应该触发告警；
- **供应量不变量**被打破：包装代币的总量突然超过另一条链上锁定的抵押品总量；
- 大额铸币、大额兑换、交易池价格剧烈偏移等异常资金流动。

**哪种控制能限制损失？**

- 管理员权限改为**多签**，并用硬件隔离密钥，一把密钥被盗不足以升级合约；
- 给升级加**时间锁 (timelock)**：升级要等一段时间（比如 48 小时）才生效，留出发现和否决的窗口；
- 给铸币设**上限和速率限制**，即使被攻破，单位时间内能铸造的数量也有限；
- 准备**暂停开关 (pause)**，监控发现异常时立即冻结桥合约；
- 把"升级权"和"铸币权"交给不同的密钥，也就是**最小权限**。

**哪些能追回？** 坦白说，很少。已确认的链上交易无法撤回（见引子）；能做的主要是**止损**：暂停桥合约，阻止继续铸币；如果被换走的是 USDT、USDC 这类中心化稳定币，发行方可以冻结攻击者的地址；交易所可以冻结流入的赃款；剩下的只能靠链上追踪、执法机构和谈判追讨。这个答案本身就说明了 S45 为什么要求**在失败发生之前**就设计好恢复方案。

### 5.6 分层防御：不止于密码学 (S45)

S45 的标题就是本章最后的观点：**分层防御不止于密码学 (layered defence goes beyond cryptography)**。小练习里，密码学每一步都正常工作，系统还是丢了钱。防御措施分成两组：

| 预防 (Prevent) | 检测与响应 (Detect & Respond) |
|---|---|
| 隔离并分散密钥权限 (isolate and distribute key authority) | 监控管理员操作和异常资金流动 (monitor admin actions and abnormal flows) |
| 尽量减少权限和外部信任 (minimise privileges and external trust) | 快速暂停、控制事态、对外沟通 (pause, contain and communicate quickly) |
| 测试不变量，独立审查代码 (test invariants and review code independently) | 在失败之前设计好升级和恢复方案 (design upgrades and recovery before failure) |

对照小练习：多签和硬件隔离对应"隔离并分散密钥权限"；把升级权和铸币权分开对应"尽量减少权限"；供应量不变量既是要"测试"的对象，也是要"监控"的指标；暂停开关和时间锁则是"在失败之前就设计好"的响应能力。预防总有疏漏的时候，所以检测和响应同样不可或缺。

<details>
<summary>自测：一个用户在钓鱼网站上签了一笔授权交易，攻击者随后把他钱包里的代币全部转走了。这次事件主要涉及威胁模型的哪一层？S41 和 S45 里哪些措施最直接有用？</summary>

主要是**用户与密钥层**：钓鱼让用户签了不该签的交易。如果钓鱼网站冒充的是某个应用的前端，也牵涉**基础设施层**（端点）。最直接有用的是 S41 的"签名前核对目标地址和交易内容"，以及硬件钱包这类隔离手段（签名时在设备屏幕上核对交易）。如果被盗的是机构的资产，S45 的"监控异常资金流动"和"快速暂停、控制事态"可以缩小损失。

</details>

## 本章小结 (Key takeaways)

S47 用六句话收尾，分为"系统基础"和"可编程性与安全"两组。下面逐条展开，并补上 PoW 一条：

- **区块链共享的是一段可验证的历史。** 它是一份共享的、只能追加的账本，由多个节点按共同的规则维护；哈希链接让篡改可被发现，但"可验证"不等于"真实"——垃圾进，垃圾出。
- **Bitcoin 防止了数字世界里的双花。** 签名只能证明授权，不能排序；Bitcoin 靠 PoW 和共识让全网对交易顺序达成一致，同一笔钱只能花一次。
- **共识负责处理相互冲突的视图。** 共识要求诚实节点满足 agreement、validity 和 termination；节点故障、网络延迟和没有全局时钟让它很难，不可能性结果迫使协议引入假设，所以 Bitcoin 的安全是概率性的、依赖假设的。
- **PoW 让出块开销大、验证开销小。** 矿工不断尝试 nonce，让区块哈希低于目标值；每多一个确认，改写历史就更难，但永远不是不可能。
- **Ethereum 加入了可编程的状态。** EOA 由私钥控制，合约账户由代码控制；gas 限制计算量，EVM 的确定性保证全网结果一致——但一致不等于正确。
- **风险横跨密钥、代码、协议和依赖。** 一笔有效的交易仍然可能是有害的；一次事件常常同时跨越好几层，攻击者往往挑最薄弱的一层下手。
- **防御需要预防、检测和响应三者兼备。** 密码学只是其中一层；密钥管理、最小权限、监控、暂停机制和恢复预案同样不可或缺。
