import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Let's get to know you",
    subtitle: 'Basic information for your personalized plan',
    fields: [
      { key: 'age', label: 'Age', type: 'number', placeholder: '25', min: 13, max: 100 },
      { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '70', min: 30, max: 300 },
      { key: 'height', label: 'Height (cm)', type: 'number', placeholder: '175', min: 100, max: 250 },
    ],
  },
  {
    id: 2,
    title: 'Your gender',
    subtitle: 'Used for accurate calorie and macro calculations',
    field: 'gender',
    options: [
      { value: 'male', label: 'Male', emoji: '👨' },
      { value: 'female', label: 'Female', emoji: '👩' },
      { value: 'other', label: 'Other', emoji: '🧑' },
    ],
  },
  {
    id: 3,
    title: 'Primary goal',
    subtitle: 'What do you want to achieve?',
    field: 'primaryGoal',
    options: [
      { value: 'lose_fat', label: 'Lose Fat', emoji: '🔥' },
      { value: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
      { value: 'get_fit', label: 'Get Fit', emoji: '⚡' },
      { value: 'improve_endurance', label: 'Improve Endurance', emoji: '🏃' },
    ],
  },
  {
    id: 4,
    title: 'Fitness level',
    subtitle: 'Be honest — we adapt everything to your level',
    field: 'fitnessLevel',
    options: [
      { value: 'beginner', label: 'Beginner', desc: 'Just starting out or returning after a long break' },
      { value: 'intermediate', label: 'Intermediate', desc: 'Training consistently for 6+ months' },
      { value: 'advanced', label: 'Advanced', desc: 'Training seriously for 2+ years' },
    ],
  },
  {
    id: 5,
    title: 'Where do you train?',
    subtitle: 'Your workouts will be adapted to your available equipment',
    field: 'trainingLocation',
    options: [
      { value: 'home_no_equipment', label: 'Home — No Equipment', emoji: '🏠' },
      { value: 'home_with_equipment', label: 'Home — With Equipment', emoji: '🏋️' },
      { value: 'gym', label: 'Gym', emoji: '🏟️' },
      { value: 'mixed', label: 'Mixed', emoji: '🔄' },
    ],
  },
  {
    id: 6,
    title: 'Health & restrictions',
    subtitle: 'Any injuries, allergies, or dietary restrictions? (optional)',
    fields: [
      { key: 'injuries', label: 'Injuries or physical limitations', type: 'text', placeholder: 'e.g. bad knees, lower back pain (or leave empty)' },
      { key: 'allergies', label: 'Food allergies', type: 'text', placeholder: 'e.g. nuts, dairy (or leave empty)' },
      { key: 'dietaryRestrictions', label: 'Dietary restrictions', type: 'text', placeholder: 'e.g. vegetarian, halal (or leave empty)' },
    ],
  },
  {
    id: 7,
    title: 'Your schedule',
    subtitle: 'Final step — tell us about your weekly schedule',
    fields: [
      { key: 'trainingDaysPerWeek', label: 'Training days per week', type: 'number', placeholder: '4', min: 1, max: 7 },
      { key: 'wakeUpTime', label: 'Wake up time', type: 'time', placeholder: '07:00' },
      { key: 'sleepTime', label: 'Bedtime', type: 'time', placeholder: '23:00' },
    ],
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age: '', weight: '', height: '', gender: '',
    primaryGoal: '', fitnessLevel: '', trainingLocation: '',
    injuries: '', allergies: '', dietaryRestrictions: '',
    trainingDaysPerWeek: '4', wakeUpTime: '07:00', sleepTime: '23:00',
  });
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const current = steps[step];

  const isStepValid = () => {
    if (current.fields) {
      return current.fields.every((f) => {
        if (f.key === 'injuries' || f.key === 'allergies' || f.key === 'dietaryRestrictions') return true;
        return form[f.key] !== '';
      });
    }
    if (current.field) return form[current.field] !== '';
    return true;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        trainingDaysPerWeek: Number(form.trainingDaysPerWeek),
      };
      await profileAPI.save(payload);
      updateUser({ onboardingCompleted: true });
      toast.success('Profile saved! Generating your personalized plans...');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg">Persona AI Trainer</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-1">{current.title}</h2>
          <p className="text-gray-400 text-sm mb-6">{current.subtitle}</p>

          {/* Text/number fields */}
          {current.fields && (
            <div className="space-y-4">
              {current.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    placeholder={f.placeholder}
                    min={f.min}
                    max={f.max}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Option cards */}
          {current.field && (
            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, [current.field]: opt.value })}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4
                    ${form[current.field] === opt.value
                      ? 'border-primary-500/60 bg-primary-900/20 text-white'
                      : 'border-white/10 bg-dark-700/40 text-gray-300 hover:border-primary-700/40 hover:bg-dark-700/60'
                    }`}
                >
                  {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                  <div className="flex-1">
                    <p className="font-semibold">{opt.label}</p>
                    {opt.desc && <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>}
                  </div>
                  {form[current.field] === opt.value && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2 px-6">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="btn-primary flex items-center gap-2 px-8"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {loading ? 'Saving...' : (<>Start Training <Zap size={18} /></>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
