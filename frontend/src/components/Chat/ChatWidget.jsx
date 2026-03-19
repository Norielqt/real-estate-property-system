import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { propertiesApi } from '../../api/index.js';
import { imgUrl } from '../../utils/imgUrl.js';

// ─── Intent helpers ──────────────────────────────────────────────────────────
const CITIES = ['quezon city', 'makati', 'taguig', 'bgc', 'cebu', 'davao', 'baguio', 'boracay', 'palawan', 'iloilo', 'tagaytay', 'alabang', 'muntinlupa', 'mandaluyong', 'pasig', 'pasay', 'las piñas', 'lapu-lapu', 'nasugbu', 'el nido', 'general trias'];
const TYPES  = ['house', 'condo', 'apartment', 'studio', 'villa', 'land', 'commercial'];

function parse(text) {
  const t = text.toLowerCase();
  const city = CITIES.find((c) => t.includes(c)) ?? null;
  const type = TYPES.find((tp) => t.includes(tp)) ?? null;
  const listing_type = t.includes('rent') ? 'rent' : t.includes('sale') || t.includes('buy') ? 'sale' : null;

  const priceMatch = t.match(/(\d[\d,]*)\s*(k|m|million|thousand)?/);
  let max_price = null;
  if (priceMatch) {
    let v = parseFloat(priceMatch[1].replace(/,/g, ''));
    const suffix = priceMatch[2];
    if (suffix === 'k' || suffix === 'thousand') v *= 1_000;
    if (suffix === 'm' || suffix === 'million') v *= 1_000_000;
    if (v >= 1000) max_price = v;
  }

  return { city, type, listing_type, max_price };
}

// ─── FAQ answers ─────────────────────────────────────────────────────────────
const FAQ = [
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    answer: () => "Hi there! 👋 I'm your real estate assistant. You can ask me to find properties, or ask about how the platform works. How can I help?",
  },
  {
    patterns: ['how do i book', 'book a viewing', 'schedule', 'visit'],
    answer: () => "To book a viewing, open any property listing and fill in the **Request a Viewing** form on the right side. You'll need to be signed in first.",
  },
  {
    patterns: ['how do i list', 'post a property', 'add property', 'sell my'],
    answer: () => 'Sign in, then click **List a Property** in the navigation bar. Fill in the property details, upload photos, and publish.',
  },
  {
    patterns: ['how to register', 'create account', 'sign up'],
    answer: () => 'Click **Get Started** on the homepage or go to [Register](/register). It only takes a few seconds.',
  },
  {
    patterns: ['forgot password', 'reset password'],
    answer: () => 'Password reset is not yet available in the demo. For now, use the demo credentials: `owner@realestate.com` / `password`.',
  },
  {
    patterns: ['contact', 'support', 'help'],
    answer: () => "I'm here to help! Ask me anything about finding or listing properties.",
  },
  {
    patterns: ['what types', 'property types', 'categories'],
    answer: () => 'We have: **House**, **Condo**, **Apartment**, **Studio**, **Villa**, **Land**, and **Commercial** listings — both for sale and for rent.',
  },
  {
    patterns: ['featured', 'best', 'popular', 'recommended'],
    answer: () => 'Check the homepage for featured listings, or browse [All Properties](/properties) and sort by newest.',
  },
  {
    patterns: ['map', 'location', 'explore'],
    answer: () => 'Use the [Explore on Map](/map) page to browse properties visually. Pan and zoom to any city in the Philippines.',
  },
  {
    patterns: ['price', 'how much', 'cost', 'cheap', 'affordable', 'expensive', 'luxury'],
    answer: () => 'Prices range from under ₱3M for studios to ₱35M+ for beachfront villas. Use the filter on [Listings](/properties) to set your budget.',
  },
  {
    patterns: ['thank', 'thanks', 'salamat'],
    answer: () => "You're welcome! 😊 Let me know if you need anything else.",
  },
  {
    patterns: ['bye', 'goodbye', 'see you'],
    answer: () => 'Goodbye! Feel free to come back anytime. 🏠',
  },
];

function faqAnswer(text) {
  const t = text.toLowerCase();
  for (const item of FAQ) {
    if (item.patterns.some((p) => t.includes(p))) return item.answer();
  }
  return null;
}

// ─── Message renderer ─────────────────────────────────────────────────────────
function MsgText({ text }) {
  // Render **bold**, [link](href) inline
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <Link key={i} to={link[2]} className="chat-link">{link[1]}</Link>;
        return p;
      })}
    </span>
  );
}

function PropertyResult({ p }) {
  const fmt = (price, lt) => {
    const s = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(price);
    return lt === 'rent' ? `${s}/mo` : s;
  };
  return (
    <Link to={`/properties/${p.id}`} className="chat-prop-card">
      <img src={imgUrl(p.cover_image ?? p.images?.[0]?.path ?? null)} alt={p.title} className="chat-prop-thumb" />
      <div className="chat-prop-info">
        <div className="chat-prop-price">{fmt(p.price, p.listing_type)}</div>
        <div className="chat-prop-title">{p.title}</div>
        <div className="chat-prop-loc">{p.city}, {p.state}</div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your real estate assistant 🏠 Ask me to find properties, or type 'help' to see what I can do.", type: 'text' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const addMsg = (msg) => setMessages((prev) => [...prev, msg]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addMsg({ from: 'user', text, type: 'text' });

    // FAQ check first
    const faq = faqAnswer(text);
    if (faq) {
      setTimeout(() => addMsg({ from: 'bot', text: faq, type: 'text' }), 300);
      return;
    }

    // Check help intent
    if (text.toLowerCase().includes('help') || text.toLowerCase() === '?') {
      setTimeout(() => addMsg({
        from: 'bot',
        text: "Here's what you can ask me:\n• **Find properties** — e.g. 'condo for rent in Makati'\n• **Browse by type** — 'show houses for sale'\n• **Budget search** — 'apartment under 5 million'\n• **Platform help** — 'how do I book a viewing?'\n• **Map** — 'show map'",
        type: 'text',
      }), 300);
      return;
    }

    // Property search intent
    const { city, type, listing_type, max_price } = parse(text);
    const hasIntent = city || type || listing_type || max_price;

    if (hasIntent) {
      setLoading(true);
      addMsg({ from: 'bot', text: 'Searching properties…', type: 'text', temp: true });
      try {
        const params = { per_page: 4 };
        if (city)         params.city         = city;
        if (type)         params.type         = type;
        if (listing_type) params.listing_type = listing_type;
        if (max_price)    params.max_price    = max_price;

        const res = await propertiesApi.publicList(params);
        const results = res.data?.data ?? [];

        setMessages((prev) => prev.filter((m) => !m.temp));

        if (results.length === 0) {
          addMsg({ from: 'bot', text: "I couldn't find any properties matching that. Try different filters or browse [All Listings](/properties).", type: 'text' });
        } else {
          addMsg({ from: 'bot', text: `Found **${res.data?.total ?? results.length}** propert${results.length === 1 ? 'y' : 'ies'}. Here are the top results:`, type: 'text' });
          addMsg({ from: 'bot', type: 'results', results });
          if ((res.data?.total ?? 0) > 4) {
            const qs = new URLSearchParams();
            if (city)         qs.set('city', city);
            if (type)         qs.set('type', type);
            if (listing_type) qs.set('listing_type', listing_type);
            addMsg({ from: 'bot', text: `[See all ${res.data.total} results →](/properties?${qs})`, type: 'text' });
          }
        }
      } catch {
        setMessages((prev) => prev.filter((m) => !m.temp));
        addMsg({ from: 'bot', text: 'Something went wrong. Please try again.', type: 'text' });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback
    setTimeout(() => addMsg({
      from: 'bot',
      text: "I'm not sure I understood that. Try asking something like:\n• 'condo for rent in BGC'\n• 'houses for sale under 10 million'\n• 'how do I book a viewing?'\n\nOr type **help** for more options.",
      type: 'text',
    }), 300);
  };

  return (
    <>
      {/* Floating button */}
      <button className={`chat-fab ${open ? 'chat-fab-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Open chat">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar"><Bot size={18} /></div>
            <div>
              <div className="chat-header-title">Property Assistant</div>
              <div className="chat-header-sub">Ask me anything about properties</div>
            </div>
            <button className="chat-header-close" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="chat-avatar-sm"><Bot size={13} /></div>
                )}
                <div className="chat-bubble-wrap">
                  {msg.type === 'results' ? (
                    <div className="chat-results">
                      {msg.results.map((p) => <PropertyResult key={p.id} p={p} />)}
                    </div>
                  ) : (
                    <div className={`chat-bubble ${msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                      {msg.text.split('\n').map((line, j) => (
                        <span key={j}>{j > 0 && <br />}<MsgText text={line} /></span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.from === 'user' && (
                  <div className="chat-avatar-sm chat-avatar-user"><User size={13} /></div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg-bot">
                <div className="chat-avatar-sm"><Bot size={13} /></div>
                <div className="chat-bubble chat-bubble-bot chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="chat-suggestions">
            {['Condo for rent in BGC', 'Houses for sale', 'Properties in Cebu', 'How to book?'].map((s) => (
              <button key={s} className="chat-suggestion-chip" onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about properties…"
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
