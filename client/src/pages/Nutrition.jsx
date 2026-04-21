import { useState, useEffect } from 'react';
import { nutritionAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Salad, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const mealColors = {
  breakfast: 'text-yellow-400 bg-yellow-900/20',
  lunch: 'text-green-400 bg-green-900/20',
  dinner: 'text-blue-400 bg-blue-900/20',
  snack: 'text-purple-400 bg-purple-900/20',
};

function MacroBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}g</span>
      </div>
      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-dark-700/40 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
      >
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${mealColors[meal.type] || mealColors.snack}`}>
          {meal.type}
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-sm text-white">{meal.name}</p>
          <p className="text-xs text-gray-500">{meal.calories} kcal · {meal.protein}g protein</p>
        </div>
        {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 space-y-3 pt-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingredients</p>
            <ul className="space-y-1">
              {meal.ingredients?.map((ing, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span> {ing}
                </li>
              ))}
            </ul>
          </div>
          {meal.preparation && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preparation</p>
              <p className="text-sm text-gray-300 leading-relaxed">{meal.preparation}</p>
            </div>
          )}
          {meal.portionSize && (
            <p className="text-xs text-gray-500">Portion: {meal.portionSize}</p>
          )}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: 'Calories', value: meal.calories, unit: 'kcal' },
              { label: 'Protein', value: meal.protein, unit: 'g' },
              { label: 'Carbs', value: meal.carbs, unit: 'g' },
              { label: 'Fats', value: meal.fats, unit: 'g' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center bg-dark-600/50 rounded-lg p-2">
                <p className="text-sm font-bold text-white">{value}{unit}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nutrition() {
  const [plan, setPlan] = useState(null);
  const [todayMeals, setTodayMeals] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState('today'); // 'today' | 'calendar'

  const loadData = async () => {
    try {
      const [planRes, todayRes] = await Promise.all([
        nutritionAPI.getActive().catch(() => null),
        nutritionAPI.getToday().catch(() => null),
      ]);
      if (planRes) setPlan(planRes.data.plan);
      if (todayRes) {
        setTodayMeals(todayRes.data.meals);
        setDayNumber(todayRes.data.dayNumber);
        setSelectedDay(todayRes.data.dayNumber);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const r = await nutritionAPI.generate();
      setPlan(r.data.plan);
      await loadData();
      toast.success('30-day meal plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate meal plan');
    } finally {
      setGenerating(false);
    }
  };

  const displayDay = selectedDay
    ? plan?.days?.find((d) => d.day === selectedDay)
    : todayMeals;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Nutrition Plan</h1>
          <p className="text-gray-400 text-sm">30-day AI meal plan</p>
        </div>
        <button onClick={generatePlan} disabled={generating} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {plan ? (
        <>
          {/* Targets */}
          <div className="glass-card p-5 grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Daily Calorie Target</p>
              <p className="text-2xl font-black gradient-text">{plan.dailyCalorieTarget} <span className="text-sm font-normal text-gray-400">kcal</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Daily Protein Target</p>
              <p className="text-2xl font-black gradient-text">{plan.dailyProteinTarget} <span className="text-sm font-normal text-gray-400">g</span></p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button onClick={() => setView('today')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'today' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400'}`}>
              Today (Day {dayNumber})
            </button>
            <button onClick={() => setView('calendar')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400'}`}>
              30-Day Calendar
            </button>
          </div>

          {view === 'calendar' && (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {plan.days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => { setSelectedDay(d.day); setView('today'); }}
                  className={`p-2 rounded-xl text-sm font-medium transition-all
                    ${selectedDay === d.day ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
                >
                  {d.day}
                </button>
              ))}
            </div>
          )}

          {view === 'today' && displayDay && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Day {displayDay.day || dayNumber}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">{displayDay.totalCalories} kcal</span>
                  <span className="text-primary-400">{displayDay.totalProtein}g protein</span>
                </div>
              </div>

              {/* Macro bars */}
              {displayDay.totalCalories > 0 && (
                <div className="glass-card p-4 space-y-3">
                  <MacroBar label="Protein" value={displayDay.totalProtein} max={plan.dailyProteinTarget + 50} color="bg-primary-500" />
                  <MacroBar label="Carbs" value={displayDay.totalCarbs} max={300} color="bg-yellow-500" />
                  <MacroBar label="Fats" value={displayDay.totalFats} max={100} color="bg-orange-500" />
                </div>
              )}

              <div className="space-y-3">
                {displayDay.meals?.map((meal, i) => <MealCard key={i} meal={meal} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <Salad size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Meal Plan Yet</h2>
          <p className="text-gray-400 mb-6">Generate your personalized 30-day nutrition plan with recipes, macros, and calorie targets.</p>
          <button onClick={generatePlan} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
            <Zap size={18} /> {generating ? 'Generating (may take ~30s)...' : 'Generate My Meal Plan'}
          </button>
          {generating && (
            <p className="text-xs text-gray-500 mt-4 animate-pulse">Claude AI is crafting your nutrition plan...</p>
          )}
        </div>
      )}
    </div>
  );
}
