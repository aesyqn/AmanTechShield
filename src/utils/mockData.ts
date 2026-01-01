export const services = [{
  id: 1,
  title: 'Penetration Test Simulation',
  description: 'Comprehensive vulnerability assessment of your banking system. We identify weak points in authentication, SSL configuration, and security protocols before attackers do.',
  icon: '🔐'
}, {
  id: 2,
  title: 'Phishing Detection',
  description: 'Advanced email and link analysis to detect phishing attempts. Our system identifies suspicious patterns, urgent language, and fraudulent requests to protect your users.',
  icon: '🎣'
}, {
  id: 3,
  title: 'Intrusion Detection System (IDS)',
  description: 'Real-time monitoring and analysis of system logs to detect abnormal activities. Identifies suspicious login patterns, unauthorized access attempts, and potential breaches.',
  icon: '🛡️'
}, {
  id: 4,
  title: 'Risk Scoring with Islamic Ethics',
  description: 'Comprehensive risk assessment combining technical vulnerabilities with ethical implications. Aligned with Islamic principles of Amanah (trust) and Maslahah (public benefit).',
  icon: '📊'
}, {
  id: 5,
  title: 'Recovery & Disclosure Plan',
  description: 'Detailed remediation strategies and ethical disclosure policies. Generate comprehensive PDF reports with step-by-step recovery plans and stakeholder communication guidelines.',
  icon: '📄'
}];
export const testimonials = [{
  id: 1,
  name: 'Ahmad Faisal',
  position: 'Chief Security Officer, Bank Amanah',
  content: 'By working with AmanTech Shield, we discovered 15 critical vulnerabilities and reduced ICS scope by 15 to 7%, increased authorization rates by 10 to 15% and reduced ICS scope.',
  rating: 5
}, {
  id: 2,
  name: 'Sarah Abdullah',
  position: 'IT Director, Islamic Finance Corp',
  content: 'The ethical framework aligned with our Islamic values made this the perfect solution. The detailed reports helped us improve our security posture significantly.',
  rating: 5
}, {
  id: 3,
  name: 'Dr. Yusuf Rahman',
  position: 'Compliance Manager, Shariah Bank',
  content: 'Comprehensive security assessment with ethical considerations. The recovery plans were practical and the disclosure policies respected our stakeholder relationships.',
  rating: 5
}];
export const teamMembers = [{
  id: 1,
  name: 'Nor Asyiqin Nazirah Binti Rapandi',
  role: 'Chief Executive Officer',
  email: 'nor_asyiqin_bi22@iluv.ums.edu.my',
  image: '/src/assets/asyiqin.JPG'
}, {
  id: 2,
  name: 'Nurul Aishah Irdina Binti Rahman',
  role: 'Chief Technology Officer',
  email: 'aishahlurvea@gmail.com',
  image: '/src/assets/irdina.png'
}, {
  id: 3,
  name: 'Nuruldiana Binti Zaidi',
  role: 'Head of Security Operations',
  email: 'nuruldiana_ti_bi22@iluv.ums.edu.my',
  image: '/src/assets/diana.jpg'
}, {
  id: 4,
  name: 'Mohamad Denish Jumad Bin Jamil',
  role: 'Lead Penetration Tester',
  email: 'denishjumad@gmail.com',
  image: '/src/assets/denish.png'
}, {
  id: 5,
  name: 'Maslinda Binti Sulaiman',
  role: 'Compliance & Risk Manager',
  email: 'Maslinda.ayen@gmail.com',
  image: '/src/assets/maslinda.png'
}, {
  id: 6,
  name: 'Julia Natasha Binti Jemuin',
  role: 'Threat Intelligence Analyst',
  email: 'julianatasha0307@gmail.com',
  image: '/src/assets/julia.png'
}, {
  id: 7,
  name: 'Afiqah Binti Ahmad Fairuze',
  role: 'Client Success Manager',
  email: 'afiqah_ti_bi22@iluv.ums.edu.my',
  image: '/src/assets/afiqah.jpg'
}];
export const trustedCompanies = ['Bank Amanah', 'Islamic Finance Corp', 'Shariah Bank', 'Takaful Insurance', 'Halal Investment Group', 'Barakah Holdings'];
export const vulnerabilityPatterns = {
  weakPassword: /password|123|admin|qwerty|letmein/i,
  noSSL: /http:\/\//,
  sqlInjection: /(\bOR\b|\bAND\b).*=.*|(\bUNION\b.*\bSELECT\b)|(\bDROP\b.*\bTABLE\b)/i,
  xss: /<script|javascript:|onerror=|onload=/i,
  missingHeaders: /x-frame-options|content-security-policy|strict-transport-security/i
};
export const phishingKeywords = ['urgent', 'immediate action', 'verify account', 'suspended', 'unusual activity', 'confirm identity', 'click here now', 'limited time', 'act now', 'security alert', 'update payment', 'prize winner', 'claim reward', 'reset password', 'transfer now', 'account locked', 'verify now', 'confirm your identity', 'unauthorized access', 'suspicious activity detected', 'action required', 'expire', 'validate', 'reactivate', 'billing problem', 'payment failed', 'update required', 'security breach', 'compromised', 'verify your information', 'confirm details'];
export const phishingUrlPatterns = [/bit\.ly|tinyurl|goo\.gl|ow\.ly|t\.co/i,
// URL shorteners
/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
// IP addresses
/@.*@/,
// Multiple @ symbols
/paypal.*verify|amazon.*account|apple.*id|microsoft.*security/i,
// Brand impersonation
/secure.*login|account.*verify|update.*billing/i // Common phishing phrases in URLs
];
export const idsAnomalies = {
  failedLogins: {
    threshold: 5,
    severity: 'high'
  },
  unusualHours: {
    threshold: 3,
    severity: 'medium'
  },
  multipleIPs: {
    threshold: 3,
    severity: 'high'
  },
  rapidRequests: {
    threshold: 100,
    severity: 'critical'
  }
};