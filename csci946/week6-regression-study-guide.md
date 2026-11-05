# Week 6 · Regression(回归)

> **CSCI446/946 Big Data Analytics** — University of Wollongong, Spring 2026
> 本讲义融合 `Week6-Regression and Association Rules-SP-2026.pdf` 的 **Regression 部分(S1–S36)** 与 Week 6 课堂录音转录。
> Slides 中的图表、表格与代码,除特别注明外均出自教材 *Data Science and Big Data Analytics: Discovering, Analyzing, Visualizing and Presenting Data*(EMC Education Services)。

> ⚠️ **本讲义不含 Association Rules(S37–S66)** — 本周 slides 后半部分是 association rules,但讲师在课上没有讲,原话是 *"I will leave association rules to next week"*。Week 7 换了一份扩充版 slides(`Week7_Lecture_Association_Rules_Enhanced.pdf`,52 页,包含 S38–S66 的全部内容并加了例题),对应的讲解也在 Week 7 录音里。Association rules 放在 Week 7 的讲义中完整讲。
>
> 另外,本周录音的前四分之一是在复习 Week 5 并讲完 Week 5 剩下的几页(confusion matrix、random forest、SVM、神经网络),这些内容见 Week 5 讲义 §41–§43。

---

> **学习目标 (Learning objectives)** — 读完本章你应该能够:
>
> - **区分 classification 与 regression**,并解释为什么 logistic regression 名字里有"回归",却是一个分类方法;
> - **写出 linear regression 的模型方程**,说清每个符号的含义,尤其是 $\beta_j$ 的"其他变量保持不变"和误差项 $\varepsilon$;
> - **写出 OLS 的目标函数**,解释为什么最小化的是*平方*误差,并能对一个小数据集手算出 $\beta_0$、$\beta_1$;
> - **说明 OLS 与"带正态误差假设的 linear regression model"差在哪里**,以及这条额外假设换来了什么能力;
> - **逐行读懂 R 的 `summary(lm(...))` 输出**:Residuals、Estimate、Std. Error、t value、Pr(>|t|)、显著性星号、Residual standard error、Multiple R² 与 Adjusted R²——讲师说 *"this page is important"*;
> - **对单个系数做假设检验**,给出保留或剔除的结论(能复现"Gender 不显著"的判断);
> - **用 $m-1$ 个 binary(dummy)变量编码类别变量**,解释为什么不能按字母顺序编号、为什么有截距时不能用 $m$ 个;
> - **用三类诊断检验模型假设**——线性、残差(零均值与常数方差)、正态性——并为每种违背给出补救办法;
> - **写出 logistic function 与 logit**,解释 logistic regression"线性回归 + logistic 外壳"的两层结构,说明它为什么改用 MLE;
> - **用给定系数手算客户流失概率**,解释阈值怎样左右 FP 与 FN,读懂 ROC 曲线与 AUC;
> - **复述 regression 的三条警示**:correlation ≠ causation、不要在训练数据范围外使用模型、multicollinearity(及 Ridge / Lasso)。

---

## 开篇:同样是预测,这次要猜一个数

上周我们学了 **classification(分类)**:给一个新客户,判断他会不会订购定期存款——答案只有 yes 和 no 两种。KNN、decision tree、naïve Bayes 都在回答这样的问题。

现在换一个问题:给一套新挂牌的房子,它**值多少钱**?答案不再是"贵 / 便宜"这样的两个筐,而是 \$612,000、\$587,500 这样可以取任意值的数。再比如:明天食堂要备多少斤米?一个病人用了 20 mg 药之后血压能降多少?这些问题的输出都是**连续的数量**。回答这类问题的方法叫 **regression(回归)**。

讲师开场的定位很清楚:*"Week 6 is a natural extension of week 5."* 分类与回归都属于 **predictive methods(预测方法)**——用输入特征去预测一个输出,只是输出的类型不同。所以上周建立的整套思路(训练集、测试集、overfitting、模型评估)这周照样适用,只是要换一批具体的工具。

本周讲两个算法:

1. **Linear regression(线性回归)**——名副其实的回归算法,输出一个连续值。这是本周的主体,也是最"技术密集"的部分。讲师课末专门说:*"today we have some part is quite technically intensive... I hope you will have time to review this part."*
2. **Logistic regression(逻辑回归)**——名字叫回归,干的却是分类。讲师的说法很有意思:*"although it is called regression, actually it is used for classification, but the inside of logistic regression algorithm is indeed a linear regression problem."* 也就是说,它是一个包着线性回归内核的分类器。

全章路线如下:

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
P1: "Part I · 回归是什么" {
  grid-columns: 1
  A: "§1 分类 vs 回归"
}
LIN: "Part II · Linear Regression" {
  grid-columns: 6
  horizontal-gap: 40
  M: "§2 模型方程"
  O: "§3 OLS 求 β"
  N: "§4 正态误差假设"
  S: "§5–§7 读 lm() 输出\n系数检验 / R²" {class: key}
  C: "§8 类别变量"
  D: "§9–§10 诊断"
  M -> O -> N -> S -> C -> D
}
LOG: "Part III · Logistic Regression" {
  grid-columns: 6
  horizontal-gap: 40
  F: "§11–§12 logistic function"
  T: "§13 两层结构 / logit"
  E: "§14 MLE 求 β"
  X: "§15 流失例子"
  H: "§16 阈值"
  ROC: "§17 ROC / AUC" {class: key}
  F -> T -> E -> X -> H -> ROC
}
W: "Part IV · 选型与警示" {
  grid-columns: 3
  horizontal-gap: 40
  a: "§18 线性还是 logistic"
  b: "§19 因果 / 外推 / 共线性"
  c: "§20 变换变量"
}
P1 -> LIN -> LOG -> W
```

绿色两块是讲师明确标出的重点:**`summary(lm(...))` 那一页输出**(他说 *"I ask everyone to pay attention to understand this page"*),以及作为分类评估工具的 **ROC 曲线**。

---

# Part I · 回归是什么

## §1 分类与回归:只差在输出的类型上

Slide 3 用两句话划出了分界线:

- **Classification** is the task of predicting a **discrete class label**(离散的类别标签);
- **Regression** is the task of predicting a **continuous quantity**(连续的数量)。

讲师补了几个例子:离散的类别是 *"positive or negative, subscribe or not subscribe, or this is a cat, this is a dog, this is a bicycle"*;连续的数量是 *"price, height, weight, temperature"*。他强调 *"This is the only difference between classification and regression... It's quite simple."*

| | Classification(分类) | Regression(回归) |
|---|---|---|
| 输出类型 | 离散的类别 (categorical / discrete) | 连续的数量 (continuous) |
| 例子 | 订购 / 不订购;猫 / 狗 / 自行车 | 房价、身高、体重、温度 |
| 上周 / 本周的方法 | KNN、decision tree、naïve Bayes | linear regression |
| 本周的"跨界者" | **logistic regression**(名叫回归,实为分类) | — |
| 评估方式 | confusion matrix、accuracy、ROC | 残差、$R^2$ |

### 回归分析想回答什么

Slide 3 还给出了回归分析的目的:**explain the influence that a set of variables has on the outcome of another variable of interest**——解释一组变量对另一个我们关心的变量(outcome)有多大影响。

注意这句话里的重心不只是"预测"。讲师的解释是:*"We want to see how much variation of the output variable can be explained, can be modeled by this set of input variables."* 回归有两个用途,一个是**预测**(给定输入,输出是多少),另一个是**解释**(哪些输入真正起作用、作用多大、方向是正是负)。后面读 R 输出时你会看到,大部分内容都在服务第二个用途:系数是否显著、模型解释了多少变异。

### 与神经网络的联系

Slide 3 的最后一条:**single layer MLPs with linear activation function are linear regression methods**。讲师解释:单层感知机做的事情 *"is just an inner product between input variables and the weights, plus a bias"*——输入与权重做内积再加一个偏置。如果激活函数是线性的(也就是不做任何变换),那它算出来的就是 $\beta_0 + \beta_1x_1 + \dots$,与下面要讲的线性回归方程一模一样。线性回归可以看成最简单的神经网络。

---

# Part II · Linear Regression

## §2 线性回归模型:一条直线,加一点噪声

### 定义与用例

Slide 4 的定义:**Linear regression** is an analytical technique used to model the relationship between several input variables and a continuous outcome variable——用来建模若干输入变量与一个连续输出变量之间关系的分析技术。

它有一个**关键假设 (key assumption)**:这种关系是**线性的**。Slide 上还加了一个括号——*linear w.r.t. coefficients*(对系数线性)。这个括号很重要,但讲师刻意把解释推迟到了诊断部分;我们先按直观理解"输出与输入成线性关系",到 §9 再揭开它的真实含义。

Slide 5 列了三类典型用例,每一类都是"一个连续输出 + 一堆可能影响它的输入":

| 领域 | 输出 (outcome) | 输入 (input variables) |
|---|---|---|
| Real estate 房地产 | 房价 | 居住面积、卧室数量、学区排名、犯罪率…… |
| Demand forecasting 需求预测 | 顾客会消耗的食物量 | 天气、星期几、折扣…… |
| Medical 医疗 | 治疗效果 | 疗程长短、剂量、病人特征…… |

### 模型方程

Slide 6 写出了模型:

$$y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_{p-1} x_{p-1} + \varepsilon$$

逐个符号拆开:

- $y$ 是 **outcome variable(输出变量)**,必须是连续的。讲师:*"the output Y, it must be a continuous variable."*
- $x_j$($j = 1, 2, \dots, p-1$)是 **input variables(输入变量)**,也叫 feature 或 attribute。讲师特意说明输入*可以*是连续的,也*可以*是类别型的(类别型怎么放进方程,见 §8)。
- $\beta_0$ 是 **intercept(截距)**,讲师也叫它 bias 或 offset:*"the value of Y while all the X becomes zero."* 所有输入都为 0 时,$y$ 的值就是 $\beta_0$。
- $\beta_j$ 是 **coefficient(系数)**:*"the change in y based on a unit change in $x_j$"*——$x_j$ 增加 1 个单位,$y$ 平均变化 $\beta_j$。讲师补充了一个必须带上的条件:*"given that all the other attribute value keep as they were"*——**其他输入保持不变**。$\beta_j$ 可正可负,正号表示 $x_j$ 越大 $y$ 越大,负号相反。
- $\varepsilon$ 是 **random error term(随机误差项)**:*"represents the difference in the linear model and a particular observed value for y"*——线性模型的预测值与某一次实际观测值之间的差。

注意参数的下标:输入从 $x_1$ 到 $x_{p-1}$,共 $p-1$ 个,加上截距 $\beta_0$,模型一共有 **$p$ 个参数**。这个记号在后面读 R 输出里的"自由度"时会用到。

### 为什么要有 $\varepsilon$:非确定性

Slide 4 的第三条说线性回归是 **non-deterministic(非确定性)** 的:它 *accounts for the randomness in an outcome*(承认输出里有随机性),并且 *provides the expected value of the outcome*(给出输出的期望值)。

为什么要承认随机性?想象两套房子,面积、卧室数、学区、犯罪率全部一样,它们的成交价也不会分毫不差——买家的心情、谈判的技巧、成交那天的天气,无数个没被记录的因素都会让价格上下浮动。讲师的说法是观测值 *"could be contaminated by noise"*,被噪声污染了。

所以模型把 $y$ 拆成两部分:

$$\underbrace{y}_{\text{观测值}} = \underbrace{\beta_0 + \beta_1 x_1 + \dots + \beta_{p-1}x_{p-1}}_{\text{线性模型能解释的部分}} + \underbrace{\varepsilon}_{\text{解释不了的随机噪声}}$$

线性模型本身只负责前一半。它给出的不是"这套房子一定卖多少",而是"这类房子**平均**卖多少"——这就是 slide 说的 *expected value*(期望值)。讲师:*"Once we have randomness, we really need to talk about the expected value."* 这个想法到 §4 会被正式化。

```d2
direction: right
X: "输入 x₁ … x_{p-1}\n面积、卧室、学区……"
L: "线性部分\nβ₀ + Σ βⱼxⱼ"
E: "随机噪声 ε\n没记录的因素"
Y: "观测值 y\n实际成交价"
X -> L: "系数加权求和"
L -> Y: "期望值"
E -> Y: "上下扰动"
```

---

## §3 怎么求 β:Ordinary Least Squares

### 关键问题

方程写好了,可 $\beta_0, \beta_1, \dots, \beta_{p-1}$ 都是 **unknown(未知的)**。Slide 7 抛出的就是这个 **key question**:怎么得到它们的值?

讲师的说法:*"Given a training set... how do we estimate the beta0, beta1, ..., beta p minus 1? Once we know this beta value, we know the model. That's all."* 训练集里每一条数据既有输入 $x$,也有观测到的输出 $y$。一旦把 $\beta$ 定下来,模型就完全确定了。

### 目标:让预测尽量贴近观测

什么样的 $\beta$ 算"好"?Slide 8 给出了标准:估出来的参数应该让模型 *provide a reasonable estimate of the outcome variable*,也就是让以下两者之间的**总体误差最小**:

- 线性回归模型**预测出来的值**;
- 实际**收集到的观测值**。

讲师的推理很直接:*"Our purpose of linear regression is to predict. Certainly, we hope that our model can predict accurately."* 预测要准,就得让预测值与真实值的差距尽量小。

对第 $i$ 条训练数据,观测值与预测值之差叫 **residual(残差)**:

$$e_i = y_i - \hat{y}_i = y_i - \left(\beta_0 + \sum_{j=1}^{p-1} \beta_j x_{ij}\right)$$

这里 $\hat{y}_i$(读作 "y hat")表示模型对第 $i$ 条数据的预测值,$x_{ij}$ 是第 $i$ 条数据的第 $j$ 个输入。

### OLS 的目标函数

Slide 9 介绍了最常用的估计方法 **Ordinary Least Squares (OLS,普通最小二乘法)**:*find the line best approximating the relationship*——找一条最能逼近这种关系的直线。它的目标函数是:

$$\min_{\beta_0, \dots, \beta_{p-1}} \sum_{i=1}^{N} \left( y_i - \left(\beta_0 + \sum_{j=1}^{p-1} \beta_j x_{ij}\right) \right)^2$$

用文字读出来:**对 $N$ 条训练数据,把每条的残差平方后加起来,找让这个总和最小的那组 $\beta$。** 这个总和叫 **sum of squared errors (SSE,残差平方和)**。

为什么要平方?讲师的回答是:*"because it could be larger than $y_i$ or smaller than $y_i$"*——残差有正有负,直接相加会正负抵消。一条把一半点高估 10、另一半点低估 10 的直线,残差之和恰好是 0,看起来"完美",实际上处处都错。平方之后全部变正,不会再抵消。

> 📎 **拓展(超出 slides)** — 用绝对值 $|e_i|$ 也能避免抵消,为什么偏偏选平方?两个原因。第一,平方函数处处可导,对 $\beta$ 求导后令其为 0 就能解出闭式解(见下文);绝对值在 0 点不可导,求解麻烦得多。第二,平方对大误差惩罚更重(误差 10 的代价是误差 1 的 100 倍),这让 OLS 拼命避免大错——这也是 §10 说"linear regression is sensitive to outliers"的根源:一个离群点的残差平方会非常大,把整条直线拽过去。

### 一维的几何图像

Slide 9 配了一张只有一个输入的图:横轴是 $x$,纵轴是 $y$,圆点是训练数据,斜线是 OLS 模型。每个点到直线有一条竖直的线段,标着 "Distance of datapoint to model"。这时目标函数简化为:

$$\min_{\beta_0, \beta_1} \sum_{i=1}^{N} \left( y_i - (\beta_0 + \beta_1 x_i) \right)^2$$

讲师这样描述 OLS 在做的事:*"We want to adjust this straight line, its direction and its intercept, to ensure the sum of the squared distance to be smallest."* 想象手里拿着一根可以旋转、可以上下平移的直尺(斜率 $\beta_1$ 管旋转,截距 $\beta_0$ 管平移),在散点上来回调整,直到所有竖直线段的长度平方和最小——停下来的位置就是 OLS 直线。

注意这里量的是**竖直距离**,不是点到直线的垂直距离。因为我们的目的是预测 $y$,误差就是 $y$ 方向上的偏差。

> **🔑 例 · 手算一次 OLS** 📎 *(数据为自拟,slides 未给)*
>
> 五条训练数据:$x = (1, 2, 3, 4, 5)$,$y = (2, 4, 5, 4, 5)$。
>
> 一元线性回归有现成的闭式解(推导见下方拓展框):
> $$\hat\beta_1 = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sum_i (x_i - \bar{x})^2}, \qquad \hat\beta_0 = \bar{y} - \hat\beta_1 \bar{x}$$
>
> **第 1 步,算均值**:$\bar{x} = 15/5 = 3$,$\bar{y} = 20/5 = 4$。
>
> **第 2 步,列表**:
>
> | $x_i$ | $y_i$ | $x_i-\bar x$ | $y_i-\bar y$ | $(x_i-\bar x)(y_i-\bar y)$ | $(x_i-\bar x)^2$ |
> |---|---|---|---|---|---|
> | 1 | 2 | −2 | −2 | 4 | 4 |
> | 2 | 4 | −1 | 0 | 0 | 1 |
> | 3 | 5 | 0 | 1 | 0 | 0 |
> | 4 | 4 | 1 | 0 | 0 | 1 |
> | 5 | 5 | 2 | 1 | 2 | 4 |
> | **和** | | | | **6** | **10** |
>
> **第 3 步,代入**:$\hat\beta_1 = 6/10 = 0.6$,$\hat\beta_0 = 4 - 0.6 \times 3 = 2.2$。
>
> 拟合直线是 $\hat{y} = 2.2 + 0.6x$。五个预测值依次为 $2.8, 3.4, 4.0, 4.6, 5.2$,残差为 $-0.8, 0.6, 1.0, -0.6, -0.2$——有正有负,加起来恰好为 0(有截距的 OLS 总是如此),平方和 $\text{SSE} = 0.64+0.36+1+0.36+0.04 = 2.4$。任何其他直线的 SSE 都会大于 2.4。

> 📎 **拓展(超出 slides)· 闭式解从哪来** — 讲师提到 *"we can even write the closed form solution, analytical solution for this kind of problem"*,但没有展开。思路是:SSE 是 $\beta_0, \beta_1$ 的二次函数(一个开口向上的"碗"),碗底就是最小值,碗底处对两个参数的偏导数都为 0。
>
> 对 $\beta_0$ 求偏导并令其为 0:$-2\sum_i (y_i - \beta_0 - \beta_1 x_i) = 0$,整理得 $\beta_0 = \bar y - \beta_1 \bar x$。这说明 **OLS 直线一定穿过点 $(\bar x, \bar y)$**,也说明残差之和为 0。
>
> 对 $\beta_1$ 求偏导并令其为 0,再代入上式,就得到上面例子用的 $\hat\beta_1$ 公式。
>
> 多个输入时,把数据排成矩阵 $X$(每行一条数据,第一列全为 1 对应截距),同样的推导给出 **normal equations(正规方程)** 的解:
> $$\hat{\boldsymbol\beta} = (X^\top X)^{-1} X^\top \mathbf{y}$$
> 讲师也提到,特征很多时也可以用 **gradient descent(梯度下降)** 迭代求解。不过本课程不要求手推——R 的 `lm()` 和 Python 的 `sklearn` 都会替你算。记住这个矩阵公式还有一个用处:§8 和 §19 会看到,当 $X$ 的列之间线性相关时 $X^\top X$ 不可逆,OLS 就没有唯一解。

---

## §4 再加一条假设:正态误差模型

### OLS 没说 ε 是什么样子

回头看 §3,OLS 自始至终只是在"最小化平方误差",它对 $\varepsilon$ 长什么样**一个字也没说**。Slide 10 点明了这一点:**OLS makes no assumptions about the error term.**

讲师说这既是 OLS 的优点,也是它的短板:*"If we don't make any assumption about the error term, actually it prevents us to do more important statistical analysis."* 不对误差做任何假设,我们就只能拿到一组 $\beta$ 的**数值**,却没法回答下面这些问题:

- 这个 $\hat\beta_1 = 0.6$ 有多可靠?换一批数据还会是 0.6 吗?
- $\beta_1$ 会不会其实是 0,只是这批数据碰巧让它看起来不是 0?
- 预测值的误差范围有多大?

这些都是**统计推断**的问题。回忆 Week 3 的假设检验:做 t 检验之前,我们总要先假设数据服从正态分布、样本相互独立,然后才能算 t 值、查 p 值。讲师正是这样类比的:*"when we discuss the hypothesis test, I always say we assume that it is a normal distribution, we assume the independence... In order to do hypothesis test... we also need to make additional assumption."*

### 额外假设:误差服从正态分布

所以 Slide 10 说,常用的 **linear regression model** 在 OLS 的基础上 **makes additional assumptions(做了额外假设)**,这些假设 *provide further capabilities(提供了更多能力)*,而且 *are almost always made(几乎总是会做)*。

Slide 11 写出了这条额外假设。模型方程一个字都没变,只多了最后一行(slide 上用粗体标出):

$$y = \beta_0 + \beta_1 x_1 + \dots + \beta_{p-1}x_{p-1} + \varepsilon, \qquad \boldsymbol{\varepsilon \sim N(0, \sigma^2)}\text{,且各个 } \varepsilon \text{ 相互独立}$$

拆成三层意思:

1. **零均值**:$\varepsilon$ 的平均值是 0。噪声没有系统性偏向,不会总把 $y$ 往上推或往下拉。
2. **常数方差 $\sigma^2$**:无论 $x$ 取什么值,噪声的波动幅度都一样大。小房子和大豪宅的价格噪声幅度相同。
3. **相互独立**:讲师的解释是 *"for different training data, they are independent of each other. They are not related."* 这一条数据的噪声不影响另一条。

讲师特别澄清了"能力"的含义:*"Capability means we have more understanding about the certainty, uncertainty, reliability about our estimate."* 他还强调了一个容易混淆的点:*"Although the beta value is calculated in the way of OLS, but to analyze the uncertainty of this beta value, we always make this additional assumption."* **$\beta$ 的数值仍然用 OLS 算,正态假设只是让我们能进一步评估这些数值的可靠程度。**

> 📎 **拓展(超出 slides)** — 一个巧合值得知道:在 $\varepsilon \sim N(0,\sigma^2)$ 且独立的假设下,用 §14 会讲的最大似然估计 (MLE) 去估 $\beta$,得到的答案与 OLS **完全相同**。所以"OLS 算数值、正态假设做推断"这两件事在数学上是自洽的。

```d2
direction: right
OLS: "OLS 本身\n对 ε 不做假设\n只给出 β 的数值"
LRM: "Linear regression model\nOLS + ε ~ N(0, σ²)、相互独立" {style.bold: true}
SE: "β 的标准误\nStd. Error"
TP: "t 值、p 值\n系数是否显著"
CI: "R²、置信区间\n预测区间"
OLS -> LRM: "加一条假设"
LRM -> SE
LRM -> TP
LRM -> CI
```

### 换个角度看:每个 x 处都有一个小钟形曲线

有了这条假设,模型就可以从**概率**的角度重新解读。Slide 12 写道:对给定的 $x_1, x_2, \dots, x_{p-1}$,

$$y \sim N\!\left(\beta_0 + \beta_1 x_1 + \dots + \beta_{p-1}x_{p-1},\ \sigma^2\right)$$

也就是说,**$y$ 本身是一个随机变量**,它服从一个正态分布:均值是线性模型的值,方差是 $\sigma^2$。所以

$$E[y \mid x] = \beta_0 + \beta_1 x_1 + \dots + \beta_{p-1}x_{p-1}$$

这正是 slide 的结论:**the regression model estimates the expected value of $y$ for the given value of $x$, subject to a normally distributed error term**——回归模型估计的是给定 $x$ 时 $y$ 的期望值,再叠加一个正态误差。讲师的口语版本是:*"The observed Y equals the expected value plus a random noise."*

Slide 12 配的图非常形象:一条斜直线,在 $x = 2, 4, 6, 8, 10, 12$ 处各竖着画了一个"横躺"的钟形曲线,钟形的中心正好落在直线上。讲师:*"at each point, there's a small Gaussian distribution... I rotate it in this way."* 读这张图要抓住三点:

- **钟形的中心都在直线上** → 零均值:直线就是每个 $x$ 处 $y$ 的平均值;
- **每个钟形一样宽** → 常数方差:各处的噪声幅度相同;
- **实际观测点散落在钟形范围内** → 观测值 = 期望值 + 随机扰动。

到这里,§2 那句"线性模型给出期望值"就有了精确的含义。这三条性质也是 §9 诊断要逐一检查的对象——如果实际数据的"钟形"不在直线上、宽窄不一或者根本不是钟形,模型就出了问题。

---

## §5 实战:用 `lm()` 拟合一个收入模型

前面都是抽象的公式,现在看一个完整的例子。讲师对这一节的要求很明确:*"this page is important. I ask everyone to pay attention to understand this page."*

### 数据

Slide 13 读入了一个 `income.csv` 数据集,前 10 行如下:

```r
income_input = as.data.frame( read.csv("c:/data/income.csv") )
income_input[1:10,]

#    ID Income Age Education Gender
# 1   1    113  69        12      1
# 2   2     91  52        18      0
# 3   3    121  65        14      0
# 4   4     81  58        12      0
# 5   5     68  31        16      1
# 6   6     92  51        15      1
# 7   7     75  53        15      0
# 8   8     76  56        13      0
# 9   9     56  42        15      1
# 10 10     53  33        11      1
```

- **Income** 是 outcome(要预测的量,单位 slides 没写,从数值看应为千美元);
- **Age**(年龄)、**Education**(受教育年数)、**Gender**(性别,已编码为 0/1)是三个 input variables。

### 模型与代码

Slide 14 提出的模型是:

$$\text{Income} = \beta_0 + \beta_1\,\text{Age} + \beta_2\,\text{Education} + \beta_3\,\text{Gender} + \varepsilon$$

要估计的是 $\beta_0, \beta_1, \beta_2, \beta_3$ 四个参数,别忘了 $\varepsilon$ 服从正态分布(§4)。讲师说明本课程**不需要自己写求解代码**:*"In this subject, we always call the existing function either in R language or in Python."* R 里用 `lm()`(**l**inear **m**odel):

```r
results <- lm(Income ~ Age + Education + Gender, income_input)
summary(results)
```

公式里的波浪号 `~` 读作"由……建模":左边是 outcome,右边是 inputs,用 `+` 连接。讲师:*"you use the tilde means you are going to find a relationship between income and the three."* 第二个参数 `income_input` 是训练数据集。截距 $\beta_0$ 由 `lm()` 自动加上,不用写。

### 完整输出

Slide 15 是 `summary(results)` 的输出,也就是讲师反复强调的那一页:

```text
Call:
lm(formula = Income ~ Age + Education + Gender, data = income_input)

Residuals:
    Min      1Q  Median      3Q     Max
-37.340  -8.101   0.139   7.885  37.271

Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  7.26299    1.95575   3.714 0.000212 ***
Age          0.99520    0.02057  48.373  < 2e-16 ***
Education    1.75788    0.11581  15.179  < 2e-16 ***
Gender      -0.93433    0.62388  -1.498 0.134443
---
Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

Residual standard error: 12.07 on 1496 degrees of freedom
Multiple R-squared:  0.6364,    Adjusted R-squared:  0.6357
F-statistic:   873 on 3 and 1496 DF,  p-value: < 2.2e-16
```

讲师点名了三件必须掌握的事:*"First, you need to understand what is a residue. Second... what is the coefficient, what is each column, how they are calculated... particularly, you need to learn how to judge whether a beta value is statistically significantly different from 0. And also, you need to understand what is multiple R², why we need adjusted R²."* 他同时说明:*"you do not need to calculate them by yourself, but you need to know what each column means."*

整页输出分成七块,后文逐块讲:

| 输出块 | 内容 | 讲解位置 |
|---|---|---|
| Call | 复述调用的公式 | 本节 |
| Residuals | 残差的五数概括 | 本节 |
| Coefficients | 每个参数的 Estimate、Std. Error、t value、Pr(>\|t\|) | 本节、§6 |
| Signif. codes | 星号与 p 值区间的对照 | §6 |
| Residual standard error | 噪声标准差 $\sigma$ 的估计 | 本节 |
| Multiple / Adjusted R-squared | 模型解释了多少变异 | §7 |
| F-statistic | 所有系数是否同时为 0 的整体检验 | §7 拓展 |

### 第一块:Call

只是复述你调用的公式,确认 R 理解对了你的意思。讲师:*"First, it will acknowledge, yes, I understand that you just call that function."*

### 第二块:Residuals(残差)

残差就是 §3 定义的 $e_i = y_i - \hat y_i$,观测值减预测值。这一块给出 1500 个残差的**五数概括**:最小值 −37.34,下四分位数 −8.10,中位数 0.139,上四分位数 7.885,最大值 37.27。

怎么读?有两点。

- **中位数接近 0、上下四分位数大致对称**(−8.1 vs 7.9)——这与"残差零均值、对称"的正态假设一致,是个好迹象。
- **极值达到 ±37**——讲师的评论是 *"it seems it's not that accurate... the difference between the predicted and the true value could be as large as 37."* 对一个平均收入在 50–120 之间的数据来说,37 的误差不算小。模型抓住了大趋势,个体预测还相当粗糙。

### 第三块:Coefficients 表

这是整页的核心。每一行对应一个参数,四列含义如下:

| 列名 | 含义 | 本例 Age 那一行 |
|---|---|---|
| **Estimate** | 参数的估计值 $\hat\beta_j$,由 OLS 算出 | $\hat\beta_1 = 0.99520$ |
| **Std. Error** | 这个估计的**标准误**:换一批数据,估计值大约会波动多少 | 0.02057 |
| **t value** | $t = \dfrac{\text{Estimate} - 0}{\text{Std. Error}}$,检验 $\beta_j$ 是否为 0 的统计量 | $0.99520 / 0.02057 = 48.37$ |
| **Pr(>\|t\|)** | 对应的 **p-value**:若 $\beta_j$ 真为 0,得到这么极端的 t 值的概率 | $< 2\times10^{-16}$ |

**Estimate 列就是模型本身。** 讲师:*"If I give you this table, I give you some value, I ask you, can you calculate the income for me, then you know that you should take this value as beta value."* 拟合出的方程是:

$$\widehat{\text{Income}} = 7.263 + 0.9952\,\text{Age} + 1.7579\,\text{Education} - 0.9343\,\text{Gender}$$

> **🔑 例 · 用拟合好的模型做预测**
>
> 一个 40 岁、受教育 16 年、Gender = 1 的人,预测收入为
> $$7.26299 + 0.99520 \times 40 + 1.75788 \times 16 - 0.93433 \times 1 = 7.263 + 39.808 + 28.126 - 0.934 = \mathbf{74.26}$$
>
> 再拿数据集第 1 行验证残差的概念:Age = 69,Education = 12,Gender = 1,实际 Income = 113。预测值为 $7.263 + 68.669 + 21.095 - 0.934 = 96.09$,残差 $= 113 - 96.09 = 16.91$——这个人的实际收入比模型预测高了约 17。

**系数的解读**(回忆 §2 的"其他变量不变"):

- **Age:0.995** —— 在教育年数和性别相同的人当中,年龄每大 1 岁,预测收入平均高约 1.0;
- **Education:1.758** —— 在年龄和性别相同的人当中,多受 1 年教育,预测收入平均高约 1.76;
- **Gender:−0.934** —— 在年龄和教育相同时,Gender = 1 的人比 Gender = 0 的人预测收入低约 0.93。但 §6 会看到,这个数字**不显著**,不能当真;
- **Intercept:7.263** —— Age = 0、Education = 0、Gender = 0 时的预测收入。数学上需要它确定直线的位置,但"0 岁、没受过教育"的人不在数据范围内,这个值本身没有现实意义(这一点与 §19 的"不要外推"呼应)。

**Std. Error 从哪来?** 讲师用"反复抽样"的想法解释:*"Suppose you have 100 training data in your training set. Based on that training set, you get this beta value. So what if you collect another 100 training data, you will get another set of beta... So the estimated beta value is a random variable."* 我们手上只有一份样本,算出的 $\hat\beta$ 只是这个随机变量的一次取值。标准误衡量的就是它的波动幅度:标准误越小,估计越稳定。在 §4 的正态误差假设下,有公式可以只用这一份样本就算出标准误(讲师:*"we don't have time to look into this part, but we have formula"*)。

**t value 和 Pr(>|t|)** 用于判断系数是否显著,是 §6 的主题。

> ⚠️ **关于录音里的一个数字** — 讲师课上口算截距的 t 值时说"7.26 除以 1.95 得到 6.1",应为口误或转录错误。按 slide 上的数字,$7.26299 / 1.95575 = 3.714$,与输出中的 t value 一致。其余三行同样可以验算:$1.75788/0.11581 = 15.18$,$-0.93433/0.62388 = -1.498$。

### 第四块:Residual standard error

**Residual standard error = 12.07** 是对 §4 中噪声标准差 $\sigma$ 的估计:模型预测与实际观测之间的典型偏差约为 12。它后面的 **"on 1496 degrees of freedom"** 是自由度,等于样本数减去参数个数:$N - p = 1500 - 4 = 1496$。(反过来,我们也由此得知这个数据集有 1500 条记录。)

> 📎 **拓展(超出 slides)** — 公式是 $\hat\sigma = \sqrt{\text{SSE}/(N-p)}$。分母用 $N-p$ 而不是 $N$,是因为估计 $p$ 个参数"用掉"了 $p$ 个自由度;用 $N$ 会系统性地低估 $\sigma$。

最后两行 **Multiple / Adjusted R-squared** 和 **F-statistic** 放到 §7 讲。

---

## §6 系数显著吗:对 β 做假设检验

### 为什么要检验

Slide 16 说明了理由:

- 系数是 **estimated based on the given observed sample only**——只根据手上这一份样本估出来的;
- 所以估计值 **有不确定性 (uncertainty)**;
- **Std. Error** 可以用来做假设检验,判断 **each coefficient is statistically different from zero**(每个系数是否在统计上显著不为零)。

为什么关心"是不是 0"?讲师:*"0 means this variable is actually useless because its coefficient is 0."* 系数为 0 意味着这个输入对输出没有影响,放在模型里只会增加噪声。讲师强调我们不能把估计值直接当成真值:*"We can't simply regard the estimate value as just the same as the ground truth."* 比如 Gender 的估计值是 −0.934,不是 0,但它离 0 的这点距离,完全可能只是抽样波动造成的。

### 检验的步骤

这正是 Week 3 学过的 t 检验,套用到回归系数上:

**第 1 步,提出假设**(slide 16):

$$H_0: \beta_j = 0 \qquad \text{versus} \qquad H_A: \beta_j \neq 0$$

零假设 $H_0$ 说"这个变量没用",备择假设 $H_A$ 说"它有用"。

**第 2 步,算 t 统计量**:

$$t = \frac{\hat\beta_j - 0}{\text{SE}(\hat\beta_j)}$$

分子是"估计值离 0 有多远",分母是"估计值本身会波动多少"。t 的绝对值越大,说明估计值离 0 的距离远远超出了正常波动范围,越不像是碰巧。

**第 3 步,查 p-value**:在 $H_0$ 成立的前提下,t 服从自由度为 $N-p$ 的 Student's t 分布。由此算出**取到比当前 t 值更极端的值的概率**,就是 `Pr(>|t|)` 那一列。

**第 4 步,与显著性水平 $\alpha$ 比较**:通常取 $\alpha = 0.05$。

- $p < 0.05$ → **拒绝 $H_0$** → 系数显著不为 0 → 这个变量有用;
- $p \geq 0.05$ → **不能拒绝 $H_0$** → 没有足够证据说它不为 0 → 这个变量可以考虑剔除。

### 显著性星号

输出里每个 p 值后面的星号是一个速查标记,含义由 `Signif. codes` 那一行给出:

| 标记 | p 值范围 | 读法 |
|---|---|---|
| `***` | $p < 0.001$ | 极显著 |
| `**` | $0.001 \le p < 0.01$ | 很显著 |
| `*` | $0.01 \le p < 0.05$ | 显著(在 $\alpha=0.05$ 下) |
| `.` | $0.05 \le p < 0.1$ | 勉强,在 $\alpha=0.05$ 下不显著 |
| (空白) | $p \geq 0.1$ | 不显著 |

讲师的经验法则:*"if you use 0.05, that means at least you should see one star there."* 在 $\alpha = 0.05$ 下,**至少一颗星才算显著**。

> ⚠️ 录音里讲师把三颗星说成"between 0 and 0.01",与 `Signif. codes` 不符。考试按输出里的 `Signif. codes` 行为准:三颗星是 $p < 0.001$。

### 应用到收入模型

| 参数 | Estimate | Std. Error | t value | p-value | 星号 | 结论($\alpha = 0.05$) |
|---|---|---|---|---|---|---|
| Intercept | 7.263 | 1.956 | 3.714 | 0.000212 | `***` | 显著 |
| Age | 0.995 | 0.021 | 48.373 | $< 2\times10^{-16}$ | `***` | 显著 |
| Education | 1.758 | 0.116 | 15.179 | $< 2\times10^{-16}$ | `***` | 显著 |
| **Gender** | **−0.934** | **0.624** | **−1.498** | **0.134** | (无) | **不显著** |

讲师在课上问:*"Which attribute whose coefficient... we cannot say its coefficient is significantly different from zero? Which one?"* 答案是 **Gender**:*"because this value is very large, 0.13, it is greater than 0.05."* 它的 t 值只有 −1.5,也就是估计值离 0 只有 1.5 个标准误——这点距离完全在随机波动范围内。

对比 Age:t = 48.4,估计值离 0 有 48 个标准误,几乎不可能是巧合。

### 不显著之后怎么办

Slide 17:**if a coefficient is NOT statistically different from zero, the coefficient and the associated variable in the model could be excluded**——这个系数和对应的变量可以从模型中剔除。

讲师补充了一个容易被忽略的操作要点:剔除之后**必须重新拟合**。*"Once you remove gender, you need to recall this linear model function just based on income, age, and education to regenerate this model, rather than say, oh I remove this one... I still just use this."* 不能直接把 Gender 那一项从原方程里划掉、保留其他系数不变——去掉一个变量后,其他系数的估计值也会变化,必须重新调用 `lm(Income ~ Age + Education, income_input)`。

注意 slide 用的是 **could** be excluded,不是 must。下一条说明了原因:**Better is to combine statistical evidence (p-values) with domain knowledge**——统计证据要与领域知识结合。讲师:*"because we are dealing with a big data analytic problem, remember, we should always combine the result we obtained from data with our domain knowledge."* 比如一项研究的核心问题恰恰是"是否存在性别收入差距",那么即使 Gender 不显著,也应该保留在模型里并报告"未发现显著差异"——这本身就是一个有价值的结论。

```d2
direction: down
E: "拟合模型,得到 β̂ⱼ 与 SE"
T: "t = β̂ⱼ / SE → 查 p-value"
D: "p < 0.05 ?" {shape: diamond}
K: "保留:系数显著不为 0"
DK: "领域知识认为\n仍有必要保留?" {shape: diamond}
RM: "剔除该变量"
RF: "重新调用 lm()\n不能只划掉一项"
E -> T -> D
D -> K: "是"
D -> DK: "否"
DK -> K: "是"
DK -> RM: "否"
RM -> RF
RF -> E: "检查新模型"
```

### "在其他变量都在的条件下"

Slide 16 和 17 各有一句红色批注,点出了一个精妙的地方:

- *Each coefficient's significance is tested **conditional on all other predictors being included**.*(每个系数的显著性,都是在其他所有预测变量都在模型里的条件下检验的。)
- *Does this predictor contribute **unique explanatory power, above and beyond** what the other predictors already explain?*(在其他预测变量已经解释掉的部分之外,这个变量还能贡献**独有的**解释力吗?)

这意味着 Gender 不显著的准确含义是:**在已经知道一个人的年龄和受教育年数之后,再知道他的性别,不能显著改善收入预测。** 它*不*等于"性别与收入毫无关系"。如果性别与教育年数高度相关(比如某个群体受教育普遍更长),那么性别对收入的影响可能已经通过 Education 体现出来了,Gender 单独就显得多余。换一组其他变量,同一个变量的显著性可能完全不同。

> 📎 **拓展(超出 slides)** — 两个常见误读:(1)**p > 0.05 不等于证明了 $\beta_j = 0$**,只是"证据不足以拒绝 $\beta_j = 0$";样本更大时,一个小的真实效应也可能变得显著。(2)**系数大不等于影响大**:$\beta$ 的大小取决于变量的单位。把 Age 的单位从"岁"换成"月",系数会缩小 12 倍,但影响一点没变。本例 Age 与 Education 单位都是"年",才可以直接比较:多一年教育(+1.76)比多一岁(+1.00)对收入的边际作用更大。

### 系数告诉我们什么

Slide 17 的第一条把这一节收了回来:**coefficients provide information on how influential an attribute is on the outcome**——系数告诉我们一个属性对输出的影响有多大。讲师的总结是:*"The coefficient just indicate how important an attribute is, its relationship with the output value is positive or negative."* 读系数要看三样东西:**符号**(正向还是负向关系)、**大小**(边际效应多强,注意单位)、**显著性**(这个效应是否可信)。

---

## §7 R² 与 Adjusted R²:模型解释了多少

### Multiple R²

讲师对 Multiple R² 的解释:*"It tells us how many percentage of the total variation in income has been explained by the 3 input variables."* 本例 $R^2 = 0.6364$:**收入的总变异中,有 63.64% 能被 Age、Education、Gender 这三个变量解释**,剩下 36% 归于模型之外的因素(也就是 $\varepsilon$)。讲师:*"the larger the value, the better your model is."*

> 📎 **拓展(超出 slides)· R² 的公式** — "总变异"指 $y$ 围绕其均值的波动,用 **total sum of squares** $\text{SST} = \sum_i (y_i - \bar y)^2$ 衡量;模型没能解释的部分是残差平方和 $\text{SSE} = \sum_i (y_i - \hat y_i)^2$。于是
> $$R^2 = 1 - \frac{\text{SSE}}{\text{SST}}$$
> 它在 0 到 1 之间。$R^2 = 0$ 说明模型不比"永远预测平均值"强;$R^2 = 1$ 说明所有点恰好落在拟合线上。
>
> 用 §3 的手算例子:$\text{SSE} = 2.4$,$\text{SST} = (−2)^2+0^2+1^2+0^2+1^2 = 6$,所以 $R^2 = 1 - 2.4/6 = 0.6$——$x$ 解释了 $y$ 60% 的变异。

### R² 的漏洞:加变量它只升不降

问题在于,**只要往模型里加变量,R² 就不会下降**,哪怕加的是完全无关的变量。讲师:*"By simply increasing the number of input variables, even you introduce irrelevant variables, you can actually increase the multiple R². This causes problem — the potential overfitting problem."*

为什么?因为 OLS 总可以把新变量的系数设为 0,退回原来的模型;所以加了新变量之后 SSE 只会持平或下降,R² 只会持平或上升。一个随机生成的噪声列,也会碰巧和 $y$ 有一点点相关,OLS 就会利用这点巧合把 SSE 压低一点点。

这与上周讲的 **overfitting** 是同一回事:讲师把它联系起来——*"Overfitting means if you keep adding features, you may keep reducing the training error, but actually the generalization capability could decrease."* 只看 R² 选模型,会诱导你不停地加变量。

### Adjusted R²:给变量个数加惩罚

**Adjusted R²** 修正了这个漏洞。讲师:*"When we calculate the R², we also consider the number of input variables you use... can you use a small number of input features as possible to explain the total variance of the output."* 它同时考虑两样东西:模型解释了多少变异,以及模型有多复杂。

> 📎 **拓展(超出 slides)· Adjusted R² 的公式与验算** — 设样本数为 $N$,输入变量个数为 $k$(即 $p-1$):
> $$R^2_{\text{adj}} = 1 - (1 - R^2)\,\frac{N-1}{N-k-1}$$
> 分式 $\frac{N-1}{N-k-1}$ 总是大于 1,而且 $k$ 越大它越大——这就是对变量个数的惩罚。
>
> 验算本例:$N = 1500$,$k = 3$,
> $$R^2_{\text{adj}} = 1 - (1 - 0.6364) \times \frac{1499}{1496} = 1 - 0.3636 \times 1.002 = 0.6357 \checkmark$$
> 与输出完全一致。这里样本量很大,惩罚很轻,所以两个 R² 几乎相等;样本少、变量多时,两者差距会明显拉开。

加入一个新变量时,R² 一定会升一点,惩罚也一定会加重一点。**如果新变量带来的解释力不足以抵消惩罚,Adjusted R² 就会下降。** 这正是 slide 24 那条警告的意思(slide 上 "Adjusted" 一词是手写插进去的):*Be careful when adding more variables — the Adjusted R² value may decrease because of the increased input dimension.*

讲师的结论:*"When we judge whether our model is good or bad enough, we need to look at the adjusted R², not only fully depend on the multiple R²."*

| | Multiple R² | Adjusted R² |
|---|---|---|
| 衡量什么 | 模型解释了总变异的多大比例 | 同上,但扣除了模型复杂度的代价 |
| 加一个无关变量 | 不降,通常微升 | 通常下降 |
| 适合用来 | 描述一个模型的拟合程度 | **比较变量个数不同的模型** |
| 本例 | 0.6364 | 0.6357 |

> 📎 **拓展(超出 slides)· F-statistic** — 输出最后一行 `F-statistic: 873 on 3 and 1496 DF, p-value: < 2.2e-16` 讲师没有讲。它检验的是**整体**:$H_0$:除截距外所有系数**同时**为 0(即模型完全没用)。p 值极小,说明三个变量合起来确实能解释收入。§6 的 t 检验一次只看一个系数,F 检验一次看全部。可以验算 $F = \frac{R^2/k}{(1-R^2)/(N-k-1)} = \frac{0.6364/3}{0.3636/1496} \approx 873$ ✓。

---

## §8 类别变量:m 个取值,用 m−1 个 binary 变量

### 问题

到目前为止,输入都是数:年龄、受教育年数。可现实数据里大量变量是**类别型 (categorical)** 的。Slide 18 举了 gender、ZIP codes(邮编)、nationality(国籍),讲师又加了星期几、月份。它们的取值是标签,不是数量,线性方程却只能处理数。怎么把它们放进 $\beta_j x_j$?

### 错误做法:按字母顺序编号

Slide 18 明确指出:**An incorrect approach is to assign a number to each of them based on an alphabetical ordering**——按字母顺序给每个类别分配一个数字,是错误的。

比如国籍按字母排序编号:Australia = 1,China = 2,India = 3。模型里只有一项 $\beta \cdot \text{Nationality}$,于是它会认为:

- 国籍之间存在**顺序**:India > China > Australia;
- 而且**间距相等**:India 与 China 的差异,恰好等于 China 与 Australia 的差异;
- 所有国籍对 $y$ 的影响,必须落在**同一条直线**上。

这些都是编号凭空制造出来的。讲师:*"If you put 1, 2, 3, 4, 5 to represent the category variable, you introduce something unnecessary — its ordering."* 换一种编号方式,模型的结论就会变,这显然荒谬。

### 正确做法:m − 1 个 binary 变量

Slide 18:**For a categorical variable that can take $m$ different values, we shall add $m-1$ binary variables to the regression model.**

讲师用颜色举例:一个颜色变量有 Red、Green、Blue 三个取值($m = 3$),就加 $3 - 1 = 2$ 个 0/1 变量。选一个类别当**基准 (baseline)**,比如 Red,它不需要自己的变量:

| 颜色 | $x_{\text{Green}}$ | $x_{\text{Blue}}$ |
|---|---|---|
| Red(基准) | 0 | 0 |
| Green | 1 | 0 |
| Blue | 0 | 1 |

模型变为 $y = \beta_0 + \beta_G x_{\text{Green}} + \beta_B x_{\text{Blue}} + \dots$,于是:

- Red 的预测值:$\beta_0 + \dots$
- Green 的预测值:$\beta_0 + \beta_G + \dots$
- Blue 的预测值:$\beta_0 + \beta_B + \dots$

所以 **$\beta_G$ 的含义是"Green 相对于基准 Red 的差异"**,$\beta_B$ 同理。三个类别各自拥有独立的效应,不再有虚构的顺序和间距。这种 0/1 变量通常叫 **dummy variable(哑变量)**。这种编码相当于 **one-hot encoding** 去掉基准类别那一列。

收入模型里的 **Gender** 正是这样处理的:两个取值,$m - 1 = 1$ 个 0/1 变量。Gender 的系数 −0.934 就是"Gender = 1 相对于 Gender = 0"的差异。

### 为什么是 m − 1,不是 m

讲师专门解释了这个问题。如果模型**有截距** $\beta_0$,却给 RGB 加了全部 3 个 dummy:

| 颜色 | 截距列 | $x_R$ | $x_G$ | $x_B$ | $x_R + x_G + x_B$ |
|---|---|---|---|---|---|
| Red | 1 | 1 | 0 | 0 | **1** |
| Green | 1 | 0 | 1 | 0 | **1** |
| Blue | 1 | 0 | 0 | 1 | **1** |

每一行恰好有一个 1,所以三个 dummy 列加起来**永远等于 1**——与截距那一列一模一样。讲师:*"Each time there's one and only one 1... And also in a matrix form, the column corresponding to the intercept will also be one... This causes the collinearity between the intercept column and the sum of the coefficient... you will find actually that there are infinite number of solutions."*

为什么会有无穷多个解?假设 $(\beta_0, \beta_R, \beta_G, \beta_B)$ 是一组解。把截距加上任意常数 $c$,三个 dummy 系数都减去 $c$,得到 $(\beta_0 + c,\ \beta_R - c,\ \beta_G - c,\ \beta_B - c)$。对任何一行,预测值变化了 $+c - c = 0$,完全不变。$c$ 可以取任何值,所以 OLS 找不到唯一的最优解——用 §3 拓展框的话说,$X^\top X$ 不可逆。

> 📎 **拓展(超出 slides)** — 这个陷阱有个专门的名字:**dummy variable trap(哑变量陷阱)**。它是 §19 **multicollinearity(多重共线性)** 的一个极端特例:某几列之间存在**精确的**线性关系。

讲师也给了反面情况:*"if you say I don't want to use the intercept, I don't have beta zero, then you can use $m$ binary variables."* 没有截距列,就不存在"加起来等于截距列"的冲突,$m$ 个 dummy 可以全用,每个系数直接表示该类别自己的水平。

**一句话记住**:有截距用 $m-1$ 个,无截距可用 $m$ 个。实践中模型几乎总带截距,所以默认是 $m-1$。

> 📎 **拓展(超出 slides)** — 在 R 里,只要把类别变量存成 `factor` 类型,`lm()` 会自动生成 $m-1$ 个 dummy,并把字母序第一个水平当作基准。Python 的 `pandas.get_dummies(..., drop_first=True)` 做同样的事。

---

## §9 模型诊断:假设真的成立吗

### 为什么要诊断

到这里我们已经能拟合模型、读输出、检验系数了。但 §6 的 t 值、p 值和 §7 的 R² 都建立在 §4 的那组假设之上。讲师:*"All the hypothesis tests is based on this assumption. So that means after we obtain our model, we need to go back to check whether this assumption is well satisfied. If not, we need to go back to modify our model."*

Slide 19:linear regression models **depend on assumptions**,所以我们必须 **validate a fitted regression model(验证拟合好的模型)**,具体分三项:

1. **Evaluate the linearity assumption** —— 线性假设
2. **Evaluate the residuals** —— 残差(零均值、常数方差)
3. **Evaluate the normality assumption** —— 正态性

```d2
direction: down
FIT: "拟合模型 lm()"
C1: "① 线性?\noutcome vs 每个 input"
C2: "② 残差零均值、常数方差?\nresiduals vs fitted"
C3: "③ 正态?\n直方图 / Q-Q plot"
OK: "通过:推断可信" {shape: oval}
FIX: "修正模型\n变换变量 / 加新变量"
FIT -> C1 -> C2 -> C3 -> OK
C1 -> FIX: "否"
C2 -> FIX: "否"
C3 -> FIX: "否"
FIX -> FIT: "重新拟合"
```

### 9.1 线性假设

**怎么查**:Slide 20——**plot the outcome variable against each input variable**,把输出对每个输入分别画散点图。

Slide 20 配的图是 Income 对 Age 的散点图,呈现一个**倒 U 形**:20 岁到 45 岁左右收入随年龄上升,之后随年龄下降。讲师:*"You find that actually the age and income is not linear."* 这在现实中说得通:职业生涯前半段收入增长,临近退休开始回落。用一条直线去拟合一道拱形,怎么摆都不对。

**怎么修**:Slide 20 给了两条路——

- **Transform the outcome or input variables**:变换输出或输入,比如取对数、开平方;
- **Add extra input variables**:加入新的输入变量,比如 **age squared**($\text{Age}^2$)。

倒 U 形正是二次函数的形状。讲师:*"since we have seen the second-order relationship, maybe you need to use age square."* 新模型是:

$$\text{Income} = \beta_0 + \beta_1\,\text{Age} + \beta_2\,\text{Education} + \beta_3\,\text{Gender} + \beta_4\,\text{Age}^2 + \varepsilon$$

$\beta_4$ 估出来会是负数,让曲线在高龄段弯下来。

### "线性"到底指什么

现在可以揭开 §2 留下的那个括号了。新模型里有 $\text{Age}^2$,Income 与 Age 显然**不是**线性关系。那它还算线性回归吗?

**算。** 讲师正是用这个例子说明的:*"Clearly, the relationship between the input variable and the Y is not linear. We have to add new features. But why we can still use linear regression? ... the linear regression is essentially between the output Y and these betas. Mathematically, the linear means the linear relationship between output Y and beta 1, beta 2, beta 3, beta 4."*

Slide 4 底部的注释说得最准确:**The "linear" in linear regression refers to the linear relationship between the output and a set of features, which may be raw input variables or transformations of them.** "线性"指的是 $y$ 与**参数 $\beta$** 之间是线性的——$y$ 是若干特征的加权和,权重就是 $\beta$。至于这些特征是原始变量 Age,还是变换后的 $\text{Age}^2$、$\log(\text{Age})$,都无所谓。从 OLS 的角度看,$\text{Age}^2$ 不过是数据表里新加的一列数,求解方法完全不变。

判断方法:**把每个 $\beta$ 都看成未知数,方程是不是这些未知数的一次式?**

| 模型 | 对 $\beta$ 线性? | 说明 |
|---|---|---|
| $y = \beta_0 + \beta_1 x + \beta_2 x^2 + \varepsilon$ | ✅ | $x^2$ 只是一个新特征 |
| $y = \beta_0 + \beta_1 \log x + \varepsilon$ | ✅ | 变换输入 |
| $\log y = \beta_0 + \beta_1 x + \varepsilon$ | ✅ | 变换输出 |
| $y = \beta_0 + \beta_1 x_1 + \beta_2 x_1 x_2 + \varepsilon$ | ✅ | 交叉项也只是新特征 |
| $y = \beta_0 + e^{\beta_1 x} + \varepsilon$ | ❌ | $\beta_1$ 在指数上 |
| $y = \beta_0 + x^{\beta_1} + \varepsilon$ | ❌ | $\beta_1$ 是幂次 |
| $y = \dfrac{\beta_0}{1 + \beta_1 x} + \varepsilon$ | ❌ | $\beta_1$ 在分母里 |

这个认识让线性回归的适用面大大扩展:**只要能通过变换把关系"拉直",就能用线性回归。** §20 会回到这一点。

### 9.2 残差:零均值与常数方差

**残差**的定义在 slide 21 再次给出:**Residual = Observed − Predicted**。

为什么查残差?§4 假设 $\varepsilon \sim N(0, \sigma^2)$ 且相互独立,而残差就是我们对 $\varepsilon$ 的观测。Slide 21:**If this assumption is violated, the various inferences are suspect**——假设一旦被违背,各种推断(标准误、t 值、p 值)都不可信了。

**怎么查**:画 **residuals vs fitted values** 图——横轴是预测值 $\hat y$,纵轴是残差。

**好的残差图**(slide 21):点在 0 这条水平线上下均匀散开,形成一条**宽度不变的水平带**,看不出任何规律。讲师:*"whether the mean of the residue corresponding to different y value is roughly zero — yeah it is. And also whether the fluctuation of the residue is symmetrical with respect to the zero mean, and also it's constant."* 对应的结论写在图下:**Residuals have zero mean and a constant variance.**

这与 §4 的钟形曲线图是同一件事的两面:钟形中心都在直线上 → 残差围绕 0;钟形宽度相同 → 残差带宽度不变。

**有问题的残差图**(slide 22,"How about these residual plots?")给了四种反例。讲师的结论是:*"For any one of them, we have to say no. The assumption is violated. We need to go back to redesign our model."*

| 图(slide 22 位置) | 看到的形状 | 违背了什么 | 可能的修正 |
|---|---|---|---|
| 左上 | **拱形**:两端残差为负、中间为正 | 零均值(残差随 $\hat y$ 系统变化) | 漏了非线性项 → 加 $\text{Age}^2$ 等(slide 红字:*Transform, additional input variable*) |
| 右上 | 宽度大致不变,但整条带**偏离 0** | 零均值 | 检查模型设定(如是否遗漏截距) |
| 左下 | **斜向上的带**:残差随 $\hat y$ 增大而增大 | 零均值 | 遗漏了重要变量,或需要变换 |
| 右下 | **喇叭形**:$\hat y$ 越大,残差越分散 | 常数方差 | 变换输出,如 $\log y$ |

讲师对右下那张的描述是 *"the variance will gradually increase when the Y value increase."* 喇叭形在实际数据里很常见:预测收入 3 万的人,误差也就几千;预测收入 300 万的人,误差可能是几十万。

> 📎 **拓展(超出 slides)** — 方差不恒定有个专门的名字:**heteroscedasticity(异方差)**;方差恒定叫 **homoscedasticity(同方差)**。对右偏、数值跨度大的输出(收入、房价),取对数 $\log y$ 往往能同时缓解异方差和非正态。另外,对带截距的 OLS 模型,训练残差的总平均必定为 0(§3 拓展框),所以右上那种整体偏移的图,通常出现在模型没有截距、或在新数据上计算残差的时候。

### 9.3 正态性

**最后一项**:残差是否服从正态分布?Slide 23 给了两个选项。

**Option 1:直方图**。把残差画成直方图,看它是不是**以 0 为中心、左右对称的钟形**。Slide 23 的直方图正是如此。讲师:*"You can see whether these are symmetrical with respect to the mean zero and it's bell-shaped."*

**Option 2:Q-Q plot**。R 代码:

```r
qqnorm(results2$residuals, ylab="Residuals", main="")
qqline(results2$residuals)
```

(`results2` 是另一个已拟合的模型对象,slides 没有交代它的来源,从上下文看很可能是加入 $\text{Age}^2$ 之后的模型。)

`qqnorm` 画出残差的 Q-Q 图,`qqline` 加一条参考直线。读法:

- **点几乎都落在直线上** → 残差服从正态分布(slide 23 右上图,标 *Normality distributed*);
- **点明显偏离直线**,比如两端弯曲成 S 形 → 不服从正态分布(右下图,标 *Non-normality distributed*)。

讲师倾向于第二种:*"I think this way is more straightforward. Just use qqnorm and qqline function."* 直方图的形状受分箱宽度影响,判断偏差全凭肉眼;Q-Q 图只需看"是不是一条直线",更容易下结论。

> 📎 **拓展(超出 slides)· Q-Q plot 在画什么** — Q-Q 是 quantile–quantile 的缩写。做法是:把 $N$ 个残差从小到大排序;再算出"如果数据来自标准正态分布,第 1 小、第 2 小……第 $N$ 小的值理论上应该是多少"(theoretical quantiles,即横轴)。以理论值为横坐标、实际残差为纵坐标作图。如果残差真的服从正态分布,实际值与理论值成正比,点就排成一条直线。两端翘起说明尾部比正态分布更"厚"(极端值更多),一端弯曲说明分布偏斜。

---

## §10 其他注意事项

Slide 24 列出了几条零散但实用的建议。

**1. 尽早考虑所有可能的输入变量**(*Consider all possible input variables early in the analytic process*)。讲师把它放回了 Week 2 的生命周期:*"In the big data analytic life cycle, we need to consider all possible input variables early. Don't simply remove the input variable. Check the relationship between the input variable and the output variable."* 在 discovery 和 model planning 阶段就把候选变量列全,逐个看它们与输出的关系,而不是建完模型才想起漏了什么。

**2. 加变量要谨慎**(*Be careful when adding more variables*)。这与第 1 条并不矛盾:*考虑*要全,*放进模型*要挑。理由就是 §7 的 Adjusted R²——无用的变量会让它下降,也会引发 overfitting。

**3. 线性回归对离群点敏感**(*Linear regression is sensitive to outliers*)。**Outlier(离群点)** 是指 *observed points that are markedly different from the majority of the points*——与大多数点明显不同的观测。原因在 §3 的拓展框里已经说过:OLS 最小化的是**平方**误差,一个偏离 50 的点贡献 2500,足以把整条直线拽向它。Slide 要求 **examine any outliers**——先用可视化(散点图、残差图)找出来,再判断。讲师说找到后 *"you need to remove it"*;更稳妥的做法是先查原因:如果是录入错误或者不属于研究对象(比如收入数据里混进了一个亿万富翁),可以删除;如果是真实且有代表性的数据,删掉它反而会让模型脱离现实。

**4. 检查系数的大小和符号是否合理**(*Examine if the magnitudes and signs of the estimated parameters make sense*)。讲师:*"Incorporate the domain knowledge to examine whether the magnitude and the sign of the beta value makes sense. If you see the beta value is negative, it indicates the relationship between Y and this input variable is negative... whether this is consistent with your domain knowledge you have collected in the stage one of life cycle."* 比如收入模型里 Education 的系数如果是负的——受教育越多收入越低——就与常识相悖,很可能是数据或模型出了问题(变量编码错误、遗漏了关键变量、存在多重共线性等),而不是发现了什么惊人的规律。

到这里,线性回归的完整工作流就齐了:

```d2
direction: down
P: "① 列全候选变量 · §10"
C: "② 类别变量编码:m−1 个 dummy · §8"
F: "③ lm() 拟合(OLS)· §3"
S: "④ 读 summary:系数检验 §6、Adjusted R² §7"
D: "⑤ 诊断:线性 / 残差 / 正态 · §9"
SN: "⑥ 常识检查:符号、大小、离群点 · §10"
U: "使用模型:预测 / 解释" {shape: oval}
P -> C -> F -> S -> D -> SN -> U
S -> F: "剔除不显著变量"
D -> F: "不通过:变换或加变量"
```

---

# Part III · Logistic Regression

## §11 当输出是类别:为什么需要 logistic regression

### 从连续值到概率

Slide 25 的开头很简单:**In linear regression, the outcome variable is a continuous variable. When the outcome variable is categorical in nature, logistic regression can be used — to predict the probability of an outcome based on the input variables.**

线性回归输出一个连续值;**logistic regression(逻辑回归)** 输出一个**概率**——讲师:*"probability of positive, probability of negative, probability of subscribed, probability of not subscribed."* 有了概率,再按一个阈值转成类别标签,就完成了分类。

讲师把它和上周的 naïve Bayes 放在一起看:*"It's very similar to naive Bayes classifier. Naive Bayes classifier also predicts the probability corresponding to the class labels."* 两者都是**概率型分类器**,先给出每个类别的概率,再做决定。区别在于概率怎么算:naïve Bayes 用 Bayes' theorem 加条件独立假设,logistic regression 用一个线性函数加一层变换。

> 📎 **拓展(超出 slides)· 为什么不直接拿线性回归预测 0/1?** — 一个自然的想法是:把"流失"编码为 1、"未流失"编码为 0,直接跑线性回归,把输出当概率。问题在于直线是无界的:对一个很年轻、身边很多人已流失的客户,直线可能预测出 1.3;对一个年长、身边没人流失的客户,可能预测出 −0.4。概率不可能大于 1 或小于 0。另外,$y$ 只取 0 和 1,残差也不可能服从 §4 要求的正态分布。我们需要一个**输出永远落在 0 和 1 之间**的模型——这就是下一节 logistic function 的用处。

### 用例

Slide 26 列了四个领域,每一个的输出都是"某事件发生的概率":

| 领域 | 要预测的概率 |
|---|---|
| Medical 医疗 | 病人对某种治疗产生反应的概率 |
| Finance 金融 | 贷款申请人违约 (default) 的概率 |
| Marketing 营销 | 客户转投其他运营商 (**churning**,流失) 的概率 |
| Engineering 工程 | 某个机械零件失效的概率 |

### 名字的由来

为什么一个分类方法叫"回归"?讲师:*"Because it is a combination of logistic function and the linear regression. That's why it's called logistic regression. It just combined the two names."* 它确实包含一个线性回归,只是外面套了一层 logistic function。接下来两节分别拆开这两部分。

---

## §12 Logistic function:把任意实数压进 (0, 1)

Slide 27 给出了 **logistic function**:

$$f(y) = \frac{e^y}{1 + e^y}, \qquad -\infty < y < \infty$$

它的作用,讲师说得很透:*"The logistic function can map any number between minus infinity and positive infinity to a value between 0 and 1. You may ask why we need this? Remember, logistic regression is to predict probability... Probability is a value between 0 and 1. And also logistic regression uses linear regression. The output of linear regression is a continuous value [that] can stay anywhere between minus infinity and positive infinity. So, to bridge the output of linear regression and a probability, we need the logistic function."*

一句话:**线性回归的输出范围是 $(-\infty, \infty)$,概率的范围是 $(0, 1)$,logistic function 是连接两者的桥。**

代几个值进去,就能看出它的形状:

| $y$ | $-\infty$ | $-4$ | $-2$ | $-1$ | $0$ | $1$ | $2$ | $4$ | $+\infty$ |
|---|---|---|---|---|---|---|---|---|---|
| $f(y)$ | → 0 | 0.018 | 0.119 | 0.269 | **0.5** | 0.731 | 0.881 | 0.982 | → 1 |

Slide 27 的图就是这条曲线:一条 **S 形曲线**,左端贴近 0,右端贴近 1,中间在 $y = 0$ 处恰好穿过 0.5。从表里可以读出它的四个性质:

- **有界**:无论 $y$ 多大多小,$f(y)$ 永远在 0 和 1 之间,永远是合法的概率;
- **单调递增**:$y$ 越大,概率越高;
- **中间陡、两端平**:$y$ 从 −1 走到 1,概率从 0.27 跳到 0.73;$y$ 从 2 走到 4,概率只从 0.88 挪到 0.98。已经很确定的情况下,再多的证据也只能让概率小幅上升。
- **对称**:$f(-y) = 1 - f(y)$,比如 $f(-2) = 0.119 = 1 - 0.881$。

> 📎 **拓展(超出 slides)** — 分子分母同除以 $e^y$,得到等价形式 $f(y) = \dfrac{1}{1 + e^{-y}}$。这就是神经网络里常见的 **sigmoid** 函数。回想 §1:单层感知机配线性激活函数等于线性回归;把激活函数换成 sigmoid,它就变成了 logistic regression。

---

## §13 两层结构:线性回归,外面套一层 logistic

### 第一层:一个看不见的线性回归

Slide 28:**In logistic regression, $y$ is expressed as a linear function of the input variables**——

$$y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_{p-1} x_{p-1}$$

与线性回归的方程一模一样(这里不写 $\varepsilon$,因为随机性在下一层体现)。但 slide 用蓝字加了一句关键的话:**but $y$ is not observed! Only $f(y)$ is observed!**

这句话怎么理解?讲师解释:*"In logistic regression, your training data — the input variables same. But the output... is a class label. We are dealing with classification... In linear regression, the Y is really the output variable, but in logistic regression we don't have Y, we just have class label. So that's why we say Y is not observed."*

在收入例子里,训练数据的每一行都写着实际收入 $y$;而在流失例子里,每一行只写着"流失了 / 没流失",**没有任何一列叫 $y$**。$y$ 是模型内部的一个中间量,我们看到的只有它经过变换、再"掷一次骰子"之后的结果:类别标签。

> 📎 **拓展(超出 slides)** — 更精确地说,我们观测到的也不是 $f(y)$ 这个概率本身(训练数据里没有一列写着"流失概率 0.73"),而是按这个概率随机产生的 0/1 结果。Slide 的意思是:与线性回归不同,$y$ 不再是数据里现成的一列。

### 第二层:把 y 变成概率

Slide 28 接着写出事件 $C$(比如"流失")发生的概率:

$$P(C \mid x_1, x_2, \dots, x_{p-1}) = f(y) = \frac{e^y}{1+e^y}$$

把第一层的 $y$ 代进去,就是 logistic regression 的完整形式:

$$P = \frac{e^{\beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_{p-1}x_{p-1}}}{1 + e^{\beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_{p-1}x_{p-1}}}$$

讲师劝大家别被这个式子吓到:*"Don't be afraid by this formula. Essentially it's just I replace the Y with a linear regression. So you can see that actually there are two layers in logistic regression. One layer is just a normal linear regression. On top of it, we put a logistic function to convert it to a probability value. That's all. Essentially it is a linear regression inside, [and] you have a cover."*

```d2
direction: right
X: "输入\nx₁ … x_{p-1}"
L1: "第 1 层 · 线性回归\ny = β₀ + Σ βⱼxⱼ\n范围 (−∞, ∞)"
L2: "第 2 层 · logistic 外壳\nP = eʸ / (1 + eʸ)\n范围 (0, 1)"
T: "P ≥ 阈值 ?" {shape: diamond}
POS: "预测为 C\n如:流失"
NEG: "预测为 ¬C\n如:不流失"
X -> L1 -> L2 -> T
T -> POS: "是"
T -> NEG: "否"
```

前两层是 slide 28 的内容;最后的阈值判断是 §16 的内容。

### 反过来写:logit

Slide 29 把上式**反解**出 $y$:

$$\ln\!\left(\frac{P}{1-P}\right) = y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_{p-1} x_{p-1}$$

左边这个量叫 $P$ 的 **logit**,slide 称之为 **log odds ratio**。讲师:*"Here you see, I represent P by Y. Now I represent Y by P. They are the same, you can derive this... It's not difficult."*

> 📎 **拓展(超出 slides)· 推导** — 从 $P = \dfrac{e^y}{1+e^y}$ 出发:两边乘以 $1 + e^y$ 得 $P + Pe^y = e^y$;移项得 $P = e^y(1-P)$;所以 $e^y = \dfrac{P}{1-P}$;两边取自然对数,$y = \ln\dfrac{P}{1-P}$。

> ⚠️ **Slide 29 的公式有一处下标笔误** — 最后一项写成了 $\beta_p x_{p-1}$,应为 $\beta_{p-1} x_{p-1}$,与 slide 28 一致。Slide 28 左边写的 $P(C\mid x_1, \dots, x_p)$ 也应理解为 $x_1, \dots, x_{p-1}$。

### Odds:一个比概率更"宽"的尺度

> 📎 **拓展(超出 slides)· odds 是什么** — $\dfrac{P}{1-P}$ 叫 **odds(几率、赔率)**:事件发生的概率与不发生的概率之比。赌球时说"4 赔 1",就是这个意思。
>
> | 概率 $P$ | 0.1 | 0.2 | 0.5 | 0.8 | 0.9 |
> |---|---|---|---|---|---|
> | odds $\frac{P}{1-P}$ | 0.111 | 0.25 | **1** | 4 | 9 |
> | log odds $\ln\frac{P}{1-P}$ | −2.20 | −1.39 | **0** | 1.39 | 2.20 |
>
> 三个尺度的范围依次是:概率 $(0,1)$,odds $(0,\infty)$,log odds $(-\infty,\infty)$。每取一步,范围就"打开"一点,到 log odds 时与线性函数的范围完全对上。**所以 logistic regression 的本质是:用线性回归去建模 log odds。** 这句话就是 slide 29 那个等式的含义。
>
> 注意 slide 用的词是 "log odd**s** ratio"——这里的 ratio 指 $P$ 与 $1-P$ 之比本身,即 odds。§15 会出现另一个概念 **odds ratio**(两个 odds 之比),不要混淆。

---

## §14 怎么求 β:Maximum Likelihood Estimation

### 为什么不能用 OLS

线性回归用 OLS 求 $\beta$:最小化观测值 $y_i$ 与预测值之差的平方和。可在 logistic regression 里,$y$ 根本没被观测到(§13),"$y_i$ 减预测值"无从算起。讲师:*"We don't use the OLS anymore... In linear regression we use OLS, but here in logistic regression we don't use OLS, we use something called maximum likelihood estimation."*

### MLE 的思路

Slide 29:**Maximum Likelihood Estimation (MLE)** is often used to estimate the model parameters. **It finds the parameter values that maximize the chances of observing the given dataset**——它寻找使"观测到手上这份数据"的可能性最大的参数值。

讲师说这是统计模式识别里 *"a widely used principle to estimate parameters"*,高层的想法是:*"The likelihood is what we have observed. So we need to set the value of the beta to support the likelihood of what we have observed."* 数据已经发生了,哪组参数最能"解释"它为什么会这样发生,就选哪组。

> **🔑 例 · 用抛硬币理解 MLE** 📎 *(slides 未给)*
>
> 一枚硬币抛 10 次,出现 7 次正面。这枚硬币正面朝上的概率 $p$ 是多少?
>
> 对每个候选的 $p$,算一下"恰好得到这串结果"的概率(这就是**似然 likelihood**),它等于 $p^7(1-p)^3$:
>
> | 候选 $p$ | 0.5 | 0.6 | **0.7** | 0.8 | 0.9 |
> |---|---|---|---|---|---|
> | 似然 $p^7(1-p)^3$ | 0.00098 | 0.00179 | **0.00222** | 0.00168 | 0.00048 |
>
> $p = 0.7$ 时似然最大,所以 MLE 给出 $\hat p = 0.7$——恰好是 7/10,与直觉一致。如果硬币是公平的($p = 0.5$),得到 7 次正面的可能性只有 $p=0.7$ 时的不到一半;"0.7"比"0.5"更能解释我们看到的结果。

> 📎 **拓展(超出 slides)· 套到 logistic regression 上** — 对第 $i$ 个客户,模型给出流失概率 $P_i$(它依赖于 $\beta$)。如果他实际流失了($c_i = 1$),模型"猜中"的概率是 $P_i$;如果没流失($c_i = 0$),是 $1 - P_i$。所有客户相互独立,整份数据的似然是连乘:
> $$L(\boldsymbol\beta) = \prod_{i=1}^{N} P_i^{\,c_i}\,(1-P_i)^{1-c_i}$$
> MLE 就是找让 $L$ 最大的 $\boldsymbol\beta$。实际计算时先取对数把连乘变成连加(与上周 naïve Bayes 取 log 防下溢是同一个技巧),再用数值优化迭代求解——与 OLS 不同,它**没有闭式解**。R 里用 `glm(Churned ~ ..., family = binomial)`,Python 里用 `sklearn.linear_model.LogisticRegression`,都会替你完成。

讲师也提到,软件给出的 logistic regression 输出与 §5 的线性回归输出长得很像:*"you will again see something like this... it also assumes some underlying distribution of statistics to conduct hypothesis testing."* 同样有 Estimate、Std. Error、检验统计量和 p 值,读法也类似。课上没有展开,重点仍是线性回归的那一页输出。

| | Linear regression | Logistic regression |
|---|---|---|
| 输出 | 连续值 $y$ | 概率 $P$,再转成类别 |
| 训练数据里有什么 | 实际的 $y$ | 只有类别标签 |
| 线性部分建模的是 | $y$ 本身 | log odds $\ln\frac{P}{1-P}$ |
| 参数估计方法 | **OLS**(最小化平方误差) | **MLE**(最大化似然) |
| 求解方式 | 有闭式解 | 数值迭代 |
| R 函数 | `lm()` | `glm(..., family = binomial)` 📎 |

---

## §15 例:客户流失 (Customer Churn)

Slide 30 给出了一个完整的例子。场景是电信运营商想预测哪些客户会流失,讲师的本地化说法是 *"whether you switched from Vodafone to Optus or you switch from Optus to Telstra."*

- **Input variables**:Age(年龄,年)、Married(是否已婚,true/false)、Duration(成为客户的年数)、Churned_contacts(该客户的联系人中已经流失的人数,计数)
- **Outcome variable**:Churned(是否流失,true/false)

拟合出的线性部分是:

$$y = 3.50 - 0.16 \times \text{Age} + 0.38 \times \text{Churned\_contacts}$$

注意方程里没有 Married 和 Duration。Slides 没有交代原因;最可能的解释(也是教材里的做法)是它们的系数不显著,按 §6 的流程被剔除了。

### 手算几个客户

> **🔑 例 · 客户 1(Age 50,Churned_contacts 1)**
>
> **第 1 层**:$y = 3.50 - 0.16 \times 50 + 0.38 \times 1 = 3.50 - 8.00 + 0.38 = -4.12$
>
> **第 2 层**:$P = \dfrac{e^{-4.12}}{1 + e^{-4.12}} = \dfrac{0.01624}{1.01624} = 0.016$
>
> 这个客户流失的概率只有 1.6%。

> **🔑 例 · 客户 9(Age 20,Churned_contacts 6)**
>
> **第 1 层**:$y = 3.50 - 0.16 \times 20 + 0.38 \times 6 = 3.50 - 3.20 + 2.28 = 2.58$
>
> **第 2 层**:$P = \dfrac{e^{2.58}}{1 + e^{2.58}} = \dfrac{13.20}{14.20} = 0.930$
>
> 这个客户流失的概率高达 93%。

Slide 30 的完整表格(9 个假想客户,年龄取 50 / 30 / 20,流失联系人数取 1 / 3 / 6):

| 客户 | Age | Churned_contacts | $y$ | 流失概率 $P$ |
|---|---|---|---|---|
| 1 | 50 | 1 | −4.12 | 0.016 |
| 2 | 50 | 3 | −3.36 | 0.034 |
| 3 | 50 | 6 | −2.22 | 0.098 |
| 4 | 30 | 1 | −0.92 | 0.285 |
| 5 | 30 | 3 | −0.16 | 0.460 |
| 6 | 30 | 6 | 0.98 | 0.727 |
| 7 | 20 | 1 | 0.68 | 0.664 |
| 8 | 20 | 3 | 1.44 | 0.808 |
| 9 | 20 | 6 | 2.58 | 0.930 |

讲师:*"you will know which customer has the highest probability of churning, which one has the lowest."* 从表里能读出两条规律,与系数的符号一一对应:

- **Age 的系数为负(−0.16)**:流失联系人数相同时,越年轻越容易流失。看客户 1、4、7(都是 1 个流失联系人):0.016 → 0.285 → 0.664。
- **Churned_contacts 的系数为正(+0.38)**:年龄相同时,身边流失的人越多越容易流失。看客户 4、5、6(都是 30 岁):0.285 → 0.460 → 0.727。

讲师也提醒了一点:训练数据里只有 *"customer age, churned yes or no"*,表中的 $y$ 列是我们用拟合出的系数**算出来**的,数据里并没有这一列。

### 系数怎么解读

线性回归里,$\beta_j$ 是"$x_j$ 加 1,$y$ 变化多少"。logistic regression 里也一样,只不过这个 $y$ 是 **log odds**。所以 Churned_contacts 的系数 0.38 的直接含义是:**每多一个流失的联系人,流失的 log odds 增加 0.38。**

> 📎 **拓展(超出 slides)· 用 odds ratio 解读** — log odds 不直观,取指数就回到 odds:$x_j$ 每加 1,odds **乘以** $e^{\beta_j}$,这个倍数叫 **odds ratio**。
>
> - Churned_contacts:$e^{0.38} = 1.46$,每多一个流失联系人,流失的 odds 变为原来的 1.46 倍(上升 46%);
> - Age:$e^{-0.16} = 0.852$,每大一岁,流失的 odds 变为原来的 0.852 倍(下降约 15%)。

注意系数对**概率**的影响不是固定的。比较两组"流失联系人从 1 增加到 3"的变化,$y$ 都增加了 $0.38 \times 2 = 0.76$:

- 50 岁的客户(1 → 2):概率从 0.016 升到 0.034,只增加 **0.018**;
- 30 岁的客户(4 → 5):概率从 0.285 升到 0.460,增加了 **0.175**。

同样的 $y$ 增量,在 S 形曲线平坦的左端几乎推不动概率,在陡峭的中段就能推动很多。这就是 §12 说的"中间陡、两端平"。

---

## §16 从概率到类别:阈值

### 默认 0.5,但不必是 0.5

Slide 31:**Logistic regression is often used as a classifier to assign class labels to a data example, based on the predicted probability.** 有了概率,还要定一个**阈值 (threshold)**:概率高于阈值判为正类,否则判为负类。

**Commonly, 0.5 is used as the default probability threshold.** 讲师:*"If the predicted probability is over 0.5, you say yes or positive. Lower than 0.5, you say no or negative."*(录音转写成了 "1.5",是 0.5 的误识别。)

> 📎 **拓展(超出 slides)· 0.5 阈值对应一条直线** — 由 §12,$f(y) \geq 0.5 \iff y \geq 0$。所以阈值取 0.5 时,分类规则等价于 $\beta_0 + \beta_1x_1 + \dots + \beta_{p-1}x_{p-1} \geq 0$。正负两类的分界 $\beta_0 + \sum_j \beta_j x_j = 0$ 是一条直线(高维时是一个超平面)。所以 logistic regression 是一个**线性分类器 (linear classifier)**,与 §1 提到的单层感知机属于同一家族。流失例子的分界线是 $3.50 - 0.16\,\text{Age} + 0.38\,\text{Churned\_contacts} = 0$。

但 slide 31 紧接着说:**However, any threshold value can be used depending on the preference to avoid false positives.** 阈值是可以调的,取决于你有多怕**误报 (false positive)**。讲师:*"You can adjust the threshold based on whether you become more aggressive or you become more conservative."*

> **🔑 例 · 同一张表,三个阈值**
>
> 用 §15 的 9 个客户。运营商打算给"预测会流失"的客户打电话挽留,每通电话都有成本。
>
> | 阈值 | 被判为"会流失"的客户 | 人数 | 风格 |
> |---|---|---|---|
> | 0.7 | 6、8、9 | 3 | 保守:只联系最有把握的,误报少,但可能漏掉真要走的人 |
> | 0.5 | 6、7、8、9 | 4 | 默认 |
> | 0.3 | 5、6、7、8、9 | 5 | 激进:宁可多打几通电话,也不放走一个,漏报少,但误报多 |

阈值的取舍本质上是 **FP 与 FN 的交换**:

| 调整方向 | 判为正类的样本 | FP(误报) | FN(漏报) | 适用场景 |
|---|---|---|---|---|
| **提高**阈值(保守) | 变少 | ↓ | ↑ | 误报代价高:如把正常交易误判为欺诈会激怒客户 |
| **降低**阈值(激进) | 变多 | ↑ | ↓ | 漏报代价高:如癌症筛查,漏诊的后果远比复查严重 |

既然阈值可以随便调,用哪个阈值来评价一个分类器?只看某一个阈值下的 accuracy,结论会随阈值而变。下一节的 ROC 曲线把**所有阈值**一次画出来,解决了这个问题。

---

## §17 ROC 曲线与 AUC

### 复习:四个格子

Slide 32 标题是 *Diagnosis (review)*,复习了上周的 confusion matrix。设正类为 $C$,负类为 $\neg C$:

| | 实际为 $C$ | 实际为 $\neg C$ |
|---|---|---|
| **预测为 $C$** | **TP**(true positive):预测 $C$,实际 $C$ | **FP**(false positive):预测 $C$,实际 $\neg C$ |
| **预测为 $\neg C$** | **FN**(false negative):预测 $\neg C$,实际 $C$ | **TN**(true negative):预测 $\neg C$,实际 $\neg C$ |

一个好记的办法:第二个字母(P/N)是**模型的预测**,第一个字母(T/F)是**预测对不对**。FP 就是"预测成 Positive,但预测错了(False)"。

由此定义三个指标("#"表示"个数"):

$$\text{Accuracy} = \frac{TP + TN}{TP + FP + TN + FN}$$

$$\text{FPR} = \frac{FP}{FP + TN} \qquad\qquad \text{TPR} = \frac{TP}{TP + FN}$$

- **TPR(true positive rate,真正率)**:**实际为正**的样本里,被正确找出来的比例。也叫 recall 或 sensitivity。
- **FPR(false positive rate,假正率)**:**实际为负**的样本里,被误报成正的比例。

> ⚠️ **Slide 32 的两个分母写错了,考试按上面的写法** — Slide 上写的是 $\text{FPR} = \frac{\#FP}{\#TN + \#FN}$ 和 $\text{TPR} = \frac{\#TP}{\#TP + \#FP}$。前者的分母混进了 FN(那是实际为正的样本);后者其实是 **precision** 的公式。正确的分母都是"**实际**属于某一类的样本总数":TPR 的分母是全部实际正类 $TP + FN$,FPR 的分母是全部实际负类 $FP + TN$。这与 Week 5 讲义 §42 一致。

### ROC 曲线是什么

Slide 33:**Receiver Operating Characteristic (ROC) curve** is the plot of the **True Positive Rate (TPR)** against the **False Positive Rate (FPR)**——以 FPR 为横轴、TPR 为纵轴画出的曲线。

讲师顺带讲了名字的来历:*"I think it was used in 1940s, used for radar to detect any unknown flying object."* 这个名字来自二战时的雷达信号检测:"receiver"是雷达接收机,操作员要在噪声中分辨敌机信号,灵敏度调高会多报假目标,调低会漏掉真敌机——与 §16 的阈值取舍完全是同一个问题。

**A classifier shall have a low FPR and a high TPR**——好的分类器误报少、命中多。讲师:*"We want to minimize the false positive rate. We don't like false positive... We hope the true positive rate to be as high as possible."* 所以 ROC 图上最理想的点是**左上角** $(0, 1)$:FPR = 0、TPR = 1,一个不漏、一个不错。

### 曲线是怎么画出来的

一个固定阈值只能得到一个 confusion matrix,也就只能得到**一个点** (FPR, TPR)。讲师:*"When you adjust the probability threshold, use different probability thresholds from 0, 0.1, 0.2, ... until 0.9, until 1.0. You use each of them as your threshold to do classification. You usually get a line like this."* 让阈值从高到低扫一遍,每个阈值算一个点,连起来就是 ROC 曲线。

```d2
direction: down
P: "模型输出:每个样本的概率"
T: "选一个阈值 t"
CM: "confusion matrix\nTP / FP / FN / TN"
PT: "得到一个点 (FPR, TPR)"
CURVE: "ROC 曲线"
AUC: "AUC:曲线下面积" {shape: oval}
P -> T -> CM -> PT
PT -> T: "换下一个阈值"
PT -> CURVE: "所有阈值的点连起来"
CURVE -> AUC
```

两个端点总是固定的:

- 阈值**高于所有概率**:谁都不判为正类,TP = FP = 0 → 点 $(0, 0)$;
- 阈值**为 0**:所有样本都判为正类,FN = TN = 0 → 点 $(1, 1)$。

> **🔑 例 · 亲手画一条 ROC 曲线** *(实际标签为自拟,slides 未给)*
>
> 沿用 §15 的 9 个客户及其流失概率,假设后来查明客户 5、7、8、9 真的流失了(4 个正类),客户 1、2、3、4、6 没有流失(5 个负类)。按概率从高到低排列:
>
> | 客户 | 9 | 8 | 6 | 7 | 5 | 4 | 3 | 2 | 1 |
> |---|---|---|---|---|---|---|---|---|---|
> | 概率 | 0.930 | 0.808 | 0.727 | 0.664 | 0.460 | 0.285 | 0.098 | 0.034 | 0.016 |
> | 实际 | 流失 | 流失 | 未流失 | 流失 | 流失 | 未流失 | 未流失 | 未流失 | 未流失 |
>
> 逐个阈值计算(TPR 的分母是 4,FPR 的分母是 5):
>
> | 阈值 | 判为流失 | TP | FP | TPR | FPR |
> |---|---|---|---|---|---|
> | 0.95 | 无 | 0 | 0 | 0 | 0 |
> | 0.9 | 9 | 1 | 0 | 0.25 | 0 |
> | 0.8 | 9、8 | 2 | 0 | 0.50 | 0 |
> | 0.7 | 9、8、6 | 2 | 1 | 0.50 | 0.2 |
> | 0.5 | +7 | 3 | 1 | 0.75 | 0.2 |
> | 0.3 | +5 | 4 | 1 | **1.00** | 0.2 |
> | 0.2 | +4 | 4 | 2 | 1.00 | 0.4 |
> | 0 | 全部 | 4 | 5 | 1.00 | 1.00 |
>
> 把点 $(0,0) \to (0,0.25) \to (0,0.5) \to (0.2,0.5) \to (0.2,0.75) \to (0.2,1) \to (1,1)$ 连起来,就是这个模型的 ROC 曲线:先沿纵轴上升,再向右走。阈值 0.3 时达到 TPR = 1、FPR = 0.2,这个点离左上角最近,是一个不错的阈值选择。
>
> 曲线下的面积:FPR 从 0 到 0.2 这一段高度为 0.5,面积 $0.2 \times 0.5 = 0.1$;从 0.2 到 1 这一段高度为 1,面积 $0.8 \times 1 = 0.8$。**AUC = 0.1 + 0.8 = 0.9**。

### AUC:把一条曲线压成一个数

Slide 33 的最后一条:**A metric: the area under the ROC curve (AUC)**。曲线越靠近左上角,曲线下的面积越大。讲师:*"If the value is high, closer to 1.0, means your classifier has a good performance."* Slide 上的示例曲线 AUC = 0.8877。

| AUC | 含义 |
|---|---|
| 1.0 | 完美分类器:曲线经过左上角 |
| 0.8–0.9 | 好(slide 示例 0.8877,上面的手算例子 0.9) |
| 0.5 | 等同于随机猜:曲线就是从 $(0,0)$ 到 $(1,1)$ 的对角线 |
| < 0.5 | 比随机猜还差(把预测反过来用反而更好) |

> 📎 **拓展(超出 slides)· AUC 的概率含义** — AUC 等于:**随机抽一个正样本和一个负样本,模型给正样本的概率高于负样本的概率的可能性。** 用上面的例子验证:4 个正类 × 5 个负类 = 20 对。客户 9(0.930)与客户 8(0.808)的概率高于全部 5 个负类;客户 7(0.664)和客户 5(0.460)各高于 4 个负类(都低于客户 6 的 0.727)。合计 $5+5+4+4 = 18$,$18/20 = 0.9$,与面积算出的结果一致。这也解释了为什么随机猜的 AUC 是 0.5:正负样本谁高谁低全凭运气,各占一半。

ROC 与 AUC 的价值在于**它们不依赖于阈值**。你可以先用 AUC 比较两个模型谁更好,选定模型后,再根据业务对 FP 和 FN 的容忍度(§16)在曲线上挑一个合适的阈值。

---

# Part IV · 选型与警示

## §18 线性还是 logistic:按输出类型选

Slide 34 给出了选择依据:

- **Linear regression**:input variables 可以是 **continuous or discrete**(连续或离散),outcome variable 是 **continuous**;
- **Logistic regression**:outcome variable 是 **categorical** 时更好的选择;
- **Both models assume a linear additive function of the input variables**——两者都假设输入变量以**线性相加**的方式起作用。

最后一条值得多想一下。"additive(可加)"意味着每个变量的作用各自独立地加进来:Age 的效应不会因为 Education 的取值而改变。如果现实中"教育的回报随年龄增长而变大",这种**交互作用**就不在模型里,除非你手动加一个 $\text{Age} \times \text{Education}$ 的交叉项(§20)。对 logistic regression 来说,线性可加还意味着它的分类边界是一条直线(§16 拓展框)。

讲师把选择范围放得更宽:输出是类别时,上周和本周学过的分类器都可以用;输出是连续值时,线性回归是首选,但不是唯一选择。*"If you find the outcome is categorical, you can choose decision tree, naive Bayes classifier, logistic regression, or neural networks... If your outcome variable is continuous, the first you should consider linear regression. You can also use decision tree because decision tree can also handle continuous [outcome]... or neural networks."*

```d2
direction: right
Q: "outcome 是什么类型?" {shape: diamond}
CONT: "连续值\n房价、收入、温度"
CAT: "类别\n流失 / 不流失"
LR: "首选 linear regression" {style.bold: true}
LR2: "也可:decision tree\n(回归树)、神经网络"
LG: "logistic regression" {style.bold: true}
LG2: "也可:decision tree、naïve Bayes\nKNN、神经网络"
Q -> CONT
Q -> CAT
CONT -> LR
CONT -> LR2
CAT -> LG
CAT -> LG2
```

> 📎 **拓展(超出 slides)** — slide 2 的大纲里有一项 "Additional Regression Models",本周 slides 对此只在 slide 35 提到了 Ridge 与 Lasso(见 §19)。讲师口头提到的 decision tree 用于回归,通常叫 **regression tree**:叶节点存放的不是类别,而是落入该叶节点的样本输出的平均值。

---

## §19 三条警示

Slide 35 列出了使用回归时必须记住的三件事。

### 警示一:相关不等于因果

**Correlation does not imply causation. We shall NOT infer that the input variables directly cause an outcome.**

讲师:*"So far we discussed the relationship between Y and X. We just talked about the correlation. Correlation means they increase together or decrease together, or one increases, one decreases. It's just correlation. Correlation does not imply causation."*

回归能告诉我们"受教育年数多的人,收入往往更高"(Education 系数为正且显著),但不能告诉我们"让一个人多读一年书,他的收入就会涨 1.76"。可能存在第三个因素同时影响两者——比如家庭背景:家境好的人既更可能读更多书,也更可能拿到高薪。

> 📎 **拓展(超出 slides)** — 经典的反例:冰淇淋销量与溺水人数高度相关,拿一个去回归另一个会得到显著的正系数。但禁售冰淇淋不会减少溺水,两者都是被"天气炎热"这个共同原因推高的。这种共同原因叫 **confounder(混杂变量)**。讲师说 *"in order to infer causality, we need another set of algorithms, not linear regression"*,指的是随机对照实验、因果推断方法等。

### 警示二:不要在训练数据范围外使用模型

**Generalization issue — use caution when applying an already fitted model to data that falls outside the dataset used to train the model.**

讲师:*"You should apply your model only to the range that is covered by your training data. If your training data is collected from a range from A to B, then your linear model will generally work well within the range of A to B... If you want to apply the model to a new range, you need to collect the data to cover the range outside of the original dataset."*

收入模型的训练数据,年龄大致在 20 到 70 岁之间(见 §9 的散点图)。用它预测一个 10 岁孩子或 95 岁老人的收入,结果毫无意义。§5 提到截距 7.263("0 岁、0 年教育"时的收入)没有现实含义,原因正在于此。加了 $\text{Age}^2$ 之后问题更突出:二次曲线在 70 岁之后会一路向下,外推到 100 岁可能预测出负收入。

> 📎 **拓展(超出 slides)** — 在训练数据范围之外做预测叫 **extrapolation(外推)**;在范围之内叫 **interpolation(内插)**。模型在训练范围内学到的关系,到了范围外不一定还成立。

### 警示三:多重共线性

**Multicollinearity issue — Ridge regression and Lasso regression.**

**Multicollinearity(多重共线性)** 指输入变量之间高度相关。讲师:*"You need to pay particular attention to whether the features are strongly correlated. If two features are strongly correlated, it will cause multicollinearity issue... you will not get a good solution or single solution. In principle, there will be an infinite number of solutions because your system becomes an underdetermined system."*

这里要分两种程度:

- **完全共线**:某个变量能被其他变量精确地线性表示。比如同时放入"面积(平方米)"和"面积(平方英尺)",后者恰好是前者的 10.76 倍;或者 §8 的哑变量陷阱。这时 $X^\top X$ 不可逆,OLS 有**无穷多个解**——讲师说的就是这种情况。
- **高度相关但不完全共线**:比如"居住面积"和"卧室数量"。这时解是唯一的,但**极不稳定**:标准误被放大、p 值变大,数据稍有变化,系数就大幅摆动,甚至符号翻转。两个变量"抢着"解释同一部分变异,模型分不清功劳归谁。这也是 §10 第 4 条"系数符号不合常识"的常见原因。

解决办法,slide 给出了 **Ridge regression** 和 **Lasso regression**,讲师称之为 *regularization*(正则化)。

> 📎 **拓展(超出 slides)· Ridge 与 Lasso** — 两者都在 OLS 的目标函数后面加一个惩罚项,不让系数变得太大:
>
> | | 目标函数 | 效果 |
> |---|---|---|
> | OLS | $\min \sum_i (y_i - \hat y_i)^2$ | — |
> | **Ridge** | $\min \sum_i (y_i - \hat y_i)^2 + \lambda \sum_j \beta_j^2$ | 把系数整体往 0 收缩,让解唯一且稳定 |
> | **Lasso** | $\min \sum_i (y_i - \hat y_i)^2 + \lambda \sum_j \lvert\beta_j\rvert$ | 能把部分系数**压到恰好为 0**,顺带做变量选择 |
>
> $\lambda \geq 0$ 控制惩罚的力度,是一个超参数,可以用上周讲的 cross-validation 来选。更简单的办法是直接从一组高度相关的变量里只保留一个。

---

## §20 总结:变换变量,是线性回归的日常

Slide 36 的总结:

- **Linear regression and logistic regression model observed data to predict future outcomes**——两者都是用观测数据建模来预测未来;
- **Care must be taken in performing and interpreting a regression analysis**——做回归和解读回归都需要小心:
  - **Determine the best input variables and their relationship to outcome variables**(§6、§7、§10)
  - **Understand and validate underlying assumptions**(§4、§9)
  - **Transform variables when necessary**(§9、本节)

讲师在课末把重点放在了最后一条上,值得完整转述:*"For linear regression, it does not mean, OK, I was given this input variable, I have this output variable, I just train a linear model use this input variable. No. Usually you need to consider adding more attributes by transforming the original attributes to multiple different versions to enrich my model, because, common case, the relationship between the outcome variable and the raw input variable are not linear."*

拿到数据直接把原始变量塞进 `lm()`,通常不够。关系常常不是线性的,需要先变换,把它"拉直"。讲师列举的变换有:

| 变换 | 对象 | 典型用途 |
|---|---|---|
| **log**(取对数) | 输出或输入 | 右偏、跨度大的量(收入、房价);缓解喇叭形残差 |
| **square root**(开平方) | 输出或输入 | 计数类数据;较温和的压缩 |
| **square**(平方) | 输入 | 倒 U 形或 U 形关系(Age²) |
| **cross term**(交叉项,两两相乘) | 输入对 | 一个变量的作用随另一个变量而变(交互作用) |

讲师称交叉项和平方项为 *"second-order information"*(二阶信息)。这些变换都不破坏"对系数线性"(§9),所以变换后仍然用 OLS 求解。他也强调 *"you don't need to do this by yourself... you just need to indicate, OK, I want to take this transformation, I want to consider the cross term. The function will do this automatically for you."*

> 📎 **拓展(超出 slides)** — 在 R 的公式里,这些变换可以直接写:
> ```r
> lm(log(Income) ~ Age + I(Age^2) + Education + Age:Education, data = income_input)
> ```
> `log(Income)` 变换输出;`I(Age^2)` 加平方项(`I()` 告诉 R 按算术理解 `^`);`Age:Education` 加交叉项。

---

# 本章小结 (Key takeaways)

1. **Regression 预测连续数量,classification 预测离散类别**,这是两者唯一的区别;logistic regression 名叫回归,实际用于分类,因为它的内核是一个线性回归,外面套了一层 logistic function。

2. **线性回归模型是 $y = \beta_0 + \beta_1x_1 + \dots + \beta_{p-1}x_{p-1} + \varepsilon$**:$\beta_0$ 是所有输入为 0 时的 $y$,$\beta_j$ 是**其他输入不变时** $x_j$ 每增加 1 个单位 $y$ 的变化,$\varepsilon$ 是线性模型与实际观测之间的随机误差。

3. **OLS 通过最小化残差平方和 $\sum_i(y_i - \hat y_i)^2$ 求 $\beta$**;平方是为了避免正负抵消,也让问题有闭式解,代价是对离群点敏感。

4. **OLS 本身不对误差做假设;常用的 linear regression model 额外假设 $\varepsilon \sim N(0,\sigma^2)$ 且相互独立**。$\beta$ 的数值仍由 OLS 算出,这条假设换来的是统计推断能力(标准误、t 值、p 值),并让模型可以解读为"估计给定 $x$ 时 $y$ 的期望值"。

5. **读 `summary(lm(...))`**:Estimate 是系数,Std. Error 是它的抽样波动,$t = \text{Estimate}/\text{SE}$,Pr(>|t|) 是检验 $H_0: \beta_j = 0$ 的 p 值;在 $\alpha = 0.05$ 下 $p < 0.05$(至少一颗星)才算显著。收入例子中 Gender 的 $p = 0.134$,不显著,可以剔除——**剔除后要重新拟合**,并结合领域知识决定。显著性是在**其他变量都在模型中**的条件下检验的。

6. **Multiple R² 是模型解释的变异比例,加变量只升不降;Adjusted R² 对变量个数施加惩罚**,加入贡献不足的变量会让它下降,比较不同规模的模型时应看 Adjusted R²。

7. **有 $m$ 个取值的类别变量用 $m-1$ 个 binary 变量编码**;按字母顺序编号会凭空制造顺序与等间距;有截距时用 $m$ 个会让 dummy 列之和等于截距列,导致无穷多解(哑变量陷阱)。

8. **"Linear" 指 $y$ 对系数 $\beta$ 线性**,特征可以是原始变量的变换($\text{Age}^2$、$\log x$、交叉项);所以非线性关系常常可以通过变换后仍用线性回归处理。

9. **模型诊断三项**:outcome 对每个 input 作图检查线性;residuals vs fitted 图检查零均值与常数方差(拱形、斜带、偏移、喇叭形都是违背);直方图或 Q-Q plot(`qqnorm` + `qqline`)检查正态性。不通过就变换变量或加变量后重新拟合。

10. **Logistic function $f(y) = \frac{e^y}{1+e^y}$ 把 $(-\infty,\infty)$ 映射到 $(0,1)$**;logistic regression 用线性函数建模 log odds:$\ln\frac{P}{1-P} = \beta_0 + \sum_j\beta_jx_j$。由于 $y$ 观测不到,参数改用 **MLE**(使观测到这份数据的可能性最大)而非 OLS 求得。

11. **Logistic regression 用阈值把概率转成类别**,默认 0.5;提高阈值减少 FP、增加 FN,降低阈值则相反。**ROC 曲线**扫遍所有阈值,画出 TPR 对 FPR,理想点在左上角 $(0,1)$;**AUC** 越接近 1 越好,0.5 等于随机猜。

12. **三条警示**:相关不等于因果;不要把模型用在训练数据范围之外;输入变量高度相关(multicollinearity)会让系数不稳定甚至无唯一解,可用 Ridge / Lasso 正则化缓解。

---

# 公式速查

| 内容 | 公式 |
|---|---|
| 线性回归模型 | $y = \beta_0 + \beta_1x_1 + \dots + \beta_{p-1}x_{p-1} + \varepsilon$ |
| 正态误差假设 | $\varepsilon \sim N(0, \sigma^2)$,相互独立 |
| 条件期望 | $E[y\mid x] = \beta_0 + \sum_j \beta_j x_j$ |
| 残差 | $e_i = y_i - \hat y_i$(Observed − Predicted) |
| OLS 目标 | $\min \sum_{i=1}^N \big(y_i - (\beta_0 + \sum_j \beta_j x_{ij})\big)^2$ |
| 一元 OLS 闭式解 📎 | $\hat\beta_1 = \frac{\sum(x_i-\bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2}$,$\hat\beta_0 = \bar y - \hat\beta_1 \bar x$ |
| 系数检验 | $H_0: \beta_j = 0$ vs $H_A: \beta_j \neq 0$,$t = \hat\beta_j / \text{SE}(\hat\beta_j)$ |
| $R^2$ 📎 | $1 - \text{SSE}/\text{SST}$ |
| Adjusted $R^2$ 📎 | $1 - (1-R^2)\frac{N-1}{N-k-1}$ |
| Logistic function | $f(y) = \frac{e^y}{1+e^y}$ |
| Logistic regression | $P = \frac{e^{\beta_0 + \sum_j \beta_j x_j}}{1 + e^{\beta_0 + \sum_j \beta_j x_j}}$ |
| Logit | $\ln\frac{P}{1-P} = \beta_0 + \sum_j \beta_j x_j$ |
| Odds ratio 📎 | $x_j$ 加 1,odds 乘以 $e^{\beta_j}$ |
| Accuracy | $\frac{TP+TN}{TP+FP+TN+FN}$ |
| TPR(recall) | $\frac{TP}{TP+FN}$ |
| FPR | $\frac{FP}{FP+TN}$ |

---

# 全章概念地图

```d2
direction: down
classes: {
  key: {style: {fill: "#eaf3ee"; stroke: "#2f6f4f"; bold: true}}
}
REG: "Regression" {shape: oval}
LIN: "Linear regression · 输出连续值" {
  CATV: "类别变量 → m−1 个 dummy"
  MOD: "y = β₀ + Σβⱼxⱼ + ε"
  OLS: "OLS:最小化 SSE"
  NORM: "加假设 ε ~ N(0, σ²)"
  INF: "SE / t / p · R² / Adjusted R²" {class: key}
  DIAG: "诊断:线性 / 残差 / 正态"
  TRANS: "变换变量:log / 平方 / 交叉项"
  CATV -> MOD -> OLS -> NORM -> INF -> DIAG
  DIAG -> TRANS: "不通过"
  TRANS -> OLS: "重新拟合"
}
LOG: "Logistic regression · 输出类别" {
  LIN2: "线性部分 y = β₀ + Σβⱼxⱼ\n(即 log odds)"
  LF: "logistic function\n(−∞,∞) → (0,1)"
  MLE: "MLE 求 β"
  TH: "阈值 → 类别"
  ROC: "ROC / AUC" {class: key}
  LIN2 -> LF -> MLE -> TH -> ROC
}
WARN: "三条警示" {
  W1: "相关 ≠ 因果"
  W2: "不要外推"
  W3: "多重共线性\n→ Ridge / Lasso"
}
REG -> WARN
REG -> LOG
REG -> LIN
```

---

# 考点提示

以下依据讲师在课上的明确强调整理:

- **`summary(lm(...))` 那一页输出是重中之重。** 讲师原话:*"this page is important. I ask everyone to pay attention to understand this page."* 他点名四件事:什么是 residual;Coefficients 表每一列的含义和算法(不用自己算,但要知道怎么来的);**如何判断一个 β 是否显著不为 0**;Multiple R² 的含义以及为什么需要 Adjusted R²。准备好能对着一张陌生的输出表,说出哪些变量显著、哪个该剔除、模型解释了多少变异。
- **OLS 与正态误差假设的关系**:OLS 不对 $\varepsilon$ 做假设;额外假设 $\varepsilon \sim N(0,\sigma^2)$ 是为了做统计推断。讲师花了不少时间讲这个逻辑(*"I hope you can see the logic why we want to make additional assumption"*)。
- **类别变量的 $m-1$ 规则及其原因**(有截距 → 共线 → 无穷多解)。
- **"linear" 指对系数线性**,能举出 $\text{Age}^2$ 的例子说明。
- **诊断**:能看着残差图说出哪条假设被违背;知道 Q-Q plot 怎么读。
- **Logistic regression**:为什么需要 logistic function;"线性回归 + 外壳"的两层结构;$y$ 观测不到;MLE 而非 OLS。能用给定系数手算概率。
- **阈值与 ROC/AUC**:阈值对 FP 的影响;ROC 横纵轴、理想点、AUC 含义。
- **三条警示**,尤其是 correlation ≠ causation。

---

# 自测题

### A. 概念题

1. Classification 与 regression 的区别是什么?Logistic regression 属于哪一类,为什么名字里有"regression"?
2. 写出线性回归的模型方程,解释 $\beta_0$、$\beta_j$、$\varepsilon$ 的含义。解释 $\beta_j$ 时必须带上的条件是什么?
3. OLS 最小化的是什么量?为什么用平方而不是直接把残差相加?
4. OLS 与 "linear regression model (with normally distributed errors)" 有什么区别?额外假设的内容是什么,它换来了哪些能力?
5. "The regression model estimates the expected value of $y$" 这句话是什么意思?Slide 12 那张"每个 $x$ 处一个钟形曲线"的图表达了哪三点?
6. Multiple R² 和 Adjusted R² 分别衡量什么?为什么比较变量个数不同的模型时应看后者?
7. 一个"季节"变量有春夏秋冬 4 个取值,模型带截距,应加入几个 binary 变量?如果加 4 个会出什么问题?如果按字母顺序编为 1–4 又会出什么问题?
8. "Linear regression" 中的 "linear" 指什么?下列模型哪些是线性回归:(a) $y = \beta_0 + \beta_1 x + \beta_2 x^2 + \varepsilon$;(b) $y = \beta_0 + \beta_1 \log x + \varepsilon$;(c) $y = \beta_0 e^{\beta_1 x} + \varepsilon$?
9. 线性回归诊断要检查哪三项?残差图呈喇叭形、呈拱形,分别说明什么,各怎么修正?
10. 如何从 Q-Q plot 判断残差是否服从正态分布?
11. Logistic regression 为什么需要 logistic function?它的两层结构是什么?
12. 为什么 logistic regression 不用 OLS 估计参数?它用什么方法,这个方法的核心思想是什么?
13. 把分类阈值从 0.5 提高到 0.8,FP 和 FN 会如何变化?什么场景适合这样做?
14. ROC 曲线的横轴和纵轴分别是什么?理想点在哪里?AUC = 0.5 意味着什么?
15. 列出使用回归时的三条警示,并各举一例。

### B. 计算题

16. 根据 §5 的 `summary` 输出,预测一个 Age = 30、Education = 12、Gender = 0 的人的收入。
17. 某回归输出中,一个系数的 Estimate = 2.4,Std. Error = 1.5,样本量很大。计算 t 值,判断它在 $\alpha = 0.05$ 下是否显著(大样本时 t 分布接近标准正态,双侧临界值约 1.96)。
18. $N = 50$ 的数据,用 $k = 5$ 个变量拟合得 $R^2 = 0.40$。(a) 求 Adjusted R²。(b) 再加入第 6 个变量后 $R^2$ 升到 0.41,求新的 Adjusted R²。应该保留第 6 个变量吗?
19. 用 §15 的流失模型,计算一个 25 岁、有 4 个流失联系人的客户的流失概率。阈值取 0.5 和 0.8 时,分别判为哪一类?
20. 某分类器在测试集上的结果为 TP = 30,FN = 10,FP = 20,TN = 140。求 Accuracy、TPR、FPR。
21. 某事件的概率 $P = 0.8$,求它的 odds 和 log odds。
22. 对数据 $x = (1, 2, 3)$,$y = (1, 3, 2)$ 手算 OLS 直线,并求 SSE 与 $R^2$。

---

### 参考答案

1. Classification 预测离散类别,regression 预测连续数量,这是两者唯一的区别。Logistic regression 属于分类方法;它的名字来自"logistic function + linear regression"的组合,内部确实包含一个线性回归。

2. $y = \beta_0 + \beta_1x_1 + \dots + \beta_{p-1}x_{p-1} + \varepsilon$。$\beta_0$ 是所有 $x_j = 0$ 时 $y$ 的值;$\beta_j$ 是 $x_j$ 增加 1 个单位时 $y$ 的变化,**前提是其他输入保持不变**;$\varepsilon$ 是线性模型与某次实际观测值之间的随机误差。

3. 最小化残差平方和 $\sum_i (y_i - \hat y_i)^2$。残差有正有负,直接相加会相互抵消,一条处处都错的直线也可能得到 0;平方后全部为正,不会抵消,而且处处可导,便于求闭式解。

4. OLS 不对误差项做任何假设,只能给出 $\beta$ 的数值。Linear regression model 额外假设 $\varepsilon \sim N(0,\sigma^2)$ 且各误差相互独立。它换来了统计推断的能力:可以算标准误、t 值、p 值,检验系数是否显著,评估估计的可靠程度。$\beta$ 的数值仍用 OLS 求得。

5. 在正态误差假设下,对给定的 $x$,$y \sim N(\beta_0 + \sum_j\beta_jx_j, \sigma^2)$,所以模型给出的 $\beta_0 + \sum_j\beta_jx_j$ 是 $y$ 的期望值,实际观测值等于期望值加随机噪声。图中三点:钟形中心都在直线上(零均值);钟形宽度相同(常数方差);观测点散落在钟形范围内(观测值 = 期望值 + 扰动)。

6. Multiple R² 衡量输出的总变异中被模型解释的比例;Adjusted R² 在此基础上对变量个数施加惩罚。加入任何变量(包括无关变量)都不会让 R² 下降,只看 R² 会诱导人不停加变量、导致 overfitting;Adjusted R² 在新变量贡献不足时会下降,所以比较不同规模的模型时更公平。

7. 加 $4 - 1 = 3$ 个 binary 变量,以其中一个季节为基准。加 4 个时,4 列之和恒等于 1,与截距列完全相同,产生完全共线,OLS 有无穷多个解(哑变量陷阱)。按字母顺序编为 1–4,会凭空引入顺序和等间距,并强迫四个季节的效应落在一条直线上,结论还会随编号方式改变。

8. "Linear" 指 $y$ 对系数 $\beta$ 是线性的,特征可以是原始变量或其变换。(a) 是,$x^2$ 只是一个新特征;(b) 是,$\log x$ 是变换后的特征;(c) 不是,$\beta_1$ 出现在指数上。

9. 三项:线性(outcome 对每个 input 作图)、残差零均值与常数方差(residuals vs fitted 图)、正态性(直方图或 Q-Q plot)。喇叭形说明方差随预测值增大,违背常数方差,常用的修正是变换输出(如取 $\log y$);拱形说明残差均值随预测值系统变化,通常是漏了非线性项,修正方法是加入平方项等新变量或变换输入。

10. 点几乎都落在 `qqline` 画出的参考直线上,说明残差服从正态分布;点明显偏离直线(如两端弯曲成 S 形),说明不服从正态分布。

11. Logistic regression 要输出概率,范围是 (0,1);它内部的线性函数输出范围是 $(-\infty,\infty)$。Logistic function 把后者映射到前者。两层结构:第一层是线性回归 $y = \beta_0 + \sum_j\beta_jx_j$;第二层是 logistic 外壳 $P = e^y/(1+e^y)$。

12. 因为 $y$(log odds)在训练数据中观测不到,只有类别标签,无法计算"观测值 − 预测值"。它用 maximum likelihood estimation (MLE):寻找使观测到这份数据的可能性(似然)最大的参数值。

13. 判为正类的样本变少:FP 减少,FN 增加。适合误报代价高的场景,比如欺诈检测中误判正常交易会激怒客户,或者挽留活动的成本很高、只想联系最有把握的客户。

14. 横轴 FPR,纵轴 TPR。理想点是左上角 $(0, 1)$,即没有误报、全部命中。AUC = 0.5 意味着分类器与随机猜一样,ROC 曲线就是对角线。

15. (1) 相关不等于因果:Education 系数显著为正,不能说明多读书**导致**收入提高,可能是家庭背景同时影响两者。(2) 不要外推:训练数据年龄为 20–70 岁,不能用来预测 10 岁或 95 岁的人。(3) 多重共线性:同时放入"居住面积"和"卧室数量",系数会不稳定、标准误变大;可用 Ridge / Lasso 或只保留其一。

16. $7.26299 + 0.99520 \times 30 + 1.75788 \times 12 - 0.93433 \times 0 = 7.263 + 29.856 + 21.095 = \mathbf{58.21}$。

17. $t = 2.4 / 1.5 = 1.6$。$|1.6| < 1.96$,p 值约为 0.11,大于 0.05,不能拒绝 $H_0$,该系数不显著。

18. (a) $1 - 0.60 \times \frac{49}{44} = 1 - 0.668 = \mathbf{0.332}$。(b) $1 - 0.59 \times \frac{49}{43} = 1 - 0.672 = \mathbf{0.328}$。R² 上升了,但 Adjusted R² 反而下降,说明第 6 个变量带来的解释力不足以抵消复杂度的代价,不应保留(除非有领域知识上的理由)。

19. $y = 3.50 - 0.16 \times 25 + 0.38 \times 4 = 3.50 - 4.00 + 1.52 = 1.02$;$P = \frac{e^{1.02}}{1 + e^{1.02}} = \frac{2.773}{3.773} = \mathbf{0.735}$。阈值 0.5 时 $0.735 \geq 0.5$,判为**会流失**;阈值 0.8 时 $0.735 < 0.8$,判为**不会流失**。

20. Accuracy $= \frac{30 + 140}{200} = \mathbf{0.85}$;TPR $= \frac{30}{30 + 10} = \mathbf{0.75}$;FPR $= \frac{20}{20 + 140} = \mathbf{0.125}$。

21. odds $= \frac{0.8}{0.2} = \mathbf{4}$;log odds $= \ln 4 = \mathbf{1.386}$。

22. $\bar x = 2$,$\bar y = 2$;$\sum(x_i - \bar x)(y_i - \bar y) = (-1)(-1) + 0 \times 1 + 1 \times 0 = 1$;$\sum(x_i - \bar x)^2 = 1 + 0 + 1 = 2$。所以 $\hat\beta_1 = 0.5$,$\hat\beta_0 = 2 - 0.5 \times 2 = 1$,直线为 $\hat y = 1 + 0.5x$。预测值 $1.5, 2, 2.5$,残差 $-0.5, 1, -0.5$,$\text{SSE} = 0.25 + 1 + 0.25 = 1.5$;$\text{SST} = 1 + 1 + 0 = 2$;$R^2 = 1 - 1.5/2 = \mathbf{0.25}$。

---

# 与前后各周的连接

- **Week 2 · 数据分析生命周期**:§10 的"尽早考虑所有输入变量""用 Phase 1 积累的领域知识检查系数符号",都对应生命周期的 discovery 与 model planning 阶段。
- **Week 3 · 假设检验**:§6 的系数检验就是 Week 3 的 t 检验——同样的 $H_0$/$H_A$、t 统计量、p 值与 $\alpha = 0.05$;§4 的正态与独立假设,也与 Week 3 做 t 检验前的前提相同。
- **Week 5 · Classification**:logistic regression 是又一个概率型分类器,与 naïve Bayes 都先给概率再做决定;§17 的 confusion matrix、TPR、FPR 承接 Week 5 §41–§42;§7 的 Adjusted R² 与 §19 的 Ridge/Lasso,都是在对付 Week 5 讲的 overfitting。
- **Week 7 · Association Rules**:本周 slides 的后半部分(S37–S66)由讲师推迟到下周讲,用的是扩充版 slides。它是 **unsupervised、descriptive** 的方法,与本周 supervised、predictive 的回归形成对照。

---

# 附:Slides 覆盖对照表

| Slides | 内容 | 本讲义位置 |
|---|---|---|
| S1–S2 | 封面、Regression 大纲 | 开篇 |
| S3 | Classification vs regression;回归分析的目的;单层 MLP | §1 |
| S4–S5 | 线性回归定义、线性假设、非确定性;用例 | §2(线性的真正含义见 §9) |
| S6–S7 | 模型方程与符号;如何求 β | §2、§3 |
| S8–S9 | 目标:最小化总误差;OLS 目标函数与一维示意图 | §3 |
| S10–S12 | OLS 不假设误差;正态误差模型;期望值解读 | §4 |
| S13–S15 | income 数据;`lm()`;`summary` 输出 | §5、§7 |
| S16–S17 | 系数假设检验;剔除变量;结合领域知识 | §6 |
| S18 | 类别变量:$m-1$ 个 binary 变量 | §8 |
| S19–S23 | 诊断:线性、残差、正态性(直方图 / Q-Q) | §9 |
| S24 | 其他考虑:变量、Adjusted R²、离群点、系数合理性 | §7、§10 |
| S25–S26 | Logistic regression 动机与用例 | §11 |
| S27 | Logistic function | §12 |
| S28–S29 | 两层结构、logit、MLE | §13、§14 |
| S30 | 客户流失例子 | §15 |
| S31 | 阈值 | §16 |
| S32–S33 | Confusion matrix 复习;ROC 与 AUC | §17 |
| S34 | 选择线性还是 logistic | §18 |
| S35 | 因果、外推、多重共线性 | §19 |
| S36 | 总结 | §20 |
| S37–S66 | Association rules | **未覆盖**:讲师推迟到 Week 7 |
| S67 | Q&A | — |
