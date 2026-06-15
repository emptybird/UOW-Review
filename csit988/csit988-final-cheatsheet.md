<style>
.r { color:#c00000; font-weight:600; }
.p { color:#7030a0; }
.b { color:#0070c0; font-weight:600; }
</style>

<p><span class="r">Red = key term / exam answer</span> · <span class="p">Purple = quiz question & trap</span> · <span class="b">Blue = sequence / model steps</span></p>

**Formula quick-ref** — [Risk]{.r}: $R=(L_v \times I)\times(1-R_c+U)$ (ranked-vulnerability worksheet uses $R=L_v \times I$ only) · [CBA]{.r}: $SLE=AV\times EF$ · $ALE=SLE\times ARO$ · $CBA=ALE_{before}-ALE_{after}-ACS$ (> 0 → worth it) · [ARO]{.r}: weekly = 52 · monthly = 12 · quarterly = 4 · every 6 mo = 2 · every 2 yrs = 0.5 · every 20 yrs = 0.05 · [PERT]{.r}: $EF=ES+D$, $LS=LF-D$, $Float=LS-ES$; ES = max(EF of predecessors), LF = min(LS of successors); [critical path = longest sequence of dependent activities → determines project duration]{.r} (zero float).

## 1 · Weeks 1–2 — InfoSec Foundations & Management (WS 1–2)

**Security** = [the quality or state of being secure — free from danger or loss]{.r}. Layers: physical, personal, operations, communications, network, information security.

**InfoSec** protects information in all states — [storage, processing, transmission]{.b} — via policy, awareness, training, education, technology.

**Communities of interest** (nested, not parallel: InfoSec ⊂ IT ⊂ Business):

| Community | Role |
|---|---|
| [InfoSec]{.r} | protects assets; leads risk/security effort |
| [IT]{.r} | builds & runs systems that support the business |
| [General business]{.r} | [articulates organizational policy + allocates resources]{.r}; balances cost vs. efficiency |

[Q: which community of interest is primarily responsible for articulating organizational policy and allocating resources for InfoSec? → General business community.]{.p}

**CIA triad**: [Confidentiality]{.r} — only sufficiently privileged users access info · [Integrity]{.r} — data not altered (data corruption can occur as a result of a deliberate attack **or** for other reasons → True) · [Availability]{.r} = [the characteristic that enables user access to information in a usable format without interference or obstruction]{.r}. [Trap: availability ≠ "accessible to everyone at all times" (False — authorized users only).]{.p}
Extended characteristics: privacy, identification, authentication, authorization, [accountability]{.r} = [exists when a control provides assurance that every activity undertaken can be attributed to a named person or automated process]{.r} (detailed audit logs of logins/file access/config changes strengthen it).

**Privacy vs confidentiality**: privacy = individual's control over use of own data; confidentiality = only authorized people access the info.

**CNSS / McCumber cube** — 3 dimensions × 3 = [27 cells]{.r}: [Goals (C-I-A) × States (storage, processing, transmission) × Controls (policy, education, technology)]{.b}. A valid cell = [exactly one item from each axis]{.r} (e.g. Confidentiality + Transmission + Technology → TLS). [Trap triple with two goals (e.g. Confidentiality, Integrity, Transmission) is NOT a cell.]{.p}
Weaknesses: no implementation guidance; must cover **all** cells — [encryption with no training & no policy = focuses on the technology control category while neglecting policy and education controls]{.p} (CNSS case-study answer).

**Access control** = [regulates the admission of users into the org's *trusted areas* — both logical (systems/data) and physical (facilities); a complete scheme always uses all four IAAA processes]{.r}.
**Access control chain (IAAA)**: [Identification]{.r} (claim identity — [providing a username = identification, NOT authentication]{.p}) → [Authentication]{.r} (prove it — password, fingerprint, OTP, digital certificate) → [Authorization]{.r} (what you may do) → [Accountability]{.r} (trace actions — logs, audit, non-repudiation).
Moodle example: enter student ID → SSO password → student views / teacher uploads → Moodle logs all actions.

**Management** = achieving objectives using a given set of resources. Leaders [influence behavior]{.r}; managers [coordinate resources]{.r}. Manager roles: informational, interpersonal, decisional.

**POLC**: [Planning → Organizing → Leading → Controlling]{.b}. Controlling = monitor performance **against plans**, adjust process or standards (feedback loop). [Q: relationship planning↔controlling → controlling evaluates performance against plans and enables adjustments.]{.p}

| Planning level | Horizon | Who / example |
|---|---|---|
| [Strategic]{.r} | 5+ yrs | senior mgmt; long-term direction |
| [Tactical]{.r} | 1–5 yrs | managers; budgets, 2-yr upgrade project |
| [Operational]{.r} | day-to-day | staff; backup schedules, firewall config |

**Goal vs objective**: goal = final end-point; objective = intermediate milestone used to measure progress.

**Problem solving (5 steps)**: [1 recognize/define problem → 2 gather facts & assumptions → 3 develop solutions → 4 analyze & compare → 5 select, implement, evaluate]{.b}. (Phishing case: define → check logs/who clicked → options: training, spam filter, MFA → compare cost/effect → train + filter, then review.)

**Six P's of InfoSec management**: [Planning, Policy, Programs, Protection, People, Projects]{.r}. [Trap: "Performance" is NOT one of the six P's.]{.p}

**Plan types**: IRP (react to incidents), DRP (recover after disaster), BCP (continue business elsewhere) + policy/personnel/risk/technology/SETA plans.

**Process vs project**: process = continuous, no defined end; project = discrete, defined start/end & deliverables. InfoSec = continuous chain of projects ≈ a process.
**Project management** = applying skills/tools to plan & control work so it finishes [on time, within budget, meeting specifications]{.r} (= the 3 success criteria). InfoSec work (firewall rollout, policy writing, training) is usually run as projects.
[Scope creep]{.r} = [expanding project deliverables beyond original plans]{.r}. [Projectitis]{.r} = [excessive focus on documentation and tracking rather than actual progress]{.r}.

**PMBoK 9 knowledge areas**: [integration, scope, time, cost, quality, HR, communications, risk, procurement]{.b} (each "project X management"). Cost mgmt → completes project within budget.

**Tools**: [WBS]{.r} = hierarchical task breakdown ([WBS ≠ PERT network diagram → False statement trap]{.p}) · [PERT]{.r} = network of dependencies/durations · [Gantt]{.r} = bar-chart-like graphic displaying project tasks & progress · [Critical path]{.r} = [the longest sequence of dependent activities determining project duration]{.r} = minimum completion time · [Slack]{.r} = how long a non-critical task can be delayed without affecting completion time.

Network calc: $EF = ES + D$; $LS = LF - D$; $Float = LS - ES$; ES = max(EF of predecessors); LF = min(LS of successors). Worked answer: critical path [A→C→D→E→F→H→I]{.r}; slack B = 5, G = 8 (can be delayed without affecting finish).

## 2 · Weeks 3–4 — Planning, Threats & Contingency Planning (WS 2–3)

**Planning** = [the process that creates & implements strategy to accomplish objectives — the dominant means of managing organizational resources]{.r}. **Why plan**: align security with business goals, structure for controls, manage resources, proactive risk management.

**Strategic foundations**: [Values]{.r} = core beliefs · [Vision]{.r} = what the org **wants to become** · [Mission]{.r} = what the org **does and for whom**. (Tesla vision / Google mission / Microsoft values.) Strategy = how to get there. [🚩 Trap: "the *values* statement describes what an org wants to become" → False; that is the *vision* statement.]{.p}

**Top-down vs bottom-up**: top-down = senior-mgmt-led, has authority, resources, alignment → [more likely to succeed]{.r}; bottom-up = technician-initiated, lacks coordination/support.

**Governance** = directing & controlling InfoSec (CISO-led, bridges security and business). 5 outcomes: [strategic alignment, risk management, resource management, performance measurement, value delivery]{.b}. Includes a risk-management methodology (True). [Trap: "reducing private data" is NOT a governance benefit.]{.p}
CGTF-recommended framework = [IDEAL]{.r}: [Initiating, Diagnosing, Establishing, Acting, Learning]{.b}.

**SecSDLC** (waterfall-like): [1 Investigation]{.b} — objectives, scope, charter → [2 Analysis]{.b} — existing policies, risk assessment → [3 Logical design]{.b} — blueprint, IR/BC/DR planning → [4 Physical design]{.b} — select technologies/solutions → [5 Implementation]{.b} — buy/build, test, train → [6 Maintenance]{.b} — monitor, patch, improve.

**Definitions**: [Threat]{.r} = category of danger to an asset · [Vulnerability]{.r} = weakness in a system/control that could be exploited · [Attack]{.r} = deliberate act exploiting a vulnerability · Exploit = technique used to compromise. Threat exploits vulnerability → attack succeeds.

**12 threat categories** (classify scenarios into these!):

| Category | Example |
|---|---|
| Compromises to intellectual property | piracy, unlicensed software install |
| Deviations in quality of service | ISP/power outage |
| Espionage / trespass | unauthorized access & data copying, shoulder surfing |
| Forces of nature | flood damages data centre |
| Human error / failure | employee data-entry mistake |
| Information extortion | "pay or we leak your data" (ransom demand) |
| Sabotage / vandalism | disgruntled employee deletes files |
| Software attacks | malware, DoS on website |
| Technical hardware failure | disk failure stops server |
| Technical software failure | coding bug → wrong reports |
| Technological obsolescence | outdated/unsupported software or crypto |
| Theft | laptop stolen from office |

**Technical attacks**: backdoor, buffer overflow, brute-force/dictionary, DoS/DDoS, mail bombing, spam, sniffer, spoofing, man-in-the-middle, replay, phishing / spear phishing, pharming. **Non-technical** (people-based): social engineering, [shoulder surfing]{.r}, dumpster diving. [🚩 Trap: shoulder surfing / dumpster diving / social engineering are NON-technical — a recurring MCQ.]{.p}

**Contingency Planning (CP)** = prepare for, detect, react to, recover from events threatening security/operations. Primary goal: [restore normal operations with minimum disruption (& cost)]{.r}. Components in strict order: [BIA → IRP → DRP → BCP]{.b} ([first phase of the CP process = Business Impact Analysis]{.p}). Teams: CPMT (develops overall CP), [IR team — primarily responsible for executing the IR plan]{.r}, DR team (restores at primary site), BC team (operates alternate site).

**BIA**: [assumes preventive controls may have failed]{.r}; [estimates impact on business functions]{.r} (incl. worst-case scenarios; not only hardware). Differs from risk mgmt: RM identifies & mitigates threats *beforehand*; BIA asks "what if controls don't work — what do we lose, what must recover first?" Stages: [1 threat/attack identification & prioritization → 2 business unit analysis → 3 attack success scenarios → 4 potential damage assessment → 5 subordinate plan classification]{.b}. [Trap: "policy plan classification" is NOT a BIA stage.]{.p}

**NIST 7-step CP process**: [policy → BIA → identify preventive controls → develop recovery strategies → document plan → test & train → maintain]{.b}.

**Incident** = an event that (1) is [directed at information assets]{.r}, (2) has a [realistic chance of success]{.r}, and (3) [threatens C / I / A]{.r} (all three conditions). IRP activates when an event causes [loss of C / I / A, or violation of policy / law]{.r}, and damage is minimal per pre-set criteria. [Incident response is preventive → False (it is reactive).]{.p}
Becomes a [disaster]{.r} when org cannot contain/control the impact, or damage is so severe recovery isn't quick → switch from IRP to DRP/BCP.

**IRP stages** (4 tasks): [incident planning → incident detection → incident reaction → incident recovery]{.b}. Reaction procedures: detect (monitoring, logs, reports) → contain → eradicate → recover → follow-up; [Documentation & AAR happen *within* reaction/recovery, not as a separate stage]{.p}. [Trap: "plan for disaster recovery" is NOT an IRP stage.]{.p}
**Containment strategies**: [disconnect affected communication circuits; disable compromised accounts]{.r}; isolate affected systems/VLANs; reconfigure firewalls; shut down compromised services or systems.
**Alert roster** — purpose: [to notify key personnel during an incident]{.r}. [Sequential]{.r} = one caller phones everyone in order; [hierarchical]{.r} = each person calls a few others (faster, can garble message).
**AAR (after-action review)** — post-incident meeting; review logs/actions, fix the plan, becomes training case.

**Pipkin's incident indicators**:

| Level | Meaning | Standard examples |
|---|---|---|
| [Possible]{.r} | might be an incident | unfamiliar files; unknown processes; unusual consumption/crashes; user reports suspicious email |
| [Probable]{.r} | likely an incident | IDS alarms; activity at unexpected times; many similar phishing reports |
| [Definite]{.r} | confirmed | [use of dormant accounts]{.r}; changes to logs; hacker tools present; notification by partner/hacker; extortion demand; accounts accessed after phishing click |

**DRP** = restore operations [at the original/primary site]{.r}. Disaster classes: natural vs human-made; [rapid vs slow onset]{.r}. An incident is a disaster when damage is too severe to recover quickly (True).
**BCP** = keep business running [at an alternate site]{.r} while primary is unavailable; [activated **concurrently with the DRP**]{.r} when the disaster is severe/long-term; protects revenue, reputation, customer service.

**Continuity strategies** — exclusive: [Hot site]{.r} = fully configured facility incl. services, comm links, physical plant; fastest, dearest · [Warm site]{.r} = systems w/o live data · [Cold site]{.r} = basic infrastructure only. Shared: [timeshare, service bureau, mutual aid agreement]{.r} (= contract where each party assists the other in disaster). [Trap: warm site is NOT a shared-use option (False).]{.p}
**Data backup options**: traditional backups (tape/disk), electronic vaulting (bulk batch transfer off-site), remote journaling (live transaction transfer), database shadowing (live duplicate DB).

**CP testing**: [desk check → structured walkthrough → simulation → parallel test → full interruption]{.b} (most realistic, most risky).

## 3 · Weeks 5–6 — Security Policy & Security Program (WS 3–4)

**Policy** — [the essential foundation of an effective InfoSec program = policy]{.r} (not encryption/firewall/antivirus/IDS); records **management intent**; must [stand up in court]{.r} — defensible, uniformly enforced. [Cheapest control to create, hardest to enforce.]{.r}
Hierarchy: [Policy (what & why, by mgmt) → Standard (mandatory rules that give policy teeth) → Procedures / practices / guidelines (how, step-by-step)]{.b}. [Trap: "policies explain how employees will comply" is FALSE — procedures do that.]{.p}

**Bull's-eye model** (outermost → innermost): [Policy → Networks → Systems → Applications]{.b}. Outer layer = [Policies]{.r}; policy drives every inner layer; evaluate/fix problems from the outside in. Networks = protect communication paths (firewalls, VPN); Systems = servers/OS; Applications = user-facing programs.

**Three policy types (NIST SP 800-14)**:

| | [EISP]{.r} | [ISSP]{.r} | [SysSP]{.r} |
|---|---|---|---|
| Level | enterprise, strategic; [sets the strategic direction and tone for security efforts]{.r}; supports mission/vision | one issue / technology | one system / device |
| Example | corporate InfoSec policy | email, internet, USB, BYOD use | firewall config, ACLs |
| Updates | rare | [frequent (tech changes)]{.r} | per system change |
| Note | drafted by CISO, approved by CEO | = binding agreement on resource use | functions as standard/procedure |

[**ISSP provides detailed, targeted guidance to instruct all members in the use of a process, technology, or system.**]{.r} (Frequent quiz line — answer is **ISSP**, *not* SysSP.)
EISP 5 components: statement of purpose, InfoSec elements, need for InfoSec, roles & responsibilities, references to standards.
ISSP serves 3 functions: articulate expected use, document controls, [indemnify the org against liability for misuse]{.r}.
**ISSP 7 components**: [1 statement of purpose → 2 authorized uses → 3 prohibited uses → 4 systems management → 5 violations & penalties → 6 policy review & modification → 7 limitations of liability]{.b}. ([Authorized + prohibited uses = the two component answers.]{.p})
ISSP implementation approaches: independent docs / single comprehensive doc / [modular — recommended]{.r} (central control, tailored per issue).
**SysSP** [may function as standards or procedures; includes technical specifications]{.r} — two classes: managerial guidance + technical specifications, separate or combined in one document (True). Technical SysSPs: [ACLs]{.r} (who, what, when, where, how of access) and [configuration rules]{.r} (instructional codes that guide system behavior, e.g. firewall rule sets).

**Effective policy lifecycle**: [develop → disseminate (distribute) → review (read) → comprehend (understand) → comply (agree) → enforce (uniformly)]{.b}. Develop via SecSDLC as a formal project; analysis phase gathers risk assessment, current policy review, legal/compliance requirements, threat/vulnerability assessments, BIA.
Distribution: hand-out/onboarding, email w/ receipt, intranet portal, login pop-up; confirm via signed acknowledgment or quiz (comprehension ≥ ~70%). Policy is [dynamic]{.r} — revisit on threat/law/technology change. No uniform enforcement → legal risk (discrimination claims, unenforceable dismissals).
[Trap (false statements): "policy must use lots of technical/management jargon"; "EISP must not support the vision statement".]{.p}

**InfoSec program** = structure & organization of the effort that protects information assets. **14 functions** a program needs — each performed *somewhere* in the org, not necessarily inside InfoSec: mgmt/compliance side — [risk mgmt, risk assessment, policy, compliance, legal assessment, planning, measurement]{.r}; technical/ops side — [systems security admin, network security admin, centralized authentication, systems testing, vulnerability assessment, incident response, training]{.r}.

**Four-area allocation** ([🚩 each area's owner + nature is a frequent exam point]{.p}): [①]{.b} outside-IT business units → legal, training · [②]{.b} IT groups outside InfoSec → systems/network security admin, centralized authentication · [③]{.b} within InfoSec as **customer service** → risk & vulnerability assessment, systems testing, IR, planning, measurement · [④]{.b} within InfoSec as **compliance** → policy, compliance, risk management.

Variables shaping the program: [**culture (#1, most influential)**, size (#2), security personnel budget, security capital budget]{.r}. [Quiz answer: most influential variable = organizational **culture**, NOT size — teacher pre-empts the "size" trap (Wk6).]{.p} Regardless of size, [ensuring every function is performed *somewhere* is always the CISO's responsibility]{.r}; whether to hire **full-time** security staff depends on [(1) info sensitivity, (2) industry regulation, (3) profitability]{.r}. [Per-user security spend declines *exponentially* as orgs grow]{.r} (economies of scale; Briney & Prince "Does Size Matter?" — XL ≈ \$300/user vs Small > \$5,000/user, ≈ 1/18).

**Security config by org size** (Wk13):

| Size | PCs | Per-user $ / budget | Key trait |
|---|---|---|---|
| [Very large]{.r} | >10k | **lowest ~\$300** | InfoSec **division**; best at policy & resource mgmt |
| [Large]{.r} | 1k–10k | ~**5%** of IT budget | mature; policy in culture; spends conservatively |
| [Medium]{.r} | 100–1k | mid | 🚩 **worst** at policy / incidents / resource allocation |
| [Small]{.r} | 10–100 | **highest >\$5k**, ~**20%** budget | usually **one person** (IT's add-on); lower target risk |

**Wood's 5 placement options for InfoSec** (key discriminator = # middle managers between the InfoSec chief and the CEO):

| Opt | Placement | Layers to CEO | Verdict / fit |
|---|---|---|---|
| [1]{.b} | under **IT** (CISO→CIO→CEO) | 1 (the CIO) | most common/natural (~⅓ of orgs, incl. UOW); security subordinated to IT → no longer most *recommended* |
| [2]{.b} | under a (corporate) **Security** dept | [**2 — the most**]{.r} | [least advised]{.r}; weakest channel for voicing security needs to top mgmt |
| [3]{.b} | **Administrative Services** | 1 | improvement over 1 & 2; InfoSec advisory like HR; fits non-info-intensive orgs |
| [4]{.b} | **Insurance & Risk Mgmt** | 1 | integrated risk view; fits info-intensive orgs (banks, brokerages) |
| [5]{.b} | **Strategy & Planning** | 1 | stresses documented policy/standards; fits orgs critically dependent on InfoSec (e-commerce) |

[Trap: Option **2** has the MOST layers (2); options **3/4/5 each have only ONE**; Option **1** is most *popular*, not most *recommended*.]{.p}
[Placing InfoSec under IT = conflict of interest]{.r} — CIO priorities (efficiency, uptime, cost) compete with security restrictions; independent placement gives security its own voice & budget.

**Roles**: [CISO]{.r} (strategy; a.k.a. Manager/Director of Security) · security manager (program oversight) · security analyst (threats, logs) · [security technician]{.r} (configures firewalls/IDPS, implements software, troubleshoots — True) · consultants/investigators. Functional classes: [definers]{.r} (policy, architecture, risk) → [builders]{.r} (create/install solutions) → [administrators]{.r} (operate & monitor). ["Guards, gates & guns" = physical security, NOT consultants (False).]{.p}

**SETA** = Security Education + Training + Awareness (CISO's responsibility). Purpose: people are the weakest link — reduce accidents, reinforce policy.
**3 benefits (textbook trio)**: [1 improve employee behaviour; 2 inform employees where to report incidents/violations; 3 enable the organization to hold employees accountable]{.r}. ([SETA does NOT eliminate all security incidents or replace technical controls.]{.p})

| | Education | Training | Awareness |
|---|---|---|---|
| Level | why | how | what |
| Objective | understanding | skill | exposure/recognition |
| Timeframe | long | medium | short, continuous |

**Awareness program priorities (NIST)**: focus on [people, not technology]{.r}; plain non-technical language; [multiple channels]{.r} (posters, email, sessions); short, engaging, clear goals. [Awareness is the cheapest control and is NOT ineffective (False trap).]{.p}
**Training**: group trainees by [functional role (general/managerial/technical), skill level (novice→advanced), job category, technology/system used]{.r}. Delivery: instructor-led, one-on-one, [CBT]{.r} (self-paced, consistent, scalable, trackable; but less engaging, no live Q&A, needs infrastructure), web-based, on-the-job, simulations.

**NIST vs ISO** (case-study box): [NIST]{.r} = US federal agency; mission: promote US innovation/competitiveness via measurement science & standards; SP 800 series is [free, public, detailed, risk-based]{.r} — suits orgs wanting cost-free in-depth technical guidance (esp. US/government context). [ISO]{.r} = international federation of national standards bodies; develops voluntary international standards; ISO 27001 is [certifiable]{.r} (paid) — suits orgs needing internationally recognized certification to assure customers/partners. Both improve posture: NIST tells you *how* in detail; ISO gives a certifiable management-system framework (ISMS).

## 4 · Weeks 7–8 — Security Models & Management Practices (WS 4–5)

**Framework vs blueprint vs model**: [framework]{.r} = [provides a structure that guides the design and implementation of controls]{.r} · [blueprint]{.r} = [describes existing controls and identifies additional required controls]{.r}, built from a framework · [security model]{.r} = a [generic blueprint offered by a service organization]{.r} to adopt/adapt as a starting template (e.g., ISO 27000 = proprietary/paid · NIST = free). Hierarchy: [model → framework → blueprint]{.b}. [Trap: a security model is a *concrete*/org-specific blueprint from a service org → False — it's a **generic** template; you still need your own framework→blueprint design. BLP/Biba are *architecture* models, not this kind of "model".]{.p}
[Security **architecture** models (e.g., BLP, Biba — see table below) illustrate how InfoSec is implemented within systems]{.r} — not only physical, not only software, any org size.

**Access control**: 4 PROCESSES = IAAA (Identification→Authentication→Authorization→Accountability, see §1) · 3 PRINCIPLES = [least privilege]{.r} (minimum access for minimum time — broad access ≠ efficiency), [need to know]{.r} (only info required for current task — even within your clearance level), [separation of duties]{.r} (split critical tasks → no single person can abuse/commit fraud). [🚩 #1 classic trap: the 3 key PRINCIPLES are NOT the 4 PROCESSES — answering "identification, authentication, authorization" for the *principles* is the most common error. Also: **job rotation is based on separation of duties, NOT least privilege**.]{.p}
Categories — by inherent characteristics: [preventative, deterrent, detective, corrective, recovery, compensating]{.b} ([NOT: strategic/tactical/executive/creative]{.p}); by operational impact: management, operational, technical; by degree of authority:

| Model | Who decides | Notes |
|---|---|---|
| [MAC]{.r} | the system (central) | lattice-based; security labels (Confidential/Secret/Top Secret); users cannot change permissions; military/gov |
| Nondiscretionary | org via roles/tasks | [RBAC]{.r} = tied to a role; task-based = tied to an assignment (True) |
| [DAC]{.r} | data owner/user | owner grants access at own discretion; typical of PC OSes (Windows file sharing) |

**Data classification & clearance**: classification = assign sensitivity levels (Public / Sensitive / Classified); [data owners classify]{.r}; clearance = level a person may see, but [clearance ≠ automatic access — need-to-know still required]{.r}. Clean-desk policy; shred to stop dumpster diving.

**Evaluation models**: [TCSEC "Orange Book"]{.r} (US DoD) — built on the [TCB]{.r} (trusted computing base) and the [reference monitor]{.r} (mediates *every* access of subject→object; basis of audits). TCSEC covert channels: [covert storage channel]{.r} (communicate via shared storage — file flags, status bits) · [covert timing channel]{.r} (modulate timing — CPU usage, delays). Successors: [ITSEC]{.r} (European; evaluates Targets of Evaluation) → [Common Criteria, ISO/IEC 15408]{.r} (current international standard).

**Architecture models**:

| Model | Protects | Rules |
|---|---|---|
| [Bell-LaPadula]{.r} | confidentiality | [no read up, no write down]{.r} |
| [Biba]{.r} | integrity | [no read down, no write up]{.r} (mirror of BLP) |
| [Clark-Wilson]{.r} | integrity (commercial) | users change data only via well-formed transactions/programs; SoD |
| [Brewer-Nash]{.r} | conflict of interest | = [Chinese Wall]{.r}; access one client's data → competitor's data blocked |

Also by name: Graham-Denning; Harrison-Ruzzo-Ullman. [Traps: "Biba = no read up/no write down" → False; "Biba is a confidentiality model" → False; Biba *does* ensure no info passes from a subject to a higher-integrity object → True.]{.p}

**Management/standards**: [ISO 27001]{.r} = ISMS requirements (certifiable; from BS7799) · [ISO 27002]{.r} = code of practice, [how to implement 27001]{.r}; successor of ISO 17799 (both True). [NIST SP 800 series]{.r} = free, publicly available, broadly reviewed US guidance:
800-12 intro/handbook · [800-14]{.r} generally accepted principles & practices ([8 points + 33 principles]{.r}) · 800-18 system security plans (SSP) · [800-30]{.r} risk assessment · [800-37]{.r} RMF · [800-53]{.r} controls catalog · [800-55]{.r} performance measurement · 800-61 incident handling · 800-100 managers' handbook.
SP 800-14's 8 points (gist): security supports the mission; integral to sound management; cost-effective; owners have responsibilities outside their own org; responsibilities made explicit; requires comprehensive & integrated approach; periodically reassessed; constrained by social factors.
[COBIT]{.r} (ISACA) = governance & audit framework · [COSO]{.r} = internal-control framework.

**Benchmarking** = compare your practices against peer orgs / industry standards → identifies **which** controls to consider (not how, no guarantee they transfer). Limitations: [orgs don't share attack/defense data; no two orgs are identical; practices are a moving target (dated fast)]{.r}. [Trap: "biggest barrier = orgs often share results" → False, they DON'T share.]{.p}
Two benchmark categories: standard of due care/due diligence + best practices (True).
[Due care]{.r} = adopt the minimum reasonable level of protection (what a prudent org would do). [Due diligence]{.r} = ongoing maintenance — keep those controls effective over time. Failure of either → [legal liability / negligence]{.r} (True). Example: firewall installed (due care) but never patched/monitored (no due diligence); constant audits (diligence) but no basic encryption ever deployed (no due care). [Trap: WS swaps the two definitions — care = implement minimum; diligence = maintain over time.]{.p}
[Best practices]{.r} = widely accepted superior procedures balancing protection & business needs; [gold standard]{.r} = the most respected model. Best-practice firms are NOT best at everything (False trap). Selecting practices — ask: similar org? same industry? similar challenges? comparable structure? can we afford the resources? similar threat environment? Limits: nothing fits everyone; may be too costly; copying without context adds risk; practices age.
[Baselining]{.r} = [compare performance against an established reference point]{.r} — measure your **own** current state for future comparison → [can support internal benchmarking]{.r} (first risk assessment often = the baseline); does NOT eliminate future measurement or guarantee improvement. Related to benchmarking (True). Self-assessment areas: people (background checks? can staff spot issues?), process (policy reviewed yearly? leaver accounts removed?), technology (all internet routes firewalled? laptops encrypted?).

**Performance measurement**: 3 types of measurements in use: [policy execution / implementation, service delivery / effectiveness-efficiency, incident impact]{.b}. Good measurements: [quantifiable, repeatable, easy to collect, actionable]{.r}; should support resource-allocation decisions; an ongoing (not one-time) activity. [Metrics]{.r} apply quantitative analysis to measurements — many orgs use "metrics" and "measurements" [interchangeably]{.r}. Macro focus = whole program; micro focus = one system/control. Prioritize metrics by risk; set targets; use a standard development template; report with context, tailored to audience. **4 critical factors for performance-program success** (SP 800-55): [strong upper-level management support, practical security policies & procedures, quantifiable performance measures, results-oriented analysis]{.r}.
NIST [SP 800-55 Rev.1]{.r} = the performance-measurement guide (True). Its **implementation process = 6 phases** (True): [prepare for data collection → collect data & analyze → identify corrective actions → develop business case → apply corrective actions]{.b} (+ obtain resources). [Trap: the measurement *development* process is NOT "6 phases" (False).]{.p} Candidate metrics: % users with shared accounts, # failed logins, % policy violations ([beware typo trap "SP 800-500"]{.p}).

**Certification vs accreditation**: [certification]{.r} = comprehensive technical + non-technical evaluation of a system against requirements; [accreditation]{.r} = management's formal authorization to operate. Neither is permanent — re-evaluate every [3–5 years]{.r}. Post-2009 (FISMA-driven) US federal practice replaced C&A with the [Risk Management Framework — NIST SP 800-37]{.r}.
**RMF 6 steps (cyclic, continuous)**: [Categorize → Select → Implement → Assess → Authorize → Monitor]{.b}. Assess ≈ old certification; Authorize ≈ old accreditation. Selecting baseline controls is part of RMF (True); monitoring is still required after implementation. [Trap: "Review" and "Authenticate" are NOT RMF steps.]{.p}

## 5 · Weeks 9–10 — Risk Identification, Assessment & Control (WS 5–6)

**Risk management** = identify, assess, control, monitor risks to information assets. [Risk analysis ⊂ risk management]{.r} (assigns likelihood & impact) — [not the other way round (trap)]{.p}. "Know yourself" (your assets) & "know the enemy" (threats) — Sun Tzu. Responsibility: [every manager + all employees]{.r}; [InfoSec community leads]{.r}; [management & users provide resources]{.r} (and early detection). [Trap: risk control is NOT the first operational phase — identification comes first.]{.p}

**Risk identification**: asset categories: [people, procedures, data, software, hardware, networks]{.r}. Inventory attributes: name, IP address (can change — DHCP), [MAC address (NOT always a reliable identifier)]{.r}, serial number, manufacturer, software version, physical & [logical location]{.r}, controlling entity. Identify first, value later; classification must be [comprehensive + mutually exclusive]{.r}; inventory should reflect each asset's security priority.
Asset valuation questions: most critical to mission? generates most revenue/profit? most expensive to replace? most expensive to protect? biggest liability/embarrassment if exposed? [Weighted factor analysis]{.r}: criteria weights sum to 100, score each asset 0.1–1.0, weighted sum ranks assets.
**Threat assessment**: not all 12 categories endanger every org; ask: which threats are real here? cost of a successful attack? cost to recover? cost to prevent? prioritize via weighted tables (likelihood × impact + preparedness). [Technological obsolescence IS an InfoSec threat (True).]{.p}
[Vulnerabilities]{.r} = specific avenues by which threats can exploit assets — may exist in procedures and controls too, not just tech.
**TVA worksheet**: assets across top (by value), threats down the side (by danger); cells list vulnerabilities → "TVA triples" (T1V1A1…); prioritized starting point for controls; does NOT itself eliminate vulnerabilities or replace risk assessment.

**Risk formula**: $R = (L_v \times I) \times (1 - R_c + U)$, where $L_v$ = likelihood threat exploits vulnerability, $I$ = impact (asset value scale), $R_c$ = fraction of risk mitigated by current controls, $U$ = uncertainty of knowledge (1 − confidence). The ranked-vulnerability worksheet uses the simplified $R = L_v \times I$ only. [Exam rule — pick the formula by what the question gives: ranked-vulnerability worksheet → use $R = L_v \times I$; given a current-control % and data accuracy → use the full $(1 - R_c + U)$ formula.]{.p}
Worked example (memorize the method):

| Asset / vuln | $L_v$ | I | $R_c$ | U | Risk |
|---|---|---|---|---|---|
| A switch — hardware failure | 0.2 | 90 | 0 | 0.25 | (0.2×90)×1.25 = [22.5 → first]{.r} |
| A switch — SNMP overflow | 0.1 | 90 | 0 | 0.25 | 9×1.25 = 11.25 |
| B web server — Unicode | 0.1 | 100 | 0.75 | 0.20 | 10×0.45 = 4.5 |
| C console — misuse | 0.1 | 5 | 0 | 0.10 | 0.5×1.1 = [0.55 → last]{.r} |

Qualitative alternative: [AS/NZS 4360]{.r} — likelihood A (almost certain)…E (rare) × consequence 1 (insignificant)…5 (catastrophic) → Extreme/High/Moderate/Low. [It is QUALITATIVE, not quantitative (trap).]{.p}
Possible controls come in 3 flavors: [policies, programs (e.g. SETA), technical controls]{.r}. Deliverables: ranked asset list, ranked threat list, TVA worksheet, ranked vulnerability risk worksheet. [Likelihood varies per vulnerability (never "always the same"); U is not always smaller than $R_c$.]{.p}

**Five risk control strategies** + scenario mapping:

| Strategy | Meaning | Scenario |
|---|---|---|
| [Defense]{.r} | apply safeguards to **prevent** exploitation (policy + training + technology together) | password policy + MFA to prevent unauthorized access |
| [Transference]{.r} | shift risk to others | cyber insurance; outsourcing (still monitor via SLA!) |
| [Mitigation]{.r} | reduce **impact** when attack succeeds — via [IRP / DRP / BCP]{.r} | develop DRP to limit damage |
| [Acceptance]{.r} | consciously live with the risk | after CBA shows safeguard not worth it |
| [Termination]{.r} | remove the asset entirely | retire obsolete system too costly to secure |

[Traps: prevention ≠ mitigation (MFA = defense); DRP = mitigation, not defense; termination ≠ "accepting without controls"; acceptance is INVALID without prior likelihood/loss analysis + CBA.]{.p}
Acceptance is proper only when: risk is within [risk appetite]{.r}; thorough [CBA]{.r} done; decision informed, documented, approved; risk still monitored.
[Risk appetite]{.r} = amount/nature of risk an org will accept (varies w/ industry, regulation, culture, finances, history). [Residual risk]{.r} = risk remaining after controls; goal = bring it within appetite, [never to zero]{.r}; leftover residual risk ≠ program failure. [Once decision-makers are *informed* and the *proper authority* knowingly accepts the residual risk, the security program has met its primary objective.]{.r}

**Cost-benefit analysis**: $SLE = AV \times EF$ (asset value × exposure factor = % of asset lost per incident) · $ALE = SLE \times ARO$ · $CBA = ALE_{before} - ALE_{after} - ACS$; positive → safeguard worth it. CBA may be computed [before or after]{.r} a control is in place. ARO conversions: weekly = 52, monthly = 12, quarterly = 4, every 6 months = 2, every 2 yrs = 0.5, every 20 yrs = 0.05. [ALE is ANNUAL loss; SLE is single-loss (trap swaps them). Never spend more protecting an asset than it is worth.]{.p}
Example: AV \$50k, EF 30% → SLE \$15k; ARO 2 → $ALE_{before}$ \$30k; control halves ARO → $ALE_{after}$ \$15k; ACS \$10k → CBA = 30−15−10 = [+\$5k → worth it]{.r}. Exam pattern: "improved security" tables → recompute SLE/ARO/ALE after; if control eliminates the threat, $ALE_{after}=0$. ACS = cost of control per year. [Trap: ARO is NOT "the percentage of an asset damaged in a successful attack" — that is EF.]{.p}
Include hidden costs: deployment, maintenance, training, downtime, liability, reputation.

**Feasibility analysis** (gate before implementing a control): [economic]{.r} = affordable? (assessed via CBA) · [technical]{.r} = do we have/can we acquire the tech & expertise? · [organizational]{.r} = fits strategy & operations of the org · [operational]{.r} = will users/management accept and use it? · [political]{.r} = will internal stakeholders/power dynamics support it ([not about government laws]{.p}).
Alternatives when full CBA/feasibility impossible: benchmarking, best practices/gold standard, due care & due diligence, baselining.
[📌 Other RM frameworks (OCTAVE / FAIR / Microsoft RM / ISO 27005 / ISO 31000 / NIST RMF / ENISA) = NOT examinable (Wk10, teacher's words) — know they exist, no detail needed. NB: ISO 31000 descends from AS/NZS 4360, which IS examinable (see above).]{.p}

## 6 · Weeks 11–12 — Protection Mechanisms, Personnel, Law & Ethics (WS 6)

**Access controls (technical)**: [identification]{.r} requires a [unique identifier mapping to one entity]{.r} in the security domain. Authentication factors: [something you know / have / are / produce]{.r} (password / smart card, token / biometrics / voice, signature). [Strong authentication (MFA) = at least TWO factors of DIFFERENT types]{.r}. Authorization granted [per user, per group, or across systems (SSO)]{.r} — [group-based is valid (trap says it must be individual)]{.p}. Accountability via [system logs & auditing]{.r}.

**Firewall generations**: [1st packet filtering]{.r} (headers: IP, port, protocol) → [2nd application-level]{.r} (proxy server — acts on the client's behalf at app layer; needs per-protocol support) → [3rd stateful inspection]{.r} (tracks connections in a [state table]{.r}) → [4th dynamic packet filtering]{.r} (opens/closes ports on demand).
**Architectures**: packet-filtering router · [screened host]{.r} (router + bastion/proxy host) · [dual-homed host]{.r} (two NICs between internal/external, often NAT) · [screened subnet]{.r} (DMZ between two filtering routers — most secure, but [more complex & costly, NOT cheaper]{.p}). [🚩 Trap: the 4 GENERATIONS (packet-filter → app-level → stateful → dynamic) are NOT the 4 ARCHITECTURES (packet-filter router / screened-host / dual-homed / screened-subnet) — "dynamic packet filtering" is a *generation*, not an architecture.]{.p}
Q&A: firewall = device controlling traffic between trusted & untrusted networks; app-layer firewall inspects content (HTTP/SMTP) and is called a proxy because it receives & forwards on behalf of clients.

**IDPS**:

| Split | Kinds |
|---|---|
| Location | [host-based]{.r} (one system; sees local changes; more accurate, lower false positives) vs [network-based]{.r} (traffic at choke points; broader view, higher false positives) |
| Method | [signature-based]{.r} (matches known patterns; accurate but [needs regular updates]{.r}, misses novel attacks) vs [anomaly-based]{.r} (baseline of normal; [can catch unknown attacks]{.r}; slower, more false alarms) |

Poor configuration → floods of false alarms or missed attacks (True). [IDPSs do NOT automatically terminate all attacks (trap).]{.p}

**Wireless**: manage the [footprint]{.r} — don't maximize AP power; size coverage to the building. Threats: [war driving]{.r} (scanning for unsecured APs), [rogue AP]{.r}. [📌 WEP/WPA/WPA2/WPA3 protocol ladder = NOT examinable (Wk13, teacher's words) — omitted.]{.p}

**Cryptography**: cryptology = [cryptography]{.r} (making secure messages) + [cryptanalysis]{.r} (breaking them). Terms: algorithm/cipher, plaintext → (encrypt) → ciphertext → (decrypt) → plaintext; key; [steganography = hiding the existence of the message]{.r}. [Trap: ciphertext results from ENcryption, not decryption.]{.p}
Cipher types: [substitution]{.r} (Caesar/shift; mono- vs polyalphabetic), [transposition]{.r} (rearrange), [XOR]{.r} (bitwise, reversible by re-XOR).
Caesar worked: ROT13 "GUR SVANY RKNZ…" → [THE FINAL EXAM WILL TAKE PLACE IN THE NEXT MONTH]{.r}; that plaintext, left shift 6 → "NBY ZCHUF YRUG…".

| | [Symmetric]{.r} | [Asymmetric]{.r} |
|---|---|---|
| Keys | one shared secret | public/private pair |
| Speed | [fast]{.r} | slower ([less efficient — True]{.p}) |
| Pain point | [secure key distribution]{.r} | cost/complexity; but easier key mgmt |
| Examples | DES, 3DES, [AES (symmetric! not asymmetric)]{.p} | [RSA]{.r}, ElGamal |

[Hybrid]{.r} systems (e.g. [Diffie-Hellman]{.r}): asymmetric to exchange a symmetric session key, symmetric for bulk traffic.
[Digital signature]{.r}: sign w/ private key, verify w/ public → provides [authentication + non-repudiation]{.r} ([NOT confidentiality/availability/privacy]{.p}). Hashing → [integrity]{.r}. [Digital certificate]{.r} = identity assertion verified by a [CA = electronic notary]{.r} (verifies origin & integrity of certs; does NOT make symmetric keys for everyone or stop all MITM). [PKI]{.r} = infrastructure of keys, certs, CAs. Cert chain: root CA → intermediate CA(s) → server certificate; check validity period, domain match, trusted issuer.
Applications: email = [S/MIME, PGP]{.r} ([HTTPS is NOT an email protocol — trap]{.p}); web = [SSL/TLS, HTTPS]{.r}; network = [IPSec, VPN]{.r}; remote shell = [SSH]{.r}; authentication = [Kerberos]{.r}. [📌 know *what each protects*, but these specific application protocols are NOT exam-essential (Wk13); crypto has **no calculation** questions.]{.p}
Key management: don't lose/leak keys; verify who you're talking to; mind legal restrictions on crypto; no cryptosystem is invincible; no security through obscurity.

**InfoSec staffing**: [CISO]{.r} = senior, [business manager first, technologist second]{.r}; usually reports to CIO; [CISSP common for CISOs — "extremely uncommon" is False]{.p}. [Security manager]{.r} = mid-level; day-to-day ops; needs budgeting, project- & people-management; drafts ISSP/SysSP-level policy. [Security technician]{.r} = entry-level hands-on (firewalls, IDPS, troubleshooting); tool-specific certs valued.
Certifications: [(ISC)²: CISSP]{.r} (premier, senior, ~5 yrs experience; [**10 domains**]{.r}: access control, telecom & network security, cryptography, security architecture & design, operations security, BC & DR, legal/compliance, physical security, software dev security, InfoSec governance & risk mgmt) and [SSCP]{.r} ([entry/operational level, **7 domains** — NOT for senior executives]{.p}); [ISACA: CISA]{.r} (audit) & [CISM]{.r} (management); also Security+. Certs are costly and assume experience.

**Hiring** (InfoSec woven into HR lifecycle): job descriptions/ads [without revealing access privileges]{.r}; interviews limit info disclosure, [no tours of secure areas]{.p}; [background check BEFORE extending the offer]{.r} (identity, criminal, credit, driving, drug); new-hire orientation includes [security briefing & training]{.r}; employment [contracts may include monitoring consent + NDA]{.r}.
**Termination**: disable all access & recover keycards/assets/media, change locks, audit logs around departure, [exit interview (remind NDA)]{.r}. [Hostile]{.r} departure: [disable the employee's logical and keycard access BEFORE the employee is informed of the termination]{.r}; escort off premises; no backup to external storage, no unrestricted access, no account extension. [Friendly]{.r}: account may persist with an expiration date; escort usually unnecessary.
**Personnel controls**: [separation of duties]{.r} (no single person controls a whole critical task → anti-fraud) · [two-person control]{.r} (two people review/approve each other's work) · [job/task rotation]{.r} (multiple people can do each critical task; deters & detects fraud; [NOT based on least privilege — trap]{.p}) · [mandatory vacation]{.r} (others perform the absent person's duties → irregularities surface; [not a morale measure]{.p}) · [least privilege]{.r} (minimum access, minimum time; permanent broad rights violate it). Protect employee/customer/patient personal data — legal obligation (privacy laws).
**Nonemployees**: temporary workers — [not bound by the org's employment policies]{.r}; least privilege; [agencies rarely liable for damages they cause]{.p}. Contract workers/service contractors — [escort & monitor in secure facilities]{.r}; pre-arranged visits. Consultants — have their own agenda; your security is not their priority → NDA + minimal access, [never "all access by default"]{.p}. Business partners — system integration spreads exposure: [a vulnerability in one connected system = a vulnerability for all]{.r}; do a security review **before** interconnection; agree on exposure levels in advance.

**Law vs ethics**: [laws]{.r} = rules adopted & enforced by government, carry penalties; [ethics]{.r} = socially/professionally accepted moral norms, no state enforcement ([ethics are NOT government-enforced — recurring trap]{.p}). [Laws are typically derived from the ethics/cultural mores of a society.]{.r}
[Ignorance, accident, and intent = the three broad categories of unethical behavior]{.r} → counter with education (SETA), controls, policy.
**Deterrence — 3 conditions** (all required; laws/policies deter only if): [1 fear of penalty; 2 probability of being caught (apprehension); 3 probability of penalty actually being administered]{.r}. Fear alone is insufficient; deterrence does work when all three hold.
Codes of ethics: [(ISC)², ISACA, SANS, ACM, ISSA]{.r} — guide professionals; individuals must follow employer policy + professional codes + law.
Key laws (one-liners): US — CFA Act 1986 (computer fraud & abuse), Computer Security Act 1987, Federal Privacy Act 1974, ECPA 1986 (wiretap/electronic comms), HIPAA 1996 (health data); DMCA; EU Council Cybercrime Convention; AUS — [Privacy Act 1988]{.r}, cybercrime/high-tech crime laws.
**Lawful vs ethical (Australian case answers)**: [lawful but unethical]{.r} — retailer complies with Privacy Act 1988 but buries consent in unreadable T&Cs with maximal default data collection; minimum-compliance org that delays patching known vulnerabilities to save cost (legal, but breaches due care ethics). [Ethical but potentially unlawful]{.r} — researcher accesses a system without authorization to verify a flaw, then responsibly discloses (good intent, but unauthorized access breaches computer-misuse law). Legal compliance alone ≠ sufficient: law is the floor; ethics + due care/diligence fill the gaps where law lags technology. Professional codes ((ISC)², ACM, ISACA) give decision guidance, accountability, and shared standards when law and ethics diverge.
