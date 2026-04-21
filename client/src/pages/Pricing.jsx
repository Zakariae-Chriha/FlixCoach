import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Check, Zap, Crown, Star, ArrowRight, Shield } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: '🌱',
    color: 'from-gray-500 to-gray-600',
    border: 'border-white/8',
    features: [
      'AI-generated training plan',
      'AI nutrition plan',
      'Food log & tracking',
      'Sleep & wellness tracking',
      'Community feed access',
      'Group activities',
      '3 AI coach messages/day',
    ],
    missing: ['Video calls with coaches', 'Unlimited AI messages', 'Priority support', 'Advanced analytics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    icon: '⚡',
    color: 'from-orange-500 to-pink-500',
    border: 'border-orange-500/30',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited AI coach messages',
      'Priority coach matching',
      'Advanced analytics & reports',
      '5 video calls/month with coaches',
      'Progress photo analysis by AI',
      'Meal plan regeneration anytime',
    ],
    missing: ['Unlimited video calls', 'Dedicated personal coach'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 24.99,
    icon: '👑',
    color: 'from-yellow-400 to-orange-500',
    border: 'border-yellow-500/30',
    badge: 'Best Results',
    features: [
      'Everything in Pro',
      'Unlimited video calls',
      'Dedicated personal coach',
      'Custom meal plans updated weekly',
      'Priority 24/7 support',
      'Early access to new features',
      'Monthly 1-on-1 strategy session',
    ],
    missing: [],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const currentPlan = user?.subscription?.plan || 'free';

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/register'); return; }
    if (planId === 'free') return;
    if (planId === currentPlan) { toast('You are already on this plan!'); return; }

    setLoading(planId);
    try {
      const r = await api.post('/stripe/create-checkout', { plan: planId });
      if (r.data.url) window.location.href = r.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('portal');
    try {
      const r = await api.post('/stripe/create-portal');
      if (r.data.url) window.location.href = r.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open portal');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5">
          <Zap size={13} className="text-orange-400"/>
          <span className="text-orange-300 text-sm font-semibold">Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl font-black text-white">
          Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">transformation</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">Start free forever. Upgrade when you're ready to go all-in.</p>

        {currentPlan !== 'free' && (
          <div className="inline-flex items-center gap-3 bg-dark-800 border border-white/10 rounded-2xl px-5 py-3">
            <Crown size={16} className="text-yellow-400"/>
            <span className="text-sm text-white font-semibold">You're on <span className="text-orange-400 capitalize">{currentPlan}</span></span>
            <button onClick={handleManage} disabled={loading === 'portal'}
              className="text-xs text-gray-400 hover:text-white underline transition-colors">
              {loading === 'portal' ? 'Loading...' : 'Manage subscription'}
            </button>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          const isPro = plan.id === 'pro';

          return (
            <div key={plan.id} className={`relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col
              ${isPro ? 'border-orange-500/40 shadow-2xl shadow-orange-900/20 scale-[1.02]' : plan.border}
              bg-dark-800/60`}>

              {/* Top gradient line */}
              <div className={`h-1 w-full bg-gradient-to-r ${plan.color}`}/>

              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white shadow-lg`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black text-white">Free</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">€{plan.price}</span>
                      <span className="text-gray-400 mb-1 text-sm">/mo</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check size={10} className="text-white" strokeWidth={3}/>
                      </div>
                      <span className="text-sm text-gray-300">{f}</span>
                    </div>
                  ))}
                  {plan.missing?.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <div className="w-4 h-4 rounded-full bg-dark-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gray-500 text-xs">—</span>
                      </div>
                      <span className="text-sm text-gray-500 line-through">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isActive ? (
                  <div className="w-full py-3.5 rounded-2xl bg-dark-700 text-center text-sm font-bold text-gray-400 border border-white/8">
                    ✓ Current Plan
                  </div>
                ) : plan.price === 0 ? (
                  <button onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="w-full py-3.5 rounded-2xl bg-dark-700 hover:bg-dark-600 text-white font-bold text-sm transition-all border border-white/8">
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!loading}
                    className={`w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all flex items-center justify-center gap-2
                      bg-gradient-to-r ${plan.color} shadow-lg hover:opacity-90 hover:scale-[1.02] disabled:opacity-50`}>
                    {loading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    ) : (
                      <> Upgrade to {plan.name} <ArrowRight size={15}/> </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-white/5">
        {[
          { icon: Shield, text: 'Secure payments via Stripe' },
          { icon: Star, text: 'Cancel anytime, no lock-in' },
          { icon: Zap, text: 'Instant access after payment' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
            <Icon size={15} className="text-gray-400"/>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
