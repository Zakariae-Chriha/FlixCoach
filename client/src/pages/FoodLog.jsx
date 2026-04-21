import { useState, useEffect, useRef } from 'react';
import { logsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, BookOpen, TrendingUp, Camera, X, Sparkles, AlertCircle } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealEmojis = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function FoodLog() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', quantity: '100g', protein: '', carbs: '', fats: '', calories: '', mealTime: 'breakfast',
  });
  const [submitting, setSubmitting] = useState(false);

  // Photo scan state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    logsAPI.getToday()
      .then((r) => setLog(r.data.log))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setScanResult(null);
  };

  const handleScanPhoto = async () => {
    if (!photoFile) return;
    setScanning(true);
    try {
      const r = await logsAPI.analyzePhoto(photoFile);
      const data = r.data.data;
      setScanResult(data);
      setForm(f => ({
        ...f,
        name: data.name || f.name,
        quantity: data.quantity || f.quantity,
        calories: data.calories || '',
        protein: data.protein || '',
        carbs: data.carbs || '',
        fats: data.fats || '',
      }));
      setShowForm(true);
      toast.success('Food analyzed! Check the values below.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not analyze photo');
    } finally {
      setScanning(false);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFood = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await logsAPI.logFood({
        ...form,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fats: Number(form.fats) || 0,
        calories: Number(form.calories) || 0,
      });
      setLog(r.data.log);
      setForm({ name: '', quantity: '100g', protein: '', carbs: '', fats: '', calories: '', mealTime: 'breakfast' });
      setShowForm(false);
      clearPhoto();
      toast.success('Food logged!');
    } catch { toast.error('Failed to log food'); }
    finally { setSubmitting(false); }
  };

  const removeFood = async (id) => {
    try {
      const r = await logsAPI.removeFood(id);
      setLog(r.data.log);
      toast.success('Entry removed');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );

  const entriesByMeal = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = log?.foodEntries?.filter((e) => e.mealTime === type) || [];
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Food Log</h1>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all font-semibold">
            <Camera size={16} /> Scan Food
          </button>
          <button onClick={() => { setShowForm(!showForm); clearPhoto(); }} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
            <Plus size={16} /> Log Food
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={handlePhotoSelect} />
      </div>

      {/* Photo preview + scan */}
      {photoPreview && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" /> AI Meal Scanner
            </p>
            <button onClick={clearPhoto} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-dark-600 transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-dark-700 max-h-64">
            <img src={photoPreview} alt="meal" className="w-full object-cover max-h-64" />
            {scanning && (
              <div className="absolute inset-0 bg-dark-900/70 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full border-4 border-purple-800 border-t-purple-400 animate-spin" />
                <p className="text-sm text-purple-300 font-medium">Analyzing your meal...</p>
              </div>
            )}
          </div>

          {scanResult && (
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={11} /> AI Result
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  scanResult.confidence === 'high' ? 'bg-green-900/40 text-green-400' :
                  scanResult.confidence === 'medium' ? 'bg-yellow-900/40 text-yellow-400' :
                  'bg-red-900/40 text-red-400'
                }`}>{scanResult.confidence} confidence</span>
              </p>
              <p className="text-white font-semibold">{scanResult.name} — {scanResult.quantity}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span className="text-yellow-400 font-medium">{scanResult.calories} kcal</span>
                <span>{scanResult.protein}g protein</span>
                <span>{scanResult.carbs}g carbs</span>
                <span>{scanResult.fats}g fats</span>
              </div>
              {scanResult.notes && (
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />{scanResult.notes}
                </p>
              )}
              <p className="text-xs text-gray-500">Values auto-filled below — adjust if needed before saving.</p>
            </div>
          )}

          {!scanResult && !scanning && (
            <button onClick={handleScanPhoto}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              <Sparkles size={16} /> Analyze with AI
            </button>
          )}
        </div>
      )}

      {/* Daily totals */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-400" /> Today's Totals
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Calories', value: log?.totalCalories || 0, unit: 'kcal', color: 'text-yellow-400' },
            { label: 'Protein',  value: log?.totalProtein  || 0, unit: 'g',    color: 'text-primary-400' },
            { label: 'Carbs',    value: log?.totalCarbs    || 0, unit: 'g',    color: 'text-green-400' },
            { label: 'Fats',     value: log?.totalFats     || 0, unit: 'g',    color: 'text-orange-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="text-center bg-dark-700/50 rounded-xl p-3">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{unit}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {log?.foodAnalysis && (
          <div className="mt-4 p-3 bg-primary-900/20 border border-primary-800/20 rounded-xl">
            <p className="text-xs font-semibold text-primary-400 mb-1">AI Analysis</p>
            <p className="text-sm text-gray-300 leading-relaxed">{log.foodAnalysis}</p>
          </div>
        )}
      </div>

      {/* Add food form */}
      {showForm && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            Add Food Entry
            {scanResult && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-400 border border-purple-800/30 flex items-center gap-1"><Sparkles size={10} /> AI filled</span>}
          </h3>
          <form onSubmit={addFood} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Food name *</label>
                <input className="input-field text-sm" placeholder="e.g. Chicken breast" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                <input className="input-field text-sm" placeholder="e.g. 150g" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Meal time</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, mealTime: t })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all
                      ${form.mealTime === t ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
                    {mealEmojis[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {['calories', 'protein', 'carbs', 'fats'].map((macro) => (
                <div key={macro}>
                  <label className="block text-xs text-gray-400 mb-1 capitalize">{macro} {macro === 'calories' ? '(kcal)' : '(g)'}</label>
                  <input type="number" min="0" className="input-field text-sm" placeholder="0"
                    value={form[macro]} onChange={(e) => setForm({ ...form, [macro]: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting || !form.name} className="btn-primary flex-1">
                {submitting ? 'Adding...' : 'Add Entry'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); clearPhoto(); }} className="btn-secondary px-4">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meals by type */}
      {MEAL_TYPES.map((type) => (
        <div key={type} className="glass-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 capitalize">
            {mealEmojis[type]} {type}
            {entriesByMeal[type].length > 0 && (
              <span className="text-xs text-gray-500">
                ({entriesByMeal[type].reduce((s, e) => s + (e.calories || 0), 0)} kcal)
              </span>
            )}
          </h3>
          {entriesByMeal[type].length === 0 ? (
            <p className="text-gray-500 text-sm">Nothing logged yet</p>
          ) : (
            <div className="space-y-2">
              {entriesByMeal[type].map((entry) => (
                <div key={entry._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                  <div>
                    <p className="text-sm font-medium text-white">{entry.name}</p>
                    <p className="text-xs text-gray-500">{entry.quantity} · {entry.calories} kcal · {entry.protein}g P · {entry.carbs}g C · {entry.fats}g F</p>
                  </div>
                  <button onClick={() => removeFood(entry._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {(!log?.foodEntries?.length && !showForm && !photoPreview) && (
        <div className="text-center py-8">
          <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Start logging your meals to track progress!</p>
          <p className="text-gray-600 text-sm mt-1">Tip: Use <span className="text-purple-400">Scan Food</span> to let AI read your plate 📸</p>
        </div>
      )}
    </div>
  );
}
