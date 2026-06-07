import { Link } from 'react-router-dom';
import { ArrowRight, Upload, MessageSquare, CheckCircle, Zap, Shield, BarChart3, Star, ChevronRight, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';

const FEATURES = [
  {
    icon: <Upload className="text-indigo-500 dark:text-indigo-400" size={22} />,
    title: 'Automated Asset Pipelines',
    desc: 'Encrypted drag-and-drop ingestion interface where clients upload files instantly without needing accounts.',
  },
  {
    icon: <MessageSquare className="text-violet-500 dark:text-violet-400" size={22} />,
    title: 'Unified Communication Hub',
    desc: 'Consolidated workspace threads and messaging pipelines. Eliminate fragmented email threads entirely.',
  },
  {
    icon: <CheckCircle className="text-emerald-500 dark:text-emerald-400" size={22} />,
    title: 'Visual Interactive Roadmaps',
    desc: 'Share live progress, Gantt milestones, and project task states in real-time, boosting client trust.',
  },
  {
    icon: <Shield className="text-cyan-500 dark:text-cyan-400" size={22} />,
    title: 'Bank-Grade Client Portal Access',
    desc: 'Secure single-link portals authenticated via localized tokens. No client logins or passwords required.',
  },
  {
    icon: <BarChart3 className="text-amber-500 dark:text-amber-400" size={22} />,
    title: 'Intelligent Management Console',
    desc: 'Monitor active projects, contract status, workspace events, and revenue metrics on an executive dashboard.',
  },
  {
    icon: <Zap className="text-rose-500 dark:text-rose-400" size={22} />,
    title: 'Workspace Automation Engine',
    desc: 'Trigger automatic onboarding emails, file alerts, and progress reports using custom rules.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Global Creative Director',
    quote: "QueFlow completely consolidated our client relations. We cut delivery delays by 80% with automated pipelines.",
    avatar: 'SC',
  },
  {
    name: 'Marcus Webb',
    role: 'Principal Architect',
    quote: "Our corporate clients were amazed. The passwordless single-link entry is exactly the type of UX modern brands expect.",
    avatar: 'MW',
  },
  {
    name: 'Priya Nair',
    role: 'Managing Partner',
    quote: "Enterprise SaaS capability, tailored for boutique agencies. The automation triggers are worth every single penny.",
    avatar: 'PN',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 bg-grid relative overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-32 pb-24 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-8 animate-fade-in glow-cyan">
            <Cpu size={12} className="animate-spin duration-3000" />
            QueFlow Enterprise v2.0 Active
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.08] animate-fade-in">
            Next-Gen Client Collaboration
            <br />
            <span className="gradient-text">Engineered for Scale</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in">
            Provision secure, zero-signup workspaces. Automate your deliverables pipelines, 
            receive instant event alerts, and track milestones under one unified dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/signup"
              id="hero-cta-signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-indigo-750 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 glow-cyan active:scale-98 cursor-pointer"
            >
              Initialize Workspaces Free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              id="hero-cta-pricing"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-indigo-500/40 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-300 active:scale-98 cursor-pointer"
            >
              Enterprise Pricing
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-500 tracking-wide uppercase">
            No contract required · Active instance starts instantly
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-white/40 dark:bg-slate-950/65 relative border-t border-slate-200 dark:border-slate-900" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Consolidate client operations.{' '}
              <span className="gradient-text font-black">Maximize performance.</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Every client gets a dedicated, secure endpoint. Centralize deliverables, messages, and progress data in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="cyber-card rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-5 shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Learn more <ChevronRight size={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Stats / Social Proof */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-900 bg-slate-100/40 dark:bg-slate-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { stat: '$12M+', label: 'Volume Processed' },
              { stat: '100K+', label: 'Deliverables Synced' },
              { stat: '99.99%', label: 'Gateway Uptime' },
              { stat: '10X', label: 'Faster Feedback Loop' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">{item.stat}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
              Trusted by leading <span className="gradient-text font-black">global professionals</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hear from creative agencies, software vendors, and producers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#374785] to-[#24305e] p-10 text-center shadow-2xl shadow-indigo-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to streamline your client work?
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">Join freelancers who've cut their email back-and-forth in half.</p>
              <Link
                to="/signup"
                id="cta-bottom-signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#24305e] hover:text-[#374785] font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Get started free
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Que<span className="text-indigo-500">Flow</span>
            </span>
          </div>
          <p className="text-sm text-slate-400">© 2025 QueFlow. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link to="/pricing" className="hover:text-indigo-500 transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-indigo-500 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
