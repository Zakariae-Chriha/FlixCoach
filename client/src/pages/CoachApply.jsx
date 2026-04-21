import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Zap, Upload, CheckCircle } from 'lucide-react';
import api from '../services/api';

const SPECIALTIES = [
  'Boxing','Full Contact / Kickboxing','MMA','Muay Thai','Self-Defense',
  'Bodybuilding / Muscle Gain','Weight Loss / Fat Burn','Functional Training',
  'CrossFit','Stretching & Mobility','Cardio & Endurance',
  'Yoga & Meditation','Mental Coaching / Life Coaching','Stress & Burnout Management',
  'Sleep & Recovery Coaching','Sports Nutrition','Weight Management Diet',
  'Vegan / Special Diet Coaching','Athletics & Running','Cycling & Triathlon',
  'Sports Rehabilitation','Youth & Junior Coaching',
];

export default function CoachApply() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', age: '', gender: '',
    city: '', bio: '', coachingStyle: '', experience: '',
    specialties: [], certifications: '', languages: '',
    sessionTypes: [], pricePerSession: '', monthlyPackage: '',
    cvUrl: '',
  });
  const [photo, setPhoto] = useState(null);
  const [cv, setCv] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleSpecialty = (s) => {
    setForm(p => ({
      ...p,
      specialties: p.specialties.includes(s)
        ? p.specialties.filter(x => x !== s)
        : [...p.specialties, s],
    }));
  };

  const toggleSessionType = (t) => {
    setForm(p => ({
      ...p,
      sessionTypes: p.sessionTypes.includes(t)
        ? p.sessionTypes.filter(x => x !== t)
        : [...p.sessionTypes, t],
    }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.bio || !form.specialties.length) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, v.join(','));
        else fd.append(k, v);
      });
      if (photo) fd.append('photo', photo);
      if (cv) fd.append('cv', cv);

      await api.post('/coaches/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Application Submitted!</h2>
        <p className="text-gray-400 mb-6">
          We'll review your application and contact you at <strong className="text-white">{form.email}</strong> within 2-3 business days.
        </p>
        <Link to="/" className="btn-primary inline-block">Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/40">
            <Zap size={26} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary-400">FlixCoach</span></h1>
          <p className="text-gray-400">Apply to be part of our professional coaching team</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s ? 'bg-primary-600 text-white' : 'bg-dark-600 text-gray-500'}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-dark-600'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-6 space-y-5">

          {/* Step 1 — Personal Info */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Full Name *</label>
                  <input className="input-field" placeholder="John Doe" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Email *</label>
                  <input className="input-field" type="email" placeholder="coach@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Phone *</label>
                  <input className="input-field" placeholder="+49 123 456789" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Age *</label>
                  <input className="input-field" type="number" placeholder="30" value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Gender *</label>
                  <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">City *</label>
                  <input className="input-field" placeholder="Berlin" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
              </div>
              {/* Photo upload */}
              <div>
                <label className="label-field">Profile Photo</label>
                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:border-primary-600/50 transition-all">
                  <Upload size={18} className="text-primary-400" />
                  <span className="text-sm text-gray-400">{photo ? photo.name : 'Upload photo (JPG/PNG)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
                </label>
              </div>
              <button onClick={() => { if (!form.fullName || !form.email || !form.phone) { toast.error('Fill required fields'); return; } setStep(2); }} className="btn-primary w-full">
                Next →
              </button>
            </>
          )}

          {/* Step 2 — Professional Info */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold mb-4">Professional Background</h2>
              <div>
                <label className="label-field">Years of Experience *</label>
                <input className="input-field" type="number" placeholder="5" value={form.experience} onChange={e => set('experience', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Specialties * (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${form.specialties.includes(s) ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-field">Certifications (comma separated)</label>
                <input className="input-field" placeholder="e.g. ACE, NASM, CrossFit L2" value={form.certifications} onChange={e => set('certifications', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Languages (comma separated)</label>
                <input className="input-field" placeholder="e.g. English, German, French" value={form.languages} onChange={e => set('languages', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Bio / About You *</label>
                <textarea className="input-field min-h-[100px]" placeholder="Tell clients about your experience and approach..." value={form.bio} onChange={e => set('bio', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Coaching Style</label>
                <input className="input-field" placeholder="e.g. Motivating, strict, results-focused" value={form.coachingStyle} onChange={e => set('coachingStyle', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => { if (!form.specialties.length || !form.bio) { toast.error('Fill required fields'); return; } setStep(3); }} className="btn-primary flex-1">Next →</button>
              </div>
            </>
          )}

          {/* Step 3 — Session & CV */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold mb-4">Session Details & Documents</h2>
              <div>
                <label className="label-field">Session Type *</label>
                <div className="flex gap-3 mt-2">
                  {['in-person', 'online', 'both'].map(t => (
                    <button key={t} type="button" onClick={() => toggleSessionType(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize
                        ${form.sessionTypes.includes(t) ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Price per Session (€) *</label>
                  <input className="input-field" type="number" placeholder="60" value={form.pricePerSession} onChange={e => set('pricePerSession', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Monthly Package (€)</label>
                  <input className="input-field" type="number" placeholder="200" value={form.monthlyPackage} onChange={e => set('monthlyPackage', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label-field">CV / Resume Upload</label>
                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:border-primary-600/50 transition-all">
                  <Upload size={18} className="text-primary-400" />
                  <span className="text-sm text-gray-400">{cv ? cv.name : 'Upload CV (PDF/DOC)'}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCv(e.target.files[0])} />
                </label>
              </div>
              <div>
                <label className="label-field">Or CV Link (Google Drive / LinkedIn)</label>
                <input className="input-field" placeholder="https://..." value={form.cvUrl} onChange={e => set('cvUrl', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Submitting...' : '✓ Submit Application'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already a member?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
