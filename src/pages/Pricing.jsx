import { useAuth } from '../contexts/AuthContext';
import { PLANS, redirectToLemonSqueezy } from '../lib/lemonsqueezy';
import { Check, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PLAN_KEYS = ['free', 'starter', 'pro'];

const PLAN_ACCENTS = {
  free: 'border-slate-200 dark:border-slate-700',
  starter: 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/30 dark:ring-indigo-600/30',
  pro: 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20',
};

const PLAN_BADGES = {
  starter: { label: 'Most Popular', css: 'bg-indigo-600 text-white shadow-sm' },
  pro: { label: 'Best Value', css: 'bg-indigo-600 text-white shadow-sm' },
};

export default function Pricing() {
  const { currentUser, userProfile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const currentPlan = userProfile?.plan || 'free';

  function handleUpgrade(planKey) {
    const plan = PLANS[planKey];
    if (!plan.checkoutUrl) {
      toast.error('Checkout not configured yet. Add the Lemon Squeezy URL to your .env file.');
      return;
    }
    if (!currentUser) {
      toast.error('Please sign in first to upgrade.');
      return;
    }
    setLoadingPlan(planKey);
    try {
      // This redirects the browser — no async needed
      redirectToLemonSqueezy(plan.checkoutUrl, currentUser.email, currentUser.uid);
    } catch (err) {
      toast.error(err.message || 'Failed to open checkout. Please try again.');
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Crown size={14} />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Choose your plan
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Start free. Upgrade when your client list grows. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PLAN_KEYS.map((key) => {
            const plan = PLANS[key];
            const badge = PLAN_BADGES[key];
            const isCurrentPlan = currentPlan === key;
            const accent = PLAN_ACCENTS[key];

            return (
              <div
                key={key}
                className={`relative bg-white dark:bg-slate-900 border ${accent} rounded-2xl p-7 flex flex-col transition-all hover:shadow-lg hover:shadow-indigo-500/5`}
              >
                {badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${badge.css}`}>
                    {badge.label}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.price}</span>
                        <span className="text-slate-400 text-sm">/month</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {plan.projectLimit === Infinity ? 'Unlimited projects' : `${plan.projectLimit} project${plan.projectLimit > 1 ? 's' : ''}`}
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="w-full py-3 text-sm font-semibold text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    ✓ Current Plan
                  </div>
                ) : key === 'free' ? (
                  <div className="w-full py-3 text-sm font-medium text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    Always free
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={loadingPlan === key}
                    id={`upgrade-${key}-btn`}
                    className={`w-full py-3 text-sm font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2 ${
                      key === 'starter'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-500/25'
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-500/25'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loadingPlan === key ? (
                      <><Loader2 size={15} className="animate-spin" /> Processing…</>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">Frequently asked questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                q: 'Do clients need to create an account?',
                a: 'Nope! Clients access the portal via a unique link — no signup, no password.',
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes. Cancel anytime from your billing portal. You keep access until the end of the billing period.',
              },
              {
                q: 'What happens to my projects if I downgrade?',
                a: 'Your existing projects stay intact. You just won\'t be able to create new ones beyond the plan limit.',
              },
              {
                q: 'Is my client data secure?',
                a: 'Files are stored in Firebase Storage. Each project is only accessible via its unique 10-character link ID.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">{item.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
