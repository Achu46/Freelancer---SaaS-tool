import { Link } from 'react-router-dom';
import { ArrowRight, Upload, MessageSquare, CheckCircle, Zap, Shield, BarChart3, Star, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const FEATURES = [
  {
    icon: <Upload className="text-indigo-500" size={22} />,
    title: 'Client File Uploads',
    desc: 'Clients upload files directly to your project without any account or hassle.',
  },
  {
    icon: <MessageSquare className="text-indigo-500" size={22} />,
    title: 'Centralized Messages',
    desc: 'All client messages in one thread. No more digging through email chains.',
  },
  {
    icon: <CheckCircle className="text-emerald-500" size={22} />,
    title: 'Task Tracking',
    desc: 'Show your clients exactly where the project stands with real-time task status.',
  },
  {
    icon: <Shield className="text-blue-500" size={22} />,
    title: 'Secure Sharing',
    desc: 'Each client gets a unique, secure link. No accounts needed for clients.',
  },
  {
    icon: <BarChart3 className="text-indigo-500" size={22} />,
    title: 'Project Dashboard',
    desc: 'Manage all your client projects from one beautiful, organized dashboard.',
  },
  {
    icon: <Zap className="text-rose-500" size={22} />,
    title: 'Instant Notifications',
    desc: 'Get notified the moment a client uploads a file or sends a message.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Brand Designer',
    quote: "QueFlow cut my client back-and-forth by 80%. I just send one link and everything's handled.",
    avatar: 'SC',
  },
  {
    name: 'Marcus Webb',
    role: 'Video Editor',
    quote: "My clients love it. No logins, no confusion — they just upload and I get notified instantly.",
    avatar: 'MW',
  },
  {
    name: 'Priya Nair',
    role: 'Web Developer',
    quote: "The cleanest client portal I've ever used. Worth every penny of the Pro plan.",
    avatar: 'PN',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-indigo-50/40 to-white dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-indigo-400/15 to-transparent dark:from-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} />
            Built for freelancers
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] animate-fade-in">
            Stop chasing clients
            <br />
            <span className="gradient-text">for files & feedback</span>
          </h1>

          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Share one secure link. Your client uploads files, leaves feedback,
            and tracks progress — no signup required. You focus on the work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/signup"
              id="hero-cta-signup"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              id="hero-cta-pricing"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
            >
              View pricing
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-400 dark:text-slate-500">
            Free forever for 1 project · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-slate-950" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to{' '}
              <span className="gradient-text">delight clients</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              One portal per client. All communication, files, and project status in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-16">
            Three simple steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create a project', desc: 'Add your client details and set up the project in under a minute.' },
              { step: '02', title: 'Share the link', desc: 'Copy and send the unique portal link to your client — no signup needed.' },
              { step: '03', title: 'Stay organized', desc: 'Clients upload, comment, and track tasks. You get notified instantly.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-indigo-500/30">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Loved by freelancers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-indigo-400 fill-indigo-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-10 text-center shadow-2xl shadow-indigo-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to streamline your client work?
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">Join freelancers who've cut their email back-and-forth in half.</p>
              <Link
                to="/signup"
                id="cta-bottom-signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
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
              Client<span className="text-indigo-500">Flow</span>
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
