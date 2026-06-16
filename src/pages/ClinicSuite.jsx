import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  HeartPulse,
  LockKeyhole,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  adminPanelModules,
  architectureLayers,
  clinicPanelModules,
  patientPanelModules,
  rbacMatrix,
  roles,
  subscriptionPlans,
  tenantControls,
} from '../data/clinicPlatform';
import {
  getAdminWorkspace,
  getClinicCommandCenter,
  getPatientWorkspace,
} from '../services/clinicApi';
import { demoClinicUsers, loginWithRole, logout } from '../store/clinicStore';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/patient', label: 'Patient' },
  { to: '/clinic', label: 'Clinic' },
  { to: '/super-admin', label: 'Super Admin' },
  { to: '/architecture', label: 'Architecture' },
];

const roleDestinations = {
  SUPER_ADMIN: '/super-admin',
  CLINIC_OWNER: '/clinic',
  DOCTOR: '/clinic',
  RECEPTIONIST: '/clinic',
  PATIENT: '/patient',
};

const moduleIcons = {
  Authentication: LockKeyhole,
  Dashboard: Activity,
  Doctors: Stethoscope,
  Patients: Users,
  Appointments: CalendarDays,
  Billing: CreditCard,
  Payments: CreditCard,
  Prescriptions: FileText,
  Notifications: Bell,
  Support: MessageSquareText,
};

const toneClasses = {
  amber: 'text-amber-300',
  cyan: 'text-cyan-300',
  emerald: 'text-emerald-300',
  indigo: 'text-indigo-300',
  rose: 'text-rose-300',
};

const overviewCards = [
  { title: 'Patient panel', to: '/patient', copy: 'Book visits, access records, pay invoices, manage family.' },
  { title: 'Clinic panel', to: '/clinic', copy: 'Run appointments, queue, EMR, billing, staff, and analytics.' },
  { title: 'Super Admin', to: '/super-admin', copy: 'Control tenants, subscriptions, feature flags, audit, support.' },
  { title: 'Architecture', to: '/architecture', copy: 'Express + Prisma + Redis + S3/R2 + Razorpay + Docker.' },
];

function Shell({ eyebrow, title, subtitle, children }) {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.clinicSession);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)]" />
      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
              <HeartPulse size={24} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">ClinicOS</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Multi-tenant SaaS</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {session.isAuthenticated ? (
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10"
              >
                Logout · {session.activeRole.replace('_', ' ')}
              </button>
            ) : (
              <NavLink
                to="/login"
                className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles size={14} />
            {eyebrow}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('CLINIC_OWNER');
  const [email, setEmail] = useState('owner@clinicos.test');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');

  const selectedUser = demoClinicUsers.find((user) => user.role === selectedRole);

  function handleRoleSelect(role) {
    const user = demoClinicUsers.find((candidate) => candidate.role === role);
    setSelectedRole(role);
    setEmail(user?.email || '');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid demo email and at least 6 password characters.');
      return;
    }

    dispatch(loginWithRole({ role: selectedRole, email }));
    setError('');

    const redirectTo = location.state?.from || roleDestinations[selectedRole] || '/clinic';
    navigate(redirectTo, { replace: true });
  }

  return (
    <Shell
      eyebrow="Authentication and RBAC"
      title="Sign in with a tenant-scoped role to unlock the right workspace."
      subtitle="The demo login issues a role session, stores the active tenant context, and enforces RBAC route guards before users can enter patient, clinic, admin, or architecture panels."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-cyan-950/30">
          <h2 className="text-2xl font-black">Role login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use demo password <span className="font-black text-cyan-100">demo1234</span> for any role.
          </p>
          <label className="mt-6 block text-sm font-bold text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-cyan-300/40 transition focus:ring-4"
          />
          <label className="mt-5 block text-sm font-bold text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-cyan-300/40 transition focus:ring-4"
          />
          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm font-semibold text-rose-100">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200"
          >
            Sign in as {selectedRole.replace('_', ' ')}
          </button>
        </form>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
          <h2 className="text-2xl font-black">RBAC demo accounts</h2>
          <div className="mt-6 grid gap-3">
            {demoClinicUsers.map((user) => (
              <button
                key={user.role}
                type="button"
                onClick={() => handleRoleSelect(user.role)}
                className={`rounded-3xl border p-5 text-left transition ${
                  selectedRole === user.role
                    ? 'border-cyan-300 bg-cyan-300/10'
                    : 'border-white/10 bg-slate-950/50 hover:border-cyan-300/50'
                }`}
              >
                <span className="block text-sm font-black text-cyan-100">{user.role.replace('_', ' ')}</span>
                <span className="mt-1 block text-lg font-black">{user.name}</span>
                <span className="mt-2 block text-sm text-slate-300">
                  {user.email} · tenant {user.clinicId} · plan {user.plan}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm leading-6 text-slate-300">
            Selected session: <span className="font-black text-white">{selectedUser?.name}</span> can open{' '}
            <span className="font-black text-cyan-100">{roleDestinations[selectedRole]}</span>. Other protected panels return
            an access-denied page.
          </div>
        </section>
      </div>
    </Shell>
  );
}

export function AccessDenied() {
  const session = useSelector((state) => state.clinicSession);

  return (
    <Shell
      eyebrow="Access denied"
      title="This role is not allowed to open that workspace."
      subtitle="RBAC route guards compare the signed-in role with each panel's allowed roles before rendering sensitive clinic, patient, or platform screens."
    >
      <div className="rounded-[2rem] border border-rose-300/20 bg-rose-300/10 p-8">
        <h2 className="text-2xl font-black">Blocked by RBAC</h2>
        <p className="mt-4 text-slate-200">
          Current role: <span className="font-black">{session.activeRole}</span>. Active tenant:{' '}
          <span className="font-black">{session.activeClinicId}</span>.
        </p>
        <Link
          to={roleDestinations[session.activeRole] || '/login'}
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
        >
          Go to allowed workspace
        </Link>
      </div>
    </Shell>
  );
}

function MetricGrid({ metrics }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">{metric.label}</p>
          <p className="mt-3 text-3xl font-black">{metric.value}</p>
          <p className={`mt-2 text-sm font-bold ${toneClasses[metric.tone]}`}>{metric.delta}</p>
        </div>
      ))}
    </section>
  );
}

function ModuleGrid({ modules }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((module) => {
        const Icon = moduleIcons[module] || ClipboardList;
        return (
          <div key={module} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <span className="rounded-xl bg-cyan-300/10 p-2 text-cyan-200">
              <Icon size={18} />
            </span>
            <span className="text-sm font-semibold text-slate-100">{module}</span>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-bold">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={Object.values(row).join('-')} className="text-slate-200">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4">{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsCard({ data }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Operations analytics</h2>
          <p className="text-sm text-slate-400">Appointments and revenue trend</p>
        </div>
        <Activity className="text-cyan-200" />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="appointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />
            <Area type="monotone" dataKey="appointments" stroke="#67e8f9" fill="url(#appointments)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PlanCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {subscriptionPlans.map((plan) => (
        <article key={plan.name} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">{plan.name}</p>
          <p className="mt-4 text-3xl font-black">{plan.price}</p>
          <p className="mt-1 text-sm font-semibold text-slate-400">{plan.limit}</p>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={16} />
                {feature}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function RbacMatrix() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Module</th>
              {roles.map((role) => (
                <th key={role} className="px-5 py-4">{role.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rbacMatrix.map((row) => (
              <tr key={row.module}>
                <td className="px-5 py-4 font-bold text-white">{row.module}</td>
                {roles.map((role) => (
                  <td key={role} className="px-5 py-4 text-slate-300">{row[role]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SessionBanner() {
  const session = useSelector((state) => state.clinicSession);

  return (
    <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-50">
      Active tenant context: <span className="font-black">{session.activeClinicId}</span> · Role guard:{' '}
      <span className="font-black">{session.activeRole}</span> · Plan: <span className="font-black">{session.activePlan}</span>
    </div>
  );
}

export function ClinicLanding() {
  return (
    <Shell
      eyebrow="Production platform blueprint"
      title="Enterprise clinic management across patients, clinics, and platform ops."
      subtitle="ClinicOS turns the attached master requirements into a multi-tenant SaaS surface with strict tenant isolation, plan-gated features, RBAC, payments, notifications, analytics, and deployment scaffolding."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-cyan-950/30">
          <div className="grid gap-4 sm:grid-cols-2">
            {overviewCards.map((card) => (
              <Link key={card.title} to={card.to} className="group rounded-3xl border border-white/10 bg-slate-950/50 p-6 transition hover:-translate-y-1 hover:border-cyan-300/50">
                <h2 className="text-xl font-black">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{card.copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">
                  Open module <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
          <h2 className="text-2xl font-black">Tenant isolation controls</h2>
          <div className="mt-6 space-y-4">
            {tenantControls.map((control) => (
              <div key={control} className="flex gap-3 rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-200">
                <ShieldCheck className="shrink-0 text-cyan-200" size={18} />
                {control}
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="mt-10">
        <PlanCards />
      </section>
    </Shell>
  );
}

export function PatientPanel() {
  const { data } = useQuery({ queryKey: ['patient-workspace'], queryFn: getPatientWorkspace });

  return (
    <Shell
      eyebrow="Patient panel"
      title="A secure patient workspace for appointments, records, family, and payments."
      subtitle="Patients can book care, track prescriptions, view lab reports, pay invoices, receive notifications, and manage family members from a responsive portal."
    >
      <SessionBanner />
      <MetricGrid metrics={data?.metrics || []} />
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="mb-4 text-2xl font-black">Patient modules</h2>
          <ModuleGrid modules={patientPanelModules} />
        </div>
        <DataTable
          columns={[
            { key: 'time', label: 'Time' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'type', label: 'Visit' },
            { key: 'status', label: 'Status' },
          ]}
          rows={data?.appointments || []}
        />
      </section>
    </Shell>
  );
}

export function ClinicPanel() {
  const { data } = useQuery({ queryKey: ['clinic-command-center'], queryFn: getClinicCommandCenter });

  return (
    <Shell
      eyebrow="Clinic panel"
      title="Clinic operators get a real-time command center for care delivery."
      subtitle="Owners, doctors, and receptionists share one tenant-scoped workspace for appointments, calendar, queue tokens, billing, prescriptions, lab reports, notifications, and staff operations."
    >
      <SessionBanner />
      <MetricGrid metrics={data?.metrics || []} />
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AnalyticsCard data={data?.chartData || []} />
        <div>
          <h2 className="mb-4 text-2xl font-black">Clinic modules</h2>
          <ModuleGrid modules={clinicPanelModules} />
        </div>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <DataTable
          columns={[
            { key: 'time', label: 'Time' },
            { key: 'patient', label: 'Patient' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'status', label: 'Status' },
          ]}
          rows={data?.appointments || []}
        />
        <DataTable
          columns={[
            { key: 'token', label: 'Token' },
            { key: 'patient', label: 'Patient' },
            { key: 'priority', label: 'Priority' },
            { key: 'wait', label: 'Wait' },
          ]}
          rows={data?.queue || []}
        />
      </section>
    </Shell>
  );
}

export function SuperAdminPanel() {
  const { data } = useQuery({ queryKey: ['admin-workspace'], queryFn: getAdminWorkspace });

  return (
    <Shell
      eyebrow="Super admin panel"
      title="Platform governance for tenants, revenue, support, flags, and audit."
      subtitle="Super admins manage clinic subscriptions, plan entitlements, feature flags, platform analytics, support escalations, and tenant-safe audit trails without exposing patient PHI."
    >
      <MetricGrid metrics={data?.metrics || []} />
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="mb-4 text-2xl font-black">Admin modules</h2>
          <ModuleGrid modules={adminPanelModules} />
        </div>
        <AnalyticsCard data={data?.chartData || []} />
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-black">RBAC matrix</h2>
        <RbacMatrix />
      </section>
    </Shell>
  );
}

export function PlatformArchitecture() {
  return (
    <Shell
      eyebrow="System architecture"
      title="Full-stack blueprint with tenant-aware API and operational scaffolding."
      subtitle="The backend scaffold uses Express, Prisma, PostgreSQL, Redis, JWT refresh tokens, Razorpay hooks, S3/R2 document storage, Docker, Nginx, and CI wiring."
    >
      <div className="grid gap-5 lg:grid-cols-5">
        {architectureLayers.map((layer) => (
          <article key={layer.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              {layer.title === 'Data plane' ? <Database /> : layer.title === 'API gateway' ? <Network /> : <Building2 />}
            </div>
            <h2 className="font-black">{layer.title}</h2>
            <ul className="mt-4 space-y-3">
              {layer.items.map((item) => (
                <li key={item} className="text-sm leading-6 text-slate-300">{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-black">RBAC and tenant access map</h2>
        <RbacMatrix />
      </section>
    </Shell>
  );
}
