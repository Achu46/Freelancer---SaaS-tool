export const roles = ['SUPER_ADMIN', 'CLINIC_OWNER', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'];

export const rbacMatrix = [
  { module: 'Clinic tenants', SUPER_ADMIN: 'Manage all', CLINIC_OWNER: 'Own clinic', DOCTOR: 'No access', RECEPTIONIST: 'No access', PATIENT: 'No access' },
  { module: 'Doctors & staff', SUPER_ADMIN: 'Audit', CLINIC_OWNER: 'Manage', DOCTOR: 'View team', RECEPTIONIST: 'View team', PATIENT: 'No access' },
  { module: 'Patients', SUPER_ADMIN: 'Audit only', CLINIC_OWNER: 'Manage clinic', DOCTOR: 'Assigned patients', RECEPTIONIST: 'Register & schedule', PATIENT: 'Own profile' },
  { module: 'Appointments', SUPER_ADMIN: 'Analytics', CLINIC_OWNER: 'Manage clinic', DOCTOR: 'Own calendar', RECEPTIONIST: 'Book & queue', PATIENT: 'Book own' },
  { module: 'Medical records', SUPER_ADMIN: 'No PHI', CLINIC_OWNER: 'Policy access', DOCTOR: 'Create & sign', RECEPTIONIST: 'Metadata only', PATIENT: 'Read own' },
  { module: 'Billing & payments', SUPER_ADMIN: 'Subscription revenue', CLINIC_OWNER: 'Manage clinic', DOCTOR: 'View charges', RECEPTIONIST: 'Create invoices', PATIENT: 'Pay own' },
  { module: 'Platform settings', SUPER_ADMIN: 'Manage', CLINIC_OWNER: 'Clinic settings', DOCTOR: 'Profile only', RECEPTIONIST: 'Profile only', PATIENT: 'Profile only' },
];

export const subscriptionPlans = [
  {
    name: 'TRIAL',
    price: '₹0',
    limit: '14 days',
    features: ['1 branch', '2 doctors', '100 patient records', 'Email reminders', 'Basic dashboard'],
  },
  {
    name: 'STARTER',
    price: '₹2,999/mo',
    limit: 'Small clinics',
    features: ['3 doctors', '1,000 records', 'Queue tokens', 'Invoices', 'WhatsApp reminders'],
  },
  {
    name: 'PRO',
    price: '₹7,999/mo',
    limit: 'Growing clinics',
    features: ['15 doctors', '10,000 records', 'Analytics', 'Lab reports', 'Razorpay payments'],
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom',
    limit: 'Hospital groups',
    features: ['Unlimited branches', 'SLA support', 'Custom roles', 'Data exports', 'Dedicated onboarding'],
  },
];

export const patientPanelModules = [
  'Authentication',
  'Patient dashboard',
  'Appointment booking',
  'Medical records',
  'Prescriptions',
  'Lab reports',
  'Payments',
  'Invoices',
  'Family members',
  'Notifications',
  'Support tickets',
  'Profile settings',
];

export const clinicPanelModules = [
  'Dashboard',
  'Doctors',
  'Patients',
  'Appointments',
  'Calendar',
  'Queue management',
  'Billing',
  'Payments',
  'Prescriptions',
  'Medical records',
  'Lab reports',
  'Reports',
  'Analytics',
  'Staff management',
  'Subscription',
  'Support',
];

export const adminPanelModules = [
  'Platform dashboard',
  'Clinics',
  'Subscriptions',
  'Revenue',
  'Payments',
  'Analytics',
  'Audit logs',
  'Users',
  'Support tickets',
  'System settings',
  'Feature flags',
];

export const clinicMetrics = [
  { label: 'Appointments today', value: '186', delta: '+18%', tone: 'emerald' },
  { label: 'Queue waiting', value: '24', delta: '-11 min avg', tone: 'amber' },
  { label: 'Revenue collected', value: '₹4.8L', delta: '+22%', tone: 'indigo' },
  { label: 'Follow-ups due', value: '39', delta: '8 critical', tone: 'rose' },
];

export const patientMetrics = [
  { label: 'Upcoming visits', value: '3', delta: 'Next: Cardiology', tone: 'indigo' },
  { label: 'Active prescriptions', value: '5', delta: '2 refills due', tone: 'emerald' },
  { label: 'Unpaid invoices', value: '₹2,400', delta: 'Pay online', tone: 'amber' },
  { label: 'Family members', value: '4', delta: '2 children', tone: 'cyan' },
];

export const adminMetrics = [
  { label: 'Active clinics', value: '428', delta: '+31 this month', tone: 'indigo' },
  { label: 'MRR', value: '₹72.4L', delta: '+14.6%', tone: 'emerald' },
  { label: 'Trial conversions', value: '38%', delta: '+5.2%', tone: 'cyan' },
  { label: 'Open escalations', value: '17', delta: '4 SLA risk', tone: 'rose' },
];

export const appointmentTimeline = [
  { time: '09:00', patient: 'Aarav Shah', doctor: 'Dr. Meera Iyer', type: 'Cardiology review', status: 'Checked in' },
  { time: '09:20', patient: 'Fatima Khan', doctor: 'Dr. Kavya Menon', type: 'Diabetes follow-up', status: 'In consultation' },
  { time: '09:45', patient: 'Rohan Das', doctor: 'Dr. Arjun Rao', type: 'Pediatric fever', status: 'Waiting' },
  { time: '10:05', patient: 'Nisha Patel', doctor: 'Dr. Sana Ali', type: 'Lab report review', status: 'Booked' },
];

export const queueTokens = [
  { token: 'A-014', patient: 'Aarav Shah', priority: 'Normal', room: 'Cardiology 2', wait: '08m' },
  { token: 'E-002', patient: 'Riya Sen', priority: 'Emergency', room: 'Triage', wait: '02m' },
  { token: 'B-031', patient: 'Kabir Verma', priority: 'Senior', room: 'General 1', wait: '18m' },
  { token: 'L-009', patient: 'Nisha Patel', priority: 'Lab review', room: 'Diagnostics', wait: '06m' },
];

export const invoices = [
  { id: 'INV-2049', patient: 'Fatima Khan', amount: '₹6,800', mode: 'Razorpay UPI', status: 'Paid' },
  { id: 'INV-2050', patient: 'Rohan Das', amount: '₹1,200', mode: 'Cash', status: 'Pending' },
  { id: 'INV-2051', patient: 'Nisha Patel', amount: '₹4,500', mode: 'Card', status: 'Paid' },
  { id: 'INV-2052', patient: 'Aarav Shah', amount: '₹2,400', mode: 'Insurance', status: 'Review' },
];

export const chartData = [
  { name: 'Mon', appointments: 120, revenue: 220 },
  { name: 'Tue', appointments: 148, revenue: 260 },
  { name: 'Wed', appointments: 132, revenue: 242 },
  { name: 'Thu', appointments: 171, revenue: 310 },
  { name: 'Fri', appointments: 186, revenue: 340 },
  { name: 'Sat', appointments: 96, revenue: 180 },
];

export const architectureLayers = [
  { title: 'Frontend apps', items: ['React Router route guards', 'React Query server cache', 'Redux Toolkit session state', 'Reusable Tailwind design system'] },
  { title: 'API gateway', items: ['Express controllers', 'Zod DTO validation', 'JWT refresh-token rotation', 'Tenant middleware'] },
  { title: 'Domain services', items: ['Appointments', 'Queue', 'EMR', 'Billing', 'Subscriptions', 'Notifications', 'Audit logging'] },
  { title: 'Data plane', items: ['PostgreSQL + Prisma', 'Redis queues/cache', 'S3/R2 documents', 'Razorpay payment webhooks'] },
  { title: 'Operations', items: ['Docker', 'Nginx', 'GitHub Actions', 'Health checks', 'Structured logs'] },
];

export const auditEvents = [
  { actor: 'Dr. Meera Iyer', action: 'SIGNED_PRESCRIPTION', resource: 'RX-8831', clinicId: 'clinic_bluesky', time: '4 min ago' },
  { actor: 'Reception Desk', action: 'QUEUE_TOKEN_CREATED', resource: 'A-014', clinicId: 'clinic_bluesky', time: '9 min ago' },
  { actor: 'System', action: 'PAYMENT_CAPTURED', resource: 'pay_RZP_912', clinicId: 'clinic_bluesky', time: '18 min ago' },
  { actor: 'Super Admin', action: 'FEATURE_FLAG_UPDATED', resource: 'advanced_analytics', clinicId: 'platform', time: '1 hr ago' },
];

export const tenantControls = [
  'Every clinical entity includes clinicId',
  'Tenant middleware resolves clinic context from JWT, subdomain, or header',
  'Repository helpers inject clinicId filters into Prisma queries',
  'RBAC guard checks role + permission + subscription plan',
  'Audit logs capture actor, clinicId, IP, device, and resource',
  'Super Admin routes redact PHI by default',
];
