# Week 8 · Text Analysis(文本分析)

> **CSCI446/946 Big Data Analytics** — University of Wollongong, Spring 2026
> 本讲义融合 `Week8_Lecture_Text_Analysis_SP-2026.pdf`(71 页 slides)、Week 8 课堂录音转录,以及 Week 9 录音的开头部分。
> Slides 中的图表、表格与代码,除特别注明外均出自教材 *Data Science and Big Data Analytics: Discovering, Analyzing, Visualizing and Presenting Data*(EMC Education Services)。
>
> **关于录音**:Week 8 的课讲到 slide 60(Summary)就结束了。讲师说剩下几页"留到下周,不想一下子塞给你们太多新术语",于是在 Week 9 开课时补讲了 slides 61–70(Latest Development)。§29–§32 里的 🎙️ 引用出自 Week 9 录音。
>
> **标记说明**:🔑 = 例题 / 手算;🎙️ = 讲师课上讲了、slides 上没有的内容(按考试范围对待);📎 = 超出 slides 和课堂的拓展,为补足理解而加;⚠️ = 易错点,或 slides / 录音里的笔误。录音转写里有不少误识别(比如把 bag-of-words 转成了 "backwards model"),对照表放在讲义末尾。

---

> **学习目标 (Learning objectives)** — 读完本章你应该能够:
>
> - **说清 text analysis 是什么、难在哪里**:维度高(curse of high dimensionality)、unstructured,以及语言在 syntax、semantics、pragmatics 三个层面的歧义,还有 homonyms 和 acronyms;
> - **解释什么是 corpus**,能判断常见文本来源属于 unstructured、semi-structured 还是 quasi-structured;
> - **复述文本分析的六步流程**:collect raw text → represent text → TFIDF / topic modeling / sentiment analysis → gain insights;
> - **说明 text normalization 每一步做什么、会出什么错**:tokenization、case folding、stop words、stemming 与 lemmatization;
> - **手工把文档写成 bag-of-words 向量**,并说出 BoW 丢掉了哪些信息;
> - **默写 IC、TF(三种)、DF、IDF(两种)和 TFIDF 的公式**,解释 TFIDF 为什么能取代 IC,并能手算 TFIDF;
> - **陈述 Zipf's law**,说出它对文本表示的启示;
> - **给出 topic 的正式定义**(a distribution over a fixed vocabulary),说明 topic model 比 TFIDF 强在哪里;
> - **复述 LDA 的生成过程**(slides 上"做菜"的 recipe 和正式写法)、四条假设、α 与 β 的作用,以及 collapsed Gibbs sampling 的五个步骤;读懂 slides 上的 R 代码;
> - **把 sentiment analysis 建模成分类问题**,复述 NLTK 影评例子,说出三条注意事项:不能跨 domain 直接用、要看相对水平、大量数据怎么打标签;
> - **列举文本分析结果的可视化方式**:word cloud、TFIDF 高亮、两种 topic 图;
> - **解释 one-hot 编码的缺陷和 word embedding 的两条性质**(语义相近的词向量相近;向量差能编码关系),区分 word embedding 与 contextual embedding;
> - **描述文本分析的演进**:从 task-specific models 到 LLMs,再到 semantic search、RAG 和 AI agents,并说出始终不变的目标。

---

## 开篇:从"别人给好的表格"到"一堆文字"

到上周为止,这门课讲的都是分析**技术**:Week 4 的 clustering,Week 5 的 classification,Week 6 的 regression,Week 7 的 association rules。Slide 2 先回顾了上周的内容:

> **Recap: Association Rules** — An unsupervised learning method. Descriptive, not predictive. Discover interesting, hidden relationship, represented as rules or frequent itemsets. Commonly used for the analysis of transactions.

讲师重申了两点:一是用 support、confidence、lift、leverage 这些指标找规则,分 frequent itemset mining 和 rule mining 两步走,并靠 Apriori 的 downward closure property 和规则的 anti-monotone property 加速;二是规则要把数据给出的客观结果和领域专家的主观判断结合起来,才能被利益相关方理解,也才能付诸行动。

讲师接着说,从这一讲起课程转向**应用**:这周讲文本,下周讲图像。理由很朴素:文本和图像是我们收集信息的主要来源,每天都有海量的文本和图像产生出来,所以值得专门分析。

转向应用,最先遇到的是一个前几周从没碰到过的问题。回想你在 lab 和 Assignment 1 里拿到的数据:一个 CSV 文件,每行是一条记录,每列是一个 attribute。讲师点破了这件事的意义:

> 🎙️ "*我已经把表示方式给你们定义好了。比如学生,就用身高、体重、性别、WAM、国籍等等来表示。这些都是我预先定义的。*"

学生、公司、大学这类对象,可以用一组预先定义好的属性来描述。可一条推文、一篇影评、一封邮件,该用哪些"列"来描述? 讲师把这类数据叫作 **perceptual data(感知数据)**:我们听到的、看到的、说出的、写下的东西。这类数据很难事先定义好特征;就算定义了,也未必是最好的表示。

> 🎙️ "*这个问题困扰了整个机器学习、自然语言处理、图像处理领域几十年,直到深度学习出现。深度神经网络最重要的优势,是能从大规模数据中自动学到表示,在某种意义上是最优的表示,而不是由我们或工程师凭经验来定义。*"

所以本章的主线是 **representation(表示)**:怎样把一段文字变成计算机能计算、能比较的向量。你会看到一条清楚的演进路线:最朴素的 bag-of-words → 加了权重的 TFIDF → 用"主题"压缩维度的 topic model → 能表达词义的 word embedding → 能结合语境的 contextual embedding。表示一旦就绪,前几周学过的 clustering 和 classification 就能直接拿来用。

全章围绕 slide 8 的一个场景展开:

> **A company would like to monitor what is being said about its products in social media:** Are people mentioning its products? What is being said? Good or bad?

一家公司想知道社交媒体上的人怎么谈论它的产品:有没有人提到? 说的是好话还是坏话? 讲师说,这是每家公司都想拿到的信息。回答这两个问题的流程就是本章的目录:

```d2
direction: right
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
c: "① Collect Raw Text\n收集原始文本\n(§6)"
r: "② Represent Text\n表示文本\n(§7–§10)"
t: "③ TFIDF\n(Part III)" {class: key}
m: "④ Topic Modeling\n(Part IV)" {class: key}
s: "⑤ Sentiment Analysis\n(§23–§25)" {class: key}
g: "⑥ Gain Insights\n(§26)"
c -> r
r -> t
r -> m
r -> s
t -> g
m -> g
s -> g
```

讲师按图上的顺序逐个讲:先收集数据,因为"*没有数据,做不了任何真正的事*";然后讨论表示,从 bag-of-words 讲到 TFIDF;再问一句"能不能直接用主题来表示文档",引出 topic model;在这些表示之上做 sentiment analysis;最后看怎样从结果中得到洞察。

他也交代了本讲的定位:重点仍是**传统的文本分析**,最后几页(本讲义 Part VI)才简要介绍 word embedding、contextual embedding 和 large language models(LLMs,大语言模型)。理由是:

> 🎙️ "*要看清今天基于大语言模型的文本分析好在哪里,我们必须先懂基础。懂了基础,才能真正体会大语言模型为什么这么有用,也才能理解我们从传统文本分析走到最新技术的这段旅程。*"

---

# Part I · 文本分析是什么,难在哪里

## §1 Text analysis 与 corpus

Slide 4 给出了定义:

> **Text analysis (text analytics) — refers to the representation, processing, and modelling of textual data to derive useful insights.**

定义里的三个动词正好对应本章的三块内容:**representation(表示)** 把文字变成向量;**processing(处理)** 清洗、规范化原始文本;**modelling(建模)** 在表示之上用统计或机器学习模型做分析。目标是 *derive useful insights*。讲师提醒,这个目标从第一讲起就没变过:big data analytics 始终是从数据中挖掘信息和洞察,换成文本也一样。

同一页 slide 指出了文本分析的两个先天难点。

**第一,curse of high dimensionality(维度灾难)。** 讲师的解释很直观:翻开 Oxford 或 Longman 词典,里面有成千上万个词。如果用"含有哪些词"来描述一篇文档,每个词占一维,最后得到的就是一个维度极高的向量。他特别说明,这个问题"*至少对传统方法是这样*";Part VI 的 embedding 正是为了摆脱它。

> 📎 **拓展(超出 slides)** — 维度高带来两个具体麻烦。其一是**稀疏**:一篇几百词的文档只用到词典里很小一部分词,向量里绝大多数位置是 0。其二是**样本需求**:维度越高,要学到可靠的规律就需要越多的样本,数据量跟不上时,模型容易学到噪声。§9 的 bag-of-words、§17 的 topic model 都会回到这一点。

**第二,文本大多是 unstructured(非结构化)的。** Slide 4 下方的红字说明了原因:

> *Text is unstructured because it lacks predefined schema, consistency, and explicit semantics, unlike structured data in databases. Instead, it's free-form, context-dependent, and ambiguous — requiring preprocessing to turn into structured representations suitable for analysis.*

逐条看:**没有预定义的 schema**,一段文字没有"列",不像数据库表那样事先规定好每个字段;**没有一致性**,同一件事可以有无数种说法;**没有显式的语义**,哪个词是什么意思、在句子里起什么作用,没有任何标注。讲师的说法是:"*我们并不确切知道这段文字是什么意思、每个词是什么意思、每个词起什么作用,所以说它是非结构化的。*" 正因如此,文本必须先经过预处理,转成结构化的表示,才能拿去分析。这也是 Part II 要做的事。

做文本分析,起点通常是一个 **corpus(语料库,复数 corpora)**:

> **Corpus — a collection of texts (documents) used for various purposes in Natural Language Processing.**

讲师说得更直白:corpus "*就是一个数据集*",只不过里面的每条数据是一篇文档。Slide 5 列出了几个著名的 corpus:

| Corpus | Word Count | Domain |
|---|---|---|
| Shakespeare | 0.88 million | Written |
| Brown Corpus | 1 million | Written |
| Penn Treebank | 1 million | Newswire |
| Switchboard Phone Conversations | 3 million | Spoken |
| British National Corpus | 100 million | Written and spoken |
| NA News Corpus | 350 million | Newswire |
| European Parliament Proceedings Parallel Corpus | 600 million | Legal |
| Google N-Grams Corpus | 1 trillion | Written |

规模从不到一百万词到一万亿词,领域覆盖书面语、口语、新闻和法律文本。Slide 底部的红字给了一个今天的参照:**GPT-3 的训练数据大约有 300–500 billion 个 tokens(约 225–375 billion 个词)**。讲师补充说,GPT-3 已经不是最新的模型了;到 GPT-4、GPT-5 这一代,他估计训练语料达到 20–30 trillion 的量级(OpenAI 没有公布官方数字,这里只看数量级)。结论是:大语言模型离不开规模巨大的 corpus。

> ⚠️ 讲师口头说 GPT-3 的训练语料是"大约 2000 亿到 3000 亿个词",和 slide 的数字不一致。考试以 slide 为准:300–500 billion tokens,约合 225–375 billion words。
>
> 📎 **token 和 word 的换算(超出 slides)** — token 是 tokenization(§7)切分出来的单位,可能是一个完整的词,也可能只是词的一部分。英文里 1 个 token 平均约合 0.75 个词,slide 上两组数字就是这么换算的:$300 \times 0.75 = 225$,$500\times0.75=375$。

文本从哪里来? Slide 6 列了八类来源,并标出了各自的数据结构类型:

| Data Source | Data Format | Data Structure Type |
|---|---|---|
| Articles | TXT, HTML, PDF, scanned PDF | Unstructured |
| Literature | TXT, DOC, HTML, PDF | Unstructured |
| E-mail | TXT, MSG, EML | Unstructured |
| Web pages | HTML | Semi-structured |
| Server logs | LOG, TXT | Semi-structured or Quasi-structured |
| Social network API | XML, JSON, RSS | Semi-structured |
| Call center transcripts | TXT | Unstructured |
| Voice recognition software | TXT | Unstructured |

这张表用到了 Week 2 的四种数据结构类型。

> 📎 **回顾 Week 2(超出本周 slides)** — **Structured** 数据有固定的行和列(数据库表、CSV);**semi-structured** 数据自带标签,能看出字段,比如 XML、JSON;**quasi-structured** 数据是格式不规则的文本,花些功夫才能解析成结构化数据,典型例子是网站的点击流和日志;**unstructured** 数据没有内在结构,比如普通文档、PDF、图像和视频。

用这四个概念再看表里的几处:网页有 HTML 标签,标题、段落、链接都看得出来,但正文本身仍是自由文本,所以算 semi-structured;服务器日志每行大致遵循固定格式(时间、IP、请求),但各系统的格式不统一,所以是 semi- 或 quasi-structured;社交网络 API 返回 JSON 或 XML,"作者""时间"这些字段是结构化的,"正文"字段仍是自由文本。

讲师还补充了两个文本来源:你对 Siri 说"帮我订酒店、买机票",语音会被转成文本;养老院的护士每天用自由文本记录老人的情况,这也是文本数据。"*文本数据无处不在。*"

## §2 Text mining:老方法,新对象

文本分析具体用什么方法? Slide 7 的回答是:

> **Text mining — Clustering and classification techniques can be adapted to text mining. For example: cluster documents into groups; classify texts for sentiment analysis. Utilises various methods and techniques: statistical analysis, information retrieval, Natural Language Processing.**

这句话说明,文本分析没有另起炉灶。讲师举例:一旦把文档表示成向量,就可以用 K-means 或 hierarchical clustering 把文档分组(Week 4),也可以用 Naïve Bayes、k-nearest neighbor 或 logistic regression 给文档分类(Week 5、Week 6),比如判断一条评论是正面还是负面,这就是 **sentiment analysis(情感分析)**。

Slide 列出的三类技术里,statistical analysis 和 NLP 好理解。**Information retrieval(信息检索)** 讲师解释为:你有一个查询或问题,要从数据库里找出满足查询的文本,它可以是一条推文、一条评论,也可以是一份法律文件。

所以,本章真正新的东西不是算法,而是**表示**:

```d2
direction: right
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
raw: "原始文本\n推文 · 评论 · 文档"
rep: "表示 representation\n文档 → 向量\n(本章重点)" {class: key}
clu: "Clustering\nK-means · hierarchical\n(Week 4)"
cls: "Classification\nNaïve Bayes · kNN · logistic\n(Week 5、6)"
ir: "Information retrieval\n按查询找文本"
raw -> rep
rep -> clu
rep -> cls
rep -> ir
```

Slide 7 底部的红字预告了这个领域最近的变化:

> *In the era of LLMs, sentiment analysis has shifted from lexicons and feature-based classifiers to prompting, fine-tuning, and few-shot learning with pretrained language models. The workflow is simpler, more robust to context, and far more powerful—making LLM-based approaches the new mainstream.*

> 📎 **拓展(超出 slides)** — **Lexicon(情感词典)方法**给每个词预先打一个情感分,比如 great +3、terrible −3,把一段文字里的词分加起来,就是它的情感倾向。**Feature-based classifier** 就是 §24 要讲的做法:先把文本变成特征向量,再训练分类器。红字里的 prompting、fine-tuning、few-shot learning 属于 LLM 的用法,§30 会讲到。

## §3 对人来说的难点①:syntax、semantics、pragmatics

动手计算之前,先想一个问题:理解一段文字,连人都要跨过哪几道坎? Slide 9 把它分成三个层面。

**Syntax(句法)concerns the sentence structure and the rules of grammar.** 讲师说,每种语言都有 syntax,编程语言也不例外。你必须遵守它,否则别人听不懂你,编译器也编译不了你的代码。Slide 的例子:

- "The dog chased a rabbit through the pasture."
- "The through pasture the chased a dog rabbit."

第一句一读就懂;第二句用的是同样的词,只是不守语法,读起来一团乱。

> 📎 **留个伏笔(超出 slides)** — 这两句话用的词完全相同,连出现次数都一样。§9 的 bag-of-words 只记"用了哪些词",会把它们表示成同一个向量。人一眼能分辨的差别,最朴素的表示方法完全看不见。

**Semantics(语义)is the study of the meaning of sentences.** 语法正确,不代表意思清楚。讲师说:"*有时你读得通,语法也对,每个词都认识,却还是不知道它在说什么。*"

> 📎 **经典例子(超出 slides)** — 语言学家 Noam Chomsky 造过一个句子:"Colorless green ideas sleep furiously."(无色的绿色想法狂怒地睡觉)语法上无可挑剔,语义上却说不通。它常被用来说明 syntax 和 semantics 是两回事。

**Pragmatics(语用)concerns the meaning of sentences in a certain context.** 同一句话,换个语境意思就变了。Slide 的例子是 "Break it down.":可能是叫人把一栋楼推倒,也可能是请人把一个商业概念讲得浅显些。讲师补充了一个场景:"*你的报告太复杂了,能不能 break it down,简化成几个要点?*" 他还举了 "you have the green light":字面上是交通灯变绿,更常见的意思是"你可以放手去做了"。

| 层面 | 关心什么 | 例子 | 出错时的表现 |
|---|---|---|---|
| Syntax | 句子结构、语法规则 | dog chased a rabbit vs. 打乱语序 | 读不通 |
| Semantics | 句子本身的意思 | 📎 Colorless green ideas sleep furiously | 读得通,却不知所云 |
| Pragmatics | 句子在特定语境中的意思 | "Break it down." "You have the green light." | 字面懂了,意图理解错了 |

三个层面越往下越依赖语境。讲师在这里埋了一个伏笔:

> 🎙️ "*你会在今天课的最后看到,contextual word embedding 是一大进步。和传统的文本表示相比,它在表示一个词时,会把这个词前后的词都考虑进去,因为同一个词的意思可能完全不同。*"

这就是 §29 的 contextual embeddings。

## §4 对人来说的难点②:homonyms、acronyms 与 disambiguation

Slide 10 讲的是**词这一级**的歧义。

**Homonyms(同形异义词)are words that have the same spelling but have different meanings.** Slide 的例子:

- dog bark(狗叫)vs. tree bark(树皮);
- "I **left** my phone on the **left** side of the room."——前一个是 leave 的过去式,后一个是"左边";
- Amazon:可以是亚马逊河、亚马逊公司,也可以是亚马逊雨林。

**Acronyms(缩写)are abbreviated versions of words.** 讲师说,用缩写是为了省时间、省篇幅,代价是容易混淆。Slide 的例子是 CGI:可以指 Common Gateway Interface,也可以指 Computer Graphics Interface。Slide 还留了个问题:"TSIG" 是什么意思?

> 📎 **拓展(超出 slides)** — 这个问题的答案就是"取决于语境"。在网络领域,TSIG 通常指 DNS 的 Transaction SIGnature(一种给 DNS 消息签名的机制);换到别的机构里,同样四个字母可能是另一个组织的内部缩写。CGI 在影视行业更常见的意思其实是 Computer-Generated Imagery(电脑生成图像)。一个缩写有三种常见意思,正好说明问题有多普遍。

**Disambiguation(消歧)narrows down the meaning of words or acronyms.** 消歧靠的是**上下文**:bark 旁边是 dog 还是 tree,Amazon 旁边是 river、shopping 还是 rainforest,意思就清楚了。人做这件事几乎不费力;让计算机做到,要等到 §29 的 contextual embeddings。

## §5 对计算机来说:文本只是一串数字

前两节说的是人理解文字时的难点。换成计算机,情况更糟。Slide 11:

> **To a computer: text is merely a sequence of characters encoded as numbers.**
> "Hello" → [72, 101, 108, 108, 111] → stored as: 01001000 01100101 01101100 01101100 01101111

讲师解释:五个字符各对应一个 ASCII 码,每个码用一个字节(8 个比特)存储。"*对计算机来说,一切都只是 0 和 1。它不知道这些比特是文本还是图像,是苹果还是香蕉。*" 一个文本分析算法真正"看到"的,就是这些 0 和 1。

由此有两个后果。第一,计算机**不理解 syntax、semantics,也不理解 pragmatics**:§3、§4 讲的那些层次,在一串比特里都看不出来。第二,也是更要命的一点:

> **In raw form there is no "natural" similarity metric between words or texts. → Cannot perform clustering nor classification.**

讲师把它和前几周联系起来:做 clustering,得先能衡量两个向量有多相似,比如用 Euclidean distance 或 cosine similarity。原始的 0/1 序列没有这样天然的度量。

> 📎 **一个小实验(超出 slides)** — 看看字符编码能不能代表词义。"cat" 的编码是 [99, 97, 116],"car" 是 [99, 97, 114],两个序列只差最后一个数,意思却毫不相干;"kitten" 的编码 [107, 105, 116, 116, 101, 110] 和 "cat" 差得很远,意思却非常接近。编码上的远近和语义上的远近没有关系。

所以 slide 11 的结论是:**There is thus a need to represent and process text in a form suitable for clustering or classification.** 讲师说这是本讲要讨论的第一个重要问题:

> 🎙️ "*你会看到,表示是模式识别、机器学习的核心问题。下周讲图像分析时,你还会再遇到它。*"

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
  bad: {style: {stroke-dash: 4}}
}
raw: "原始文本 Hello"
code: "字符编码\n72 101 108 108 111"
bits: "比特 01001000 …\n没有天然的相似度" {class: bad}
rep: "表示 representation\nBoW · TFIDF · topics · embeddings" {class: key}
task: "clustering · classification\n有了相似度才能做"
raw -> code: "计算机实际存的"
code -> bits
raw -> rep: "本章要做的事"
rep -> task
```

---

# Part II · 收集与表示文本

## §6 第一步:收集原始文本

> **For text analysis, data must be collected before anything can happen.**(slide 12)

回到开篇的公司:它想知道网上的人怎么评价自己的产品。Slide 12 建议的做法是:

- **主动监控**与业务相关的各类网站,收集上面的 **user-generated contents(用户生成内容,UGC)**,比如评论、帖子、推文;
- 工具是 **public APIs**,或者 **web scraper / crawler(网页爬虫)**,讲师说要"*成批、大规模地下载,确保数据够用*";
- **预期拿到的是 unstructured 或 semi-structured 数据**,对应 §1 的那张表;
- **Be careful about the rights of the owner.**

最后一条讲师特意展开:用 API 或爬虫大规模下载时,要遵守网站自己定的规则。有的网站不允许大规模下载,"*你会发现你的 API 或程序被封掉*"。

> 📎 **拓展(超出 slides)** — API 和爬虫的区别:**API** 是网站官方提供的数据接口,返回 JSON 之类的 semi-structured 数据,通常要申请 key,有调用频率限制;**爬虫**直接下载网页再解析 HTML,更灵活,也更容易违反网站条款。动手前先看网站的 `robots.txt` 和服务条款(terms of service)。如果数据涉及个人信息,在澳大利亚还要考虑 *Privacy Act 1988* 的要求。

## §7 Tokenization:把文本切成词

数据收集来以后,slide 13 说:**Raw text needs to be transformed with text normalization techniques.** 为什么要 normalization(规范化)? 讲师的回答是:原始文本里"*有太多噪声,太多我们不想带进后续分析的干扰*"。

规范化由一串步骤组成,§7–§8 逐个讲,§9 把结果变成向量:

```d2
grid-rows: 2
grid-columns: 3
horizontal-gap: 60
vertical-gap: 50
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
raw: "Raw text\n原始文本"
tok: "① Tokenization\n切成词(§7)"
case: "② Case folding\n统一大小写(§8)"
bow: "Bag-of-words 向量\n(§9)" {class: key}
stem: "④ Stemming 或 Lemmatization\n还原词形(§8)"
stop: "③ Stop words\n去掉停用词(§8)"
raw -> tok
tok -> case
case -> stop
stop -> stem
stem -> bow
```

第一步是 **tokenization(分词)**:

> **Tokenization — the task of separating words from the body of text.**

讲师说,如今人人都熟悉 token 这个词,用大语言模型时你会关心自己用掉了多少 token。这里的 tokenization 就是把一句话、一段话或一整篇文档**切成一个个词**,因为后面要用词来表示文档。

最简单的做法是**按空格切**。讲师的例子:"That day is a great day." 按空格切,会得到 `day` 和 `day.` 两个不同的 token。它们是同一个词,却被当成了两个。

改进一步,**按空格和标点一起切**:`day.` 变成 `day` 和 `.`,句号自成一个 token,问题解决。可新的问题又来了:slide 举的 `we'll` 和 `state-of-the-art`,一按标点切就被拆散了。

讲师说,你以为这下解决了? "*没有,它比你想的复杂得多。*" Slide 的两个例子:

- **Back of Bourke**:澳大利亚的说法,指偏远、离哪儿都很远的地方(Bourke 是新南威尔士州内陆的一个小镇)。按空格切成 `Back`、`of`、`Bourke` 三个 token,"偏远之地"这层意思就没了。它应该作为一个整体出现。
- **résumé vs. resume**:résumé 是简历,resume 是"继续"。规范化时如果顺手去掉重音符号,意思就变了。

| 原文 | 按空格切 | 按空格 + 标点切 | 问题 |
|---|---|---|---|
| That day is a great day. | …, `day`, …, `day.` | …, `day`, …, `day`, `.` | 按空格切,把 `day` 和 `day.` 当成两个词 |
| we'll | `we'll` | `we`, `'`, `ll` | 缩写被拆坏 |
| state-of-the-art | `state-of-the-art` | `state`, `-`, `of`, `-`, `the`, `-`, `art` | 复合词被拆散 |
| Back of Bourke | `Back`, `of`, `Bourke` | 同左 | 固定说法被拆成三个普通词 |
| résumé | `résumé` | `résumé` | 若再去掉重音,变成 resume,意思变了 |

所以 slide 的结论是 **No one-size-fits-all tokenization scheme**:没有一种切法适用于所有情况。讲师补充说,好在有不少写好的流行方案,可以直接拿来用。

> 📎 **拓展(超出 slides)** — 不同工具的约定也不同。比如 NLTK 的 `word_tokenize` 把 "didn't" 切成 `did` 和 `n't`,这是 Penn Treebank 的惯例;另一些工具会保留 `didn't` 不切。

Slide 13 底部的红字介绍了 GPT 用的方案:

> *GPT models use byte-level Byte Pair Encoding (BPE) tokenization, with a fixed vocabulary (~50k tokens). This allows them to handle virtually any text input — from common words to code, emojis, and rare characters — by breaking text into subword units.*

讲师解释,这是一种更高级的方案,固定词表大约有 5 万到 10 万个 token。遇到从没见过的新词,就把它拆成词表里有的 **subword(子词)**,所以"*它不会漏掉任何词,哪怕是以前没见过的词*"。

> 📎 **BPE 的思路(超出 slides)** — Byte Pair Encoding 从最小的单位(byte-level 版本从 256 个字节)出发,反复做一件事:统计语料中哪一对相邻符号一起出现得最多,就把它合并成一个新符号加入词表,直到词表达到预定大小(比如 5 万)。结果是:常见词(the、data)本身就是一个 token;罕见词被拆成几段常见的片段。因为基础符号包含了全部 256 个字节,任何字符串都能被表示出来,不会出现"词表里没有"的情况。

## §8 Case folding、stop words、stemming 与 lemmatization

### Case folding(大小写归一)

> **Case folding — reduces all letters to lowercase (or uppercase).**(slide 14)

把 The 和 the 当成同一个词,听起来是件小事。讲师提醒:"*没那么简单,有些词一改大小写,意思就变了。*" Slide 列了几个反例:

- **General Motors**(通用汽车公司)变成 general motors,就成了两个普通词;
- **WHO**(世界卫生组织)变成 who(谁);
- **US**(美国)变成 us(我们)。

对策是 **create a lookup table of words not to be case folded**:维护一张查找表,列出不能改大小写的词。

### Stop words(停用词)

> **Not all the words from a given language may need to be considered. "the, a, of, and, to, …" which are not likely to contribute to semantic understanding.**(slide 15)

讲师解释:为了让句子合乎语法,我们必须用 the、of、and、to 这些词,但它们几乎不携带信息。所以文本分析里通常把它们删掉,这些词就叫 **stop words**。

> 📎 **当心否定词(超出 slides)** — 常用的停用词表(比如 NLTK 的英文表)里有 not、no、nor 这类否定词。做主题分析时删掉它们问题不大;做情感分析时删掉,"not good" 就变成了 "good",意思完全反了。停用词表要按任务来选。后面的 🔑 例子会碰上这个问题。

### Stemming 与 lemmatization(词干提取与词形还原)

walk、walks、walked、walking 是同一个词的不同形式。如果不处理,BoW 会把它们当成四个不相干的词。Slide 15 给了两种还原的办法:

> **Stemming:** cuts words down to their root form by chopping off endings, often roughly.
> **Lemmatization:** reduces words to their dictionary form (lemma) using vocabulary and grammar rules.
> **Key difference:** Stemming is fast but crude (may give non-words), while lemmatization is slower but accurate (gives real words).

Slide 的例子:

- **Walk:** walking, walk, walks, walked, … → walk(stemmed)
- **Goose:** geese, goose, gander, ganders(lemmatized)
- **Good:** good, better(lemmatized)
- 最常用的工具是 **Porter stemmer** 和 **WordNet lemmatizer**。

讲师的解释:stemming 遇到词就把词尾砍掉,"*粗略地砍*",所以快,但粗糙;lemmatization 借助词表和语法规则,把词还原成词典里的形式,所以准,但慢。geese 砍不出 goose,只有查词典才知道 geese 是 goose 的复数;better 也只有查词典才知道它是 good 的比较级。

| | Stemming | Lemmatization |
|---|---|---|
| 做法 | 按规则砍掉词尾 | 查词表、用语法规则,还原成 dictionary form(lemma) |
| 结果一定是真词吗 | 不一定(📎 Porter 把 studies 变成 studi) | 是(studies → study) |
| 能处理不规则变化吗 | 不能(geese 砍不出 goose) | 能(geese → goose,better → good) |
| 速度 | 快 | 慢 |
| 常用工具 | Porter stemmer | WordNet lemmatizer |

Slide 顶部的红字给了实用建议:

> *Choose one: stemming (fast but rough) or lemmatization (slower but accurate). In modern NLP with embeddings/LLMs, you may not need either, since models handle word forms internally.*

两者选一个即可,看你更在乎速度还是准确度。讲师补充:用大语言模型做 NLP 时,两个都可以不用,模型在内部就能处理词形变化。

> 📎 **拓展(超出 slides)** — Stemming 的"粗"有时会把不相干的词并到一起:Porter stemmer 把 university 和 universe 都变成 univers,这叫 over-stemming。Lemmatization 的"慢"来自它需要知道词性:WordNet lemmatizer 默认把词当名词处理,只有告诉它 better 是形容词,它才会还原成 good。判断词性本身就要额外的计算。
>
> ⚠️ **关于 gander** — 严格说,lemmatizer 会把 ganders 还原成 gander,不会还原成 goose:gander 是"公鹅",本身就是一个 lemma。Slide 把四个词放在一组,用意是说明 lemmatization 能处理 geese 这种不规则变化,而 stemming 做不到。讲师口头也说"把 geese、goose、gander、ganders 都变成 goose"。考试按 slide 的例子答即可。

> **🔑 例:把一条评论走完整个规范化流程**(📎 句子为本讲义所设,取材自 slide 53 的 "buttons did not work" 评论)
>
> 原文:`The buttons on my new bPhone did not work. Returning it to ACME!`
>
> | 步骤 | 结果 | 发生了什么 |
> |---|---|---|
> | Tokenization(按空格 + 标点) | `The` `buttons` `on` `my` `new` `bPhone` `did` `not` `work` `.` `Returning` `it` `to` `ACME` `!` | 句号、感叹号各自成为 token |
> | Case folding(查找表保留 ACME),去掉标点 | `the` `buttons` `on` `my` `new` `bphone` `did` `not` `work` `returning` `it` `to` `ACME` | ACME 是公司名;小写的 acme 是"顶峰",所以放进查找表 |
> | 去掉 stop words | `buttons` `new` `bphone` `work` `returning` `ACME` | the、on、my、did、**not**、it、to 都在常用停用词表里 |
> | Stemming(Porter) | `button` `new` `bphone` `work` `return` `ACME` | buttons → button,returning → return |
>
> 最后剩下 {button, new, bphone, work, return, ACME}。注意 **not 没了**:原句是在抱怨按键失灵,剩下的词里却有 work,看上去甚至有点正面。每一步规范化都在降噪,也都可能丢信息。做情感分析时,应该把否定词留下来。

## §9 Bag-of-words:把文档变成向量

规范化之后,手里是一串整理好的词。下一步是把一篇文档变成一个向量。讲师先介绍最简单的一种,"*简单,但在传统 NLP 里依然有效*"。

> **Bag-of-words representation** — Simple yet widely used to represent text. Represent a document as a set of terms (words), ignoring other information (such as order, context, inferences, and semantics). "a dog bites a man" same as "a man bites a dog". A naïve and over-simplified approach but is still considered a good approach to start with.(slide 16)

名字很形象:把文档里的词全倒进一个**袋子**,摇一摇。词序没了,上下文没了,推理和语义也没了,只剩下"袋子里有哪些词"。讲师说,忽略词序的直接后果就是 slide 上那两句话得到同一个表示:"a dog bites a man"(狗咬人)和 "a man bites a dog"(人咬狗)。新闻价值天差地别,BoW 却分不出来。§3 的两句 dog-chased-rabbit 也一样。

明知有这么大的缺陷,为什么还要学? Slide 16 底部的红字回答了:

> *BoW is still relevant as a teaching tool, baseline model, or for small/simple NLP projects. But for state-of-the-art NLP, embeddings and LLMs have largely replaced it.*

讲师补充了一个实际场景:你手上有一批公司内部数据,想训练一个 Naïve Bayes 或 support vector machine 做情感分析,就可以从 BoW 起步。"*它非常简单,不需要 GPU,也许你的笔记本电脑就够了。*"

具体怎么变成向量? Slide 17:

> **A document becomes a high-dimensional vector, indicating the presence/absence/frequency of various words in this document.**

做法是先准备一本**词典(dictionary)**,里面列出所有可能用到的词;然后对每个词检查它是否在文档里出现:出现记 1,没出现记 0。讲师说,假如词典有 20,000 个词,每篇文档就是一个 20,000 维的向量,而且"*绝大多数位置是 0*"。这就是 §1 说的高维和稀疏。也可以不记 0/1,改记**出现次数**,这就是 frequency 版本的 BoW。

> **🔑 例(slides 18–19):三篇文档的 BoW**
>
> 一个很小的 corpus,只有三篇"文档":
>
> - D1: *The quick brown fox.*
> - D2: *The best of times.*
> - D3: *my quick study of lexicography helped.*
>
> 词不多,不需要两万词的大词典,直接用这三篇文档里出现过的词组成一本 11 个词的小词典(顺序按 slide 18):the, brown, fox, quick, times, of, best, my, study, lexicography, helped。逐个词检查是否出现,得到 slide 19 的三个特征向量:
>
> | | the | brown | fox | quick | times | of | best | my | study | lexicography | helped |
> |---|---|---|---|---|---|---|---|---|---|---|---|
> | **D1** | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
> | **D2** | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
> | **D3** | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 1 |
>
> 即 D1 = (1,1,1,1,0,0,0,0,0,0,0),D2 = (1,0,0,0,1,1,1,0,0,0,0),D3 = (0,0,0,1,0,1,0,1,1,1,1)。注意两点:D1、D2 里的 "The" 经过 case folding 都记在 the 这一列;这个例子**没有**删除停用词,the 和 of 都留着。

这样的行列表格叫 **document-term matrix(文档-词矩阵)**:每行一篇文档,每列一个词。讲师说,这只是个玩具例子;文档多起来以后,词典会变得很长,也更有表达力。

有了向量,终于可以计算相似度了。这正是 §5 说的、原始比特做不到的事。可算一算就会发现一个问题:

> 📎 **BoW 的相似度被谁主导了?(超出 slides)** — 用 cosine similarity $\cos(\mathbf{u},\mathbf{v})=\dfrac{\mathbf{u}\cdot\mathbf{v}}{\lVert\mathbf{u}\rVert\,\lVert\mathbf{v}\rVert}$ 比较三篇文档。D1 和 D2 只共享 the,D1 和 D3 只共享 quick,点积都是 1。$\lVert D1\rVert=\lVert D2\rVert=\sqrt4=2$,$\lVert D3\rVert=\sqrt6\approx2.449$,于是
>
> $$\cos(D1,D2)=\frac{1}{2\times2}=0.25,\qquad \cos(D1,D3)=\frac{1}{2\times2.449}\approx0.204$$
>
> 按 BoW 算,D1 最像 D2,理由只是两篇都有一个 the。在 0/1 表示里,**每个词的分量都一样**:the 和 lexicography 各算 1。这显然不合理,下一节就来处理它。

> 📎 **稀疏存储(超出 slides)** — 向量里绝大多数是 0,实际存储时只记非零项,也就是"(词的编号, 次数)"这样的对。§22 R 实例里的 `cora.documents` 就是这么存的。

## §10 词的分量不一样:information content

讲师从 0/1 的 BoW 往下推:"*每个词都只看出现与否,等于每个词被同等对待。可事实不是这样。*" 一个是 the,一个是 computer,哪个携带的信息多? 显然是 computer。

文本分析早期就意识到了这一点。Slide 20:

> **Representation of a corpus** — A corpus is a collection of documents. Some corpora include the **information content** of every word in its metadata.
> **Information content (IC)** — A metric denotes the importance of a term in a corpus. Terms with higher IC values are more important.

IC 的公式写在 slide 的红字里:

$$\text{IC}(x)=-\log P(x)$$

其中 $P(x)$ 是在数据集中观察到 $x$ 的概率。红字的解释是:*In NLP, Information Content (IC) quantifies how much information a token, word, or concept contributes, based on its probability in the dataset.*

这个公式怎么读? $P(x)$ 在 0 和 1 之间,它的对数小于等于 0,前面加个负号就变成非负数。越常见的词,$P(x)$ 越接近 1,$-\log P(x)$ 越接近 0;越罕见的词,$P(x)$ 越小,IC 越大。一句话:**越意外,信息越多**。讲师的说法是:the、and 这类词几乎到处出现,观察到它们的概率很高,IC 就很低;某个专门的技术词也许只出现一两次,概率很小,IC 就高得多,它带来的是具体、独特的信息。

> **🔑 例:算几个词的 IC**(📎 以 2 为底,单位是 bit;概率取自 slide 5 表里的 Brown Corpus)
>
> 在一百万词的 Brown Corpus 里,the 约占全部词次的 7%,of 约占 3.5%(📎 这是 Brown Corpus 的经典统计)。再假设一个罕见词 lexicography 的概率是百万分之一:
>
> | 词 | $P(x)$ | $\text{IC}(x)=-\log_2P(x)$ |
> |---|---|---|
> | the | 0.07 | 3.84 bits |
> | of | 0.035 | 4.84 bits |
> | lexicography | 0.000001 | 19.93 bits |
>
> 概率每缩小一半,IC 增加 1 bit。
>
> ⚠️ 讲师口头说 the 的概率"接近 1,比如 0.8",那是在强调它几乎处处出现;按词次算,the 约占 7%。两种口径结论相同:越常见,IC 越低。

> 📎 **为什么用对数(超出 slides)** — 两个独立事件同时发生的概率是两个概率相乘,取对数后乘法变加法:$-\log(P_1P_2)=-\log P_1-\log P_2$。所以 IC 有个好性质:独立事件的信息量可以直接相加。

讲师介绍了 IC 当年的用法:人们在一个足够大的参考 corpus 上把每个词的 IC 算好,作为 metadata 和 corpus 一起分发,用的人就不必自己重算。

问题恰恰出在"算好了一起分发"上。Slide 21:

> **However, information content (IC) cannot satisfy the need to analyse dynamically changing, unstructured data.** Two problems:
> - Both traditional corpora and IC metadata do not change over time.
> - Traditional corpora limits the knowledge used for a text analysis algorithm to what is covered in the corpus. New topics and concepts would not be recognized.

讲师展开说:IC 是作为 metadata 分发的,所以它是**固定的**。数据集变了怎么办? 你用的是自己的数据集怎么办? 这些预先算好的 IC 都用不上了。词的意思、词携带的信息也会随时间改变;旧的 corpus 里没有新词、新短语,新话题和新概念也就识别不出来。

> 📎 **例子(超出 slides)** — 一个 2000 年编成的 corpus 里没有 COVID-19、ChatGPT、RAG 这些词。按 IC 的公式,它们的 $P(x)=0$,IC 根本没法算。另一种情况是领域差异:university 在一般新闻里算是有信息量的词,在 UOW 自己的文档里却到处都是,几乎不带信息(§14 讲师的例子)。

所以,我们需要一个**能从任何给定数据集算出来、能随数据集变化的指标**。讲师说,这就是 term frequency 和 inverse document frequency 的动机。

---

# Part III · TFIDF:局部与全局

## §11 我们需要一个随数据而变的指标

Slide 22 给新指标提了要求,也报出了它的名字:

> **Term Frequency – Inverse Document Frequency (TFIDF)**
> - We need a metric that adapts to the context and the nature of text (not like IC).
> - TFIDF is based entirely on all the fetched documents.
> - TFIDF can be easily updated once the fetched documents change.
> - TFIDF is a measure widely used in text analysis.

关键词是 **fetched documents(抓取到的文档)**:TFIDF 完全从你手上的数据算出来,不依赖外部的参考 corpus。数据变了,重算一遍就行。讲师说,TFIDF 比 IC 好,但两者"*联系紧密*";§15 会看到,IDF 本质上就是在你自己的数据上算出来的一种 IC。

| | Information content(IC) | TFIDF |
|---|---|---|
| 从哪里算 | 大型参考 corpus,事先算好,作为 metadata 分发 | 你手上抓取到的文档 |
| 数据变了 | 不变(fixed) | 重算一遍即可 |
| 新词、新话题 | 识别不了 | 只要数据里有,就能算 |
| 衡量什么 | 一个词在整个 corpus 里有多罕见 | 一个词对**某一篇文档**有多重要 |
| 是否依赖具体文档 | 否 | 是(TF 部分依赖) |

TFIDF 由两部分组成:TF 和 IDF。讲师说他会一个一个介绍。

## §12 Term frequency:一个词在文档里出现几次

> **Given a term $t$ and a document $d=\{t_1,t_2,\ldots,t_n\}$, term frequency of $t$ in $d$ is defined as the number of times $t$ appears in $d$.**(slide 23)

这里把文档 $d$ 看成 $n$ 个 token 组成的序列,$t_i$ 是第 $i$ 个 token,同一个词可以重复出现。Slide 23 给了 TF 的三种写法。最基本的一种是:

$$\text{TF}_1(t,d)=\sum_{i=1}^{n}f(t,t_i),\qquad t_i\in d,\ |d|=n$$

$$f(t,t')=\begin{cases}1, & \text{if } t=t'\\ 0, & \text{otherwise}\end{cases}$$

$f$ 是个 **indicator function(指示函数)**:两个 token 相同就取 1,不同就取 0。把文档里每个位置都和 $t$ 比一遍再加起来,结果就是 $t$ 出现的次数。讲师说:"*公式看着复杂,其实不是。你就是数一数 $t$ 在文档里出现了几次。*"

另外两种是在 $\text{TF}_1$ 基础上的变形:

$$\text{TF}_2(t,d)=\log\left[\text{TF}_1(t,d)+1\right]$$

$$\text{TF}_3(t,d)=\frac{\text{TF}_1(t,d)}{n},\qquad |d|=n$$

讲师的说明是:"*如果数值太大,可以取 log,也可以用百分比。*"

- **$\text{TF}_2$ 取对数**,把大的计数压小。一个词出现 20 次,重要性不该是出现 1 次的 20 倍。加 1 是为了让没出现的词($\text{TF}_1=0$)得到 $\log 1=0$,避免出现 $\log 0$。
- **$\text{TF}_3$ 除以文档长度**,得到"这个词占全文的百分之几"。长文档里什么词的次数都会多,除以长度之后,长短不同的文档才能放在一起比。

> **🔑 例:三种 TF 给出的判断不一样**(📎 数字为本讲义所设,对数以 10 为底)
>
> 两篇文档都提到了 data:$d_A$ 共 100 个词,data 出现 10 次;$d_B$ 共 1000 个词,data 出现 20 次。
>
> | | $\text{TF}_1$ | $\text{TF}_2=\log_{10}(\text{TF}_1+1)$ | $\text{TF}_3=\text{TF}_1/n$ |
> |---|---|---|---|
> | $d_A$ | 10 | $\log_{10}11\approx1.04$ | $10/100=0.10$ |
> | $d_B$ | 20 | $\log_{10}21\approx1.32$ | $20/1000=0.02$ |
>
> 按 $\text{TF}_1$,$d_B$ 和 data 的关系是 $d_A$ 的两倍;按 $\text{TF}_2$,只稍高一点;按 $\text{TF}_3$,结论反过来:$d_A$ 每十个词就有一个 data,比 $d_B$ 集中得多。选哪种 TF,取决于你是否希望文档长度影响结果。

## §13 Zipf's law:少数词占了大头

把一个 corpus 里每个词的出现次数从高到低排出来,会看到一个很有规律的现象。Slide 24:

> **Zipf's Law: the $i$-th most common word occurs approximately $1/i$ as the most frequent term.**

用公式写(📎 slide 只有文字),记 $f(r)$ 为排第 $r$ 位的词的出现次数:

$$f(r)\approx\frac{f(1)}{r}$$

排第 2 的词出现次数约为第 1 名的 1/2,排第 3 的约为 1/3,排第 10 的约为 1/10。

Slide 上的图把一个 corpus 的词频从高到低画了出来。讲师读图:最常见的词是 the,出现了九百多次;第二名 and 降到七百以下,之后迅速下降,拖出一条长长的尾巴。Slide 底部的红字是一句总结:*Zipf's law reminds us that language is imbalanced: a few words dominate, while most are rare.* 讲师说,Zipf's law 提醒我们语言里有 **long tail(长尾)**,它可以作为分析文本时的先验知识。

> 📎 **对照一个真实数字(超出 slides)** — §10 提到 Brown Corpus 里 the 约占 7%,of 约占 3.5%,第 2 名差不多正好是第 1 名的一半。图上的 the 与 and 并不严格满足 1/2,Zipf's law 本来就是近似规律。把横轴(排名)和纵轴(次数)都取对数,点大致落在一条斜率为 −1 的直线上,这是检验 Zipf's law 最常用的画法。

Zipf's law 对文本表示有三个直接的启示(📎 这几条联系为本讲义所加):

1. **只看 TF,排在最前面的永远是 the、and、of。** 这些词恰好就是 §8 的停用词。不处理的话,任何文档的"高频词"都差不多。
2. **长尾意味着稀疏。** 词典里绝大多数词都很罕见,每篇文档只用到其中很少一部分,BoW 向量里几乎全是 0。
3. **长尾里的词最有区分度。** 罕见的词 IC 高,下一节的 IDF 也高。

第 1 条引出了下一节的问题。

## §14 TF 的盲点:document frequency

> **An issue with Term Frequency** — The importance of a term is solely based on its presence within a particular document. What if this term frequently appears in every document? Is it still important?
> **We need to have a broader view of the world** — Consider the importance of a term not only in a single document but also in a corpus.(slide 25)

讲师用身边的例子解释:

> 🎙️ "*假如一篇文档里有很多 university,你会觉得 university 很重要。可如果你处理的是卧龙岗大学的文档,就会发现 university 在每篇文档里都高频出现。这说明它只是一个背景词。即使它在一篇文档里出现得很频繁,也不代表它真的有信息量。*"

所以除了看一篇文档内部(**局部视角**),还要看这个词在整个 corpus 里的分布(**全局视角**)。讲师的说法是:"*一个是局部的、窄的视角,一个是全局的、宽的视角,两个都要考虑。*" 全局视角的第一个量是 **document frequency(文档频率)**:

> **Document Frequency of a term — the number of documents in a corpus that contain a term.** Let a corpus $D=\{d_1,d_2,\ldots,d_N\}$.(slide 26)

$$\text{DF}(t)=\sum_{i=1}^{N}f'(t,d_i),\qquad d_i\in D,\ |D|=N$$

$$f'(t,d')=\begin{cases}1, & \text{if } t\in d'\\ 0, & \text{otherwise}\end{cases}$$

把 $f'$ 和上一节的 $f$ 对比一下:$f(t,t')$ 比较的是**两个 token**,数的是 $t$ 在一篇文档里出现了几次;$f'(t,d')$ 检查的是 **$t$ 在不在文档 $d'$ 里**,数的是有几篇文档含有 $t$。一篇文档里 $t$ 出现 1 次还是 100 次,对 DF 的贡献都是 1。讲师总结:"*它就是含有这个词的文档数。*"

| | $\text{TF}(t,d)$ | $\text{DF}(t)$ |
|---|---|---|
| 数什么 | $t$ 在文档 $d$ 里出现几次 | 有几篇文档含有 $t$ |
| 视角 | 局部:一篇文档 | 全局:整个 corpus |
| 取值范围 | 0 到 $n$(文档长度) | 0 到 $N$(文档总数) |
| 和具体文档有关吗 | 有关 | 无关 |

## §15 Inverse document frequency:越罕见,分越高

DF 越大,说明这个词越普遍、越没有区分度。我们想要的是一个"越罕见越大"的量,于是把它倒过来。讲师说:"*我们通常不直接用 DF,而是用 inverse document frequency。*" Slide 27 给了两种写法:

$$\text{IDF}_1(t)=\log\frac{N}{\text{DF}(t)}\qquad\qquad \text{IDF}_2(t)=\log\frac{N}{\text{DF}(t)+1}$$

- **The IDF of a rare term would be high.**
- **The IDF of a frequent term would be low.**
- **IDF solely depends on the DF.**

公式拆开读:$\text{DF}(t)/N$ 是"含有 $t$ 的文档占全部文档的比例",$N/\text{DF}(t)$ 是它的倒数,这就是 *inverse* 的来历。取对数是为了压缩范围:一百万篇文档里只有一篇含有某个词,$N/\text{DF}=10^6$,取 $\log_{10}$ 后是 6。

讲师解释了两个关键情形:

- **罕见词**:DF 小,$N/\text{DF}$ 大,IDF 高。
- **处处出现的词**:DF $=N$,$N/N=1$,$\log 1=0$,IDF 为 0。university 在 UOW 的每篇文档里都出现,IDF 就是 0。

$\text{IDF}_2$ 分母上的 $+1$,讲师说是"*为了保证分母不会变成 0*":如果一个词不在任何抓取到的文档里(比如查询里的新词),$\text{DF}=0$,$\text{IDF}_1$ 就没法算。

> **🔑 例:$N=1000$ 时的 $\text{IDF}_1$**(以 10 为底)
>
> | DF | $N/\text{DF}$ | $\text{IDF}_1$ |
> |---|---|---|
> | 1 | 1000 | 3 |
> | 10 | 100 | 2 |
> | 100 | 10 | 1 |
> | 1000 | 1 | 0 |
>
> 以 10 为底时,$\text{IDF}_1$ 就是"这个词比'篇篇都有'罕见了几个数量级"。

> 📎 **IDF 就是文档级的 IC(超出 slides)** — 把 §10 的 IC 公式用在"一篇文档含有 $t$"这个事件上:这个事件的概率可以用 $\text{DF}(t)/N$ 估计,于是
> $$-\log\frac{\text{DF}(t)}{N}=\log\frac{N}{\text{DF}(t)}=\text{IDF}_1(t)$$
> IDF 正是在**你自己的数据**上算出来的 IC。这就是讲师说两者"联系紧密"的原因,也是 TFIDF 能"随数据而变"的原因。
>
> ⚠️ **$\text{IDF}_2$ 的一个细节(超出 slides)** — 一个词出现在全部 $N$ 篇文档里时,$\text{IDF}_2=\log\frac{N}{N+1}$,是个略小于 0 的负数,而不是 0。语料很小时,$+1$ 的影响很大(见下一节的例子)。实际的软件库用的平滑方式又各不相同(见下一节末尾)。考试按 slide 的两个公式答。

## §16 TFIDF:局部 × 全局

把局部的 TF 和全局的 IDF 乘起来,就是本部分的主角。Slide 28:

> **A measure that considers:** the prevalence of a term within a document (TF); the scarcity of the term over the corpus (IDF).

$$\text{TFIDF}(t,d)=\text{TF}(t,d)\times\text{IDF}(t)$$

> **TFIDF scores a term higher if it appears more often in a document but less in a corpus.**

讲师强调了两点。第一,TFIDF 依赖两样东西:给定的词和给定的文档;其中 IDF 不依赖具体文档,因为它是全局视角,建立在整个 corpus 上。第二,TFIDF 高说明这个词**有区分度(discriminative)**:它"*更具体,集中在这篇文档里*"。

两个因素组合起来,一共四种情况:

| | 在 corpus 里少见(DF 低 → IDF 高) | 在 corpus 里常见(DF 高 → IDF 低) |
|---|---|---|
| **在本文档里常见(TF 高)** | **TFIDF 高**:这篇文档的关键词 | TFIDF 低:背景词,比如 UOW 文档里的 university |
| **在本文档里少见(TF 低)** | TFIDF 中等:顺带提到的专门词 | TFIDF 接近 0:the、of 之类 |

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
df: "DF(t)\n多少篇文档含有 t"
tf: "TF(t, d)\n局部:t 在这篇文档里有多常见"
idf: "IDF(t) = log N / DF(t)\n全局:t 在整个 corpus 里有多罕见"
x: "TFIDF(t, d) = TF × IDF\nt 对文档 d 有多重要" {class: key}
bow: "加权的 BoW 向量\n每一维填 TFIDF 值" {class: key}
df -> idf: "取倒数再取 log"
tf -> x
idf -> x
x -> bow
```

TFIDF 算出来以后怎么用? 讲师让大家回到 §9 的 BoW 表:"*那里不一定只能填 0 或 1。算出 TFIDF 之后,你可以把 1 换成 TFIDF 的值,表示这个词对这篇文档有多重要,而不只是'它出现了'。*" 这个值同时包含局部信息(在这篇文档里出现了几次)和全局信息(在整个 corpus 里有多普遍)。所以**基于 TFIDF 的表示是 BoW 的升级版**。

> **🔑 例 1:在 slides 18–19 的三篇文档上算 TFIDF**(TF 用 $\text{TF}_1$,IDF 用 $\text{IDF}_1$,以 10 为底,$N=3$)
>
> 先数 DF:the 出现在 D1、D2,quick 出现在 D1、D3,of 出现在 D2、D3,这三个词的 DF 都是 2;其余 8 个词各只出现在一篇文档里,DF 是 1。于是
>
> $$\text{IDF}_1=\log_{10}\tfrac{3}{1}\approx0.477\ (\text{DF}=1),\qquad \text{IDF}_1=\log_{10}\tfrac{3}{2}\approx0.176\ (\text{DF}=2)$$
>
> 每个词在每篇文档里最多出现一次,TF 就是 0 或 1,TFIDF 矩阵为:
>
> | | the | brown | fox | quick | times | of | best | my | study | lexicography | helped |
> |---|---|---|---|---|---|---|---|---|---|---|---|
> | **D1** | 0.176 | **0.477** | **0.477** | 0.176 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
> | **D2** | 0.176 | 0 | 0 | 0 | **0.477** | 0.176 | **0.477** | 0 | 0 | 0 | 0 |
> | **D3** | 0 | 0 | 0 | 0.176 | 0 | 0.176 | 0 | **0.477** | **0.477** | **0.477** | **0.477** |
>
> 在 D1 里,brown 和 fox 的分数最高,它们是 D1 独有的词;the 和 quick 在别的文档里也出现过,被降了权。
>
> 这个例子也暴露了一个局限:the 和 quick 得分相同,因为在三篇文档里它们恰好都出现了两次。**只有三篇文档,统计量太少,分不出功能词和实词。** 在一个真实的大 corpus 里,the 几乎出现在每篇文档里,IDF 趋近于 0;quick 只出现在少数文档里,IDF 会高得多。§9 里 "D1 最像 D2" 的虚假相似,在大 corpus 上用 TFIDF 就会消失。
>
> 换成 $\text{IDF}_2$ 再看一眼:DF $=2$ 时 $\log_{10}\frac{3}{3}=0$,DF $=1$ 时 $\log_{10}\frac{3}{2}\approx0.176$。the、quick、of 一下子全变成 0。语料小的时候,$+1$ 的影响非常大。

> **🔑 例 2:讲师的 university 例子,配上数字**(📎 数字为本讲义所设,以 10 为底)
>
> 一个 corpus 有 $N=1000$ 篇 UOW 的文档。其中一篇约 2000 词的文档讲的是 word embedding:
>
> | 词 | $\text{TF}_1$ | DF | $\text{IDF}_1=\log_{10}(1000/\text{DF})$ | TFIDF |
> |---|---|---|---|---|
> | the | 120 | 1000 | 0 | **0** |
> | university | 15 | 1000 | 0 | **0** |
> | student | 8 | 400 | 0.398 | 3.18 |
> | embedding | 12 | 10 | 2 | **24** |
> | word2vec | 4 | 2 | 2.699 | 10.80 |
>
> 出现最多的 the 和 university 得分为 0,它们是背景词。得分最高的是 embedding,这篇文档讲的正是它。word2vec 只出现了 4 次,但全库只有两篇文档提到它,所以排第二。按 TFIDF 从高到低排出来,恰好就是这篇文档的关键词:embedding、word2vec、student。

> 📎 **在 Python 里算 TFIDF(超出 slides)** — 常用的是 scikit-learn 的 `TfidfVectorizer`:
>
> ```python
> from sklearn.feature_extraction.text import TfidfVectorizer
>
> docs = ["The quick brown fox.",
>         "The best of times.",
>         "my quick study of lexicography helped."]
> vec = TfidfVectorizer()           # 默认:转小写、按词切分、平滑 IDF、L2 归一化
> X = vec.fit_transform(docs)       # 3 × 11 的稀疏矩阵
> print(vec.get_feature_names_out())
> print(X.toarray().round(3))
> ```
>
> 它算出来的数和上面手算的**对不上**,这是正常的。它默认用 $\text{idf}(t)=\ln\frac{1+N}{1+\text{DF}(t)}+1$(自然对数,分子分母都加 1,结果再加 1),最后还把每篇文档的向量缩放成长度为 1。各种平滑方式的用意相同:避免除以 0,让常见词降权、罕见词升权。

TFIDF 是传统文本分析的主力。Slide 63 回顾传统方法时,第一个例子就是 "TF-IDF + classifier → document classification"。可它还停留在"一个词一维"的层面。下一部分会看到,这正是它的局限。

---

# Part IV · Topic models 与 LDA

## §17 TFIDF 还不够:为什么需要 topic

讲师在课间休息后这样开场:我们可以用 BoW 表示文档,也可以用 TFIDF 增强 BoW。可 TFIDF 仍然建立在 BoW 之上,"*它只考虑单个的词*"。Slide 29 列出了它的问题:

> **TFIDF approach:**
> - Represents a document $d$ as a high-dimensional vector of $\text{TFIDF}(t,d)$ values.
> - Provides relatively small amount of reduction in description length.
> - Reveals little inter-document or intra-document statistical structure.

三条逐一看。

**仍然是高维向量。** TFIDF 只是给每一维换了个权重,维度还是词典的大小。

**Description length(描述长度)几乎没有缩短。** 描述一篇文档需要多少个数? 用 BoW 是词典大小那么多个(比如两万个);换成 TFIDF,还是两万个。TFIDF 重新分配了权重,没有压缩信息。

**几乎看不出文档之间(inter-document)和文档内部(intra-document)的统计结构。** "文档内部的结构"指哪些词总是一起出现:一篇论文里 neural、network、learning 往往结伴出现,它们说的是同一件事。"文档之间的结构"指哪些文档在谈同一类话题,哪怕用词不完全相同。TFIDF 把每个词当成独立的一维,这两种结构都看不到。

Slide 29 接着给出了出路:

> **Topic models can overcome this problem.** A **topic**: a cluster of words with related meanings that frequently occur together. Each word has a weight inside this topic.

讲师用写作的经验解释为什么"主题"是自然的单位:

> 🎙️ "*你读或写一篇文章时,不会想'我要写这个词',你想的是'我要写这个想法、这个主题'。所以在词和文档之间,还有一个中间的东西。我们能看到词,能看到文档,可主题在我们脑子里,它是隐藏的,但我们知道它在那儿。*"

```d2
direction: down
classes: {
  hidden: {style: {stroke-dash: 4; fill: "#fff8e6"; stroke: "#b8860b"}}
}
doc: "文档 documents(看得见)"
topic: "主题 topics(看不见的中间层)" {class: hidden}
word: "词 words(看得见)"
doc -> topic: "由几个主题按比例混合而成"
topic -> word: "每个主题偏爱一组词"
```

如果能把隐藏的主题找出来,就可以**用主题来表示文档**,而不是用一个个的词。讲师说这样做有两个好处:一是**降维**,一个主题是一簇词,主题的数量远少于词的数量;二是**语义层次更高**,主题告诉你文档在讲什么,比单个词更准确。

Slide 30 给 topic model 下了定义:

> **Topic models are statistical models that:** examine words from a set of documents, determine the themes over the text, and discover how the themes are associated or change over time.

底部的红字说明了动机:*Topic models are motivated by the need to uncover hidden themes in large collections of unstructured text, so we can represent documents in terms of interpretable topics instead of just raw word counts.* 讲师概括:降维,并且得到更精确的表示。

一篇文档通常不止一个主题。Slide 31:**A document typically consists of multiple themes running through the text in different proportions.** 它举了一段论文摘要:

> "*This paper presents NeuroChess, a program which learns to play chess from the final outcome of games. NeuroChess learns chess board evaluation functions, represented by artificial neural networks. It integrates inductive neural network learning, temporal differencing, and a variant of explanation-based learning. Performance results illustrate some of the strengths and weaknesses of this approach.*"

讲师的读法:第一句讲这个程序是什么,中间讲程序用的技术,最后一句讲性能。把摘要里的词按主题归一归:

| 主题(人起的名字) | 摘要里属于这个主题的词 |
|---|---|
| 下棋、游戏 | chess, games, board, play |
| 神经网络与学习方法 | neural networks, learning, inductive, temporal differencing, explanation-based |
| 研究报告 | paper, presents, performance, results, strengths, weaknesses, approach |

三个主题以不同比例交织在同一段文字里。§21 的 slide 42 会把这篇论文的全文画成图(那张图里的文档 *Learning To Play the Game of Chess*,正是这篇 NeuroChess 论文)。

主题找出来以后能做什么? Slide 32:

> **The process of topic modeling can be used to:**
> 1. Uncover the hidden topical patterns within a corpus.
> 2. Provide short descriptions for documents.
> 3. Annotate documents according to these topics. Use annotations to organize, search, understand, and summarize texts.

讲师补充:一篇文档用主题表示以后,就得到了一组**维度低得多的特征**。在这组新特征上,可以做 clustering、做 classification、算距离,"*想做什么都行,因为你有了一组新的 attributes*"。

## §18 Topic 的正式定义

Slide 29 说 topic 是"一簇词"。Slide 33 给出了数学上的定义:

> **A topic is formally defined as a distribution over a fixed vocabulary of words.** Different topics have different distributions over the same vocabulary.
> **A topic can be viewed as a cluster of words with related meanings.** A word from the vocabulary can reside in multiple topics with different weights.

讲师说,同一个概念可以从两个角度看:

- **数学角度**:先有一个固定的词表,一个主题就是词表上的一个**概率分布**。每个词分到一个权重,权重大说明这个词对主题贡献大;权重可以是 0,说明这个词和主题无关。不同的主题对应不同的分布。
- **直观角度**:一个主题就是一簇带权重的词,可以画出来看:主题里有哪些词,每个词权重多大。

> 📎 **记号(超出 slides)** — 后面会用 $\phi_k$ 表示第 $k$ 个主题的词分布,$\phi_{k,w}=P(w\mid\text{topic }k)$。"分布"意味着两件事:每个 $\phi_{k,w}\ge0$,并且对整个词表求和等于 1,即 $\sum_{w}\phi_{k,w}=1$。

Slide 34 画了四个主题的例子:

| Topic 1 | | Topic 2 | | Topic 3 | | Topic 4 | |
|---|---|---|---|---|---|---|---|
| problem | 0.05 | neural | 0.06 | policy | 0.02 | report | 0.05 |
| technique | 0.04 | learning | 0.05 | reinforcement | 0.02 | technical | 0.03 |
| game | 0.02 | networks | 0.05 | state | 0.01 | paper | 0.02 |
| play | 0.01 | system | 0.04 | model | 0.01 | university | 0.02 |
| … | | … | | … | | … | |

看词就能猜出每个主题在说什么:Topic 1 和问题、博弈有关,Topic 2 是神经网络,Topic 3 是强化学习(policy、reinforcement、state),Topic 4 像是技术报告。讲师说,每个数是这个词对主题的权重,也就是在这个主题里观察到这个词的概率。

读这张表时注意两点(📎):

1. **权重都很小。** 一个主题把概率分摊到整个词表(几千个词)上。Topic 2 排前四的词加起来也只有 0.20,剩下的 0.80 分给了其余的词。
2. **主题没有名字。** 算法给出的只是 Topic 1、Topic 2 和一串带权重的词;"神经网络""强化学习"这些名字,是人看了高权重的词之后起的。解读主题需要人的判断。

"一个词可以属于多个主题"也很好理解:learning 既可以出现在神经网络主题里,也可以出现在强化学习主题里,只是权重不同。§22 的 R 结果里,learning 就出现在好几个主题的高频词中。

## §19 LDA 是一个生成模型

给定一个 corpus,怎样找出其中的主题、每个主题里有哪些词、各自权重多少? 又怎样知道每篇文档包含哪些主题、各占多少比例? 讲师说,这就是我们要分析的问题。Slide 35 给出的工具是:

> **The simplest topic model is Latent Dirichlet Allocation (LDA)** — a generative probabilistic model of a corpus.
> **Generative probabilistic model** — model observations drawn from a probability density function. LDA uses a hierarchical Bayes method.
> **In LDA, documents are treated as the result of a generative process (with hidden variables)…**

"生成模型"是理解 LDA 的钥匙。讲师花了不少时间解释:

> 🎙️ "*它假设我们观察到的数据,是由一个概率过程生成的。我们看到的,是对这个概率过程抽样的结果。所以我们的问题是:我看到了结果,想反过来推出这个概率过程,更准确地说,推出它的参数。*"

他举了个生活中的例子:你看到一地碎玻璃,会问是谁干的,是猫、是狗,还是孩子? 你看到了结果,想推断背后的过程。LDA 做的是同一件事:**把文档看成一个生成过程的产物**。这个过程的函数形式是预先规定好的,带着一些参数,我们要从观察到的文档里把参数估计出来。讲师说,要估计的本质上是**两个概率矩阵**:一个描述每个词和每个主题的关系,一个描述每个主题和每篇文档的关系。"*有了这两样,我们就什么都有了。*"

> 📎 **名字的由来(超出 slides)** — **Latent(潜在的)**:主题是隐藏变量,观察不到;**Dirichlet**:一种概率分布的名字(下一节讲),LDA 用它来生成每篇文档的主题比例;**Allocation(分配)**:把文档里的每个词分配给某个主题。
>
> 📎 **Hierarchical Bayes(层次贝叶斯)** — 模型的参数本身也是随机的,由更上一层的分布生成:超参数 α 生成每篇文档的主题比例 θ,θ 生成每个词的主题 z,z 再生成具体的词 w。随机性一层套一层,所以叫"层次"。

Slide 36 把这个过程画成了图:一堆文本文档组成数据集,送进 LDA 模型;模型一边产出主题(右上角的 1、2、3、4),一边产出每篇文档的主题比例(右下角 D1–D4 的柱状图)。模型中间是一串圆圈,标着 α、θ、z、w,外面套着两个方框 N 和 M。

这种画法叫 **plate notation(板式记号)**(📎 名称超出 slides):

- **圆圈**是随机变量;**涂灰的圆圈**是观察得到的变量,这里只有 $w$,也就是文档里实际出现的词;
- **方框**(plate)表示"重复":内框 N 表示每篇文档里的 N 个词各重复一次,外框 M 表示 M 篇文档各重复一次;
- **箭头**表示"由谁生成"。

```d2
direction: right
classes: {
  rv: {shape: circle}
  obs: {shape: circle; style: {fill: "#d9d9d9"; bold: true}}
  param: {shape: circle; style: {fill: "#eaf3ee"; stroke: "#2f6f4f"}}
}
alpha: "α\nDirichlet\nparameter" {class: param}
beta: "β\n各主题的\n词分布" {class: param}
M: "M 篇文档" {
  theta: "θ\n文档的\n主题分布" {class: rv}
  N: "每篇 N 个词" {
    z: "z\n这个词的\n主题" {class: rv}
    w: "w\n观察到\n的词" {class: obs}
  }
}
alpha -> M.theta
M.theta -> M.N.z
M.N.z -> M.N.w
beta -> M.N.w
```

讲师沿着箭头讲了一遍:α 是一个**先验参数(prior parameter)**,决定文档与主题之间的概率关系;另一组概率描述词与主题之间的关系。从文档到主题,再从主题抽出词,最后得到观察到的词。"*观察得到的是词和文档,中间都是隐藏的过程。主题是隐藏变量,它把整个过程连了起来。*"

> 📎 **关于 β(超出 slides)** — Slide 36 的图只画了 α。完整的 LDA 图(Blei 等 2003)在框外还有 β,它决定每个主题的词分布。§20 的正式写法里会出现它。上面的 d2 图把它补上了。

## §20 "做"一篇文档:LDA 的生成过程与假设

### 做菜的比喻

生成模型的思路是"先想清楚数据是怎么造出来的"。Slide 37 用做菜来比喻:

> **Recipe: how to cook a document via LDA**
> - Choose the length $N$ of the document
> - Choose a distribution over the topics
> - For each of the $N$ words of this document
>   - Choose a topic based on the above distribution
>   - Choose a word from the corresponding topic

讲师说,你可以把自己想成一个厨师要做一道菜,或者一个作者要写一篇文档,两者很像:

> 🎙️ "*先决定文档的长度。然后按某个分布随机选主题。比如你要写一篇和大学有关的文档,教育、体育、计算机科学这些主题的概率高,犯罪、社区这些主题的概率低。按这个分布随机选一个主题,再按这个主题随机抽一个词,写下来。每个词都这样:先选主题,再按主题抽词。就像做菜:先定菜系,意大利菜、中国菜还是印度菜,然后往里放食材,最后做成一道菜。*"

> **🔑 例:亲手"做"一篇文档**(📎 主题与数字为本讲义所设)
>
> 有三个主题,每个主题是一个词分布:
>
> - 主题 A(教育):student 0.3,course 0.3,exam 0.2,lecture 0.2
> - 主题 B(体育):team 0.4,match 0.3,goal 0.3
> - 主题 C(计算机):data 0.4,model 0.3,code 0.3
>
> 第一步,定长度 $N=6$。第二步,定这篇文档的主题比例 $\theta=(0.5,\,0.2,\,0.3)$:一半讲教育,两成讲体育,三成讲计算机。第三步,逐个词"掷两次骰子":
>
> | 位置 | 按 θ 抽主题 z | 按该主题的词分布抽词 w |
> |---|---|---|
> | 1 | A | student |
> | 2 | C | data |
> | 3 | A | exam |
> | 4 | B | match |
> | 5 | C | model |
> | 6 | A | lecture |
>
> 做出来的"文档"是 `student data exam match model lecture`。它读起来不像句子,这不是失误:**LDA 生成的是一袋词**,它和 BoW 一样不管词序和语法,只管每个词出现几次。

做菜比喻的下半句才是重点。Slide 37 用方框框了起来:

> **In reality, only the documents are available. LDA aims to infer the underlying topics, topic proportions, and topic assignment for each document.**

现实中我们看不到厨师怎么做菜,只尝到了菜。讲师说:"*你知道文档是按这个过程生成的,但你只观察到文档。*" LDA 要从文档反推出三样东西:**有哪些主题**(每个主题的词分布)、**每篇文档的主题比例**、**每个词被分配给了哪个主题**。这就是开头说的两个概率矩阵。

### LDA 的四条假设

Slide 38 列出了 LDA 的假设(出自 Blei、Ng、Jordan 2003 年的论文):

> **LDA assumes:**
> - There is a **fixed vocabulary** of words.
> - The **number of the latent topics is predefined**.
> - Each latent topic is characterised by **a distribution over words** in a vocabulary.
> - Each document is represented as **a random mixture over latent topics**.

讲师说,主题数要事先定好,比如 5 个或 10 个。后两条就是 §18 的"主题是词上的分布"和 §17 的"文档是主题的混合"。

> 📎 **假设的代价(超出 slides)** — 主题数 $K$ 得由你来定,LDA 不会告诉你"这个 corpus 有几个主题"。实际中常试几个不同的 $K$,看哪个得到的主题最好解释。词表也必须事先固定,训练时没见过的词,模型无法处理。

### 正式写法

Slide 39 是 Blei 等人论文里的原文:

> LDA assumes the following generative process for each document $\mathbf{w}$ in a corpus $D$:
> 1. Choose $N\sim\text{Poisson}(\xi)$.
> 2. Choose $\theta\sim\text{Dir}(\alpha)$.
> 3. For each of the $N$ words $w_n$:
>    (a) Choose a topic $z_n\sim\text{Multinomial}(\theta)$.
>    (b) Choose a word $w_n$ from $p(w_n\mid z_n,\beta)$, a multinomial probability conditioned on the topic $z_n$.

它和做菜的 recipe 一一对应:

| Recipe(slide 37) | 正式写法(slide 39) | 含义 |
|---|---|---|
| Choose the length $N$ | $N\sim\text{Poisson}(\xi)$ | 文档长度从 Poisson 分布中抽取 |
| Choose a distribution over the topics | $\theta\sim\text{Dir}(\alpha)$ | 这篇文档的主题比例,从 Dirichlet 分布中抽取 |
| Choose a topic | $z_n\sim\text{Multinomial}(\theta)$ | 按比例 θ 掷一次"K 面骰子",决定这个词的主题 |
| Choose a word from the corresponding topic | $w_n\sim p(w_n\mid z_n,\beta)$ | 按主题 $z_n$ 的词分布掷一次"V 面骰子",决定具体的词 |

公式里的三个分布,初学者可能没见过:

> 📎 **三个分布(超出 slides)**
>
> - **$\text{Poisson}(\xi)$**:取值为 0、1、2……的分布,均值是 $\xi$。这里只是随便给文档定个长度,它和主题无关,推断主题时用不到。
> - **$\text{Multinomial}(\theta)$**:抽一次时,就是掷一个**不均匀的骰子**。$\theta=(0.5,0.2,0.3)$ 表示掷出 A 面的概率是 0.5,B 面 0.2,C 面 0.3。
> - **$\text{Dir}(\alpha)$,Dirichlet 分布**:它是"分布的分布"。从它抽一次,得到的不是一个数,而是一组加起来等于 1 的非负数,正好可以当作一个 θ。参数 α 控制抽出来的 θ 长什么样。以 3 个主题、对称的 α 为例:
>   - $\alpha=0.1$(小):抽出的 θ 常常像 $(0.96,\,0.03,\,0.01)$,几乎全押在一个主题上;
>   - $\alpha=1$:所有可能的 θ 机会均等;
>   - $\alpha=10$(大):抽出的 θ 常常像 $(0.35,\,0.32,\,0.33)$,三个主题平分秋色。
>
> (以上 θ 是示意的典型抽样结果。)
>
> 为什么偏偏用 Dirichlet? 它和 multinomial 是一对 **conjugate(共轭)** 分布:先验是 Dirichlet,观察到 multinomial 的数据之后,后验仍是 Dirichlet。落到计算上,就是"计数再加上 α"。§21 的公式里会看到这个 $+\alpha$。

### α 与 β

Slide 39 的红字解释了两个超参数:

> *With a higher alpha, documents are assumed to be made up of more topics and result in more specific topic distribution per document.*
> *With high beta, topics are assumed to made of up most of the words and result in a more specific word distribution per topic.*

| 超参数 | 控制哪个分布 | 调大 | 调小 |
|---|---|---|---|
| **α** | 每篇文档的主题分布 θ(文档–主题) | 每篇文档混合更多主题,各主题比例更平均 | 每篇文档集中在少数几个主题上 |
| **β** | 每个主题的词分布(主题–词) | 每个主题包含更多的词,权重摊得更开 | 每个主题集中在少数几个词上 |

讲师说,α 和 β 要根据你的先验知识事先给定。

> ⚠️ **两处容易混的地方**
>
> 1. **讲师口头把 α、β 说反了一次。** 录音里他说"对一个给定的主题,用 α 和 β 控制它有多少词……对一个给定的文档,可以用 β 控制它包含多少主题"。按 slide 39 的公式和红字,正确的对应是:**α 管文档–主题,β 管主题–词**。
> 2. **红字里的 "more specific" 容易误读。** 按标准理解,α 越大,每篇文档的主题分布越"平均",而不是越集中在某个主题上;β 同理。考试时抓住每句红字的前半句:**high α → documents are made up of more topics;high β → topics are made up of most of the words。**
>
> 📎 Slides 的 R 代码(§22)取 α = β = 0.1。Griffiths 和 Steyvers(2004)提出 collapsed Gibbs sampling 时,用的是 α = 50/K、β = 0.1,这组取值后来常被当作默认值。

## §21 反推主题:collapsed Gibbs sampling

生成过程讲完了,现在反过来:只有文档,怎样推出主题? Slide 40 给出了算法:

> **Algorithm for LDA (Collapsed Gibbs Sampling):**
> 1. Choose the number of topics $K$.
> 2. Randomly assign each word in each document to one of the $K$ topics.
> 3. For each word $w$ in each document $d$:
>    - Count how many words in $d$ are assigned to each topic.
>    - Count how many times $w$ is assigned to each topic across all documents.
>    - Combine these counts (with smoothing) to get the probability that $w$ belongs to topic $t$.
>    - Sample a new topic for $w$ based on this probability.
> 4. Repeat Step 3 many times until assignments stabilize.
> 5. Use the final assignments to estimate: topics per document, words per topic.

讲师的评价是:"*很简单,就是不停地数,数各个词出现了多少次。从随机初始化开始。*"

```d2
direction: down
init: "① 选定主题数 K\n② 每个词随机分配一个主题"
step: "③ 逐个词重新分配主题\n拿掉当前分配 → 数两个计数\n→ 相乘(加 α、β 平滑)\n→ 按概率抽一个新主题"
est: "⑤ 用最终分配估计\nθ:每篇文档的主题比例\nφ:每个主题的词分布"
init -> step
step -> step: "④ 重复,直到分配稳定"
step -> est: "稳定后"
```

第 3 步的四个小点是整个算法的核心。Slides 没给公式,这里补上(📎 公式出自 Griffiths & Steyvers 2004):

$$P(z_i=k\mid\text{其余所有分配})\ \propto\ \left(n_{d,k}+\alpha\right)\times\frac{n_{k,w}+\beta}{n_k+V\beta}$$

各个符号都对应 slide 上的一个小点:

| 符号 | 含义 | 对应 slide 40 的哪一句 |
|---|---|---|
| $n_{d,k}$ | 文档 $d$ 里被分给主题 $k$ 的词数(不算当前这个词) | Count how many words in $d$ are assigned to each topic |
| $n_{k,w}$ | 全部文档里,词 $w$ 被分给主题 $k$ 的次数(不算当前这个词) | Count how many times $w$ is assigned to each topic across all documents |
| $n_k$ | 全部文档里被分给主题 $k$ 的总词数 | 用来把 $n_{k,w}$ 变成比例 |
| $V$ | 词表大小 | |
| $+\alpha$、$+\beta$ | 平滑:计数为 0 的主题也留一点机会 | (with smoothing) |
| 两项相乘、归一化后抽样 | | Combine these counts … Sample a new topic |

公式由两个因子相乘。**第一个因子** $(n_{d,k}+\alpha)$ 问的是:这篇文档有多偏爱主题 $k$? 文档里已经有很多词属于主题 $k$,当前这个词也属于 $k$ 的可能性就大。**第二个因子**问的是:主题 $k$ 有多偏爱词 $w$? 词 $w$ 在别的文档里常被分给主题 $k$,它在这里也属于 $k$ 的可能性就大。

> 📎 **"Gibbs" 和 "collapsed" 是什么意思(超出 slides)** — **Gibbs sampling** 是一种抽样方法:每次只更新一个变量,更新时把其他变量都当作已知,轮流更新;重复足够多遍以后,得到的分配就近似来自真正的后验分布。**Collapsed**(折叠)指 θ 和 φ 被积分掉了,算法只对每个词的主题 $z$ 抽样,所以整个过程只需要数数。第 5 步用最终的计数估计 θ 和 φ:
> $$\hat\theta_{d,k}=\frac{n_{d,k}+\alpha}{n_d+K\alpha},\qquad \hat\phi_{k,w}=\frac{n_{k,w}+\beta}{n_k+V\beta}$$
> 其中 $n_d$ 是文档 $d$ 的总词数。

> **🔑 例:手算一步 Gibbs sampling**(📎 数字为本讲义所设)
>
> 设 $K=2$(主题 1 是体育,主题 2 是食物),$V=1000$,$\alpha=0.1$,$\beta=0.01$。文档 $d$ 是 `ball game goal ball pizza`,当前的分配是:ball、game、goal、ball 属于主题 1,pizza 属于主题 2。
>
> **重新给 pizza 分配主题。** 先拿掉它当前的分配,再数(都不算这个 pizza):
>
> | | 主题 1(体育) | 主题 2(食物) |
> |---|---|---|
> | $n_{d,k}$:文档 $d$ 里属于该主题的词数 | 4 | 0 |
> | $n_{k,\text{pizza}}$:全库中 pizza 被分给该主题的次数 | 1 | 30 |
> | $n_k$:全库中属于该主题的总词数 | 500 | 400 |
>
> $$\text{主题 1}:\ (4+0.1)\times\frac{1+0.01}{500+1000\times0.01}=4.1\times\frac{1.01}{510}\approx0.00812$$
> $$\text{主题 2}:\ (0+0.1)\times\frac{30+0.01}{400+10}=0.1\times\frac{30.01}{410}\approx0.00732$$
>
> 归一化:$P(\text{主题 1})=\dfrac{0.00812}{0.00812+0.00732}\approx0.53$,$P(\text{主题 2})\approx0.47$。
>
> 两股力量在拉扯:**词**这一侧强烈偏向食物(全库里 30 比 1),**文档**这一侧强烈偏向体育(4 比 0)。乘起来以后差不多一半对一半。
>
> **再给第一个 ball 重新分配**,对比一下。此时文档里其余的词是 game、goal、ball 属于主题 1,pizza 属于主题 2,所以 $n_{d,1}=3$、$n_{d,2}=1$;设全库中 ball 被分给主题 1 有 50 次、主题 2 有 1 次:
>
> $$\text{主题 1}:\ 3.1\times\frac{50.01}{510}\approx0.304,\qquad \text{主题 2}:\ 1.1\times\frac{1.01}{410}\approx0.0027$$
>
> $P(\text{主题 1})\approx0.99$。文档和词的意见一致,结果几乎是确定的。

这个例子正好说明 slide 41 那段话:

> - LDA considers documents as a mixture of topics. LDA considers a topic is a mixture of words.
> - If a word $w$ has high probability of being in a topic, all the documents having $w$ will be more strongly associated with $t$.
> - If $w$ is not very probable to be in $t$, the documents which contain the $w$ will have a low probability of being in $t$, because the rest of the words in $d$ will belong to some other topic and hence $d$ will have a higher probability for those topic. So even if $w$ gets added to $t$, it won't be bringing many such documents to $t$.

红字给了一个通俗的版本:*If a word doesn't fit a topic naturally, adding it won't suddenly make documents containing that word belong to that topic, because other words in those documents will "vote" more strongly for other topics.*

对照上面的例子:pizza 天然属于食物主题,却出现在一篇体育文档里。文档里的其他词(ball、game、goal)都在为体育"投票"。哪怕这一次 pizza 被抽到了体育主题,这篇文档的主题比例也几乎不变,它依然是一篇体育文档。讲师的总结是:"*主题是一个关键的隐藏变量,它把词和文档连了起来。*"

Slide 42 把这一切画在了一张图上。左边是几个主题,各带一列高权重的词;中间是一篇真实的文档 *Learning To Play the Game of Chess*,也就是 §17 那段 NeuroChess 摘要所属的论文,文中的词按所属主题涂上了不同颜色(**topic assignments**);右边的柱状图是这篇文档的**主题比例(topic proportions)**。讲师说:"*这张图把词、主题和比例之间的关系描述得非常清楚。*"

## §22 R 实例:用 lda 包跑 LDA

Slide 43 给出了参考文献和工具:

> For details: D. M. Blei, A. Y. Ng, and M. I. Jordan, "Latent Dirichlet Allocation," *Journal of Machine Learning Research*, vol. 3, pp. 993–1022, 2003.
> R comes with an `lda` package that has built-in functions and example datasets — cora datasets (2,410 scientific documents).
> *Implementing LDA in Python can be found in this week's lab instruction.*

Slide 44 的代码:

```r
library("lda")
data(cora.documents)   #inbuild collection of scientific docs
data(cora.vocab)       #stemmed words
K=10                   #Number of topics
result <- lda.collapsed.gibbs.sampler(cora.documents,
                        K, cora.vocab,
                        25, ## Num iterations
                        0.1,0.1,compute.log.likelihood=TRUE)

# Get the top words in the cluster
top.words <- top.topic.words(result$topics, 5, by.score=TRUE)
```

讲师逐行讲了一遍,对应到前面的概念:

| 代码 | 做什么 | 对应前面的哪里 |
|---|---|---|
| `library("lda")` | 加载 lda 包 | |
| `data(cora.documents)` | 载入包自带的 2,410 篇科学文献 | corpus |
| `data(cora.vocab)` | 载入预先定义好的词表(stemmed words) | fixed vocabulary(§20 假设一);stemming(§8) |
| `K=10` | 主题数设为 10 | §21 第 1 步;§20 假设二 |
| `lda.collapsed.gibbs.sampler(...)` | 用 collapsed Gibbs sampling 拟合 LDA,函数名就是方法名 | §21 |
| `25` | 迭代 25 次 | §21 第 4 步 "repeat many times" |
| `0.1, 0.1` | 两个超参数:α 和 β(包里把 β 叫作 eta) | §20 |
| `compute.log.likelihood=TRUE` | 记录每次迭代的 log-likelihood,用来观察是否收敛 | §21 第 4 步 "until assignments stabilize" |
| `top.topic.words(result$topics, 5, by.score=TRUE)` | 列出每个主题最重要的 5 个词 | 每个主题的词分布 |

> 📎 **补充(超出 slides)**
>
> - `cora.documents` 里每篇文档存成"(词的编号, 次数)"的形式,就是 §9 说的稀疏 BoW。
> - `result$topics` 是一个 $K\times V$ 的矩阵,记录每个词被分给每个主题的次数,即 §21 的 $n_{k,w}$;`result$document_sums` 是一个 $K\times D$ 的矩阵,记录每篇文档有几个词被分给每个主题,即 $n_{d,k}$。各自归一化,就得到 φ 和 θ。
> - `by.score=TRUE` 不按原始次数排序,而按 Blei 和 Lafferty 提出的一种得分排序:一个词在本主题里常见、在其他主题里少见,得分才高。思路和 TFIDF 一样。按原始次数排,每个主题的前几名都可能是同一批常见词。
> - 25 次迭代只够演示。实际应用中通常要几百到上千次。

Slide 45 是运行结果的可视化。讲师解释:图里有 9 篇文档(编号 1–9 的九个小图),每个小图显示一篇文档在 10 个主题上的比例(横轴是百分比)。每个主题用它得分最高的 5 个词命名,比如 `neural.networks.network.grant.research`、`reinforcement.state.learning.optimal.policy`、`algorithm.distribution.bayesian.error.probability`。

讲师从图里读出了 topic model 的两个好处:

> 🎙️ "*每篇文档变成了一个 10 维向量,向量里是每个主题在这篇文档里的权重。这比 BoW 的维度低得多。而且它是可解释的:一眼就能看出这篇文档主要讲神经网络,讲研究相关的内容。它的语义更清楚。*"

有了这样的低维向量,就可以拿去做 clustering、classification,计算文档之间的距离。这也回答了 §17 开头 slide 29 的问题:TFIDF 几乎压缩不了描述长度,LDA 可以。

> 📎 **从矩阵的角度看 LDA(超出 slides)** — 一篇文档生成词 $w$ 的概率是"先选主题、再选词"两步的总和:
> $$P(w\mid d)=\sum_{k=1}^{K}\theta_{d,k}\,\phi_{k,w}$$
> 写成矩阵:$D\times V$ 的"文档–词"概率矩阵,被分解成 $D\times K$ 的"文档–主题"矩阵 θ 乘以 $K\times V$ 的"主题–词"矩阵 φ。这两个矩阵就是讲师说的"两个概率矩阵"。$K=10$ 而 $V$ 有几千时,每篇文档只需 10 个数来描述,而不是几千个。

> 📎 **在 Python 里跑 LDA(超出 slides;lab 的写法可能不同)**
>
> ```python
> from sklearn.feature_extraction.text import CountVectorizer
> from sklearn.decomposition import LatentDirichletAllocation
>
> vec = CountVectorizer(stop_words="english")   # BoW 计数,顺便去掉停用词
> X = vec.fit_transform(docs)                   # docs 是一个字符串列表
> lda = LatentDirichletAllocation(n_components=10,       # K
>                                 doc_topic_prior=0.1,   # α
>                                 topic_word_prior=0.1,  # β
>                                 random_state=0)
> theta = lda.fit_transform(X)                  # D × K:每篇文档的主题比例
> vocab = vec.get_feature_names_out()
> for k, weights in enumerate(lda.components_): # components_ 是 K × V
>     top = weights.argsort()[::-1][:5]
>     print(k, [vocab[i] for i in top])
> ```
>
> 两点提醒:LDA 是关于**词的次数**的模型,输入用 `CountVectorizer` 的计数,不用 TFIDF;scikit-learn 的 LDA 用 variational Bayes 求解,不是 Gibbs sampling,但模型本身相同。

---

# Part V · 情感分析与结果可视化

## §23 从"在说什么"到"说得好不好":sentiment analysis

回到开篇那家公司的两个问题。Topic model 回答了第一个:人们**在说什么**。第二个问题,说的是**好话还是坏话**,要交给 sentiment analysis。Slide 46 把两者并排放在一起:

> **Topic models** can be used in document modeling, document classification, and collaborative filtering.
> **Sentiment analysis**: mine opinions to identify and extract subjective information from texts.

> 📎 **Collaborative filtering 怎么用上 topic model(超出 slides)** — Collaborative filtering(协同过滤)是推荐系统的一类方法。把每个用户看成一篇"文档",把他看过、买过的物品看成"词",LDA 找出的"主题"就是一类类口味(比如"科幻迷""文艺片爱好者")。知道了一个用户偏向哪些口味,就可以推荐同一口味里他还没看过的东西。Blei 等人 2003 年的论文就在电影评分数据上做过这个实验。

Slide 47 展开了 sentiment analysis:

> **Sentiment analysis** — uses statistics and NLP to mine opinions to identify and exact subjective information from texts.
> **Applications** — detect the polarity of product or movie reviews.
> **Analysis level** — document, sentence, phrase, and short-text.

> ⚠️ Slide 47 的 "identify and exact subjective information" 是笔误,应为 *extract*,slide 46 的写法是对的。

**Subjective information(主观信息)** 指观点和态度,和客观事实相对:"这部手机的屏幕是 6 英寸"是事实,"这块屏幕漂亮极了"是观点。**Polarity(极性)** 就是观点的方向:正面还是负面。讲师说,通常把情感分成 positive、negative,有时再加一个 neutral,"*所以它就是一个二分类或三分类问题*"。

分析可以在不同的粒度上做:整篇文档、一个句子、一个短语,或者一条很短的文本(讲师举的例子是一条小贴士)。粒度不同,结论可能不同。

> 📎 **例(超出 slides)** — "Great camera, but the battery dies by noon." 作为一整条评论,也许算中性偏正面;拆成两个分句,前半句是 positive,后半句是 negative。公司想知道"用户对电池满不满意",就得在句子或短语这一级分析。

## §24 把情感分析当作分类问题

既然是分类问题,Week 5 的方法就都用得上。Slide 48:

> **Classification methods are often used to extract corpus statistics for sentiment analysis** — Naïve Bayes classifier, Maximum Entropy, Support Vector Machines, ….
> **Movie review corpus, e.g. MovieLens** — consists of 2000 movie reviews; manually tagged into 1000 positive and 1000 negative reviews.

> 📎 **拓展(超出 slides)** — NLP 里说的 **Maximum Entropy classifier(最大熵分类器)**,就是 Week 6 logistic regression 推广到多个类别的版本(multinomial logistic regression),只是名字不同。
>
> 🎙️ 讲师在 Week 9 开头回顾时补充:除了 Naïve Bayes 和 support vector machine,multilayer perceptron、decision tree、random forest 等分类器也都能用来做情感分类。
>
> 📎 **关于数据集的名字** — Slide 写的是 MovieLens。NLTK 自带的这份"2000 条影评、正负各 1000 条"的语料,实际上是 Bo Pang 和 Lillian Lee 整理的 polarity dataset(在 NLTK 里叫 `movie_reviews`);MovieLens 主要是电影**评分**数据集。考试按 slide 的说法答即可;做 lab 时找的是 `movie_reviews`。

讲师说,这里有数据,也有标签,于是可以做分类。怎么做? 他让大家回想分类那一周的内容。Slide 49 画出了四个步骤:

```d2
grid-rows: 2
grid-columns: 3
horizontal-gap: 80
vertical-gap: 70
data: "Data Set\n2000 条已标注影评" {shape: cylinder}
train: "Training dataset\n1600 条"
clf: "Train a classifier\nNaïve Bayes + BoW"
blank: "" {style: {opacity: 0}}
test: "Test dataset\n400 条"
perf: "Classifier Performance\naccuracy 73.5%"
data -> train: "① 划分"
data -> test: "① 划分"
train -> clf: "② 训练"
clf -> test: "③ 用在测试集上"
test -> perf: "④ 评估"
```

> 🎙️ "*有了数据集,就把它分成训练集和测试集。在模型准备好接受评估之前,永远、永远不要碰测试集。分类器完全在训练集上训练,然后拿去测试,得到性能指标:classification accuracy、precision、recall、ROC 曲线和 AUC 值。这些我们都讲过。*"

Slide 50 给了一个完整的例子:

> **An example**
> 1. Using the Natural Language Processing Toolkit (NLTK) library in python.
> 2. Split the 2000 reviews into 1600 reviews as training set and 400 reviews as testing set.
> 3. Using BoW features.
> 4. Naïve Bayes classifier learns from the training set. The classifier achieves an accuracy of 73.5%. Show most informative features for pos/neg.

讲师补充了几点。第一,1600/400 就是 80%/20% 的划分。第二,表示方式可以选 BoW,可以用 TFIDF 增强,甚至可以用 topic model;这里用 BoW,"*因为它和 Naïve Bayes 配合得很好*"。第三,所谓 most informative features,看的是一个比值:某个词在 positive 评论里出现的概率,除以它在 negative 评论里出现的概率。"*如果一个词在正面、负面评论里都常出现,它就没有区分度;比值很高或很低,它才有区分度。*"

为什么 BoW 和 Naïve Bayes 特别搭? 回想 Week 5 的 Naïve Bayes:

> 📎 **回顾 Week 5(超出本周 slides)** — 给定一篇文档 $d$,判断它属于类别 $c$(pos 或 neg)的后验概率:
> $$P(c\mid d)\ \propto\ P(c)\prod_{w\in d}P(w\mid c)$$
> "naïve" 的地方在于假设:给定类别后,各个词的出现**相互独立**。这个假设和 BoW 的思路完全一致,BoW 本来就把每个词当成独立的一维、不管词序。每个特征形如 "contains(w) = True/False",$P(w\mid c)$ 只要在训练集里数一数就能估出来。
>
> NLTK 的 `show_most_informative_features()` 输出形如 `outstanding = True    pos : neg = 10.5 : 1.0`(数字仅示意)。它的意思是:outstanding 在 positive 影评中出现的概率,是在 negative 影评中的 10.5 倍。这就是讲师说的那个比值。

> 📎 **NLTK 示意代码(超出 slides;lab 的写法可能不同)**
>
> ```python
> import random
> import nltk
> from nltk.corpus import movie_reviews          # 1000 pos + 1000 neg
>
> docs = [(list(movie_reviews.words(fid)), cat)
>         for cat in movie_reviews.categories()
>         for fid in movie_reviews.fileids(cat)]
> random.shuffle(docs)
>
> # 词典:全语料最常见的 2000 个词
> freq = nltk.FreqDist(w.lower() for w in movie_reviews.words())
> vocab = [w for w, _ in freq.most_common(2000)]
>
> def bow_features(words):                        # BoW:只记"出现与否"
>     present = set(words)
>     return {f"contains({w})": (w in present) for w in vocab}
>
> featuresets = [(bow_features(d), c) for d, c in docs]
> train_set, test_set = featuresets[:1600], featuresets[1600:]   # 1600 / 400
> clf = nltk.NaiveBayesClassifier.train(train_set)
> print(nltk.classify.accuracy(clf, test_set))   # 随划分不同,大约在七成多
> clf.show_most_informative_features(10)
> ```

73.5% 这个数字本身说明了什么? 讲师提醒,Week 5 讲过的指标都该拿来看,只看 accuracy 不够。

> **🔑 例:同样是 73.5%**(📎 混淆矩阵为本讲义所设)
>
> 假设 400 条测试影评里正负各 200 条,分类结果是:
>
> | | 预测 pos | 预测 neg |
> |---|---|---|
> | **实际 pos(200)** | 160 | 40 |
> | **实际 neg(200)** | 66 | 134 |
>
> - Accuracy $=(160+134)/400=294/400=73.5\%$;
> - pos 类:precision $=160/(160+66)\approx0.71$,recall $=160/200=0.80$;
> - neg 类:precision $=134/(134+40)\approx0.77$,recall $=134/200=0.67$。
>
> 这个分类器更容易把负面评论误判成正面(66 条),而漏判正面的只有 40 条。对一家想及时发现差评的公司来说,neg 类只有 0.67 的 recall 才是要紧的数字。

## §25 情感分类器的三个坑

Slide 51 列出了用分类器做情感分析时要注意的三件事。

### 坑一:换了 domain 就不灵

> **Classifiers determine sentiments solely based on the datasets on which they are trained** — word meaning varies with the domain; cannot be directly applied to another domain.

讲师的解释:你在自己的数据集上训练了分类器,不能把它直接用到别的数据集上,因为数据的性质会变。这个数据集是电影评论,那个数据集是 IT 服务或法律服务的评价,它们来自不同的人群,表达好评、差评的方式也不同。"*所以不要把分类器直接用到另一个 domain。*"

> 📎 **例(超出 slides)** — "unpredictable" 形容电影情节是夸奖,形容汽车的转向就是批评;"long" 在 "long battery life" 里是好事,在 "long wait" 里是坏事。同一个词在不同 domain 里情感相反,在影评上学到的权重,搬到汽车评论上就会出错。

### 坑二:绝对分数没有意义,要和基准比

> **Absolute sentiment level is not informative** — compare with baseline result.

分类器给出 0.8 或 0.4 这样的分数,不要直接拿来下结论。讲师的例子:

> 🎙️ "*人们填调查问卷时,有的保守,有的很放得开。评价酒店时,人们喜欢用大词:'这家酒店太棒了,服务好极了。'可在更严肃的场合,比如评价法律服务,人们往往更中立,甚至偏负面。*"

所以要看的是**分数相对于平均水平的位置,以及它随时间的变化**,看趋势是在变好还是在下滑。

> 📎 **例(数字为本讲义所设)** — 一家酒店的平均情感分是 0.80,但同行业的基准是 0.85,它其实低于平均;一家律所只有 0.55,同行基准是 0.45,它反而高于平均。同一家公司,上季度 0.62、本季度 0.70,说明口碑在改善。

### 坑三:标签从哪里来

> **How to label a larger number of reviews?** — Use emoticons; use Amazon Mechanical Turk (MTurk).

监督学习需要大量带标签的数据。2000 条影评可以人工标,可公司每天抓到几十万条推文,怎么办? Slide 给了两个办法:

- **Amazon Mechanical Turk(MTurk)**:一个众包平台,讲师说,可以把标注任务分给很多愿意接活的人,数据量很大时也能以较低的价格完成。
- **Emoticons(表情符号)**:一条推文带着 😊,大概率是正面的;带着 ☹️,大概率是负面的。讲师提醒,这种标签"*有时会有噪声*"。

> 📎 **拓展(超出 slides)** — Slide 下方引用的 Go、Bhayani、Huang(2009)正是用表情符号给推文自动打标签,这种做法叫 **distant supervision(远程监督)**:用一个自动得到、带噪声的信号代替人工标签。训练前要把表情符号从文本里删掉,否则分类器只会学到"看表情",学不到"看文字"。

| 坑 | Slide 原话 | 怎么应对 |
|---|---|---|
| 跨 domain | Word meaning varies with the domain; cannot be directly applied to another domain | 在目标 domain 的数据上重新训练或调整 |
| 绝对分数 | Absolute sentiment level is not informative | 和基准、平均水平比,看变化趋势 |
| 标签不够 | How to label a larger number of reviews? | MTurk 众包;用表情符号自动打标签(有噪声) |

## §26 Gaining insights:把结果画出来

分析做完了,怎样让人一眼看懂? Slide 52 问:**How do data scientists use text analysis techniques to gain insights into their tasks?** 接下来四页 slide 给了四种可视化。

**Word cloud(词云,也叫 tag cloud)**(slide 52)。字号越大,词出现得越多。讲师说,按词频就能很容易地生成词云,一眼看出哪些词在你的文档里最常见。Slide 上的词云来自一批产品评论,最大的几个词是 great、love、like、works、recommend、product。

**用 TFIDF 高亮有信息量的词**(slide 53)。**TFIDF can be used to highlight the informative words in text.** Slide 上是几条 bPhone 的用户评论(教材虚构的 ACME 公司的产品),正文里每个词的字号按 TFIDF 调整:minor bugs、overall satisfied、speedier、wonderful、contacts transferred 这类词字号大,it、she、a 这类词字号小。留意 bphone 本身的字号也不大:几乎每条评论都提到它,IDF 很低,它和 §14 的 university 一样是背景词。讲师说,可以用粗体或别的方式,让人马上看出哪些词更重要。

**Circular graph of topics(主题圆图)**(slide 54)。**Circular graph of topics obtained from LDA. The disc size represents the weight of a word.** 大圆里套着若干个中等的圆,每个中等的圆是一个主题;主题圆里的小圆是词,小圆越大,这个词在主题里的权重越高。

**主题–词分布图**(slide 55)。**Another way to visualize topics.** 横轴是词表里的词,纵轴是 Topic 1 到 Topic 5,每个点的大小是这个词在该主题里的权重,没有点就是权重为 0。这张图直接画出了 §18 的定义:一个主题就是词表上的一个分布。讲师读了 Topic 4 那一行:"*很多词权重为 0,因为它们对这个主题没有贡献。但 great、got、good 这些词有贡献,其中 great 贡献最大。*"

| 可视化 | 依据 | 回答什么问题 |
|---|---|---|
| Word cloud | 词频 | 大家最常提到哪些词? |
| TFIDF 高亮 | TFIDF | 每条文本里最有信息量的是哪些词? |
| Circular graph | LDA 的主题–词权重 | 有哪些主题,每个主题由哪些词构成? |
| 主题–词分布图 | LDA 的主题–词权重 | 每个词在各个主题里的权重是多少? |

> 📎 **词云的局限(超出 slides)** — 词云按词频画,不先去停用词,画出来全是 the 和 and。它也看不到否定:"not great" 里的 great 一样会把 great 撑大。所以词云适合快速浏览,下结论还要靠 TFIDF、topic model 和情感分类。这些图表的设计原则,可以对照 Week 3 讲的可视化。

---

# Part VI · 从词到向量,再到大语言模型

## §27 One-hot 编码为什么不够

讲师在讲 word embedding 之前,先回顾了前面所有方法的一个共同点:

> 🎙️ "*从 bag-of-words 到 TFIDF 再到 topic model,我们都把一个词当成一个单位,一个不可分割的单位。我们从没想过怎样看进一个词的内部,只是根据不同词一起出现的频率,建立了 topic model 和 bag-of-words model。可实际上,每个词都有它自己的意思。两个词看起来完全不同,意思却可能很接近。怎样把这种信息提取出来?*"

于是问题从"怎样表示一篇文档"变成了"怎样表示**一个词**"。Slide 56:

> **How should we encode a word into a vector?**
> **One-hot coding (seen in the Bag-of-Words model)** — Encode the $i$-th word in the dictionary with a "1" in the $i$-th position and a "0" in all the other positions. It would not capture the similarity between words: "cat" vs "kitten"; "car" vs "automobile".
> **We need a representation that allow for generalization between related words.**

讲师说,这个问题看上去在 BoW 里已经解决了:一篇只有一个词的文档,它的 BoW 向量就是这个词的表示,一个很长的向量,只有一个位置是 1,其余全是 0。这就是 **one-hot coding(独热编码)**。

问题在于,cat 和 kitten 意思很接近,在 one-hot 下却是两个毫不相干的向量,唯一的区别是 1 放在了不同的位置。讲师算了这两个向量的距离:

$$\lVert\mathbf{e}_{\text{cat}}-\mathbf{e}_{\text{kitten}}\rVert=\sqrt{1^2+(-1)^2}=\sqrt2$$

两个向量只在两个位置上不同,一处差 1,一处差 −1。换成任意两个不同的词,结果都一样。

> 🎙️ "*用 one-hot 编码,任意两个词的距离都相同,永远是根号 2。这不是我们想要的。我们清楚地知道,cat 和 kitten 非常接近,car 和 automobile 非常接近,kitten 和 automobile 是完全不同的东西。*"

> 📎 **补充(超出 slides)** — 用 cosine similarity 看更直接:两个不同的 one-hot 向量点积为 0,cosine 也是 0。在 one-hot 的世界里,**任何两个不同的词都"毫不相似"**。BoW 继承了这个缺陷:一篇文档的 BoW 向量,就是它所有词的 one-hot 向量之和。一篇写 car、另一篇写 automobile 的两篇文档,在 BoW 下没有任何重叠。

我们想要的是 **generalization between related words(相关词之间的泛化)**。讲师的说法是:"*两个词意思相近,它们的向量就应该接近;意思不同,向量就应该远离。*" 这就是 word embedding 的目的。

> 📎 **泛化为什么重要(超出 slides)** — 设想一个情感分类器,训练集里 "the film was excellent" 出现了很多次,"superb" 一次也没出现过。用 one-hot 表示,模型对 superb 一无所知;如果 superb 的向量和 excellent 很接近,模型在 excellent 上学到的东西就能自然地用到 superb 上。

## §28 Word embedding:从文本中学出来的稠密向量

Slide 57:**We can learn this representation automatically from text data.** 学出来的表示长这样:

$$\text{"aardvark"}=[-0.7,\,+0.2,\,-3.2,\,\ldots]\qquad \text{"abacus"}=[+0.5,\,+0.9,\,-1.3,\,\ldots]\qquad\cdots\qquad \text{"zyzzyva"}=[-0.1,\,+0.8,\,-0.4,\,\ldots]$$

每个词对应一个**实数向量**,每一维都有值,不再是一个 1 加一堆 0。讲师说,学这种表示的算法其实就是一个简单的单层神经网络,课上没时间细讲,但可以看看结果:把学到的向量投影到二维平面上,

- france、greece、germany 聚在一起:它们都是国家;
- nephew、niece、uncle、aunt 聚在一起:它们都是亲属;
- car、bicycle、truck 聚在一起:它们都是交通工具;
- banana、pizza、apple 聚在一起:它们都是食物。

"*这正是我们想要的。只要有一个大的 corpus,用一些简单的算法就能做到。*"

```d2
grid-columns: 2
horizontal-gap: 30
vertical-gap: 24
countries: "国家" {
  grid-columns: 2
  grid-gap: 12
  france
  greece
  germany
}
family: "亲属" {
  grid-columns: 2
  grid-gap: 12
  nephew
  niece
  uncle
  aunt
}
vehicles: "交通工具" {
  grid-columns: 2
  grid-gap: 12
  car
  bicycle
  truck
}
food: "食物" {
  grid-columns: 2
  grid-gap: 12
  banana
  pizza
  apple
}
```

(上图只示意 slide 57 的分组,位置不代表真实坐标。)

> 📎 **向量是怎么学出来的(超出 slides)** — 背后的想法叫 **distributional hypothesis(分布假说)**,语言学家 J. R. Firth 1957 年的名言是:"*You shall know a word by the company it keeps.*"(观其伴,知其义)。以 word2vec 的 skip-gram 为例:对语料中的每个词,训练一个单隐层的神经网络,用这个词去预测它前后几个位置上的词。cat 和 kitten 经常出现在相似的上下文里(pet、purr、meow……),为了做好同样的预测,它们的向量就会被训练得很接近。训练完成后,隐藏层的权重就是每个词的向量。向量通常只有一两百到三百维,远小于 one-hot 的上万维。

| | One-hot | Word embedding |
|---|---|---|
| 维度 | 词表大小,通常上万 | 📎 通常一两百到三百维 |
| 形态 | 稀疏:一个 1,其余全是 0 | 稠密:每一维都是实数 |
| 怎么得到 | 按词典编号直接写出 | 从大量文本中学出来 |
| 意思相近的词 | 距离都是 $\sqrt2$ | 距离近 |
| 能否表达词与词的关系 | 不能 | 能,见下文 |

更有意思的是,word embedding 不只是"意思近就挨得近"。Slide 58:

> **The word embedding vectors have additional properties beyond mere proximity for similar words** — the vector difference $B-A$ seems to encode relationship.
> **Question:** "Athens is to Greece as Oslo is to [what]?" **Answer:** $D=C+(B-A)$

讲师解释:设 A 是 Athens,B 是 Greece,$B-A$ 表示"首都 → 国家"这层关系;再加上 C(Oslo),就得到 Norway。他补充了一个更有名的例子:"*king − man + woman,你会得到 queen。*" Slide 58 的表列出了更多关系:

| A | B | C | D = C + (B − A) | Relationship |
|---|---|---|---|---|
| Athens | Greece | Oslo | Norway | Capital |
| Astana | Kazakhstan | Harare | Zimbabwe | Capital |
| Angola | kwanza | Iran | rial | Currency |
| copper | Cu | gold | Au | Atomic Symbol |
| Microsoft | Windows | Google | Android | Operating System |
| New York | New York Times | Baltimore | Baltimore Sun | Newspaper |
| Berlusconi | Silvio | Obama | Barack | First name |
| Switzerland | Swiss | Cambodia | Cambodian | Nationality |
| Einstein | scientist | Picasso | painter | Occupation |
| brother | sister | grandson | granddaughter | Family Relation |
| Chicago | Illinois | Stockton | California | State |
| possibly | impossibly | ethical | unethical | Negative |
| mouse | mice | dollar | dollars | Plural |
| easy | easiest | lucky | luckiest | Superlative |
| walking | walked | swimming | swam | Past tense |

关系不只是地理上的:有货币、化学符号、职业、亲属,还有语法上的复数、最高级、过去时。

> **🔑 例:在二维平面上做一次类比**(📎 坐标为本讲义所设)
>
> 设 Athens $=(1,1)$,Greece $=(1,3)$,Oslo $=(4,1)$。
>
> - $B-A=\text{Greece}-\text{Athens}=(0,2)$:"从首都走到它的国家"的方向;
> - $C+(B-A)=(4,1)+(0,2)=(4,3)$;
> - 在词表里找离 $(4,3)$ 最近的词(不算 A、B、C 本身),假如 Norway $=(4.1,\,3.0)$,答案就是 Norway。
>
> 实际做法和这一样,只是在几百维的空间里,"最近"通常用 cosine similarity 来衡量。

Word embedding 有什么用? Slide 59:

> **Word embeddings are now popular because** they are a good representation for downstream language tasks (such as question answering or translation or summarization).
> **It is possible to use generic pre-trained vectors**, obtained from any of several suppliers, for one's particular NLP task — WORD2VEC, GloVe (Global Vectors), and FASTTEXT.
> **We can also train word embedding for a specific task on a carefully selected corpus.**
> *Example of implementing word2vec can be found in this week's lab.*

讲师说,这些预训练的向量是在大型 corpus 上训练好的:给它一个词,它就输出这个词的向量。如果你有足够大的 corpus,也可以在自己的数据上训练,"*算法并不难*",找到 word2vec 或 GloVe 的代码,用在自己的数据集上就行。

> 📎 **三种预训练向量(超出 slides)**
>
> | 名称 | 出处 | 思路 |
> |---|---|---|
> | word2vec | Google,2013 | 用一个词预测上下文(skip-gram),或用上下文预测这个词(CBOW) |
> | GloVe | Stanford,2014 | 直接利用整个语料的**全局**词共现统计,所以叫 Global Vectors |
> | fastText | Facebook,2016 | 把词再拆成字符片段(如 `<ki`、`kit`、`itt`),没见过的词也能拼出向量;和 §7 BPE 的子词思路相通 |
>
> **什么时候该自己训练?** 领域用词和日常用法差别很大的时候。比如在医学报告里,"positive" 的检查结果往往是坏消息;用通用语料训练的向量会把它放在 good、great 旁边。这和 §25 的"换了 domain 就不灵"是同一个道理。

## §29 Contextual embeddings:同一个词,语境不同,向量也不同

Week 8 的课讲到这里就结束了。讲师在 Week 9 开课时补讲了剩下的几页。他说,这几页是想让大家对最新进展有个大致的认识:"*我们处在 AI 飞速发展的时代。如果你对文本分析的最新发展感兴趣,我想告诉你该去看哪些工具、哪些概念。*"

Slide 61:

> **From Word Embeddings to Contextual Embeddings**
> **Traditional word embeddings** — Word2Vec, GloVe, FastText. Each word is represented by a vector. Similar words have similar representations. **But the same word generally has the same representation regardless of context.**
> **Contextual embeddings** — Represent a word according to its **surrounding context**. Can capture different meanings of the same word.

讲师解释:word embedding 是**固定的**,一个词对应一个固定的向量,不随语境改变。可同一个词在不同句子里可能有不同的意思,而我们正是靠语境理解词义的。所谓语境,就是这个词前面和后面的词。Contextual embedding 根据一个词前后的词来计算它的向量,所以同一个词在不同句子里会得到不同的向量。

Slide 62 的例子:

> "We sat on the **bank** of the river."
> "She applied for a loan from the **bank**."

> 🎙️ "*如果只用 word embedding,两个 bank 会得到同一个向量。可我们读这两句话时,清楚地知道它们意思不同,这是标准 word embedding 的缺陷。用 contextual embedding,两个 bank 会得到两个不同的向量,因为生成 bank 的向量时,它前后的词也被考虑了进去,而这两句里 bank 前后的词不一样。如今我们用的 ChatGPT,用的就是 contextual embedding,所以现代 AI 模型能更好地把握每个词的确切意思。*"

这正是 §3、§4 留下的问题的答案:pragmatics 和 homonyms 都需要语境才能消歧,contextual embedding 让计算机也能利用语境。

| | Word embedding | Contextual embedding |
|---|---|---|
| 代表 | word2vec、GloVe、fastText | BERT、Sentence-BERT、modern embedding models |
| 一个词有几个向量 | 一个,固定不变 | 每出现一次算一次,随语境变化 |
| 两句话里的 bank | 同一个向量 | 两个不同的向量 |
| 能否区分同形异义词 | 不能 | 能 |

Slide 62 还给出了文本表示的演进线和应用:

> **Evolution of Text Representation** — BoW / TF−IDF → Word Embeddings → Contextual Embeddings
> **Examples:** BERT, Sentence-BERT, modern embedding models
> **Applications:** semantic similarity, search, clustering, classification

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
bow: "BoW / TF-IDF\n一篇文档 = 词表长度的计数向量\n词与词之间没有相似度"
we: "Word embeddings:word2vec · GloVe · fastText\n一个词 = 一个固定的稠密向量"
ce: "Contextual embeddings:BERT · Sentence-BERT\n同一个词随语境得到不同向量" {class: key}
bow -> we: "词有了语义"
we -> ce: "词有了语境"
```

讲师说,word embedding 相对 BoW 已经是一大步,如今又走到了 contextual embedding。典型的例子是 **BERT(Bidirectional Encoder Representations from Transformers)**,它是基于 Transformer 的模型,能考虑句子里各个词之间的关系。有了 contextual embedding,相似度检索、clustering、classification 都会更准。

> 📎 **拓展(超出 slides)** — **Transformer** 的核心是 **attention(注意力)** 机制:计算一个词的向量时,模型会看句子里的所有其他词,并学会给它们分配不同的权重。在 "loan from the bank" 里,bank 会更多地"注意" loan,于是得到"银行"的意思。BERT 的 *bidirectional* 指它同时看左边和右边的语境。**Sentence-BERT** 在 BERT 基础上为整句话生成一个向量,两句话意思是否相近,直接比较两个向量的 cosine 即可。§31 的 semantic search 用的就是这种句子向量。

## §30 从 task-specific models 到 LLMs

表示在进步,模型的用法也变了。Slide 63:

> **From Task-Specific Models to General-Purpose Language Models**
> **Traditional text analytics** — Text → Features → Task-specific model → Prediction
> **Examples:** TF-IDF + classifier → document classification; LDA → topic discovery; BoW + Naïve Bayes → sentiment analysis

讲师说,我们上周讲的都是这种做法:先收集文本,再想办法表示文本,然后选一个模型,比如 Naïve Bayes,做出预测。"*这只是为了情感分析。如果要把文本分到别的类别,或者要做 clustering 而不是 classification,就得换别的模型。*" 一个任务一个模型,这就是 **task-specific(针对特定任务)**。

Slide 64:

> **Large Language Models (LLMs)** — Text + Instruction → Pretrained LLM → Different language tasks: classification and sentiment analysis, information extraction, question answering, summarisation, translation, and text generation.
> **Key developments** — Built primarily using the **Transformer** architecture; learn from very large text collections; can perform new tasks through **instructions and examples**; support **zero-shot and few-shot learning**.

> 🎙️ "*如今你用 ChatGPT、Gemini 或者 Claude,会发现有了一个大语言模型,就能做很多任务。你给一段文本,再给一些指令,它就帮你完成各种任务:从分类、情感分析,到总结一篇长文档,到根据文档内容回答你的问题,到在不同语言之间翻译,甚至根据给定的文本生成新的文本。在大语言模型出现之前,每个任务都得开发一个专门的模型、一套专门的流程。现在我们把它当作通用模型来用。*"

讲师接着概括了 LLM 的几个要点:它建立在 Transformer 架构上,Transformer 是基于 attention 机制的著名模型;训练它需要非常大的文本集合;和它交互时,你给出指令、给出例子,它就能很快领会你的意思,"*从很少的例子里很快学会,也许一两个例子就够*",然后完成新的任务。

> 📎 **Zero-shot 与 few-shot(超出 slides)** — **Zero-shot** 指不给任何例子,只用指令描述任务;**few-shot** 指在指令里附上几个示范例子。以情感分析为例:
>
> ```text
> # zero-shot
> Classify the sentiment of this review as positive or negative.
> Review: "The buttons did not work and support never replied."
> Sentiment:
>
> # few-shot
> Review: "Battery lasts two days, love it."
> Sentiment: positive
> Review: "Screen cracked within a week."
> Sentiment: negative
> Review: "The buttons did not work and support never replied."
> Sentiment:
> ```
>
> 对比 §8 的例子:LLM 读的是完整的句子,不需要去停用词,"did not work" 里的 not 不会丢。这就是 slide 7 红字说的 *more robust to context*。

```d2
direction: down
trad: "传统:一个任务一个模型" {
  grid-columns: 3
  t1: "TF-IDF + classifier\n→ 文档分类"
  t2: "LDA\n→ 主题发现"
  t3: "BoW + Naïve Bayes\n→ 情感分析"
}
llm: "LLM:一个模型,多种任务" {
  in: "Text + Instruction"
  m: "Pretrained LLM(Transformer)"
  out: "分类与情感分析 · 信息抽取\n问答 · 摘要 · 翻译 · 文本生成"
  in -> m -> out
}
trad -> llm: "task-specific → general-purpose"
```

| | Traditional text analytics | LLMs |
|---|---|---|
| 流程 | Text → Features → Task-specific model → Prediction | Text + Instruction → Pretrained LLM → Different tasks |
| 一个模型能做几件事 | 一件 | 很多件 |
| 换一个任务 | 重新选特征、重新训练模型 | 换一条指令,或者给几个例子 |
| 需要的数据 | 每个任务各自要一批带标签的数据 | 预训练用海量文本;用的时候 zero-shot 或 few-shot |
| 代表 | TF-IDF + classifier、LDA、BoW + Naïve Bayes | ChatGPT、Gemini、Claude 等 |

## §31 Semantic search、RAG 与 AI agents

Slides 65–67 的标题是 **Where Is Text Analytics Going? Beyond LLMs: Search, RAG and AI Agents**,讲的是建立在 embedding 和 LLM 之上的三种系统。

### Semantic search(语义搜索)

> **Traditional search:** keywords → matching words
> **Modern semantic search:** Query → Embedding → Semantically similar documents. Search by **meaning**, not only matching words. Useful for large document collections.(slide 65)

讲师解释:有了 contextual embedding 和 **vector database(向量数据库)**,搜索不再靠关键词精确匹配。查询先变成一个 embedding,再拿它和文档的 embedding 比较(比如算 Euclidean distance),找出最相似的文档。"*Embedding 让我们按意思搜索,而不是按匹配的词搜索。*"

> 📎 **例(超出 slides)** — 查询 "cheap flights to Sydney",一篇写着 "low-cost airfare to Sydney" 的文档,除了 Sydney 以外一个关键词都对不上,关键词搜索很可能找不到它;它们的句子向量却很接近,语义搜索能找到。向量数据库负责存放海量文档的向量,并能快速找出离查询向量最近的若干个。

### RAG(Retrieval-Augmented Generation,检索增强生成)

> **Question → Retrieve relevant information → LLM → Answer.** Combines information retrieval + LLMs. Allows LLMs to use external or domain-specific information. Important for analysing large organisational document collections.(slide 66)

讲师说得很具体:有了问题,先用语义相似度搜索,从一个大型数据库或知识库里检索出相关的信息;再把检索到的信息连同指令一起交给 LLM,产出需要的结果。为什么不直接把整个 corpus 都交给 LLM?

> 🎙️ "*大语言模型处理不了非常长的输入。如果你有一个很大的文档,甚至一整个文档数据库,就得用 RAG,只把相关的信息、相关的段落提取出来,和你的指令一起交给大语言模型。*"

他还指出了 RAG 的另一个好处:任何新信息都可以存进外部的数据库或"记忆"里,LLM 需要时检索出来,这样最新的信息也能被用上。

```d2
grid-rows: 2
grid-columns: 3
horizontal-gap: 70
vertical-gap: 60
q: "Question"
emb: "问题转成 embedding"
db: "向量数据库\n组织内部的文档" {shape: cylinder}
a: "Answer"
llm: "LLM"
hits: "最相关的几段文字"
q -> emb
emb -> db: "semantic search"
db -> hits
hits -> llm: "连同问题与指令"
llm -> a
```

> 📎 **拓展(超出 slides)** — RAG 让 LLM 的回答有据可查:答案来自检索到的文档,可以注明出处,也减少了模型"一本正经地编造"(hallucination)。公司内部文档是 LLM 训练时从没见过的,不用重新训练模型,放进向量数据库就能用。

### AI agents(AI 智能体)

> **Understand → Search → Use Tools → Reason → Act.** LLMs can become components of systems that interact with: databases, search engines, APIs, software tools, and other data sources.(slide 67)

讲师把 LLM 比作**大脑**:

> 🎙️ "*有了大脑,就能做规划,能选择工具,能按计划行动,还能反思结果。这样就有了 AI agent,甚至一组 AI agents:接到一个复杂的任务,它们先做规划,再互相协作、检查彼此的结果,最后汇总输出。*"

他对比了以前和现在:以前,数据工程师、数据科学家得手工组织各种针对特定任务的工具,决定"你先跑,结果交给它,再用这个算法检查";现在,LLM 作为大脑来协调整个流程,它可以访问数据库收集信息,用搜索引擎查互联网,调用 API,使用各种软件工具。"*这会大大增强大语言模型的能力。*" 整个过程的自动化程度高得多。

```d2
grid-rows: 2
grid-columns: 3
horizontal-gap: 70
vertical-gap: 60
u: "Understand\n理解任务"
s: "Search\n检索信息"
t: "Use Tools\n数据库 · 搜索引擎\nAPI · 软件工具"
blank: "" {style: {opacity: 0}}
a: "Act\n执行 · 输出"
r: "Reason\n推理 · 规划 · 检查结果"
u -> s
s -> t
t -> r
r -> a
a -> u: "反思结果,进入下一轮" {style: {stroke-dash: 3}}
```

> 📎 **例(超出 slides)** — 回到开篇的公司。给 agent 一个任务:"写一份本周用户怎么评价 bPhone 的报告"。它可能这样做:调用社交媒体 API 抓取帖子(①收集),用 LLM 判断每条帖子的情感(⑤情感分析),归纳出大家集中讨论的问题(④主题),查销售数据库对照退货率,最后写成报告(⑥洞察)。开篇那条六步流水线,由 agent 自动串了起来。

| | 做什么 | 依靠什么 |
|---|---|---|
| Keyword search | 找出包含查询关键词的文档 | 词的精确匹配 |
| Semantic search | 找出**意思**相近的文档 | embedding + 向量数据库 |
| RAG | 先检索,再让 LLM 基于检索结果回答 | semantic search + LLM |
| AI agents | 理解任务,检索,调用工具,推理,行动 | LLM 作为大脑 + 数据库、搜索引擎、API、软件工具 |

Slide 67 最后列了一份延伸学习清单:**Transformers / BERT / LLMs / Embeddings / Vector Databases / RAG / AI Agents**。讲师说,如果对文本分析的最新发展感兴趣,就从 Transformer 的基本思想开始,依次看 BERT 怎么工作、LLM 怎么工作、什么是 contextual embedding、什么是向量数据库、RAG 技术,以及 AI agents 怎样用于文本分析。

## §32 回顾:文本分析的演进

Week 8 课上的总结(slide 60)回顾了传统流程:

> **Summary** — Discussed several subtasks of text analysis. Talks about a typical text analysis process: collecting raw text; representing text; using TFIDF to describe each word in each doc; topic modelling; sentiment analysis; gaining greater insights.

讲师在 Week 9 补完最后几页后,用 slides 68–70 把传统和现代放在一起:

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
trad: "Traditional Text Analytics(slide 68)" {
  raw: "Raw Text"
  bow: "BoW / TF-IDF"
  out: "Topic Modeling /\nClassification /\nSentiment Analysis"
  raw -> bow: "Preprocessing"
  bow -> out: "Statistical / ML models"
}
modern: "Modern Text Analytics(slide 69)" {
  we: "Word Embeddings"
  ce: "Contextual Embeddings"
  llm: "Transformers / LLMs"
  app: "Semantic Search /\nRAG / AI Agents" {class: key}
  we -> ce -> llm -> app
}
```

> ⚠️ Slide 68 最后一格写的是 "Topic Modeling / Classification / **Semantic** Analysis"。按本章内容和 slide 63 的例子(BoW + Naïve Bayes → sentiment analysis),这里指的是 **sentiment analysis**。讲师在录音里也常把 sentiment 说成 semantic。上图按 sentiment analysis 画。

Slide 69 总结了三个转变:

> - **Word counts → semantic and contextual representations.**
> - **Task-specific models → general-purpose pretrained language models.**
> - **Analysing text → retrieving, reasoning over, generating and acting on information.**

讲师逐条解读:**表示**进步了,从数词频到表达语义和语境;**模型**进步了,从一个任务一个模型到通用的预训练语言模型;**做的事**也变了,从分析文本到检索、推理、生成并依据信息采取行动。他特别强调了第四点:

> 🎙️ "*更重要的是,这一切都以更自动化的方式完成,而不是手工完成。这是最重要的进步,它让我们能高效地分析更大规模的文本数据集。*"

最后,slide 70 用一句话收尾:

> **The fundamental goal remains the same: transforming unstructured text into useful information, knowledge and insights.**

讲师说,根本目标没有变,变的是我们有了更强大的工具,能以更高的效率处理更大规模的数据,而这个领域仍在飞速发展。回头看这一章:从 bag-of-words 到 LLM,每一步都在回答同一个问题,怎样把 §1 那段"没有 schema、没有一致性、没有显式语义"的文字,变成计算机能理解、能计算的表示。

---

# 本章小结 (Key takeaways)

- **Text analysis 是对文本数据的 representation、processing 和 modelling**,目标是得到有用的洞察。它有两个先天难点:用词表示文档会得到维度极高的向量(curse of high dimensionality);文本大多是 unstructured 的,没有 schema、没有一致性、没有显式语义。
- **理解文本要跨过三层**:syntax(结构与语法)、semantics(句子的意思)、pragmatics(语境中的意思);词这一级还有 homonyms 和 acronyms 造成的歧义,要靠上下文消歧。对计算机来说,原始文本只是一串数字,没有天然的相似度,所以 **representation 是核心问题**。
- **文本分析的六步流程**:collect raw text → represent text → TFIDF / topic modeling / sentiment analysis → gain insights。收集时要尊重数据所有者的权利。
- **Text normalization** 依次做 tokenization、case folding、去 stop words、stemming 或 lemmatization。每一步都没有通用的做法,也都可能丢信息:Back of Bourke 被拆散,WHO 变成 who,删掉 not 之后情感就反了。Stemming 快而粗,lemmatization 慢而准,两者选一个。
- **Bag-of-words** 把文档表示成"词典里每个词出现与否(或出现几次)"的高维稀疏向量,忽略词序、语境和语义,"a dog bites a man" 和 "a man bites a dog" 无法区分。它简单,适合作为 baseline。
- **IC $=-\log P(x)$** 衡量词的重要性,但它是预先算好、固定不变的,无法适应变化的数据和新词。**TFIDF $=\text{TF}\times\text{IDF}$** 完全从抓取到的文档算出:TF 是局部视角(在本文档里多常见),IDF $=\log\frac{N}{\text{DF}}$ 是全局视角(在 corpus 里多罕见)。一个词在本文档中常见、在 corpus 中少见,TFIDF 才高。
- **Zipf's law**:第 $i$ 常见的词出现次数约为最常见词的 $1/i$。少数词(大多是停用词)占了大头,绝大多数词都很罕见。
- **TFIDF 仍是一词一维**,压缩不了描述长度,也看不出词与词、文档与文档之间的结构。**Topic model** 用主题来表示文档:一个 topic 是固定词表上的一个分布,一篇文档是若干主题按比例的混合。
- **LDA 是一个生成概率模型**:先定长度 $N$,再从 $\text{Dir}(\alpha)$ 抽出文档的主题比例 θ,然后每个词先按 θ 抽主题、再按主题的词分布抽词。现实中只有文档可见,LDA 用 collapsed Gibbs sampling 反推:随机初始化,反复按"文档有多偏爱这个主题 × 主题有多偏爱这个词"重新抽样,直到稳定。**α 管文档–主题,β 管主题–词**,调大都会让分布更平均。
- **Sentiment analysis 是一个分类问题**:NLTK 影评例子用 1600/400 划分、BoW 特征、Naïve Bayes,准确率 73.5%。三个注意事项:换了 domain 就不能直接用;绝对分数没有意义,要和基准比;大量数据可以用表情符号或 MTurk 打标签。
- **结果可视化**有 word cloud(词频)、TFIDF 高亮、LDA 的主题圆图和主题–词分布图。
- **One-hot 编码下,任意两个不同的词距离都是 $\sqrt2$**,表达不了相似。**Word embedding** 从文本中学出稠密向量:意思相近的词向量相近,向量差还能编码关系,$D=C+(B-A)$。**Contextual embedding**(BERT)再进一步,同一个词在不同语境下得到不同的向量,两句话里的 bank 可以区分开。
- **演进的三个转变**:word counts → semantic and contextual representations;task-specific models → general-purpose pretrained LLMs;analysing text → retrieving, reasoning over, generating and acting on information(semantic search、RAG、AI agents)。**根本目标始终不变:把非结构化的文本变成有用的信息、知识和洞察。**

# 公式速查

| 量 | 公式 | 说明 / slides 上的例子 |
|---|---|---|
| Information content | $\text{IC}(x)=-\log P(x)$ | 越罕见越大;IC 固定,不随数据变 |
| Term frequency(计数) | $\text{TF}_1(t,d)=\sum_{i=1}^{n}f(t,t_i)$,$f(t,t')=1$ 当 $t=t'$,否则为 0 | $t$ 在 $d$ 中出现的次数 |
| Term frequency(对数) | $\text{TF}_2(t,d)=\log[\text{TF}_1(t,d)+1]$ | 压缩大计数 |
| Term frequency(比例) | $\text{TF}_3(t,d)=\text{TF}_1(t,d)/n$,$\lvert d\rvert=n$ | 消除文档长度的影响 |
| Document frequency | $\text{DF}(t)=\sum_{i=1}^{N}f'(t,d_i)$,$f'(t,d')=1$ 当 $t\in d'$,否则为 0 | 含有 $t$ 的文档数 |
| Inverse document frequency | $\text{IDF}_1(t)=\log\dfrac{N}{\text{DF}(t)}$,$\text{IDF}_2(t)=\log\dfrac{N}{\text{DF}(t)+1}$ | 只依赖 DF;篇篇都有时 $\text{IDF}_1=0$ |
| TFIDF | $\text{TFIDF}(t,d)=\text{TF}(t,d)\times\text{IDF}(t)$ | 本文档常见、corpus 少见 → 高 |
| Zipf's law | $f(r)\approx f(1)/r$ | 第 $i$ 常见的词约为第 1 名的 $1/i$ |
| LDA 生成过程 | $N\sim\text{Poisson}(\xi)$;$\theta\sim\text{Dir}(\alpha)$;$z_n\sim\text{Multinomial}(\theta)$;$w_n\sim p(w_n\mid z_n,\beta)$ | slide 39 |
| 📎 Gibbs 抽样概率 | $P(z_i=k\mid\cdot)\propto(n_{d,k}+\alpha)\,\dfrac{n_{k,w}+\beta}{n_k+V\beta}$ | 对应 slide 40 第 3 步的两个计数 |
| 📎 主题比例与词分布的估计 | $\hat\theta_{d,k}=\dfrac{n_{d,k}+\alpha}{n_d+K\alpha}$,$\hat\phi_{k,w}=\dfrac{n_{k,w}+\beta}{n_k+V\beta}$ | 对应 slide 40 第 5 步 |
| 📎 Cosine similarity | $\cos(\mathbf{u},\mathbf{v})=\dfrac{\mathbf{u}\cdot\mathbf{v}}{\lVert\mathbf{u}\rVert\,\lVert\mathbf{v}\rVert}$ | 比较两个向量的方向 |
| One-hot 距离 | $\lVert\mathbf{e}_i-\mathbf{e}_j\rVert=\sqrt2$($i\ne j$) | 任意两个不同的词都一样远 |
| 词向量类比 | $D=C+(B-A)$ | Athens : Greece = Oslo : Norway |

# 全章概念地图

绿色是各种表示方法,灰色是建立在表示之上的任务:

```d2
direction: down
classes: {
  rep: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
  task: {style: {fill: "#f7f7f7"; stroke: "#888888"}}
}
bow: "Raw text → normalization → BoW\n0/1 或计数" {class: rep}
tfidf: "TFIDF\nTF × IDF" {class: rep}
topic: "Topics(LDA)\nK 维主题比例" {class: rep}
we: "Word embeddings\n稠密词向量" {class: rep}
ce: "Contextual embeddings\n随语境变化" {class: rep}
llm: "LLMs\nText + Instruction" {class: rep}
cls: "Classification\n情感分析" {class: task}
clu: "Clustering\n文档分组" {class: task}
vis: "Gain insights\n可视化" {class: task}
sys: "Semantic search\nRAG · AI agents" {class: task}
bow -> tfidf: "给词加权"
bow -> topic: "压缩成主题"
bow -> we: "词有了语义"
we -> ce: "词有了语境"
ce -> llm
tfidf -> cls
tfidf -> vis
topic -> clu
topic -> vis
ce -> sys
llm -> sys
```

# 考点提示与易错点

1. **定义要背准**:text analysis 是 *representation, processing, and modelling of textual data to derive useful insights*;corpus 是 *a collection of texts (documents)*;topic 是 *a distribution over a fixed vocabulary of words*。
2. **Syntax / semantics / pragmatics** 各自的定义和例子(dog chased a rabbit;Break it down)。**Homonyms**(同形异义:bark、left、Amazon)和 **acronyms**(缩写:CGI)要分清,两者都靠 disambiguation 解决。
3. **数据结构类型**:web pages、social network API 是 semi-structured;server logs 是 semi- 或 quasi-structured;其余几类是 unstructured。
4. **Tokenization 的例子**:`day` vs `day.`(只按空格切的问题);we'll、state-of-the-art(按标点切的问题);Back of Bourke、résumé(比想象的难)。结论:no one-size-fits-all。
5. **Case folding 的反例**:General Motors、WHO、US;对策是查找表。
6. **Stemming 与 lemmatization**:walk 是 stemmed 的例子,goose、good 是 lemmatized 的例子;stemming 快而粗、可能产生非词,lemmatization 慢而准、得到真词;Porter stemmer、WordNet lemmatizer。
7. **BoW 忽略了什么**:order、context、inferences、semantics。会手写 slides 18–19 的三个向量。
8. **IC 的两个问题**:corpus 和 IC metadata 不随时间变化;新话题、新概念识别不了。TFIDF 的优点:完全基于抓取到的文档,数据变了容易更新。
9. **TFIDF 的公式全部要能默写**,注意:
   - DF 数的是**文档数**,一篇文档里出现多少次都只算 1;
   - IDF **只依赖 DF**,不依赖具体文档;
   - 篇篇都出现的词,$\text{IDF}_1=\log 1=0$;
   - $\text{IDF}_2$ 的 $+1$ 是为了防止分母为 0;
   - 对数的底 slides 没有规定,计算题按题目给定的底来算,或者写明自己用的底。
10. **Zipf's law** 的陈述:the $i$-th most common word occurs approximately $1/i$ as the most frequent term。
11. **TFIDF 的三个局限**(slide 29):仍是高维向量;description length 几乎没有缩短;看不出文档内、文档间的统计结构。
12. **LDA 的关键词**:generative probabilistic model、hierarchical Bayes、hidden variables;只有文档可见;要推断 topics、topic proportions、topic assignments。四条假设要能默写:固定词表、主题数预先给定、主题是词上的分布、文档是主题的随机混合。
13. **Recipe 和正式写法要能互相对应**:$N\sim\text{Poisson}(\xi)$,$\theta\sim\text{Dir}(\alpha)$,$z_n\sim\text{Multinomial}(\theta)$,$w_n\sim p(w_n\mid z_n,\beta)$。
14. **α 与 β 不要搞反**:α 管文档–主题(调大 → 每篇文档包含更多主题),β 管主题–词(调大 → 每个主题包含更多词)。录音里讲师说反过一次。
15. **Collapsed Gibbs sampling 的五步**,尤其是第 3 步的两个计数:文档 $d$ 里各主题有几个词;词 $w$ 在全部文档里被分给各主题几次。
16. **R 代码**:`K=10` 是主题数,`25` 是迭代次数,两个 `0.1` 是 α 和 β;`top.topic.words(..., 5, ...)` 取每个主题的前 5 个词。
17. **情感分析的数字**:2000 条影评(1000 正、1000 负),1600 训练 / 400 测试,BoW 特征,Naïve Bayes,准确率 73.5%。三个坑:domain、absolute level、labeling(emoticons、MTurk)。
18. **四种可视化**分别依据什么:word cloud 依据词频;TFIDF 高亮依据 TFIDF;circular graph 里圆盘大小表示词的权重;主题–词分布图里点的大小表示权重。
19. **One-hot 的距离恒为 $\sqrt2$**;word embedding 的两条性质:相近的词向量相近、向量差编码关系;三种预训练向量:word2vec、GloVe、fastText。
20. **Word vs. contextual embedding**:前者一词一向量、不随语境变;后者随语境变(bank 的例子),代表是 BERT、Sentence-BERT。
21. **LLM 的四个 key developments**:Transformer;非常大的文本集合;通过指令和例子完成新任务;zero-shot、few-shot。**RAG** 的流程:Question → Retrieve → LLM → Answer。**AI agents**:Understand → Search → Use Tools → Reason → Act。
22. **Slide 68 的 "Semantic Analysis" 指 sentiment analysis**;slide 47 的 "exact" 是 *extract* 的笔误。

# 自测题

1. Text analysis 为什么 "suffers from the curse of high dimensionality"? 为什么说文本是 unstructured 的? 各用两三句话回答。
2. 下面四种文本来源分别属于哪种数据结构类型:(a) 电子邮件;(b) 网页;(c) 服务器日志;(d) 社交网络 API 返回的 JSON。
3. 分别说明 "Break it down." 和 "dog bark vs. tree bark" 体现的是哪一类难点,人是怎么消除这种歧义的。
4. 一段文本里有 "WHO said the US economy grew."。直接做 case folding 会出什么问题? 怎么避免?
5. 判断下列说法对错:
   - (a) Stemming 的结果一定是词典里的词。
   - (b) Lemmatization 能把 geese 还原成 goose。
   - (c) 用 LLM 做文本分析时,一般必须先做 stemming。
   - (d) Bag-of-words 能区分 "a dog bites a man" 和 "a man bites a dog"。
6. 写出 IC 的公式,并说明 slide 21 指出的 IC 的两个问题。
7. 计算题。一个 corpus 有 4 篇文档(已做好规范化):
   - $d_1$:data mining data analysis
   - $d_2$:text mining text analysis text
   - $d_3$:image analysis
   - $d_4$:data visualization

   以 10 为底,TF 用 $\text{TF}_1$,IDF 用 $\text{IDF}_1$:
   - (a) 求 data、mining、analysis、text 的 DF 和 IDF;
   - (b) 求 $\text{TFIDF}(\text{data},d_1)$、$\text{TFIDF}(\text{analysis},d_1)$、$\text{TFIDF}(\text{text},d_2)$、$\text{TFIDF}(\text{mining},d_2)$;
   - (c) 求 $\text{TF}_3(\text{text},d_2)$,以及 analysis 的 $\text{IDF}_2$;
   - (d) 哪个词最能代表 $d_2$? 为什么 analysis 在 $d_1$ 里的得分这么低?
8. 一个 corpus 里最常见的词出现了 6000 次。按 Zipf's law,第 3 常见和第 20 常见的词大约各出现多少次? 这对 BoW 表示意味着什么?
9. Slide 29 说 TFIDF "provides relatively small amount of reduction in description length"。这句话是什么意思? Topic model 怎样解决这个问题?
10. 写出 LDA 生成一篇文档的过程(recipe 和正式写法都要)。在这个过程中,哪些变量是观察得到的? LDA 要推断哪三样东西?
11. 你要对一批推文做 LDA,每条推文只有十几个词,通常只讲一件事。α 应该取得偏大还是偏小? 为什么?
12. 手算一步 Gibbs sampling:$K=2$,$V=100$,$\alpha=0.5$,$\beta=0.1$。文档 $d$ 里(不算当前词)主题 1、主题 2 各有 2 个词;当前词 $w$ 在全库中(不算当前这次)被分给主题 1 共 9 次、主题 2 共 1 次;全库分给两个主题的总词数都是 100。求当前词被分到主题 1 的概率。这个结果主要由哪一个因子决定?
13. 用 slide 50 的例子说明怎样把情感分析做成分类问题(数据、划分、特征、分类器、结果)。如果把这个影评分类器直接用到法律服务的客户评价上,会有什么问题?
14. 用 one-hot 编码时,cat 和 kitten 的 Euclidean distance 是多少? cat 和 automobile 呢? 这说明了什么? Word embedding 怎样解决这个问题?
15. 按 slide 58 的方法回答:"walking is to walked as swimming is to ?" 写出所用的向量运算。
16. "We sat on the bank of the river." 和 "She applied for a loan from the bank." 用 word2vec 和用 BERT 表示 bank,结果有什么不同? 为什么?
17. 为什么企业分析内部文档时需要 RAG,而不是直接把全部文档交给 LLM? 写出 RAG 的流程。

<details>
<summary><b>参考答案(先自己做完再展开)</b></summary>

1. 用词来表示文档时,词典里的每个词占一维,词典有成千上万个词,文档向量的维度就有成千上万,而且绝大多数位置是 0。文本没有预定义的 schema,同一件事有无数种说法,每个词的意思和作用也没有显式标注;它是自由的、依赖语境的、有歧义的,所以是 unstructured,必须先预处理成结构化的表示。

2. (a) unstructured;(b) semi-structured;(c) semi-structured 或 quasi-structured;(d) semi-structured。

3. "Break it down." 是 **pragmatics**:同一句话在不同语境里意思不同(推倒建筑 / 简化概念)。bark 是 **homonym**:拼写相同、意思不同。人靠上下文消歧:看前后的词和说话的场景(dog 还是 tree;拆迁现场还是会议室)。

4. WHO(世界卫生组织)会变成 who,US(美国)会变成 us,专有名词变成普通词,意思就变了。对策是维护一张 lookup table,列出不做 case folding 的词。

5. (a) 错,stemming 可能产生非词,比如 Porter 把 studies 变成 studi。(b) 对,这是 lemmatization 能做、stemming 做不到的事。(c) 错,slide 15 的红字说用 embeddings / LLMs 时可能两个都不需要,模型内部能处理词形变化。(d) 错,BoW 忽略词序,两句话得到同一个向量。

6. $\text{IC}(x)=-\log P(x)$。两个问题:传统 corpus 和 IC metadata 不随时间变化;传统 corpus 把算法能用的知识限制在 corpus 覆盖的范围内,新话题、新概念识别不了。

7. (a) DF 与 IDF($N=4$):

   | 词 | 出现在 | DF | $\text{IDF}_1=\log_{10}(4/\text{DF})$ |
   |---|---|---|---|
   | data | $d_1$, $d_4$ | 2 | 0.301 |
   | mining | $d_1$, $d_2$ | 2 | 0.301 |
   | analysis | $d_1$, $d_2$, $d_3$ | 3 | 0.125 |
   | text | $d_2$ | 1 | 0.602 |

   (b) $\text{TFIDF}(\text{data},d_1)=2\times0.301=0.602$;$\text{TFIDF}(\text{analysis},d_1)=1\times0.125=0.125$;$\text{TFIDF}(\text{text},d_2)=3\times0.602=1.806$;$\text{TFIDF}(\text{mining},d_2)=1\times0.301=0.301$。

   (c) $\text{TF}_3(\text{text},d_2)=3/5=0.6$;analysis 的 $\text{IDF}_2=\log_{10}\frac{4}{3+1}=0$。

   (d) text 最能代表 $d_2$:它在 $d_2$ 里出现了 3 次(TF 高),又只出现在 $d_2$ 里(IDF 最高)。analysis 出现在 4 篇里的 3 篇,几乎是背景词,IDF 很低,所以在 $d_1$ 里的得分只有 0.125。

8. 第 3 名约 $6000/3=2000$ 次,第 20 名约 $6000/20=300$ 次。少数几个词(多是停用词)占了绝大部分词次,词典里绝大多数词都很罕见:只看 TF,排在前面的总是停用词;每篇文档只用到词典的一小部分,BoW 向量非常稀疏。

9. 用 TFIDF 描述一篇文档,仍需要词典大小那么多个数,它只是重新分配了权重,没有把信息压缩成更少的数。Topic model 用 $K$ 个主题(比如 10 个)的比例来描述一篇文档,从几千维降到 $K$ 维,而且每一维都可以解释。

10. Recipe:选定长度 $N$;选一个主题分布;对 $N$ 个词中的每一个,先按主题分布选一个主题,再从这个主题里选一个词。正式写法:$N\sim\text{Poisson}(\xi)$;$\theta\sim\text{Dir}(\alpha)$;对每个词,$z_n\sim\text{Multinomial}(\theta)$,$w_n\sim p(w_n\mid z_n,\beta)$。只有词 $w$(也就是文档)是观察得到的。LDA 要推断:主题(每个主题的词分布)、每篇文档的主题比例、每个词的主题分配。

11. 偏小。α 管文档–主题分布,α 小时,每篇文档集中在少数几个主题上,符合"一条推文只讲一件事"的情况;α 大则假设每篇文档混合了很多主题。

12. 主题 1:$(2+0.5)\times\dfrac{9+0.1}{100+100\times0.1}=2.5\times\dfrac{9.1}{110}\approx0.2068$;主题 2:$2.5\times\dfrac{1.1}{110}=0.025$。$P(\text{主题 1})=\dfrac{0.2068}{0.2068+0.025}\approx0.89$。文档这一侧两个主题打平(都是 2.5),结果完全由词这一侧决定:9.1 比 1.1。

13. 数据:2000 条人工标注的影评,正负各 1000;划分:1600 条训练、400 条测试;特征:BoW;分类器:用 NLTK 的 Naïve Bayes 在训练集上训练;结果:测试集准确率 73.5%,并可列出 most informative features。直接用到法律服务评价上会出问题:分类器完全依赖它的训练数据,词义和表达习惯随 domain 而变,法律服务的评价普遍更中立,所以既不能直接套用,也不能只看绝对分数,要和该领域的基准比较。

14. 都是 $\sqrt2$。One-hot 编码下任意两个不同的词距离都相同,表达不了 cat 和 kitten 意思相近。Word embedding 从大量文本中学出稠密向量,上下文相似的词向量相近,于是 cat 和 kitten 距离小,cat 和 automobile 距离大。

15. A = walking,B = walked,C = swimming,$D=C+(B-A)=\text{swimming}+(\text{walked}-\text{walking})$,找离它最近的词:swam(关系是 past tense)。

16. word2vec 给两个 bank 同一个向量,一个词只有一个固定的表示,与语境无关。BERT 是 contextual embedding,计算 bank 的向量时会考虑它前后的词(river 还是 loan),所以两个 bank 得到不同的向量,能区分"河岸"和"银行"。

17. LLM 处理不了非常长的输入,企业的文档库远超它能读入的长度;LLM 训练时也没见过企业内部的文档,而新信息还在不断增加。RAG 先用 semantic search 从文档库里检索出与问题相关的几段,再把它们和问题、指令一起交给 LLM 生成回答:Question → Retrieve relevant information → LLM → Answer。

</details>

---

# 与前后各周的连接

```d2
direction: right
classes: {
  now: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
W2: "Week 2 · Lifecycle\n数据结构类型"
W3: "Week 3 · Visualization"
W4: "Week 4 · Clustering"
W5: "Week 5 · Classification"
W6: "Week 6 · Regression"
W7: "Week 7 · Association Rules"
W8: "Week 8\nText Analysis" {class: now}
W9: "Week 9\nImage Analysis"
W2 -> W8
W3 -> W8
W4 -> W8
W5 -> W8
W6 -> W8
W7 -> W8
W8 -> W9
```

- **承接 Week 2**:§1 的文本来源表用的就是 structured、semi-structured、quasi-structured、unstructured 四种类型。
- **复用 Week 3**:§26 的词云、TFIDF 高亮和两种 topic 图,都是 Week 3 可视化的具体应用。
- **承接 Week 4**:文档一旦变成向量(BoW、TFIDF 或主题比例),就能用 K-means、hierarchical clustering 分组。📎 LDA 和 K-means 有个有意思的区别:K-means 把每篇文档**只**分到一个簇里,LDA 给每篇文档一个主题**比例**,一篇文档可以同时属于好几个主题。
- **承接 Week 5**:情感分析就是分类问题。Naïve Bayes、训练集/测试集划分,以及 accuracy、precision、recall、ROC、AUC 都直接沿用。
- **承接 Week 6**:NLP 里的 Maximum Entropy classifier 就是多类别的 logistic regression。
- **呼应 Week 7**:关联规则找的是商品的共现,topic model 利用的也是词的共现。Week 7 讲义末尾提到"文本也可以看成篮子",LDA 把这个想法推进了一步:从"哪些词常一起出现"进到"哪些词属于同一个隐藏的主题"。
- **本周 lab**:用 Python 实现 LDA 和 word2vec(slides 43、59)。
- **指向 Week 9**:🎙️ 讲师在 Week 9 开头说,图像分析的流程和文本分析一样:收集数据、表示数据,然后做分类、聚类、检测。表示仍是核心问题。Week 9 的 **bag of visual words** 模型就是受 BoW 启发的;**Vision Transformer** 把一张图切成小块(patches),像对待 token 一样送进 Transformer,用的正是本章 §29–§30 提到的架构。

# 附:录音转写的误识别对照

录音转写里有不少技术词被识别错了,读录音稿时可以对照这张表:

| 转写里的写法 | 实际是 |
|---|---|
| backwards model / back words | bag-of-words model |
| copper、coppers、copperra、compo、CPR、carbon | corpus / corpora |
| Zip's law | Zipf's law |
| semantic analysis、symmetric analysis(讲情感时) | sentiment analysis |
| latent Dirac allocation、Dirichly allocation、directly allocation | Latent Dirichlet Allocation |
| naive-bias、Nabis、naivebias | Naïve Bayes |
| super vector machine、supported vector machine | support vector machine |
| Kinner's neighbor | k-nearest neighbor |
| peacefully(讲大小写时) | case folding |
| starboards | stop words |
| back of Berkeley、back of Berke | Back of Bourke |
| Essence is to grace as also / ocelo | Athens is to Greece as Oslo |
| graph(讲预训练向量时)、glove | GloVe |
| what to vector、what to vet | word2vec |
| faster text | fastText |
| bird(Week 9 录音) | BERT |
| texture analysis | text analysis |
| Google Ingram corpus | Google N-Grams corpus |
| CICI 446 | CSCI 446 |
| rainforest(Week 9 录音,讲分类器时) | random forest |

---

> **本讲义覆盖 slides 全部 71 页、Week 8 课堂录音全文,以及 Week 9 录音开头对 slides 61–70 的补讲。**
> 标注为 📎 的内容超出 slides 范围,为补足理解所加;标注为 🎙️ 的内容不在 slides 上,但讲师课堂明确讲授,按考试范围对待;标注为 ⚠️ 的是 slides / 录音里的笔误,或需要特别注意的坑。
