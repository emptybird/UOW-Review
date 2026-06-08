# CSCI933 · Machine Learning & Data Mining — Exam Cheat Sheet

> Exam style (anchors everything below): **no derivations** — you're given an equation and must *explain what each term does · what happens if removed/scaled · why it's designed so*. Two master question types: **① scenario → pick model → justify → trade-offs**, **② interpret a loss/equation**. Some questions come from the **assignments** (Ridge, Dropout, RAG). Recurring spine: all ML = **learn a function input→output**; **generalization** (do well on unseen *same-distribution* data) is the goal, **overfitting** the enemy; we minimise **empirical error $\hat R$** but want **generalization error $R$**; bias²+variance+irreducible.

---

## W2 · ML introduction

- **Mitchell T/E/P:** program learns from experience **E** w.r.t. task **T** measured by **P** if P on T improves with E.
- **8 paradigms:** supervised, unsupervised, semi-supervised, transductive, online, reinforcement, active, few-shot.
- **Tasks as function signatures:** classification $\mathbb{R}^n\!\to\!\{1..k\}$, regression $\mathbb{R}^n\!\to\!\mathbb{R}$, ranking, clustering, dim-reduction $\mathbb{R}^n\!\to\!\mathbb{R}^k$, transcription, translation, anomaly detection, synthesis, density estimation.
- **Linear regression** normal equations $\boldsymbol\omega=(X^TX)^{-1}X^Ty$ (use **pseudo-inverse** if singular); geometric = project $y$ onto feature subspace. **Bias $b$ enlarges the hypothesis space** (line need not pass through origin) — same reason every neuron has a bias.
- **Capacity** = ability to fit varied functions. Underfit (too simple) / overfit (memorises noise). **i.i.d.** assumption: train & test from the **same distribution** (violation = domain shift). 70/30 split; never leak test data; 100 % train accuracy = red flag.
- **PAC** (concept only, "don't sweat" the maths): $\mathbb{E}[\hat R(h)]=R(h)$ — empirical error is an unbiased estimate of generalization error; gives sample-size & error bounds at confidence $1-\delta$, accuracy $\epsilon$.

---

## W3 · Regression

- Core tension: minimise **empirical error** $\hat R(h)=\frac1m\sum L(h(x_i),y_i)$ but truly want **generalization error** $R(h)=\mathbb{E}_{x\sim\mathcal D}[L(h(x),f(x))]$. The gap = overfitting.
- **Linear regression:** minimise MSE; objective convex+differentiable → set $\nabla F=0$ → normal eqns $XX^TW=XY$, $W=(XX^T)^{-1}XY$; geometric = **orthogonal projection**. Big data → use **gradient descent** instead of inverting.
- Least squares = **low bias, high variance, no control of weight norm (no regularization) → overfits.** This is the disease the rest cures.
- **Bias–variance decomposition:** $\text{error}=\underbrace{\text{irreducible}}_{\text{noise}}+\text{bias}^2+\text{variance}$.
- **Ridge (L2):** $\min\ \lambda\|W\|^2+\|X^TW-Y\|^2$ → $W=(XX^T+\lambda I)^{-1}XY$. **Always invertible** (PSD + $\lambda I$). **Shrinks weights toward 0 but NOT to 0**; $\lambda\!\uparrow$ ⟹ bias↑, variance↓. *Salt-soup analogy:* keeps a little of every ingredient = shrinkage estimator.
- **Lasso (L1):** $\min\ \lambda\|w\|_1+\sum(\cdots)^2$. Goal is really **$L_0$** (count nonzero) but $L_0$ not optimisable → **$L_1$ = computable surrogate** → **sparse solution = automatic feature selection + interpretability** (zeros out useless features).
- **L1 vs L2 geometry:** L2 ball = **circle** (no corners → no zeros); L1 ball = **diamond** with corners **on the axes** → contour first touches a corner → some coords = 0 → sparsity.
- **Elastic Net:** $\lambda\|w\|_1+\beta\|W\|^2$ — ridge-shrink then lasso-zero; good when features grouped / solution spread over subspaces.

| | penalty | effect | sparse? |
|---|---|---|---|
| Linear | — | unconstrained | no |
| **Ridge** | $\lambda\|W\|^2$ | shrink, not zero | no |
| **Lasso** | $\lambda\|w\|_1$ | zero out useless | ✓ |
| **Elastic** | L1+L2 | shrink then zero | ✓ |

- **Data troubles:** non-representative (sampling **bias**/**noise** → train≠prod distribution), poor quality (outliers, missing → median **imputation**; Pima "heart-rate = 0"), irrelevant features (selection = Lasso, extraction = PCA/autoencoder). *Garbage in → garbage out.* **Ridge/Lasso interpretation is assignment-linked & exam-likely.**

---

## W4 · Classification · Kernels · SVM

- **Classification → category**, regression → value. Pipeline: **sensor → feature extractor → classifier → decision**; pattern = $p$-dim vector.
- **Fish story:** features must be **discriminative**; distribution **overlap = unavoidable error**; combine features → 2-D boundary; too many features → **curse of dimensionality** + overfitting; **Occam's razor** = simplest model that *still fits*.
- **Bayes decision (optimal if distributions known):**
  - **Min-error:** assign $x$ to max posterior; via Bayes ⟺ $p(x\mid\omega_j)P(\omega_j)$ largest; $P(\omega_i\mid x)=\frac{p(x\mid\omega_i)P(\omega_i)}{p(x)}$. **Likelihood ratio** $\frac{p(x\mid\omega_1)}{p(x\mid\omega_2)}\gtrless\frac{P(\omega_2)}{P(\omega_1)}$.
  - **Min-risk:** loss matrix $\lambda_{ji}$ (diagonal 0), conditional risk $l_i(x)=\sum_j\lambda_{ji}P(\omega_j\mid x)$, pick min-risk class. **Zero-one loss ⟹ min-risk = min-error** (special case).
- **Discriminant functions:** don't assume a distribution, learn the boundary directly. **Linear-machine decision regions are always CONVEX** → fail on non-convex-separable data → fix with **piecewise-linear** (multiple prototypes, take max).
- **★ Kernel methods (top exam point):** **kernel trick** $\kappa(x,z)=\langle\phi(x),\phi(z)\rangle$ computes a **high-dim inner product in the original space without ever knowing $\phi$** (Mercer). *"Look at the chair from another angle."* Any algorithm expressible with **only inner products** can be **kernelized** (kernel ridge, classification, kernel PCA). **RBF $\exp(-\gamma\|x-z\|^2)$ = default, most powerful.** Verify: $\phi(x)=(x_1^2,x_2^2,\sqrt2x_1x_2)\Rightarrow\kappa=\langle x,z\rangle^2$.
- **SVM:** maximise margin $\gamma=1/\|w\|$ ⟺ $\min\ \tfrac12\|w\|^2$ s.t. $y_i(\langle w,x_i\rangle+b)\ge1$. **Support vectors** = points on the $\pm1$ boundary (only they matter). **Dual contains only inner products** → swap in a kernel for nonlinearity. **Soft margin** (box constraint $0\le\alpha_i\le C$) tolerates noise/outliers; practice = **scale → RBF → cross-validate $C,\gamma$**.
- **Exam (W4):** no derivation; *explain* kernelization (turning nonlinear into linear), not memorise formulas.

---

## W5 · Neural networks (Deep Learning I)

- **★ One-liner: a neural network is a universal function approximator.** Big enough → approximates almost any function; question is only *how well*.
- **Neuron** = weighted sum + bias + activation: $y_k=\phi\!\big(\sum_j\omega_{kj}x_j\big)$ (bias absorbed as $x_0\!=\!1$). **Remove the activation → it's just linear regression; nonlinearity is the source of all power.**
- **Activations:** threshold (not differentiable, dead), **logistic/sigmoid** $\frac{1}{1+e^{-av}}$ (differentiable), **ReLU** $\max(0,v)$ (deep-net workhorse, eases vanishing gradient), **softmax** $\frac{e^{v_k}}{\sum e^{v_j}}$ (multi-class output = probability distribution). **Good activation = nonlinear + nice derivative + bounded.**
- **Architectures:** single-layer / multilayer feedforward (MLP) / recurrent. **Deeper → more abstract hierarchical features** (edges→parts→objects) → supports **transfer learning** (freeze the generic backbone, retrain the specialised head). **Choosing an architecture = injecting an inductive bias.**
- **Gradient descent** $x'=x-\epsilon\nabla f(x)$ (blind-man-downhill / ball rolling; steepest descent, Cauchy 1847). $\nabla f$ = vector of partials; fastest descent = $-\nabla f$.
- **Perceptron:** hyperplane $\sum\omega_ix_i+b=0$; **only linearly separable** (XOR fails) → motivates multilayer.
- **Back-propagation = gradient descent on an MLP**, two passes (**forward** compute output, **backward** propagate error), solving the **credit-assignment problem** via the chain rule. Local gradient $\delta_j=e_j\phi'(v_j)$ (output) or $\delta_j=\phi'(v_j)\sum_k\delta_k\omega_{kj}$ (hidden, "borrow blame downstream"); update $\Delta\omega_{ji}=\eta\,\delta_j\,y_i$.
- **Optimizers:** SGD → **Momentum** (inertia) → **NAG** (look-ahead) → **AdaGrad** (per-dim adaptive LR, but dies) → **RMSProp** (fixes dying via moving avg) → **Adam** (momentum + adaptive, default).
- **Exam (W5):** read each symbol; explain the two passes + credit assignment + why output vs hidden updates differ; can **hand-calc a single neuron** and a **1-D GD step** — *not* recite the derivation.

---

## W6 · CNNs (Deep Learning II)

- FC on images → **parameter explosion**. **CNN = MLP + 2 priors: ① local connectivity (receptive field) ② weight sharing.** For **grid-like** data (1-D series, 2-D images). At least one layer uses **convolution** instead of matrix multiply.
- **Convolution:** a small **filter (= prototype detector)** slides over input, doing **multiply-and-sum (a similarity score)** → a **feature map**. **#feature maps = #filters.** ML actually runs **cross-correlation** (no kernel flip) but still calls it convolution (filter is learned, so flipping is irrelevant).
- **Output size** $=\big\lfloor\frac{W-F+2P}{S}\big\rfloor+1$ ($W$ input, $F$ filter, $P$ padding, $S$ stride). **★ memorise this** — a likely calculation question.
- **3 benefits:** ① **sparse interactions** (fewer params; deep layers still cover a large effective receptive field) ② **parameter sharing** ③ **equivariance to translation** (input moves → output moves the same; signal-processing LTI).
- **★ Trap (high-freq):** **equivariant (convolution, position moves with it) ≠ invariant (pooling, small shifts absorbed).** *Conv finds; pool tolerates.*
- **Pooling** (max/avg/L2) = replace a neighbourhood by a **summary statistic** → compress + downsample + **approximate invariance to small translations** (a strong prior).
- **Architecture, one keyword each:** **LeNet-5** (1998, first practical CNN, MNIST) → **AlexNet** (2012 ignition: **ReLU + Dropout + data augmentation**) → **GoogLeNet** (2014: **Inception module** + **1×1 conv**, ~1/10 of AlexNet's params) → **ResNet** (2015: **skip connection / residual** $F(x)=H(x)-x$, fixes the **degradation** problem so very deep nets train). **SAME** padding (zeros, output≈in/stride, lets branches concat) vs **VALID** (no pad).
- **Exam (W6):** the 3 benefits; equivariance vs invariance; conv vs cross-correlation; each architecture's signature contribution; compute a layer's output size. Image = **tensor** (batch of colour images = 4-D: N×H×W×C).

---

## W7 · Recurrent neural networks

- **Sequence/time-series** data has a time/order dimension (vs an image "snapshot"). Slow natural evolution → predictable ($x_t\approx x_{t-1}+\text{noise}$).
- **RNN core:** a **hidden state $h$ = memory**, **same cell reused every step** (★ **parameter sharing across time** — handles any length, basis of BPTT). $h_t=f_W(h_{t-1},x_t),\ y_t=f_{W_o}(h_t)$. **Vanilla/Elman:** $h_t=\tanh(W_{hh}h_{t-1}+W_{xh}x_t)$. **$\tanh$ because it saturates** → curbs value explosion.
- **5 I/O shapes:** one-to-one; **one-to-many** (image captioning); **many-to-one** (sentiment/action); **many-to-many aligned** (per-frame label); **seq2seq** (translation = **encoder many-to-one + decoder one-to-many**).
- **BPTT** = forward + backprop through all unrolled time steps. **Long sequence → gradient explodes (instability) or vanishes (forgets early input = loses long-term dependency,** "bank" = river vs money**).**
  - Fix explode: input scaling, $\tanh$, smaller LR, layer norm, (gradient clipping). Fix forget: **LSTM/GRU**.
- **LSTM:** long-term state **$c_t$ = memory conveyor** + 3 **σ gates** (forget/input/output, $\sigma\in[0,1]$ = valve) + $\tanh$ candidate $g$. Update $c_t=f_t\!\otimes\! c_{t-1}+i_t\!\otimes\! g_t$ ("keep some old, add some new"); $h_t=o_t\!\otimes\!\tanh(c_t)$.
- **GRU:** **2 gates** (reset/update), **single state $h$**, lighter, similar performance. $h_t=z_t\!\otimes\! h_{t-1}+(1-z_t)\!\otimes\! g_t$ (one gate does keep-old + take-new).
- Limit: still struggles past **~100 steps** → **Transformer**.
- **★ Exam (W7):** **do NOT recite LSTM/GRU formulas**; **describe** how they work (gates, what each manages, store/forget/read), RNN's problems, and **why RNN's limits motivate the Transformer**. Put the formulas on your A4.

---

## W8 · Regularization

- **★ Definition (Kukačka umbrella):** *any technique aimed at making a model generalize better.* A **class of purposes**, not one formula.
- **Generalization** (unseen, **same-distribution**) vs **overfitting** (over-parameterised net + too little data = memorise). The "same distribution" premise can't be dropped.
- **★★ Named exam point (lecturer said twice):** *Regularization ↔ Generalization relation.* **Generalization = the goal; regularization = the means** — constrain model/data/optimization to suppress memorising training noise, shrinking the train-vs-unseen gap. **Be ready to write 3–4 lines.**
- **Formalised:** $w^*=\arg\min_w\ \frac1{|D|}\sum\big(\underbrace{\mathcal E(f_w(x),t)}_{\text{fidelity}}+\underbrace{R}_{\text{reg term}}\big)$; expected risk approximated by empirical risk; $\lambda$ = knob. **Intuition: regularization shrinks the search space** ("find the person *in a blue shirt*"); **optimization still does the search.**
- **5 elements determining $w^*$ = 5 regularization entry points:**

| Entry | Levers |
|---|---|
| **① Data** | feature extraction (PCA removes **redundant** features), **augmentation** (cover the distribution), add noise $\tau_\theta(x)=x+\theta$ |
| **② Architecture** | choosing it = **inductive bias**; **weight sharing** (conv → shift-equivariance + locality); activation: **ReLU** (vanishing-grad), **Dropout** |
| **③ Error fn** | MSE (regression), cross-entropy (classification), **Dice** $\frac{2|X\cap Y|}{|X|+|Y|}$ (segmentation, **combats imbalance**) |
| **④ Reg term** | **weight decay** $\frac12\lambda\|w\|_2^2$ (L2/ridge), L1/Lasso (sparse), elastic net; **smoothness** $\|J_{f_w}(x)\|_F^2$ (input near→output near) |
| **⑤ Optimization** | init (keep activation var≈1, **pre-train** GPT then freeze generic layers), update (momentum, LR **annealing**), **termination = early stopping** (validation, `patience`) |

- ⚠️ **Dropout = randomly *zeroing activations*** (≈ ensemble of sub-nets, geometric mean), **not** "freezing weights" (the lecturer's loose phrasing — use the precise version).
- **Exam (W8):** interpret equations not derive ($\arg\min$, expected risk, weight decay, SGD, Dice, Frobenius); reg↔gen is a near-guaranteed question; *tell the story* (blue shirt / basketball / alphabet / airport face-scan); **assignment-linked** = Ridge, Dropout, RAG.

---

## W9 · Text processing & Transformer

- Any signal → **numbers**. Pipeline: **standardization → tokenization → vectorization.** Token granularity: word / n-gram / char / **subword** (BPE, modern default).
- **One-hot:** sparse, **no semantics** (all words orthogonal → cat≈dog same as cat≈democracy).
- **Word embedding:** dense **geometric** space, semantically near → vector near; **$king+woman-man\approx queen$.** From joint learning or pretrained (Word2vec/GloVe/**BERT**/**GPT**).
- **Static-embedding limit:** one word = one fixed vector → can't disambiguate **"station"** (train/radio/space). Need a **context-aware** representation → **attention**.
- **RNN encoder-decoder NMT:** input **reversed**, target **shifted + `<SOS>`**, supervised. **3 weaknesses + fixes:** unidirectional/causal (can't see future) → **bidirectional RNN** (the "queen" disambiguation); huge-vocab softmax → **sampled softmax**; early mistake unfixable → **beam search** (keep $k$ best, $k$ = beam width, costly).
- **★ Attention core formula (MUST write & read):**
$$\text{Attention}(Q,K,V)=\text{softmax}\!\Big(\tfrac{QK^{\!\top}}{\sqrt{d_k}}\Big)V$$
  **Differentiable dictionary lookup:** **Query** = what I'm looking for; **Key** = what each item is matched against; **Value** = info returned. $QK^{\!\top}$ = pairwise relevance; **$/\sqrt{d_k}$ = temperature** (controls sharpness — too big → uniform weights → "not attending"); softmax → weights; $\times V$ → weighted sum. **Self-attention:** $Q,K,V$ all from one sequence ($Q=XW^Q$ etc.); each token absorbs related tokens' info (station → "train station").
- **Alignment scores:** dot $h^Ty$ / general $h^TWy$ / concat; **additive (Bahdanau) vs multiplicative (Luong).**
- **Transformer** ("Attention Is All You Need"): drop RNN/conv, **attention only.** **Components (★ take-home):** self-attention + **positional encoding** (sin/cos, restores order — *dog bites man ≠ man bites dog*) + **multi-head** (parallel subspaces) + **residual + layer norm** + **feed-forward**.
- **Families:** **encoder-only = BERT** (understand/classify), **decoder-only = GPT** (autoregressive generate, causal mask), **encoder-decoder** (translate/summarise). Masks: padding, causal.
- **★ Take-home (lecturer: "remember this"):** *A Transformer does not merely store word meanings; it dynamically constructs meaning from context.*
- **RAG** (Assignment-linked): doc → chunk → embed → vector index; query embedded, retrieve context, constrain generation onto evidence.
- **Exam (W9):** write/interpret the attention formula & Q/K/V; why static embedding is insufficient (station); Transformer's components; the take-home line.

---

## W10 · Representation learning (★ scenario-selection = the core exam type)

- *"It's all about representation."* Good representation = **discriminative (unique)** + **generative**. **Three-question framework for every method: ① what is the representation · ② why useful · ③ how learned (= its loss function).**

| Method | encoder? | probabilistic? | generate? | loss | strength |
|---|---|---|---|---|---|
| **PCA** | linear | ✗ | ✗ | max variance | linear, interpretable baseline |
| **AE** | ✓ det. | ✗ | ✗ | $\|x-\hat x\|^2$ | compress, **anomaly detection** |
| **VAE** | ✓ prob. | ✓ | ✓ | ELBO (recon + KL) | structured latent, generate |
| **β-VAE** | ✓ prob. | ✓ | ✓ | recon $-\beta$KL | **disentangle**, controllable |
| **GAN** | ✗ (noise) | implicit | ✓ | minimax | **sharp/realistic** images |
| **Diffusion** | ✗ | ✓ | ✓ | $\|\epsilon-\epsilon_\theta\|^2$ | **high-fidelity + stable** (slow) |
| **SSL** | ✓ | — | ✗ | contrastive/InfoNCE | **label-efficient**, transferable |

- **PCA:** top-$k$ covariance eigenvectors, max variance, **Karhunen–Loève optimal** linear representation; nonlinear → KPCA.
- **Autoencoder:** encoder → **bottleneck** → decoder; recon loss $\|x-\hat x\|^2$ (square = penalise large errors); bottleneck forces the **essence**. **★ Anomaly detection: train on *normal data only* → anomaly → high reconstruction error → threshold** (sidesteps class imbalance — no failure samples needed). **AE ≈ nonlinear PCA.**
- **VAE:** encoder outputs a **distribution** $(\mu,\sigma)$ → can **generate**. **ELBO = reconstruction $-$ KL$(q\|p)$**; KL (a "distance" between distributions) shapes the latent toward $\mathcal N(0,I)$ — **"4 minus X": maximise ELBO ⟹ minimise KL.** **Reparameterization** $z=\mu+\sigma\odot\epsilon$ makes sampling differentiable. AE = deterministic + only reconstruct; VAE = probabilistic + generate.
- **β-VAE:** weight KL by **$\beta>1$** → **disentanglement** (each latent dim = one independent, human factor; face editing). **Trade-off: better disentangle ⟹ lower reconstruction fidelity (blurrier).**
- **GAN:** **generator (forges)** vs **discriminator (detects)**, $\min_G\max_D\ \mathbb{E}[\log D(x)]+\mathbb{E}[\log(1-D(G(z)))]$; at equilibrium $D$ guesses 50/50, $G$ has learned the distribution. **Sharp/realistic but training unstable → mode collapse** (EEG example). Metrics: **FID** (lower better), **IS** (higher better).
- **Diffusion (DDPM):** **forward fixed noising + reverse learned denoising** (two Markov chains). Train target = **predict the noise** $\|\epsilon-\epsilon_\theta(x_t,t)\|^2$ → **turns generation into supervised denoising** (hence stable). *"If noise can be predicted, it can be removed."* High-fidelity, slow sampling; engine of **Stable Diffusion / DALL·E 2**.
- **SSL:** learn from **unlabeled** data via a **pretext task**; **contrastive / InfoNCE** pulls two augmentations of the same sample together, pushes others apart (fist / friend's-back intuition; $\tau$ = temperature, cosine sim). Produces a **transferable pretrained backbone** (medical imaging: SSL-pretrain → fine-tune on small labeled set).
- **★ Decision rules (the exam):** compress/anomaly → **AE**; structured generation → **VAE**; controllable/disentangle → **β-VAE**; sharp images → **GAN**; highest fidelity → **Diffusion**; label-efficient features → **SSL**. **Per method know: representation · loss · assumptions/trade-offs · application · vs neighbours.**
- **Exam (W10):** master types = ① scenario → choose model + justify + risks (e.g. *why AE not supervised for QC; why GAN vs Diffusion*); ② interpret a loss term (KL, $\beta$). Cross-week Ridge-vs-Lasso example (read $w_1\!=\!0,w_3\!=\!1.5$ → "feature 1 useless, feature 3 most important").

---

## W11 · Graph neural networks

- **Relational data** (social/molecule/citation): **structure itself is the signal.** Graph $G=(V,E)$; **only connections matter — where you draw a node is irrelevant** (basis of permutation symmetry).
- **Matrices:** **adjacency $A$** (who connects, symmetric for undirected), **degree $D$**, **Laplacian $L=D-A$**; GNN input = $(A,X,E_{\text{feat}})$. $A$ = where info can flow, $X$ = what each node carries.
- **Can't use MLP** (no node order). Need **permutation equivariance** (node-level: relabel → outputs relabel) & **invariance** (graph-level: relabel → same output); **order-independent aggregation (sum/mean/max) guarantees both.**
- **★ Message passing (the heart):** each **layer = one round** on the **same graph**; only node embeddings change $H^{(0)}\!\to\!H^{(1)}\!\to\!\cdots$. Per node: **aggregate neighbours (order-invariant) → transform → update with self.** **One layer = 1 hop; $L$ layers = receptive field of $L$ hops.** **Must keep self** (self-loop $\tilde A=A+I$) or a node loses its identity. (GNN "layer" ≠ stacked new units — common trap.)
- **GCN:** add self-loop $\tilde A=A+I$ → **symmetric-normalise** $\hat A=\tilde D^{-1/2}\tilde A\tilde D^{-1/2}$ (stops high-degree nodes dominating) →
$$H^{(\ell+1)}=\sigma\!\big(\hat A\,H^{(\ell)}\,W^{(\ell)}\big)$$
  **= normalised neighbour aggregation + shared transform + nonlinearity.** Read as: $H^{(\ell)}W^{(\ell)}$ = learnable **transform**, left-multiply $\hat A$ = **mix neighbours**. Classic use = **semi-supervised node classification** (propagate labels known→unknown through edges).
- **Tasks:** **node classification** $y_i=f(h_i)$, **link prediction** $p_{ij}=f(h_i,h_j)$, **graph classification** $y_G=f(h_G)$ (**readout** must be permutation-invariant). **Transductive** (same graph, masked labels) vs **inductive** (new nodes/graphs = generalization).
- **Family:** **GCN** (normalised sum) · **GraphSAGE** (sample + aggregate, inductive, scalable) · **GAT** (attention-weighted neighbours, learns who matters) · **GIN** (sum + MLP, strong graph discrimination) · **R-GCN** (per-relation, KGs) · **Graph Transformer** (global attention, long-range).
- **★ 3 failure modes (named exam point):** **oversmoothing** (too deep → all node reps become similar → why GNNs stay shallow); **oversquashing** (fixed-size embedding can't push too much far-away info through a bottleneck); **heterophily** (connected nodes have *different* labels → naïve smoothing *hurts*).
- Use a GNN because **relations are core**, not because "the data looks like a graph."
- **Exam (W11):** no derivation — interpret the equation (*what does $\hat A$ do · what changes if you alter a term · why designed so*); on your A4 write **concept explanations, not formulas**; answer in proper ML language.
