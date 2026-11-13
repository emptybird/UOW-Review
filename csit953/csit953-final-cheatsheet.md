# CSIT953 Final Exam Cheat Sheet

<style>
.content > h1:first-of-type { display: none; }
.content tr { break-inside: avoid; }
.k { color: #c0181d; font-weight: 600; }
.q { color: #8312a8; font-weight: 600; }
.s { color: #1452cc; }
a { color: inherit; text-decoration: none; }
.more, .chap { display: none; }
</style>

Colour key: [red = key term, use it in your answer]{.k} · [purple = likely question or trap]{.q} · [blue = steps in order]{.s}. ★ = hinted by the lecturer. Part 1 covers MCQ, fill-in-the-blank and short answers; Part 2 covers the final design question. The Week 6 protocol analysis is in [the exam notes, chapter 3][n3]; D3 is its design version.

# Part 1 · Key Concepts

## 1 · Hashes and MACs


::: chap
[📖 Full notes: Chapter 1 · 哈希与 MAC][n1]
:::


| Tool | Question it answers | Secret | Who can verify | Gives |
|---|---|---|---|---|
| Hash | Did the bytes change? | none | anyone | integrity (expected value must be trusted) |
| MAC | Did a holder of the shared key send this? | shared key K | key holders | integrity + authenticity |
| Signature | Did the private-key holder sign this? | private key | anyone with the public key | integrity + authenticity + non-repudiation |
| Encryption | Can outsiders read it? | key | — | confidentiality |

### Terms

- [Hash function]{.k}: maps any input to a fixed-length [digest]{.k}. [Deterministic]{.k}: same input → same digest. [Avalanche effect]{.k}: one changed bit → a completely different digest. [One-way]{.k} ([preimage resistant]{.k}): easy to compute, infeasible to reverse. [Collision resistant]{.k}: infeasible to find two inputs with the same digest (collisions exist, but nobody can find them). [Puzzle-friendly]{.k}: a proof-of-work puzzle has no shortcut. [[📖 Ch1 §2][n1.2]]{.more}
- [MAC]{.k}: a keyed checksum, tag = MAC(K, m), with K shared by sender and receiver; [HMAC]{.k} builds a MAC from a hash. [Authenticated encryption]{.k} (AES-GCM, ChaCha20-Poly1305): confidentiality and integrity in one step. [[📖 Ch1 §7.2][n1.7.2]]{.more} [[📖 Ch1 §8][n1.8]]{.more}

### Facts

- SHA-256: Bitcoin, BIP39 checksum, hash before signing (Lab 3). Keccak-256: Ethereum addresses. HMAC-SHA512: BIP32 and the BIP39 seed. MD5 and SHA-1: broken. [[📖 Ch1 §2][n1.2]]{.more}
- Uses of a hash: file checksum; block linking (change one block and every later link breaks); proof of work, find a nonce with $H(\text{nonce} \| \text{prev} \| \text{tx}) < \text{target}$ (smaller target = harder); address derivation; hash-then-sign; password storage with a per-user salt, H(r, pw), so one precomputed dictionary cannot attack every user. [[📖 Ch1 §3][n1.3]]{.more} [[📖 Ch1 §4][n1.4]]{.more} [[📖 Ch1 §6.3][n1.6.3]]{.more}
- A MAC gives no confidentiality, no non-repudiation (both sides hold K) and no replay protection on its own. [CRC-32 is not a MAC]{.q} (WEP): it has no key, so an attacker can flip bits and fix the checksum. Use authenticated encryption, check the tag before using the plaintext, and add counters against replay. [[📖 Ch1 §7.2][n1.7.2]]{.more} [[📖 Ch1 §8][n1.8]]{.more}

**Traps**: a hash is not encryption · a hash proves the data did not change since it was recorded, not that it is true · a published hash helps only if it comes from a trusted channel, otherwise sign · authenticated encryption does not give freshness · a salt is not secret. [[📖 Ch1 ⚠️][n1.trap]]{.more}

### Short answers

- [Q: What is the difference between a hash and a MAC?]{.q} A hash uses no key, so anyone can compute it; it detects changes only if the expected value is trusted. A MAC uses a secret key shared by two parties, so an attacker who changes the message cannot compute a valid tag. So a MAC gives integrity and authenticity against an active attacker; a hash alone does not. [[📖 Ch1 §7.1][n1.7.1]]{.more}
- [Q: Why is an offline dictionary attack faster and harder to stop than online guessing?]{.q} The attacker already has the hash and tests guesses on their own machine, thousands per second with a GPU. The server never sees the guesses, so rate limits and account lock-out cannot stop it. Online guessing must send each guess to the server, which is slow and can be limited. [[📖 Ch1 §6.2][n1.6.2]]{.more}
- [Q: Which tool fits which job?]{.q} Checking a download: a hash from a trusted channel, or a signature. Two servers that share a key: a MAC or authenticated encryption. Blockchain transactions and public software: a signature, because anyone can verify it but only the signer can make it. Passwords: a per-user salt and a hash. Secret data: authenticated encryption. Replay: a counter or challenge, plus a MAC or signature. [[📖 Ch1 §1][n1.1]]{.more} [[📖 Ch1 §9][n1.9]]{.more}

## 2 · Diffie–Hellman Key Exchange


::: chap
[📖 Full notes: Chapter 2 · Diffie–Hellman 密钥交换][n2]
:::


### Terms

- [Diffie–Hellman (DH)]{.k}: two parties with no shared secret agree on one over a public channel. DH does not encrypt; a [KDF]{.k} (e.g. HKDF) turns the secret into symmetric keys. [[📖 Ch2 §1][n2.1]]{.more} [[📖 Ch2 §3][n2.3]]{.more}
- [ECDH]{.k}: everyone knows the curve and the [base point]{.k} G. Alice sends $Y_A = x_A G$ and Bob sends $Y_B = x_B G$; both compute $K = x_A Y_B = x_B Y_A = x_A x_B G$. Getting $x_A$ from $Y_A$ is infeasible, so a passive eavesdropper cannot compute K. [[📖 Ch2 §2][n2.2]]{.more} [[📖 Ch2 §4.1][n2.4.1]]{.more}
- [Ephemeral]{.k} key: new for each session and deleted after use (not "short"). [Static]{.k} key: the same every time. [Forward secrecy]{.k}: a long-term key stolen later does not reveal sessions recorded earlier. [[📖 Ch2 §6][n2.6]]{.more}

### Facts

- [MITM]{.k}: [Eve sends her $Y_E$ to Bob instead of $Y_A$, and $Y_E$ to Alice instead of $Y_B$ → she shares $x_A Y_E$ with Alice and $x_B Y_E$ with Bob → she decrypts, reads, changes and re-encrypts every message]{.s}. [Root cause: the public values are not authenticated.]{.k} [[📖 Ch2 §4.2][n2.4.2]]{.more} [[📖 Ch2 §9][n2.9]]{.more}

| Countermeasure | Stops MITM? |
|---|---|
| Send H($Y_A$) with $Y_A$ | No: Eve sends H($Y_E$) |
| Encrypt $Y_A$ with AES first | Impossible: no shared key yet |
| Server signs the handshake; client checks the certificate | Yes: Eve lacks the private key |
| Authenticate only the server | Yes: the client proves itself later, inside the channel |
| Compare fingerprints by phone or in person | Yes |
| Trust on first use (SSH) | Not on the first connection; yes later |
| User clicks through a certificate warning | No |

- Key derivation: Lab 4 uses SHA-256(str(k)) of the shared point's x-coordinate as the AES key; SSH derives encryption keys, MAC keys and IVs; TLS 1.3 derives handshake and traffic keys. [[📖 Ch2 §3][n2.3]]{.more}
- TLS key roles: the certificate's [long-term signing key]{.k} authenticates the server · [ephemeral key agreement]{.k} gives a fresh secret · [symmetric traffic keys]{.k} protect the data. TLS 1.3 removed static RSA key transport and static DH (RSA signatures stay), so every connection has forward secrecy. [Forward secrecy protects past sessions only: a stolen long-term key still allows impersonation in future.]{.q} [[📖 Ch2 §6][n2.6]]{.more}
- Lab 4 / Quiz 3 chat problems: public keys not authenticated (MITM); key pairs reused from files, so every session gets the same AES key and there is no forward secrecy; the AES-CTR counter restarts; no integrity check; random.randint for keys. [[📖 Ch2 §8][n2.8]]{.more}
- [ECIES]{.k} (Assignment 2): the sender's ephemeral key and the recipient's long-term public key do ECDH, then HKDF and AES-GCM. The recipient need not be online. [[📖 Ch2 §7][n2.7]]{.more}

### Short answers

- [Q: Why does unauthenticated DH fail against an active attacker?]{.q} The public values carry no proof of who sent them. An attacker in the middle replaces $Y_A$ and $Y_B$ with their own $Y_E$, so each victim shares a key with the attacker instead of with each other. The attacker decrypts, reads and re-encrypts all traffic, and nobody notices, because each side completes a normal DH exchange. The fix is to authenticate the public values, e.g. with a signature over the handshake checked with a certificate. [[📖 Ch2 §4.2][n2.4.2]]{.more} [[📖 Ch2 §5][n2.5]]{.more}
- [Q: Explain forward secrecy and how ephemeral DH provides it.]{.q} Forward secrecy means that if a long-term key is stolen later, sessions recorded earlier stay secret. With ephemeral DH, each session uses fresh private values that are deleted after the handshake, and the long-term key is used only to sign. So a later key theft cannot recompute the old shared secrets. [[📖 Ch2 §6][n2.6]]{.more}

## 3 · HTTPS, TLS and Digital Certificates ★★★ (sample question)

::: chap
[📖 Full notes: Chapter 4 · HTTPS、TLS 与证书][n4]
:::



### Terms

- [Public key substitution problem]{.k}: a signature shows which private key signed, not who owns the key, so an attacker can swap Alice's published key for their own. [[📖 Ch4 §1][n4.1]]{.more}
- [Certificate]{.k}: a CA-signed statement that binds an identity (the domain names in the [SAN]{.k}, Subject Alternative Name) to a public key. It also has the issuer, a serial number, the [validity period]{.k} (not-before, not-after), Basic Constraints (CA or not) and Key Usage / EKU. Certificates are public; anyone can copy one. [[📖 Ch4 §2][n4.2]]{.more}
- [CSR]{.k}: signed with the applicant's private key to prove possession; the [RA]{.k} checks identity or domain control; the CA never sees the private key. [DV]{.k}: only domain control is checked; [OV]{.k} / [EV]{.k}: the organisation is checked too. [[📖 Ch4 §3][n4.3]]{.more}
- [Trust anchor]{.k}: the root where path checking stops. [Trust store]{.k}: the roots a client accepts. [CertificateVerify]{.k}: the server signs the TLS 1.3 handshake with its private key. [[📖 Ch4 §4][n4.4]]{.more} [[📖 Ch4 §6][n4.6]]{.more}

### Facts

- Chain: [root CA (self-signed, installed by the vendor or administrator) → intermediate CA → server certificate]{.s}. The server sends its own certificate and the intermediates. Intermediates keep the root key away from daily use and limit damage. [[📖 Ch4 §4][n4.4]]{.more}
- Client checks: [a path to a trusted anchor → the hostname matches the SAN → validity time, signatures, CA constraints, allowed use → revocation]{.s}. [[📖 Ch4 §5][n4.5]]{.more}

| Failure | What the client cannot confirm |
|---|---|
| Expired certificate | that it is valid now |
| Wrong hostname | that this is the service you wanted |
| Missing intermediate | that a complete path exists |
| Unknown root | an approved starting point of trust |
| Revoked certificate | that it is still acceptable |

- TLS 1.3: [ClientHello + key share → ServerHello + key share → (EC)DHE secret, handshake keys → encrypted EncryptedExtensions, Certificate, CertificateVerify, Finished → client sends Finished → traffic keys]{.s}. Only in TLS 1.2: ServerKeyExchange, the old ChangeCipherSpec role, static RSA. [[📖 Ch4 §7][n4.7]]{.more}
- [Expiry]{.k} is the planned end; [revocation]{.k} is an early withdrawal (key compromise, misissuance, loss of authorisation), and the key must be replaced too. [Certificate Transparency (CT)]{.k}: public logs make issuance auditable but revoke nothing. Public TLS certificates issued from 15 March 2026 last at most 200 days, so renewal is automated with [ACME]{.k}. [[📖 Ch4 §8][n4.8]]{.more}
- Self-signed certificate: strong crypto but no trust. Use it only when it is trusted through an independent channel (e.g. built into the app), with hostname checks still on. Public CA → public sites; private CA → internal managed devices; self-signed → small or development setups. [[📖 Ch4 §9][n4.9]]{.more}
- DNS poisoning beats HTTP but not HTTPS, because the certificate is checked for the original hostname. HTTPS fails only with another failure: a clicked-through warning, a stolen server key, a misissued certificate or a malicious root on the device. [[📖 Ch4 §10.1][n4.10.1]]{.more}
- [mTLS]{.k}: the client also shows a certificate (machine identity); authorisation is still separate. Keep private keys in an [HSM]{.k}. Many outages are operational: a renewed certificate not reloaded, a forgotten endpoint, an incomplete chain. [[📖 Ch4 §11][n4.11]]{.more}

**Traps**: the padlock means encryption and a checked domain, not an honest site · a root is trusted because it was installed, not because it is signed · revocation does not make a stolen key safe · CT does not revoke · a self-signed certificate lacks trust, not strong crypto. [[📖 Ch4 ⚠️][n4.trap]]{.more}

### Short answers

- [Q: Why does copying a bank's certificate not let an attacker impersonate the bank?]{.q} The certificate is public. In TLS 1.3 the server must sign the handshake (CertificateVerify) with the private key that matches the certificate, and the client checks the signature with the public key in the certificate. The signature covers the fresh handshake, so an old one cannot be replayed. Without the private key, the attacker fails. [[📖 Ch4 §6][n4.6]]{.more}
- [Q: Why does a client trust a self-signed root certificate?]{.q} A self-signature proves nothing, because anyone can make one. The root is trusted because the OS or browser vendor (root programme) or an administrator put it in the trust store. Adding a root is a security decision, because it widens which identities the client accepts. [[📖 Ch4 §4][n4.4]]{.more}
- [Q: Compare CRL and OCSP.]{.q} A CRL is a signed list of revoked certificates published by the CA; the client needs a fresh list. With OCSP the client asks a responder about one certificate and gets a signed status, which raises privacy and availability concerns. With OCSP stapling the server supplies the signed status, and the client still checks that it is valid and fresh. [[📖 Ch4 §8.2][n4.8.2]]{.more}
- [Q: Why can a company proxy read HTTPS traffic without warnings?]{.q} The administrator installed the company root CA in the laptops' trust store. The proxy uses it to issue a certificate for each requested hostname, and this certificate passes every check. So the browser's TLS connection ends at the proxy, which decrypts the traffic and opens a second TLS connection to the real website. [[📖 Ch4 §10.2][n4.10.2]]{.more}

## 4 · SSH Security


::: chap
[📖 Full notes: Chapter 5 · SSH][n5]
:::


### Terms

- [SSH]{.k} replaces telnet and rsh, which send passwords and commands in cleartext. It gives an encrypted, authenticated channel for remote admin, commands, SFTP/SCP and port forwarding. It does not protect the endpoints and is not a full VPN. [[📖 Ch5 §1][n5.1]]{.more}
- SSH-2 layers: [Transport Layer Protocol]{.k} (server authentication, key exchange, encryption) → [User Authentication Protocol]{.k} (authenticates the client inside the channel) → [Connection Protocol]{.k} (multiplexes channels: session, x11, direct-tcpip = local forwarding, forwarded-tcpip = remote forwarding). [[📖 Ch5 §2][n5.2]]{.more} [[📖 Ch5 §8][n5.8]]{.more}
- [Host key fingerprint]{.k}: a hash of the server's public host key. [Trust on first use (TOFU)]{.k}: accept the key the first time, store it in known_hosts, warn if it changes. [Passphrase]{.k}: encrypts the private-key file on the client; it is never sent. [[📖 Ch5 §4][n5.4]]{.more} [[📖 Ch5 §5][n5.5]]{.more}

### Facts

- Steps: [the client connects → the server sends its host key → they negotiate and open a secure channel → the user logs in]{.s}. Transport: ephemeral DH (Curve25519) signed with the host key → encryption keys, MAC keys, IVs. Legacy, do not re-enable: DSS, RC4, 3DES, CBC-only, SHA-1. [[📖 Ch5 §2][n5.2]]{.more} [[📖 Ch5 §3][n5.3]]{.more}
- TLS trusts a CA-signed certificate checked automatically; SSH trusts a host key checked by the user's fingerprint check (or host certificates at scale). [[📖 Ch5 §4][n5.4]]{.more}
- Hardening: no public management ports (use a [bastion host]{.k}, an identity-aware broker or a VPN); no direct root login; disable password login; use keys or short-lived certificates; least privilege (AllowUsers, restricted commands, limited forwarding). [Changing port 22 only reduces scanning noise.]{.q} [Agent forwarding]{.k} lets a compromised middle host use your agent, so prefer [ProxyJump]{.k}. [[📖 Ch5 §6][n5.6]]{.more}
- Cloud access: direct public SSH (simple; every machine exposed) / VPN (broad network access) / bastion (central policy and logs, but a high-value target) / identity-aware broker (checks cloud IAM, then opens a temporary path). [[📖 Ch5 §7][n5.7]]{.more}

| Command | Listener on | Who connects to the target |
|----------------|------|-----------|
| `ssh -L 8080:127.0.0.1:80 user@web` | client | the server side; 127.0.0.1 = the server itself |
| `ssh -R 10123:127.0.0.1:123 user@web` | server | the client side; the client's own port 123 |
| `ssh -D 1080 user@bastion` | client (SOCKS proxy) | the server side; any destination |

### Short answers

- [Q: Why is public-key authentication better than passwords?]{.q} The private key never leaves the client; the client sends only a signature over session data, which cannot be replayed (Week 6 Protocol 9). The server stores only public keys, so a server breach does not allow impersonation. Keys cannot be guessed, phished or reused like passwords, so password login can be turned off. [[📖 Ch5 §5][n5.5]]{.more}
- [Q: What does TOFU fail to prevent?]{.q} A man-in-the-middle on the very first connection: the attacker's key is stored as the real one. TOFU only detects a changed key later. Fix: compare the fingerprint with a trusted source, or use host certificates. [[📖 Ch5 §4][n5.4]]{.more}
- [Q: Only the bastion can reach db.internal:8080. Open it at localhost:9000.]{.q} `ssh -L 9000:db.internal:8080 user@bastion`. The listener is on your laptop; the bastion connects to db.internal:8080 for you. [[📖 Ch5 §10.1][n5.10.1]]{.more}
- [Q: Why can port forwarding bypass network segmentation, and how do you control it?]{.q} The SSH server can often reach internal hosts that the client cannot. Local or dynamic forwarding lets a user reach them through it, and remote forwarding can publish a laptop service into another network. The firewall sees only encrypted SSH. So disable forwarding for restricted accounts, and grant it as a separate permission with limited destinations. [[📖 Ch5 §9][n5.9]]{.more} [[📖 Ch5 §11][n5.11]]{.more}

## 5 · Wireless Network Security


::: chap
[📖 Full notes: Chapter 6 · 无线网络安全][n6]
:::


### Terms

- [Access point (AP)]{.k}: connects wireless clients to the wired LAN ([infrastructure mode]{.k}; [ad hoc mode]{.k} = client to client). [Beacon frame]{.k}: the AP advertises; [probe request]{.k}: the client asks. [SSID]{.k}: a network name that anyone can broadcast, so it proves nothing. [[📖 Ch6 §1][n6.1]]{.more} [[📖 Ch6 §2.1][n6.2.1]]{.more}
- [Four-way handshake]{.k}: confirms knowledge of the shared secret and installs fresh session keys; it is not a user login. [SAE]{.k} (WPA3-Personal); [802.1X/EAP]{.k} (enterprise, one identity per user or device); [PMF]{.k} (Protected Management Frames); [AES-CCMP]{.k}; [rogue AP]{.k}; [evil twin]{.k} (a rogue AP that copies a trusted SSID); [jamming]{.k}; [WPS]{.k}. [[📖 Ch6 §2.2][n6.2.2]]{.more} [[📖 Ch6 §7][n6.7]]{.more}

### Facts

- Joining: WPA2-Personal [open-system authentication → association → four-way handshake with the PSK]{.s}; WPA3-Personal uses SAE instead of open-system authentication; enterprise adds EAP before the four-way handshake. [[📖 Ch6 §2.2][n6.2.2]]{.more}
- Wi-Fi 4 / 5 / 6 / 6E / 7 = 802.11n / ac / ax / ax at 6 GHz / be. [A new generation improves performance, not security.]{.q} [[📖 Ch6 §1][n6.1]]{.more}
- Threats: confidentiality (eavesdropping, traffic analysis); integrity and identity (evil twin, spoofing, downgrade, frame injection); availability (jamming, deauthentication abuse); operations (insecure defaults, shared credentials, unpatched APs). [[📖 Ch6 §3][n6.3]]{.more}
- PMF (required by WPA3) reduces forged disconnects on established links. It does not stop jamming and does not verify an SSID. Jamming attacks availability; near the AP, many clients lose service. [[📖 Ch6 §5][n6.5]]{.more}
- WEP = RC4 + 24-bit IV + one shared key + CRC-32. A reused IV means a reused keystream: $C_1 \oplus C_2 = P_1 \oplus P_2$. [[📖 Ch6 §6][n6.6]]{.more}
- Evil twin: [forge deauthentication frames → broadcast the same SSID as an open network → show a fake router page that asks for the Wi-Fi password]{.s}. [Do not help: a hidden SSID, PMF, new Wi-Fi hardware.]{.q} [[📖 Ch6 §9.1][n6.9.1]]{.more} [[📖 Ch6 §9.3][n6.9.3]]{.more}
- WPS: the 8-digit PIN is checked in two halves, so each half can be guessed online; disable WPS. [[📖 Ch6 §10][n6.10]]{.more}
- Secure configuration: WPA3-SAE or 802.1X, never WEP; transition mode only if needed; require PMF; a long random passphrase; change the default SSID and admin password; patch the firmware; separate guest and IoT networks; disable WPS; monitor for rogue APs. [[📖 Ch6 §11][n6.11]]{.more}

### Short answers

- [Q: State WEP's three design mistakes and the lesson from each.]{.q} Shared credentials: one key for all users and devices, so a leak exposed the whole WLAN and the key was hard to change; lesson: distinct identities (enterprise authentication or per-device credentials). Weak integrity: CRC-32 allowed controlled bit changes; lesson: authenticated encryption. Nonce reuse: the 24-bit IV space made keystream reuse certain; lesson: large nonces, unique under a key, also after a reboot. [[📖 Ch6 §6][n6.6]]{.more}
- [Q: Why can a weak WPA2-PSK passphrase be guessed offline? What does SAE change?]{.q} The four-way handshake contains values derived from the passphrase, with the SSID as a salt. An attacker who captures it (often after forging deauthentication frames) tests guesses on their own GPUs, and the AP cannot limit the guesses. SAE resists passive offline guessing: a recorded exchange gives nothing to test against, so every guess needs a live exchange with the AP. Weak passwords and transition mode still matter; use a long random passphrase and separate guest and IoT networks. [[📖 Ch6 §8.1][n6.8.1]]{.more} [[📖 Ch6 §8.5][n6.8.5]]{.more}
- [Q: Your laptop uses a café's WPA2 Wi-Fi. Why should banking still use HTTPS?]{.q} WPA2 protects only the link from the laptop to the AP. After the AP the traffic is decrypted and visible to the AP owner and the networks beyond; with a shared passphrase, other customers may decrypt it too. HTTPS protects the connection end to end, from the browser to the bank, even on an open or hostile network. [[📖 Ch6 §4][n6.4]]{.more}
- [Q: How does a client avoid an evil twin on an 802.1X network?]{.q} It must validate the authentication server's certificate against the expected CA and server name, ideally through a managed connection profile, so users are never asked to trust an unknown certificate. The attacker cannot present a valid certificate for the real server. EAP-TLS avoids sending passwords at all. Do not auto-join unknown networks, and monitor for rogue APs. [[📖 Ch6 §9.2][n6.9.2]]{.more}

## 6 · Blockchain and Smart Contracts


::: chap
[📖 Full notes: Chapter 7 · 区块链与智能合约][n7]
:::


### Terms

- [Blockchain]{.k}: a shared, [append-only ledger]{.k} kept by many nodes under common validation rules: replicated, linked (each block stores the previous block's hash) and agreed (consensus picks the history). No single administrator. [[📖 Ch7 §1][n7.1]]{.more}
- [Double-spending]{.k}: spending the same asset twice. [Consensus]{.k}: [agreement]{.k}, [validity]{.k}, [termination]{.k}. [Finality]{.k}: accepted blocks will not change. [[📖 Ch7 §2][n7.2]]{.more} [[📖 Ch7 §4.1][n7.4.1]]{.more}
- [EVM]{.k}: makes every node compute the same new state. [Externally owned account (EOA)]{.k}: controlled by a private key; can start transactions. [Contract account]{.k}: controlled by its code; acts only when called. Both use 20-byte addresses. [[📖 Ch7 §6][n7.6]]{.more}
- [Nonce]{.k}: a per-account sequence number. [Gas]{.k}: a unit of work. [Smart contract]{.k}: code and state at an address. [Oracle]{.k}: brings outside facts on-chain. [Bridge]{.k}: links two chains. [[📖 Ch7 §7][n7.7]]{.more} [[📖 Ch7 §8][n7.8]]{.more} [[📖 Ch7 §9][n7.9]]{.more}

### Facts

- Bitcoin white paper: Satoshi Nakamoto, 2008: a P2P network plus a proof-of-work hash chain; the longest chain wins. Confirmed payments are hard to reverse, and a lost key cannot be recovered. [[📖 Ch7 §2][n7.2]]{.more}
- Transaction path: [the wallet signs → broadcast → nodes check the signature and the funds → a block → consensus]{.s}. More confirmations mean more confidence. [[📖 Ch7 §3][n7.3]]{.more}
- Byzantine generals: no consensus if 1/3 or more are traitors. FLP: no protocol guarantees every property. So blockchains assume an honest majority, and security is probabilistic. [[📖 Ch7 §4.2][n7.4.2]]{.more} [[📖 Ch7 §4.3][n7.4.3]]{.more}

| | PoW | PoS | BFT-style voting |
|---|---|---|---|
| Used by | Bitcoin | Ethereum | permissioned networks |
| Who adds the block | the miner who solves the hash puzzle first | validators lock ETH as stake; a proposer suggests, others attest | known validators vote |
| Notes | open; costly to make, cheap to verify; energy | rewards and penalties; finality | fast finality |

- [51% attack]{.k}: redo the proof of work of a block and all later blocks, and overtake the honest chain (more than half the hash power). It can reverse the attacker's own payments and censor transactions; it cannot steal other people's coins. [[📖 Ch7 §5][n7.5]]{.more}
- Transaction fields: nonce, fee settings, to, value, data, signature. The nonce orders transactions and stops replay. [Two pending transactions with the same nonce: at most one is confirmed, probably the one with the higher fee.]{.q} A simple transfer uses 21,000 gas; fee = gas used × effective gas price; the priority fee is a tip. [Out of gas: state is reverted, but the fee is still paid.]{.q} An empty "to" creates a contract; data holds the function and its arguments. [[📖 Ch7 §7.1][n7.7.1]]{.more} [[📖 Ch7 §7.2][n7.7.2]]{.more}
- A contract runs deterministic if–then rules and can emit events. Deterministic does not mean correct, and whoever controls upgrades can change the rules. Lab 2 ERC-20 `transfer`: `require` checks → update balances → emit a Transfer event. [[📖 Ch7 §8][n7.8]]{.more}
- [Garbage in, garbage out]{.q}: a contract can check the oracle's format and signature, not the truth. A single price source (one exchange pool) can be manipulated, and bridges concentrate trust. Defences: several independent sources, sanity checks, limits on possible loss. [[📖 Ch7 §9.2][n7.9.2]]{.more} [[📖 Ch7 §9.3][n7.9.3]]{.more}
- Use a blockchain only when several parties need a common state and no single party should control it; otherwise use a database. Five threat layers: user and keys, application, protocol, infrastructure, dependencies. [A valid transaction can still be harmful]{.q}, e.g. a phished signature. Keys authorise; transactions request; contracts execute. [[📖 Ch7 §10][n7.10]]{.more} [[📖 Ch7 §11.2][n7.11.2]]{.more}

### Short answers

- [Q: Why can digital signatures alone not prevent double-spending?]{.q} A signature proves that the key holder authorised a payment, but not that the money is still unspent. Two conflicting payments can both carry valid signatures. Nodes must agree on one order of transactions, and that is the job of consensus. [[📖 Ch7 §2][n7.2]]{.more}
- [Q: Give two reasons why distributed consensus is hard.]{.q} Any two: nodes may crash or act maliciously; the P2P network has faults and delays; there is no global clock, so a slow node cannot be told apart from a failed one. [[📖 Ch7 §4.2][n7.4.2]]{.more}
- [Q: Gas limit vs max fee per gas?]{.q} The gas limit is the most work the transaction may use. The max fee per gas is the highest price the sender will pay per unit of gas. The real fee is gas used × effective gas price; unused gas is not charged. [[📖 Ch7 §7.2][n7.7.2]]{.more}
- [Q: Why does a smart contract need an oracle, and what new risk does it bring?]{.q} Every node must reproduce the same result, so a contract cannot call websites or sensors itself. An oracle submits outside facts as transactions. The contract can check the format and the oracle's authority, not whether the fact is true, so a hacked or manipulated oracle can make correct code pay out wrongly. [[📖 Ch7 §9.1][n7.9.1]]{.more}

## 7 · Cryptocurrency Wallets


::: chap
[📖 Full notes: Chapter 8 · 加密货币钱包][n8]
:::


### Terms

- [Wallet]{.k}: manages keys (authority), not coins; the coins stay on the blockchain. [Hardware wallet]{.k}: the key stays in a secure chip and signs there. [[📖 Ch8 §1][n8.1]]{.more}
- [Private key]{.k}: a random 256-bit number on [secp256k1]{.k} → [public key]{.k} $K = k \cdot G$ (64 bytes, x‖y) → [address]{.k}: the last 20 bytes of the [Keccak-256]{.k} hash of the public key, written with 0x. [EIP-55]{.k}: mixed upper and lower case that catches typing errors. [[📖 Ch8 §2][n8.2]]{.more}
- [Non-deterministic wallet]{.k} ("just a bunch of keys"), [deterministic (seeded) wallet]{.k}, [HD wallet]{.k}; [BIP32]{.k}, [chain code]{.k}, [extended key]{.k} (xprv, xpub), [hardened derivation]{.k}, [BIP44]{.k}, [BIP39]{.k} [mnemonic]{.k}, [passphrase]{.k}, [RFC 6979]{.k}. [[📖 Ch8 §6][n8.6]]{.more} [[📖 Ch8 §7.1][n8.7.1]]{.more}

### Facts

- Each step from private key to address is one-way, so sharing the address is safe. A signature is a tamper-evident seal, not encryption. ECDSA: $z = H(m)$, random $k$, $r = (kG)_x \bmod N$, $s = k^{-1}(z + rd) \bmod N$. [[📖 Ch8 §3][n8.3]]{.more}
- [Reused k]{.q}: both signatures share r, so $k = (z_1 - z_2)/(s_1 - s_2)$ and then the private key $d = (s_1 k - z_1)/r \bmod N$ (the PS3 used a fixed k; Lab 3 used Python's random). Use RFC 6979. [[📖 Ch8 §4][n8.4]]{.more}
- [Cryptography signs bytes, not intentions]{.q}: malware can show one action and submit another, so check the address and amount on the hardware wallet's own screen. Defences: hardware isolation, multisig, verified backups. [[📖 Ch8 §5][n8.5]]{.more}

| | Non-deterministic | Sequential deterministic | HD (BIP32) |
|---|---|---|---|
| Keys | unrelated, random | one seed → a chain | one seed → a tree |
| Backup | every key separately | the seed once | the seed once |
| Compromise | one key = one address | seed leak = all keys | seed leak = all keys |

- BIP32: [seed → HMAC-SHA512 → left 256 bits = master private key, right 256 bits = master chain code]{.s}. Child keys: parent key + chain code + 32-bit index → HMAC-SHA512 → left half = child key, right half = child chain code. xpub derives only public keys (watch-only wallets). Hardened derivation needs the parent private key: xpub plus one leaked normal child key reveals the parent key; a hardened branch does not. [[📖 Ch8 §7.2][n8.7.2]]{.more} [[📖 Ch8 §7.3][n8.7.3]]{.more} [[📖 Ch8 §7.5][n8.7.5]]{.more}
- BIP44: `m/44'/60'/0'/0/0` = purpose / coin type (60 = Ethereum, 0 = Bitcoin) / account / change / address index; `'` = hardened; m = private derivation, M = public. [[📖 Ch8 §8][n8.8]]{.more}
- BIP39: [entropy + checksum (first ENT/32 bits of its SHA-256) → 11-bit groups → words from a 2,048-word list]{.s}: 128 + 4 bits = 12 words; 256 + 8 bits = 24 words. [Words + passphrase → PBKDF2-HMAC-SHA512, 2,048 rounds, salt "mnemonic" + passphrase → 512-bit seed]{.s}. The checksum only catches typing errors; a different passphrase gives a different wallet. [[📖 Ch8 §9][n8.9]]{.more}

### Short answers

- [Q: Why does BIP32 use a chain code?]{.q} The chain code adds extra random data to each derivation. Without it, anyone who saw a parent public key could derive all its child public keys and link every address in the wallet. With it, deriving child keys also needs the chain code, which protects privacy. So an extended public key is more sensitive than a normal public key. [[📖 Ch8 §7.4][n8.7.4]]{.more}
- [Q: Why is mnemonic exposure more likely than brute force?]{.q} A correctly generated 12-word mnemonic has 128 bits of entropy, about $2^{128}$ choices, so guessing is infeasible. Attackers target the recovery channel instead: phishing sites and fake support staff, malware reading the screen or clipboard, screenshots, cloud-synced notes and photos, stolen paper backups, and weak self-made phrases. Keep it offline, test recovery, and never type it into a website. [[📖 Ch8 §11][n8.11]]{.more}

## 8 · Secure Cloud Storage and Data Sharing ★★★ (Assignment 2)

::: chap
[📖 Full notes: Chapter 9 · 安全云存储与共享][n9]
:::



### Terms

- [Data plane]{.k}: reads and writes content. [Control plane]{.k}: changes permissions, keys, retention and replication; changing a policy or deleting keys also does damage. [[📖 Ch9 §1.1][n9.1.1]]{.more}
- [Shared responsibility model]{.k}: the provider secures the infrastructure; the customer secures data, identities, configuration and use. The customer does the most in [IaaS]{.k}, less in [PaaS]{.k}, least in [SaaS]{.k}, but always stays accountable. [[📖 Ch9 §1.3][n9.1.3]]{.more}
- [Envelope encryption]{.k}: a [DEK]{.k} encrypts each object; a [KEK]{.k} held in the [KMS]{.k} wraps the DEK; root keys protect KEKs. [BYOK]{.k}: the customer supplies the key material; [HYOK]{.k}: the key stays outside the cloud. [[📖 Ch9 §6][n9.6]]{.more} [[📖 Ch9 §7.6][n9.7.6]]{.more}
- [Authentication]{.k}: who is asking. [Authorisation]{.k}: what they may do. [Least privilege]{.k}: only what the task needs. [RBAC]{.k}: by role; [ABAC]{.k}: by attributes; [CP-ABE]{.k}: the policy is inside the ciphertext. [[📖 Ch9 §8][n9.8]]{.more}

### Facts

- Data lifecycle: [create (classify, assign an owner) → store (encrypt, replicate, log) → use (decrypt only where authorised) → share (keep accountability) → archive or delete (verify deletion)]{.s}. [[📖 Ch9 §2][n9.2]]{.more}
- Threats are mostly configuration and identity: one bad policy exposes a whole bucket (public links, inherited permissions); a leaked API key works from anywhere; ransomware uses stolen sessions and deletes snapshots, versions or keys. [Replicas are not backups]{.q}: use immutable backups under a separate identity and control plane, and test restores. [[📖 Ch9 §3][n9.3]]{.more}

| Scope | Who can still see plaintext |
|---|---|
| At rest | the service (it decrypts for any authorised request) |
| In transit (TLS) | both endpoints, including the cloud server |
| In use | the application and machine processing it |
| Client-side | only clients holding the key |
| End-to-end | only the communicating endpoints |

- Symmetric encryption (AES) is fast, but every reader needs the key, and one key for too much data makes a large blast radius. Public-key cryptography solves key distribution but is slow. [Hybrid encryption]{.k}: a random data key encrypts the file; the data key is protected per recipient or by a KMS. [[📖 Ch9 §4][n9.4]]{.more}
- [KMS decrypt permission = permission to read the data.]{.q} Recovery needs separation of duties (quorum approval). [[📖 Ch9 §7.2][n9.7.2]]{.more} [[📖 Ch9 §7.5][n9.7.5]]{.more}
- RBAC (reader, editor, backup operator) suits stable jobs but risks role explosion; ABAC decides by subject, resource, action and context. Both are enforced by a server that sees the plaintext. [[📖 Ch9 §8.3][n9.8.3]]{.more}
- E2EE protects content, not endpoints or metadata (identities, timing, size, who talks to whom). [[📖 Ch9 §9][n9.9]]{.more}
- [Sharing = key distribution.]{.q} Server policy (the server stays trusted) · shared secret (no accountability) · per-recipient wrapping (clear identities, remove one person) · group key (rekey when members change) · public link (a bearer credential). [[📖 Ch9 §10.2][n9.10.2]]{.more}
- [Revocation cannot recall plaintext already obtained]{.q}; only new versions under a new DEK are protected. [[📖 Ch9 §10.3][n9.10.3]]{.more}
- CP-ABE: policy "IT dept. OR (manager AND marketing)": Sarah (manager, IT dept.) can decrypt; Kevin (manager, sales) cannot. The storage can be untrusted, but revocation is hard and the attribute authority must be trusted. [[📖 Ch9 §11][n9.11]]{.more}

### Short answers

- [Q: "Our cloud data is encrypted, so it is secure." Why is this incomplete?]{.q} It does not say which scope. With encryption at rest the service still decrypts for any authorised request, so a misconfigured policy or a stolen credential exposes plaintext, and the provider can read it. Encryption in transit protects only the network path; the server sees plaintext. Data in use is plaintext in memory. Only client-side or end-to-end encryption keeps plaintext from the provider, and even then endpoints and metadata are exposed. The claim also ignores integrity, key management and availability. [[📖 Ch9 §5][n9.5]]{.more}
- [Q: How can a leaked API credential become a data breach in seconds? Give three defences.]{.q} The key appears in a repository, log, build artifact or endpoint, where scanners find it fast. The attacker calls the provider API from anywhere, and the provider sees a valid credential, so the attacker can list, read, share or delete data. Defences (any three): workload identity and short-lived tokens; a managed secrets service; least-privilege policies; a tested rotation and revocation process; monitoring of unusual API use. [[📖 Ch9 §3.2][n9.3.2]]{.more}
- [Q: Rotation vs re-wrapping vs full re-encryption. When is full re-encryption needed?]{.q} Rotation makes a new key version active for future use, while old ciphertext still depends on old versions. Re-wrapping protects an existing DEK under a new KEK without changing the file. Full re-encryption encrypts the data again under a new DEK. It is needed when the DEK itself is exposed, or when a removed user who knows the old DEK must be kept out of future versions. [[📖 Ch9 §7.4][n9.7.4]]{.more}

## 9 · Secure Two-Party Computation


::: chap
[📖 Full notes: Chapter 10 · 安全两方计算][n10]
:::


### Terms

- [Secure multi-party computation (MPC)]{.k}: parties compute an agreed result without giving anyone all the raw inputs; [2PC]{.k} is the two-party case. Benefit: data minimisation. Costs: complexity and speed. [[📖 Ch10 §1][n10.1]]{.more}
- [Ideal world]{.k}: a [trusted third party]{.k} takes x and y, returns only the authorised output F(x, y) and forgets everything. [Real world]{.k}: only protocol messages. [[📖 Ch10 §2][n10.2]]{.more}
- [View]{.k}: a party's input, random values, received messages and output. [Simulator]{.k}: a thought experiment that rebuilds the view from the party's own input and output. [[📖 Ch10 §3][n10.3]]{.more}
- [Semi-honest]{.k}: follows the protocol but analyses everything. [Malicious]{.k}: sends false messages, stops early, biases the result. [[📖 Ch10 §5][n10.5]]{.more}
- [Oblivious transfer (OT)]{.k}, [secret sharing]{.k} with a t-of-n [threshold]{.k}, [private set intersection (PSI)]{.k}, [homomorphic encryption]{.k}, [trusted execution environment (TEE)]{.k}. [[📖 Ch10 §6][n10.6]]{.more} [[📖 Ch10 §7][n10.7]]{.more} [[📖 Ch10 §11][n10.11]]{.more}

### Facts

| Function | What the output also reveals |
|---|---|
| Comparison (millionaires) | is the other value above or below mine |
| Sum of two inputs, x + y | the other input exactly |
| Sum of three or more | the total of the others only |
| PSI | which of my items the other also has |
| Size of the intersection | how many overlap, not which |

- Repeated queries can binary-search an input (about 7 queries for a value from 0 to 100), so limit and audit queries. MPC does not make inputs true. With more than two parties, privacy holds only while the corrupted or colluding parties stay below the threshold. [[📖 Ch10 §4][n10.4]]{.more} [[📖 Ch10 §5][n10.5]]{.more}
- OT: the receiver picks one of two values and learns only that one; the sender does not learn the choice. GMW (1987): OT can solve any two-party computation problem. [[📖 Ch10 §6][n10.6]]{.more}
- Secret sharing: one share reveals nothing useful; with 3-of-4, any 3 holders rebuild the secret, and bribing 2 is not enough. [[📖 Ch10 §7][n10.7]]{.more}
- MPC distributes trust (communication cost) · homomorphic encryption computes on ciphertext (key ownership, compute cost) · a TEE isolates plaintext in hardware (side channels, trust in the vendor). [MPC moves trust assumptions; it does not remove them.]{.q} [[📖 Ch10 §10][n10.10]]{.more} [[📖 Ch10 §11][n10.11]]{.more}
- Uses: joint fraud detection, PSI for shared customers, cross-organisation statistics, threshold signing for high-value keys. [[📖 Ch10 §9][n10.9]]{.more}

### Short answers

- [Q: What may each participant learn in a secure two-party computation? Why?]{.q} Each participant learns its own input, its authorised output and whatever follows from these two, and nothing else. The reason is the simulation definition: a simulator given only that party's input and output can produce a view (random values, received messages, output) that looks the same as the real one. So the real messages carry no extra information about the other party's input. This holds under the assumed threat model, semi-honest or malicious. [[📖 Ch10 §3][n10.3]]{.more} [[📖 Ch10 §12][n10.12]]{.more}
- [Q: Why can a perfectly secure MPC protocol still reveal a private input?]{.q} The protocol only promises to leak nothing beyond the output, and the output may reveal a lot. If two parties compute x + y, Alice learns y by subtracting x. Even a one-bit comparison leaks the input if it can be repeated, because the other party can binary-search it. So output controls and query limits are needed. [[📖 Ch10 §4][n10.4]]{.more}
- [Q: Why does secret sharing spread trust only if the shares are really separated?]{.q} The threshold assumes the holders fail or are corrupted independently. If two shares sit in accounts run by the same administrator, one compromise or one dishonest person gets both. Copying shares into one backup weakens confidentiality the same way, and losing too many destroys availability. [[📖 Ch10 §7][n10.7]]{.more}

## 10 · Software Supply Chain Security


::: chap
[📖 Full notes: Chapter 11 · 软件供应链安全][n11]
:::


### Terms

- [Transitive dependency]{.k}: a dependency of a dependency, never chosen directly. [Software supply chain]{.k}: the people, components, tools, infrastructure and processes of the development lifecycle (OSS libraries, GitHub, CI/CD, compilers, registries such as npm, PyPI, Docker Hub). [Supply chain attack]{.k}: compromise one component to attack downstream software or users. [[📖 Ch11 §2][n11.2]]{.more} [[📖 Ch11 §3][n11.3]]{.more}
- [Continuous integration (CI)]{.k}: each change is built and tested automatically on a [runner]{.k}. [Continuous deployment (CD)]{.k}: the tested artifact is deployed to [staging]{.k} and production automatically. [Rolling deployment]{.k}: replace instances one by one; [blue-green]{.k}: switch traffic between two environments; [canary release]{.k}: 5% → 20% → 50% → 100% of traffic. [[📖 Ch11 §4.1][n11.4.1]]{.more} [[📖 Ch11 §4.3][n11.4.3]]{.more}
- [Provenance]{.k}: a record of which commit, pipeline and builder made an artifact. [Reproducible build]{.k}: others rebuild it and compare hashes. [Typosquatting]{.k}: a malicious package with a look-alike name. [Patch gap]{.k}: transitive or forked copies stay unpatched. [[📖 Ch11 §7][n11.7]]{.more} [[📖 Ch11 §8.1][n11.8.1]]{.more} [[📖 Ch11 §9][n11.9]]{.more}

### Facts

- 98% of audited commercial codebases contain OSS; 87% contain known OSS vulnerabilities; 64% of OSS components are transitive dependencies. Log4Shell (CVE-2021-44228, December 2021): one library flaw hit millions of apps. SolarWinds (2020): a compromised build environment put a backdoor into a signed official update. [[📖 Ch11 §1][n11.1]]{.more} [[📖 Ch11 §2][n11.2]]{.more} [[📖 Ch11 §3][n11.3]]{.more}
- Secrets (GITHUB_TOKEN, cloud credentials, signing keys) are injected into the runner when a job runs. [Whoever controls the code that runs in CI controls the tokens.]{.q} A CI job must never get CD or production secrets. [[📖 Ch11 §5.2][n11.5.2]]{.more} [[📖 Ch11 §6][n11.6]]{.more}

| Pipeline risk | Mitigation |
|---|---|
| Untrusted pull-request code runs with secrets (`pull_request_target` + checkout + build script) | build PRs with `pull_request` (no secrets); protected branches, required review, signed commits |
| Compromised or reused self-hosted runner | short-lived, sandboxed runners; no shared workspace |
| Compromised third-party action or image (mutable tag like v1) | pin to a full commit SHA; lockfiles; review every update |
| Long-lived, broad credentials | least-privilege tokens, OIDC short-lived credentials, secret scanning |
| Artifact replaced after the build | checksums, signatures, provenance, reproducible builds |

- Dependency attacks: typosquatting (`pip install sklearn` instead of `scikit-learn`; AI tools can invent package names); a compromised maintainer (event-stream added flatmap-stream to steal Copay wallet keys); XZ Utils (2024: a trusted contributor hid a backdoor in release tarballs); build systems (SolarWinds, Codecov). Review a library when you add it and at every upgrade. A fix comes as a new version: registries do not allow changing a published version, because other software still uses it. [[📖 Ch11 §8][n11.8]]{.more}
- Unsafe deployment: default credentials, `debug=True` in production, exposed Redis, running as root, privileged containers, `verify=False`. [A secret deleted in a new commit stays in Git history, so revoke and rotate it.]{.q} Use a vault and secret scanning (Gitleaks, TruffleHog). [[📖 Ch11 §10][n11.10]]{.more}

### Short answers

- [Q: Why is a CI/CD pipeline a security-critical trust boundary?]{.q} High complexity: many tools, dependencies, scripts and runners create attack surface. Many interactions: it connects developers, OSS, repositories, registries and environments. High privilege: it can read code, publish packages, run commands, deploy services and use secrets. Secrets are injected into the runner at run time, so any code running in a job can use them, and one compromise can reach production and every downstream user. [[📖 Ch11 §5.1][n11.5.1]]{.more}
- [Q: A vendor posts the SHA-256 of each release on its download page. What is the limit, and what else helps?]{.q} A hash helps only if the expected value comes from a trusted channel; an attacker who controls the download server can replace both the file and the hash. A signature cannot be forged without the vendor's private key. Provenance shows which commit and pipeline built the file, and a reproducible build lets others rebuild and compare. A signature alone fails if the build itself is compromised, as in SolarWinds. [[📖 Ch11 §7][n11.7]]{.more}
- [Q: Compare static and dynamic analysis.]{.q} Static analysis checks code without running it and covers many paths, but it reports possible issues and has false positives (CodeQL, Semgrep). Dynamic analysis runs the program with inputs and shows real behaviour, but covers only the paths the inputs reach, so it has false negatives (ASan, fuzzing). [[📖 Ch11 §9][n11.9]]{.more}

## 11 · Virtual Machines and Containers


::: chap
[📖 Full notes: Chapter 12 · 虚拟机与容器的隔离][n12]
:::


### Terms

- [Hypervisor]{.k} (VMM): sits between the guests and the hardware, controls their access and keeps them apart. [Guest OS]{.k}: each VM's own OS and kernel. [VM escape]{.k}: guest code affects the host. [[📖 Ch12 §2][n12.2]]{.more} [[📖 Ch12 §7][n12.7]]{.more}
- [Container]{.k}: an app with its libraries, with its own process and file-system view but a [shared host kernel]{.k}. [Namespaces]{.k}: limit what a process can see; [cgroups]{.k}: limit resources; [capabilities]{.k}: limit privileged actions; [seccomp]{.k}: limits system calls. Images carry library bugs too, so scan them. [[📖 Ch12 §4][n12.4]]{.more} [[📖 Ch12 §5][n12.5]]{.more}
- [Cluster]{.k} (control plane + workers) / [node]{.k} (one worker machine) / [Pod]{.k} (smallest deployable unit). [gVisor]{.k}: a userspace application kernel; [Kata Containers]{.k}: containers inside lightweight VMs; [confidential containers]{.k}: protect the workload from the host, with [attestation]{.k}. [[📖 Ch12 §9][n12.9]]{.more} [[📖 Ch12 §11][n12.11]]{.more}

### Facts

| | Virtual machine | Container |
|-----|----------|------------|
| Isolation layer | hypervisor (hardware virtualisation) | OS: processes on one kernel |
| Kernel | one per guest | shared host kernel |
| How it fails | VM escape through a hypervisor interface | a kernel bug; or privileged settings, host mounts, Docker daemon access (no bug needed) |
| Weakening settings | shared folders, clipboard, drag and drop | `--privileged`, mounting `/` or docker.sock, running as root |
| Cost | heavy, boots a full OS | light, starts in seconds |

- [The VM boundary is usually stronger]{.k}, but configuration matters on both sides. Choose by threat model, then isolation, performance, operations and portability: untrusted customer code → VM or sandbox; a controlled internal service → container. They are often combined: containers inside VMs. [[📖 Ch12 §5][n12.5]]{.more} [[📖 Ch12 §6][n12.6]]{.more}
- Virtualisation supports isolation, testing, resource allocation and recovery; VMs serve safe browsing, malware analysis, intrusion detection and honeypots. NAT is safer than bridged for lab VMs. [[📖 Ch12 §1][n12.1]]{.more} [[📖 Ch12 §3][n12.3]]{.more}
- [Access to the Docker daemon = administrator access to the host]{.q}: `docker run -v /:/hostOS` reads host files with no bug at all. Do not expose the daemon; limit and audit access. [[📖 Ch12 §8][n12.8]]{.more}
- A compromised Pod has four independent paths, and [blocking one does not block the others]{.q}: host → Pod Security Admission (Privileged / Baseline / Restricted; Restricted for normal apps) plus non-root, dropped capabilities and seccomp; network → NetworkPolicy with default deny; API → a dedicated service account with least-privilege RBAC, no token if not needed; cloud → instance metadata and credentials. [[📖 Ch12 §10][n12.10]]{.more}

### Short answers

- [Q: Compare the isolation models of VMs and containers.]{.q} A VM runs its own guest OS and kernel, and the hypervisor controls every access to the hardware, so a compromised guest, even with admin rights, should stay inside its VM. It fails only through a VM escape and is weakened by features like shared folders. Containers are processes that share the host kernel, isolated by namespaces, cgroups, capabilities and seccomp. They are lighter and faster, but one kernel bug affects all containers on the host, and settings such as a privileged container, a host root mount or Docker socket access break isolation without any bug. [[📖 Ch12 §5][n12.5]]{.more} [[📖 Ch12 §13][n12.13]]{.more}
- [Q: How can a VM escape happen, and how do you reduce the risk?]{.q} Guest code sends crafted input to an interface the hypervisor exposes, such as a virtual device, copy/paste or a shared folder. A privileged host-side component reads that input; if it has a bug, the input can corrupt memory or skip a check and run code on the host. Reduce the risk: disable unneeded integration features (they enlarge the attack surface), patch the hypervisor, limit management privileges and monitor. [[📖 Ch12 §7][n12.7]]{.more}
- [Q: Why is a snapshot not a backup?]{.q} A snapshot freezes the disk state and writes later changes to a separate file, so rollback is fast. But it depends on the original virtual disk and cannot be moved elsewhere on its own. A backup is a complete, independent copy. [[📖 Ch12 §1][n12.1]]{.more}

# Part 2 · The Final Question: Design

How to answer: [state the threats → give the design step by step → say which goal each step gives (confidentiality, integrity, authentication, access control) → explain why each attack fails → state assumptions and limits]{.s}. Keywords alone may not earn full marks: write full sentences.

**D1 ★★★ Secure an HTTP chat app (the lecturer's sample).** [You want to send a message to your friend Alice via an application. However, you find that this application uses the HTTP protocol. How will you secure this communication? Describe your method and analyze whether it can resist a man-in-the-middle (MITM) attack.]{.q} [[📖 Ch4 §13][n4.13]]{.more} [[📖 Ch0 §5][n0.5]]{.more}

*Problem.* HTTP sends messages in plaintext and does not authenticate the server. Anyone on the path, such as a café Wi-Fi owner, can read, change or inject messages.

*Method: use HTTPS, i.e. HTTP over TLS 1.3.*

1. Certificate: the server gets a certificate from a trusted CA. It binds the server's domain name to its public key and is signed by the CA.
2. Key exchange: in the handshake, the client and the server send ephemeral (EC)DH key shares and compute a fresh shared secret. The server signs the handshake with the private key of its certificate (CertificateVerify).
3. Verification: the client checks that the certificate chain leads to a root CA in its trust store, the hostname matches the SAN, and the certificate is in its validity period and not revoked. Then it checks the signature, which proves that the server holds the private key.
4. Protection: both sides derive symmetric session keys and protect every message with authenticated encryption such as AES-GCM. This gives confidentiality and integrity, and ephemeral keys give forward secrecy.

*MITM analysis.* An attacker can intercept the handshake, but cannot show a valid certificate for the server's domain and cannot sign the handshake without the server's private key. The client detects this and stops the connection, so the attack fails. Plain DH without certificates would not resist MITM, because the attacker could run one DH exchange with each side and relay the messages.

*Assumptions and limits.* The user does not ignore certificate warnings; no malicious root CA is installed on the device; the server's private key stays secret. TLS protects only the link from the client to the server. If I do not trust the chat server, Alice and I should add end-to-end encryption, so that only our two devices hold the message keys.

*Marking points:* HTTP has no confidentiality, integrity or server authentication · TLS with a CA-issued certificate · ephemeral DH + server signature · client checks chain, hostname, validity, revocation · authenticated encryption · MITM fails: no valid certificate or private key · contrast with unauthenticated DH · assumptions · E2EE if the server is untrusted.

**D2 ★★★ Secure cloud storage and sharing (Assignment 2).** [A team stores confidential files on a cloud storage service that it does not trust. Only the owner of a file may decide who can read it. Any change to a file must be detected, and access must be removable. Design a solution, explain how it gives confidentiality, integrity and access control, and state its limits.]{.q} [[📖 Ch9 §12][n9.12]]{.more}

*Threats.* The provider is curious or hacked: it can read, change, delete or roll back files. An unauthorised user tries to read files. An attacker swaps a user's public key. A removed user keeps old data.

*Confidentiality: client-side encryption.* Each file is encrypted on the owner's device before upload, with a fresh random data-encryption key (DEK) and AES-256-GCM. The provider stores only ciphertext.

*Sharing: key distribution.* When the owner approves a request, the owner wraps the DEK with the requester's public key using ECIES (per-recipient wrapping). Only that requester can unwrap it. Each user registers their own public key from their own account (or a certificate binds it to the user), so the owner cannot be tricked into wrapping the DEK for an attacker's key.

*Integrity.* The GCM tag detects any change to the ciphertext. The owner also signs a manifest (file ID, version, ciphertext hash) with ECDSA, and the hash is recorded on-chain. A reader checks the hash and the signature, so a replaced, rolled-back or forged file is detected.

*Access control.* A smart contract records the owner of each file. Only the owner can approve, reject or revoke a request; the contract checks the caller (msg.sender). Every action emits an event, which gives a tamper-evident audit trail. On-chain data is public, so the contract gives authorisation, not confidentiality: only wrapped keys are stored on-chain. (Without a blockchain: an owner-controlled authorisation service with RBAC or ABAC and logging.)

*Revocation.* The owner deletes the wrapped DEK, and the contract blocks new access. For full revocation, the owner re-encrypts the file with a new DEK and wraps it only for the remaining users.

*Limits.* Revocation cannot recall a DEK or plaintext that was already downloaded. Metadata (who shares with whom, when, file sizes) is public. Endpoints must be trusted: malware on a reader's computer sees the plaintext. The provider can still delete files; we detect it, but we need backups. Wrapped DEKs have no forward secrecy if a user's private key leaks later.

*Marking points:* client-side encryption with a per-file DEK and authenticated encryption · per-recipient key wrapping with authenticated public keys · integrity via the tag and a signed hash · owner-only access control with an audit trail · revocation by re-keying · at least one limitation.

**D3 ★★ Design an identification protocol (Week 6).** [Design a protocol that lets Alice log in to Bob over an insecure channel. It must resist eavesdropping and replay, and a stolen server database must not let the attacker log in as Alice. Explain why it is secure and how to make it anonymous.]{.q} [[📖 Ch3 §2][n3.2]]{.more} [[📖 Ch3 §10][n3.10]]{.more} [[📖 Ch3 §11][n3.11]]{.more}

*Design: public-key challenge–response (Protocol 9).* Alice creates a key pair (pk, sk) on her device; Bob stores only (Alice, pk). Steps: (1) Alice → Bob: "Alice"; (2) Bob → Alice: a fresh, long, unpredictable random challenge r; (3) Alice → Bob: Sig_sk(r, Bob); (4) Bob checks the signature with pk and checks that r is the challenge he just sent.

*Why it is secure.* Eavesdropping: only r and a signature travel; no password is sent, and sk cannot be computed from them. Replay: r is new for every login, so an old signature fails; r must be unpredictable, not a counter (the lesson of Protocols 3–4). Dictionary attack: there is no low-entropy password to guess (Protocols 2–5). Server compromise: Bob stores only the public key, so a stolen database cannot answer a challenge, unlike Protocol 6, where Bob stores K. 📎 Signing Bob's name stops a fake server from relaying Bob's challenge, as passkeys bind the website.

*Anonymity and session.* "Alice" is sent in clear. To hide it, encrypt the identity with Bob's public key, send it inside an encrypted channel, or use a temporary pseudonym (like GSM's TMSI); Protocol 7's way is anonymous but costs up to n hashes. Identification gives no session key, so combine it with signed ephemeral DH, as TLS does.

*Marking points:* fresh random challenge from the verifier · signature (or a MAC with a long random key) instead of a password · server stores only the public key · each attack explained · anonymity fix · session key.

<!-- links:start -->

[n0.5]: exam00-roadmap-study-guide.html#5-样题拆解-w13-s13 "第 0 章 §5 样题拆解"
[n1]: exam01-hash-mac-study-guide.html "第 1 章 哈希与 MAC"
[n1.1]: exam01-hash-mac-study-guide.html#1-先问要保护什么-w4-s23-s27 "第 1 章 §1 先问要保护什么"
[n1.2]: exam01-hash-mac-study-guide.html#2-哈希函数数据的指纹-w2-s11 "第 1 章 §2 哈希函数：数据的指纹"
[n1.3]: exam01-hash-mac-study-guide.html#3-用途一发现数据被改动 "第 1 章 §3 用途一：发现数据被改动"
[n1.4]: exam01-hash-mac-study-guide.html#4-用途二工作量证明的谜题-w2-s33s34 "第 1 章 §4 用途二：工作量证明的谜题"
[n1.6.2]: exam01-hash-mac-study-guide.html#62-字典攻击 "第 1 章 §6.2 字典攻击"
[n1.6.3]: exam01-hash-mac-study-guide.html#63-加盐 "第 1 章 §6.3 加盐"
[n1.7.1]: exam01-hash-mac-study-guide.html#71-为什么哈希不够 "第 1 章 §7.1 为什么哈希不够"
[n1.7.2]: exam01-hash-mac-study-guide.html#72-mac-是什么 "第 1 章 §7.2 MAC 是什么"
[n1.8]: exam01-hash-mac-study-guide.html#8-crc-不是-macwep-的教训-w8-s18s24-s44 "第 1 章 §8 CRC 不是 MAC：WEP 的教训"
[n1.9]: exam01-hash-mac-study-guide.html#9-按场景选工具 "第 1 章 §9 按场景选工具"
[n1.trap]: exam01-hash-mac-study-guide.html#️-易混易错 "第 1 章 易混易错"
[n2]: exam02-dh-study-guide.html "第 2 章 Diffie–Hellman 密钥交换"
[n2.1]: exam02-dh-study-guide.html#1-为什么需要密钥交换-w6-s2 "第 2 章 §1 为什么需要密钥交换"
[n2.2]: exam02-dh-study-guide.html#2-椭圆曲线上的-dh-w6-s3s4 "第 2 章 §2 椭圆曲线上的 DH"
[n2.3]: exam02-dh-study-guide.html#3-从共享秘密到会话密钥-w5-s8-lab-4-quiz-3 "第 2 章 §3 从共享秘密到会话密钥"
[n2.4.1]: exam02-dh-study-guide.html#41-只会听的攻击者 "第 2 章 §4.1 只会听的攻击者"
[n2.4.2]: exam02-dh-study-guide.html#42-能改消息的攻击者 "第 2 章 §4.2 能改消息的攻击者"
[n2.5]: exam02-dh-study-guide.html#5-修补认证公开值-w6-s5-w7-s4s5-s14 "第 2 章 §5 修补：认证公开值"
[n2.6]: exam02-dh-study-guide.html#6-临时密钥与前向安全-w7-s16s18 "第 2 章 §6 临时密钥与前向安全"
[n2.7]: exam02-dh-study-guide.html#7-dh-在课程里的位置-w5-s8-s11-w7-s17 "第 2 章 §7 DH 在课程里的位置"
[n2.8]: exam02-dh-study-guide.html#8-用本章知识检查-lab-4-lab-4-quiz-3 "第 2 章 §8 用本章知识检查 Lab 4"
[n2.9]: exam02-dh-study-guide.html#9-哪些做法挡得住中间人 "第 2 章 §9 哪些做法挡得住中间人"
[n3]: exam03-auth-protocols-study-guide.html "第 3 章 认证协议的弱点"
[n3.2]: exam03-auth-protocols-study-guide.html#2-分析一个协议的五个步骤 "第 3 章 §2 分析一个协议的五个步骤"
[n3.10]: exam03-auth-protocols-study-guide.html#10-协议-89用公钥代替共享密钥-w6-s25s27 "第 3 章 §10 协议 8、9：用公钥代替共享密钥"
[n3.11]: exam03-auth-protocols-study-guide.html#11-九个协议一览 "第 3 章 §11 九个协议一览"
[n4]: exam04-tls-certificates-study-guide.html "第 4 章 HTTPS、TLS 与证书"
[n4.1]: exam04-tls-certificates-study-guide.html#1-公钥属于谁-w7-s2s4 "第 4 章 §1 公钥属于谁"
[n4.2]: exam04-tls-certificates-study-guide.html#2-证书是什么-w7-s5-s8s9 "第 4 章 §2 证书是什么"
[n4.3]: exam04-tls-certificates-study-guide.html#3-证书证明了什么-w7-s6s7 "第 4 章 §3 证书证明了什么"
[n4.4]: exam04-tls-certificates-study-guide.html#4-证书链与信任锚-w7-s10s12-s36s37 "第 4 章 §4 证书链与信任锚"
[n4.5]: exam04-tls-certificates-study-guide.html#5-客户端检查什么-w7-s13-s15 "第 4 章 §5 客户端检查什么"
[n4.6]: exam04-tls-certificates-study-guide.html#6-复制证书为什么没用-w7-s14 "第 4 章 §6 复制证书为什么没用"
[n4.7]: exam04-tls-certificates-study-guide.html#7-tls-13-握手-w7-s16s18 "第 4 章 §7 TLS 1.3 握手"
[n4.8]: exam04-tls-certificates-study-guide.html#8-证书的一生签发续期到期与吊销-w7-s19s23-s38 "第 4 章 §8 证书的一生：签发、续期、到期与吊销"
[n4.8.2]: exam04-tls-certificates-study-guide.html#82-到期与吊销 "第 4 章 §8.2 到期与吊销"
[n4.9]: exam04-tls-certificates-study-guide.html#9-自签名证书与私有-ca-w7-s24s26 "第 4 章 §9 自签名证书与私有 CA"
[n4.10.1]: exam04-tls-certificates-study-guide.html#101-dns-投毒 "第 4 章 §10.1 DNS 投毒"
[n4.10.2]: exam04-tls-certificates-study-guide.html#102-管理员控制信任的设备 "第 4 章 §10.2 管理员控制信任的设备"
[n4.11]: exam04-tls-certificates-study-guide.html#11-双向-tls私钥保护与运维故障-w7-s32s34 "第 4 章 §11 双向 TLS、私钥保护与运维故障"
[n4.13]: exam04-tls-certificates-study-guide.html#13-样题保护一个用-http-的聊天应用-w13-s13 "第 4 章 §13 样题：保护一个用 HTTP 的聊天应用"
[n4.trap]: exam04-tls-certificates-study-guide.html#️-易混易错 "第 4 章 易混易错"
[n5]: exam05-ssh-study-guide.html "第 5 章 SSH"
[n5.1]: exam05-ssh-study-guide.html#1-ssh-用来做什么-w5-s2s5-s30 "第 5 章 §1 SSH 用来做什么"
[n5.2]: exam05-ssh-study-guide.html#2-连接的四步与三层结构-w5-s6s8 "第 5 章 §2 连接的四步与三层结构"
[n5.3]: exam05-ssh-study-guide.html#3-传输层密钥交换与算法-w5-s8-s11s12 "第 5 章 §3 传输层：密钥交换与算法"
[n5.4]: exam05-ssh-study-guide.html#4-认证服务器指纹与首次信任-w5-s9s10 "第 5 章 §4 认证服务器：指纹与首次信任"
[n5.5]: exam05-ssh-study-guide.html#5-认证用户公钥优于口令-w5-s13s14 "第 5 章 §5 认证用户：公钥优于口令"
[n5.6]: exam05-ssh-study-guide.html#6-加固-ssh-w5-s15s18 "第 5 章 §6 加固 SSH"
[n5.7]: exam05-ssh-study-guide.html#7-云上的接入方式-w5-s19s20 "第 5 章 §7 云上的接入方式"
[n5.8]: exam05-ssh-study-guide.html#8-连接协议一条连接里的多条通道-w5-s21s22 "第 5 章 §8 连接协议：一条连接里的多条通道"
[n5.9]: exam05-ssh-study-guide.html#9-端口转发的思路-w5-s23s26 "第 5 章 §9 端口转发的思路"
[n5.10.1]: exam05-ssh-study-guide.html#101-本地转发--l "第 5 章 §10.1 本地转发 -L"
[n5.11]: exam05-ssh-study-guide.html#11-转发会绕过网络隔离-w5-s30s31-s45 "第 5 章 §11 转发会绕过网络隔离"
[n6]: exam06-wireless-study-guide.html "第 6 章 无线网络安全"
[n6.1]: exam06-wireless-study-guide.html#1-无线局域网怎样组成-w8-s3s8 "第 6 章 §1 无线局域网怎样组成"
[n6.2.1]: exam06-wireless-study-guide.html#21-发现ssid-只是一个名字 "第 6 章 §2.1 发现：SSID 只是一个名字"
[n6.2.2]: exam06-wireless-study-guide.html#22-认证关联与四次握手 "第 6 章 §2.2 认证、关联与四次握手"
[n6.3]: exam06-wireless-study-guide.html#3-无线改变了威胁模型-w8-s11s12-w1-s27 "第 6 章 §3 无线改变了威胁模型"
[n6.4]: exam06-wireless-study-guide.html#4-窃听链路加密只保护到-ap-w8-s13 "第 6 章 §4 窃听：链路加密只保护到 AP"
[n6.5]: exam06-wireless-study-guide.html#5-干扰与强制断线攻击可用性-w8-s14s15 "第 6 章 §5 干扰与强制断线：攻击可用性"
[n6.6]: exam06-wireless-study-guide.html#6-wep-的教训-w8-s18s26 "第 6 章 §6 WEP 的教训"
[n6.7]: exam06-wireless-study-guide.html#7-wpa2wpa3-与企业认证-w8-s28 "第 6 章 §7 WPA2、WPA3 与企业认证"
[n6.8.1]: exam06-wireless-study-guide.html#81-为什么能离线猜 "第 6 章 §8.1 为什么能离线猜"
[n6.8.5]: exam06-wireless-study-guide.html#85-wpa3-sae-改变了什么 "第 6 章 §8.5 WPA3-SAE 改变了什么"
[n6.9.1]: exam06-wireless-study-guide.html#91-攻击过程 "第 6 章 §9.1 攻击过程"
[n6.9.2]: exam06-wireless-study-guide.html#92-企业网络证书验证是关键 "第 6 章 §9.2 企业网络：证书验证是关键"
[n6.9.3]: exam06-wireless-study-guide.html#93-哪些措施有用 "第 6 章 §9.3 哪些措施有用"
[n6.10]: exam06-wireless-study-guide.html#10-wps便利的代价-w8-s32 "第 6 章 §10 WPS：便利的代价"
[n6.11]: exam06-wireless-study-guide.html#11-一份安全配置清单 "第 6 章 §11 一份安全配置清单"
[n7]: exam07-blockchain-study-guide.html "第 7 章 区块链与智能合约"
[n7.1]: exam07-blockchain-study-guide.html#1-一份没有管理员的共享账本-w2-s6s10-s14-s23 "第 7 章 §1 一份没有管理员的共享账本"
[n7.2]: exam07-blockchain-study-guide.html#2-bitcoin没有银行怎样防止双花-w2-s17s22 "第 7 章 §2 Bitcoin：没有银行，怎样防止双花"
[n7.3]: exam07-blockchain-study-guide.html#3-一笔交易怎样上链-w2-s12s13-s24 "第 7 章 §3 一笔交易怎样上链"
[n7.4.1]: exam07-blockchain-study-guide.html#41-要商定什么 "第 7 章 §4.1 要商定什么"
[n7.4.2]: exam07-blockchain-study-guide.html#42-难在哪里 "第 7 章 §4.2 难在哪里"
[n7.4.3]: exam07-blockchain-study-guide.html#43-bitcoin理论遇上实践 "第 7 章 §4.3 Bitcoin：理论遇上实践"
[n7.5]: exam07-blockchain-study-guide.html#5-三类共识机制-w2-s32s35-s39 "第 7 章 §5 三类共识机制"
[n7.6]: exam07-blockchain-study-guide.html#6-ethereum可编程的共享状态-w2-s36s38-s46 "第 7 章 §6 Ethereum：可编程的共享状态"
[n7.7]: exam07-blockchain-study-guide.html#7-ethereum-交易的六个字段-w3-s40s45-lab-1 "第 7 章 §7 Ethereum 交易的六个字段"
[n7.7.1]: exam07-blockchain-study-guide.html#71-nonce账户自己的序号 "第 7 章 §7.1 nonce：账户自己的序号"
[n7.7.2]: exam07-blockchain-study-guide.html#72-gas为计算付费 "第 7 章 §7.2 gas：为计算付费"
[n7.8]: exam07-blockchain-study-guide.html#8-智能合约-w3-s46s50-w2-s38-lab-2 "第 7 章 §8 智能合约"
[n7.9]: exam07-blockchain-study-guide.html#9-预言机合约看不到链外的世界-w3-s49-s51s52-s56-w2-s16-s42s43 "第 7 章 §9 预言机：合约看不到链外的世界"
[n7.9.1]: exam07-blockchain-study-guide.html#91-为什么需要预言机 "第 7 章 §9.1 为什么需要预言机"
[n7.9.2]: exam07-blockchain-study-guide.html#92-合约能核对什么 "第 7 章 §9.2 合约能核对什么"
[n7.9.3]: exam07-blockchain-study-guide.html#93-价格预言机被操纵 "第 7 章 §9.3 价格预言机被操纵"
[n7.10]: exam07-blockchain-study-guide.html#10-什么时候值得用区块链-w3-s53-w2-s14s16 "第 7 章 §10 什么时候值得用区块链"
[n7.11.2]: exam07-blockchain-study-guide.html#112-五层 "第 7 章 §11.2 五层"
[n8]: exam08-wallets-study-guide.html "第 8 章 加密货币钱包"
[n8.1]: exam08-wallets-study-guide.html#1-钱包管的是权限不是币-w3-s9s10 "第 8 章 §1 钱包管的是权限，不是币"
[n8.2]: exam08-wallets-study-guide.html#2-私钥--公钥--地址-w3-s2s3-s11-lab-1 "第 8 章 §2 私钥 → 公钥 → 地址"
[n8.3]: exam08-wallets-study-guide.html#3-签名不交出私钥也能证明控制权-w3-s4s6-lab-3-quiz-2 "第 8 章 §3 签名：不交出私钥也能证明控制权"
[n8.4]: exam08-wallets-study-guide.html#4-签名用的随机数-k-不能重复-w3-s7-lab-3 "第 8 章 §4 签名用的随机数 k 不能重复"
[n8.5]: exam08-wallets-study-guide.html#5-签名界面与私钥的运营风险-w3-s8-w2-s41 "第 8 章 §5 签名界面与私钥的运营风险"
[n8.6]: exam08-wallets-study-guide.html#6-三种钱包结构-w3-s12s17 "第 8 章 §6 三种钱包结构"
[n8.7.1]: exam08-wallets-study-guide.html#71-几个-bip "第 8 章 §7.1 几个 BIP"
[n8.7.2]: exam08-wallets-study-guide.html#72-主扩展密钥-w3-s26 "第 8 章 §7.2 主扩展密钥"
[n8.7.3]: exam08-wallets-study-guide.html#73-派生子密钥-w3-s22s24 "第 8 章 §7.3 派生子密钥"
[n8.7.4]: exam08-wallets-study-guide.html#74-为什么需要-chain-code-w3-s25 "第 8 章 §7.4 为什么需要 chain code"
[n8.7.5]: exam08-wallets-study-guide.html#75-硬化派生-w3-s17-s22 "第 8 章 §7.5 硬化派生"
[n8.8]: exam08-wallets-study-guide.html#8-bip44统一的路径-w3-s28s30 "第 8 章 §8 BIP44：统一的路径"
[n8.9]: exam08-wallets-study-guide.html#9-bip39用单词备份种子-w3-s31s35-s38 "第 8 章 §9 BIP39：用单词备份种子"
[n8.11]: exam08-wallets-study-guide.html#11-保护助记词-w3-s36s37 "第 8 章 §11 保护助记词"
[n9]: exam09-cloud-storage-study-guide.html "第 9 章 安全云存储与共享"
[n9.1.1]: exam09-cloud-storage-study-guide.html#11-逻辑资源数据面与控制面-w4-s7s8 "第 9 章 §1.1 逻辑资源、数据面与控制面"
[n9.1.3]: exam09-cloud-storage-study-guide.html#13-责任共担一张边界图-w4-s4 "第 9 章 §1.3 责任共担：一张边界图"
[n9.2]: exam09-cloud-storage-study-guide.html#2-先画出数据的一生和信任边界-w4-s10s11 "第 9 章 §2 先画出数据的一生和信任边界"
[n9.3]: exam09-cloud-storage-study-guide.html#3-主要威胁配置身份与恢复-w4-s12s21-w12-s8 "第 9 章 §3 主要威胁：配置、身份与恢复"
[n9.3.2]: exam09-cloud-storage-study-guide.html#32-泄露的-api-凭据-w4-s14s16 "第 9 章 §3.2 泄露的 API 凭据"
[n9.4]: exam09-cloud-storage-study-guide.html#4-选对密码学工具-w4-s23s27 "第 9 章 §4 选对密码学工具"
[n9.5]: exam09-cloud-storage-study-guide.html#5-已加密要说清保护到哪一段-w4-s28 "第 9 章 §5 “已加密”要说清保护到哪一段"
[n9.6]: exam09-cloud-storage-study-guide.html#6-信封加密与密钥层级-w4-s29-s33 "第 9 章 §6 信封加密与密钥层级"
[n9.7.2]: exam09-cloud-storage-study-guide.html#72-云上的-kms-w4-s32 "第 9 章 §7.2 云上的 KMS"
[n9.7.4]: exam09-cloud-storage-study-guide.html#74-轮换不等于重新加密一切-w4-s35 "第 9 章 §7.4 轮换不等于重新加密一切"
[n9.7.5]: exam09-cloud-storage-study-guide.html#75-恢复要分权-w4-s36 "第 9 章 §7.5 恢复要分权"
[n9.7.6]: exam09-cloud-storage-study-guide.html#76-谁持有密钥-w4-s37 "第 9 章 §7.6 谁持有密钥"
[n9.8]: exam09-cloud-storage-study-guide.html#8-访问控制-w4-s39s43 "第 9 章 §8 访问控制"
[n9.8.3]: exam09-cloud-storage-study-guide.html#83-rbac-与-abac-w4-s41s42 "第 9 章 §8.3 RBAC 与 ABAC"
[n9.9]: exam09-cloud-storage-study-guide.html#9-客户端加密与端到端加密-w4-s45s47 "第 9 章 §9 客户端加密与端到端加密"
[n9.10.2]: exam09-cloud-storage-study-guide.html#102-五种分享方式-w4-s49 "第 9 章 §10.2 五种分享方式"
[n9.10.3]: exam09-cloud-storage-study-guide.html#103-撤销收不回已拿到的明文-w4-s50 "第 9 章 §10.3 撤销收不回已拿到的明文"
[n9.11]: exam09-cloud-storage-study-guide.html#11-基于属性的加密-w4-s51s54 "第 9 章 §11 基于属性的加密"
[n9.12]: exam09-cloud-storage-study-guide.html#12-用-assignment-2-把全章串起来-w4-s55-assignment-2 "第 9 章 §12 用 Assignment 2 把全章串起来"
[n10]: exam10-two-party-computation-study-guide.html "第 10 章 安全两方计算"
[n10.1]: exam10-two-party-computation-study-guide.html#1-不把数据集中也能计算-w5-s2-s32 "第 10 章 §1 不把数据集中也能计算"
[n10.2]: exam10-two-party-computation-study-guide.html#2-理想世界与真实世界-w5-s34s35 "第 10 章 §2 理想世界与真实世界"
[n10.3]: exam10-two-party-computation-study-guide.html#3-每一方能学到什么模拟器-w5-s36s37 "第 10 章 §3 每一方能学到什么：模拟器"
[n10.4]: exam10-two-party-computation-study-guide.html#4-输出本身也会泄露-w5-s34-s41-s43 "第 10 章 §4 输出本身也会泄露"
[n10.5]: exam10-two-party-computation-study-guide.html#5-攻击者模型半诚实与恶意-w5-s34-s43 "第 10 章 §5 攻击者模型：半诚实与恶意"
[n10.6]: exam10-two-party-computation-study-guide.html#6-积木一不经意传输-w5-s38s39 "第 10 章 §6 积木一：不经意传输"
[n10.7]: exam10-two-party-computation-study-guide.html#7-积木二秘密分享-w5-s40 "第 10 章 §7 积木二：秘密分享"
[n10.9]: exam10-two-party-computation-study-guide.html#9-云上的用途-w5-s42 "第 10 章 §9 云上的用途"
[n10.10]: exam10-two-party-computation-study-guide.html#10-mpc-转移了安全假设-w5-s43-s45 "第 10 章 §10 MPC 转移了安全假设"
[n10.11]: exam10-two-party-computation-study-guide.html#11-mpc同态加密与可信执行环境-w5-s44 "第 10 章 §11 MPC、同态加密与可信执行环境"
[n10.12]: exam10-two-party-computation-study-guide.html#12-答题分析每一方能学到什么 "第 10 章 §12 答题：分析每一方能学到什么"
[n11]: exam11-supply-chain-study-guide.html "第 11 章 软件供应链安全"
[n11.1]: exam11-supply-chain-study-guide.html#1-开源软件是现代软件的基础-w9-s5s8 "第 11 章 §1 开源软件是现代软件的基础"
[n11.2]: exam11-supply-chain-study-guide.html#2-复用代码也复用了风险-w9-s61s62-s66s68 "第 11 章 §2 复用代码，也复用了风险"
[n11.3]: exam11-supply-chain-study-guide.html#3-软件供应链与供应链攻击-w9-s63s65-s69s70 "第 11 章 §3 软件供应链与供应链攻击"
[n11.4.1]: exam11-supply-chain-study-guide.html#41-ci-与-cd "第 11 章 §4.1 CI 与 CD"
[n11.4.3]: exam11-supply-chain-study-guide.html#43-发布策略 "第 11 章 §4.3 发布策略"
[n11.5.1]: exam11-supply-chain-study-guide.html#51-为什么 "第 11 章 §5.1 为什么"
[n11.5.2]: exam11-supply-chain-study-guide.html#52-权限从哪里来 "第 11 章 §5.2 权限从哪里来"
[n11.6]: exam11-supply-chain-study-guide.html#6-流水线的四种攻击与缓解-w9-s27s30-s32 "第 11 章 §6 流水线的四种攻击与缓解"
[n11.7]: exam11-supply-chain-study-guide.html#7-发布的产物就是审查过的代码吗-w9-s30s31 "第 11 章 §7 发布的产物就是审查过的代码吗"
[n11.8]: exam11-supply-chain-study-guide.html#8-依赖与构建系统的攻击途径-w9-s71s80 "第 11 章 §8 依赖与构建系统的攻击途径"
[n11.8.1]: exam11-supply-chain-study-guide.html#81-抢注相似的包名 "第 11 章 §8.1 抢注相似的包名"
[n11.9]: exam11-supply-chain-study-guide.html#9-发现和修补依赖里的漏洞-w10-s2-s34-s50s53 "第 11 章 §9 发现和修补依赖里的漏洞"
[n11.10]: exam11-supply-chain-study-guide.html#10-部署配置与秘密补充-w9-s34s51-s58s59 "第 11 章 §10 部署配置与秘密：补充"
[n12]: exam12-vm-containers-study-guide.html "第 12 章 虚拟机与容器的隔离"
[n12.1]: exam12-vm-containers-study-guide.html#1-为什么用虚拟化-w11-s4-s6s8 "第 12 章 §1 为什么用虚拟化"
[n12.2]: exam12-vm-containers-study-guide.html#2-虚拟机隔离什么-w11-s5-s9-s19s21 "第 12 章 §2 虚拟机隔离什么"
[n12.3]: exam12-vm-containers-study-guide.html#3-虚拟机在安全上的用途-w11-s10s13 "第 12 章 §3 虚拟机在安全上的用途"
[n12.4]: exam12-vm-containers-study-guide.html#4-容器隔离什么-w11-s14s16 "第 12 章 §4 容器隔离什么"
[n12.5]: exam12-vm-containers-study-guide.html#5-两种隔离模型的区别-w11-s17s18-s21- "第 12 章 §5 两种隔离模型的区别"
[n12.6]: exam12-vm-containers-study-guide.html#6-怎样选隔离技术-w11-s22 "第 12 章 §6 怎样选隔离技术"
[n12.7]: exam12-vm-containers-study-guide.html#7-虚拟机逃逸-w11-s23s29 "第 12 章 §7 虚拟机逃逸"
[n12.8]: exam12-vm-containers-study-guide.html#8-docker-守护进程与宿主机挂载-w11-s30s32-w9-s39s41 "第 12 章 §8 Docker 守护进程与宿主机挂载"
[n12.9]: exam12-vm-containers-study-guide.html#9-kubernetes从一台主机到一个集群-w11-s33s35 "第 12 章 §9 Kubernetes：从一台主机到一个集群"
[n12.10]: exam12-vm-containers-study-guide.html#10-被攻破的-pod四条路径和对应的控制-w11-s36s40 "第 12 章 §10 被攻破的 Pod：四条路径和对应的控制"
[n12.11]: exam12-vm-containers-study-guide.html#11-更强的隔离沙箱与机密容器-w11-s41s42 "第 12 章 §11 更强的隔离：沙箱与机密容器"
[n12.13]: exam12-vm-containers-study-guide.html#13-答题比较虚拟机和容器的隔离 "第 12 章 §13 答题：比较虚拟机和容器的隔离"

<!-- links:end -->
