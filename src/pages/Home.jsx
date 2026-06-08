import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import './Home.css';

// â”€â”€ Countdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useCountdown(target) {
  const calc = () => {
    const d = new Date(target) - new Date();
    if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return { d: Math.floor(d / 86400000), h: Math.floor((d % 86400000) / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

function CDBox({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 42, fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>{String(value).padStart(2, '0')}</div>
      <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

// â”€â”€ Ad Slider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ADS Ä‘Æ°á»£c load Ä‘á»™ng tá»« API

function AdSlider({ events = [] }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef();
  const nav = useNavigate();

  const COLORS = ['#a855f7','#3b82f6','#f59e0b','#10b981','#ef4444','#06b6d4'];
  const BGRADS = [
    'linear-gradient(135deg,#1a0a3e,#6b2fa0)',
    'linear-gradient(135deg,#0a1a3e,#1a5c8b)',
    'linear-gradient(135deg,#1a1a0a,#5c4a0a)',
    'linear-gradient(135deg,#0a2a1a,#1a5c3a)',
  ];

  const ads = events.length > 0 ? events.map((e, i) => ({
    bg: BGRADS[i % BGRADS.length],
    color: COLORS[i % COLORS.length],
    tag: (e.category_name || e.type || 'Sá»° KIá»†N').toUpperCase(),
    title: e.title || e.name,
    sub: e.description ? e.description.slice(0, 80) + '...' : `GiÃ¡ tá»« ${new Intl.NumberFormat('vi-VN').format(e.min_price || e.price || 0)}Ä‘`,
    price: e.min_price || e.price || 0,
    thumbnail: e.thumbnail || e.image_url,
    slug: e.slug || e.id,
  })) : [
    { bg: BGRADS[0], color: COLORS[0], tag: 'Ná»”I Báº¬T', title: 'KhÃ¡m phÃ¡ sá»± kiá»‡n Ä‘áº·c sáº¯c', sub: 'HÃ ng nghÃ¬n sá»± kiá»‡n cháº¥t lÆ°á»£ng Ä‘ang chá» báº¡n', price: 0, thumbnail: null, slug: null },
  ];

  const go = useCallback((next) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIdx(next); setAnimating(false); }, 300);
  }, [animating]);

  useEffect(() => {
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => go((idx + 1) % ads.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [idx, go, ads.length]);

  const ad = ads[idx] || ads[0];

  return (
    <section style={{ background: 'var(--dark)', padding: '0 48px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
      <div style={{ background: ad.bg, borderRadius: 6, padding: '40px 48px', position: 'relative', overflow: 'hidden', opacity: animating ? 0 : 1, transition: 'opacity .3s ease', minHeight: 160 }}>
        {/* Thumbnail background */}
        {ad.thumbnail && <img src={ad.thumbnail} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.15, pointerEvents:'none' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.7) 40%, transparent)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: ad.color, fontWeight: 700, marginBottom: 10 }}>â— {ad.tag}</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 30, fontWeight: 700, color: '#faf7f2', marginBottom: 8, lineHeight: 1.2 }}>{ad.title}</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>{ad.sub}</p>
          {ad.price > 0 && <div style={{ fontSize: 20, fontFamily: 'Cormorant Garamond,serif', color: ad.color, marginBottom: 16, fontWeight: 300 }}>Tá»« {new Intl.NumberFormat('vi-VN').format(ad.price)}Ä‘</div>}
          <button onClick={() => ad.slug ? nav(`/events/${ad.slug}`) : nav('/events')}
            style={{ background: ad.color, border: 'none', color: '#fff', padding: '10px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit' }}>
            Äáº·t vÃ© ngay â†’
          </button>
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 16, right: 20, display: 'flex', gap: 6 }}>
          {ads.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, background: i === idx ? ad.color : 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
          ))}
        </div>
        {ads.length > 1 && [[-1, 'â€¹', 'left'], [1, 'â€º', 'right']].map(([dir, icon, pos]) => (
          <button key={pos} onClick={() => go((idx + ads.length + dir) % ads.length)}
            style={{ position: 'absolute', top: '50%', [pos]: 12, transform: 'translateY(-50%)', background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.6)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </button>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: 'ðŸŽ«', title: 'Äáº·t vÃ© tá»©c thÃ¬', desc: 'XÃ¡c nháº­n ngay láº­p tá»©c, mÃ£ vÃ© gá»­i trong vÃ i giÃ¢y', detail: { heading: 'Äáº·t vÃ© nhanh chÃ³ng & tiá»‡n lá»£i', points: ['Chá»n sá»± kiá»‡n, chá»n loáº¡i vÃ©, Ä‘áº·t vÃ© chá»‰ 3 bÆ°á»›c', 'Há»‡ thá»‘ng xá»­ lÃ½ Ä‘Æ¡n hÃ ng ngay láº­p tá»©c', 'MÃ£ vÃ© duy nháº¥t táº¡o tá»± Ä‘á»™ng, thÃ´ng bÃ¡o ngay', 'Há»— trá»£ tá»‘i Ä‘a 5 vÃ© má»—i láº§n Ä‘áº·t', 'Lá»‹ch sá»­ Ä‘áº·t vÃ© lÆ°u Ä‘áº§y Ä‘á»§ trong tÃ i khoáº£n'] } },
  { icon: 'ðŸª‘', title: 'Chá»n chá»— ngá»“i', desc: 'SÆ¡ Ä‘á»“ chá»— ngá»“i trá»±c quan, chá»n vá»‹ trÃ­ yÃªu thÃ­ch', detail: { heading: 'SÆ¡ Ä‘á»“ chá»— ngá»“i trá»±c quan', points: ['Hiá»ƒn thá»‹ theo thá»i gian thá»±c', 'PhÃ¢n biá»‡t gháº¿ trá»‘ng/Ä‘Ã£ Ä‘áº·t/Ä‘ang chá»n rÃµ rÃ ng', 'Click Ä‘á»ƒ chá»n hoáº·c bá» chá»n linh hoáº¡t', 'Tá»± Ä‘á»™ng khÃ³a gháº¿ Ä‘Ã£ chá»n, trÃ¡nh trÃ¹ng láº·p', 'Há»— trá»£ chá»n nhiá»u gháº¿ liÃªn tiáº¿p'] } },
  { icon: 'ðŸ“Š', title: 'Quáº£n lÃ½ thÃ´ng minh', desc: 'Dashboard admin Ä‘áº§y Ä‘á»§ vá»›i bÃ¡o cÃ¡o doanh thu real-time', detail: { heading: 'Dashboard quáº£n trá»‹ máº¡nh máº½', points: ['Tá»•ng quan KPI: doanh thu, vÃ© bÃ¡n, check-in', 'Quáº£n lÃ½ sá»± kiá»‡n: thÃªm, sá»­a, xÃ³a, xuáº¥t báº£n', 'Upload áº£nh sá»± kiá»‡n tá»± Ä‘á»™ng nÃ©n', 'XÃ¡c nháº­n thanh toÃ¡n vÃ  quáº£n lÃ½ Ä‘Æ¡n hÃ ng', 'BÃ¡o cÃ¡o chi tiáº¿t, xuáº¥t CSV'] } },
  { icon: 'ðŸ”', title: 'Báº£o máº­t tuyá»‡t Ä‘á»‘i', desc: 'JWT authentication, phÃ¢n quyá»n chi tiáº¿t, dá»¯ liá»‡u mÃ£ hÃ³a', detail: { heading: 'Há»‡ thá»‘ng báº£o máº­t Ä‘a táº§ng', points: ['JWT Token xÃ¡c thá»±c vá»›i thá»i háº¡n 7 ngÃ y', 'PhÃ¢n quyá»n Admin / Organizer / User rÃµ rÃ ng', 'Máº­t kháº©u mÃ£ hÃ³a bcrypt â€” khÃ´ng giáº£i mÃ£ ngÆ°á»£c', 'Má»i API Ä‘á»u kiá»ƒm tra token trÆ°á»›c khi xá»­ lÃ½', 'Rate limit chá»‘ng brute force Ä‘Äƒng nháº­p'] } },
  { icon: 'ðŸŽŸ', title: 'VÃ© PDF + QR Code', desc: 'Xuáº¥t vÃ© PDF concert-style vá»›i mÃ£ QR check-in', detail: { heading: 'VÃ© Ä‘iá»‡n tá»­ chuyÃªn nghiá»‡p', points: ['Má»—i vÃ© cÃ³ mÃ£ QR duy nháº¥t Ä‘á»ƒ check-in', 'Xuáº¥t vÃ© PDF vá»›i thiáº¿t káº¿ concert-style Ä‘áº¹p', 'Hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§: tÃªn sá»± kiá»‡n, ngÃ y giá», Ä‘á»‹a Ä‘iá»ƒm', 'Anti-duplicate: ngÄƒn check-in trÃ¹ng láº·p tá»± Ä‘á»™ng', 'Há»— trá»£ in vÃ© hoáº·c xuáº¥t trÃ¬nh Ä‘iá»‡n thoáº¡i'] } },
  { icon: 'â™»ï¸', title: 'HoÃ n vÃ© linh hoáº¡t', desc: 'ChÃ­nh sÃ¡ch hoÃ n vÃ© rÃµ rÃ ng, admin duyá»‡t nhanh trong 24h', detail: { heading: 'ChÃ­nh sÃ¡ch hoÃ n vÃ© minh báº¡ch', points: ['HoÃ n 100% náº¿u yÃªu cáº§u trÆ°á»›c 3+ ngÃ y', 'HoÃ n 50% náº¿u yÃªu cáº§u trÆ°á»›c 1â€“2 ngÃ y', 'CÃ²n trong 30 ngÃ y sau sá»± kiá»‡n váº«n cÃ³ thá»ƒ yÃªu cáº§u', 'Admin xem xÃ©t vÃ  pháº£n há»“i trong 24 giá»', 'ThÃ´ng bÃ¡o káº¿t quáº£ ngay khi admin duyá»‡t'] } },
  { icon: 'ðŸ’¬', title: 'Há»— trá»£ 24/7', desc: 'Chatbot CSKH tá»± Ä‘á»™ng giáº£i Ä‘Ã¡p má»i tháº¯c máº¯c', detail: { heading: 'Há»— trá»£ khÃ¡ch hÃ ng toÃ n diá»‡n', points: ['Chatbot CSKH hoáº¡t Ä‘á»™ng 24/7', 'Quick replies tÃ¬m cÃ¢u tráº£ lá»i nhanh nháº¥t', 'Há»— trá»£: Ä‘áº·t vÃ©, thanh toÃ¡n, hoÃ n vÃ©, check-in', 'Káº¿t ná»‘i Ä‘á»™i há»— trá»£ trá»±c tiáº¿p khi cáº§n', 'Giao diá»‡n chat thÃ¢n thiá»‡n trÃªn má»i thiáº¿t bá»‹'] } },
  { icon: 'ðŸŒ™', title: 'Dark Mode', desc: 'Giao diá»‡n tá»‘i/sÃ¡ng tá»± Ä‘á»™ng lÆ°u theo sá»Ÿ thÃ­ch', detail: { heading: 'Tráº£i nghiá»‡m giao diá»‡n cÃ¡ nhÃ¢n hÃ³a', points: ['Chuyá»ƒn Ä‘á»•i tá»‘i/sÃ¡ng chá»‰ má»™t click', 'Thiáº¿t láº­p tá»± Ä‘á»™ng lÆ°u má»—i láº§n truy cáº­p', 'Giáº£m má»i máº¯t khi dÃ¹ng ban Ä‘Ãªm', 'Táº¥t cáº£ mÃ n hÃ¬nh há»— trá»£ cáº£ hai cháº¿ Ä‘á»™', 'KhÃ´ng áº£nh hÆ°á»Ÿng hiá»‡u nÄƒng hay dá»¯ liá»‡u'] } },
];

// Testimonials Ä‘Æ°á»£c láº¥y tá»« database (xem state bÃªn dÆ°á»›i)

const FAQS = [
  { q: 'LÃ m tháº¿ nÃ o Ä‘á»ƒ Ä‘áº·t vÃ© sá»± kiá»‡n?', a: 'ÄÄƒng nháº­p â†’ Chá»n sá»± kiá»‡n â†’ Chá»n loáº¡i vÃ© vÃ  sá»‘ lÆ°á»£ng â†’ XÃ¡c nháº­n Ä‘áº·t vÃ© â†’ Thanh toÃ¡n qua QR chuyá»ƒn khoáº£n â†’ Nháº­n mÃ£ vÃ© qua thÃ´ng bÃ¡o.' },
  { q: 'TÃ´i cÃ³ thá»ƒ hoÃ n vÃ© khÃ´ng?', a: 'CÃ³. VÃ o "VÃ© cá»§a tÃ´i" â†’ chá»n vÃ© â†’ nháº¥n "HoÃ n vÃ©". ChÃ­nh sÃ¡ch: hoÃ n 100% náº¿u trÆ°á»›c 3+ ngÃ y, hoÃ n 50% trÆ°á»›c 1â€“2 ngÃ y, cÃ³ thá»ƒ gá»­i yÃªu cáº§u trong 30 ngÃ y sau. Admin duyá»‡t trong 24h.' },
  { q: 'Thanh toÃ¡n báº±ng phÆ°Æ¡ng thá»©c nÃ o?', a: 'Há»— trá»£ chuyá»ƒn khoáº£n ngÃ¢n hÃ ng qua QR code. Sau khi Ä‘áº·t vÃ©, mÃ n hÃ¬nh QR hiá»‡n ra kÃ¨m thÃ´ng tin chuyá»ƒn khoáº£n. Admin xÃ¡c nháº­n vÃ  vÃ© Ä‘Æ°á»£c kÃ­ch hoáº¡t.' },
  { q: 'VÃ© QR code dÃ¹ng nhÆ° tháº¿ nÃ o?', a: 'Sau khi thanh toÃ¡n xÃ¡c nháº­n, vÃ© cÃ³ mÃ£ QR. Táº¡i cá»•ng sá»± kiá»‡n xuáº¥t trÃ¬nh QR hoáº·c in vÃ© PDF Ä‘á»ƒ nhÃ¢n viÃªn quÃ©t check-in. Má»—i mÃ£ QR chá»‰ dÃ¹ng Ä‘Æ°á»£c 1 láº§n.' },
  { q: 'QuÃªn máº­t kháº©u pháº£i lÃ m gÃ¬?', a: 'LiÃªn há»‡ Admin qua chatbot há»— trá»£ hoáº·c email Ä‘á»ƒ Ä‘Æ°á»£c cáº¥p láº¡i máº­t kháº©u. TÃ­nh nÄƒng tá»± Ä‘áº·t láº¡i qua email sáº½ sá»›m Ä‘Æ°á»£c cáº­p nháº­t.' },
  { q: 'NhÃ  tá»• chá»©c táº¡o sá»± kiá»‡n nhÆ° tháº¿ nÃ o?', a: 'ÄÄƒng nháº­p tÃ i khoáº£n Organizer â†’ VÃ o Organizer Panel â†’ nháº¥n "Táº¡o sá»± kiá»‡n má»›i" â†’ Ä‘iá»n thÃ´ng tin, upload áº£nh, thÃªm loáº¡i vÃ© â†’ nháº¥n "LÆ°u". Sá»± kiá»‡n á»Ÿ NhÃ¡p, nháº¥n "Xuáº¥t báº£n" Ä‘á»ƒ cÃ´ng khai.' },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    // Láº¥y 4 sá»± kiá»‡n giÃ¡ cao nháº¥t cho slider
    api.get('/events?sort=popular&limit=4').then(r => {
      const sorted = (r.data.data || []).sort((a,b) => (b.min_price||b.price||0) - (a.min_price||a.price||0));
      setTopEvents(sorted.slice(0,4));
    }).catch(()=>{});

    Promise.all([
      api.get('/events?sort=hot&limit=6'),
      api.get('/events?sort=newest&limit=4'),
      api.get('/events?sort=soon&limit=3'),
      api.get('/events/categories'),
    ]).then(([hot, newest, soon, cats]) => {
      setEvents(hot.data.data || []);
      setTrending(newest.data.data || []);
      setUpcoming(soon.data.data || []);
      setCategories(cats.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));

    // Fetch reviews tháº­t tá»« database
    api.get('/reviews/latest').then(r => setReviews(r.data.data || [])).catch(() => {}).finally(() => setLoadingReviews(false));
  }, []);

  const nextEvent = upcoming[0];
  const countdown = useCountdown(nextEvent?.start_date || new Date(Date.now() + 7 * 86400000));

  const handleSearch = e => {
    e.preventDefault();
    if (searchVal.trim()) nav(`/events?search=${encodeURIComponent(searchVal.trim())}`);
    else nav('/events');
  };

  return (
    <div>
      {/* â”€â”€ 1. HERO / BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eye">KhÃ¡m phÃ¡ Â· Tráº£i nghiá»‡m Â· Ghi nhá»›</div>
          <h1 className="hero-title serif">
            Sá»± kiá»‡n<br /><em>Ä‘áº³ng cáº¥p</em> cá»§a báº¡n
          </h1>
          <p className="hero-sub">KhÃ¡m phÃ¡ hÃ ng nghÃ¬n sá»± kiá»‡n há»™i tháº£o, workshop vÃ  concert Ä‘Æ°á»£c tuyá»ƒn chá»n ká»¹ lÆ°á»¡ng trÃªn cáº£ nÆ°á»›c.</p>

          {/* â”€â”€ 2. THANH TÃŒM KIáº¾M â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <form onSubmit={handleSearch} className="hero-search">
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="ðŸ”  TÃ¬m kiáº¿m sá»± kiá»‡n, Ä‘á»‹a Ä‘iá»ƒm, nghá»‡ sÄ©..."
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">TÃ¬m kiáº¿m</button>
          </form>

          <div className="hero-cta">
            <button className="btn btn-gold" style={{ padding: '13px 32px', fontSize: 12 }} onClick={() => nav('/events')}>KhÃ¡m phÃ¡ ngay</button>
            <Link to="/register" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: 12 }}>ÄÄƒng kÃ½ miá»…n phÃ­</Link>
          </div>

          <div className="hero-stats">
            {[['50+', 'Sá»± kiá»‡n'], ['5.000+', 'VÃ© Ä‘Ã£ bÃ¡n'], ['8', 'Danh má»¥c'], ['98%', 'HÃ i lÃ²ng']].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-n serif">{n}</div>
                <div className="hero-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ 3. DANH Má»¤C â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="cat-bar">
        {categories.slice(0, 8).map(c => (
          <Link key={c.id} to={`/events?category=${c.slug}`} className="cat-link">
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span>{c.name}</span>
            {c.event_count > 0 && <span className="cat-count">{c.event_count}</span>}
          </Link>
        ))}
      </section>

      {/* â”€â”€ SLIDER QUáº¢NG CÃO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AdSlider events={topEvents} />

      {/* â”€â”€ 4. Sá»° KIá»†N Ná»”I Báº¬T â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">ÄÆ°á»£c xem nhiá»u nháº¥t</div>
            <h2 className="section-title serif">Sá»± kiá»‡n ná»•i báº­t</h2>
          </div>
          <button className="btn btn-dark" onClick={() => nav('/events')}>Xem táº¥t cáº£ â†’</button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 4 }} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">ðŸŽ«</div><div className="empty-title">ChÆ°a cÃ³ sá»± kiá»‡n nÃ o</div></div>
        ) : (
          <div className="events-grid">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
        )}
      </div>

      {/* â”€â”€ 5. COUNTDOWN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {nextEvent && (
        <section style={{ background: 'var(--dark)', padding: '64px 48px', borderTop: '1px solid rgba(201,168,76,.08)', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 10 }}>Sá»± kiá»‡n sáº¯p diá»…n ra</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, color: '#faf7f2', fontWeight: 700, marginBottom: 8 }}>{nextEvent.title}</h2>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>
              ðŸ“… {new Date(nextEvent.start_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              {nextEvent.venue_name && ` Â· ðŸ“ ${nextEvent.venue_name}`}
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
              <CDBox label="NgÃ y" value={countdown.d} />
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, color: 'rgba(201,168,76,.25)', marginBottom: 12 }}>:</div>
              <CDBox label="Giá»" value={countdown.h} />
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, color: 'rgba(201,168,76,.25)', marginBottom: 12 }}>:</div>
              <CDBox label="PhÃºt" value={countdown.m} />
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, color: 'rgba(201,168,76,.25)', marginBottom: 12 }}>:</div>
              <CDBox label="GiÃ¢y" value={countdown.s} />
            </div>
            <button className="btn btn-gold" style={{ padding: '13px 32px', fontSize: 12 }} onClick={() => nav(`/events/${nextEvent.slug || nextEvent.id}`)}>
              Äáº·t vÃ© trÆ°á»›c khi háº¿t â†’
            </button>
          </div>
        </section>
      )}

      {/* â”€â”€ 6. Sá»° KIá»†N Sáº®PDIá»„N RA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {upcoming.length > 0 && (
        <div className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Äá»«ng bá» lá»¡</div>
              <h2 className="section-title serif">Sá»± kiá»‡n sáº¯p diá»…n ra</h2>
            </div>
            <button className="btn btn-dark" onClick={() => nav('/events?sort=soon')}>Xem táº¥t cáº£ â†’</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
            {upcoming.map(e => {
              const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
              return (
                <div key={e.id} onClick={() => nav(`/events/${e.slug || e.id}`)} style={{ background: 'var(--bg3)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'background .2s' }}
                  onMouseOver={el => el.currentTarget.style.background = 'var(--bg2)'}
                  onMouseOut={el => el.currentTarget.style.background = 'var(--bg3)'}>
                  <div style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (e.category_icon || 'ðŸŽ«')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 17, fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>ðŸ“… {new Date(e.start_date).toLocaleDateString('vi-VN')} Â· ðŸ“ {e.venue_name || 'Trá»±c tuyáº¿n'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, color: 'var(--gold)' }}>{e.sold}/{e.capacity} vÃ©</div>
                    <div style={{ width: 80, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                      <div style={{ height: '100%', width: pct + '%', background: 'var(--gold)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* â”€â”€ 7. EVENT TRENDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {trending.length > 0 && (
        <div className="section" style={{ paddingTop: 20, paddingBottom: 48, background: 'var(--bg2)' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Äang Ä‘Æ°á»£c quan tÃ¢m</div>
              <h2 className="section-title serif">ðŸ”¥ Trending ngay bÃ¢y giá»</h2>
            </div>
            <button className="btn btn-dark" onClick={() => nav('/events?sort=newest')}>Xem táº¥t cáº£ â†’</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {trending.map((e, i) => (
              <div key={e.id} onClick={() => nav(`/events/${e.slug || e.id}`)} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--bg3)', borderRadius: 4, border: '1px solid var(--border2)', cursor: 'pointer', alignItems: 'center', transition: 'all .2s' }}
                onMouseOver={el => { el.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'; el.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={el => { el.currentTarget.style.borderColor = 'var(--border2)'; el.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'rgba(201,168,76,.15)' : 'var(--bg2)', border: `1px solid ${i < 3 ? 'rgba(201,168,76,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 14 : 12, fontWeight: 700, color: i < 3 ? 'var(--gold)' : 'var(--text3)', flexShrink: 0 }}>
                  {i < 3 ? ['ðŸ¥‡', 'ðŸ¥ˆ', 'ðŸ¥‰'][i] : i + 1}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 3, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (e.category_icon || 'ðŸŽ«')}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{e.sold} vÃ© Ä‘Ã£ bÃ¡n Â· {e.view_count || 0} lÆ°á»£t xem</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ 8. TÃNH NÄ‚NG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: 'var(--dark)', padding: '72px 48px', borderTop: '1px solid rgba(201,168,76,.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 8 }}>Táº¡i sao chá»n EventHub</div>
          <h2 className="section-title serif" style={{ color: '#faf7f2' }}>Tráº£i nghiá»‡m khÃ¡c biá»‡t</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={'feature-card' + (activeFeature === i ? ' active' : '')} onClick={() => setActiveFeature(activeFeature === i ? null : i)}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 17, color: activeFeature === i ? 'var(--gold)' : '#faf7f2', marginBottom: 6, fontWeight: 600 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>{f.desc}</div>
              {activeFeature === i && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(201,168,76,.15)', paddingTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', marginBottom: 10, letterSpacing: 1 }}>{f.detail.heading}</div>
                  {f.detail.points.map((p, j) => (
                    <div key={j} style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0 }}>â—†</span>{p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ 9. TESTIMONIALS â€” Reviews tháº­t tá»« database â”€â”€ */}
      <section style={{ background: 'var(--bg2)', padding: '72px 48px', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 8 }}>Pháº£n há»“i tá»« ngÆ°á»i dÃ¹ng</div>
          <h2 className="section-title serif">Há» nÃ³i gÃ¬ vá» EventHub</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
            {reviews.length > 0 ? `${reviews.length} Ä‘Ã¡nh giÃ¡ tá»« ngÆ°á»i tham dá»± thá»±c táº¿` : 'HÃ£y lÃ  ngÆ°á»i Ä‘áº§u tiÃªn Ä‘Ã¡nh giÃ¡ sá»± kiá»‡n!'}
          </p>
        </div>

        {loadingReviews ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 4 }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>ðŸ’¬</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, marginBottom: 8 }}>ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 20 }}>
              Tham dá»± sá»± kiá»‡n vÃ  chia sáº» tráº£i nghiá»‡m cá»§a báº¡n Ä‘á»ƒ giÃºp cá»™ng Ä‘á»“ng cÃ³ thÃªm thÃ´ng tin há»¯u Ã­ch.
            </div>
            <button className="btn btn-dark" onClick={() => nav('/events')}>Xem sá»± kiá»‡n ngay</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto 24px' }}>
              {reviews.map((r, i) => (
                <div key={r.id || i} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '22px 20px', transition: 'border-color .2s' }}
                  onMouseOver={el => el.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'}
                  onMouseOut={el => el.currentTarget.style.borderColor = 'var(--border2)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : 'var(--border)', fontSize: 15 }}>â˜…</span>)}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {r.event_title && (
                    <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ðŸŽ« {r.event_title}
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 16, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{r.comment || 'ÄÃ¡nh giÃ¡ tá»‘t!'}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.user_avatar
                      ? <img src={r.user_avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{r.user_name?.[0]?.toUpperCase()}</div>
                    }
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.user_name}</div>
                      {r.user_role && <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 }}>{r.user_role === 'user' ? 'ThÃ nh viÃªn' : r.user_role}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {reviews.length >= 8 && (
              <div style={{ textAlign: 'center' }}>
                <button className="btn btn-dark" onClick={() => nav('/events')}>Xem thÃªm Ä‘Ã¡nh giÃ¡ â†’</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* â”€â”€ 10. CTA ORGANIZER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: 'var(--dark)', padding: '72px 48px', borderTop: '1px solid rgba(201,168,76,.08)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 12 }}>DÃ nh cho nhÃ  tá»• chá»©c</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 36, color: '#faf7f2', fontWeight: 700, marginBottom: 14, lineHeight: 1.2 }}>Báº¡n muá»‘n tá»• chá»©c sá»± kiá»‡n?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.8, marginBottom: 32 }}>
            Táº¡o vÃ  quáº£n lÃ½ sá»± kiá»‡n ngay hÃ´m nay. Há»‡ thá»‘ng bÃ¡n vÃ©, check-in QR vÃ  bÃ¡o cÃ¡o doanh thu â€” hoÃ n toÃ n miá»…n phÃ­ Ä‘á»ƒ thá»­ nghiá»‡m.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold" style={{ padding: '13px 36px', fontSize: 12 }}>Táº¡o tÃ i khoáº£n ngay</Link>
            <Link to="/events" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: 12 }}>Xem sá»± kiá»‡n máº«u</Link>
          </div>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(201,168,76,.08)', flexWrap: 'wrap' }}>
            {['Miá»…n phÃ­ Ä‘Äƒng kÃ½', 'Xuáº¥t báº£n ngay láº­p tá»©c', 'Dashboard bÃ¡o cÃ¡o', 'Há»— trá»£ 24/7'].map(text => (
              <div key={text} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--gold)' }}>âœ“</span>{text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ 11. FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: 'var(--bg)', padding: '72px 48px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 8 }}>Giáº£i Ä‘Ã¡p tháº¯c máº¯c</div>
            <h2 className="section-title serif">CÃ¢u há»i thÆ°á»ng gáº·p</h2>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border2)' }}>
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', paddingRight: 16 }}>{f.q}</span>
                <span style={{ color: 'var(--gold)', fontSize: 20, flexShrink: 0, transform: activeFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .25s' }}>+</span>
              </button>
              {activeFaq === i && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, paddingBottom: 18, paddingRight: 32 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ 12. FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer style={{ background: '#0d0a05', borderTop: '1px solid rgba(201,168,76,.12)', padding: '48px 48px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, color: '#faf7f2', fontWeight: 700, marginBottom: 12 }}>Event<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Hub</em></div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.8, maxWidth: 240 }}>Ná»n táº£ng Ä‘áº·t vÃ© sá»± kiá»‡n hÃ ng Ä‘áº§u Viá»‡t Nam. Káº¿t ná»‘i nhÃ  tá»• chá»©c vÃ  ngÆ°á»i tham dá»± má»™t cÃ¡ch liá»n máº¡ch.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {['ðŸ“˜', 'ðŸ“¸', 'ðŸ¦', 'â–¶ï¸'].map((icon, i) => (
                <div key={i} style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer', transition: 'border-color .2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          {[
            { title: 'NgÆ°á»i dÃ¹ng', links: [
              { label: 'Trang chá»§', to: '/' },
              { label: 'Sá»± kiá»‡n', to: '/events' },
              { label: 'VÃ© cá»§a tÃ´i', to: '/my-tickets' },
              { label: 'Há»“ sÆ¡ cÃ¡ nhÃ¢n', to: '/profile' },
              { label: 'ÄÄƒng kÃ½', to: '/register' },
            ]},
            { title: 'Há»— trá»£', links: [
              { label: 'CÃ¢u há»i thÆ°á»ng gáº·p', action: 'faq' },
              { label: 'ChÃ­nh sÃ¡ch hoÃ n vÃ©', action: 'refund' },
              { label: 'LiÃªn há»‡ há»— trá»£', href: 'mailto:admin@eventhub.vn' },
              { label: 'Äiá»u khoáº£n dá»‹ch vá»¥', action: 'terms' },
              { label: 'ChÃ­nh sÃ¡ch báº£o máº­t', action: 'privacy' },
            ]},
            { title: 'LiÃªn há»‡', links: [
              { label: 'ðŸ“§ admin@eventhub.vn', href: 'mailto:admin@eventhub.vn' },
              { label: 'ðŸ“ž 1900 1234', href: 'tel:19001234' },
              { label: 'ðŸ“ TP. Há»“ ChÃ­ Minh', href: 'https://maps.google.com/?q=Ho+Chi+Minh+City' },
              { label: 'â° 8:00 â€“ 22:00 háº±ng ngÃ y', href: null },
            ]},
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14, fontWeight: 500 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label}
                  onClick={() => {
                    if (l.to) nav(l.to);
                    else if (l.href) window.open(l.href, '_blank');
                    else if (l.action === 'faq') document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    else if (l.action === 'refund') alert('ChÃ­nh sÃ¡ch hoÃ n vÃ©:\n\nâœ… HoÃ n 100% náº¿u há»§y trÆ°á»›c 3+ ngÃ y\nâœ… HoÃ n 50% náº¿u há»§y trÆ°á»›c 1-2 ngÃ y\nâŒ KhÃ´ng hoÃ n náº¿u há»§y trong ngÃ y\n\nLiÃªn há»‡: admin@eventhub.vn');
                    else if (l.action === 'terms') alert('Äiá»u khoáº£n dá»‹ch vá»¥:\n\nâ€¢ NgÆ°á»i dÃ¹ng pháº£i Ä‘á»§ 18 tuá»•i\nâ€¢ VÃ© Ä‘Ã£ mua khÃ´ng Ä‘Æ°á»£c chuyá»ƒn nhÆ°á»£ng\nâ€¢ EventHub khÃ´ng chá»‹u trÃ¡ch nhiá»‡m náº¿u sá»± kiá»‡n bá»‹ há»§y bá»Ÿi nhÃ  tá»• chá»©c\n\nLiÃªn há»‡: admin@eventhub.vn');
                    else if (l.action === 'privacy') alert('ChÃ­nh sÃ¡ch báº£o máº­t:\n\nâ€¢ ThÃ´ng tin cÃ¡ nhÃ¢n Ä‘Æ°á»£c mÃ£ hÃ³a vÃ  báº£o máº­t\nâ€¢ KhÃ´ng chia sáº» dá»¯ liá»‡u vá»›i bÃªn thá»© 3\nâ€¢ NgÆ°á»i dÃ¹ng cÃ³ quyá»n xÃ³a tÃ i khoáº£n báº¥t cá»© lÃºc nÃ o\n\nLiÃªn há»‡: admin@eventhub.vn');
                  }}
                  style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 8, cursor: l.href || l.to || l.action ? 'pointer' : 'default', lineHeight: 1.5, transition: 'color .2s' }}
                  onMouseOver={e => { if (l.href || l.to || l.action) e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.35)'}>
                  {l.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>Â© 2025 EventHub. Báº£o lÆ°u má»i quyá»n.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>XÃ¢y dá»±ng báº±ng React + Node.js + MySQL ðŸ’›</div>
        </div>
      </footer>
    </div>
  );
}



/ /   f o r c e   r e b u i l d   0 6 / 0 8 / 2 0 2 6   1 0 : 1 9 : 0 2  
 