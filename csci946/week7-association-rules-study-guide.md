# Week 7 · Association Rules(关联规则)

> **CSCI446/946 Big Data Analytics** — University of Wollongong, Spring 2026
> 本讲义融合 `Week7_Lecture_Association_Rules_Enhanced.pdf`(52 页 slides)与 Week 7 课堂录音转录。
> Slides 中的图表、表格与代码,除特别注明外均出自教材 *Data Science and Big Data Analytics: Discovering, Analyzing, Visualizing and Presenting Data*(EMC Education Services)。
>
> **关于周次**:讲师开场说的是 "week six lecture",`Week6-Regression and Association Rules` 那份 slides 的后半段也是关联规则。本讲义以 Week 7 的 *Enhanced* 版为准:它包含 Week 6 版关联规则部分的全部内容,另外加了课堂提问框、规则生成阶段的剪枝(slides 21–22),以及 R 的 Groceries 实例(slides 34–48)。
>
> **标记说明**:🔑 = 例题 / 手算;🎙️ = 讲师课上讲了、slides 上没有的内容(按考试范围对待);📎 = 超出 slides 和课堂的拓展,为补足理解而加;⚠️ = 易错点,或 slides / 录音里的笔误。

---

> **学习目标 (Learning objectives)** — 读完本章你应该能够:
>
> - **说清关联规则在这门课里的位置**:为什么它和 Week 4 的 clustering 一样是 **unsupervised**、**descriptive**,和上两周的 classification、regression 有什么根本区别;
> - **用 transaction、item、itemset、k-itemset、规则 $X \rightarrow Y$(lhs / rhs)这套词汇**描述一个购物篮数据集;
> - **写出 support 的定义**,能用"比例"和"计数"两种方式设定 minimum support,并判断一个 itemset 是不是 **frequent itemset**;
> - **解释为什么不能暴力枚举**:lattice 里有 $2^d$ 个候选,暴力计数的复杂度是 $O(NMw)$;
> - **陈述并证明 Apriori property(downward closure property)**,并用它的逆否形式在 lattice 上剪枝;
> - **复述 Apriori 算法的输入、输出与逐层循环**,逐行读懂 slides 上的伪代码;
> - **手工跑完 slides 上 6 种商品、5 笔交易的例子**,复现 "41 次 vs 13 次" 的计数对比;
> - **从一个 frequent k-itemset 列出全部 $2^k-2$ 条候选规则**,并能证明 confidence 的 **anti-monotone** 性质 $c(ABC\rightarrow D)\ge c(AB\rightarrow CD)\ge c(A\rightarrow BCD)$;
> - **默写 confidence、lift、leverage 的公式**,说出 $X$、$Y$ 独立时各自的取值,完成 slides 上三道计算题,并写出 lift 与 confidence 的关系;
> - **解释 confidence 为什么会被热门商品误导**,以及 lift、leverage 怎样识破巧合规则;
> - **区分 objective 与 subjective 两类评价标准**,说明规则的 novelty 和价值为什么必须由人判断;
> - **读懂 R 的 `arules` / `arulesViz` 实例**:`apriori()` 的参数与输出、`summary()`、三种 `plot()` 和 `inspect()`。

---

## 开篇:从"预测标签"回到"发现关系"

前两周我们一直在做 **supervised learning(监督学习)**:Week 5 的 classification 预测离散的类别,Week 6 的 regression 预测连续的数值。讲师开场回顾时点出了两者的共同点:数据里既有输入 $X$,也有答案(label),任务是学会从输入预测答案。

这周回到 **unsupervised learning(无监督学习)**。上一次讲 unsupervised 还是 Week 4 的 clustering。和那时一样,我们手里只有数据,没有标签,也没有要预测的东西。我们要做的是研究数据本身,从中找出规律、模式和关联。讲师把这一点和整门课的出发点连在一起:big data analytics 的初衷,就是**从数据里挖出我们原本不知道的有用信息**。关联规则是这个初衷最直接的体现。

设想你是一家超市的店长。每位顾客结账时都会拿到一张小票,上面列着这一单买的全部商品。超市积累小票的速度非常快,一天就有成百上千张,30 天下来就是上万张。面对这堆小票,你会关心这样一些问题(slide 4):

- **哪些商品常被一起买?** 知道了就可以把它们摆在一起、做组合价,顾客不会买了这个、忘了那个。
- **和这位顾客相似的顾客,通常买什么?** 比如"高收入、没有小孩、学历高"这一类顾客偏爱哪些商品,知道了就能做定向推荐。
- **买了某件商品(比如面包)的顾客,还会看什么、买什么?** 也许是牛奶。知道了就能更好地安排货架、管理库存、改进服务。

这些问题有个共同点:没有人事先告诉你"正确答案",答案藏在小票之间的**共现关系**里。**Association rules(关联规则)**,也叫 **association analysis(关联分析)**,就是把这些关系挖出来的技术。

本周的主线可以画成下面这张图。它也是全章的目录:

```d2
grid-rows: 3
grid-columns: 2
horizontal-gap: 100
vertical-gap: 60
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
D: "交易数据库 D\n(transactions)" {shape: cylinder}
S1: "① 找 frequent itemsets\n指标 support · 剪枝 Apriori property\n(Part II)" {class: key}
S3: "③ 评价与排序\nlift · leverage\n(Part IV)"
S2: "② 由 itemsets 生成规则\n指标 confidence · 剪枝 anti-monotone\n(Part III)" {class: key}
S4: "④ 人来判断\nnovelty · 能否付诸行动\n(Part VI)"
blank: "" {style: {opacity: 0}}
D -> S1: "min support δ"
S1 -> S2: "frequent itemsets"
S2 -> S3: "候选规则"
S3 -> S4: "排好序的规则"
```

讲师在开场时专门点明了这一讲的主题:

> 🎙️ *"你会看到,在今天的课里,**计算复杂度是关联规则的首要动机**。我们总是想办法利用各种内在的规律,快速删掉那些我们不感兴趣的 itemset 或规则,因为这个过程非常耗时。"*

带着这句话往下读,你会发现整章的技术内容都围绕同一个套路展开:**找到一条数学性质,用它一次排除一大片候选,不必逐个去数**。第一阶段靠的是 support 的 Apriori property,第二阶段靠的是 confidence 的 anti-monotone property。剩下的篇幅讨论另一个问题:就算算得出来,怎么判断一条规则**值得相信、值得行动**?

---

# Part I · 问题与语言

## §1 关联规则是一种什么样的学习任务

Slide 3 用四句话给关联规则定了性:

> **An unsupervised learning method. Descriptive, not predictive. Discover interesting, hidden relationship — represented as rules or frequent itemsets. Commonly used for mining transactions in databases.**

逐句拆开看。

**Unsupervised(无监督)。** 数据里没有标签。小票上只记了"买了什么",没有哪一列写着"这一单属于哪一类"之类的答案,算法也不需要这样的答案。

**Descriptive, not predictive(描述性,而非预测性)。** 这一点和 clustering 相同,和上两周相反。一个 classifier 训练好之后,要拿去给**新样本**打标签;关联规则不针对任何新样本,它的产出是对**已收集数据的描述**,比如"过去 30 天里,买麦片的人有 90% 也买了牛奶"。这条描述当然可以指导以后的决策(比如怎么摆货架),但算法本身不做预测。

**Discover interesting, hidden relationship(发现有趣的、隐藏的关系)。** 关系有两种表示形式:**frequent itemsets(频繁项集)** 和 **rules(规则)**。讲师特别指出,这两种形式恰好对应关联分析的**两个步骤**:先找 frequent itemsets,再从 frequent itemsets 中生成规则。本章就按这个顺序展开。

**Mining transactions in databases(挖掘数据库里的交易记录)。** 最典型的数据形态是"交易"。下一节就来定义它。

把本课到目前为止的四类方法放在一起比较,关联规则的位置就清楚了:

| | Classification | Regression | Clustering | **Association rules** |
|---|---|---|---|---|
| 本课周次 | Week 5 | Week 6 | Week 4 | **Week 7** |
| 学习类型 | supervised | supervised | unsupervised | **unsupervised** |
| 有没有 label | 有(离散类别) | 有(连续数值) | 没有 | **没有** |
| 目标 | 给新样本分类 | 给新样本估值 | 把对象分组 | **找出 items 之间的共现关系** |
| 产出 | 一个 classifier | 一个回归方程 | 若干个簇 | **frequent itemsets 与规则** |
| predictive 还是 descriptive | predictive | predictive | descriptive | **descriptive** |

## §2 基本词汇:transaction、item、itemset

一张小票就是一笔 **transaction(交易)**,小票上的每一种商品是一个 **item(项)**。讲师的说法很直白:你去 Coles、Woolworths 或 Aldi 买东西,结账时拿到的小票就是一笔交易,它由你买的一件或多件商品组成(slide 5:*"Each transaction consists of one or more items"*)。

Slide 5 接着把任务说得很明确:看哪些 items 常被一起买(*"What items are frequently purchased together"*),目标是发现 items 之间**有趣的关系**(*"Goal: discover 'interesting' relationships among the items"*)。原文特意给 interesting 加了引号:什么样的关系才算"有趣",正是本章后半部分(Part IV、Part VI)要回答的问题。

每笔交易相当于一个购物篮里的东西,所以关联规则也叫 **market basket analysis(购物篮分析)**——即使你结账时根本没提篮子(slide 7)。

篮子里的商品放在一起,构成一个 **itemset(项集)**。Slide 7 的定义是 *"a collection of items or individual entities that contain some kind of relationship"*。含有 $k$ 个 item 的项集叫 **k-itemset**,记作 $\{item_1, item_2, \ldots, item_k\}$:{bread} 是 1-itemset,{bread, milk} 是 2-itemset,{bread, milk, eggs} 是 3-itemset。

itemset 是一个**集合**,这带来两个容易忽略的后果:

- **没有顺序**:{bread, milk} 和 {milk, bread} 是同一个 itemset。
- **只记有没有,不记数量和价格**:一单买了 3 袋面包,在数据里也只记作"有 bread"。关联规则研究的是"同时出现",不是"买了多少"。后面 R 实例里的 binary incidence matrix(slide 36)正是这个意思:每个格子只有 0 和 1。

本章前半部分会反复用到 slide 10 上的这份小数据集,下文称它为**示例交易表**:

| TID | Items |
|---|---|
| 1 | Bread, Milk |
| 2 | Bread, Diaper, Beer, Eggs |
| 3 | Milk, Diaper, Beer, Coke |
| 4 | Bread, Milk, Diaper, Beer |
| 5 | Bread, Milk, Diaper, Coke |

同一份数据也可以写成"交易 × 商品"的 0/1 矩阵。这种写法后面会再出现:R 正是这样存储数据的。

| TID | Bread | Milk | Diaper | Beer | Coke | Eggs |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| 2 | 1 | 0 | 1 | 1 | 0 | 1 |
| 3 | 0 | 1 | 1 | 1 | 1 | 0 |
| 4 | 1 | 1 | 1 | 1 | 0 | 0 |
| 5 | 1 | 1 | 1 | 0 | 1 | 0 |
| **列合计** | **4** | **4** | **4** | **3** | **2** | **1** |

每一列的合计,就是这件商品出现在多少笔交易里。这个数马上就要用到。

> 📎 **拓展(超出 slides)** — 示例交易表里特意放了 Diaper(尿布)和 Beer(啤酒),这是在致敬数据挖掘圈流传最广的一个故事:据说某家零售商发现,买尿布的顾客常常顺手买啤酒。这个故事的细节在流传中被加工过很多次,常被当作数据挖掘的"都市传说"来讲。它之所以有名,是因为它代表了关联规则最想找到的东西:**一个事先想不到、找到了又能付诸行动的共现关系**。

## §3 规则 $X \rightarrow Y$ 怎么读

关联规则的产出是形如 $X \rightarrow Y$ 的 **rule(规则)**。Slide 6 的解释是 *"when item X is observed, item Y is also observed"*:观察到 $X$ 时,也会观察到 $Y$。

- 箭头左边的 $X$ 叫 **left-hand side(lhs,左部)**,也常叫 antecedent(前件);
- 箭头右边的 $Y$ 叫 **right-hand side(rhs,右部)**,也常叫 consequent(后件)。

R 的输出里用的正是 `lhs` 和 `rhs` 两个词;arulesViz 的图上标的是 Antecedent (LHS) 和 Consequent (RHS)。$X$ 和 $Y$ 都是 itemset,而且两者没有公共元素,同一件商品不会同时出现在箭头两边。

Slide 6 的例子:**"Cereal → Milk (90%)"** 是什么意思? 答案是:*"When cereal is purchased, 90% of the time milk is also purchased"*——买麦片的交易里,90% 也买了牛奶。这个 90% 就是后面 §10 要定义的 **confidence**。

Slide 5 的配图还列了几条规则,值得多看一眼:

| 规则 | 百分比 |
|---|---|
| Cereal → Milk | 90% |
| Bread → Milk | 40% |
| Milk → Cereal | 23% |
| Milk → Apples | 10% |
| Wine → Diapers | 2% |

注意第一行和第三行:**Cereal → Milk 是 90%,反过来 Milk → Cereal 只有 23%**。规则是有方向的。原因不难想:几乎每个买麦片的人都要配牛奶,但买牛奶的人很多,其中大部分并不买麦片。§10 会从公式上解释这种不对称。

> ⚠️ **规则说的是"一起出现",不是"谁导致谁"。** Cereal → Milk 并不表示买麦片**导致**买牛奶,只表示两者在交易中常常同时出现。§12 的冰淇淋例子还会说明:就连"一起出现"本身,也可能只是巧合。

## §4 Support:一个 itemset 有多常见

**动机。** 不是所有 itemset 都值得关心。讲师的解释是:

> 🎙️ *"我们对那些很少出现的 itemset 不感兴趣。比如某个 itemset 在几万笔交易里只出现了两三次,说明它不典型、没有代表性。我们想要的是统计规律,所以要用 support 把这些不频繁的 itemset 去掉,它们给不出可靠的信息。"*

**定义(slide 9)。** 给定 itemset $X$,它的 **support(支持度)** 是包含 $X$ 的交易占全部交易的比例,记作 $\text{support}(X)$:

$$\text{Support}(X)=\frac{\text{包含 } X \text{ 的交易数}}{\text{交易总数 } N}$$

讲师的解读是:support 就是"在一笔交易里观察到 $X$"的概率 $P(X)$。

$X$ 可以是单个 item,也可以是一个 itemset。对 itemset 来说,一笔交易必须**同时包含 $X$ 的全部 item** 才计数。讲师强调:*"如果它们没有一起出现,这笔交易就不能算进去。"*

**Frequent itemset(频繁项集)** 是 *"contains items that appear together often enough"* 的 itemset,形式化的定义是:

$$\text{Support}(X)\ \ge\ \text{minimum support}$$

**Minimum support(最小支持度)** 是一个阈值,slide 14 的伪代码里记作 $\delta$。它由你——数据科学家——来定。

> 🎙️ **两种设定 minimum support 的方式。** 一种是用比例,比如 0.02,意思是"至少出现在 2% 的交易里";另一种是直接用出现次数,比如 3,意思是"至少出现在 3 笔交易里"。交易总数 $N$ 是固定的,所以两种写法可以互换:$\text{计数} = \text{比例} \times N$。讲师说,讲例题时用计数更方便手算。

> **🔑 例(在示例交易表上算 support,$N = 5$)**
>
> - $\text{Support}(\{\text{Bread}\}) = 4/5 = 0.8$:TID 1、2、4、5 都有 Bread。
> - $\text{Support}(\{\text{Diaper, Beer}\}) = 3/5 = 0.6$:TID 2、3、4 同时有两者。
> - $\text{Support}(\{\text{Bread, Beer}\}) = 2/5 = 0.4$:只有 TID 2、4。
> - $\text{Support}(\{\text{Bread, Milk, Diaper}\}) = 2/5 = 0.4$:只有 TID 4、5;TID 1 缺 Diaper,TID 2 缺 Milk,TID 3 缺 Bread。
>
> 设 minimum support $= 3$(即 $0.6$),那么 {Bread} 和 {Diaper, Beer} 是 frequent,{Bread, Beer} 和 {Bread, Milk, Diaper} 不是。

> 📎 **记号提醒(超出 slides)** — 后面讲规则时,slides 会写 $\text{Support}(X \wedge Y)$。这里的 $\wedge$ 是逻辑上的"并且":交易**既包含 $X$、又包含 $Y$**。换成集合的写法,它是 itemset $X \cup Y$ 的 support,不是 $X \cap Y$。比如 $X=\{\text{bread, eggs}\}$、$Y=\{\text{milk}\}$,那么 $\text{Support}(X\wedge Y)=\text{Support}(\{\text{bread, eggs, milk}\})$。很多同学在这里把"并且"误当成"交集",结果越算越小。

## §5 为什么不能把所有组合都数一遍

有了 support,最直接的做法是:列出所有可能的 itemset,每个都去数据库里数一遍,留下 frequent 的。Slide 8 的回答干脆利落:

> **Exhaustively check all possible itemsets? — No! The size is exponentially large…**

**有多少个可能的 itemset?** 假设商店一共卖 $d$ 种商品。每种商品要么在 itemset 里,要么不在,所以一共有 $2^d$ 个子集(含空集)。把这些子集按大小一层层排开、用"子集—超集"关系连起来,得到的图叫 **itemset lattice(项集格)**。Slide 12 画的就是 4 种商品 $\{A, B, C, D\}$ 的 lattice,共 16 个节点。

**暴力计数要花多少工夫?** Slide 10 把 lattice 里的**每个** itemset 都当成候选 frequent itemset(candidate),然后扫描数据库,拿每笔交易去和每个候选比对:

> **Complexity ~ $O(NMw)$ ⟹ Expensive since $M = 2^d$ !!!**

三个字母分别是(讲师逐一解释过):

| 符号 | 含义 | 讲师的说明 |
|---|---|---|
| $N$ | 交易笔数 | 可能是 1000、10,000,甚至 100 万 |
| $w$ | 每笔交易的宽度(含有的 item 数,取最大值) | 有的顾客一次买很多,有的只买一两样 |
| $M$ | 候选 itemset 的个数,$M = 2^d$ | $d$ 是商品种类数;一家超市可能有几百上千种 |

$N$ 笔交易,每笔都要和 $M$ 个候选逐一比对,每次比对要看 $w$ 个 item,于是总工作量约为 $N \cdot M \cdot w$。致命的是 $M$:它随商品种数**指数**增长。

| 商品种数 $d$ | 候选 itemset 数 $2^d$ |
|---|---|
| 4 | 16 |
| 6 | 64 |
| 10 | 1,024 |
| 20 | 1,048,576 |
| 169(后面 R 实例的 Groceries 数据集) | 约 $7.5 \times 10^{50}$ |

> 📎 **拓展(超出 slides)** — 感受一下 $7.5 \times 10^{50}$ 有多大:就算一台计算机每秒能检查 $10^9$ 个候选,检查完也要大约 $2 \times 10^{34}$ 年,远远超过宇宙的年龄(约 $1.4\times10^{10}$ 年)。讲师的说法是:*"哪怕你有一台很强的计算机,也处理不了任何真实的应用。"*

所以我们需要更聪明的算法。Slide 8 给出的答案是 **Apriori algorithm**——*"one of the earliest and the most fundamental algorithms for generating association rules"*,它的核心概念正是 support:

> **Key concept: support — for pruning itemsets and controlling the exponential growth of candidate itemsets.**

support 不仅用来判断 itemset 是否 frequent,还用来**剪枝**:在数之前就把注定 infrequent 的候选删掉。下一部分讲它是怎么做到的。

> 📎 **拓展(超出 slides)** — Apriori 由 Rakesh Agrawal 和 Ramakrishnan Srikant 在 1994 年提出,名字来自拉丁语 *a priori*("先验的"),指算法利用了关于 frequent itemset 的先验知识,也就是下一节的 Apriori property。

---

# Part II · Apriori:找出全部 frequent itemsets

## §6 Apriori property:频繁项集的子集一定频繁

整个 Apriori 算法建立在一条非常朴素的性质上。Slide 11:

> **Apriori property (downward closure property): If an itemset is frequent, then any subset of this itemset must also be frequent. It provides the basis for the Apriori algorithm.**

**先看直觉。** 讲师用的例子是 {bread, milk, egg}:如果这三样东西作为一个整体经常被一起买(support 超过阈值),那么单看 bread,它出现的次数只会更多——每一张同时有这三样的小票,上面都有 bread。milk 和 egg 也一样。反过来想:如果其中任何一样本身就达不到阈值,三样一起出现的次数更不可能达到。

**再看证明。** 设 $X \subseteq Y$($X$ 是 $Y$ 的子集)。任何一笔包含 $Y$ 的交易,必然也包含 $X$。所以包含 $X$ 的交易至少和包含 $Y$ 的一样多:

$$X \subseteq Y \ \Longrightarrow\ \text{Support}(X)\ \ge\ \text{Support}(Y)$$

如果 $Y$ 是 frequent,即 $\text{Support}(Y) \ge \delta$,那么 $\text{Support}(X) \ge \text{Support}(Y) \ge \delta$,$X$ 也是 frequent。证毕。

这条不等式换个说法就是:**往 itemset 里加 item,support 只会变小或不变,永远不会变大。** 这种"越加越小"的性质叫 **anti-monotone(反单调)**。§11 会看到 confidence 在特定条件下也有类似的性质。

**Slide 11 的例子。** $\text{Support}(\{\text{bread, jam}\}) = 0.6$ ⟹ $\text{Support}(\{\text{bread}\}) \ge 0.6$ 且 $\text{Support}(\{\text{jam}\}) \ge 0.6$。否则,"bread 和 jam 一起出现在 60% 的交易里"就不可能成立。

**真正用来剪枝的是它的逆否命题。** Slide 11 的最后一句:

> **Therefore, if X is infrequent then all supersets that contain X must also be infrequent.**

讲师称这是 Apriori property *"最重要的结论"*。原因在于算法是**自底向上**跑的:它先数小 itemset,后数大 itemset。一旦发现某个小 itemset 不频繁,就能断定所有包含它的大 itemset 都不频繁,直接跳过,一次都不用数。

> 🎙️ **讲师的"迷你超市"例子(对应 slide 12 的图)** — 假设你的小店只卖 A、B、C、D 四样东西。所有可能的 itemset 有 $2^4 = 16$ 个,去掉空集还剩 15 个。先数四个 1-itemset,发现 B、C、D 都达到阈值(比如 0.1),只有 A 没达到。你立刻知道 AB、AC、AD、ABC、ABD、ACD、ABCD 这 7 个 itemset 全都不可能 frequent,可以直接删掉——15 个候选一下去掉了将近一半。

下图就是 slide 12 的那张 lattice:红色的 A 不频繁;灰色虚线框是 A 的超集,跟着一起被剪掉,根本不必计数;绿色是还需要继续检查的部分。

```d2
direction: down
classes: {
  pruned: {style: {fill: "#f2f2f2"; stroke: "#b0b0b0"; stroke-dash: 3; font-color: "#9a9a9a"}}
  bad: {style: {fill: "#fde8e8"; stroke: "#c0392b"; bold: true}}
  ok: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"}}
}
E: "∅"
A: "A ✗ 不频繁" {class: bad}
B: B {class: ok}
C: C {class: ok}
D: D {class: ok}
AB: AB {class: pruned}
AC: AC {class: pruned}
AD: AD {class: pruned}
BC: BC {class: ok}
BD: BD {class: ok}
CD: CD {class: ok}
ABC: ABC {class: pruned}
ABD: ABD {class: pruned}
ACD: ACD {class: pruned}
BCD: BCD {class: ok}
ABCD: ABCD {class: pruned}
BCD -> ABCD
ACD -> ABCD
ABD -> ABCD
ABC -> ABCD
CD -> BCD
CD -> ACD
BD -> BCD
BD -> ABD
BC -> BCD
BC -> ABC
AD -> ACD
AD -> ABD
AC -> ACD
AC -> ABC
AB -> ABD
AB -> ABC
D -> CD
D -> BD
D -> AD
C -> CD
C -> BC
C -> AC
B -> BD
B -> BC
B -> AB
A -> AD
A -> AC
A -> AB
E -> D
E -> C
E -> B
E -> A
```

> ⚠️ **录音里的一处口误** — 讲到这张图时,讲师说的是 *"since A is infrequent, any **subset** of A must be infrequent too"*。这里应该是 **superset(超集)**。

Apriori property 的两个推理方向千万别记反:

| 已知 | 能推出 | 推理方向 |
|---|---|---|
| $X$ frequent | $X$ 的**所有子集**都 frequent | 向下(downward closure 名字的来历) |
| $X$ infrequent | $X$ 的**所有超集**都 infrequent | 向上(剪枝时用的就是这一条) |
| $X$ frequent | 关于超集**推不出任何结论** | — |
| $X$ infrequent | 关于子集**推不出任何结论** | — |

后两行是考试常设的陷阱。{A} 频繁,不代表 {A, B} 频繁;{A, B} 不频繁,也不代表 {A} 不频繁。

## §7 Apriori 算法:自底向上,一层层长大

有了 Apriori property,算法本身就很简单了。讲师的原话是:*"一旦你理解了这个思路,你会发现 Apriori 算法相当简单。"*

**先用大白话说一遍(slide 13)。** Apriori 采用 **bottom-up iterative(自底向上、迭代)** 的方式寻找 frequent itemsets:

1. 先找出所有 frequent items,也就是 frequent **1-itemsets**;
2. 把找到的 frequent 1-itemsets **两两配对**成 2-itemsets,数一遍,找出 frequent **2-itemsets**;
3. 把已找到的 frequent itemsets 再**长大一号**,再数、再筛;
4. 重复,直到 (1) **runs out of support**(某一层一个 frequent itemset 都找不到),或 (2) itemset 的长度达到**预设上限**。

为什么第 2 步只拿 frequent 的 1-itemsets 去配对? 讲师的解释:*"用不频繁的 1-itemset 你什么也搭不出来。任何建立在不频繁 1-itemset 上的东西都是不频繁的,我们对它不感兴趣。"* 这正是上一节逆否命题的直接应用。

**输入(slide 14)。**

- 一个交易数据库 $D$;
- 一个 minimum support 阈值 $\delta$。🎙️ 讲师提到,实践中 $\delta$ 常取 0.01 左右;
- 一个**可选**参数 $N$,表示 itemset 最多能长到多长。🎙️ 比如设成 10,长到 10 就停。

**伪代码(slide 14)。**

```text
1   Apriori (D, δ, N)
2     k ← 1
3     L_k ← {1-itemsets that satisfy minimum support δ}
4     while L_k ≠ ∅
5       if ∄N ∨ (∃N ∧ k < N)
6         C_{k+1} ← candidate itemsets generated from L_k
7         for each transaction t in database D do
8           increment the counts of C_{k+1} contained in t
9         L_{k+1} ← candidates in C_{k+1} that satisfy minimum support δ
10        k ← k + 1
11    return ∪_k L_k
```

两个记号先说清楚:$L_k$ 是**已确认 frequent** 的 k-itemsets(L 取 large 之意);$C_k$ 是**候选**(candidate)k-itemsets,还没数过。整个算法就是 $L_1 \rightarrow C_2 \rightarrow L_2 \rightarrow C_3 \rightarrow L_3 \rightarrow \cdots$ 的交替。

逐行解读:

| 行 | 做什么 | 说明 |
|---|---|---|
| 2–3 | 从 $k=1$ 开始,数每个单品的 support,满足 $\delta$ 的放进 $L_1$ | 对应"First, identify all frequent items" |
| 4 | 只要上一层还有 frequent itemset 就继续 | $L_k$ 为空就是 *runs out of support*:由 Apriori property,更长的 itemset 不可能 frequent |
| 5 | 检查长度上限 | $\nexists N$ 读作"N 不存在(没设)",$\vee$ 是"或",$\exists N \wedge k<N$ 是"设了 N 且还没到 N"。讲师的说法:*"一路绿灯,继续往下走"*。伪代码没写 else,意思是条件不成立就结束 |
| 6 | 由 $L_k$ 生成 $(k+1)$ 维候选 $C_{k+1}$ | 只用 frequent 的 itemset 来搭,具体做法见下方拓展 |
| 7–8 | **扫描整个数据库一遍**:每读一笔交易 $t$,就把 $C_{k+1}$ 中被 $t$ 包含的候选的计数加 1 | 讲师:*"这个出现了,加 1;这个没有,不动;这个出现了,加 1……"* |
| 9 | 扫完后每个候选都有了 support,留下满足 $\delta$ 的,得到 $L_{k+1}$ | |
| 10 | $k$ 加 1,进入下一层 | |
| 11 | 返回所有层的并集 $L_1 \cup L_2 \cup \cdots$ | 即 slide 15 的 Output:*"the collection of all the frequent k-itemsets"* |

把循环画出来就是:

```d2
grid-rows: 3
grid-columns: 3
horizontal-gap: 70
vertical-gap: 50
b1: "" {style: {opacity: 0}}
out: "return ∪ L_k" {shape: oval}
b2: "" {style: {opacity: 0}}
start: "k = 1\nL1 ← 满足 δ 的 1-itemsets"
check: "L_k 非空,且\n没设 N 或 k < N ?" {shape: diamond}
filt: "留下 support ≥ δ 的 → L_k+1\nk ← k + 1"
b3: "" {style: {opacity: 0}}
gen: "由 L_k 生成\n候选集 C_k+1"
scan: "扫描 D 一遍\n给 C_k+1 里每个候选计数"
start -> check
check -> gen: 是
gen -> scan
scan -> filt
filt -> check: 下一层
check -> out: 否
```

注意每一层都要**完整扫描一遍数据库**。itemset 最长长到 $k$,就要扫 $k$ 遍。这一点在 §23 讨论效率时还会提到。

> 📎 **拓展(超出 slides):第 6 行的候选怎么生成** — Slides 只写了 *"candidate itemsets generated from $L_k$"*,讲师在 $k=1$ 时说的是"两两配对"。$k\ge 2$ 时,标准做法分两步:
>
> 1. **Join(连接)**:取 $L_k$ 中两个只有最后一个 item 不同的 itemset,合并成一个 $(k+1)$-itemset。例如 {Bread, Diaper} 和 {Bread, Milk} 合并成 {Bread, Diaper, Milk}。
> 2. **Prune(剪枝)**:检查新候选的**每一个** $k$ 元子集是否都在 $L_k$ 里。只要有一个不在,由 Apriori property,这个候选必定 infrequent,直接删掉,连数据库都不用扫。
>
> 下一节的手算例子在第 3 层正好用上了 prune。

**输出之后做什么(slide 15)。** 拿到全部 frequent itemsets 之后,下一步是从中构造**候选规则**:比如 {milk, eggs} 是 frequent itemset,它就提示了两条候选规则 {milk} → {eggs} 和 {eggs} → {milk}。

> 🎙️ **为什么要分成两步?** 讲师解释:建立在不频繁 itemset 上的规则没有统计上的可靠性,我们只对建立在 frequent itemset 上的规则感兴趣。所以把规则挖掘拆成两步:先找 frequent itemsets,再从中生成规则。

在 R 里,整个第一阶段由 `arules` 包的 `apriori()` 函数一次完成(slide 15):

```r
itemsets <- apriori(Groceries, parameter=list(minlen=1, support=0.02,
                    target="frequent itemsets"))
```

讲师解读了几个参数:`minlen=1` 表示从 1-itemset 开始;`support=0.02` 就是 $\delta$;没设 `maxlen` 时系统取默认值 10,相当于伪代码里的 $N$;`target="frequent itemsets"` 表示这一步只要 frequent itemsets。等到挖规则时,把它改成 `"rules"`。§18 会细看这段代码的输出。

## §8 手算一遍:6 种商品、5 笔交易

Slide 16 用示例交易表(§2)演示了 Apriori 怎样省掉大量计数。设 **minimum support = 3**(计数),相当于比例 $3/5 = 0.6$。

**第 1 层:数全部 6 个单品(6 次计数)。**

| Item | Count | 结果 |
|---|---|---|
| Bread | 4 | ✓ |
| Coke | 2 | ✗ |
| Milk | 4 | ✓ |
| Beer | 3 | ✓ |
| Diaper | 4 | ✓ |
| Eggs | 1 | ✗ |

Coke 和 Eggs 不到 3 次,出局。$L_1 = \{\text{Bread, Milk, Beer, Diaper}\}$。

**第 2 层:只用 $L_1$ 的 4 个 item 配对,$\binom{4}{2} = 6$ 个候选(6 次计数)。** Slide 16 特意写了一句 *"No need to generate candidates involving Coke or Eggs"*——这就是 Apriori property 在干活。

| Itemset | Count | 结果 |
|---|---|---|
| {Bread, Milk} | 3 | ✓ |
| {Bread, Beer} | 2 | ✗ |
| {Bread, Diaper} | 3 | ✓ |
| {Milk, Beer} | 2 | ✗ |
| {Milk, Diaper} | 3 | ✓ |
| {Beer, Diaper} | 3 | ✓ |

$L_2 = \{\{\text{Bread, Milk}\}, \{\text{Bread, Diaper}\}, \{\text{Milk, Diaper}\}, \{\text{Beer, Diaper}\}\}$。

**第 3 层:先 prune,再计数。** 4 个 frequent items 能组成 $\binom{4}{3}=4$ 个 3-itemset。逐个检查它们的 2 元子集是否都在 $L_2$ 里(slides 只给了结果,这里补上过程):

| 候选 3-itemset | 它的 2 元子集 | 处理 |
|---|---|---|
| {Bread, Milk, Diaper} | {Bread, Milk} ✓ {Bread, Diaper} ✓ {Milk, Diaper} ✓ | 保留,需要计数 |
| {Bread, Milk, Beer} | {Bread, Beer} ✗ | 直接删掉,不计数 |
| {Bread, Beer, Diaper} | {Bread, Beer} ✗ | 直接删掉,不计数 |
| {Milk, Beer, Diaper} | {Milk, Beer} ✗ | 直接删掉,不计数 |

只剩 1 个候选需要去数(1 次计数)。

**算账。** Slide 16 左下角的蓝框:

> **If every subset is considered, $^6C_1 + {^6C_2} + {^6C_3} = 41$. With support-based pruning, $6 + 6 + 1 = 13$.**

暴力法要把 6 种商品能组成的 1-、2-、3-itemset 全部数一遍,共 $6 + 15 + 20 = 41$ 个;Apriori 只数了 $6 + 6 + 1 = 13$ 个,省掉了 $(41-13)/41 \approx 68\%$。讲师的评价是 *"省了 60% 以上"*。省下的 28 个分两种:含 Coke 或 Eggs 的组合根本不会被生成,另有 3 个在第 3 层被 prune 掉。逐层看:

| $k$ | 暴力法要数 | Apriori 实际计数 | 不必计数 | 本层结果 |
|---|---|---|---|---|
| 1 | $\binom{6}{1}=6$ | 6 | 0 | 4 个 frequent |
| 2 | $\binom{6}{2}=15$ | 6 | 9:含 Coke 或 Eggs 的组合 | 4 个 frequent |
| 3 | $\binom{6}{3}=20$ | 1 | 19:16 个含 Coke 或 Eggs,3 个被 prune | 0 个 frequent(见下方 ⚠️) |
| **合计** | **41** | **13** | **28** | |

这还只是 6 种商品的玩具例子;商品越多,省下的比例越惊人。

> 📎 **补充(超出 slides)** — 41 只统计到 3-itemset,是为了和 Apriori 走到第 3 层的工作量公平比较。6 种商品的完整 lattice 有 $2^6 - 1 = 63$ 个非空 itemset。

> ⚠️ **Slide 16 上的一个计数错误** — 图中把 {Bread, Milk, Diaper} 的计数写成了 **3**,但按 slide 10 的交易表,同时含这三样的只有 TID 4 和 TID 5,计数是 **2**(TID 1 缺 Diaper,TID 2 缺 Milk,TID 3 缺 Bread)。所以在 minimum support = 3 时,它**不是** frequent,$L_3 = \varnothing$,算法在第 3 层 *runs out of support* 后停止。讲师课上沿用了 slide 的说法("最后只剩 bread, milk, diaper 这一个")。
>
> 好在 "13 次计数" 的结论不受影响:不管结果是 2 还是 3,这个候选都得数一次。如果考试给出这张交易表让你跑 Apriori,**按表实际去数,并写出计数过程**。

---

# Part III · 从 frequent itemsets 到规则

## §9 候选规则从哪里来:$2^k - 2$

第一阶段交出的是一批 frequent itemsets。可店长想听的不是"{milk, eggs} 常一起出现",而是"买了 $X$ 的人往往也买 $Y$"这种带方向的陈述。从 itemset 得到规则的办法很简单:**把 itemset 一分为二**。Slide 17:

> **Given a frequent itemset L, find all non-empty subsets f ⊂ L such that f → L − f satisfies the minimum confidence requirement.**

取 $L$ 的一个非空真子集 $f$ 放在左边,剩下的 $L-f$ 放在右边,就得到一条候选规则。对 {milk, eggs} 只有两种分法:{milk} → {eggs} 和 {eggs} → {milk}(slide 15)。对 $L = \{A, B, C, D\}$,一共有 14 种分法(slide 17):

| lhs 含几个 item | 候选规则 |
|---|---|
| 3 个 | ABC → D,ABD → C,ACD → B,BCD → A |
| 2 个 | AB → CD,AC → BD,AD → BC,BC → AD,BD → AC,CD → AB |
| 1 个 | A → BCD,B → ACD,C → ABD,D → ABC |

一般地(slide 17):

> **If |L| = k, then there are $2^k - 2$ candidate association rules (ignoring L → ∅ and ∅ → L).**

为什么是 $2^k - 2$? $L$ 中每个 item 要么去左边,要么去右边,一共 $2^k$ 种分法。其中"全部去右边"(∅ → L)和"全部去左边"(L → ∅)构不成有意义的规则,减去这 2 种。$k = 4$ 时正好是 $16 - 2 = 14$。

> ⚠️ 录音里讲师把公式念成了 "2 raised to the power K minus K",以 slide 上的 $2^k - 2$ 为准。

🎙️ 讲师接着指出,这个数依然不小:一个 frequent 10-itemset 就能生成 $2^{10}-2 = 1022$ 条候选规则。所以第二阶段同样需要剪枝。

**第二阶段为什么用不上 support?**

> 🎙️ 讲师:*"到了这一步,我们不再用 support 了,因为能走到这里的都是 frequent 的,support 已经没用了。"*

说得更具体一点:从同一个 itemset $L$ 生成的每条规则,左右两边合起来都正好是 $L$,所以它们的 support 全都等于 $\text{Support}(L)$。support 区分不了这些规则,我们需要一个新指标。

## §10 Confidence:规则有多可信

候选规则有了,哪些靠得住? Slide 18 的问题是 *"How to evaluate the appropriateness of these candidate rules?"*,给出的答案是三个指标(measure):**confidence、lift 和 leverage**。本节先讲 confidence,另外两个留到 Part IV。

> **Confidence — the measure of certainty or trustworthiness associated with each rule.**

$$\text{Confidence}(X\rightarrow Y)=\frac{\text{Support}(X\wedge Y)}{\text{Support}(X)}$$

用文字说:**在所有包含 $X$ 的交易里,有多大比例也包含 $Y$。** 分母只看买了 $X$ 的那部分交易,分子看其中同时买了 $Y$ 的。§3 里 Cereal → Milk 的 90% 就是这么算出来的。

> 🎙️ **条件概率视角** — 讲师在白板上把 confidence 和 Week 5 的 Bayes rule 连了起来:$\text{Support}(X)$ 就是 $P(X)$,$\text{Support}(X\wedge Y)$ 就是 $P(X, Y)$,所以
>
> $$\text{Confidence}(X\rightarrow Y)=\frac{P(X,Y)}{P(X)}=P(Y\mid X)$$
>
> confidence 就是"已经观察到 $X$ 时,也观察到 $Y$"的**条件概率(conditional probability)**。
>
> ⚠️ 讲师板书时先写成了 $P(X\mid Y)$,随即改成 $P(Y\mid X)$。记住:条件是左边的 $X$,问的是右边的 $Y$。

> **🔑 例(slide 19 的提问)**
>
> *If {bread, eggs, milk} has a support of 0.15 and {bread, eggs} also has a support of 0.15, then what is the confidence of the rule {bread, eggs} → {milk}?*
>
> **第 1 步** — 认清 $X$ 和 $Y$:$X = \{\text{bread, eggs}\}$,$Y = \{\text{milk}\}$。
>
> **第 2 步** — 找分子:$\text{Support}(X\wedge Y) = \text{Support}(\{\text{bread, eggs, milk}\}) = 0.15$。
>
> **第 3 步** — 找分母:$\text{Support}(X) = \text{Support}(\{\text{bread, eggs}\}) = 0.15$。
>
> **第 4 步** — $\text{Confidence} = 0.15 / 0.15 = \mathbf{1.0}$。
>
> 含义:每一笔同时有 bread 和 eggs 的交易,都有 milk。两个 support 相等,说明"有 bread 和 eggs"的交易与"有 bread、eggs、milk"的交易恰好是同一批。(录音里讲师把 0.15 念成了 "0.5",答案 1.0 不受影响。)

> 📎 **Confidence 是有方向的(超出 slides)** — 分母是 lhs 的 support,把规则反过来,分母就换了。在示例交易表上:
>
> - $\text{Confidence}(\text{Beer}\rightarrow\text{Diaper}) = 0.6 / 0.6 = 1.0$:买啤酒的 3 笔交易都买了尿布;
> - $\text{Confidence}(\text{Diaper}\rightarrow\text{Beer}) = 0.6 / 0.8 = 0.75$:买尿布的 4 笔交易里只有 3 笔买了啤酒。
>
> §3 里 Cereal → Milk(90%)与 Milk → Cereal(23%)的不对称也是这个原因:Milk 太常见,放在分母上就把比例拉低了。

**Minimum confidence(slide 20)。**

> **A predefined threshold to indicate a relationship is "interesting". A higher confidence could indicate that the rule (X→Y) is more interesting (be careful…). All the rules can be ranked based on support or confidence.**

和 minimum support 一样,minimum confidence 也由数据科学家设定。🎙️ 讲师描述的做法是:按 confidence 给规则排序,留下高于阈值的那些。

请留意 slide 上那个括号 **be careful…** 和措辞 **could** indicate:confidence 高,只是"可能"更有趣。为什么要小心,是 Part IV 的主题。

## §11 用 confidence 给规则剪枝:anti-monotone property

一个 frequent 10-itemset 就有 1022 条候选规则,逐条计算 confidence 也很费力。能不能像第一阶段那样,发现一条不达标,就排除一大片? 这是 slide 21 的问题:*"How to efficiently generate rules from frequent itemsets?"* 讲师说,本质上就是"怎样高效地删掉不感兴趣的规则"。

**一般情况下不行。** Slide 21:

> **In general, confidence does not have an anti-monotone property: c(ABC → D) can be larger or smaller than c(AB → D).**

📎 为什么不行? 把两个式子写出来:

$$c(AB\rightarrow D)=\frac{s(ABD)}{s(AB)},\qquad c(ABC\rightarrow D)=\frac{s(ABCD)}{s(ABC)}$$

从左式到右式,分子和分母都多了 item C,都变小了,比值可大可小。代几个数:设 $s(AB)=0.4$、$s(ABD)=0.2$,则 $c(AB\rightarrow D)=0.5$。

- 若 $s(ABC)=0.1$、$s(ABCD)=0.1$,则 $c(ABC\rightarrow D)=1.0$,**变大了**;
- 若 $s(ABC)=0.2$、$s(ABCD)=0.02$,则 $c(ABC\rightarrow D)=0.1$,**变小了**。

两组数都满足 Apriori property,都可能出现在真实数据里。讲师的说法是:*"你没法只看 ABC 和 AB 的 support 就去剪枝。"*

**同一个 itemset 内部可以。** Slide 21 用红字强调:

> **But confidence of rules generated from the same itemset has an anti-monotone property. e.g., L = {A,B,C,D}: c(ABC → D) ≥ c(AB → CD) ≥ c(A → BCD). Confidence is anti-monotone w.r.t. number of items on the RHS of the rule.**

讲师特别提醒要注意 "**the same itemset**" 这几个字:只能比较**从同一个 itemset 生成的规则**。从 ABC → D 到 AB → CD,是把 C 从左边挪到右边;再到 A → BCD,是把 B 也挪过去。**rhs 每多一个 item,confidence 只会变小或不变。**

> 🎙️ **证明(讲师在白板上的推导)** — 用 $s$ 表示 support。三条规则都来自 ABCD,左右合起来都是 ABCD,所以分子都是 $s(ABCD)$:
>
> $$\begin{aligned}c(ABC\rightarrow D)&=\dfrac{s(ABCD)}{s(ABC)}\\ c(AB\rightarrow CD)&=\dfrac{s(ABCD)}{s(AB)}\\ c(A\rightarrow BCD)&=\dfrac{s(ABCD)}{s(A)}\end{aligned}$$
>
> 分母是各自的 lhs。$ABC \supseteq AB \supseteq A$,由 Apriori property(§6):
>
> $$s(ABC)\ \le\ s(AB)\ \le\ s(A)$$
>
> 分子相同、分母越来越大,比值越来越小:
>
> $$c(ABC\rightarrow D)\ \ge\ c(AB\rightarrow CD)\ \ge\ c(A\rightarrow BCD)\qquad\blacksquare$$

可见这条性质就是 Apriori property 换了个包装:**rhs 变大 ⟺ lhs 变小 ⟺ lhs 的 support 变大 ⟺ confidence 变小**。跨 itemset 时之所以不成立,是因为分子也跟着变了。

> **🔑 例(在示例交易表上验证)** — {Bread, Milk, Diaper} 的计数是 2。
>
> - $c(\{\text{Bread, Diaper}\}\rightarrow\{\text{Milk}\}) = 2/3 \approx 0.667$;
> - 把 Diaper 挪到右边:$c(\{\text{Bread}\}\rightarrow\{\text{Milk, Diaper}\}) = 2/4 = 0.5$。
>
> 分子都是 2,分母从 3 变成 4,confidence 确实变小了。

**在规则 lattice 上剪枝(slide 22)。** 把同一个 itemset ABCD 生成的规则也排成一张 lattice:顶部是 ABCD ⇒ { },往下每一层都比上一层多挪一个 item 到 rhs。如果发现 **BCD ⇒ A** 的 confidence 低于 minimum confidence,那么从它往下、rhs 包含 A 的规则——CD ⇒ AB、BD ⇒ AC、BC ⇒ AD、D ⇒ ABC、C ⇒ ABD、B ⇒ ACD——都可以直接删掉,不必再算(slide 22 里红色虚线圈住的 "Pruned Rules")。

原因:这些规则的 lhs 都是 BCD 的子集,lhs 的 support 只会更大,confidence 只会 $\le c(\text{BCD}\Rightarrow\text{A})$,同样不达标。

```d2
direction: down
classes: {
  pruned: {style: {fill: "#f2f2f2"; stroke: "#b0b0b0"; stroke-dash: 3; font-color: "#9a9a9a"}}
  bad: {style: {fill: "#fde8e8"; stroke: "#c0392b"; bold: true}}
  ok: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"}}
}
r_abcd_none: "ABCD ⇒ { }" {class: ok}
r_bcd_a: "BCD ⇒ A\nconfidence 太低" {class: bad}
r_acd_b: "ACD ⇒ B" {class: ok}
r_abd_c: "ABD ⇒ C" {class: ok}
r_abc_d: "ABC ⇒ D" {class: ok}
r_cd_ab: "CD ⇒ AB" {class: pruned}
r_bd_ac: "BD ⇒ AC" {class: pruned}
r_bc_ad: "BC ⇒ AD" {class: pruned}
r_ad_bc: "AD ⇒ BC" {class: ok}
r_ac_bd: "AC ⇒ BD" {class: ok}
r_ab_cd: "AB ⇒ CD" {class: ok}
r_d_abc: "D ⇒ ABC" {class: pruned}
r_c_abd: "C ⇒ ABD" {class: pruned}
r_b_acd: "B ⇒ ACD" {class: pruned}
r_a_bcd: "A ⇒ BCD" {class: ok}
r_ab_cd -> r_a_bcd
r_ab_cd -> r_b_acd
r_ac_bd -> r_a_bcd
r_ac_bd -> r_c_abd
r_ad_bc -> r_a_bcd
r_ad_bc -> r_d_abc
r_bc_ad -> r_b_acd
r_bc_ad -> r_c_abd
r_bd_ac -> r_b_acd
r_bd_ac -> r_d_abc
r_cd_ab -> r_c_abd
r_cd_ab -> r_d_abc
r_abc_d -> r_ab_cd
r_abc_d -> r_ac_bd
r_abc_d -> r_bc_ad
r_abd_c -> r_ab_cd
r_abd_c -> r_ad_bc
r_abd_c -> r_bd_ac
r_acd_b -> r_ac_bd
r_acd_b -> r_ad_bc
r_acd_b -> r_cd_ab
r_bcd_a -> r_bc_ad
r_bcd_a -> r_bd_ac
r_bcd_a -> r_cd_ab
r_abcd_none -> r_abc_d
r_abcd_none -> r_abd_c
r_abcd_none -> r_acd_b
r_abcd_none -> r_bcd_a
```

讲师的点评是:*"看起来和我们在 support 上看到的剪枝结构很像。对 support 和 confidence,我们都能用某种规律把不感兴趣或不频繁的东西剪掉。"* 两个阶段放在一起对照:

| | 阶段一:剪 itemsets | 阶段二:剪规则 |
|---|---|---|
| 指标 | support | confidence |
| 阈值 | minimum support $\delta$ | minimum confidence |
| 依据的性质 | Apriori property:超集的 support ≤ 子集的 support | anti-monotone:同一 itemset 内,rhs 越大,confidence 越小 |
| 适用范围 | 任意两个有包含关系的 itemsets | **只限同一个 itemset 生成的规则** |
| 剪枝动作 | $X$ 不频繁 → 删掉 $X$ 的所有超集 | $X\rightarrow Y$ 不达标 → 删掉把 lhs 里更多 item 挪到 rhs 得到的规则 |
| 对应 slides | 11、12、16 | 21、22 |

---

# Part IV · 评价规则:只看 confidence 不够

## §12 Confidence 的盲点

到目前为止,我们靠 confidence 给规则排序、筛选。Slide 23 却当头泼了一盆冷水:

> **Issue with "Confidence": In what cases, we will obtain high confidence? Confidence does NOT consider the rule (Y)! It cannot tell if a rule contains true implication of the relationship, or if the rule is purely coincidental.**

先回答 slide 上的问题:**什么情况下 confidence 会很高?** 有两种可能。

1. $X$ 和 $Y$ 真的有关联:买了 $X$,买 $Y$ 的可能性就变大。
2. $Y$ 本身太热门:不管买没买 $X$,几乎每笔交易里都有 $Y$。这时任何一条指向 $Y$ 的规则都会有很高的 confidence。

confidence 的公式里,分母只有 $\text{Support}(X)$,**$Y$ 自己有多常见——$\text{Support}(Y)$——根本没出现**。所以它分不清这两种情况。slide 上的 "does NOT consider the rule (Y)" 说的就是这一点:confidence 没有考虑 rhs 的 $Y$ 本身的频率。

> 🎙️ **讲师的两个例子**
>
> **冰淇淋大促销**:超市里某种冰淇淋大减价,半价甚至更低,几乎每位顾客都会顺手拿一盒。这时分析交易数据、只看 confidence,你会得出"顾客不管买什么都会买冰淇淋"的结论,比如 eggs → ice cream 的 confidence 很高。这是误导:买冰淇淋不是买鸡蛋引起的,只是因为冰淇淋太受欢迎了。
>
> **夏天的矿泉水**:冬天大家不怎么买矿泉水,到了夏天,几乎每位顾客都会拿一瓶水。用 confidence 去分析,同样会得出"买什么都会买矿泉水"这种不对的结论。
>
> 讲师的总结:*"这不是因为买了 X,只是因为 Y 变得很热门。我们没有考虑 Y 的热门程度。"*

> **🔑 例(给冰淇淋例子配上数字,📎 数字为本讲义所设)**
>
> 1000 笔交易:900 笔有冰淇淋(support 0.9),200 笔有鸡蛋(support 0.2),两样都有的 180 笔(support 0.18)。
>
> $$\text{Confidence}(\text{eggs}\rightarrow\text{ice cream}) = \frac{0.18}{0.2} = 0.9$$
>
> 0.9,看上去是一条很强的规则。可是再看没买鸡蛋的 800 笔交易:其中有冰淇淋的是 $900 - 180 = 720$ 笔,比例同样是 $720/800 = 0.9$。**买不买鸡蛋,买冰淇淋的比例都是 90%**,鸡蛋对冰淇淋毫无影响。那个 0.9 只是冰淇淋自己的 support。

我们需要一个指标,把"买了 $X$ 的人里有多少买 $Y$"和"所有人里有多少买 $Y$"放在一起比。这就是 lift。

## §13 Lift:是巧合的几倍

**思路(🎙️)。** 讲师的说法是:*"先假设 X 和 Y 相互独立,把它作为基准(baseline)。再从数据里数出 X 和 Y 实际一起出现的频率,和这个基准比,看变化有多大。这能帮我们判断它们到底是独立的,还是真的相关。"*

> 📎 **前置知识:统计独立(超出 slides)** — 两个事件 $A$、$B$ **统计独立(statistically independent)**,指 $P(A\cap B) = P(A)\cdot P(B)$,等价于 $P(B\mid A) = P(B)$:知道 $A$ 发生了,不改变 $B$ 发生的概率。把它用到"交易包含 $X$"和"交易包含 $Y$"这两个事件上:如果 $X$ 和 $Y$ 毫无关系,同时包含两者的交易比例应该是 $\text{Support}(X)\cdot\text{Support}(Y)$。这就是 lift 的分母。

**定义(slide 24)。**

> **Lift — Measures how many times more often X and Y occur together than expected if they are statistically independent of each other. Measures how X and Y are really related rather than coincidentally happening together.**

$$\text{Lift}(X\rightarrow Y)=\frac{\text{Support}(X\wedge Y)}{\text{Support}(X)\cdot\text{Support}(Y)}$$

分子是**观测值**:从数据里数出来的共现比例。分母是**期望值**:假如 $X$、$Y$ 相互独立,应该有的共现比例。lift 就是两者的比值:实际一起出现的频率,是"纯属巧合"时的几倍。

**Lift 和 confidence 是什么关系? (slide 25 的提问)** 把公式拆开:

$$\text{Lift}(X\rightarrow Y)=\underbrace{\frac{\text{Support}(X\wedge Y)}{\text{Support}(X)}}_{\text{Confidence}(X\rightarrow Y)}\cdot\frac{1}{\text{Support}(Y)}=\frac{\text{Confidence}(X\rightarrow Y)}{\text{Support}(Y)}$$

> 🎙️ 讲师:*"本质上,lift 就是 confidence 除以 support(Y)。刚才说 confidence 没有考虑 Y 的概率,现在你看,lift 把这一项加进来了。"*

用条件概率写就是 $\text{Lift} = P(Y\mid X)/P(Y)$:**知道顾客买了 $X$ 之后,买 $Y$ 的概率变成了原来的几倍。** confidence 的盲点恰好被分母上的 $\text{Support}(Y)$ 补上了。

**怎么解读(slide 26)。**

> **Lift is 1 if X and Y are statistically independent of each other. A lift of X → Y greater than 1 indicates some usefulness of the rule. A larger lift suggests a greater strength of the association between X and Y.**

讲师还补充了 slide 没写的一种情况:lift 小于 1。

```d2
direction: right
classes: {
  neg: {style: {fill: "#fde8e8"; stroke: "#c0392b"}}
  mid: {style: {fill: "#f2f2f2"; stroke: "#888888"}}
  pos: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"}}
}
neg: "Lift < 1\n负相关(讲师补充)\nX 出现,Y 反而少见" {class: neg}
ind: "Lift = 1\n统计独立\n一起出现纯属巧合" {class: mid}
pos: "Lift > 1\n正相关\nX 出现,Y 更常见\n越大关联越强" {class: pos}
neg -> ind
ind -> pos
```

- **Lift = 1**:实际共现与独立时的期望相同,两者没有关联。
- **Lift > 1**:讲师说这是 *"positive correlation"*,$X$ 的出现**促进**了 $Y$ 的出现;lift 越大,关联越强。
- **Lift < 1**(🎙️):$X$ 的出现**抑制**了 $Y$ 的出现,两者负相关。📎 典型例子是互相替代的商品,比如同一品类的两个竞争品牌:买了其中一个,同一单里就不太会再买另一个。

> **🔑 例(slide 27 的提问)**
>
> *Assuming 1,000 transactions, with {milk, eggs} appearing in 300 of them, {milk} appearing in 500, and {eggs} appearing in 400, then what is the Lift{milk → eggs}?*
>
> **第 1 步** — 计数换成 support:$\text{Support}(\text{milk}\wedge\text{eggs}) = 300/1000 = 0.3$,$\text{Support}(\text{milk}) = 0.5$,$\text{Support}(\text{eggs}) = 0.4$。
>
> **第 2 步** — 独立时的期望:$0.5 \times 0.4 = 0.2$,即 1000 笔里应该有约 200 笔两样都有。
>
> **第 3 步** — $\text{Lift} = 0.3 / 0.2 = \mathbf{1.5}$。
>
> 含义:牛奶和鸡蛋一起出现的频率是巧合水平的 1.5 倍,两者正相关。也可以用上面的关系式验算:$\text{Confidence}(\text{milk}\rightarrow\text{eggs}) = 0.3/0.5 = 0.6$,再除以 $\text{Support}(\text{eggs}) = 0.4$,得到 1.5。

回到冰淇淋:$\text{Lift}(\text{eggs}\rightarrow\text{ice cream}) = 0.18 / (0.2 \times 0.9) = 1.0$。confidence 0.9 的"强规则",lift 一算就现了原形:纯属巧合。

> 📎 **Lift 没有方向(超出 slides)** — lift 的公式里 $X$ 和 $Y$ 地位对称,交换两者结果不变:$\text{Lift}(\text{milk}\rightarrow\text{eggs}) = \text{Lift}(\text{eggs}\rightarrow\text{milk}) = 1.5$。confidence 却不同:$\text{Confidence}(\text{milk}\rightarrow\text{eggs}) = 0.6$,$\text{Confidence}(\text{eggs}\rightarrow\text{milk}) = 0.3/0.4 = 0.75$。所以 lift 衡量的是"两者关联得多紧",不回答"规则该朝哪个方向写"。

## §14 Leverage:比巧合多出多少

**定义(slide 28)。**

> **Leverage — Measures the difference in the probability of X and Y appearing together compared to what would be expected if X and Y were statistically independent of each other.**

$$\text{Leverage}(X\rightarrow Y)=\text{Support}(X\wedge Y)-\text{Support}(X)\cdot\text{Support}(Y)$$

和 lift 对比一下就明白了:

> 🎙️ 讲师:*"lift 用的是比值,leverage 用的是差值。它们用的是同一份信息,只是比较的方式不同。"*

```d2
direction: right
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
obs: "观测值\nSupport(X∧Y)\n从数据里数出来"
exp: "期望值\nSupport(X)·Support(Y)\n假设 X、Y 独立"
lift: "Lift = 观测 ÷ 期望\n独立时 = 1" {class: key}
lev: "Leverage = 观测 − 期望\n独立时 = 0" {class: key}
obs -> lift
exp -> lift
obs -> lev
exp -> lev
```

**怎么解读(slide 29)。**

> **Its value will be zero when X and Y are statistically independent of each other. If X and Y have some kind of relationship, the leverage would be greater than zero.**

🎙️ 讲师的解释:有关系时,第一项(观测)比第二项(期望)大,差值就是正的。

> 📎 **补充(超出 slides)** — slide 说"有关系就大于零",其实只说了**正**关联的情况。如果 $X$ 和 $Y$ 负相关(lift < 1),观测值小于期望值,leverage 就是**负数**。leverage 的符号和 lift 跟 1 的大小关系始终一致:leverage > 0 ⟺ lift > 1,leverage = 0 ⟺ lift = 1,leverage < 0 ⟺ lift < 1。另外,leverage 的取值范围是 $[-0.25, 0.25]$(最大值出现在 $X$、$Y$ 总是同时出现、且各占一半交易时:$0.5 - 0.5\times0.5 = 0.25$)。算出一个大于 0.25 的 leverage,就说明算错了。

> **🔑 例(slide 30 的提问,讲师留给同学自己算)**
>
> 数据同 slide 27:1000 笔交易,{milk, eggs} 300 笔,{milk} 500 笔,{eggs} 400 笔。
>
> $$\text{Leverage}(\text{milk}\rightarrow\text{eggs}) = 0.3 - 0.5\times 0.4 = 0.3 - 0.2 = \mathbf{0.1}$$
>
> 含义:牛奶和鸡蛋一起出现的比例,比独立时的期望高出 10 个百分点。乘以交易总数更直观:$0.1 \times 1000 = 100$,即实际共现的交易(300 笔)比巧合水平(200 笔)**多出 100 笔**。📎 一般地,$\text{Leverage}\times N$ 就是"比巧合多出来的交易笔数"。

**Lift 和 leverage 会给出不同的排序(📎)。** 比值和差值对"稀有"与"常见"的商品反应不同:

- **lift 会放大稀有商品的关联**:分母 $\text{Support}(X)\cdot\text{Support}(Y)$ 很小时,几次共现就能撑出一个很大的比值;
- **leverage 偏向常见商品**:差值是绝对量,商品本身不常见,差值也大不起来。

拿本章的两条规则对比(Groceries 那条的计算见 §21):

| 规则 | 数据来源 | Lift | Leverage | 比巧合多出的交易 |
|---|---|---|---|---|
| milk → eggs | slides 27、30,$N=1000$ | 1.5 | 0.1 | 约 100 笔(占 10%) |
| {Instant food products, soda} → {hamburger meat} | Groceries,$N=9835$ | 19.0 | 0.00116 | 约 11 笔(占 0.1%) |

按 lift,第二条比第一条"强" 12 倍以上;按 leverage,第一条影响的交易比例是第二条的约 86 倍。两种说法都没错,它们回答的是不同的问题。讲师在课程结尾说过:

> 🎙️ *"指标其实有大约 20 种,我们只讲了 4 种。不同的指标有各自适用的场景。用两种不同的指标给 10 条规则排序,你可能得到完全相反的结果。所以用哪个指标,你得想清楚哪个才合适。"*

> 📎 **名字的来历** — Week 6 版 slides 把这个指标标为 "Leverage (Pitetsky-Shapiro's)"。它也叫 **Piatetsky-Shapiro's measure**,以数据挖掘研究者 Gregory Piatetsky-Shapiro 命名(slide 上的 "Pitetsky" 是拼写错误)。

## §15 四个指标放在一起看

Slide 31 做了小结:

> **Four measures: Support, Confidence, Lift, and Leverage. A high-confidence rule can sometimes be misleading. Lift and leverage not only ensure interesting rules but also filter out coincidental rules.**

下表是本章最值得记下来的一张表(公式中 $s$ 表示 support):

|  | Support | Confidence | Lift | Leverage |
|---|---|---|---|---|
| 公式 | $s(X\wedge Y)$ | $\dfrac{s(X\wedge Y)}{s(X)}$ | $\dfrac{s(X\wedge Y)}{s(X)\,s(Y)}$ | $s(X\wedge Y)-s(X)\,s(Y)$ |
| 回答什么问题 | 这组商品一起出现得有多普遍? | 有 $X$ 的交易里,多大比例也有 $Y$? | 一起出现的频率是巧合的几倍? | 一起出现的比例比巧合多出多少? |
| $X$、$Y$ 独立时 | — | $=s(Y)$ | $=1$ | $=0$ |
| 取值范围 | $[0,1]$ | $[0,1]$ | $[0,\infty)$ | $[-0.25,0.25]$ |
| 交换 $X$、$Y$ 后不变? | 是 | 否 | 是 | 是 |
| 在流程中的角色 | 阶段一:筛 frequent itemsets | 阶段二:筛规则、排序 | 识破巧合、排序 | 识破巧合、排序 |

"独立时"那一列里,confidence 一格值得多看一眼:$X$、$Y$ 毫无关系时,confidence 恰好等于 $s(Y)$。**$Y$ 越热门,一条毫无意义的规则的 confidence 就越高**——这正是 §12 那个盲点的数学根源。

> **🔑 例(📎 同一份数据,四个指标一起看)**
>
> 回到示例交易表。§8 得到的 4 个 frequent 2-itemsets 能生成 8 条规则,全部算出来:
>
> | 规则 | support | confidence | lift | leverage |
> |---|---|---|---|---|
> | Beer → Diaper | 0.6 | **1.00** | **1.25** | **+0.12** |
> | Diaper → Beer | 0.6 | 0.75 | **1.25** | **+0.12** |
> | Bread → Milk | 0.6 | 0.75 | 0.94 | −0.04 |
> | Milk → Bread | 0.6 | 0.75 | 0.94 | −0.04 |
> | Bread → Diaper | 0.6 | 0.75 | 0.94 | −0.04 |
> | Diaper → Bread | 0.6 | 0.75 | 0.94 | −0.04 |
> | Milk → Diaper | 0.6 | 0.75 | 0.94 | −0.04 |
> | Diaper → Milk | 0.6 | 0.75 | 0.94 | −0.04 |
>
> 如果把 minimum confidence 设为 0.7,8 条规则全部过关。可 lift 和 leverage 讲的是另一个故事:**只有 Beer ↔ Diaper 是正关联**。Bread、Milk、Diaper 各自出现在 5 笔交易中的 4 笔里(support 0.8),任何指向它们的规则都能"自动"拿到 0.75 的 confidence;它们实际的共现比例 0.6,甚至略低于独立时的期望 $0.8\times0.8=0.64$。六条"高 confidence"规则,其实是轻微的负关联。
>
> 这就是 slide 31 那句 *"A high-confidence rule can sometimes be misleading"* 在课程自己的数据上的样子。(5 笔交易当然太少,不足以下任何真实结论,这里只为演示机制。)

**组合使用(slide 32)。**

> **Measures are often used in combination. Example: Find all rules with a minimum level of confidence then, of those rules, sort rules in descending order by lift or leverage.**

🎙️ 讲师描述的完整流程是:先用 minimum support 找 frequent itemsets,再用 minimum confidence 找规则,最后按 lift 给规则排序。Part V 的 R 实例正是这么做的,数字如下:

```d2
grid-rows: 3
grid-columns: 2
horizontal-gap: 100
vertical-gap: 60
D: "Groceries\n9835 笔交易 · 169 种商品" {shape: cylinder}
F: "frequent itemsets\nsupport ≥ 0.001 · 最长 6 个 item"
S: "按 lift 降序\ninspect() 看前 10 条"
R: "2918 条规则\nconfidence ≥ 0.6"
H: "人来判断\n新不新?能不能用?"
blank: "" {style: {opacity: 0}}
D -> F: "min support"
F -> R: "min confidence"
R -> S: "sort by lift"
S -> H: "人工审阅"
```

**最后一步为什么要人来做(slide 32)。**

> **Problem: These measures do not reflect novelty of rules i.e. differentiate between known rules and rules that are new to an observer. Novelty and value of rules need to be evaluated by a human observer.**

> 🎙️ **Objective 与 subjective** — 讲师把四个指标统称为 **objective measures(客观指标)**:它们全部从数据里算出来。可是 Week 2 讲 big data analytics lifecycle 时就强调过,**领域知识(domain knowledge)** 很重要,要把领域知识和数据结合起来,才能得到可靠、真正有用的信息。
>
> 讲师举了一个场景:指标显示某条规则很有意思,你兴冲冲地拿去给 CEO 看,CEO 说:*"不用了,这个我们 20 年前就知道,这是我们行业的常识。"* 规则新不新、有没有价值,只能由人来判断,这类标准叫 **subjective measures(主观指标)**,来自人,来自领域专家。两类标准必须结合使用。

| | Objective measures | Subjective measures |
|---|---|---|
| 来源 | 数据 | 人(领域专家、决策者) |
| 例子 | support、confidence、lift、leverage | novelty(新不新)、actionability(能不能付诸行动)、商业价值 |
| 能回答 | 规则在数据里有多常见、多可信、是否超出巧合 | 规则是不是早就知道、知道了能做什么 |
| 做不到 | 分不清"老生常谈"和"新发现" | 难以自动化,依赖经验 |

讲师给好规则下的定义是:*"有趣的、出乎意料的、未知的,也就是新颖的,并且是可以付诸行动的(actionable)——你真正找到了对业务有用的东西。"*

---

# Part V · 应用与 R 实例

## §16 关联规则用在哪里

Slide 33 列了三类应用,外加一句 "Much more…"。讲师给每一类都配了例子:

| 应用 | slides 的说法 | 课堂上的例子(🎙️) |
|---|---|---|
| **Market basket analysis**(购物篮分析) | Better merchandising, placement of products, and promotion plan | 把常被一起买的商品摆在一起、做组合价;安排货架和库存 |
| **Recommender system**(推荐系统) | Discover related products or similar customers | 网购时,如果数据显示手机和手机壳常被一起买,就给刚买了 iPhone 的顾客推荐手机壳 |
| **Clickstream analysis**(点击流分析) | Analyse data of web browsing and use clicks | 学生打开 UOW 官网后通常会接着点进某个页面,网站就可以提前加载那个页面,让访问更快;如果顾客读完购物须知页面就离开,可能说明没看懂,这时可以弹出在线客服(live chat) |
| Much more… | | |

开篇时店长的三个问题(slide 4)在这里各有归宿:"哪些商品常被一起买"对应 market basket analysis;"相似顾客买什么"和"买了这件的人还看什么、买什么"对应推荐系统,"看什么"也落在点击流分析的范围里。

> 📎 **拓展(超出 slides)** — 点击流分析说明了关联规则的适用范围有多广:只要把数据看成"一个个篮子,每个篮子里装着若干 items",就能套用。在点击流里,"篮子"是一次浏览会话(session),"items"是这次会话访问过的页面。

## §17 R 实例(上):Groceries 数据集与 transactions 类

Slides 34–48 用 R 走完了一个完整的例子。🎙️ 讲师提到,这周的 lab 会用 Python 做同样的事(Python 写法见 §21 末尾)。

**目标与工具(slide 34)。** 用 Apriori 算法生成 frequent itemsets 和规则,再把规则可视化。用到两个 R 包:`arules` 负责挖掘,`arulesViz` 负责可视化。

```r
install.packages('arules')
install.packages('arulesViz')
library('arules')
library('arulesViz')
```

**数据集(slide 35)。** **Groceries** 是 `arules` 自带的数据集,记录了一家杂货店 30 天里真实的销售交易。

```r
data(Groceries)
Groceries
## transactions in sparse format with
##  9835 transactions (rows) and
##  169 items (columns)

summary(Groceries)
## transactions as itemMatrix in sparse format with
##  9835 rows (elements/itemsets/transactions) and
##  169 columns (items) and a density of 0.02609146
##
## most frequent items:
##       whole milk other vegetables       rolls/buns
##             2513             1903             1809
##           yogurt          (Other)
##             1372            34055
```

🎙️ 讲师的解读:将近 10,000 笔交易,169 种商品,*"所以不是一家大店"*。`summary()` 告诉你行数和列数:行对应交易,列对应商品;某件商品出现在某笔交易里,对应的格子就是 1,否则是 0。

**Density(密度)是什么?** 它是矩阵里 1 所占的比例。顺着这个数可以算出两件有意思的事(📎):

- 矩阵共有 $9835 \times 169 = 1{,}662{,}115$ 个格子,其中 1 的个数约为 $0.02609146 \times 1{,}662{,}115 \approx 43{,}367$,也就是全部交易里一共出现了约 43,367 件商品;
- 平均每笔交易有 $0.02609146 \times 169 \approx 4.4$ 件商品。

换句话说,矩阵里约 97.4% 的格子是 0。🎙️ 讲师解释,所以系统并不存储 0,只记录 1 的位置:*"这是一个非常稀疏的矩阵,为了省内存、提高计算效率,只记录 1。"* 输出里的 "sparse format" 就是这个意思。

**最常见的商品。** whole milk(全脂牛奶)出现在 2513 笔交易里,support $= 2513/9835 \approx 0.2555$:**每四个购物篮里就有一个装着全脂牛奶**。请记住这个数,§19 和 §20 会用到它。

> ⚠️ **Slide 35 的截图少了一列** — 完整的 R 输出在 rolls/buns 和 yogurt 之间还有 **soda 1715**。用 density 一验便知:$2513+1903+1809+1715+1372+34055 = 43{,}367$,正好等于上面算出的 1 的总数;少了 soda 则只有 41,652,对不上。

**transactions 类(slide 36)。**

```r
class(Groceries)
## [1] "transactions"
## attr(,"package")
## [1] "arules"
```

`arules` 用一个专门的类 **transactions** 来存交易数据,它由三部分组成:

| 组成部分 | slides 的定义 | 说明 |
|---|---|---|
| `transactionInfo` | a data frame with vectors of the same length as the number of transactions | 每笔交易一行的附加信息,slide 举的例子是顾客 ID |
| `itemInfo` | a data frame to store item labels | 169 行,每行一种商品的名字和分类 |
| `data` | a binary incidence matrix that indicates which item labels appear in every transaction | 哪件商品出现在哪笔交易里;没有它,就不知道顾客买了什么 |

**itemInfo:商品的层级(slide 37)。**

```r
Groceries@itemInfo[1:20,]
##               labels  level2           level1
## 1        frankfurter sausage meet and sausage
## 2            sausage sausage meet and sausage
## 3         liver loaf sausage meet and sausage
## 4                ham sausage meet and sausage
## 5               meat sausage meet and sausage
## 6  finished products sausage meet and sausage
## 7    organic sausage sausage meet and sausage
## 8            chicken poultry meet and sausage
## 9             turkey poultry meet and sausage
## 10              pork    pork meet and sausage
```

(代码请求的是前 20 行,slide 只截了前 10 行。)

`labels` 是具体商品名,`level2` 和 `level1` 是什么? 🎙️ 讲师解释:level2 是子类(subcategory),level1 是大类(category),三者构成一个层级:frankfurter 属于 sausage 子类,sausage 子类又属于 meet and sausage 大类。

```d2
direction: right
classes: {
  leaf: {style: {fill: "#ffffff"; stroke: "#888888"}}
}
cat: "level1 大类\nmeet and sausage"
sub1: "level2 子类\nsausage"
sub2: "level2 子类\npoultry"
sub3: "level2 子类\npork"
l1: "labels\nfrankfurter · sausage · liver loaf · ham\nmeat · finished products · organic sausage" {class: leaf}
l2: "labels\nchicken · turkey" {class: leaf}
l3: "labels\npork" {class: leaf}
sub3 -> l3
sub2 -> l2
sub1 -> l1
cat -> sub3
cat -> sub2
cat -> sub1
```

> 🎙️ **层级有什么用?** 讲师说:某件具体商品的数据太少时,可以改在 level2 上分析。level2 把同类商品合并成一个子类,数据量变大,得出的结论更可靠。

> ⚠️ "meet and sausage" 的拼写错误(应为 meat)来自数据集本身,不是 slides 的笔误。写代码按这个类别筛选时,要照数据集里的拼法写。

**data:看看真实的交易(slide 38)。** 显示第 10 到第 20 笔交易:

```r
apply(Groceries@data[,10:20], 2,
      function(r) paste(Groceries@itemInfo[r,"labels"], collapse=", "))
## [1] "whole milk, cereals"
## [2] "tropical fruit, other vegetables, white bread, bottled water, chocolate"
## [3] "citrus fruit, tropical fruit, whole milk, butter, curd, yogurt, flour, bottled water, dishes"
## [4] "beef"
## ...
```

(代码会输出 11 笔交易,slide 只截了前 4 笔。)🎙️ 讲师读了其中几笔:有位顾客买了全脂牛奶和麦片,有位顾客只买了牛肉。*"这些是真实的交易,只不过以 binary incidence matrix 的形式存储。"*

> 📎 **这行代码怎么读(超出 slides)**
>
> - `Groceries@data`:`@` 用来取 S4 对象的某个组成部分(slot)。这个矩阵在内部按 **商品 × 交易**(169 行 × 9835 列)存储,和 `summary()` 里"交易 × 商品"的视角正好转置。所以 `[,10:20]` 取的是第 10–20 **列**,也就是第 10–20 笔交易。
> - `apply(..., 2, f)`:对矩阵的每一列执行函数 `f`(第二个参数 2 表示按列)。
> - 每一列 `r` 是长度 169 的逻辑向量,这笔交易含有哪件商品,对应位置就是 TRUE。`Groceries@itemInfo[r, "labels"]` 用它挑出这些商品的名字,`paste(..., collapse=", ")` 再把名字连成一个字符串。

## §18 R 实例(中):用 apriori() 找 frequent itemsets

Slide 39:

> **Frequent Itemset Generation: Use apriori() function in the arules package. The apriori() function executes all the iterations (What are they?) once. Specify the minimum support threshold. Until it runs out of support or until k (in k-itemset) reaches the default maxlen = 10.**

**slide 上问的 "iterations" 是什么?** 就是 §7 那个自底向上的循环:数 1-itemsets 得到 $L_1$,生成 $C_2$ 并计数得到 $L_2$,再生成 $C_3$……你只调用一次 `apriori()`,它在内部把所有层都跑完。🎙️ 讲师:*"希望你还记得这个迭代:自底向上,从 1-itemset 到 2-itemset,再到 3-itemset。"*

```r
itemsets <- apriori(Groceries, parameter=list(minlen=1, support=0.02,
                    target="frequent itemsets"))
```

| 参数 | 本例取值 | 含义 |
|---|---|---|
| `support` | 0.02 | minimum support $\delta$:至少出现在 2% 的交易里,约 $0.02\times9835\approx197$ 笔 |
| `minlen` | 1 | itemset 的最短长度,从 1-itemset 开始 |
| `maxlen` | 10(默认,未设) | itemset 的最长长度,相当于伪代码里的 $N$ |
| `target` | `"frequent itemsets"` | 只做第一阶段;改成 `"rules"` 就会继续生成规则 |
| `confidence` | 0.8(默认,未设) | 只在 `target = "rules"` 时起作用,这里用不上 |

**读输出(slide 40)。**

```text
parameter specification:
 confidence minval smax arem  aval originalSupport support minlen maxlen            target   ext
        0.8    0.1    1 none FALSE            TRUE    0.02      1     10 frequent itemsets FALSE

algorithmic control:
 filter tree heap memopt load sort verbose
    0.1 TRUE TRUE  FALSE TRUE    2    TRUE

apriori - find association rules with the apriori algorithm
version 4.21 (2004.05.09)        (c) 1996-2004   Christian Borgelt
set item appearances ...[0 item(s)] done [0.00s].
set transactions ...[169 item(s), 9835 transaction(s)] done [0.00s].
sorting and recoding items ... [59 item(s)] done [0.00s].
creating transaction tree ... done [0.00s].
checking subsets of size 1 2 3 done [0.00s].
writing ... [122 set(s)] done [0.00s].
creating S4 object  ... done [0.00s].
```

| 输出 | 含义 |
|---|---|
| `parameter specification` | 回显参数。🎙️ 你设了的(support、minlen、target)照你的来,没设的用默认值 |
| `algorithmic control` | 算法内部的控制选项,本课不要求 |
| `set item appearances ...[0 item(s)]` | 📎 没有设置 item appearance 限制(比如"某商品只许出现在 rhs") |
| `set transactions ...[169 item(s), 9835 transaction(s)]` | 读入数据:169 种商品,9835 笔交易 |
| `sorting and recoding items ... [59 item(s)]` | 📎 support ≥ 0.02 的商品只有 59 种,这就是 $L_1$。其余 110 种商品直接出局,包含它们的 itemset 一个也不用看——Apriori property 在第一步就发挥了作用 |
| `checking subsets of size 1 2 3` | 逐层检查 1-、2-、3-itemsets,这就是 slide 39 问的 iterations。🎙️ 停在 3,说明找不到 frequent 4-itemset:还没到 maxlen = 10,就已经 runs out of support |
| `writing ... [122 set(s)]` | 🎙️ 一共找到 122 个 frequent itemsets:59 个 1-itemsets,其余 63 个是 2-itemsets 和 3-itemsets |

> 🎙️ **support 怎么设?** 讲师提醒:*"你得会挑一个合适的 support。太高,找不到规则;太低,规则多得处理不过来。"*

## §19 R 实例(下):生成规则,读 summary

**生成规则(slides 41–42)。**

```r
rules <- apriori(Groceries, parameter=list(support=0.001,
                 confidence=0.6, target = "rules"))
```

和 §18 相比改了三处:`target` 改成 `"rules"`(🎙️ *"你只需要把 frequent itemsets 改成 rules"*);新设了 `confidence = 0.6`;`support` 从 0.02 降到 0.001。

输出中值得看的几行:

```text
sorting and recoding items ... [157 item(s)] done [0.00s].
creating transaction tree ... done [0.00s].
checking subsets of size 1 2 3 4 5 6 done [0.01s].
writing ... [2918 rule(s)] done [0.00s].
```

- support ≥ 0.001 的商品有 157 种;
- itemset 一直查到 6 个 item 那一层;
- 最后写出 **2918 条规则**。🎙️ 讲师:*"将近 3000 条,很多。"*

为什么要把 support 降这么多? 在 0.02 时,最长的 frequent itemset 只有 3 个 item,能生成的规则很少,也多半是热门商品之间的组合。降到 0.001(约 10 笔交易)后,更长、更少见的组合也能通过,规则多了,也长了。代价是不少规则只靠很少几笔交易撑着,下面马上会看到。

**summary(rules)(slide 43)。**

```text
summary(rules)
set of 2918 rules

rule length distribution (lhs + rhs):sizes
   2    3    4    5    6
   3  490 1765  626   34

   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
  2.000   4.000   4.000   4.068   4.000   6.000

summary of quality measures:
    support           confidence          lift
 Min.   :0.001017   Min.   :0.6000   Min.   : 2.348
 1st Qu.:0.001118   1st Qu.:0.6316   1st Qu.: 2.668
 Median :0.001220   Median :0.6818   Median : 3.168
 Mean   :0.001480   Mean   :0.7028   Mean   : 3.450
 3rd Qu.:0.001525   3rd Qu.:0.7500   3rd Qu.: 3.692
 Max.   :0.009354   Max.   :1.0000   Max.   :18.996

mining info:
      data ntransactions support confidence
 Groceries          9835   0.001        0.6
```

**规则长度分布。** 长度 = lhs 的 item 数 + rhs 的 item 数:

| 规则长度 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| 规则条数 | 3 | 490 | 1765 | 626 | 34 |

合计 $3+490+1765+626+34 = 2918$。最常见的是长度 4 的规则(中位数也是 4),最长 6。

> ⚠️ 录音里讲师把最后一列读成了"最长的是 34"。正确的读法是:**长度为 6 的规则有 34 条**。

**三个指标的分布。** 每个指标都给出了最小值、四分位数、中位数、均值和最大值。🎙️ 讲师提醒,这套描述统计量 Week 3 讲 visualization 时学过。

- **support**:最小 0.001017,即 $10/9835$。📎 设 support = 0.001,相当于"至少 $0.001\times9835 \approx 9.8$ 笔",取整就是至少 10 笔。中位数 0.00122 是 12 笔,最大 0.009354 是 92 笔。也就是说,**一半的规则只靠不超过 12 笔交易支撑**。
- **confidence**:最小 0.6(正好是阈值),最大 1.0,中位数 0.68。
- **lift**:最小 2.348,中位数 3.168,最大 18.996。**每一条规则的 lift 都大于 1。**

> 📎 **为什么 lift 的最小值恰好是 2.348?(超出 slides)** — 由 §13,$\text{Lift} = \text{Confidence}/\text{Support}(Y)$。每条规则的 confidence 都 ≥ 0.6;rhs 的 support 最大也就是最热门的 whole milk 的 0.2555。所以
>
> $$\text{Lift}\ \ge\ \frac{0.6}{0.2555}\ \approx\ 2.348$$
>
> 和输出的最小值分毫不差。lift 最小的那条规则,rhs 一定是 {whole milk},confidence 一定是 0.6:换成任何别的 rhs(support 最多 0.1935),lift 至少是 $0.6/0.1935\approx3.10$。
>
> 推广一下:**如果每种商品的 support 都低于 minimum confidence,那么所有过了 confidence 门槛的规则,lift 都必然大于 1。** Groceries 里没有任何商品出现在 60% 以上的交易里,所以 confidence 阈值顺带替我们挡掉了负关联的规则。这并不是普遍规律:§15 的示例交易表里商品的 support 高达 0.8,confidence 0.75 的规则 lift 反而小于 1。

> 📎 **arules 的规则只有一个 rhs item(超出 slides)** — `arules` 的 `apriori()` 默认只生成 rhs 恰好含一个 item 的规则。所以最短的规则长度是 2(1 个 item → 1 个 item),后面图里每条规则的 rhs 也都是单个商品。这和 §9 枚举的 AB → CD 那类规则不同。Python 的 mlxtend 则会生成 rhs 含多个 item 的规则。

> 📎 **版本提示(超出 slides)** — slides 上的输出来自教材当年的 arules 版本。新版 arules 给每条规则多算了两列 quality:**coverage**(lhs 的 support)和 **count**(包含整条规则的交易笔数)。所以你自己运行时,`summary()` 和 `inspect()` 会多出这两列,`plot(rules@quality)` 也会画成 5 × 5 的散点图矩阵;`apriori()` 打印的版本号、耗时等细节也会不同。复习和考试以 slides 为准。

## §20 R 实例:把 2918 条规则画出来

🎙️ 讲师:*"东西太多的时候,你没法一条条看。最简单的办法就是可视化。"* slides 展示了四种图。

**① 散点图:`plot(rules)`(slide 44)。**

横轴是 support,纵轴是 confidence,点的深浅表示 lift(颜色越深,lift 越高)。🎙️ 讲师的读法:所有点的 support 都在 minimum support 之上、confidence 都在 minimum confidence 之上;点主要挤在左侧 support 很低的区域。

📎 另外两个细节:

- 最左边的点排成一条条竖线,因为 support = 计数 / 9835 只能取 10/9835、11/9835……这些离散值;
- 颜色最深(lift 最高)的点集中在 support 很低的地方。这和 §14 说的一致:lift 会放大稀有组合的关联。

**② 散点图矩阵:`plot(rules@quality)`(slide 45)。**

`rules@quality` 是一个 data frame,每行一条规则,三列分别是 support、confidence、lift。对 data frame 调用 `plot()`,得到三个指标两两配对的 **scatterplot matrix(散点图矩阵)**:support 对 confidence、support 对 lift、confidence 对 lift。

> 🎙️ **讲师留的课后思考题** — *"你会看到一些看起来像直线的结构。为什么这些点落在同一条直线上? 这条线代表什么? 是什么造成了这些直线?"*

> 📎 **参考答案(本讲义的分析)** — 关键还是 $\text{Lift} = \text{Confidence}/\text{Support}(Y)$。arules 的每条规则,rhs 都是单个商品。**rhs 相同的规则,$\text{Support}(Y)$ 是同一个常数**,于是对这一组规则来说
>
> $$\text{Lift} = \frac{1}{\text{Support}(Y)}\times\text{Confidence}$$
>
> 在 confidence–lift 面板上,它们落在一条过原点、斜率为 $1/\text{Support}(Y)$ 的直线上。**每条直线对应一个 rhs 商品**;rhs 商品越冷门,直线越陡。以两个最热门的商品为例:
>
> | rhs 商品 | Support(Y) | 直线方程 | confidence ∈ [0.6, 1] 时 lift 的范围 |
> |---|---|---|---|
> | whole milk | $2513/9835\approx0.2555$ | lift ≈ 3.91 × confidence | 2.35 – 3.91 |
> | other vegetables | $1903/9835\approx0.1935$ | lift ≈ 5.17 × confidence | 3.10 – 5.17 |
>
> Groceries 里大量规则的 rhs 是 whole milk、other vegetables 这类热门商品,所以图上能看到几条点很密的直线。

**③ 矩阵图(slide 46)。**

```r
confidentRules <- rules[quality(rules)$confidence > 0.9]
plot(confidentRules, method="matrix", measure=c("lift", "confidence"),
     control=list(reorder=TRUE))
```

- 先挑出 confidence > 0.9 的规则,共 **127 条**(图题 "Matrix with 127 rules");
- 横轴是 antecedent(LHS)的编号,纵轴是 consequent(RHS)的编号。🎙️ 讲师指出,rhs 只有 5 种,因为很多规则的 rhs 是重复的;lhs 则大约有 120 种;
- 每个格子的颜色**同时**编码 lift 和 confidence,右上角是一张二维的颜色图例;
- 📎 `reorder=TRUE` 会重排行和列,让相似的规则挨在一起,图案更容易看出来。

🎙️ 讲师的读法:看某一块颜色,先找它的横坐标(哪个 lhs)和纵坐标(哪个 rhs),再到图例上对照颜色,读出这条规则大致的 lift 和 confidence。

**④ 关系图(slide 47)。**

```r
highLiftRules <- head(sort(rules, by="lift"), 5)
plot(highLiftRules, method="graph", control=list(type="items"))
```

- 按 lift 排序,取前 5 条规则;
- 每条规则画成一个圆:**圆的大小表示 support**(0.001–0.002),**颜色表示 lift**(11.279–18.996,越深越高);
- 🎙️ 指向圆的箭头来自 lhs 的商品,从圆出发的箭头指向 rhs 的商品。讲师的例子:popcorn 和 soda 指向一个圆,圆再指向 salty snack,读作 {popcorn, soda} → {salty snack};
- 颜色最深的圆是 {Instant food products, soda} → {hamburger meat},正是下一节 `inspect()` 输出的第 1 名。

下面按 `inspect()` 输出里的前三条规则,示意性地重画这种图(📎 只画了 5 条中的 3 条)。注意 soda 同时连着两条规则——关系图的好处,就是能看出规则之间共享哪些商品:

```d2
direction: right
classes: {
  item: {style: {fill: "#ffffff"; stroke: "#888888"}}
  rule: {shape: circle; style: {fill: "#5b6b7a"; stroke: "#3d4a56"; font-color: "#ffffff"}}
}
instant: "Instant food products" {class: item}
soda: soda {class: item}
popcorn: popcorn {class: item}
ham: ham {class: item}
cheese: "processed cheese" {class: item}
burger: "hamburger meat" {class: item}
snack: "salty snack" {class: item}
bread: "white bread" {class: item}
r1: "规则 1\nlift 19.0" {class: rule}
r2: "规则 2\nlift 16.7" {class: rule}
r3: "规则 3\nlift 15.0" {class: rule}
instant -> r1
soda -> r1
r1 -> burger
soda -> r2
popcorn -> r2
r2 -> snack
ham -> r3
cheese -> r3
r3 -> bread
```

## §21 inspect():把规则读出来

```r
inspect(head(sort(rules, by="lift"), 10))
```

Slide 48 显示了前三条:

```text
    lhs                               rhs                support     confidence lift
1   {Instant food products, soda}  => {hamburger meat}   0.001220132 0.6315789  18.995654
2   {soda, popcorn}                => {salty snack}      0.001220132 0.6315789  16.697793
3   {ham, processed cheese}        => {white bread}      0.001931876 0.6333333  15.045491
```

用大白话读第 1 条:

- **support 0.00122**:全部交易里,有 0.122%(约 12 笔)同时买了速食、汽水和汉堡肉饼;
- **confidence 0.632**:买了速食和汽水的交易里,63% 也买了汉堡肉饼;
- **lift 19.0**:在这些交易里,汉堡肉饼出现的频率是它在全部交易中的 19 倍。

> **🔑 例(📎 由三个数反推原始计数)**
>
> 已知 $N = 9835$,以第 1 条规则为例:
>
> **第 1 步** — $n(X\wedge Y) = \text{support}\times N = 0.001220132\times9835 = 12$。
>
> **第 2 步** — $n(X) = n(X\wedge Y)/\text{confidence} = 12/0.6315789 = 19$。也就是说,confidence 就是 $12/19$。
>
> **第 3 步** — $\text{Support}(Y) = \text{confidence}/\text{lift} = 0.6315789/18.995654 \approx 0.03325$,所以 $n(Y)\approx 0.03325\times9835 \approx 327$:汉堡肉饼一共出现在 327 笔交易里(3.3%)。
>
> **第 4 步** — $\text{Leverage} = 0.001220 - \dfrac{19}{9835}\times\dfrac{327}{9835} \approx 0.001220 - 0.000064 = 0.001156$,乘以 $N$ 约为 11.4:比巧合水平多出大约 11 笔交易。
>
> 第 3 条规则同理:$n(X\wedge Y)=19$,$n(\{\text{ham, processed cheese}\})=30$,$n(\text{white bread})\approx414$,leverage ≈ 0.0018(约多出 18 笔)。

这道反推题说明了一件事:**lift 19 听上去惊人,可这条规则只建立在 12 笔交易上。** 在据此调整货架之前,应该先看看支撑它的交易笔数和 leverage,再听听领域专家怎么说。这正是下一节 *"cover few transactions"* 的警告。

再用主观标准看一眼(📎):第 2 条 {soda, popcorn} → {salty snack} 像是"看电影、开派对"的购物篮,店长多半早就知道,未必新颖;第 1 条(速食 + 汽水 → 汉堡肉饼)也许对应一种"快手晚餐"的购物模式,值不值得做组合促销,要由懂业务的人判断。

> 📎 **Python 版本(为本周 lab 准备,超出 slides)** — Python 里常用 `mlxtend` 库做关联规则。下面在示例交易表上跑一遍完整流程(已在 mlxtend 0.25 上验证),具体写法以 lab 提供的代码为准:
>
> ```python
> import pandas as pd
> from mlxtend.preprocessing import TransactionEncoder
> from mlxtend.frequent_patterns import apriori, association_rules
>
> transactions = [
>     ["Bread", "Milk"],
>     ["Bread", "Diaper", "Beer", "Eggs"],
>     ["Milk", "Diaper", "Beer", "Coke"],
>     ["Bread", "Milk", "Diaper", "Beer"],
>     ["Bread", "Milk", "Diaper", "Coke"],
> ]
>
> # 1) 转成 binary incidence matrix:每行一笔交易,每列一种商品
> te = TransactionEncoder()
> onehot = te.fit(transactions).transform(transactions)
> df = pd.DataFrame(onehot, columns=te.columns_)
>
> # 2) 阶段一:frequent itemsets(min support = 0.6,即 3/5)
> itemsets = apriori(df, min_support=0.6, use_colnames=True)
>
> # 3) 阶段二:规则(min confidence = 0.7),再按 lift 排序
> #    num_itemsets 填交易总数;旧版 mlxtend 若报
> #    unexpected keyword,删掉这个参数即可
> rules = association_rules(itemsets, metric="confidence",
>                           min_threshold=0.7, num_itemsets=len(df))
> rules = rules.sort_values("lift", ascending=False)
> print(rules[["antecedents", "consequents", "support",
>              "confidence", "lift", "leverage"]])
> ```
>
> 输出正是 §15 那张表的 8 条规则:Beer ↔ Diaper 两条排在最前(lift 1.25、leverage 0.12),其余六条 lift 0.9375、leverage −0.04。和 R 的对应关系:`TransactionEncoder` ≈ transactions 类的 `data`,`apriori()` ≈ `target="frequent itemsets"`,`association_rules()` ≈ `target="rules"`,`sort_values("lift")` ≈ `sort(rules, by="lift")`。

---

# Part VI · 验证、诊断与收束

## §22 Validation and testing:哪些规则不该信

算法给出了一大堆规则,指标也算好了。哪些规则应该扔掉? Slide 49:

> **Uninteresting rules: Involve mutually independent items; Cover few transactions. Some rules could be purely coincidental: If 95% of customers buy X and 90% of them buy Y, then X and Y would occur together at least 85% of the time, even if there is no relationship between them. Subjective criteria: Rules don't reveal unexpected profitable actions.**

**① 无趣的规则(uninteresting rules)**,有两种:

- **涉及相互独立的 items**:lift ≈ 1、leverage ≈ 0,用 lift 或 leverage 一筛就掉;
- **只覆盖很少几笔交易**:support 太低,统计上不可靠,minimum support 就是用来防它的。

🎙️ 讲师说,这两类可以很快删掉。

**② 纯属巧合的规则(purely coincidental)。** Slide 上的例子值得细算一遍。

> **🔑 例(95% 与 90% 为什么推出至少 85%)**
>
> 设 95% 的顾客买 $X$,90% 的顾客买 $Y$。📎 由容斥原理(inclusion–exclusion):
>
> $$\begin{aligned}P(X\cap Y)&=P(X)+P(Y)-P(X\cup Y)\\&\ge P(X)+P(Y)-1\\&=0.95+0.90-1=0.85\end{aligned}$$
>
> 不等号成立是因为 $P(X\cup Y)\le 1$。换成直觉:不买 $X$ 的只有 5%,不买 $Y$ 的只有 10%,就算这两拨人完全不重合,"至少缺一样"的人也最多 15%,所以至少 85% 的人两样都买了。
>
> 再看这条规则的各项指标:
>
> - $\text{Support}(X\wedge Y)\ge 0.85$:任何 minimum support 都拦不住;
> - $\text{Confidence}(X\rightarrow Y)\ge 0.85/0.95\approx 0.89$:几乎任何 minimum confidence 也拦不住;
> - 可如果 $X$、$Y$ 相互独立,$P(X\cap Y)=0.95\times0.90=0.855$,lift = 1,leverage = 0。哪怕取下界 0.85,lift 也只有 $0.85/0.855\approx0.994<1$。
>
> **support 和 confidence 都说"这是条强规则",只有 lift 和 leverage 看穿了它。** 🎙️ 讲师:*"这就是为什么我们需要用 lift 和 leverage 来识别它们。"*
>
> (📎 slide 原文是 "90% of **them** buy Y"。不论 "them" 指全体顾客还是买了 $X$ 的那 95%,两样都买的比例都在 85% 左右——0.85 是下界,0.95 × 0.90 = 0.855 是独立时的值——结论不变。)

**③ 主观上没用的规则(subjective criteria)。** *"Rules don't reveal unexpected profitable actions"*:规则过了所有客观指标,可它揭示的东西要么人人皆知,要么没法变成能赚钱的行动。🎙️ 讲师的解释:我们要找的是能揭示**意料之外、有利可图的行动**的规则;"没有揭示意外",就说明它在意料之中、很常见。这一步只能依靠领域知识。

| 规则的毛病 | 例子 | 用什么识别 |
|---|---|---|
| items 相互独立 | eggs → ice cream(§12) | lift ≈ 1,leverage ≈ 0 |
| 覆盖的交易太少 | 只靠几笔交易撑着的规则(§21) | minimum support;看原始计数 |
| 纯属巧合 | 95% / 90% 的例子 | lift、leverage(support 和 confidence 都会上当) |
| 意料之中,或无法行动 | CEO:"20 年前就知道了"(§15) | 人的判断(subjective) |

## §23 Diagnostics:用好关联规则的几条提醒

Slide 50:

> **Measures like confidence, lift, and leverage shall be used along with human insights. Properly specify the minimum support. Apriori algorithm can be computationally expensive! Various methods to improve Apriori's efficiency.**

1. **指标要和人的洞察一起用。** 🎙️ 讲师说这一点已经强调过好几次了。
2. **minimum support 要设得恰当。** 🎙️ 讲师:*"太高、太低都会出问题。"* 太高,只剩人尽皆知的热门组合,有价值的规则被漏掉;太低,itemset 和规则的数量爆炸,运行时间变长,还会冒出一大批只靠几笔交易撑着的规则——§19 的 2918 条规则里,一半只有不超过 12 笔交易支撑。
3. **Apriori 的计算开销可能很大。** 🎙️ 讲师指出,虽然本章的主线就是用 downward closure 和 anti-monotone 性质快速剪枝,但数据量大、support 阈值又低时,候选和规则依然可能多到处理不过来,运行仍然要花不少时间;而且 Apriori 每长一层就要完整扫描一遍数据库(§7)。*"今天讲的是最基础的版本。"*
4. **有很多改进 Apriori 效率的方法。** 🎙️ 讲师说课上没时间展开。下表供了解:

> 📎 **拓展(超出 slides):常见的效率改进思路**
>
> | 方法 | 思路 |
> |---|---|
> | Partitioning(分区) | 把数据库切成几块,分别找各块的 frequent itemsets。在整体中 frequent 的 itemset,至少在某一块里也 frequent;最后再扫一遍全库核实 |
> | Sampling(抽样) | 在随机样本上用较低的阈值挖掘,再到全库验证,用一点准确性换速度 |
> | Transaction reduction(交易缩减) | 一笔交易如果不含任何 frequent k-itemset,也就不可能含 frequent (k+1)-itemset,后续扫描可以跳过它 |
> | Hash-based itemset counting(哈希计数) | 扫描时把候选 itemset 哈希进若干个桶并计数;某个桶的总计数都不到阈值,桶里的候选就不可能 frequent |
> | Dynamic itemset counting(动态计数) | 不必等下一轮完整扫描:一旦某个候选的所有子集都估计为 frequent,就在扫描途中开始给它计数 |
> | FP-Growth | 把数据库压缩成一棵 FP-tree,直接在树上挖 frequent itemsets,完全不生成候选(mlxtend 里的 `fpgrowth()` 就是它) |

## §24 回到起点:什么样的规则才算好规则

Slide 51 的回顾:

> **Apriori Algorithm — unsupervised analysis technique; uncovers relationships among items. A wide range of applications. Several measures to help validation. Interesting rules — do not seem obvious; provide valuable insights.**

🎙️ 讲师的结束语是:*"有趣的规则应该是出乎意料的——也就是看起来不显然、不是众所周知的——并且能提供有价值的洞察,还应该是可以付诸行动的。"*

把整章串起来看:**算法**(Apriori 和两次剪枝)让我们能在可接受的时间里找出候选规则;**指标**(confidence、lift、leverage)帮我们挑出可靠的规则、识破巧合;**人**最后决定哪些规则新颖、哪些能付诸行动。三者缺一不可。

---

# 本章小结 (Key takeaways)

- **关联规则是一种 unsupervised、descriptive 的方法**:它不预测新样本,而是从交易数据中发现 items 之间"一起出现"的关系,产出 frequent itemsets 和 $X\rightarrow Y$ 形式的规则(lhs → rhs)。
- **关联分析分两步**:先用 minimum support 找出全部 frequent itemsets,再把每个 frequent itemset 一分为二生成规则、用 minimum confidence 筛选;只有建立在 frequent itemsets 上的规则才可靠。
- **暴力枚举不可行**:$d$ 种商品有 $2^d$ 个候选 itemset,计数复杂度约为 $O(NMw)$。计算复杂度是本章的首要动机,全章的技术都在想办法"不数就删"。
- **Apriori property**:frequent itemset 的子集都 frequent;等价地,infrequent itemset 的超集都 infrequent。Apriori 算法自底向上逐层生长,只用上一层的 frequent itemsets 构造候选,并用这条性质剪枝——slides 的例子里,41 次计数降到 13 次。
- **一个 frequent k-itemset 能生成 $2^k-2$ 条候选规则**。confidence 一般没有 anti-monotone 性质,但在同一个 itemset 生成的规则中,rhs 越大 confidence 越小($c(ABC\rightarrow D)\ge c(AB\rightarrow CD)\ge c(A\rightarrow BCD)$),可以据此在规则 lattice 上剪枝。
- **Confidence 就是条件概率 $P(Y\mid X)$**,但它忽略了 $Y$ 自身的热门程度:$X$、$Y$ 独立时 confidence 恰好等于 $\text{Support}(Y)$,所以 $Y$ 越热门,巧合规则的 confidence 就越高。
- **Lift 是观测共现与独立期望之比**($=\text{Confidence}/\text{Support}(Y)$,独立时为 1,小于 1 表示负相关);**leverage 是两者之差**(独立时为 0,可以为负)。二者都能揭穿巧合规则,但 lift 偏向稀有组合、leverage 偏向常见组合,排序可能不一致。
- **四个指标都是 objective measures**;规则是否新颖、有没有价值、能不能付诸行动,要由人结合领域知识判断。好规则不显然、能提供有价值的洞察、可以付诸行动。
- **R 实践**:`apriori()` 一次跑完所有迭代,`target` 决定输出 itemsets 还是 rules;`summary()` 看分布,四种 `plot()`(散点图、散点图矩阵、矩阵图、关系图)看全貌,`inspect()` 读具体规则。

# 公式速查

| 量 | 公式 | slides 上的例子 |
|---|---|---|
| Support | $\text{Support}(X)=\dfrac{\text{含 }X\text{ 的交易数}}{N}$ | 示例交易表:{Diaper, Beer} 出现 3 次,3/5 = 0.6 |
| Confidence | $\dfrac{\text{Support}(X\wedge Y)}{\text{Support}(X)}=P(Y\mid X)$ | slide 19:0.15 / 0.15 = 1.0 |
| Lift | $\dfrac{\text{Support}(X\wedge Y)}{\text{Support}(X)\cdot\text{Support}(Y)}=\dfrac{\text{Confidence}(X\rightarrow Y)}{\text{Support}(Y)}$ | slide 27:0.3 / (0.5 × 0.4) = 1.5 |
| Leverage | $\text{Support}(X\wedge Y)-\text{Support}(X)\cdot\text{Support}(Y)$ | slide 30:0.3 − 0.2 = 0.1 |
| 候选 itemset 数 | $2^d$(含空集) | $d=4$ 时为 16 |
| 暴力计数的复杂度 | $O(NMw)$,其中 $M=2^d$ | slide 10 |
| 一个 k-itemset 的候选规则数 | $2^k-2$ | $k=4$ 时为 14 |
| 同一 itemset 内的规则剪枝 | $c(ABC\rightarrow D)\ge c(AB\rightarrow CD)\ge c(A\rightarrow BCD)$ | slide 21 |
| 巧合共现的下界 | $P(X\cap Y)\ge P(X)+P(Y)-1$ | slide 49:0.95 + 0.90 − 1 = 0.85 |

# 全章概念地图

最后把本章的四个指标和两条性质之间的关系画在一起。绿色是四个指标,灰色是它们背后的性质和基准:

```d2
grid-rows: 4
grid-columns: 3
horizontal-gap: 70
vertical-gap: 70
classes: {
  m: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
  p: {style: {fill: "#f7f7f7"; stroke: "#888888"}}
  b: {style: {opacity: 0}}
}
b1: "" {class: b}
sup: "support\n= P(X)" {class: m}
b2: "" {class: b}
ap: "Apriori property\n子集的 support ≥ 超集" {class: p}
conf: "confidence\n= P(Y | X)" {class: m}
ind: "独立时的期望\nsupport(X) · support(Y)" {class: p}
am: "anti-monotone\n同一 itemset 内 rhs 越大越小" {class: p}
lift: "lift\n观测 ÷ 期望" {class: m}
lev: "leverage\n观测 − 期望" {class: m}
b3: "" {class: b}
hum: "人的判断\nnovelty · actionable"
b4: "" {class: b}
sup -> ap: "剪 itemsets"
sup -> conf: "两个 support 相除"
ap -> am: "推出"
conf -> am: "剪规则"
conf -> lift: "÷ support(Y)"
ind -> lift
ind -> lev
lift -> hum
lev -> hum
```

# 考点提示与易错点

1. **两个阶段、两个指标**:support 管 itemsets,confidence 管 rules。会解释"为什么要分两步"和"为什么第二阶段 support 没用了"(同一 itemset 的规则 support 都相同)。
2. **Apriori property 的方向**:frequent → 子集 frequent;infrequent → 超集 infrequent。反方向推不出任何结论。录音里讲师说反过一次,别被带偏。
3. **手算 Apriori**:每一层都写出候选、计数、结果,别漏了 prune 这一步;**按交易表实际去数**——slide 16 把 {Bread, Milk, Diaper} 的计数写成 3,按表实际是 2。
4. **41 和 13**:$\binom{6}{1}+\binom{6}{2}+\binom{6}{3}=6+15+20=41$;$6+6+1=13$。
5. **候选规则数是 $2^k-2$**,不是 $2^k$,也不是录音里的 "2^k − k"。
6. **confidence 的 anti-monotone 只在同一 itemset 内成立**,要能写出证明(分子相同,分母是 lhs 的 support,lhs 越小 support 越大)。
7. **三道计算题**(1.0、1.5、0.1)和 **lift = confidence / support(Y)** 必须熟练。
8. **独立时**:lift = 1,leverage = 0,confidence = support(Y)。
9. **leverage 可以是负数**;lift < 1 表示负相关。
10. **$\text{Support}(X\wedge Y)$ 是 itemset $X\cup Y$ 的 support**,"∧" 是"并且",不是交集。
11. **confidence 有方向,lift 和 leverage 没有。**
12. **95% / 90% / 85% 的例子**:要能说明为什么 support、confidence 都高的规则可能是巧合,以及哪个指标能识破。
13. **objective vs subjective**:novelty 和价值只能由人判断。
14. **R 输出**:`[59 item(s)]`、`checking subsets of size 1 2 3`、`[122 set(s)]`、`[2918 rule(s)]`、rule length distribution 各是什么意思;`target` 参数的两种取值。
15. **散点图矩阵里的直线**:rhs 相同的规则,lift 与 confidence 成正比。

# 自测题

1. 关联规则为什么属于 unsupervised、descriptive 的方法? 它和 classification 的根本区别是什么?
2. 判断对错,并各用一句话说明理由:
   - (a) {A, B, C} 是 frequent,则 {A, C} 一定 frequent。
   - (b) {A} 是 frequent,则 {A, B} 一定 frequent。
   - (c) {B, C} 是 infrequent,则 {A, B, C} 一定 infrequent。
   - (d) $c(ABC\rightarrow D)\ge c(AB\rightarrow D)$ 总是成立。
   - (e) $c(ABC\rightarrow D)\ge c(A\rightarrow BCD)$ 总是成立。
   - (f) $\text{Lift}(X\rightarrow Y)=\text{Lift}(Y\rightarrow X)$。
3. 一家店卖 20 种商品。(a) 一共有多少个非空 itemset? (b) 一个 frequent 5-itemset 能生成多少条候选规则?
4. 有 6 笔交易:T1 {A, B, C},T2 {A, C},T3 {A, D},T4 {B, C, E},T5 {A, B, C, E},T6 {B, E}。设 minimum support = 2(计数)。逐层写出 $C_k$(含计数)和 $L_k$,指出哪些候选被 prune 掉、不必计数,并统计总的计数次数。
5. 接第 4 题。从 frequent itemset {B, C, E} 生成全部候选规则并计算 confidence。minimum confidence = 0.6 时哪些规则保留? 任选两组规则验证 anti-monotone 性质。
6. 已知 Support({X, Y, Z}) = 0.12,Support({X, Y}) = 0.2,求 Confidence({X, Y} → {Z})。
7. 2000 笔交易中,{tea} 出现 400 笔,{sugar} 出现 500 笔,{tea, sugar} 出现 150 笔。(a) 求 Confidence(tea → sugar)、Lift 和 Leverage,并解释含义。(b) 如果 {tea, sugar} 只出现 80 笔呢?
8. 某规则 Confidence(X → Y) = 0.8,而 Support(Y) = 0.8。它的 lift 是多少? 这条规则有价值吗?
9. 用 slide 49 的数字说明:为什么一条 support 和 confidence 都很高的规则可能毫无意义? 哪些指标能识破它?
10. 解释 R 输出:(a) `sorting and recoding items ... [59 item(s)]`;(b) `checking subsets of size 1 2 3`;(c) `writing ... [122 set(s)]`;(d) 第二次运行(support = 0.001)为什么一直查到了 size 6?
11. 讲师的课后题:`plot(rules@quality)` 的 confidence–lift 面板里为什么会出现一条条直线?
12. `inspect()` 输出某条规则 support = 0.001931876、confidence = 0.6333333、lift = 15.045491,交易总数 N = 9835。求 $n(X\wedge Y)$、$n(X)$ 和 $n(Y)$。
13. 为什么 support、confidence、lift、leverage 都无法判断一条规则是否 novel? 举一个例子。

<details>
<summary><b>参考答案(先自己做完再展开)</b></summary>

1. 数据没有 label,算法也不给新样本做预测;它描述的是已收集数据中 items 之间的共现关系。classification 是 supervised、predictive 的:需要带 label 的训练数据,学到的模型用来给新样本分类。

2. 逐项:
   - (a) **对**。Apriori property:frequent itemset 的子集都 frequent。
   - (b) **错**。由 frequent 推不出超集的任何结论。
   - (c) **对**。infrequent itemset 的超集都 infrequent。
   - (d) **错**。两条规则来自不同的 itemset(ABCD 与 ABD),分子分母都变,可大可小。
   - (e) **对**。同一个 itemset ABCD,rhs 从 1 个 item 增加到 3 个,confidence 不会变大。
   - (f) **对**。lift 的公式对 $X$、$Y$ 对称。

3. (a) $2^{20}-1=1{,}048{,}575$。(b) $2^5-2=30$。

4. 逐层:
   - **k = 1**(5 次计数):A 4,B 4,C 4,D 1,E 3。D 出局,$L_1=\{A, B, C, E\}$。
   - **k = 2**(6 次计数):$C_2$ 是 $\binom{4}{2}=6$ 对:AB 2 ✓,AC 3 ✓,AE 1 ✗,BC 3 ✓,BE 3 ✓,CE 2 ✓。$L_2=\{AB, AC, BC, BE, CE\}$。
   - **k = 3**(2 次计数):4 个可能的 3-itemset 里,ABE 和 ACE 含不频繁的 AE,直接 prune。$C_3=\{ABC, BCE\}$:ABC 2 ✓(T1、T5),BCE 2 ✓(T4、T5)。$L_3=\{ABC, BCE\}$。
   - **k = 4**:唯一可能的 ABCE 含有不在 $L_3$ 里的 ACE,直接 prune。$C_4=\varnothing$,算法停止。
   - 总计数 $5+6+2=13$ 次;暴力枚举 5 种商品的全部非空 itemset 要 31 次。

5. {B, C, E} 的计数是 2。

   | 规则 | confidence | ≥ 0.6? |
   |---|---|---|
   | B → CE | 2/4 = 0.50 | ✗ |
   | C → BE | 2/4 = 0.50 | ✗ |
   | E → BC | 2/3 ≈ 0.67 | ✓ |
   | BC → E | 2/3 ≈ 0.67 | ✓ |
   | BE → C | 2/3 ≈ 0.67 | ✓ |
   | CE → B | 2/2 = 1.00 | ✓ |

   验证 anti-monotone:CE → B(1.00)把 E 挪到右边得到 C → BE(0.50),变小了;BE → C(0.67)把 E 挪到右边得到 B → CE(0.50),也变小了。

   附带一提:BE → C 的 lift $=\dfrac{2/6}{(3/6)(4/6)}=1.0$,又是一条 confidence 过关、实际上相互独立的规则。

6. $0.12/0.2=0.6$。

7. (a) 三个 support:tea 0.2,sugar 0.25,两者都有 0.075。
   - Confidence $=0.075/0.2=0.375$;
   - Lift $=0.075/(0.2\times0.25)=1.5$,正相关;
   - Leverage $=0.075-0.05=0.025$,即比巧合多出 $0.025\times2000=50$ 笔。

   注意 confidence 只有 0.375。如果 minimum confidence 设成 0.5,这条确有关联的规则会被筛掉:confidence 低,不等于没有关联。

   (b) 两者都有的 support 变成 0.04:confidence 0.2,lift 0.8,leverage −0.01(比巧合少 20 笔),变成负相关。

8. Lift $=0.8/0.8=1.0$,$X$ 与 $Y$ 相互独立。0.8 的 confidence 完全来自 $Y$ 自身的热门程度,这条规则没有价值。

9. $P(X\cap Y)\ge0.95+0.90-1=0.85$,所以 support ≥ 0.85、confidence ≥ 0.89,两项都很高。可如果两者独立,$P(X\cap Y)=0.855$,lift = 1、leverage = 0;取下界 0.85 时 lift ≈ 0.994。lift 和 leverage 能识破它。

10. 逐项:
    - (a) 169 种商品中只有 59 种的 support ≥ 0.02,即 $L_1$ 有 59 个元素,其余商品直接排除。
    - (b) 逐层检查到 3-itemset 后再找不到 frequent 4-itemset,在达到 maxlen = 10 之前就 runs out of support。
    - (c) 一共找到 122 个 frequent itemsets,其中 59 个是 1-itemsets。
    - (d) support 降到 0.001 后门槛低了,更长、更少见的组合也能达标,itemset 一直长到 6 个 item。

11. $\text{Lift}=\text{Confidence}/\text{Support}(Y)$;arules 的规则 rhs 都是单个商品,rhs 相同的规则 $\text{Support}(Y)$ 相同,于是 lift 与 confidence 成正比,落在一条过原点、斜率为 $1/\text{Support}(Y)$ 的直线上。每条直线对应一个 rhs 商品。

12. $n(X\wedge Y)=0.001931876\times9835=19$;$n(X)=19/0.6333333=30$;$\text{Support}(Y)=0.6333333/15.045491\approx0.04209$,所以 $n(Y)\approx414$。

13. 这四个指标只用到数据里的频率,不知道业务上已经知道什么。比如 {soda, popcorn} → {salty snack} 的 lift 高达 16.7,但"看电影配零食"大概人人都知道;讲师举的例子是 CEO 说"这个我们 20 年前就知道了"。novelty 和价值只能由人结合领域知识判断(subjective)。

</details>

---

# 与前后各周的连接

```d2
direction: right
classes: {
  now: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
W2: "Week 2 · Lifecycle"
W3: "Week 3 · Visualization"
W4: "Week 4 · Clustering"
W5: "Week 5 · Classification"
W6: "Week 6 · Regression"
W7: "Week 7\nAssociation Rules" {class: now}
W8: "Week 8\nText Analysis"
W7 -> W8
W6 -> W7
W5 -> W7
W4 -> W7
W3 -> W7
W2 -> W7
```

- **承接 Week 4**:同为 unsupervised、descriptive。clustering 把对象分组,关联规则找 items 之间的共现。
- **承接 Week 5**:confidence 就是条件概率 $P(Y\mid X)$,讲师直接把它和 Bayes rule 联系起来;lift 用到的"统计独立"也是同一套概率语言。
- **承接 Week 6**:讲师开场回顾了 linear regression 与 logistic regression,随后从监督学习转回无监督学习。
- **呼应 Week 2**:subjective 标准(novelty、价值、能否付诸行动)对应 lifecycle 里对领域知识的强调。
- **复用 Week 3**:`summary(rules)` 的五数概括和各种散点图,都是 Week 3 的描述统计与可视化工具。
- **本周 lab**:用 Python 做关联规则分析,§21 末尾给了 mlxtend 的写法。
- **指向 Week 8**:下一讲是 Text Analysis。📎 文本也可以看成"篮子":一篇文档是一个篮子,里面的词就是 items,词语共现的思路和本周一脉相承。

---

> **本讲义覆盖 slides 全部 52 页 + Week 7 课堂录音全文。**
> 标注为 📎 的内容超出 slides 范围,为补足理解所加;标注为 🎙️ 的内容不在 slides 上,但讲师课堂明确讲授,按考试范围对待;标注为 ⚠️ 的是 slides / 录音里的笔误,或需要特别注意的坑。
