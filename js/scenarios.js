/* ═══════════════════════════════════════════════
   scenarios.js — all scenario definitions
   Each scenario has: name, desc, atkMoves[], defMoves[]
   ═══════════════════════════════════════════════ */

const SCENARIOS = {
  sql: {
    name: "SQL Injection Attack",
    desc: "PHANTOM attempts to extract the user database via SQL injection vectors. AEGIS monitors query patterns and deploys adaptive WAF rules in real time.",
    atkMoves: [
      "UNION SELECT payload",
      "Blind boolean injection",
      "Time-based extraction",
      "Error-based dump",
      "Second-order injection"
    ],
    defMoves: [
      "Deploy WAF rule",
      "Parameterize queries",
      "Rate-limit endpoint",
      "Enable query logging",
      "Block suspicious IP"
    ]
  },

  phishing: {
    name: "Phishing Campaign",
    desc: "PHANTOM crafts a targeted spearphishing campaign against executives. AEGIS deploys email filters and user awareness countermeasures to neutralize the threat.",
    atkMoves: [
      "CEO impersonation email",
      "Malicious PDF attachment",
      "Credential harvesting page",
      "SMS smishing follow-up",
      "Domain typosquatting"
    ],
    defMoves: [
      "DMARC enforcement",
      "Sandbox attachment scan",
      "MFA enforcement",
      "Security awareness alert",
      "Takedown typosquat domain"
    ]
  },

  privesc: {
    name: "Privilege Escalation",
    desc: "PHANTOM probes for misconfigurations to escalate from user to root. AEGIS hardens the system surface and monitors anomalous privilege access in real time.",
    atkMoves: [
      "SUID binary exploit",
      "Sudo misconfiguration",
      "Kernel exploit CVE",
      "Cron job hijack",
      "PATH injection"
    ],
    defMoves: [
      "Remove SUID binaries",
      "Patch sudo config",
      "Apply kernel patch",
      "Audit cron jobs",
      "Harden PATH variable"
    ]
  },

  ransomware: {
    name: "Ransomware Deployment",
    desc: "PHANTOM attempts to encrypt critical files and establish C2 persistence. AEGIS uses behavioral AI detection and backup strategies to contain the threat.",
    atkMoves: [
      "Drop encrypted loader",
      "Disable shadow copies",
      "Lateral movement via SMB",
      "Exfil before encrypt",
      "C2 beacon establish"
    ],
    defMoves: [
      "Behavioral AI detection",
      "Restore from backup",
      "Block SMB lateral move",
      "DLP alert trigger",
      "Sinkhole C2 domain"
    ]
  },

  exfil: {
    name: "Data Exfiltration",
    desc: "PHANTOM attempts to covertly exfiltrate sensitive data over covert channels. AEGIS monitors egress traffic and deploys data loss prevention controls.",
    atkMoves: [
      "DNS tunneling exfil",
      "HTTPS beaconing",
      "Steganography in images",
      "USB drop payload",
      "Cloud storage abuse"
    ],
    defMoves: [
      "Block DNS tunneling",
      "Inspect TLS traffic",
      "Flag large egress",
      "Disable USB storage",
      "Block unauthorized cloud"
    ]
  }
};
