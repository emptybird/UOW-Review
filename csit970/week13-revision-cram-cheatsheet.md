# CSIT970 Final Exam Cram Cheat Sheet (All Weeks)

<style>
.k{color:#c0181d;font-weight:600}
.s{color:#1452cc;font-weight:600}
.q{color:#8312a8;font-weight:600}
.lg{font-size:.92em}
table{font-size:.95em}
</style>

<span class="lg">**Colour key**: <span class="k">red = key term (must appear in your answer)</span> · <span class="s">blue = sequence / model steps (memorise in order)</span> · <span class="q">purple = sample / workshop question (self-test)</span></span>

**Exam**: 16 Jun 9:00–12:00 · 3h · closed book · Proctorio · <span class="k">26 Q = 11 MCQ (11 marks) + 15 SAQ (39 marks) = 50</span> · <span class="k">must score ≥40% (20 marks) or technical fail</span> · MCQ single-answer, random per student · SAQ mostly 2 marks, scenario Q 4–5 marks (A/B/C parts) · hit the keywords, bullets OK, no copy-paste · **covers workshop Qs too**. No Wk6/Wk8.

---

## Wk1 · Analysis Framework & Security Concepts

<span class="q">Q: privacy vs confidentiality? (not crypto)</span> <span class="k">privacy</span> = secrecy for the **individual's** benefit = a right/control (extends to family, **not** legal person); <span class="k">confidentiality</span> = secrecy for the **organisation's** benefit = a **duty** to protect others' secrets; <span class="k">secrecy</span> = the mechanism's effect. Hospital: patient *has* privacy, staff *owe* confidentiality.

<span class="q">Q: trusted vs trustworthy? Can a system be trusted but not trustworthy?</span> <span class="k">trusted</span> = its failure **would break the security policy** (we've leaned on it); <span class="k">trustworthy</span> = **won't fail** (actually reliable). **Trusted but not trustworthy = most dangerous** (e.g. an intelligence officer entrusted with secrets who plans to defect).

<span class="q">Q: principal vs role? Give an example.</span> <span class="k">principal</span> = **any entity** in the system (person/device/channel/<span class="k">crypto key</span>/group — widest); <span class="k">role</span> = a function **held by different people in turn** (Tutor / society president).

**Also**: <span class="k">PMAI</span> framework = <span class="s">Policy→Mechanism→Assurance→Incentive</span>, **≠ CIA** (common trap). <span class="k">authenticity</span> = integrity + genuineness; integrity is verifiable by anyone (hash), authenticity needs a **key** (HMAC/signature). Spec chain <span class="s">security policy→security target→protection profile</span>.

## Wk2 · Cyber Threats

<span class="q">Q: dropper mechanism of virus/Trojan?</span> <span class="k">dropper</span> = first stage of staged delivery, **carries and releases** the next-stage payload itself; vs <span class="k">downloader</span> = fetches it from the internet, vs <span class="k">payload</span> = does the actual work; <span class="k">Trojan</span> = disguise as legit software. **Dropper carries · downloader fetches · payload acts.**

<span class="q">Q: what is a botnet, how used in cybercrime?</span> <span class="k">botnet</span> = network of compromised devices (incl. IoT) controlled remotely via <span class="k">C2 (command-and-control)</span>. <span class="s">Lifecycle: infection→C2→uses</span>. Uses: <span class="k">DDoS</span>/spam-phishing/credential theft/**anonymising proxy for crime**/cryptomining. Hard to kill: Conficker (<span class="k">DGA</span>), Mirai (IoT default passwords).

<span class="q">Q: ransomware vs hacktivism (objective/method/target)?</span>

| | <span class="k">Ransomware</span> | <span class="k">Hacktivism</span> |
|---|---|---|
|Objective|**financial** (extort)|**political/ideological**|
|Method|encrypt + threaten leak (<span class="k">double extortion</span>), <span class="k">RaaS</span>|<span class="k">DoS</span>/<span class="k">defacement</span>/<span class="k">hack-and-leak</span>/<span class="k">doxxing</span>|
|Target|public sector, **healthcare**|**government**/public-facing orgs|

<span class="q">Q: role of mass surveillance — why both protective and a privacy threat?</span> Dual-use: **protective** = intelligence/counter-terror/crime tracking (with <span class="k">XKeyScore</span>); **threat** = backbone collection (<span class="k">PRISM/Tempora/Muscular</span>) + weakening crypto (<span class="k">Bullrun</span>/Dual_EC_DRBG) + <span class="k">mercenary spyware</span>. Crypto-currency is <span class="k">pseudonymous ≠ anonymous</span> (traceable).

## Wk3 · Cryptography

<span class="q">Q: symmetric vs asymmetric + one example each?</span> <span class="k">symmetric</span> = **same shared secret key** (must pre-share, fast; e.g. <span class="k">AES</span>); <span class="k">asymmetric</span> = **key pair** (public encrypts / private decrypts, no pre-share, solves <span class="k">key distribution</span>, slow; e.g. <span class="k">RSA</span>).

<span class="q">Q: what is a side-channel attack + one example?</span> Attacks the **implementation's physical leakage**, not the algorithm (<span class="k">timing/power/EM/sound</span>), it's <span class="k">passive</span>. E.g. RSA decryption <span class="k">power analysis</span> — <span class="s">square-and-multiply</span>, a key-bit = 1 draws extra power → **read the private key bit-by-bit**.

**Must know**: <span class="k">hash</span> (integrity) → <span class="k">MAC</span> (+authentication, shared key) → <span class="k">digital signature</span> (+<span class="k">non-repudiation</span>, **sign with private / verify with public**). <span class="k">PKI/CA</span> binds identity↔public key, defeats <span class="k">MITM</span>. RSA security = **integer factorisation**; quantum threat <span class="k">Shor's algorithm</span> → <span class="k">post-quantum</span>. MD5/SHA-1 broken. Key strength = real **entropy**, not output length.

## Wk4 · Network Attack & Defence

<span class="q">Q: disadvantage of DoH?</span> Encrypting DNS boosts privacy but **reduces network visibility** → defenders can't easily monitor/filter malware or <span class="k">C2</span> domains, or spot DNS hijacking.

<span class="q">Q: how can attackers exploit BGP?</span> <span class="k">BGP</span> is built on trust with no strong validation → <span class="k">BGP hijacking</span>: falsely advertise an <span class="k">IP prefix</span> you don't own → bogus route spreads → traffic redirected (fake-site phishing / <span class="k">blackholing</span> DoS / eavesdropping). Defence <span class="k">RPKI + ROA</span> (signatures).

<span class="q">Q: what problem does DNSSEC solve, how?</span> DNS records can be forged (<span class="k">cache poisoning</span>/pharming) → add **digital signatures** to records → <span class="k">integrity + authenticity</span> (**no confidentiality, no DDoS protection**, can even enable amplification).

<span class="q">Q: role of NAT in security, why not a true security mechanism?</span> <span class="k">NAT</span> = many devices share one public IP (to fight IPv4 exhaustion). **Not a security control**: no encryption/authentication; it actually makes <span class="k">attribution</span> harder (logs show only the shared IP).

<span class="q">Q: how does a VPN/IPsec ensure confidentiality & integrity?</span> <span class="k">IP-layer tunnel</span>; <span class="k">IKE</span> (/<span class="k">Diffie–Hellman</span>) sets up the shared key + <span class="k">SA</span>; **encryption → confidentiality**, **authentication → integrity/authenticity**.

**Contrasts**: <span class="k">DNS hijack</span> edits the address-book (→I) vs <span class="k">BGP hijack</span> edits the road-map (→A); DDoS→A. <span class="k">TLS</span> = <span class="s">handshake (authenticate + DH key) → record (symmetric encryption)</span>. <span class="k">DKIM</span> = sign with the sender domain's DNS public key.

## Wk5 · Usability

<span class="q">Q: what does generating passwords from mnemonic phrases mean?</span> Pick a memorable, hard-to-guess sentence → take **first letters of each word** + digits/case → looks random yet memorable (<span class="k">passphrase</span>, Yan 2004).

<span class="q">Q: what is the bystander effect, how does it affect security behaviour?</span> <span class="k">bystander effect</span> = <span class="k">diffusion of responsibility</span> → everyone assumes someone else will report → **no one reports** (Kitty Genovese). Fix: assign clear reporting responsibility + easy channels.

<span class="q">Q: what is social engineering, why often more successful than technical attacks?</span> <span class="k">social engineering</span> = **psychological manipulation of people (not tech)**. More successful because it **bypasses technical controls** + exploits <span class="k">Cialdini's principles</span> (authority/scarcity…) + our anti-deception instincts evolved for face-to-face (fail on email).

<span class="q">Q: how does poor personal OPSEC lead to org breaches?</span> Social-media exposure → guess security questions / craft <span class="k">spear-phishing</span>; **password reuse**; insecure <span class="k">BYOD</span>. Need a <span class="k">culture of compliance</span>.

<span class="q">Q: common weaknesses in password recovery?</span> <span class="k">security questions</span> (guessable) / <span class="k">email recovery</span> (single point of failure) / <span class="k">SMS</span> (<span class="k">SIM swap</span>) + help-desk social engineering. **Recovery = the weakest link.**

<span class="q">Q: security risk of a password manager?</span> All passwords behind one <span class="k">master password</span> = **single point of failure** (phished → all stolen); but **don't block them** (users pick weaker passwords otherwise).

**Also**: three <span class="k">human errors</span> = <span class="s">slips/lapses · mistakes · misconceptions</span>; store <span class="k">hash + salt</span> (≠ encryption); <span class="k">CAPTCHA</span> = a hard AI problem (beaten by AI + fairness flaws).

## Wk7 · Cybersecurity Standards

<span class="q">Q: purpose of data classification + common levels?</span> Classify by <span class="k">sensitivity</span> to **decide how strong a control is needed** (not everything needs equal protection — saves cost). <span class="s">Public→Internal→Confidential→Restricted</span> (Restricted must be encrypted).

<span class="q">Q: five core functions of NIST CSF?</span> <span class="s">Identify→Protect→Detect→Respond→Recover</span> (**security is not just prevention**).

<span class="q">Q: essential steps of the risk management process?</span> <span class="s">Identify→Analyze→Evaluate (risk assessment)→Treat→Monitor&Review</span> = a **continuous cycle** (not one-off).

**Must know**: <span class="k">Essential Eight</span>, three groups = stop malicious code (application control / Office macros / user app hardening) + limit attackers (restrict admin / <span class="k">MFA</span>) + reduce exposure & recover (patch apps / patch OS / backups); <span class="k">maturity 0–3</span>. <span class="k">ISO27001</span> = standard for an <span class="k">ISMS</span>, goal <span class="k">CIA</span> + risk-based + continuous improvement. <span class="k">need-to-know</span>; MFA factors <span class="s">know/have/are</span>; policy/control/standard/framework.

## Wk9 · Privacy

<span class="q">Q: do the MPC calculation (as in assignment/class)</span> <span class="k">additive secret sharing</span>, **no TTP**, average salary (70/60/80):
<span class="s">① each splits value into 3 random shares (sum = true value, may be negative)</span> → <span class="s">② keep one, send the other two</span> → <span class="s">③ each publishes the sum of shares it holds</span> → <span class="s">④ add the three sums ÷ count</span>.
E.g. published sums **100/85/25** → (100+85+25)/3 = **210/3 = 70K** ✓. **MPC ≠ zero leakage** (you learn "who's higher/lower", not exact values). Age version is identical (25/30/35→30).

<span class="q">Q: how does HE keep data private on clouds/ML?</span> <span class="k">Homomorphic Encryption</span> = **compute on ciphertext**, $E(M_1{+}M_2)=E(M_1){+}E(M_2)$; <span class="s">encrypt locally → send to cloud → cloud computes on ciphertext (never decrypts) → returns ciphertext → decrypt locally</span>. **Both input AND result stay encrypted**; downside: slow.

<span class="q">Q: what is Differential Privacy, how does it protect individuals?</span> <span class="k">DP</span> defeats a <span class="k">differential attack</span> (adding/removing one person changes the output and leaks their presence) by **adding noise** (scale = 1/ε): $\Pr[M(D)\in S]\le e^{\varepsilon}\Pr[M(D')\in S]$ (D, D' differ by one record). <span class="k">smaller ε → more noise → more privacy, less accuracy</span> (privacy–accuracy trade-off).

<span class="q">Q: concept of SMPC, how it enables private collaboration?</span> <span class="k">SMPC</span>: parties compute $z=f(x_1..x_n)$ and **learn only the output z**; f is public, **no TTP**, via <span class="k">secret sharing</span>. E.g. hospitals computing joint stats; <span class="k">Federated Learning</span> with <span class="k">secure aggregation</span>.

<span class="q">Q: why is ML important for security, supervised vs unsupervised?</span> ML auto-learns patterns to detect threats (malware classification/intrusion/phishing) and adapt to new attacks. <span class="k">supervised</span> = **labelled** → classify known threats; <span class="k">unsupervised</span> = **unlabelled** → <span class="k">anomaly detection</span>, finds <span class="k">zero-day</span> (higher false positives).

<span class="q">Q: privacy concerns of location tracking + mitigations?</span> Builds a <span class="k">profiling</span> picture; <span class="k">location trading</span>. Mitigate: <span class="k">data minimisation</span>/coarsening/<span class="k">anonymisation</span>+DP/<span class="k">consent</span>/timely deletion.

<span class="q">Q: GDPR's data minimisation?</span> Collect only the **minimum personal data necessary** for the purpose (adequate/relevant/limited) → less breach exposure.

<span class="q">Q: purpose of the APPs + name three?</span> <span class="k">Australian Privacy Act 1988</span>, <span class="k">13 APPs</span>, <span class="k">principle-based + technology neutral</span>. E.g. **APP1** transparent management / **APP6** use & disclosure / **APP11** security.

<span class="q">Q: GDPR's purpose limitation?</span> State a **specified, explicit, legitimate purpose** at collection; no incompatible further use → prevents <span class="k">scope creep</span>.

<span class="q">Q: significance of accountability under GDPR + how to demonstrate compliance?</span> Not only comply but **be able to demonstrate it**: records of processing (>250 staff must document) / appoint a <span class="k">DPO</span> / training & review. Fines <span class="k">€10M/2% or €20M/4%</span>.

**Must know — GDPR 7 principles**: <span class="s">lawfulness-fairness-transparency · purpose limitation · data minimisation · accuracy · storage limitation · integrity&confidentiality · accountability</span>. <span class="k">Controller</span> (sets purpose) vs <span class="k">Processor</span> (acts on instructions); <span class="k">SAR</span> answered within one month.

**Three privacy techniques (memorise)**

| | Principle | Protects | Use case |
|---|---|---|---|
|<span class="k">SMPC</span>|split shares, learn only output|each party's **input**|joint computation, result is **plaintext** |
|<span class="k">HE</span>|compute on ciphertext|**input + result**|**outsource to cloud** |
|<span class="k">DP</span>|add noise|**individual privacy**|**publish statistics** |

## Wk10 · Cloud & Edge

<span class="q">Q: key characteristics that define cloud computing?</span> <span class="k">shared pool of resources</span> · over internet · <span class="k">on-demand (elasticity)</span> · <span class="k">measured/pay-as-you-go</span> · cost-effective. (elasticity ≠ resource multiplexing)

<span class="q">Q: public vs private vs hybrid?</span>

| | Public | Private | Hybrid |
|---|---|---|---|
|Users|public|single org|mix|
|Owner|**third party**|the org|public+private|
|Trait|low cost/scalable|control/more secure|<span class="k">portability</span> (hospital) |

<span class="q">Q: IaaS/PaaS/SaaS + an example each?</span> Control spectrum (how far the user manages): <span class="k">IaaS</span> = manage the OS (<span class="k">EC2</span>) · <span class="k">PaaS</span> = manage code (<span class="k">App Engine</span>) · <span class="k">SaaS</span> = manage only data (<span class="k">Gmail</span>).

<span class="q">Q: motivation behind edge computing + how it complements cloud?</span> Data centres are **too far → latency** (light travels ~300km in 1ms) → <span class="k">edge node</span> processes nearby; <span class="s">latency-sensitive handled at edge / low-priority sent to cloud for deep analysis</span>.

<span class="q">Q: common edge security risks + best practices?</span> Risks: **weak physical security** / default-weak passwords / expanded <span class="k">IT perimeter</span> / local credentials reach back to the data centre. Practice: **treat the edge like a public cloud = <span class="k">zero trust</span>** + strong auth + encryption + monitoring.

## Wk11 · TPM/Enclave/CPS/SCADA

<span class="q">Q: why is SCADA security critical + common threats?</span> <span class="k">SCADA</span> controls industrial processes (power/water), two tiers = management + <span class="k">PLC</span>; a breach causes **physical disaster** (blackout/no water). Threats: <span class="s">hackers/malware/terrorists/insiders</span>. <span class="k">Stuxnet</span> = damaged Iran's nuclear centrifuges (Siemens PLC).

<span class="q">Q: purpose of Secure Enclave, how it protects data?</span> A <span class="k">TEE</span> implementation, isolated region inside the main processor (OS can't see it) → <span class="k">confidentiality + integrity</span>: hardware isolation + memory encryption + <span class="k">UID</span> (per-device, never leaves chip) + <span class="k">attestation</span> = <span class="k">confidential computing</span> (protects data **in use**).

<span class="q">Q: main differences between CPS and IoT?</span>

| | IoT | CPS |
|---|---|---|
|Core|<span class="k">interconnection</span>|<span class="k">real-time control</span>|
|Nature|connect many devices|self-contained system (car/drone)|
|Arch|horizontal|vertical|
|Connectivity|core goal|important, not mandatory|

<span class="q">Q: what is a TPM, how does it enhance hardware security?</span> <span class="k">TPM</span> = on-board security chip storing keys/certs/passwords; <span class="k">hardware-based crypto</span> (key never leaves chip) + <span class="k">measured boot</span> (config altered → refuse to release key = <span class="k">attestation</span>). TPM 2.0 = <span class="s">RSA + SHA256 + HMAC</span>; use case <span class="k">BitLocker</span>.

**Core distinction**: <span class="k">authentication</span> (who are you) vs <span class="k">attestation</span> (are you trustworthy now / config unaltered). Data states <span class="s">at rest / in transit / in use</span>.

## Wk12 · InfoWar/Cyberweapon/CCI/APT

<span class="q">Q: what is information warfare, how do attacks on critical infra fit in?</span> <span class="k">Denning</span> (broad: incl. propaganda/espionage/electronic warfare) vs <span class="k">Waltz</span> (military: <span class="k">protection + denial</span>). Hitting <span class="k">critical infrastructure</span> (power) = mass disruption without firing a shot, a <span class="k">prelude to war</span> (cyber-physical convergence).

<span class="q">Q: define a cyberweapon, how it differs from malware?</span> Watershed = <span class="k">selectivity</span>:

| | <span class="k">Cyberweapon</span> | <span class="k">Malware</span> |
|---|---|---|
|Selectivity|**high** (targeted)|low (broad)|
|Actor|state/non-state|criminals|
|Motive|strategic (military/political)|profit|
|Example|Stuxnet/NotPetya|botnet|

Four dangers: hard to trace / <span class="k">zero-day</span> dormancy / <span class="k">cost asymmetry</span> / captured & reused (<span class="k">EternalBlue</span>).

<span class="q">Q: what is an APT + common motivations?</span> <span class="k">APT</span> = high expertise + significant resources + multiple vectors, builds a <span class="k">foothold</span> and persists (<span class="k">state-sponsored</span> / persistence / stealth). <span class="s">6 stages: Recon→Delivery→Initial intrusion→C2→Lateral movement→Exfiltration</span>. Motives = <span class="k">espionage</span> / <span class="k">sabotage</span> (not profit). E.g. Stuxnet (sabotage)/Duqu (recon)/Flame (espionage).

**CCI** = defensive in aim, offensive in method: defensive <span class="s">pen-testing→vulnerability assessment→threat intelligence→threat hunting</span>; offensive <span class="k">honeypots</span>/<span class="k">sockpuppets</span>.

---

## Cross-week distinctions (easy marks)

| Pair | Difference |
|---|---|
|<span class="k">secrecy/confidentiality/privacy</span>|effect / org duty / individual right|
|<span class="k">integrity/authenticity/non-repudiation</span>|unaltered / +really from them (key) / can't deny (signature)|
|<span class="k">trusted/trustworthy</span>|failure breaks policy / won't fail|
|<span class="k">symmetric/asymmetric</span>|same key (fast) / key pair (solves distribution)|
|<span class="k">hash/MAC/signature</span>|I / I+auth / I+auth+non-repud|
|<span class="k">DNS/BGP hijack</span>|edits address-book (I) / edits road-map (A)|
|<span class="k">SMPC/HE/DP</span>|don't share input / compute on ciphertext / add noise|
|<span class="k">IaaS/PaaS/SaaS</span>|manage OS / manage code / manage only data|
|<span class="k">CPS/IoT</span>|real-time control (vert) / interconnection (horiz)|
|<span class="k">auth/attestation</span>|who you are / are you trustworthy now|
|<span class="k">cyberweapon/malware</span>|high-selectivity·state·strategic / low·criminal·profit|

**CIA quick-judge**: encryption/VPN/TLS/HE → <span class="k">C</span>; hash/MAC/signature/DNSSEC/DKIM/measured boot → <span class="k">I</span>; DDoS/BGP blackhole/backups/SCADA → <span class="k">A</span>.

## Sequences to memorise (blue = in order)

- NIST CSF: <span class="s">Identify→Protect→Detect→Respond→Recover</span>
- Risk mgmt: <span class="s">Identify→Analyze→Evaluate→Treat→Monitor&Review</span>
- GDPR 7 principles: <span class="s">lawful-fair-transparent · purpose limitation · data minimisation · accuracy · storage limitation · integrity&confidentiality · accountability</span>
- APT 6 stages: <span class="s">Recon→Delivery→Intrusion→C2→Lateral→Exfiltration</span>
- MPC: <span class="s">split random shares→keep one→publish sum held→add the sums ÷ count</span>
- Data classes: <span class="s">Public→Internal→Confidential→Restricted</span>
- Malware delivery: <span class="s">dropper (carries)→downloader (fetches)→payload (acts)</span>
- Botnet: <span class="s">infection→C2→uses</span>
- TLS: <span class="s">handshake (authenticate + DH key)→record (symmetric encryption)</span>

> **Pass line ≥40% (20/50).** If you can answer every purple question using the red keywords, you're ready.
