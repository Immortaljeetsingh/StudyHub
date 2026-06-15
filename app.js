"use strict";
(function(){
var LS;
try{LS=localStorage}catch(e){LS={getItem:function(){return null},setItem:function(){},removeItem:function(){}}}
var eH=function(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML};
var iT=function(e){var t=e.target.tagName;return t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.target.isContentEditable};
var aL=function(m){var e=document.getElementById("liveRegion");if(e){e.textContent="";setTimeout(function(){e.textContent=m},50)}};
var sT=function(m,t){var e=document.getElementById("_toast");if(!e)return;e.textContent=m;e.className="toast show"+(t?" "+t:"");clearTimeout(e._t);e._t=setTimeout(function(){e.className="toast"},2500)};
var gP=function(id){try{var v=LS.getItem("studyhub-progress-"+id);return v!==null?parseFloat(v):0}catch(e){return 0}};
var gQ=function(id){try{var v=LS.getItem("studyhub-quiz-"+id);return v!==null?parseFloat(v):-1}catch(e){return -1}};
var gS=function(){try{var v=LS.getItem("studyhub-study-visits");if(!v)return 0;var d=JSON.parse(v);if(!Array.isArray(d))return 0;var s=0,td=new Date();for(var i=0;i<365;i++){var dt=new Date(td);dt.setDate(dt.getDate()-i);var ds=dt.toISOString().slice(0,10);if(d.indexOf(ds)>=0)s++;else break}return s}catch(e){return 0}};
var gC=function(id){if(id.indexOf("mmpc")===0)return{name:"Core",color:"#c9302c"};if(id.indexOf("mmph")===0)return{name:"HR",color:"#d4a017"};if(id.indexOf("mmpb")===0)return{name:"Banking",color:"#9b3d8a"};if(id.indexOf("mmpm")===0)return{name:"Marketing",color:"#1d6b5a"};if(id.indexOf("mmpo")===0)return{name:"Operations",color:"#3d4f8a"};if(id.indexOf("mmpf")===0)return{name:"Finance",color:"#2d7a4f"};return{name:"Course",color:"#c9302c"}};
var deb=function(fn,ms){var id;return function(){clearTimeout(id);id=setTimeout(fn,ms)}};
var courses=[
{id:'mmpc01',name:'Management Functions',desc:'Planning, Organizing, Staffing, Directing & Controlling',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>',units:14,href:'study-mmpc01.html',quizHref:'quiz-mmpc01.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc02',name:'Human Resource Mgmt',desc:'Recruitment, Training, Performance Appraisal & Employee Relations',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',units:15,href:'study-mmpc02.html',quizHref:'quiz-mmpc02.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc03',name:'Business Environment',desc:'PESTEL Analysis, Economic Reforms, Globalization & CSR',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',units:15,href:'study-mmpc03.html',quizHref:'quiz-mmpc03.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc04',name:'Accounting & Finance',desc:'Financial Statements, Ratios, Cost Accounting & Capital Budgeting',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',units:16,href:'study-mmpc04.html',quizHref:'quiz-mmpc04.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc05',name:'Quantitative Analysis',desc:'LPP, Probability, Hypothesis Testing, PERT/CPM & Decision Theory',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',units:16,href:'study-mmpc05.html',quizHref:'quiz-mmpc05.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc06',name:'Marketing Management',desc:'4Ps, Consumer Behavior, Segmentation, Branding & Digital Marketing',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',units:12,href:'study-mmpc06.html',quizHref:'quiz-mmpc06.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc07',name:'Business Communication',desc:'Written & Oral Communication, Reports, Presentations & Cross-cultural',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',units:14,href:'study-mmpc07.html',quizHref:'quiz-mmpc07.html',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc08',name:'Information Systems',desc:'IT Fundamentals, SDLC, Databases, AI, ERP & Emerging Technologies',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',units:14,href:'study-mmpc08.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc09',name:'Machines & Materials',desc:'Operations, Work Study, Value Engineering, Inventory, SCM, Lean, JIT',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',units:15,href:'study-mmpc09.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc10',name:'Managerial Economics',desc:'Demand, Production Costs, Market Structures, Pricing, GDP, Inflation',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',units:12,href:'study-mmpc10.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc11',name:'Social Processes',desc:'Individual Behaviour, Motivation, Groups, Leadership, Culture, Change',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',units:15,href:'study-mmpc11.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc12',name:'Strategic Management',desc:'PESTEL, Porter, SWOT, BCG Matrix, Generic Strategies, Governance',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',units:14,href:'study-mmpc12.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc13',name:'Business Law',desc:'Contract Act, Sale of Goods, Partnership, Companies Act, IPR, Consumer',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',units:14,href:'study-mmpc13.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc14',name:'Financial Management',desc:'TVM, WACC, Capital Budgeting, Capital Structure, Dividend, Forex',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',units:16,href:'study-mmpc14.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc15',name:'Research Methodology',desc:'Research Design, Data Collection, Sampling, Statistics, Correlation',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',units:14,href:'study-mmpc15.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc16',name:'International Business',desc:'IB Environment, Trade Theories, Culture, Entry Modes, Marketing Mix',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',units:13,href:'study-mmpc16.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc17',name:'Advanced Strategy',desc:'Corporate Strategy, M&A, Growth, International Strategy, Governance',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',units:13,href:'study-mmpc17.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc18',name:'Entrepreneurship',desc:'Startup Ecosystem, Business Plans, Funding, Social Entrepreneurship',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',units:12,href:'study-mmpc18.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc19',name:'Total Quality Management',desc:'TQM, Deming, Six Sigma, ISO 9001, Quality Tools, Kaizen, DMAIC',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',units:14,href:'study-mmpc19.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmpc20',name:'Business Ethics & CSR',desc:'Ethics, Carroll Pyramid, Section 135, ESG, GRI, Sustainability',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',units:14,href:'study-mmpc20.html',quizHref:'#',color:'#c9302c',glow:'rgba(201,48,44,0.25)'},
{id:'mmph01',name:'Org Theory & Design',desc:'Organisation Theories, Structure Types, Mintzberg, Job Design, JCM',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',units:12,href:'study-mmph01.html',quizHref:'#',color:'#d4a017',glow:'rgba(212,160,23,0.25)'},
{id:'mmph02',name:'Human Resource Development',desc:'HRD System, Training, Kirkpatrick, Mentoring, E-Learning, Competency',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',units:12,href:'study-mmph02.html',quizHref:'#',color:'#d4a017',glow:'rgba(212,160,23,0.25)'},
{id:'mmph04',name:'Industrial Relations',desc:'IR, Trade Unions, Collective Bargaining, Grievance, Discipline',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17a4 4 0 0 0 8 0"/><path d="M7 17a4 4 0 0 1-4-4V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4"/><path d="M12 3v6"/></svg>',units:15,href:'study-mmph04.html',quizHref:'#',color:'#d4a017',glow:'rgba(212,160,23,0.25)'},
{id:'mmph07',name:'Compensation Mgmt',desc:'Compensation, Job Evaluation, EPF, ESI, Gratuity, ESOPs, Total Rewards',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',units:11,href:'study-mmph07.html',quizHref:'#',color:'#d4a017',glow:'rgba(212,160,23,0.25)'},
{id:'mmpb06',name:'Banking Governance',desc:'Governance Principles, RBI, Basel, IRDAI, SEBI, ESG, Whistleblower',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>',units:15,href:'study-mmpb06.html',quizHref:'#',color:'#9b3d8a',glow:'rgba(155,61,138,0.25)'},
{id:'mmpm01',name:'Consumer Behaviour',desc:'CB Model, Motivation, Perception, Decision Process',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>',units:15,href:'study-mmpm01.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm02',name:'Sales Management',desc:'Selling Skills, AIDA, Sales Force, Quotas',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',units:13,href:'study-mmpm02.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm03',name:'Product & Brand Mgmt',desc:'Product Levels, PLC, Brand Equity, Keller',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>',units:14,href:'study-mmpm03.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm04',name:'International Marketing',desc:'IM, Trade Theories, 4P, Entry Modes',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',units:16,href:'study-mmpm04.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm05',name:'Marketing of Services',desc:'IHIP, 7Ps, SERVQUAL, Yield Management',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>',units:14,href:'study-mmpm05.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm06',name:'Marketing Research',desc:'MR Process, Sampling, Statistics, Report',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',units:14,href:'study-mmpm06.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm07',name:'Integrated Marketing Comm',desc:'IMC, Advertising, Digital Marketing',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',units:15,href:'study-mmpm07.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpm09',name:'Retail Management',desc:'Formats, Location, E-commerce, Omnichannel',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',units:13,href:'study-mmpm09.html',quizHref:'#',color:'#1d6b5a',glow:'rgba(29,107,90,0.25)'},
{id:'mmpo01',name:'Operations Research',desc:'Linear Programming, Transportation, Assignment, Sequencing, Queuing, Decision Theory & Simulation',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>',units:16,href:'study-mmpo01.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo02',name:'Project Management',desc:'WBS, PERT/CPM, EVM, Contracts',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>',units:14,href:'study-mmpo02.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo03',name:'Operations Management',desc:'Process, Capacity, Forecasting, Six Sigma',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',units:14,href:'study-mmpo03.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo04',name:'Management Info Systems',desc:'MIS, BI, Database, Cloud',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',units:14,href:'study-mmpo04.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo05',name:'Logistics & SCM',desc:'SCM, Transport, Warehousing, KPIs',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',units:20,href:'study-mmpo05.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo06',name:'Materials Management',desc:'ABC, VED, EOQ, Inventory',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',units:15,href:'study-mmpo06.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpo08',name:'International Logistics',desc:'Incoterms, Transport, Customs, 3PL',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',units:13,href:'study-mmpo08.html',quizHref:'#',color:'#3d4f8a',glow:'rgba(61,79,138,0.25)'},
{id:'mmpf01',name:'Working Capital Mgmt',desc:'WC Concepts, Current Assets, Financing, Cash Credit, MPBF',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',units:14,href:'study-mmpf01.html',quizHref:'#',color:'#2d7a4f',glow:'rgba(45,122,79,0.25)'},
{id:'mmpf02',name:'Capital Investment',desc:'NPV, IRR, Payback, Capital Structure, Dividend Policy, M&M',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',units:15,href:'study-mmpf02.html',quizHref:'#',color:'#2d7a4f',glow:'rgba(45,122,79,0.25)'},
{id:'mmpf03',name:'Management Control',desc:'MCS, Responsibility Centres, Transfer Pricing, Budget, Variance, BSC',icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>',units:16,href:'study-mmpf03.html',quizHref:'#',color:'#2d7a4f',glow:'rgba(45,122,79,0.25)'}
];

var graphNodes=[
{id:'mmpc01',label:'MMPC-01',full:'Management Functions',units:14,x:0,y:0,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc02',label:'MMPC-02',full:'Human Resource Mgmt',units:15,x:-200,y:-100,color:'#d4a017',glow:'rgba(212,160,23,0.3)'},
{id:'mmpc03',label:'MMPC-03',full:'Business Environment',units:15,x:200,y:-100,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc04',label:'MMPC-04',full:'Accounting & Finance',units:16,x:0,y:-220,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc05',label:'MMPC-05',full:'Quantitative Analysis',units:16,x:-200,y:100,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc06',label:'MMPC-06',full:'Marketing Management',units:12,x:200,y:100,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpc07',label:'MMPC-07',full:'Business Communication',units:14,x:-380,y:0,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc08',label:'MMPC-08',full:'Information Systems',units:14,x:380,y:0,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc09',label:'MMPC-09',full:'Machines & Materials',units:15,x:0,y:200,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc10',label:'MMPC-10',full:'Managerial Economics',units:12,x:-150,y:-220,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc11',label:'MMPC-11',full:'Social Processes',units:15,x:150,y:-220,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc12',label:'MMPC-12',full:'Strategic Mgmt',units:14,x:-300,y:200,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc13',label:'MMPC-13',full:'Business Law',units:14,x:300,y:200,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc14',label:'MMPC-14',full:'Financial Mgmt',units:16,x:-450,y:-100,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc15',label:'MMPC-15',full:'Research Methodology',units:14,x:450,y:-100,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc16',label:'MMPC-16',full:'International Business',units:13,x:-450,y:100,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc17',label:'MMPC-17',full:'Advanced Strategy',units:13,x:450,y:100,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmpc18',label:'MMPC-18',full:'Entrepreneurship',units:12,x:-300,y:-220,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpc19',label:'MMPC-19',full:'Total Quality Mgmt',units:14,x:300,y:-220,color:'#2d7a4f',glow:'rgba(45,122,79,0.3)'},
{id:'mmpc20',label:'MMPC-20',full:'Business Ethics & CSR',units:14,x:0,y:-330,color:'#c9302c',glow:'rgba(201,48,44,0.3)'},
{id:'mmph01',label:'MMPH-01',full:'Org Theory & Design',units:12,x:-150,y:330,color:'#d4a017',glow:'rgba(212,160,23,0.3)'},
{id:'mmph02',label:'MMPH-02',full:'HR Development',units:12,x:150,y:330,color:'#d4a017',glow:'rgba(212,160,23,0.3)'},
{id:'mmph04',label:'MMPH-04',full:'Industrial Relations',units:15,x:-350,y:330,color:'#d4a017',glow:'rgba(212,160,23,0.3)'},
{id:'mmph07',label:'MMPH-07',full:'Compensation Mgmt',units:11,x:350,y:330,color:'#d4a017',glow:'rgba(212,160,23,0.3)'},
{id:'mmpb06',label:'MMPB-06',full:'Banking Governance',units:15,x:0,y:330,color:'#9b3d8a',glow:'rgba(155,61,138,0.3)'},
{id:'mmpm01',label:'MMPM-01',full:'Consumer Behaviour',units:15,x:-500,y:0,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm02',label:'MMPM-02',full:'Sales Management',units:13,x:500,y:0,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm03',label:'MMPM-03',full:'Product & Brand Mgmt',units:14,x:-380,y:-330,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm04',label:'MMPM-04',full:'International Marketing',units:16,x:380,y:-330,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm05',label:'MMPM-05',full:'Marketing of Services',units:14,x:-200,y:-330,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm06',label:'MMPM-06',full:'Marketing Research',units:14,x:200,y:-330,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm07',label:'MMPM-07',full:'Integrated Mktg Comm',units:15,x:0,y:-450,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpm09',label:'MMPM-09',full:'Retail Management',units:13,x:-500,y:200,color:'#1d6b5a',glow:'rgba(29,107,90,0.3)'},
{id:'mmpo01',label:'MMPO-01',full:'Operations Research',units:16,x:500,y:200,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo02',label:'MMPO-02',full:'Project Management',units:14,x:-380,y:330,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo03',label:'MMPO-03',full:'Operations Mgmt',units:14,x:380,y:330,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo04',label:'MMPO-04',full:'Management Info Systems',units:14,x:-200,y:330,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo05',label:'MMPO-05',full:'Logistics & SCM',units:20,x:200,y:330,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo06',label:'MMPO-06',full:'Materials Management',units:15,x:-500,y:-200,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpo08',label:'MMPO-08',full:'International Logistics',units:13,x:500,y:-200,color:'#3d4f8a',glow:'rgba(61,79,138,0.3)'},
{id:'mmpf01',label:'MMPF-01',full:'Working Capital Mgmt',units:14,x:-300,y:-450,color:'#2d7a4f',glow:'rgba(45,122,79,0.3)'},
{id:'mmpf02',label:'MMPF-02',full:'Capital Investment',units:15,x:300,y:-450,color:'#2d7a4f',glow:'rgba(45,122,79,0.3)'},
{id:'mmpf03',label:'MMPF-03',full:'Management Control',units:16,x:0,y:450,color:'#2d7a4f',glow:'rgba(45,122,79,0.3)'}
];

var graphEdges=[
/* MMPC-01 hub → individual courses */
{from:'mmpc01',to:'mmpc02'},{from:'mmpc01',to:'mmpc03'},{from:'mmpc01',to:'mmpc04'},
{from:'mmpc01',to:'mmpc05'},{from:'mmpc01',to:'mmpc06'},{from:'mmpc01',to:'mmpc07'},
{from:'mmpc01',to:'mmpc08'},{from:'mmpc01',to:'mmpc09'},
/* cross-links */
{from:'mmpc02',to:'mmpc03'},{from:'mmpc04',to:'mmpc05'},{from:'mmpc05',to:'mmpc06'},
{from:'mmpc04',to:'mmpc07'},{from:'mmpc04',to:'mmpc08'},{from:'mmpc10',to:'mmpc11'},
{from:'mmpc12',to:'mmpc13'},
/* paired */
{from:'mmpc14',to:'mmpc15'},{from:'mmpc16',to:'mmpc17'},{from:'mmpc18',to:'mmpc19'},
{from:'mmpc20',to:'mmph01'},
/* MMPC-01 → more nodes */
{from:'mmpc01',to:'mmpc10'},{from:'mmpc01',to:'mmpc11'},{from:'mmpc01',to:'mmpc12'},
{from:'mmpc01',to:'mmpc13'},{from:'mmpc01',to:'mmpc14'},{from:'mmpc01',to:'mmpc15'},
{from:'mmpc01',to:'mmpc16'},{from:'mmpc01',to:'mmpc17'},{from:'mmpc01',to:'mmpc18'},
{from:'mmpc01',to:'mmpc19'},{from:'mmpc01',to:'mmpc20'},
/* MMPM chain */
{from:'mmpm01',to:'mmpm02'},{from:'mmpm03',to:'mmpm04'},{from:'mmpm05',to:'mmpm06'},
{from:'mmpm07',to:'mmpm09'},
/* MMPO chain */
{from:'mmpo01',to:'mmpo02'},{from:'mmpo03',to:'mmpo04'},{from:'mmpo05',to:'mmpo06'}
];

/* ---------- Theme ---------- */
var Theme={
init:function(){
var saved="";
try{saved=LS.getItem("studyhub-theme")||""}catch(e){}
if(!saved&&window.matchMedia("(prefers-color-scheme:dark)").matches)saved="dark";
if(saved==="dark"){this.set(true)}else if(saved==="light"){this.set(false)}else{this.set(window.matchMedia("(prefers-color-scheme:dark)").matches)}
var btn=document.getElementById("themeToggleBtn");
if(btn)btn.addEventListener("click",function(){Theme.toggle()})
},
get isDark(){return document.documentElement.getAttribute("data-theme")==="dark"},
set:function(dark){
var html=document.documentElement;
html.setAttribute("data-theme",dark?"dark":"light");
try{LS.setItem("studyhub-theme",dark?"dark":"light")}catch(e){}
var icon=document.getElementById("themeToggleIcon");
var label=document.getElementById("themeToggleLabel");
var btn=document.getElementById("themeToggleBtn");
if(icon){
var u=document.createElementNS("http://www.w3.org/2000/svg","use");
u.setAttribute("href",dark?"#sun":"#moon");
icon.innerHTML="";icon.appendChild(u)
}
if(label)label.textContent=dark?"Light":"Dark";
if(btn){btn.setAttribute("aria-pressed",dark?"true":"false");btn.setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme")}
aL(dark?"Light mode on":"Dark mode on")
},
toggle:function(){this.set(!this.isDark)}
};

/* ---------- Scroll Progress ---------- */
var ScrollProgress={
init:function(){
var bar=document.getElementById("scrollProgress");
if(!bar)return;
var ticking=false;
window.addEventListener("scroll",function(){
if(!ticking){
requestAnimationFrame(function(){
var h=document.documentElement;
var pct=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100;
bar.style.width=Math.min(100,Math.max(0,pct))+"%";
ticking=false
});
ticking=true
}
},{passive:true})
}
};

/* ---------- Animated Counters ---------- */
var Counters={
init:function(){
var els=document.querySelectorAll(".counter-animate");
if(!els.length)return;
var animated=new WeakSet();
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
var el=entry.target;
if(animated.has(el))return;
animated.add(el);
obs.unobserve(el);
var target=parseInt(el.getAttribute("data-target"),10)||0;
var suffix=el.getAttribute("data-suffix")||"";
var dur=1600;
var start=performance.now();
(function step(now){
var t=Math.min(1,(now-start)/dur);
var eased=1-Math.pow(1-t,3);
var val=Math.floor(eased*target);
el.textContent=val.toLocaleString()+suffix;
if(t<1)requestAnimationFrame(step);
else el.textContent=target.toLocaleString()+suffix
})(start)
}
})
},{threshold:0.4});
for(var i=0;i<els.length;i++)obs.observe(els[i])
}
};

/* ---------- Dashboard Stats ---------- */
var Dashboard={
render:function(){
var grid=document.getElementById("dashboardStats");
if(!grid)return;
grid.innerHTML="";
var total=0,started=0,done=0,tq=0,qc=0;
for(var i=0;i<courses.length;i++){
var c=courses[i],p=gP(c.id),qs=gQ(c.id);
if(p>0)started++;
if(p>=100)done++;
total+=p;
if(qs>=0){tq+=qs;qc++}
}
var avg=courses.length>0?Math.round(total/courses.length):0;
var qa=qc>0?Math.round(tq/qc):0;
var stats=[
{label:"Overall Progress",value:avg+"%",color:"var(--accent)",sub:started+"/"+courses.length+" started"},
{label:"Completed",value:done+"",color:"var(--success)",sub:"of "+courses.length+" courses"},
{label:"Quiz Average",value:qa+"%",color:"var(--accent-secondary)",sub:qc+" quizzes taken"},
{label:"Study Streak",value:gS()+"d",color:"var(--warning)",sub:"consecutive days"}
];
for(var i=0;i<stats.length;i++){
var s=stats[i],rc=28,cc=2*Math.PI*rc,pv=parseInt(s.value)||0,off=cc-(pv/100)*cc;
var card=document.createElement("div");
card.className="stat-card";
card.setAttribute("tabindex","0");
card.innerHTML='<div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem"><svg width="56" height="56" viewBox="0 0 80 80" style="transform:rotate(-90deg);flex-shrink:0"><circle cx="40" cy="40" r="'+rc+'" fill="none" stroke="var(--border)" stroke-width="5"/><circle cx="40" cy="40" r="'+rc+'" fill="none" stroke="'+s.color+'" stroke-width="5" stroke-dasharray="'+cc+'" stroke-dashoffset="'+off+'" stroke-linecap="round"/></svg><div><div class="stat-number" style="color:'+s.color+';font-size:1.8rem;line-height:1">'+eH(s.value)+'</div><div style="font-size:0.7rem;color:var(--text-muted);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-top:0.2rem">'+eH(s.label)+'</div></div></div><div style="font-size:0.78rem;color:var(--text-muted)">'+eH(s.sub)+'</div>';
grid.appendChild(card)
}
}
};

/* ---------- Subject Cards ---------- */
var Subjects={
render:function(){
var grid=document.getElementById("subjects");
if(!grid)return;
grid.innerHTML="";
for(var i=0;i<courses.length;i++){
var c=courses[i],pct=gP(c.id),qs=gQ(c.id),cat=gC(c.id);
var card=document.createElement("a");
card.className="subject-card rich-card";
card.href=c.href;
card.setAttribute("aria-label",c.name+" ("+c.units+" units)");
card.setAttribute("tabindex","0");
card.setAttribute("role","link");
card.style.setProperty("--card-color",c.color);
card.style.setProperty("--card-color-2",cat.color);
card.style.setProperty("--card-glow",c.glow);
var codeLabel=c.id.replace(/(\d+)$/,"-$1").toUpperCase();
var qb=qs>=0?'<span class="card-quiz-badge" title="Quiz score"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+Math.round(qs)+"%</span>":"";
card.innerHTML='<div class="rich-card-glow"></div><div class="rich-card-topbar"></div><div class="rich-card-header"><span class="rich-card-code" style="background:'+c.color+'15;color:'+c.color+';border:1px solid '+c.color+'30">'+codeLabel+'</span><span class="rich-card-cat" style="background:'+cat.color+'12;color:'+cat.color+'">'+cat.name+'</span></div><div class="rich-card-icon" style="background:linear-gradient(135deg,'+c.color+'25,'+c.color+'08);color:'+c.color+';box-shadow:0 8px 24px '+c.glow+', inset 0 1px 0 '+c.color+'30">'+c.icon+'</div><h4 class="rich-card-title" style="color:'+c.color+'">'+c.name+'</h4><p class="rich-card-desc">'+c.desc+'</p><div class="rich-card-stats"><span class="rich-card-units" style="background:'+c.color+'10;color:'+c.color+'">'+c.units+' Units</span>'+qb+'</div><div class="rich-card-progress"><div class="rich-card-progress-track"><div class="rich-card-progress-bar" style="background:linear-gradient(90deg,'+c.color+','+cat.color+');width:'+Math.round(pct)+'%"></div></div><span class="rich-card-progress-text">'+Math.round(pct)+"%</span></div>";
grid.appendChild(card)
}
}
};

/* ---------- Search ---------- */
var Search={
init:function(){
var input=document.getElementById("globalSearch");
var clearBtn=document.getElementById("searchClear");
var resultsEl=document.getElementById("searchResults");
if(!input)return;
var timeout;
input.addEventListener("input",function(){
clearTimeout(timeout);
timeout=setTimeout(function(){
var q=input.value.toLowerCase().trim();
var cards=document.querySelectorAll(".subject-card:not(.topic-card)");
for(var i=0;i<cards.length;i++){
var t=cards[i].textContent.toLowerCase();
cards[i].style.display=(!q||t.indexOf(q)>=0)?"":"none"
}
if(resultsEl){
if(q){
var matches=[];
for(var i=0;i<courses.length;i++){
var c=courses[i];
if((c.name+" "+c.desc).toLowerCase().indexOf(q)>=0)matches.push(c)
}
resultsEl.innerHTML=matches.slice(0,8).map(function(c){
return'<a href="'+c.href+'" class="search-result-item" style="display:block;padding:0.75rem 1rem;border-bottom:1px solid var(--border);color:var(--text-primary);text-decoration:none;"><strong>'+eH(c.name)+'</strong><br><span style="font-size:0.85rem;color:var(--text-secondary)">'+eH(c.desc)+'</span></a>'
}).join("");
resultsEl.style.display=matches.length?"block":"none";
resultsEl.setAttribute("aria-expanded",matches.length?"true":"false")
}else{
resultsEl.style.display="none";
resultsEl.setAttribute("aria-expanded","false")
}
}
},200)
});
if(clearBtn){
clearBtn.addEventListener("click",function(){
input.value="";
var cards=document.querySelectorAll(".subject-card");
for(var i=0;i<cards.length;i++)cards[i].style.display="";
if(resultsEl){resultsEl.style.display="none";resultsEl.setAttribute("aria-expanded","false")}
input.focus()
})
}
document.addEventListener("click",function(e){
var sc=document.querySelector(".search-container");
if(sc&&!sc.contains(e.target)&&resultsEl){resultsEl.style.display="none";resultsEl.setAttribute("aria-expanded","false")}
})
}
};

/* ---------- Keyboard Shortcuts ---------- */
var Keyboard={
init:function(){
document.addEventListener("keydown",function(e){
if(e.key==="t"&&!e.ctrlKey&&!e.metaKey&&!iT(e)){e.preventDefault();Theme.toggle()}
if(e.key==="?"&&!iT(e)){e.preventDefault();Modals.toggleShortcuts()}
if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();var inp=document.getElementById("globalSearch");if(inp){inp.focus();inp.select()}}
if(e.key==="Escape"){Modals.closeAll();FAB.close()}
})
}
};

/* ---------- Modals ---------- */
var Modals={
openApi:function(){
var m=document.getElementById("apiSettingsModal");
if(m)m.classList.add("active")
},
closeApi:function(){
var m=document.getElementById("apiSettingsModal");
if(m)m.classList.remove("active");
var s=document.getElementById("apiStatus");
if(s){s.className="api-status";s.textContent=""}
},
saveApi:function(){
var key=document.getElementById("apiKeyInput");
var model=document.getElementById("modelSelect");
var s=document.getElementById("apiStatus");
if(!key)return;
try{
LS.setItem("studyhub-api-key",key.value);
if(model)LS.setItem("studyhub-api-model",model.value);
if(s){s.className="api-status success";s.textContent="Settings saved!"}
sT("API settings saved","success");
setTimeout(function(){Modals.closeApi()},1500)
}catch(e){
if(s){s.className="api-status error";s.textContent="Failed to save."}
}
},
toggleShortcuts:function(){
var m=document.getElementById("shortcutsModal");
if(m)m.classList.toggle("show")
},
closeAll:function(){
var m=document.getElementById("shortcutsModal");
if(m)m.classList.remove("show");
Modals.closeApi()
},
init:function(){
var apiBtn=document.getElementById("apiSettingsBtn");
if(apiBtn)apiBtn.addEventListener("click",function(){Modals.openApi()});
var saveBtn=document.getElementById("saveApiBtn");
if(saveBtn)saveBtn.addEventListener("click",function(){Modals.saveApi()});
var cancelBtn=document.getElementById("cancelApiBtn");
if(cancelBtn)cancelBtn.addEventListener("click",function(){Modals.closeApi()});
var scClose=document.getElementById("shortcutsClose");
if(scClose)scClose.addEventListener("click",function(){Modals.toggleShortcuts()})
}
};

/* ---------- FAB ---------- */
var FAB={
toggle:function(){
var o=document.getElementById("fabOptions");
var b=document.getElementById("fabMain");
if(o)o.classList.toggle("show");
if(b)b.classList.toggle("active")
},
scrollTo:function(id){
var el=document.getElementById(id);
if(el)el.scrollIntoView({behavior:"smooth",block:"start"});
FAB.close()
},
close:function(){
var o=document.getElementById("fabOptions");
var b=document.getElementById("fabMain");
if(o)o.classList.remove("show");
if(b)b.classList.remove("active")
},
startQuiz:function(){
FAB.close();
var target=null;
for(var i=0;i<courses.length;i++){
if(gQ(courses[i].id)<0){target=courses[i];break}
}
if(!target)target=courses[0];
if(target&&target.quizHref&&target.quizHref!=="#")window.location.href=target.quizHref;
else if(target)window.location.href=target.href
},
init:function(){
var fab=document.getElementById("fabMain");
if(fab)fab.addEventListener("click",function(){FAB.toggle()});
var cBtn=document.getElementById("fabCourses");
if(cBtn)cBtn.addEventListener("click",function(){FAB.scrollTo("subjects")});
var gBtn=document.getElementById("fabGraph");
if(gBtn)gBtn.addEventListener("click",function(){FAB.scrollTo("knowledgeGraph")});
var qBtn=document.getElementById("fabQuiz");
if(qBtn)qBtn.addEventListener("click",function(){FAB.startQuiz()});
var fBtn=document.getElementById("fabFocus");
if(fBtn)fBtn.addEventListener("click",function(){Focus.toggle()})
}
};

/* ---------- Focus Mode ---------- */
var Focus={
toggle:function(){
document.body.classList.toggle("focus-mode");
var on=document.body.classList.contains("focus-mode");
try{LS.setItem("studyhub-focus",on?"on":"off")}catch(e){}
aL(on?"Focus mode ON":"Focus mode OFF");
sT(on?"Focus mode ON":"Focus mode OFF");
var btns=document.querySelectorAll('[id="fabFocus"]');
if(btns.length>0){
btns[0].innerHTML=on?'<svg width="18" height="18"><use href="#unlock"/></svg>':'<svg width="18" height="18"><use href="#lock"/></svg>';
btns[0].setAttribute("aria-label",on?"Exit focus mode":"Enter focus mode")
}
FAB.close()
},
init:function(){
try{if(LS.getItem("studyhub-focus")==="on")document.body.classList.add("focus-mode")}catch(e){}
}
};

/* ---------- Knowledge Graph ---------- */
var Graph={
load:function(){
var svg=document.getElementById("knowledgeGraph");
if(!svg)return;
svg.innerHTML="";
var ns="http://www.w3.org/2000/svg";
var defs=document.createElementNS(ns,"defs");
var gf=document.createElementNS(ns,"filter");
gf.setAttribute("id","glow");gf.setAttribute("x","-50%");gf.setAttribute("y","-50%");gf.setAttribute("width","200%");gf.setAttribute("height","200%");
var blur=document.createElementNS(ns,"feGaussianBlur");blur.setAttribute("stdDeviation","4");blur.setAttribute("result","coloredBlur");
var merge=document.createElementNS(ns,"feMerge");
var m1=document.createElementNS(ns,"feMergeNode");m1.setAttribute("in","coloredBlur");
var m2=document.createElementNS(ns,"feMergeNode");m2.setAttribute("in","SourceGraphic");
merge.appendChild(m1);merge.appendChild(m2);
gf.appendChild(blur);gf.appendChild(merge);defs.appendChild(gf);
svg.appendChild(defs);
for(var ei=0;ei<graphEdges.length;ei++){
var e=graphEdges[ei],fn=null,tn=null;
for(var ni=0;ni<graphNodes.length;ni++){
if(graphNodes[ni].id===e.from)fn=graphNodes[ni];
if(graphNodes[ni].id===e.to)tn=graphNodes[ni]
}
if(!fn||!tn)continue;
var l=document.createElementNS(ns,"line");
l.setAttribute("x1",fn.x);l.setAttribute("y1",fn.y);l.setAttribute("x2",tn.x);l.setAttribute("y2",tn.y);
l.setAttribute("stroke","var(--text-muted)");l.setAttribute("stroke-width","1");l.setAttribute("opacity","0.15");
svg.appendChild(l)
}
var tooltip=document.getElementById("nodeTooltip");
for(var ni=0;ni<graphNodes.length;ni++){
var n=graphNodes[ni];
var g=document.createElementNS(ns,"g");
g.setAttribute("transform","translate("+n.x+","+n.y+")");
g.style.cursor="pointer";
g.setAttribute("role","button");g.setAttribute("tabindex","0");
g.setAttribute("aria-label",n.full+" ("+n.units+" units). Click to study.");
var r=n.label.indexOf('MMPC')===0?22:18;
var glow=document.createElementNS(ns,"circle");glow.setAttribute("r",String(r+5));glow.setAttribute("fill","url(#glow)");
var circ=document.createElementNS(ns,"circle");circ.setAttribute("r",String(r));circ.setAttribute("fill",n.color);circ.setAttribute("opacity","0.9");
var txt=document.createElementNS(ns,"text");txt.setAttribute("text-anchor","middle");txt.setAttribute("dy","3.5");
txt.setAttribute("fill","#fff");txt.setAttribute("font-size",n.label.length>5?"6":"7");txt.setAttribute("font-weight","700");
txt.textContent=n.label;
g.appendChild(glow);g.appendChild(circ);g.appendChild(txt);
(function(node,r){
g.addEventListener("mouseenter",function(){circ.setAttribute("opacity","1");circ.setAttribute("r",String(r+3));if(tooltip){tooltip.innerHTML="<strong>"+node.full+"</strong><br>"+node.units+" units";tooltip.classList.add("show")}});
g.addEventListener("mouseleave",function(){circ.setAttribute("opacity","0.9");circ.setAttribute("r",String(r));if(tooltip)tooltip.classList.remove("show")});
g.addEventListener("click",function(){window.location.href="study-"+node.id+".html"});
g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();window.location.href="study-"+node.id+".html"}});
})(n);
svg.appendChild(g)
}
},
interactive:function(){
var cont=document.getElementById("graph-container");
if(!cont)return;
var svg=cont.querySelector("svg");
if(!svg)return;
svg.style.cursor="default"
}
};

/* ---------- Topic Filter ---------- */
var Topics={
init:function(){
var cards=document.querySelectorAll(".topic-card[role=button]");
cards.forEach(function(card){
card.addEventListener("click",function(){
cards.forEach(function(c){c.classList.remove("is-active")});
card.classList.add("is-active");
var topic=card.getAttribute("data-topic");
try{LS.setItem("studyhub-active-topic",topic)}catch(e){}
aL("Showing "+card.querySelector("h4").textContent+" topics")
});
card.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click()}})
})
}
};

/* ---------- Streak ---------- */
var Streak={
track:function(){
try{
var today=new Date().toISOString().slice(0,10);
var visits=JSON.parse(LS.getItem("studyhub-study-visits")||"[]");
if(!Array.isArray(visits))visits=[];
if(visits.indexOf(today)<0){
visits.push(today);
if(visits.length>365)visits.splice(0,visits.length-365);
LS.setItem("studyhub-study-visits",JSON.stringify(visits))
}
}catch(e){}
},
updateDisplay:function(){
var el=document.getElementById("streakDisplay");
if(el)el.textContent=gS()
}
};

/* ---------- Mobile Nav ---------- */
var MobileNav={
init:function(){
var btn=document.getElementById("mobileNavToggle");
if(btn)btn.addEventListener("click",function(){
var el=document.getElementById("subjects");
if(el)el.scrollIntoView({behavior:"smooth",block:"start"})
})
}
};

/* ---------- Init ---------- */
function init(){
try{
Focus.init();
Theme.init();
ScrollProgress.init();
Counters.init();
Dashboard.render();
    /* Subjects.render(); — replaced by preview's course list table */
    /* Dashboard.render(); — replaced by preview's bento/featured sections */
    Graph.load();
Graph.interactive();
Search.init();
Keyboard.init();
Modals.init();
FAB.init();
Topics.init();
Streak.track();
Streak.updateDisplay();
MobileNav.init();
}catch(err){console.error("StudyHub:",err)}
}

document.addEventListener("DOMContentLoaded",init);
})();

