import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { X, Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2, Loader } from 'lucide-react';

export default function VideoCall({ booking, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    async function getRoom() {
      try {
        const r = await api.post('/video/room', { bookingId: booking._id });
        setRoomUrl(r.data.roomUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create video room');
        toast.error(err.response?.data?.message || 'Video call unavailable');
      } finally {
        setLoading(false);
      }
    }
    getRoom();
  }, [booking._id]);

  const iframeSrc = roomUrl || null;

  return (
    <div className={`fixed z-[70] flex flex-col bg-dark-900 border border-white/10 shadow-2xl transition-all duration-300
      ${fullscreen
        ? 'inset-0 rounded-none'
        : 'bottom-0 right-0 left-0 h-[55vh] rounded-t-2xl sm:bottom-4 sm:right-4 sm:left-auto sm:w-[480px] sm:h-[380px] sm:rounded-2xl'}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0 bg-dark-800/80 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-sm font-bold text-white">Live Session</span>
          {booking.coachName && <span className="text-xs text-gray-400">with {booking.coachName}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setFullscreen(f => !f)}
            className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            {fullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-900/40 hover:bg-red-600 flex items-center justify-center text-red-400 hover:text-white transition-all">
            <X size={14}/>
          </button>
        </div>
      </div>

      {/* Video frame */}
      <div className="flex-1 relative overflow-hidden rounded-b-2xl bg-dark-900">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader size={28} className="text-orange-400 animate-spin"/>
            <p className="text-sm text-gray-400">Connecting to session...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-900/30 flex items-center justify-center">
              <VideoOff size={24} className="text-red-400"/>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Video call unavailable</p>
              <p className="text-sm text-gray-400">{error}</p>
              {error.includes('DAILY_API_KEY') && (
                <p className="text-xs text-orange-400 mt-2">
                  Get a free API key at <strong>daily.co</strong> and add it to server/.env
                </p>
              )}
            </div>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-all">
              Close
            </button>
          </div>
        )}

        {iframeSrc && !error && (
          <iframe
            ref={frameRef}
            src={iframeSrc}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen={true}
          />
        )}
      </div>
    </div>
  );
}
