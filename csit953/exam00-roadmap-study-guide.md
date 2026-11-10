# CSIT953 考试复习 · 第 0 章 考试导航与答题方法

> 📚 **来源** — W13 slides（考试安排、Exam Scope / Key Topics、样题）；W1 slides 的考核规则；W13 录音的复习部分；W5 录音里关于算法名的问答。

这本手册按第 13 周公布的考试范围组织，一个考点一章。本章先说明考试的形式和范围，再说明三类题各该怎样答，最后拆解老师给的唯一一道样题。

## 1. 考试形式 (W13 S4–S8; W1 Assessment)

| 项目 | 内容 |
|---|---|
| 时长 | 3 小时 |
| 形式 | 闭卷、纸笔，不许带任何资料，不许用计算器 |
| 总分 | 50 分，占课程总成绩的 50%；期末考试至少要拿到 40%，否则课程按不及格处理 |
| 第一部分 | 15 道单选题，15 分 |
| 第二部分 | 填空题和简答题，21 分 |
| 第三部分 | 问答题（questions and answers），14 分 |

几条规则：

- 按题号顺序作答，不要跳着写在答题纸的不同位置。
- 所有答案都写在答题纸上。写在试卷或其他地方的答案不给分。单选题也一样，在试卷上圈了选项，还要誊到答题纸上。
- 题目要求解释时，只写关键词可能拿不到满分，要把理由写清楚。
- 考试中不能和任何人交流，有问题举手找监考。身体不适的话申请 academic consideration，不接受邮件交卷。

## 2. 考试范围与本手册章节 (W13 S9–S12)

考纲分三组，每组四条。下表"考纲原文"一列照抄 slides，答题时尽量用这些原词。

| 组 | 考纲原文 | 考什么 | 章 |
|---|---|---|---|
| Blockchain and Cryptography | Blockchain and Smart Contracts | ledgers, consensus mechanisms, Ethereum transactions and oracles | 第 7 章 |
| | Cryptocurrency Wallets | private keys, deterministic wallets and mnemonic phrases | 第 8 章 |
| | Cryptographic Hashes and Message Authentication Codes | security properties and their different uses | 第 1 章 |
| | Diffie–Hellman Key Exchange | how a shared secret is established and why authentication matters | 第 2 章 |
| Network Security | HTTPS, TLS and Digital Certificates | certificate trust, validity and secure connections | 第 4 章 ★样题 |
| | SSH Security | protecting remote login and understanding port forwarding | 第 5 章 |
| | Wireless Network Security | secure configuration and protection against impersonated access points | 第 6 章 |
| | Authentication Protocols | recognising weaknesses in protocols used over an insecure channel | 第 3 章 ★必考问答 |
| Applied Security Topics | Secure Cloud Storage and Data Sharing | confidentiality, integrity, access control | 第 9 章 ★ |
| | Secure Two-Party Computation | what each participant may learn | 第 10 章 |
| | Software Supply Chain Security | risks from third-party components in CI/CD pipelines | 第 11 章 |
| | Virtual Machines and Containers | how their isolation models differ | 第 12 章 |

考纲没有列出的内容，放在附录（第 13 章）里做速览，用来应付可能出现的单选题：第 1 周导论、第 8 周后半的 IoT、第 10 周的静态与动态分析、第 12 周的远程办公与勒索软件。附录里还有一套按真题结构出的模拟卷。

## 3. 老师透露的信息

> 👨‍🏫 **课堂强调** — 以下几条来自第 13 周的复习课和第 5 周的问答：
>
> - 单选题每题只有一个正确答案，老师说"很简单"。
> - 问答部分**一定有一道认证协议题**：给出第 6 周的某个识别协议，问它是否安全，为什么。
> - 云存储那道题和 Assignment 2（Secure File Share）直接相关，认真做过小组作业就能答。
> - 题目大多直接出自 slides，少数内容只在录音里讲过。
> - 算法名字不用全记，但要认得出旧的、不安全的算法：DSS、RC4、3DES、只用 CBC 的模式、SHA-1。

据此，带 ★ 的三章（第 3、4、9 章）最值得多花时间。第 3 章的问答几乎可以确定会出；第 4 章对应唯一的样题；第 9 章可以用自己的作业设计来答。

## 4. 三类题怎样答

### 4.1 单选题

- 先看题干里有没有 NOT、TRUE、BEST、MAINLY 这类词，再看选项。
- 用排除法。带 always、completely、never 这类绝对说法的选项，多半是错的。
- 本课最常见的陷阱是把相近的工具混为一谈：哈希和加密、MAC 和签名、认证加密和防重放、VM 和容器的隔离边界。每章的"⚠️ 易混易错"就是为这类题准备的。

### 4.2 填空与简答

- 填空用 slides 上的英文原词，例如 offline dictionary attack、chain code、evil twin、trust store，不要自己换说法。
- 简答一般写 2–4 句：第一句给定义或结论，第二句讲机制，第三句给后果或例子。
- 题目问"why"，答案里要出现 because 引出的原因，不能只列名词。

### 4.3 问答题：写出推理链

考试说明特意写了"只写关键词可能拿不到满分"。问答题要的是一条完整的推理链。课程里的问答题大致有四种问法，各有一个可以套用的结构：

| 问法 | 答题结构 |
|---|---|
| 这个协议 / 设计安全吗？为什么？ | ① 说明攻击者能做什么（窃听、篡改、重放、拿到服务器数据库）② 给出结论：对哪种攻击不安全 ③ 一步步写出攻击过程 ④ 指出根本原因 ⑤ 给出修补办法 |
| 你会怎样保护 X？能否抵抗某种攻击？ | ① 分步骤写方法 ② 每一步说明它提供哪个安全目标 ③ 分析攻击者为什么得手不了 ④ 写出前提条件和局限 |
| 比较 A 和 B | ① 逐个维度对比（可以先画个小表）② 写结论：什么情况下选哪个 |
| 每一方能知道什么？ | ① 逐个参与方列出：自己的输入、协议的输出，以及从这两者能推出的东西 ② 说明除此之外学不到任何东西，以及为什么 |

问答题常用的英文句式：

```text
This protocol is not secure against an eavesdropper / an active attacker, because ...
An attacker who observes ... can replay ... to impersonate Alice.
The root cause is that ... is not bound to ... / is not fresh.
This provides integrity and authenticity, but not confidentiality, because ...
To fix this, Bob should send a fresh random challenge r, and Alice should reply with ...
This assumes that the attacker cannot obtain the private key / the root CA is trusted.
Compared with A, B ... ; therefore B is preferred when ...
```

## 5. 样题拆解 (W13 S13)

> *You want to send a message to your friend Alice via an application. However, you find that this application uses the HTTP protocol. How will you secure this communication? Describe your method and analyze whether it can resist a man-in-the-middle (MITM) attack.*

这道题考三件事：HTTP 的问题在哪里，HTTPS / TLS 怎样解决，以及为什么证书能挡住中间人。它用到第 2 章（DH 为什么需要认证）和第 4 章（证书和 TLS 握手）。下面先给一份满分范答，作为问答题该写到什么程度的样板；第 4 章会逐句解释它。

> ✍️ **English answer（model answer）** —
> Plain HTTP sends messages in cleartext and does not authenticate the server, so anyone on the path can read, modify or inject messages. I would secure the communication by using HTTPS, i.e. HTTP over TLS 1.3.
>
> 1. The server obtains a certificate from a trusted certificate authority (CA). The certificate binds the server's domain name to its public key and is signed by the CA.
> 2. In the TLS handshake, the client and the server perform an ephemeral (EC)DH key exchange to establish a fresh shared secret. The server signs the handshake with the private key that matches its certificate.
> 3. The client verifies the certificate: the chain leads to a root CA in its trust store, the domain name matches, the certificate is within its validity period and not revoked. It then verifies the server's signature over the handshake, which proves that the server holds the private key.
> 4. Both sides derive symmetric session keys from the shared secret and protect every message with authenticated encryption such as AES-GCM, which gives confidentiality and integrity.
>
> MITM analysis: an attacker in the middle can intercept the key exchange, but cannot present a valid certificate for the server's domain signed by a trusted CA, and cannot sign the handshake without the server's private key. The client detects this and aborts the connection, so the attack fails. Unauthenticated Diffie–Hellman alone would not resist MITM, because the attacker could run one key exchange with each side and relay the messages. The protection still depends on assumptions: the user must not ignore certificate warnings, no malicious root CA may be installed in the trust store, and the server's private key must stay secret. If I also do not trust the chat server, Alice and I can add end-to-end encryption so that only our two devices hold the message keys.

这份答案的结构就是 §4.3 表格的第二行：先指出问题，再分步骤给方法，每一步说清作用，然后分析攻击为什么失败，最后写前提和局限。

## 6. 怎样用这本手册

每章的结构相同：

1. 🎯 考纲和题型 → 📚 来源。
2. 中文正文。每节末尾有一段 ✍️ English answer，是可以直接写上考卷的英文。
3. ⚠️ 易混易错 → 📝 Practice（英文，三类题都有，答案折叠）→ 本章小结。

建议的用法：先读中文正文弄懂原理；再把每节的 English answer 读到能用自己的话写出来；最后不看答案，在纸上做 Practice，写完再展开对照。时间紧的话，按 ★ 的顺序复习：第 3 章 → 第 4 章（连同第 2 章）→ 第 9 章 → 其余各章。

章节按知识依赖排列：先学工具（第 1、2 章：哈希、MAC、DH），再学用这些工具的协议（第 3–6 章：认证协议、TLS、SSH、Wi-Fi），最后学系统（第 7–12 章：区块链、钱包、云存储、两方计算、供应链、虚拟化）。前面的章节讲过的内容，后面只写一句并注明出处，不再重讲。
