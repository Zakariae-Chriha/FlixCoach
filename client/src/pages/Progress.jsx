import { useState, useEffect, useRef } from 'react';
import { progressAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Camera, Upload, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Progress() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    progressAPI.getAll()
      .then((r) => setPhotos(r.data.photos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const r = await progressAPI.upload(formData);
      setPhotos((prev) => [r.data.photo, ...prev]);
      setSelectedPhoto(r.data.photo);
      toast.success('Photo uploaded and analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" /></div>;

  const display = selectedPhoto || photos[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Progress Photos</h1>
          <p className="text-gray-400 text-sm">Monthly photo analysis with AI</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Upload size={16} /> {uploading ? 'Analyzing...' : 'Upload Photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      </div>

      {photos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Camera size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Photos Yet</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Upload your first progress photo to get AI-powered analysis of your transformation!
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Camera size={18} /> Upload Progress Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo gallery */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">History</h3>
            {photos.map((photo) => (
              <button
                key={photo._id}
                onClick={() => setSelectedPhoto(photo)}
                className={`w-full glass-card p-3 flex items-center gap-3 text-left transition-all hover:border-primary-700/40
                  ${display?._id === photo._id ? 'border-primary-600/50 bg-primary-900/10' : ''}`}
              >
                <img
                  src={photo.imageUrl}
                  alt="Progress"
                  className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => { e.target.src = ''; e.target.className = 'w-16 h-16 bg-dark-600 rounded-xl flex-shrink-0'; }}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {new Date(photo.uploadedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">Month {photo.month} • {photo.year}</p>
                  {photo.analysis?.onTrack !== undefined && (
                    <span className={`text-xs ${photo.analysis.onTrack ? 'text-green-400' : 'text-yellow-400'}`}>
                      {photo.analysis.onTrack ? '✓ On track' : '! Needs work'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Analysis */}
          {display && (
            <div className="lg:col-span-2 space-y-4">
              <img
                src={display.imageUrl}
                alt="Progress photo"
                className="w-full max-h-72 object-cover rounded-2xl"
                onError={(e) => e.target.style.display = 'none'}
              />

              {display.analysis && (
                <>
                  {display.analysis.improvements?.length > 0 && (
                    <div className="glass-card p-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-green-400">
                        <CheckCircle size={16} /> What's Improved
                      </h4>
                      <ul className="space-y-1.5">
                        {display.analysis.improvements.map((item, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {display.analysis.needsWork?.length > 0 && (
                    <div className="glass-card p-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-yellow-400">
                        <AlertTriangle size={16} /> Needs More Work
                      </h4>
                      <ul className="space-y-1.5">
                        {display.analysis.needsWork.map((item, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">!</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {display.analysis.nextMonthAdjustments && (
                    <div className="glass-card p-4 border border-primary-800/20">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary-400">
                        <TrendingUp size={16} /> Next Month Plan
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{display.analysis.nextMonthAdjustments}</p>
                    </div>
                  )}

                  {display.analysis.overallFeedback && (
                    <div className="glass-card p-4">
                      <h4 className="font-semibold text-sm text-gray-400 mb-2">Overall Feedback</h4>
                      <p className="text-sm text-gray-200 leading-relaxed">{display.analysis.overallFeedback}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
