import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, ChevronRight, Home, MapPin, DollarSign, Search } from 'lucide-react';
import { propertiesApi } from '../../api/index.js';
import { imgUrl } from '../../utils/imgUrl.js';

// ─── Intent Engine ────────────────────────────────────────────────────────────
const INTENTS = [
  {
    name: 'greeting',
    patterns: [/^hi\b/i, /^hello\b/i, /^hey\b/i, /^good (morning|afternoon|evening)/i],
  },
  {
    name: 'search_rent',
    patterns: [/for rent/i, /to rent/i, /renting/i, /rent a/i, /monthly/i],
  },
  {
    name: 'search_sale',
    patterns: [/for sale/i, /to buy/i, /buying/i, /purchase/i, /invest/i],
  },
  {
    name: 'search_city',
    patterns: [/in (makati|bgc|taguig|quezon city|cebu|davao|boracay|manila|baguio|pasig|alabang|iloilo|palawan|tagaytay|batangas|cavite)/i],
  },
  {
    name: 'search_type',
    patterns: [/\b(house|condo|apartment|studio|villa|land|commercial)\b/i],
  },
  {
    name: 'price_cheap',
    patterns: [/cheap|affordable|budget|low.?price|inexpensive|below/i],
  },
  {
    name: 'price_luxury',
    patterns: [/luxury|premium|high.?end|expensive|upscale/i],
  },
  {
    name: 'bedrooms',
    patterns: [/(\d+)\s*(bed|bedroom|br)\b/i],
  },
  {
    name: 'featured',
    patterns: [/featured|best|top|popular|recommended/i],
  },
  {
    name: 'help',
    patterns: [/help|what can you|what do you|how do/i],
  },
  {
    name: 'thanks',
    patterns: [/thank|thanks|thx|appreciated/i],
  },
  {
    name: 'bye',
    patterns: [/bye|goodbye|see you|take care/i],
  },
  {
    name: 'list_property',
    patterns: [/list (my|a) property|post (a |my )?property|sell my|add (a |my )?property/i],
  },
  {
    name: 'map',
    patterns: [/map|explore|location|where/i],
  },
  {
    name: 'price_range',
    patterns: [/(\d[\d,]*)\s*(to|-)\s*(\d[\d,]*)/i, /under (\d[\d,]*)/i, /below (\d[\d,]*)/i],
  },
];

function detectIntent(text) {
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      const match = text.match(pattern);
      if (match) return { name: intent.name, match };
    }
  }
  return { name: 'fallback', match: null };
}

function extractFilters(text) {
  const filters = {};

  // listing type
  if (/for rent|to rent|renting|rent a/i.test(text)) filters.listing_type = 'rent';
  if (/for sale|to buy|buying|purchase/i.test(text)) filters.listing_type = 'sale';

  // city
  const cityMatch = text.match(/in\s+(makati|bgc|taguig|quezon city|cebu|davao|boracay|manila|baguio|pasig|alabang|iloilo|palawan|tagaytay)/i);
  if (cityMatch) filters.city = cityMatch[1];

  // type
  const typeMatch = text.match(/\b(house|condo|apartment|studio|villa|land|commercial)\b/i);
  if (typeMatch) filters.type = typeMatch[1].toLowerCase();

  // bedrooms
  const bedMatch = text.match(/(\d+)\s*(bed|bedroom|br)\b/i);
  if (bedMatch) filters.bedrooms = bedMatch[1];

  // price
  const underMatch = text.match(/under\s+(?:php\s*)?([\d,]+)/i) || text.match(/below\s+(?:php\s*)?([\d,]+)/i);
  if (underMatch) filters.max_price = underMatch[1].replace(/,/g, '');
  if (/cheap|affordable|budget/i.test(text)) filters.max_price = 5000000;

  return filters;
}

// ─── Response Builder ─────────────────────────────────────────────────────────
function buildResponse(intent, text, properties) {
  const count = properties?.length ?? 0;

  const responses = {
    greeting: {
      text: "Hello! 👋 I'm your real estate assistant. I can help you find properties, search by city, price range, type, and more. What are you looking for?",
      quickReplies: ['Homes for sale', 'Rentals', 'Search in Makati', 'Featured listings'],
    },
    help: {
      text: "Here's what I can help you with:\n\n• 🏠 Search properties (for rent or sale)\n• 📍 Find by city or location\n• 💰 Filter by budget or price range\n• 🛏 Filter by bedrooms\n• 🏢 Find by type (condo, house, villa...)\n• 🗺 Explore on the map\n\nJust ask naturally — like \"2 bedroom condo in Makati for rent\"!",
      quickReplies: ['Show rentals', 'Show for sale', 'Explore map'],
    },
    search_rent: {
      text: count > 0
        ? `I found ${count} rental propert${count === 1 ? 'y' : 'ies'} for you. Here are the top results:`
        : 'I couldn\'t find any rentals matching your criteria. Try adjusting your search.',
      showResults: true,
      quickReplies: count > 0 ? ['See all rentals', 'Search on map'] : ['Remove filters', 'Show all properties'],
    },
    search_sale: {
      text: count > 0
        ? `Found ${count} propert${count === 1 ? 'y' : 'ies'} for sale. Here are some options:`
        : 'No properties for sale match your criteria right now.',
      showResults: true,
      quickReplies: count > 0 ? ['See all listings', 'Search on map'] : ['Show rentals instead', 'Show all'],
    },
    search_city: {
      text: count > 0
        ? `Here are ${count} propert${count === 1 ? 'y' : 'ies'} in that area:`
        : 'No properties found in that location yet. Try browsing all listings.',
      showResults: true,
      quickReplies: count > 0 ? ['View on map', 'See all'] : ['Browse all cities'],
    },
    search_type: {
      text: count > 0
        ? `Found ${count} matching propert${count === 1 ? 'y' : 'ies'}:`
        : 'No properties of that type found. Want to widen the search?',
      showResults: true,
      quickReplies: ['Show all types', 'For rent', 'For sale'],
    },
    price_cheap: {
      text: count > 0
        ? `Here are ${count} budget-friendly propert${count === 1 ? 'y' : 'ies'}:`
        : 'No budget listings at the moment.',
      showResults: true,
      quickReplies: ['See all listings'],
    },
    price_luxury: {
      text: count > 0
        ? `Here are ${count} premium propert${count === 1 ? 'y' : 'ies'} for you:`
        : 'No luxury listings match right now.',
      showResults: true,
      quickReplies: ['See all listings'],
    },
    bedrooms: {
      text: count > 0
        ? `Found ${count} propert${count === 1 ? 'y' : 'ies'} with that many bedrooms:`
        : 'No properties found with that bedroom count.',
      showResults: true,
      quickReplies: ['See all listings'],
    },
    featured: {
      text: count > 0
        ? `Here are our ${count} featured propert${count === 1 ? 'y' : 'ies'}:`
        : 'No featured properties at the moment.',
      showResults: true,
      quickReplies: ['See all listings'],
    },
    price_range: {
      text: count > 0
        ? `Found ${count} propert${count === 1 ? 'y' : 'ies'} in that price range:`
        : 'No properties in that price range.',
      showResults: true,
    },
    list_property: {
      text: "You can list your property by going to **My Listings → Add Property**. You'll need to be signed in first.",
      quickReplies: ['Go to My Listings', 'Sign in'],
      action: { label: 'List a Property', url: '/my-listings/new' },
    },
    map: {
      text: 'You can explore all properties on an interactive map — zoom and pan to browse properties by location!',
      quickReplies: ['Open Map'],
      action: { label: 'Explore on Map', url: '/map' },
    },
    thanks: {
      text: "You're welcome! 😊 Is there anything else I can help you with?",
      quickReplies: ['Search properties', 'Explore map', 'Done, thanks!'],
    },
    bye: {
      text: 'Goodbye! 👋 Feel free to come back anytime. Happy house hunting!',
      quickReplies: [],
    },
    fallback: {
      text: "I'm not sure I understood that. Try asking something like:\n• \"Show me condos in BGC\"\n• \"Affordable houses for rent\"\n• \"3 bedroom villa for sale\"",
      quickReplies: ['Show all properties', 'Featured listings', 'Explore map', 'Help'],
    },
  };

  return responses[intent] ?? responses.fallback;
}

// ─── Property Result Card ─────────────────────────────────────────────────────
function ChatPropertyCard({ property, navigate }) {
  const fmt = (p) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(p);
  return (
    <button
      className="chat-property-card"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      <img src={imgUrl(property.cover_image ?? property.images?.[0]?.path ?? null)} alt={property.title} />
      <div className="chat-property-info">
        <div className="chat-property-price">
          {fmt(property.price)}{property.listing_type === 'rent' && <span>/mo</span>}
        </div>
        <div className="chat-property-title">{property.title}</div>
        <div className="chat-property-location">
          <MapPin size={10} />{property.city}, {property.state}
        </div>
      </div>
      <ChevronRight size={14} className="chat-property-arrow" />
    </button>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Hi there! 👋 I'm your real estate assistant. Ask me anything — \"condos for rent in Makati\", \"houses under ₱5M\", or just say \"help\"!",
      quickReplies: ['Homes for sale', 'Rentals', 'Featured listings', 'Help'],
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    setInput('');

    // User message
    addMessage({ from: 'user', text: trimmed });
    setTyping(true);

    // Detect intent & extract filters
    const { name: intent } = detectIntent(trimmed);
    const filters = extractFilters(trimmed);

    // Fetch properties if needed
    let properties = null;
    const searchIntents = ['search_rent', 'search_sale', 'search_city', 'search_type', 'price_cheap', 'price_luxury', 'bedrooms', 'featured', 'price_range'];

    if (searchIntents.includes(intent)) {
      try {
        const params = { ...filters, per_page: 3 };
        if (intent === 'featured') params.is_featured = 1;
        if (intent === 'price_cheap') { params.max_price = 5000000; }
        if (intent === 'price_luxury') { params.min_price = 15000000; }
        const res = await propertiesApi.publicList(params);
        properties = res.data?.data ?? [];
      } catch {
        properties = [];
      }
    }

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    setTyping(false);

    const response = buildResponse(intent, trimmed, properties);

    addMessage({
      from: 'bot',
      text: response.text,
      properties: response.showResults ? properties : null,
      quickReplies: response.quickReplies,
      action: response.action,
    });
  }, [input, addMessage]);

  const handleQuickReply = (reply) => {
    const routeMap = {
      'See all rentals': '/properties?listing_type=rent',
      'See all listings': '/properties',
      'See all': '/properties',
      'Browse all cities': '/properties',
      'Show all properties': '/properties',
      'Show rentals': '/properties?listing_type=rent',
      'Show for sale': '/properties?listing_type=sale',
      'Show all': '/properties',
      'Open Map': '/map',
      'Search on map': '/map',
      'View on map': '/map',
      'Explore map': '/map',
      'Go to My Listings': '/my-listings/new',
      'Sign in': '/login',
    };
    if (routeMap[reply]) {
      navigate(routeMap[reply]);
      setOpen(false);
      return;
    }
    handleSend(reply);
  };

  const formatText = (text) =>
    text.split('\n').map((line, i) => (
      <span key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}<br /></span>
    ));

  return (
    <>
      {/* Floating button */}
      <button
        className={`chatbot-fab ${open ? 'chatbot-fab-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chatbot-fab-dot" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">
              <Bot size={18} />
            </div>
            <div>
              <div className="chatbot-header-name">Property Assistant</div>
              <div className="chatbot-header-status">
                <span className="chatbot-status-dot" /> Online
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg-row ${msg.from === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
                {msg.from === 'bot' && (
                  <div className="chatbot-bot-avatar"><Bot size={13} /></div>
                )}
                <div className="chatbot-bubble-wrap">
                  <div className={`chatbot-bubble ${msg.from === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'}`}>
                    {formatText(msg.text)}
                  </div>

                  {/* Property results */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="chatbot-results">
                      {msg.properties.map((p) => (
                        <ChatPropertyCard key={p.id} property={p} navigate={(url) => { navigate(url); setOpen(false); }} />
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  {msg.action && (
                    <button
                      className="chatbot-action-btn"
                      onClick={() => { navigate(msg.action.url); setOpen(false); }}
                    >
                      {msg.action.label} <ChevronRight size={13} />
                    </button>
                  )}

                  {/* Quick replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="chatbot-quick-replies">
                      {msg.quickReplies.map((r) => (
                        <button key={r} className="chatbot-quick-reply" onClick={() => handleQuickReply(r)}>
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chatbot-msg-row chatbot-msg-bot">
                <div className="chatbot-bot-avatar"><Bot size={13} /></div>
                <div className="chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            className="chatbot-input-row"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input
              ref={inputRef}
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about properties…"
              autoComplete="off"
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={!input.trim()}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
