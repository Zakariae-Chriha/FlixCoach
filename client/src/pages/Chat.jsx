import { useState, useEffect, useRef } from 'react';
import { coachAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, Trash2, Zap, User, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'What should I eat after my workout today?',
  'I feel tired and unmotivated, help me!',
  'Can you explain my training program for this week?',
  'Give me a healthy snack idea for right now',
  'How can I improve my sleep quality?',
  'I missed my workout — what should I do?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
        ${isUser ? 'bg-primary-600' : 'bg-gradient-to-br from-primary-500 to-purple-600'}`}>
        {isUser ? <User size={14} className="text-white" /> : <Zap size={14} className="text-white" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-dark-700/80 text-gray-100 border border-white/5 rounded-tl-sm'
          }`}>
          {msg.content}
        </div>
        <span className="text-xs text-gray-600">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    coachAPI.getHistory()
      .then((r) => {
        if (r.data.messages.length === 0) {
          setMessages([{
            role: 'assistant',
            content: `Hey ${user?.name?.split(' ')[0]}! 💪 I'm your personal AI fitness coach, nutritionist, and wellness partner. I'm here to help you crush your goals!\n\nYou can ask me anything — workout advice, meal suggestions, how you're feeling, or just chat. What's on your mind today?`,
            timestamp: new Date(),
          }]);
        } else {
          setMessages(r.data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const r = await coachAPI.sendMessage(content);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: r.data.message,
        timestamp: new Date(),
      }]);
    } catch (err) {
      toast.error('Coach is unavailable. Check your API key.');
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await coachAPI.clearChat();
      setMessages([{
        role: 'assistant',
        content: `Chat cleared! Fresh start 💪 What can I help you with?`,
        timestamp: new Date(),
      }]);
      toast.success('Chat cleared');
    } catch { toast.error('Failed to clear chat'); }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Coach</h1>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
              Online — Claude AI
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-secondary text-sm py-2 px-3 flex items-center gap-2">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader size={24} className="text-primary-400 animate-spin" />
          </div>
        ) : (
          messages.map((msg, i) => <Message key={i} msg={msg} />)
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap size={14} className="text-white" />
            </div>
            <div className="bg-dark-700/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="flex-shrink-0 text-xs bg-dark-700 border border-white/10 rounded-full px-3 py-1.5 text-gray-300 hover:text-white hover:border-primary-700/50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach anything..."
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed max-h-32"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center
            hover:from-primary-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
    </div>
  );
}
