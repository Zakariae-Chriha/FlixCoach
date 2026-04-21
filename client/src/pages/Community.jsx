import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, MessageCircle, Trash2, Image, Send, X, Bell, TrendingUp, Users, Zap, Award, Flame, Plus } from 'lucide-react';

const POST_TYPES = [
  { value: 'general',        label: 'General',        icon: '💬', bg: 'from-gray-600 to-gray-700' },
  { value: 'progress',       label: 'Progress',       icon: '📈', bg: 'from-green-600 to-emerald-700' },
  { value: 'achievement',    label: 'Achievement',    icon: '🏅', bg: 'from-yellow-500 to-orange-600' },
  { value: 'activity_recap', label: 'Activity Recap', icon: '🏃', bg: 'from-blue-600 to-cyan-700' },
  { value: 'tip',            label: 'Tip',            icon: '💡', bg: 'from-purple-600 to-violet-700' },
  { value: 'motivation',     label: 'Motivation',     icon: '🔥', bg: 'from-orange-500 to-red-600' },
  { value: 'question',       label: 'Question',       icon: '❓', bg: 'from-pink-600 to-rose-700' },
];

function Avatar({ name, photo, role, size = 'md' }) {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }[size];
  const ring = role === 'coach' ? 'ring-2 ring-green-500/60' : role === 'admin' ? 'ring-2 ring-yellow-500/60' : '';
  const grad = role === 'coach' ? 'from-green-400 to-emerald-600' : role === 'admin' ? 'from-yellow-400 to-orange-500' : 'from-primary-400 to-purple-600';
  return (
    <div className={`${sz} ${ring} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center font-black text-white flex-shrink-0 overflow-hidden`}>
      {photo
        ? <img src={`${API_URL}${photo}`} alt={name} className="w-full h-full object-cover" />
        : name?.charAt(0).toUpperCase()}
    </div>
  );
}

function StoryBar() {
  const stories = [
    { name: 'You', icon: '➕', gradient: 'from-gray-700 to-gray-800', border: 'border-dashed border-gray-600' },
    { name: 'Alex', icon: '🏃', gradient: 'from-orange-500 to-red-600', border: 'border-orange-500' },
    { name: 'Sara', icon: '🧘', gradient: 'from-purple-500 to-pink-600', border: 'border-purple-500' },
    { name: 'Mike', icon: '🥊', gradient: 'from-blue-500 to-cyan-600', border: 'border-blue-500' },
    { name: 'Lisa', icon: '🚴', gradient: 'from-green-500 to-emerald-600', border: 'border-green-500' },
  ];
  return (
    <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
      {stories.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.gradient} border-2 ${s.border} flex items-center justify-center text-xl transition-transform hover:scale-105`}>
            {s.icon}
          </div>
          <span className="text-xs text-gray-400 font-medium">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!content.trim()) { toast.error('Write something first'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('type', type);
      if (photo) fd.append('photo', photo);
      const r = await api.post('/community/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated(r.data.post);
      setContent(''); setType('general'); setPhoto(null); setPreview(null); setOpen(false);
      toast.success('Posted! 🎉');
    } catch { toast.error('Failed to post'); }
    finally { setLoading(false); }
  };

  const typeData = POST_TYPES.find(t => t.value === type);

  return (
    <div className="relative">
      {/* Trigger bar */}
      <div
        onClick={() => setOpen(true)}
        className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:border-primary-600/30 transition-all border border-white/5 group"
      >
        <Avatar name={user?.name} role={user?.role} />
        <div className="flex-1 bg-dark-700/60 rounded-full px-5 py-2.5 text-sm text-gray-500 group-hover:bg-dark-600/60 transition-all">
          Share your progress or motivate the team... 💪
        </div>
        <div className="flex gap-2">
          <span className="text-lg">📸</span>
          <span className="text-lg">🏅</span>
          <span className="text-lg">🔥</span>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-dark-800 sm:rounded-2xl border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="font-bold text-white">Create Post</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-all">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Avatar name={user?.name} role={user?.role} size="lg" />
                <div>
                  <p className="font-bold text-white">{user?.name}</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${typeData.bg} mt-1`}>
                    <span className="text-xs">{typeData.icon}</span>
                    <span className="text-xs font-medium text-white">{typeData.label}</span>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                autoFocus
                className="w-full bg-transparent text-white text-base placeholder-gray-600 outline-none resize-none leading-relaxed"
                placeholder="What's on your mind?"
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
              />

              {/* Photo preview */}
              {preview && (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={preview} alt="preview" className="w-full max-h-56 object-cover" />
                  <button onClick={() => { setPhoto(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/90 transition-all">
                    <X size={13} className="text-white" />
                  </button>
                </div>
              )}

              {/* Post type */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">POST TYPE</p>
                <div className="flex gap-2 flex-wrap">
                  {POST_TYPES.map(t => (
                    <button key={t.value} onClick={() => setType(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1
                        ${type === t.value
                          ? `bg-gradient-to-r ${t.bg} text-white shadow-md`
                          : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
              <button onClick={() => fileRef.current.click()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors px-3 py-2 rounded-xl hover:bg-dark-700">
                <Image size={18} /> Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <button onClick={submit} disabled={loading || !content.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-sm disabled:opacity-40 hover:opacity-90 transition-all shadow-lg shadow-primary-900/40">
                {loading ? '...' : <><Send size={15} /> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUserId, onDelete }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const typeData = POST_TYPES.find(t => t.value === post.type) || POST_TYPES[0];

  const toggleLike = async () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    try { await api.post(`/community/posts/${post._id}/like`); }
    catch { setLiked(l => !l); setLikeCount(c => liked ? c + 1 : c - 1); }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/community/posts/${post._id}/comment`, { content: commentText });
      setComments(p => [...p, r.data.comment]);
      setCommentText('');
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  return (
    <div className="bg-dark-800/80 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={post.authorName} role={post.authorRole} />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-sm">{post.authorName}</p>
              {post.authorRole !== 'user' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${post.authorRole === 'coach' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                  {post.authorRole}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${typeData.bg} text-white text-xs`}>
                {typeData.icon} {typeData.label}
              </span>
              <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {post.author === currentUserId && (
          <button onClick={() => onDelete(post._id)} className="w-8 h-8 rounded-full hover:bg-red-900/20 flex items-center justify-center text-gray-600 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Photo */}
      {post.photo && (
        <div className="w-full">
          <img src={`${API_URL}${post.photo}`} alt="" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="px-4 pt-2 flex gap-2 flex-wrap">
          {post.tags.map(t => <span key={t} className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer">#{t}</span>)}
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5 mt-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike}
            className={`flex items-center gap-1.5 transition-all group ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
            <Heart size={20} className={`transition-transform group-hover:scale-110 ${liked ? 'fill-red-400' : ''}`} />
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
          </button>
          <button onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors">
            <MessageCircle size={20} />
            {comments.length > 0 && <span className="text-sm font-medium">{comments.length}</span>}
          </button>
        </div>
        <span className="text-xs text-gray-600">{likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}` : ''}</span>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {comments.length === 0 && <p className="text-xs text-gray-600 text-center py-2">No comments yet. Be the first!</p>}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2.5">
              <Avatar name={c.authorName} size="sm" />
              <div className="flex-1 bg-dark-700/60 rounded-2xl rounded-tl-sm px-3 py-2">
                <p className="text-xs font-bold text-white">{c.authorName}</p>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 items-center pt-1">
            <Avatar name="You" size="sm" />
            <div className="flex-1 flex items-center gap-2 bg-dark-700/60 rounded-full px-4 py-2 border border-white/5">
              <input
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              {commentText && (
                <button onClick={submitComment} disabled={submitting}
                  className="text-primary-400 hover:text-primary-300 transition-colors font-bold text-xs">
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => { loadFeed(); loadNotifications(); }, []);

  const loadFeed = async () => {
    try { const r = await api.get('/community/feed'); setPosts(r.data.posts); }
    catch { toast.error('Failed to load feed'); }
    finally { setLoading(false); }
  };

  const loadNotifications = async () => {
    try {
      const r = await api.get('/community/notifications');
      setNotifications(r.data.notifications);
      setUnread(r.data.unread);
    } catch { /* silent */ }
  };

  const markRead = async () => {
    await api.patch('/community/notifications/read').catch(() => {});
    setUnread(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-0">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-pink-600/80 to-purple-700/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative px-6 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-orange-300" />
              <span className="text-orange-200 text-sm font-semibold uppercase tracking-widest">FlixCoach</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">Community</h1>
            <p className="text-white/70 text-sm mt-1">Train together · Grow together · Win together</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif) markRead(); }}
                className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all"
              >
                <Bell size={18} className="text-white" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-black shadow-lg">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-14 w-80 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Notifications</p>
                  {notifications.length === 0
                    ? <p className="text-sm text-gray-500 text-center py-6">No notifications yet</p>
                    : notifications.map((n, i) => (
                      <div key={i} className={`flex gap-3 p-2.5 rounded-xl mb-1 ${!n.read ? 'bg-primary-900/20 border border-primary-800/20' : 'hover:bg-dark-700/50'} transition-all`}>
                        <span className="text-xl flex-shrink-0">{n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'activity_join' ? '🏃' : '🔔'}</span>
                        <div>
                          <p className="text-xs text-gray-200 leading-relaxed">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Stats row */}
        <div className="relative flex border-t border-white/10">
          {[
            { icon: '👥', label: 'Members', val: '—' },
            { icon: '🏃', label: 'Activities', val: '—' },
            { icon: '📸', label: 'Posts', val: posts.length },
            { icon: '🔥', label: 'Active Today', val: '—' },
          ].map((s, i) => (
            <div key={i} className="flex-1 py-3 text-center border-r border-white/10 last:border-0">
              <p className="text-white font-black text-lg">{s.val}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-4 mb-4">
        <StoryBar />
      </div>

      {/* Create post */}
      <div className="mb-4">
        <CreatePost onCreated={(p) => setPosts(prev => [p, ...prev])} />
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading community...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏋️</div>
            <p className="text-xl font-black text-white">Start the conversation!</p>
            <p className="text-gray-400 mt-2 text-sm">Be the first to share your progress or inspire others</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} currentUserId={user?._id} onDelete={async (id) => {
              await api.delete(`/community/posts/${id}`).catch(() => {});
              setPosts(p => p.filter(x => x._id !== id));
              toast.success('Deleted');
            }} />
          ))
        )}
      </div>
    </div>
  );
}
