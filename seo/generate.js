/**
 * StudyHub SEO Generator
 * Generates: robots.txt, sitemap.xml, meta tags for 43 subjects, 129 landing pages
 * Run: node seo/generate.js
 *
 * WARNING: STEP 4 overwrites the 129 existing landing pages in the project
 * root (one per subject x solved-assignments/guess-paper/study-material) and
 * STEP 7 writes seo/courses.json. Run with a clean git tree so changes are
 * reviewable, and only if landing-page regeneration is actually intended.
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════
// CONFIG — Change this to your actual domain
// ═══════════════════════════════════════════
const BASE_URL = 'https://immortaljeetsingh.github.io/StudyHub'; // GitHub Pages URL
const STUDY_DIR = path.join(__dirname, '..');
const CURRENT_YEAR = '2026';

// ═══════════════════════════════════════════
// COURSE DATA (43 subjects)
// ═══════════════════════════════════════════
const courses = [
  { id: 'mmpc01', name: 'Management Functions', full: 'Management Functions and Organizational Processes', keywords: 'planning organizing staffing directing controlling, management process, Fayol, Mintzberg' },
  { id: 'mmpc02', name: 'Human Resource Management', full: 'Human Resource Management - Recruitment to Employee Relations', keywords: 'recruitment selection training performance appraisal, HRM functions, human resource planning' },
  { id: 'mmpc03', name: 'Business Environment', full: 'Business Environment - PESTEL, Globalization and Economic Reforms', keywords: 'PESTEL analysis economic reforms globalization, business environment India, liberalization privatization' },
  { id: 'mmpc04', name: 'Accounting & Finance', full: 'Accounting and Finance for Managers', keywords: 'financial statements ratios cost accounting capital budgeting, balance sheet profit loss, accounting fundamentals' },
  { id: 'mmpc05', name: 'Quantitative Analysis', full: 'Quantitative Analysis for Managerial Decisions', keywords: 'linear programming probability hypothesis testing PERT CPM decision theory, statistics for management' },
  { id: 'mmpc06', name: 'Marketing Management', full: 'Marketing Management - 4Ps to Digital Marketing', keywords: '4Ps consumer behavior segmentation branding digital marketing, marketing mix, Kotler' },
  { id: 'mmpc07', name: 'Business Communication', full: 'Business Communication - Reports, Presentations and Cross-cultural', keywords: 'written oral communication reports presentations, business letter writing, cross-cultural communication' },
  { id: 'mmpc08', name: 'Information Systems', full: 'Information Systems for Managers', keywords: 'IT fundamentals SDLC databases AI ERP, management information systems, emerging technologies' },
  { id: 'mmpc09', name: 'Machines & Materials', full: 'Managing Machines and Materials - Operations and SCM', keywords: 'operations management work study value engineering inventory SCM lean JIT, production management' },
  { id: 'mmpc10', name: 'Managerial Economics', full: 'Managerial Economics - Demand, Production and Market Structures', keywords: 'demand production costs market structures pricing GDP inflation, microeconomics macroeconomics' },
  { id: 'mmpc11', name: 'Social Processes', full: 'Social Processes and Behavioural Issues in Organizations', keywords: 'individual behaviour motivation groups leadership culture change, organizational behaviour, OB' },
  { id: 'mmpc12', name: 'Strategic Management', full: 'Strategic Management - PESTEL, Porter, SWOT and Governance', keywords: 'PESTEL Porter five forces SWOT BCG matrix generic strategies corporate governance, strategic analysis' },
  { id: 'mmpc13', name: 'Business Law', full: 'Business Law - Contract Act to Consumer Protection', keywords: 'contract act sale of goods partnership companies act IPR consumer protection, Indian business law' },
  { id: 'mmpc14', name: 'Financial Management', full: 'Financial Management - TVM, WACC, Capital Budgeting and Forex', keywords: 'time value money WACC capital budgeting capital structure dividend forex, financial management MBA' },
  { id: 'mmpc15', name: 'Research Methodology', full: 'Research Methodology for Managers', keywords: 'research design data collection sampling statistics correlation, research methods MBA, hypothesis testing' },
  { id: 'mmpc16', name: 'International Business', full: 'International Business - Trade, Culture and Entry Modes', keywords: 'international business environment trade theories culture entry modes marketing mix, globalization MBA' },
  { id: 'mmpc17', name: 'Advanced Strategy', full: 'Corporate Strategy - M&A, Growth and International Strategy', keywords: 'corporate strategy M&A mergers acquisitions growth international strategy governance, advanced strategic management' },
  { id: 'mmpc18', name: 'Entrepreneurship', full: 'Entrepreneurship - Startups, Business Plans and Funding', keywords: 'startup ecosystem business plans funding social entrepreneurship, venture capital, new venture creation' },
  { id: 'mmpc19', name: 'Total Quality Management', full: 'Total Quality Management - TQM, Six Sigma and Kaizen', keywords: 'TQM Deming six sigma ISO 9001 quality tools kaizen DMAIC, quality management, continuous improvement' },
  { id: 'mmpc20', name: 'Business Ethics & CSR', full: 'Business Ethics and Corporate Social Responsibility', keywords: 'business ethics Carroll pyramid Section 135 ESG GRI sustainability, CSR India, corporate governance' },
  { id: 'mmph01', name: 'Organisation Theory & Design', full: 'Organisation Theory and Design', keywords: 'organisation theories structure types Mintzberg job design JCM, organizational design, bureaucracy' },
  { id: 'mmph02', name: 'Human Resource Development', full: 'Human Resource Development - Training, Mentoring and Competency', keywords: 'HRD system training Kirkpatrick mentoring e-learning competency, human resource development MBA' },
  { id: 'mmph04', name: 'Industrial Relations', full: 'Industrial Relations - Trade Unions, Collective Bargaining', keywords: 'industrial relations trade unions collective bargaining grievance discipline, IR MBA, labour laws India' },
  { id: 'mmph07', name: 'Compensation Management', full: 'Compensation Management - Job Evaluation to ESOPs', keywords: 'compensation job evaluation EPF ESI gratuity ESOPs total rewards, salary administration, pay structure' },
  { id: 'mmpb06', name: 'Banking Governance', full: 'Banking Governance - RBI, Basel, SEBI and ESG', keywords: 'banking governance RBI Basel IRDAI SEBI ESG whistleblower, bank management, financial regulation India' },
  { id: 'mmpm01', name: 'Consumer Behaviour', full: 'Consumer Behaviour - Models, Motivation and Decision Process', keywords: 'consumer behaviour motivation perception decision process, buyer behaviour, CB models MBA' },
  { id: 'mmpm02', name: 'Sales Management', full: 'Sales Management - Selling Skills, AIDA and Sales Force', keywords: 'selling skills AIDA sales force management quotas, sales planning, personal selling' },
  { id: 'mmpm03', name: 'Product & Brand Management', full: 'Product and Brand Management - PLC, Brand Equity and Keller', keywords: 'product levels PLC brand equity Keller, product lifecycle, brand management MBA' },
  { id: 'mmpm04', name: 'International Marketing', full: 'International Marketing - Trade Theories, 4P and Entry Modes', keywords: 'international marketing trade theories 4P entry modes, global marketing, export marketing' },
  { id: 'mmpm05', name: 'Marketing of Services', full: 'Marketing of Services - IHIP, 7Ps, SERVQUAL', keywords: 'IHIP 7Ps SERVQUAL yield management, service marketing, service quality' },
  { id: 'mmpm06', name: 'Marketing Research', full: 'Marketing Research - Process, Sampling and Statistics', keywords: 'marketing research process sampling statistics report, market research methods, data collection' },
  { id: 'mmpm07', name: 'Integrated Marketing Communication', full: 'Integrated Marketing Communication - Advertising to Digital', keywords: 'IMC advertising digital marketing, promotion mix, marketing communication MBA' },
  { id: 'mmpm09', name: 'Retail Management', full: 'Retail Management - Formats, Location, E-commerce', keywords: 'retail formats location e-commerce omnichannel, retailing, store management' },
  { id: 'mmpo01', name: 'Operations Research', full: 'Operations Research - LP, Transportation, Queuing and Simulation', keywords: 'linear programming transportation assignment sequencing queuing decision theory simulation, OR MBA' },
  { id: 'mmpo02', name: 'Project Management', full: 'Project Management - WBS, PERT/CPM, EVM and Contracts', keywords: 'WBS PERT CPM EVM contracts, project planning, project scheduling MBA' },
  { id: 'mmpo03', name: 'Operations Management', full: 'Operations Management - Process, Capacity and Six Sigma', keywords: 'process capacity forecasting six sigma, operations management MBA, production planning' },
  { id: 'mmpo04', name: 'Management Information Systems', full: 'Management Information Systems - BI, Database and Cloud', keywords: 'MIS BI database cloud computing, management information systems MBA, decision support systems' },
  { id: 'mmpo05', name: 'Logistics & SCM', full: 'Logistics and Supply Chain Management', keywords: 'supply chain management transport warehousing KPIs, logistics MBA, inventory management' },
  { id: 'mmpo06', name: 'Materials Management', full: 'Materials Management - ABC, VED, EOQ and Inventory', keywords: 'ABC VED EOQ inventory management, materials management MBA, stock control' },
  { id: 'mmpo08', name: 'International Logistics', full: 'International Logistics - Incoterms, Customs and 3PL', keywords: 'incoterms transport customs 3PL third party logistics, international logistics MBA, freight forwarding' },
  { id: 'mmpf01', name: 'Working Capital Management', full: 'Working Capital Management - Concepts, Financing and Cash Credit', keywords: 'working capital current assets financing cash credit MPBF, short-term finance, liquidity management' },
  { id: 'mmpf02', name: 'Capital Investment', full: 'Capital Investment Decisions - NPV, IRR and Dividend Policy', keywords: 'NPV IRR payback capital structure dividend policy M&M, investment appraisal, capital budgeting MBA' },
  { id: 'mmpf03', name: 'Management Control Systems', full: 'Management Control Systems - MCS, Budget and BSC', keywords: 'MCS responsibility centres transfer pricing budget variance BSC, balanced scorecard, management control' },
];

// ═══════════════════════════════════════════
// UNIT DATA (extracted from subject files)
// ═══════════════════════════════════════════
const unitData = {
  mmpc01: ['Management Overview', 'Evolution of Management', 'Roles of Managers', 'Planning', 'Organizing', 'Staffing & Directing', 'Controlling', 'Leading & Motivating', 'Decision Making', 'Organization Structure', 'Communication', 'Organizational Culture', 'Managing Change', 'Ethics & CSR'],
  mmpc02: ['Introduction to HRM', 'Human Resource Planning', 'Job Analysis', 'Recruitment', 'Selection', 'Training & Development', 'Performance Appraisal', 'Compensation Management', 'Employee Relations', ' Grievance Handling', 'Discipline Management', 'HR Information System', 'Quality of Work Life', 'International HRM', 'Emerging Trends in HRM'],
  mmpc03: ['Business Environment Overview', 'Economic Environment', 'Economic Reforms', 'Liberalization & Privatization', 'Globalization', 'Political Environment', 'Legal Environment', 'Social Environment', 'Technological Environment', 'Ecological Environment', 'International Business Environment', 'CSR & Ethics', 'Indian Economy', 'Business Cycles', 'Government Policy'],
  mmpc04: ['Financial Accounting', 'Accounting Standards', 'Balance Sheet', 'Profit & Loss Account', 'Ratio Analysis', 'Cost Accounting', 'Cost-Volume-Profit Analysis', 'Budgeting', 'Capital Budgeting', 'Time Value of Money', 'Working Capital', 'Financial Markets', 'Corporate Finance', 'Mergers & Acquisitions', 'Indian Accounting Practices', 'Financial Reporting'],
  mmpc05: ['Quantitative Methods Overview', 'Linear Programming', 'Transportation Problem', 'Assignment Problem', 'Probability', 'Probability Distributions', 'Hypothesis Testing', 'Correlation', 'Regression Analysis', 'Chi-Square Test', 'ANOVA', 'PERT & CPM', 'Decision Theory', 'Simulation', 'Game Theory', 'Queuing Theory'],
  mmpc06: ['Marketing Overview', 'Marketing Environment', 'Consumer Behaviour', 'Market Segmentation', 'Targeting & Positioning', 'Product Decisions', 'Pricing Strategies', 'Place & Distribution', 'Promotion & Communication', 'Digital Marketing', 'Branding', 'Marketing Research'],
  mmpc07: ['Communication Fundamentals', 'Written Communication', 'Business Letters', 'Report Writing', 'Oral Communication', 'Presentations', 'Non-verbal Communication', 'Cross-cultural Communication', 'Group Communication', 'Meeting Management', 'Negotiation Skills', 'Corporate Communication', 'Digital Communication', 'Communication Barriers'],
  mmpc08: ['IT Fundamentals', 'Computer Hardware', 'Software Systems', 'Database Management', 'Networking', 'Internet & Web', 'SDLC', 'System Analysis', 'System Design', 'ERP Systems', 'Cloud Computing', 'Artificial Intelligence', 'Cyber Security', 'Emerging Technologies'],
  mmpc09: ['Operations Management Overview', 'Work Study', 'Method Study', 'Time Study', 'Value Engineering', 'Production Planning', 'Inventory Management', 'Materials Management', 'Quality Control', 'Supply Chain Management', 'Lean Manufacturing', 'JIT System', 'Maintenance Management', 'Facility Planning', 'Operations Strategy'],
  mmpc10: ['Managerial Economics Overview', 'Demand Analysis', 'Demand Forecasting', 'Production Function', 'Cost Analysis', 'Market Structures', 'Perfect Competition', 'Monopoly', 'Oligopoly', 'Pricing Strategies', 'National Income', 'Inflation & Business Cycles'],
  mmpc11: ['Individual Behaviour', 'Personality & Values', 'Perception', 'Motivation Theories', 'Group Dynamics', 'Team Building', 'Leadership Theories', 'Power & Politics', 'Conflict Management', 'Organizational Culture', 'Organizational Change', 'Stress Management', 'Job Satisfaction', 'Organizational Development', 'Learning Organizations'],
  mmpc12: ['Strategic Management Overview', 'External Environment Analysis', 'PESTEL Analysis', 'Porter\'s Five Forces', 'Internal Analysis', 'SWOT Analysis', 'BCG Matrix', 'Generic Strategies', 'Corporate Strategy', 'Business Strategy', 'Functional Strategy', 'Strategy Implementation', 'Corporate Governance', 'Strategic Control'],
  mmpc13: ['Indian Legal System', 'Law of Contract', 'Contract Act 1872', 'Sale of Goods Act', 'Indian Partnership Act', 'Companies Act 2013', 'Intellectual Property Rights', 'Consumer Protection Act', 'Competition Act', 'Information Technology Act', 'Labour Laws', 'Environmental Laws', 'Arbitration & Dispute Resolution', 'Corporate Governance & Law'],
  mmpc14: ['Financial Management Overview', 'Time Value of Money', 'Risk & Return', 'Cost of Capital', 'Capital Budgeting', 'Capital Structure', 'Dividend Policy', 'Working Capital Management', 'Financial Planning', 'Corporate Restructuring', 'International Financial Management', 'Forex Management', 'Derivatives', 'Indian Financial System', 'Mergers & Acquisitions', 'Behavioral Finance'],
  mmpc15: ['Research Methodology Overview', 'Research Design', 'Literature Review', 'Data Collection Methods', 'Sampling Techniques', 'Questionnaire Design', 'Scaling Techniques', 'Descriptive Statistics', 'Inferential Statistics', 'Correlation Analysis', 'Regression Analysis', 'Hypothesis Testing', 'Report Writing', 'Research Ethics'],
  mmpc16: ['International Business Overview', 'Globalization', 'International Trade Theories', 'Trade Policy', 'International Monetary System', 'Balance of Payments', 'Foreign Exchange Market', 'Cultural Environment', 'Political & Legal Environment', 'International Market Entry', 'International Marketing Mix', 'International HRM', 'International Finance'],
  mmpc17: ['Corporate Strategy Overview', 'Diversification Strategy', 'Mergers & Acquisitions', 'Strategic Alliances', 'Joint Ventures', 'Growth Strategies', 'Turnaround Strategy', 'International Strategy', 'Global Strategy', 'Corporate Governance', 'Strategic Leadership', 'Strategy Evaluation', 'Balanced Scorecard'],
  mmpc18: ['Entrepreneurship Overview', 'Entrepreneurial Mindset', 'Startup Ecosystem', 'Business Idea Generation', 'Business Plan', 'Market Research for Startups', 'Funding & Venture Capital', 'Angel Investors', 'Bootstrapping', 'Social Entrepreneurship', 'Women Entrepreneurship', 'Government Schemes for Startups'],
  mmpc19: ['Quality Concepts', 'TQM Philosophy', 'Deming\'s 14 Points', 'Juran Trilogy', 'Crosby\'s Zero Defects', 'Six Sigma', 'DMAIC Methodology', 'Quality Tools', 'ISO 9001', 'Kaizen', '5S Methodology', 'Benchmarking', 'Quality Circles', 'Customer Satisfaction'],
  mmpc20: ['Business Ethics Overview', 'Ethical Theories', 'Moral Development', 'Corporate Governance', 'CSR Concepts', 'Carroll\'s CSR Pyramid', 'Section 135 Companies Act', 'CSR Activities in India', 'ESG Framework', 'GRI Standards', 'Sustainability Reporting', 'Whistleblowing', 'Stakeholder Theory', 'Global Ethics'],
  mmph01: ['Organisation Theory Overview', 'Classical Organisation Theory', 'Neo-classical Theory', 'Systems Approach', 'Contingency Theory', 'Organizational Structure', 'Mintzberg Configurations', 'Departmentalization', 'Job Design', 'Job Characteristics Model', 'Organizational Design', 'Technology & Structure'],
  mmph02: ['HRD Overview', 'HRD System', 'Training & Development', 'Kirkpatrick Model', 'Training Needs Analysis', 'Training Methods', 'Mentoring & Coaching', 'Career Development', 'Performance Management', 'Competency Mapping', 'E-Learning', 'Knowledge Management', 'HRD Culture'],
  mmph04: ['Industrial Relations Overview', 'Industrial Relations Theories', 'Trade Unions', 'Trade Union Movement in India', 'Collective Bargaining', 'Workers Participation', 'Grievance Handling', 'Discipline Management', 'Dispute Resolution', 'Standing Orders', 'Industrial Democracy', 'ILO Conventions', 'Labour Laws in India', 'Recent IR Reforms', 'Global IR Trends'],
  mmph07: ['Compensation Overview', 'Job Evaluation', 'Pay Structure Design', 'Incentive Plans', 'Employee Benefits', 'EPF & ESI', 'Gratuity Act', 'Bonus Act', 'ESOPs', 'Total Rewards Strategy', 'Executive Compensation'],
  mmpb06: ['Banking Governance Overview', 'Governance Principles', 'RBI & Banking Regulation', 'Basel Norms', 'Capital Adequacy', 'Risk Management', 'Credit Risk', 'Operational Risk', 'Market Risk', 'IRDAI & Insurance', 'SEBI & Capital Markets', 'ESG in Banking', 'Whistleblower Policy', 'Corporate Governance in Banks', 'Digital Banking Governance'],
  mmpm01: ['Consumer Behaviour Overview', 'CB Models', 'Motivation', 'Perception', 'Learning & Memory', 'Attitude Formation', 'Personality & CB', 'Cultural Influences', 'Social Influences', 'Family Decision Making', 'Consumer Decision Process', 'Post-Purchase Behaviour', 'Digital Consumer Behaviour', 'Consumer Rights', 'Research Methods in CB'],
  mmpm02: ['Sales Management Overview', 'Selling Skills', 'AIDA Model', 'Sales Process', 'Sales Planning', 'Sales Organization', 'Sales Force Management', 'Recruitment & Training', 'Sales Quotas', 'Sales Territory', 'Sales Compensation', 'Sales Ethics', 'CRM & Sales'],
  mmpm03: ['Product Concepts', 'Product Levels', 'Product Classification', 'Product Life Cycle', 'New Product Development', 'Brand Concepts', 'Brand Equity', 'Keller\'s Brand Model', 'Brand Positioning', 'Brand Extension', 'Brand Architecture', 'Packaging & Labeling', 'Product Strategy', 'Digital Branding'],
  mmpm04: ['International Marketing Overview', 'IM Environment', 'Trade Theories', 'International Research', 'Market Entry Modes', 'Export Marketing', 'International Product Strategy', 'International Pricing', 'International Distribution', 'International Promotion', 'Digital International Marketing', 'Cultural Adaptation', 'Legal Aspects', 'IM in India', 'Global Brands', 'E-commerce in IM'],
  mmpm05: ['Services Overview', 'IHIP Characteristics', 'Service Quality', 'SERVQUAL Model', '7Ps of Services', 'Service Design', 'Service Blueprinting', 'Yield Management', 'Customer Satisfaction', 'Service Recovery', 'Digital Services', 'Healthcare Marketing', 'Tourism Marketing', 'Financial Services Marketing'],
  mmpm06: ['Marketing Research Overview', 'MR Process', 'Research Design', 'Secondary Data', 'Primary Data Collection', 'Observation Method', 'Survey Method', 'Experimental Method', 'Sampling Design', 'Sample Size', 'Data Analysis', 'Statistical Techniques', 'Report Writing', 'Digital MR Tools'],
  mmpm07: ['IMC Overview', 'Communication Process', 'Promotion Mix', 'Advertising Management', 'Media Planning', 'Sales Promotion', 'Public Relations', 'Personal Selling', 'Direct Marketing', 'Digital Marketing', 'Social Media Marketing', 'Content Marketing', 'IMC Campaign Planning', 'Budgeting & Evaluation', 'Ethical Issues in IMC'],
  mmpo01: ['OR Overview', 'Linear Programming', 'Simplex Method', 'Transportation Problem', 'Assignment Problem', 'Sequencing', 'Queuing Theory', 'Game Theory', 'Decision Theory', 'Simulation', 'Network Analysis', 'Dynamic Programming', 'Integer Programming', 'Goal Programming', 'Non-linear Programming', 'Metaheuristics'],
  mmpo02: ['Project Management Overview', 'Project Life Cycle', 'Work Breakdown Structure', 'Project Scheduling', 'PERT', 'CPM', 'Time-Cost Trade-off', 'Resource Planning', 'Earned Value Management', 'Risk Management', 'Project Monitoring', 'Project Closure', 'Contracts & Procurement', 'Agile Project Management'],
  mmpo03: ['Operations Management Overview', 'Process Design', 'Capacity Planning', 'Facility Location', 'Facility Layout', 'Forecasting', 'Aggregate Planning', 'Inventory Management', 'MRP', 'ERP', 'Quality Management', 'Six Sigma', 'Lean Operations', 'Supply Chain Integration', 'Operations Strategy'],
  mmpo04: ['MIS Overview', 'Information Systems Types', 'Database Concepts', 'Data Warehousing', 'Business Intelligence', 'Decision Support Systems', 'Expert Systems', 'Enterprise Systems', 'ERP', 'Cloud Computing', 'IS Security', 'IS Planning', 'Digital Transformation', 'Emerging Technologies'],
  mmpo05: ['Logistics Overview', 'Logistics Network Design', 'Transportation Management', 'Warehousing', 'Inventory Management', 'Order Processing', 'Packaging', 'Supply Chain Management', 'SCM Models', 'Supply Chain Integration', 'Global Logistics', 'Reverse Logistics', 'Logistics KPIs', 'Green Logistics', 'E-logistics', '3PL & 4PL', 'Demand Planning', 'Supply Chain Risk', 'SCM Technology', 'SCM Strategy'],
  mmpo06: ['Materials Management Overview', 'ABC Analysis', 'VED Analysis', 'FSN Analysis', 'EOQ Model', 'Inventory Control', 'Safety Stock', 'Reorder Point', 'Purchase Management', 'Vendor Management', 'Store Management', 'Materials Handling', 'Waste Management', 'Just-in-Time', 'Materials Planning'],
  mmpo08: ['International Logistics Overview', 'International Trade', 'Incoterms 2020', 'Transport Modes', 'Ocean Freight', 'Air Freight', 'Customs Clearance', 'Documentation', 'Trade Finance', '3PL in International', 'Free Trade Zones', 'Global Supply Chain', 'Risk in International Logistics', 'Digital Trade'],
  mmpf01: ['Working Capital Overview', 'WC Concepts', 'Operating Cycle', 'Cash Management', 'Receivables Management', 'Inventory Management', 'Payables Management', 'Working Capital Financing', 'Cash Credit', 'MPBF', 'Trade Credit', 'Short-term Finance', 'Bank Finance', 'WC in India', 'WC Policies'],
  mmpf02: ['Capital Investment Overview', 'Time Value of Money', 'NPV Method', 'IRR Method', 'Payback Period', 'Profitability Index', 'Capital Rationing', 'Risk Analysis', 'Sensitivity Analysis', 'Capital Structure', 'Modigliani-Miller', 'Trade-off Theory', 'Pecking Order Theory', 'Dividend Policy', 'Dividend Theories', 'Share Buyback'],
  mmpf03: ['Management Control Overview', 'MCS Framework', 'Responsibility Centres', 'Transfer Pricing', 'Budgetary Control', 'Variance Analysis', 'Balanced Scorecard', 'Performance Measurement', 'Strategic Control', 'Operational Control', 'Financial Control', 'Behavioral Aspects', 'IT in Control', 'Risk Management & Control', 'Ethics in Control', 'MCS Design'],
};

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getUnits(id) {
  return unitData[id] || [];
}

function getCourseById(id) {
  return courses.find(c => c.id === id);
}

function getSubjectCode(id) {
  const prefix = id.replace(/[0-9]/g, '').toUpperCase();
  const num = id.replace(/[a-z]/g, '');
  return `${prefix}-${num.padStart(2, '0')}`;
}

// ═══════════════════════════════════════════
// STEP 1: Generate robots.txt
// ═══════════════════════════════════════════
function generateRobots() {
  const content = `User-agent: *
Allow: /
Disallow: /scripts/
Disallow: /*.bak$

Sitemap: ${BASE_URL}/sitemap.xml

# StudyHub - IGNOU MBA Study Material
# Free notes, quizzes, and study guides for all 43 IGNOU MBA subjects
`;
  fs.writeFileSync(path.join(STUDY_DIR, 'robots.txt'), content, 'utf8');
  console.log('[OK] robots.txt generated');
}

// ═══════════════════════════════════════════
// STEP 2: Generate sitemap.xml
// ═══════════════════════════════════════════
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let urls = [];

  // Main pages
  urls.push({ loc: BASE_URL + '/', priority: '1.0', changefreq: 'weekly', lastmod: today });
  urls.push({ loc: BASE_URL + '/study-hub.html', priority: '0.9', changefreq: 'weekly', lastmod: today });

  // Subject pages
  for (const c of courses) {
    urls.push({ loc: `${BASE_URL}/study-${c.id}.html`, priority: '0.8', changefreq: 'monthly', lastmod: today });
    // Landing pages
    urls.push({ loc: `${BASE_URL}/${c.id}-solved-assignments.html`, priority: '0.7', changefreq: 'monthly', lastmod: today });
    urls.push({ loc: `${BASE_URL}/${c.id}-guess-paper.html`, priority: '0.7', changefreq: 'monthly', lastmod: today });
    urls.push({ loc: `${BASE_URL}/${c.id}-study-material.html`, priority: '0.7', changefreq: 'monthly', lastmod: today });
  }

  // Quiz pages (one per course, same list as study pages)
  for (const c of courses) {
    urls.push({ loc: `${BASE_URL}/quiz-${c.id}.html`, priority: '0.6', changefreq: 'monthly', lastmod: today });
  }

  // Other pages
  urls.push({ loc: `${BASE_URL}/flashcards.html`, priority: '0.5', changefreq: 'monthly', lastmod: today });
  urls.push({ loc: `${BASE_URL}/quiz-results.html`, priority: '0.4', changefreq: 'monthly', lastmod: today });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(STUDY_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[OK] sitemap.xml generated (${urls.length} URLs)`);
}

// ═══════════════════════════════════════════
// STEP 3: Add SEO meta tags to existing subject pages
// ═══════════════════════════════════════════
function addMetaToSubjectPages() {
  let updated = 0;

  for (const c of courses) {
    const filePath = path.join(STUDY_DIR, `study-${c.id}.html`);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] study-${c.id}.html not found`);
      continue;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    const code = getSubjectCode(c.id);
    const units = getUnits(c.id);

    // Build meta description
    const unitList = units.slice(0, 5).join(', ');
    const description = `${code} ${c.name} - Free IGNOU MBA study notes covering ${unitList} and more. ${c.full}. Diagrams, Indian examples, mnemonics, and exam tips.`;

    // Build keywords
    const keywords = `IGNOU ${code}, ${c.name}, IGNOU MBA notes, ${code} study material, IGNOU ${code} notes ${CURRENT_YEAR}, ${c.keywords}`;

    // Build JSON-LD
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": `StudyHub - IGNOU ${code} ${c.name}`,
      "description": description,
      "url": `${BASE_URL}/study-${c.id}.html`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Free IGNOU MBA study notes"
      },
      "educationalLevel": "Postgraduate",
      "teaches": c.name,
      "inLanguage": "en",
      "isPartOf": {
        "@type": "WebSite",
        "name": "StudyHub",
        "url": BASE_URL
      }
    };

    // Build meta tags to inject
    const metaTags = `
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}">
<link rel="canonical" href="${BASE_URL}/study-${c.id}.html">
<meta property="og:type" content="website">
<meta property="og:title" content="${code}: ${c.name} | StudyHub - Free IGNOU MBA Notes">
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
<meta property="og:url" content="${BASE_URL}/study-${c.id}.html">
<meta property="og:site_name" content="StudyHub">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${code}: ${c.name} | StudyHub">
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}">
<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;

    // Check if meta tags already exist (don't duplicate)
    if (html.includes('name="description"')) {
      // Replace existing description
      html = html.replace(/<meta name="description"[^>]*>/, '');
    }
    if (html.includes('name="keywords"')) {
      html = html.replace(/<meta name="keywords"[^>]*>/, '');
    }
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link rel="canonical"[^>]*>/, '');
    }
    if (html.includes('property="og:')) {
      html = html.replace(/<meta property="og:[^>]*>\n?/g, '');
    }
    if (html.includes('name="twitter:')) {
      html = html.replace(/<meta name="twitter:[^>]*>\n?/g, '');
    }
    if (html.includes('application/ld+json')) {
      html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
    }

    // Inject meta tags before </head>
    html = html.replace('</head>', `${metaTags}\n</head>`);

    // Also update the title to be more SEO-friendly
    const oldTitleMatch = html.match(/<title>([^<]*)<\/title>/);
    if (oldTitleMatch) {
      const newTitle = `${code} ${c.name} - Free IGNOU MBA Notes ${CURRENT_YEAR} | StudyHub`;
      html = html.replace(oldTitleMatch[0], `<title>${newTitle}</title>`);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }

  console.log(`[OK] Meta tags added to ${updated} subject pages`);
}

// ═══════════════════════════════════════════
// STEP 4: Generate keyword-targeted landing pages
// ═══════════════════════════════════════════
function generateLandingPages() {
  const landingDir = path.join(STUDY_DIR);
  let count = 0;

  const pageTypes = [
    {
      suffix: 'solved-assignments',
      keyword: 'Solved Assignments',
      h1: (code, name) => `IGNOU ${code} ${name} - Solved Assignments ${CURRENT_YEAR}`,
      title: (code, name) => `IGNOU ${code} ${name} Solved Assignments ${CURRENT_YEAR} | StudyHub`,
      desc: (code, name) => `Get IGNOU ${code} ${name} solved assignments for ${CURRENT_YEAR}. Free solved answers for all units with explanations. Updated for latest IGNOU session.`,
      intro: (code, name, units) => `Looking for <strong>IGNOU ${code} ${name} solved assignments</strong>? StudyHub provides comprehensive solved assignment answers for all ${units.length} units of ${code}. Our answers are written by MBA experts and updated for the ${CURRENT_YEAR} IGNOU session. Each answer includes key concepts, diagrams, and Indian examples to help you score maximum marks.`,
      cta: 'View Full Study Notes',
    },
    {
      suffix: 'guess-paper',
      keyword: 'Guess Paper',
      h1: (code, name) => `IGNOU ${code} ${name} Guess Paper ${CURRENT_YEAR} - Important Questions`,
      title: (code, name) => `IGNOU ${code} ${name} Guess Paper ${CURRENT_YEAR} - Important Questions | StudyHub`,
      desc: (code, name) => `IGNOU ${code} ${name} guess paper ${CURRENT_YEAR}. Most important questions with solved answers for exam preparation. Based on previous year paper analysis.`,
      intro: (code, name, units) => `Prepare for your IGNOU ${code} ${name} exam with our <strong>${CURRENT_YEAR} guess paper</strong>. Based on analysis of previous year papers and IGNOU exam patterns, we have identified the most important questions from all ${units.length} units. Each question comes with a detailed answer, key points, and exam tips.`,
      cta: 'Study Complete Notes',
    },
    {
      suffix: 'study-material',
      keyword: 'Study Material',
      h1: (code, name) => `IGNOU ${code} ${name} Study Material - Free Notes ${CURRENT_YEAR}`,
      title: (code, name) => `IGNOU ${code} ${name} Study Material Free Download ${CURRENT_YEAR} | StudyHub`,
      desc: (code, name) => `Free IGNOU ${code} ${name} study material ${CURRENT_YEAR}. Comprehensive notes with diagrams, Indian examples, mnemonics, and exam tips for all units.`,
      intro: (code, name, units) => `Access <strong>free IGNOU ${code} ${name} study material</strong> on StudyHub. Our comprehensive notes cover all ${units.length} units with detailed explanations, diagrams, Indian business examples, memory tricks, and exam-focused summaries. Designed for IGNOU MBA students preparing for term-end examinations.`,
      cta: 'Access Full Study Material',
    },
  ];

  for (const c of courses) {
    const code = getSubjectCode(c.id);
    const units = getUnits(c.id);

    for (const pt of pageTypes) {
      const filename = `${c.id}-${pt.suffix}.html`;
      const filePath = path.join(landingDir, filename);

      // Build FAQ items
      const faqItems = [
        { q: `What is the syllabus for IGNOU ${code} ${c.name}?`, a: `The IGNOU ${code} ${c.name} syllabus covers ${units.length} units: ${units.slice(0, 6).join(', ')}, and more. StudyHub covers all units with detailed notes.` },
        { q: `Where can I get free IGNOU ${code} study material?`, a: `StudyHub provides free comprehensive study notes for IGNOU ${code} ${c.name} covering all ${units.length} units with diagrams, examples, and exam tips. Visit our study notes page for the complete material.` },
        { q: `How to prepare for IGNOU ${code} exam?`, a: `Start by reading the study material for all units, focus on key concepts and definitions, practice with previous year questions, and use mnemonics for difficult topics. StudyHub notes include exam tips for each unit.` },
        { q: `Is IGNOU ${code} ${c.name} difficult?`, a: `${code} ${c.name} is manageable with proper preparation. The subject covers fundamental concepts that are well-explained in StudyHub notes with Indian examples and real-world applications.` },
        { q: `How many units are there in IGNOU ${code}?`, a: `IGNOU ${code} ${c.name} has ${units.length} units organized across multiple blocks. StudyHub covers all units comprehensively.` },
      ];

      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      };

      const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pt.title(code, c.name),
        "description": pt.desc(code, c.name),
        "url": `${BASE_URL}/${filename}`,
        "isPartOf": {
          "@type": "WebSite",
          "name": "StudyHub",
          "url": BASE_URL
        },
        "about": {
          "@type": "Course",
          "name": `IGNOU ${code} ${c.name}`,
          "description": c.full,
          "educationalLevel": "Postgraduate",
          "provider": {
            "@type": "Organization",
            "name": "Indira Gandhi National Open University",
            "sameAs": "https://ignou.ac.in"
          }
        }
      };

      // Generate unit preview cards
      const unitCards = units.map((unit, i) => `
      <div class="unit-preview">
        <h3>Unit ${i + 1}: ${unit}</h3>
        <p>Key concepts, definitions, diagrams, and exam-ready notes for ${unit} in the context of ${c.name}.</p>
        <a href="study-${c.id}.html#u${i + 1}" class="unit-link">Read Full Notes &rarr;</a>
      </div>`).join('\n');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${pt.title(code, c.name)}</title>
<meta name="description" content="${pt.desc(code, c.name).replace(/"/g, '&quot;')}">
<meta name="keywords" content="IGNOU ${code}, ${c.name} ${pt.keyword.toLowerCase()}, IGNOU MBA ${pt.keyword.toLowerCase()}, ${code} ${pt.keyword.toLowerCase()} ${CURRENT_YEAR}, IGNOU ${c.name.toLowerCase()} notes">
<link rel="canonical" href="${BASE_URL}/${filename}">
<meta property="og:type" content="website">
<meta property="og:title" content="${pt.title(code, c.name)}">
<meta property="og:description" content="${pt.desc(code, c.name).replace(/"/g, '&quot;')}">
<meta property="og:url" content="${BASE_URL}/${filename}">
<meta property="og:site_name" content="StudyHub">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${pt.title(code, c.name)}">
<meta name="twitter:description" content="${pt.desc(code, c.name).replace(/"/g, '&quot;')}">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>
<script type="application/ld+json">${JSON.stringify(webPageSchema, null, 2)}</script>
<style>
  .landing-hero{background:linear-gradient(135deg,var(--bg-surface),var(--bg-primary));padding:3rem 2rem;border-radius:20px;margin-bottom:2rem;text-align:center}
  .landing-hero h1{font-size:clamp(1.5rem,4vw,2.2rem);color:var(--text-primary);margin-bottom:1rem;line-height:1.3}
  .landing-hero p{color:var(--text-secondary);max-width:700px;margin:0 auto 1.5rem;font-size:1.05rem;line-height:1.6}
  .landing-cta{display:inline-block;padding:0.8rem 2rem;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;transition:transform 0.2s,box-shadow 0.2s}
  .landing-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3)}
  .unit-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin:2rem 0}
  .unit-preview{background:var(--bg-surface);border:1px solid var(--glass-border);border-radius:14px;padding:1.2rem;transition:transform 0.2s}
  .unit-preview:hover{transform:translateY(-2px)}
  .unit-preview h3{font-size:0.95rem;color:var(--accent);margin-bottom:0.5rem}
  .unit-preview p{font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.8rem;line-height:1.5}
  .unit-link{color:var(--accent);text-decoration:none;font-size:0.85rem;font-weight:600}
  .unit-link:hover{text-decoration:underline}
  .faq-section{margin:2.5rem 0}
  .faq-section h2{font-size:1.4rem;color:var(--text-primary);margin-bottom:1.5rem;text-align:center}
  .faq-item{background:var(--bg-surface);border:1px solid var(--glass-border);border-radius:14px;margin-bottom:1rem;overflow:hidden}
  .faq-item summary{padding:1rem 1.2rem;cursor:pointer;font-weight:600;color:var(--text-primary);font-size:0.95rem}
  .faq-item summary:hover{color:var(--accent)}
  .faq-item p{padding:0 1.2rem 1rem;color:var(--text-secondary);font-size:0.9rem;line-height:1.6}
  .breadcrumb{margin-bottom:1.5rem;font-size:0.85rem;color:var(--text-secondary)}
  .breadcrumb a{color:var(--accent);text-decoration:none}
  .breadcrumb a:hover{text-decoration:underline}
  .related-subjects{margin:2rem 0;padding:1.5rem;background:var(--bg-surface);border-radius:14px;border:1px solid var(--glass-border)}
  .related-subjects h2{font-size:1.1rem;color:var(--text-primary);margin-bottom:1rem}
  .related-grid{display:flex;flex-wrap:wrap;gap:0.5rem}
  .related-grid a{padding:0.4rem 0.8rem;background:var(--glass);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-secondary);text-decoration:none;font-size:0.8rem;transition:all 0.2s}
  .related-grid a:hover{border-color:var(--accent);color:var(--accent)}
</style>
</head>
<body class="subject-${c.id}">
<div style="max-width:900px;margin:0 auto;padding:1.5rem">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="study-hub.html">StudyHub</a> &rsaquo;
    <a href="study-hub.html">IGNOU MBA</a> &rsaquo;
    <a href="study-${c.id}.html">${code} ${c.name}</a> &rsaquo;
    <span>${pt.keyword}</span>
  </nav>

  <div class="landing-hero">
    <h1>${pt.h1(code, c.name)}</h1>
    <p>${pt.intro(code, c.name, units)}</p>
    <a href="study-${c.id}.html" class="landing-cta">${pt.cta} &rarr;</a>
  </div>

  <section>
    <h2 style="font-size:1.3rem;color:var(--text-primary);margin-bottom:0.5rem">Unit-wise ${pt.keyword} for ${code}</h2>
    <p style="color:var(--text-secondary);margin-bottom:1.5rem">Browse ${pt.keyword.toLowerCase()} for each unit of IGNOU ${code} ${c.name}. Click any unit to read the complete study notes.</p>
    <div class="unit-grid">
${unitCards}
    </div>
  </section>

  <section class="faq-section">
    <h2>Frequently Asked Questions - IGNOU ${code} ${c.name}</h2>
    ${faqItems.map(f => `<details class="faq-item">
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>`).join('\n    ')}
  </section>

  <div class="related-subjects">
    <h2>Related IGNOU MBA Subjects</h2>
    <div class="related-grid">
      ${courses.filter(rc => rc.id !== c.id).slice(0, 12).map(rc => `<a href="study-${rc.id}.html">${getSubjectCode(rc.id)} ${rc.name}</a>`).join('\n      ')}
    </div>
  </div>

  <div style="text-align:center;margin:2rem 0">
    <a href="study-${c.id}.html" class="landing-cta">${pt.cta} &rarr;</a>
  </div>

  <footer style="text-align:center;padding:2rem 0;color:var(--text-secondary);font-size:0.8rem;border-top:1px solid var(--glass-border);margin-top:2rem">
    <p>StudyHub - Free IGNOU MBA Study Material | <a href="study-hub.html" style="color:var(--accent)">Browse All 43 Subjects</a></p>
  </footer>
</div>
</body>
</html>`;

      fs.writeFileSync(filePath, html, 'utf8');
      count++;
    }
  }

  console.log(`[OK] ${count} landing pages generated (3 per subject x ${courses.length} subjects)`);
}

// ═══════════════════════════════════════════
// STEP 5: Update study-hub.html SEO
// ═══════════════════════════════════════════
function updateHubPage() {
  const hubPath = path.join(STUDY_DIR, 'study-hub.html');
  if (!fs.existsSync(hubPath)) {
    console.log('[SKIP] study-hub.html not found');
    return;
  }

  let html = fs.readFileSync(hubPath, 'utf8');

  const description = `StudyHub - Free IGNOU MBA study material for all 43 subjects. Comprehensive notes with diagrams, Indian examples, mnemonics, quizzes, and exam tips. Covering MMPC, MMPM, MMPH, MMPF, MMPB, and MMPO courses.`;
  const title = `StudyHub - Free IGNOU MBA Study Material | All 43 Subjects | ${CURRENT_YEAR}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StudyHub",
    "url": BASE_URL,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/study-hub.html?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StudyHub"
    }
  };

  // Remove existing meta tags if any
  html = html.replace(/<meta name="description"[^>]*>\n?/g, '');
  html = html.replace(/<meta name="keywords"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>\n?/g, '');
  html = html.replace(/<meta property="og:[^>]*>\n?/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>\n?/g, '');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');

  const metaTags = `
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<meta name="keywords" content="IGNOU MBA study material, IGNOU notes free, MMPC notes, IGNOU MBA ${CURRENT_YEAR}, IGNOU solved assignments, IGNOU guess paper, free MBA notes India">
<link rel="canonical" href="${BASE_URL}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
<meta property="og:url" content="${BASE_URL}/">
<meta property="og:site_name" content="StudyHub">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}">
<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;

  html = html.replace('</head>', `${metaTags}\n</head>`);

  // Update title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  fs.writeFileSync(hubPath, html, 'utf8');
  console.log('[OK] study-hub.html SEO updated');
}

// ═══════════════════════════════════════════
// STEP 6: Update index.html SEO
// ═══════════════════════════════════════════
function updateIndexPage() {
  const indexPath = path.join(STUDY_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('[SKIP] index.html not found');
    return;
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  const description = `StudyHub - Free IGNOU MBA study material for all 43 subjects. Notes, quizzes, and study guides with diagrams, Indian examples, and exam tips.`;

  // Remove existing meta tags if any
  html = html.replace(/<meta name="description"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>\n?/g, '');
  html = html.replace(/<meta property="og:[^>]*>\n?/g, '');

  const metaTags = `
<meta name="description" content="${description}">
<link rel="canonical" href="${BASE_URL}/">
<meta property="og:type" content="website">
<meta property="og:title" content="StudyHub - Free IGNOU MBA Study Material">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${BASE_URL}/">
<meta property="og:site_name" content="StudyHub">`;

  html = html.replace('</head>', `${metaTags}\n</head>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[OK] index.html SEO updated');
}

// ═══════════════════════════════════════════
// STEP 7: Generate internal linking script
// ═══════════════════════════════════════════
function generateInternalLinks() {
  // Create a JSON file with course data for the app to use
  const dataPath = path.join(STUDY_DIR, 'seo', 'courses.json');
  ensureDir(path.dirname(dataPath));
  fs.writeFileSync(dataPath, JSON.stringify(courses, null, 2), 'utf8');
  console.log('[OK] courses.json generated');
}

// ═══════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════
console.log('═══════════════════════════════════════════');
console.log('StudyHub SEO Generator');
console.log('Base URL:', BASE_URL);
console.log('═══════════════════════════════════════════\n');

generateRobots();
generateSitemap();
addMetaToSubjectPages();
generateLandingPages();
updateHubPage();
updateIndexPage();
generateInternalLinks();

console.log('\n═══════════════════════════════════════════');
console.log('SEO generation complete!');
console.log(`Total pages: ${43 + (43 * 3) + 2} (43 subjects + 129 landing pages + hub + index)`);
console.log('═══════════════════════════════════════════');
console.log('\nNext steps:');
console.log('1. Change BASE_URL in seo/generate.js to your actual domain');
console.log('2. Re-run: node seo/generate.js');
console.log('3. Deploy to Vercel/Netlify/GitHub Pages');
console.log('4. Submit sitemap.xml to Google Search Console');
console.log('5. Start link building on Reddit, Quora, Telegram groups');
