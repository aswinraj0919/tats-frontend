export const HIERARCHY = [
  "Helper / Assistant / Trainee",
  "Technician / Operator / Skilled Worker",
  "Senior Technician / Lead Operator",
  "Chargehand / Foreman",
  "Senior Foreman",
  "Supervisor",
  "Senior Supervisor",
  "Engineer / Site Engineer",
  "Senior Engineer",
  "Lead Engineer / Discipline Engineer",
  "Project Engineer / Planning Engineer",
  "Construction Manager / Section Manager",
  "Project Manager",
  "Senior Project Manager",
  "Project Director / Operations Head",
  "General Manager (GM)",
  "Vice President (VP) / Director",
  "CEO / Managing Director",
];

export const DOMAINS = {
  Civil: [
    "Mason","Steel Fixer","Shuttering Carpenter","Scaffolder","Tile Mason","Painter",
    "Plumber","Survey Assistant","Concrete Worker","Road Worker","Civil Draftsman",
    "Land Surveyor","QA/QC Inspector","Lab Technician","Quantity Surveyor","Site Engineer",
    "Planning Engineer","QA/QC Engineer","Structural Engineer","Estimation Engineer"
  ],
  Mechanical: [
    "Fitter","Welder","Rigger","Millwright","Machinist","Pipe Fitter","Fabricator",
    "Heavy Equipment Mechanic","Mechanical Draftsman","QA/QC Inspector","NDT Technician",
    "Maintenance Technician","Rotating Equipment Technician","Mechanical Engineer",
    "Piping Engineer","Maintenance Engineer","QA/QC Engineer","Inspection Engineer"
  ],
  General: [
    "Electrician","HVAC Technician","Plumber","Crane Operator","Excavator Operator",
    "Forklift Operator","General Helper","MEP Technician","BMS Operator","ELV Technician",
    "MEP Engineer","Construction Engineer","Site Coordinator"
  ],
  Safety: [
    "Fire Watcher","Safety Helper","Fire Alarm Technician","Fire Fighting Technician",
    "Rescue Technician","Safety Officer","HSE Inspector","Fire Alarm Engineer",
    "Fire Protection Technician","HSE Engineer","Safety Engineer","Fire Protection Engineer",
    "HSE Manager","Safety Manager"
  ],
};

export const DOMAIN_COLORS = {
  Civil:      { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Mechanical: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  General:    { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  Safety:     { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};