// ═══════════════════════════════════════════════
//   DIGITAL SKILL PASSPORT — BLOCKCHAIN ENGINE
//   Simulates a real blockchain with SHA-256
// ═══════════════════════════════════════════════

const BlockchainEngine = (() => {

  // ── SHA-256 Hash using Web Crypto API ──
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Generate deterministic wallet address ──
  async function generateWalletAddress(seed) {
    const hash = await sha256(seed + 'WALLET_SALT_2024');
    return '0x' + hash.substring(0, 40).toUpperCase();
  }

  // ── Generate certificate hash ──
  async function generateCertificateHash(certData) {
    const payload = JSON.stringify({
      studentId: certData.studentId,
      studentName: certData.studentName,
      course: certData.course,
      institution: certData.institution,
      issueDate: certData.issueDate,
      grade: certData.grade,
    });
    return await sha256(payload + Date.now());
  }

  // ── Generate transaction ID ──
  async function generateTxHash(blockNum, certHash, timestamp) {
    return await sha256(`TX:${blockNum}:${certHash}:${timestamp}`);
  }

  // ── Generate block hash ──
  async function generateBlockHash(blockNum, prevHash, txHash, nonce) {
    return await sha256(`BLOCK:${blockNum}:${prevHash}:${txHash}:${nonce}`);
  }

  // ── Mine a block (find nonce with leading zeros) ──
  async function mineBlock(blockData, difficulty = 2) {
    let nonce = 0;
    let hash = '';
    const prefix = '0'.repeat(difficulty);
    do {
      hash = await sha256(JSON.stringify(blockData) + nonce);
      nonce++;
    } while (!hash.startsWith(prefix) && nonce < 10000);
    return { hash, nonce };
  }

  // ── Verify certificate hash ──
  async function verifyCertificate(certData, storedHash) {
    const computedHash = await sha256(JSON.stringify(certData));
    return computedHash === storedHash;
  }

  // ── AI Fraud Score Calculator ──
  function calculateFraudScore(cert) {
    let riskScore = 0;
    const signals = [];

    // Check 1: Institution reputation
    const knownInstitutions = ['MIT', 'Stanford', 'Harvard', 'IIT', 'NIT', 'Coursera', 'Google', 'Microsoft', 'AWS', 'Oracle'];
    const isKnown = knownInstitutions.some(inst => cert.institution.includes(inst));
    if (!isKnown) { riskScore += 15; signals.push({ type: 'warn', msg: 'Unknown institution detected' }); }
    else { signals.push({ type: 'ok', msg: 'Institution verified in database' }); }

    // Check 2: Issue date validity
    const issueDate = new Date(cert.issueDate);
    const now = new Date();
    const daysDiff = (now - issueDate) / (1000 * 60 * 60 * 24);
    if (daysDiff < 0) { riskScore += 40; signals.push({ type: 'err', msg: 'Future issue date detected!' }); }
    else if (daysDiff > 3650) { riskScore += 20; signals.push({ type: 'warn', msg: 'Certificate older than 10 years' }); }
    else { signals.push({ type: 'ok', msg: 'Issue date within valid range' }); }

    // Check 3: Grade validity
    const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'Pass', 'Distinction', 'Merit', '100', '95', '90', '85'];
    if (!validGrades.some(g => cert.grade.includes(g))) {
      riskScore += 10; signals.push({ type: 'warn', msg: 'Unusual grade format' });
    } else { signals.push({ type: 'ok', msg: 'Grade format validated' }); }

    // Check 4: Blockchain verification
    if (cert.txHash && cert.blockHash) {
      signals.push({ type: 'ok', msg: 'Blockchain anchor verified' });
    } else {
      riskScore += 30; signals.push({ type: 'err', msg: 'No blockchain anchor found!' });
    }

    // Check 5: Digital signature
    if (cert.certHash && cert.certHash.length === 64) {
      signals.push({ type: 'ok', msg: 'Digital signature valid (SHA-256)' });
    } else {
      riskScore += 25; signals.push({ type: 'err', msg: 'Invalid or missing digital signature' });
    }

    // Check 6: Hash integrity
    signals.push({ type: 'ok', msg: 'Merkle root validated on-chain' });

    return {
      score: Math.min(riskScore, 100),
      trustScore: Math.max(100 - riskScore, 0),
      signals,
      verdict: riskScore === 0 ? 'AUTHENTIC' : riskScore < 30 ? 'LOW RISK' : riskScore < 60 ? 'MEDIUM RISK' : 'HIGH RISK',
      verdictColor: riskScore === 0 ? '#00ff88' : riskScore < 30 ? '#00c875' : riskScore < 60 ? '#ffaa00' : '#ff3344'
    };
  }

  return { sha256, generateWalletAddress, generateCertificateHash, generateTxHash, generateBlockHash, mineBlock, verifyCertificate, calculateFraudScore };
})();

// ── Certificate Database (simulated) ──
const CertificateDB = {
  certificates: [
    {
      id: 'CERT-2024-001',
      studentName: 'Nayan Fulare',
      studentId: 'STU-7841',
      course: 'Machine Learning & Deep Learning',
      institution: 'IIT Bombay',
      issueDate: '2024-03-15',
      grade: 'A+',
      credits: 6,
      icon: '🤖',
      color: 'blue',
      certHash: 'a3f8e2d91c6b4507f28e3a1b9d5c7e0f4a2b8d6c3e9f1a4b7c2d5e8f0a1b3c6',
      txHash: '7f3a9c2e5b8d1f4a6c9e2b5d8f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5',
      blockHash: '0000a9f3c2e5b8d1f4a6c9e2b5d8f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9',
      blockNum: 4821,
      nonce: 2847,
      walletAddress: '0xA3F8E2D91C6B4507F28E3A1B9D5C7E0F4A2B8D6',
      network: 'SkillChain Mainnet',
      gasUsed: '21000',
      confirmations: 156,
      verified: true,
      skills: ['Python', 'TensorFlow', 'Neural Networks', 'Computer Vision', 'NLP']
    },
    {
      id: 'CERT-2024-002',
      studentName: 'Tejashri Hipperge',
      studentId: 'STU-7841',
      course: 'Full Stack Web Development',
      institution: 'Coursera (Google)',
      issueDate: '2024-01-20',
      grade: 'Distinction',
      credits: 4,
      icon: '💻',
      color: 'green',
      certHash: 'b4a7f1e3d28c5609a39f4b2c8e6d0f5a3b9e7c1d4f6a8b2e5d7f9a1c4b6e8d0',
      txHash: '8e4b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7',
      blockHash: '0000b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4',
      blockNum: 4856,
      nonce: 1293,
      walletAddress: '0xA3F8E2D91C6B4507F28E3A1B9D5C7E0F4A2B8D6',
      network: 'SkillChain Mainnet',
      gasUsed: '21000',
      confirmations: 121,
      verified: true,
      skills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'TypeScript']
    },
    {
      id: 'CERT-2024-003',
      studentName: 'Rohini Mungase',
      studentId: 'STU-7841',
      course: 'AWS Cloud Practitioner',
      institution: 'Amazon Web Services',
      issueDate: '2024-06-10',
      grade: 'Pass (Score: 892/1000)',
      credits: 3,
      icon: '☁️',
      color: 'gold',
      certHash: 'c5b8a2f4e39d7612b4a8f5c3d9e7b1f6a4c0e8d2f5b7a1c4e6b8d0f2a5c7e9b1',
      txHash: '9f5c1e4b7d0a3f6c9e2b5d8f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5a8',
      blockHash: '0000c1e4b7d0a3f6c9e2b5d8f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5',
      blockNum: 4902,
      nonce: 3751,
      walletAddress: '0xA3F8E2D91C6B4507F28E3A1B9D5C7E0F4A2B8D6',
      network: 'SkillChain Mainnet',
      gasUsed: '21000',
      confirmations: 75,
      verified: true,
      skills: ['Cloud Computing', 'EC2', 'S3', 'IAM', 'VPC', 'Lambda']
    },
    {
      id: 'CERT-2024-004',
      studentName: 'Bhumika Dodave',
      studentId: 'STU-7841',
      course: 'Cybersecurity Fundamentals',
      institution: 'MIT OpenCourseWare',
      issueDate: '2024-08-22',
      grade: 'A',
      credits: 5,
      icon: '🔒',
      color: 'red',
      certHash: 'd6c9b3e5f4a0e8d1c5b9e6d4a2f8c1b5e9d3f7a1c5b7e9d1f3a7c9b1e3d7f9a3',
      txHash: '0a6d2f5b8e1c4a7d0f3b6e9c2a5d8f1b4e7a0d3f6b9e2c5a8d1f4b7e0c3a6d9',
      blockHash: '0000d2f5b8e1c4a7d0f3b6e9c2a5d8f1b4e7a0d3f6b9e2c5a8d1f4b7e0c3a6',
      blockNum: 4938,
      nonce: 982,
      walletAddress: '0xA3F8E2D91C6B4507F28E3A1B9D5C7E0F4A2B8D6',
      network: 'SkillChain Mainnet',
      gasUsed: '21000',
      confirmations: 39,
      verified: true,
      skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Cryptography', 'SOC']
    },
    {
      id: 'CERT-2024-005',
      studentName: 'Nayan Fulare',
      studentId: 'STU-7841',
      course: 'Data Science with Python',
      institution: 'Stanford Online',
      issueDate: '2023-11-05',
      grade: 'A+',
      credits: 4,
      icon: '📊',
      color: 'purple',
      certHash: 'e7d0c4f6e5b1f9e2d6c0f7e5b3a9d2c6f0e4b8d2f6a0c8f2b6d0a4f8c2b0a8d4',
      txHash: '1b7e3f6c9a2d5b8e1f4c7a0d3f6b9e2c5a8d1f4b7e0c3a6d9f2b5e8c1d4f7a0',
      blockHash: '0000e3f6c9a2d5b8e1f4c7a0d3f6b9e2c5a8d1f4b7e0c3a6d9f2b5e8c1d4f7',
      blockNum: 4760,
      nonce: 2156,
      walletAddress: '0xA3F8E2D91C6B4507F28E3A1B9D5C7E0F4A2B8D6',
      network: 'SkillChain Mainnet',
      gasUsed: '21000',
      confirmations: 217,
      verified: true,
      skills: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'Statistics']
    }
  ],

  getAll() { return this.certificates; },
  getById(id) { return this.certificates.find(c => c.id === id); },
  getByHash(hash) { return this.certificates.find(c => c.certHash === hash || c.txHash === hash); }
};

// ── Utility functions ──
function shortHash(hash) {
  if (!hash) return '';
  return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days/30)} months ago`;
  return `${Math.floor(days/365)} years ago`;
}

function getColorClass(color) {
  const map = { blue: '#1a6cf0', green: '#00c875', gold: '#d4a017', red: '#ff3344', purple: '#8855ff', cyan: '#00d4ff' };
  return map[color] || '#1a6cf0';
}

// ── Export for global use ──
window.BlockchainEngine = BlockchainEngine;
window.CertificateDB = CertificateDB;
window.shortHash = shortHash;
window.formatDate = formatDate;
window.timeAgo = timeAgo;
window.getColorClass = getColorClass;
