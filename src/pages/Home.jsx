import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import './Home.css';

function useCountdown(target) {
  const calc = () => {
    const d = new Date(target) - new Date();
    if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return { d: Math.floor(d/86400000), h: Math.floor((d%86400000)/3600000), m: Math.floor((d%3600000)/60000), s: Math.floor((d%60000)/1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

function CDBox({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 42, fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>{String(value).padStart(2,'0')}</div>
      <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: 'ticket', title: 'Instant Booking', desc: 'Instant confirmation, ticket code sent in seconds' },
  { icon: 'seat', title: 'Choose Seats', desc: 'Visual seating chart, choose your favorite spot' },
  { icon: 'dashboard', title: 'Smart Management', desc: 'Full admin dashboard with real-time revenue reports' },
  { icon: 'security', title: 'Maximum Security', desc: 'JWT authentication, detailed authorization, encrypted data' },
  { icon: 'pdf', title: 'PDF Ticket + QR Code', desc: 'Export concert-style PDF ticket with QR check-in code' },
  { icon: 'refund', title: 'Flexible Refund', desc: 'Clear refund policy, admin approves within 24h' },
  { icon: 'chat', title: 'Support 24/7', desc: 'Automated chatbot answers all questions' },
  { icon: 'moon', title: 'Dark Mode', desc: 'Dark/light interface automatically saved by preference' },
];

const FAQS = [
  { q: 'How to book a ticket?', a: 'Login → Select event → Choose ticket type and quantity → Confirm booking → Pay via QR transfer → Receive ticket code via notification.' },
  { q: 'Can I get a refund?', a: 'Yes. Go to "My Tickets" → select ticket → click "Request Refund". Policy: 100% refund if 3+ days before, 50% refund if 1-2 days before. Admin reviews within 24h.' },
  { q: 'What payment methods are supported?', a: 'Bank transfer via QR code. After booking, a QR screen appears with transfer info. Admin confirms and ticket is activated.' },
  { q: 'How to use QR ticket?', a: 'After payment confirmation, ticket has a QR code. Show QR at event entrance or print PDF ticket for staff to scan check-in. Each QR code can only be used once.' },
  { q: 'Forgot password?', a: 'Contact Admin via support chatbot or email to reset password. Self-reset via email feature will be updated soon.' },
  { q: 'How do organizers create events?', a: 'Login as Organizer → Go to Organizer Panel → Click "Create New Event" → Fill in details, upload image, add ticket types → Click "Save". Event is in Draft, click "Publish" to go public.' },
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
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api.get('/events?sort=popular&limit=4').then(r => {
      setTopEvents((r.data.data || []).slice(0,4));
    }).catch(()=>{});
    Promise.all([
      api.get('/events?sort=hot&limit=9'),
      api.get('/events?sort=newest&limit=9'),
      api.get('/events?sort=soon&limit=9'),
      api.get('/events/categories'),
    ]).then(([hot, newest, soon, cats]) => {
      setEvents(hot.data.data || []);
      setTrending(newest.data.data || []);
      setUpcoming(soon.data.data || []);
      setCategories(cats.data.data || []);
    }).catch(()=>{}).finally(() => setLoading(false));
    api.get('/reviews/latest').then(r => setReviews(r.data.data || [])).catch(()=>{}).finally(() => setLoadingReviews(false));
  }, []);

  const nextEvent = upcoming[0];
  const countdown = useCountdown(nextEvent?.start_date || new Date(Date.now() + 7*86400000));

  const handleSearch = e => {
    e.preventDefault();
    if (searchVal.trim()) nav(`/events?search=${encodeURIComponent(searchVal.trim())}`);
    else nav('/events');
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eye">Discover · Experience · Remember</div>
          <h1 className="hero-title serif">
            Your <em>Premium</em> Events
          </h1>
          <p className="hero-sub">Discover thousands of curated conferences, workshops and concerts nationwide.</p>
          <form onSubmit={handleSearch} className="hero-search">
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search events, venues, artists..." className="hero-search-input" />
            <button type="submit" className="hero-search-btn">Search</button>
          </form>
          <div className="hero-cta">
            <button className="btn btn-gold" style={{ padding: '13px 32px', fontSize: 12 }} onClick={() => nav('/events')}>Explore Now</button>
            <Link to="/register" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: 12 }}>Register Free</Link>
          </div>
          <div className="hero-stats">
            {[['50+','Events'],['5,000+','Tickets Sold'],['8','Categories'],['98%','Satisfied']].map(([n,l]) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-n serif">{n}</div>
                <div className="hero-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AD SLIDER */}
      {topEvents.length > 0 && (
        <section style={{ background: "var(--dark)", padding: "0 48px", borderBottom: "1px solid rgba(201,168,76,.08)" }}>
          <div style={{ background: "linear-gradient(135deg,#1a0a3e,#6b2fa0)", borderRadius: 6, padding: "40px 48px", position: "relative", overflow: "hidden", minHeight: 160 }}>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#a855f7", fontWeight: 700, marginBottom: 10 }}>● FEATURED</div>
              <h3 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 30, fontWeight: 700, color: "#faf7f2", marginBottom: 8, lineHeight: 1.2 }}>{topEvents[0]?.title || topEvents[0]?.name}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 12 }}>From {new Intl.NumberFormat("vi-VN").format(topEvents[0]?.price || 0)}d</p>
              <button onClick={() => nav("/events/" + (topEvents[0]?.slug || topEvents[0]?.id))}
                style={{ background: "#a855f7", border: "none", color: "#fff", padding: "10px 28px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, cursor: "pointer", borderRadius: 4 }}>
                Book Now →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="cat-bar">
        {categories.slice(0,8).map(c => (
          <Link key={c.id} to={`/events?category=${c.slug}`} className="cat-link">
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span>{c.name}</span>
            {c.event_count > 0 && <span className="cat-count">{c.event_count}</span>}
          </Link>
        ))}
      </section>

      {/* FEATURED EVENTS */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Most Viewed</div>
            <h2 className="section-title serif">Featured Events</h2>
          </div>
          <button className="btn btn-dark" onClick={() => nav('/events')}>View All →</button>
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:320, borderRadius:4 }} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🎫</div><div className="empty-title">No events found</div></div>
        ) : (
          <div className="events-grid">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
        )}
      </div>

      {/* COUNTDOWN */}
      {nextEvent && (
        <section style={{ background:'var(--dark)', padding:'64px 48px', borderTop:'1px solid rgba(201,168,76,.08)', borderBottom:'1px solid rgba(201,168,76,.08)' }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <div className="section-eyebrow" style={{ justifyContent:'center', marginBottom:10 }}>Upcoming Event</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, color:'#faf7f2', fontWeight:700, marginBottom:8 }}>{nextEvent.title || nextEvent.name}</h2>
            <div style={{ display:'flex', gap:20, justifyContent:'center', alignItems:'center', marginBottom:32 }}>
              <CDBox label="Days" value={countdown.d} />
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, color:'rgba(201,168,76,.25)', marginBottom:12 }}>:</div>
              <CDBox label="Hours" value={countdown.h} />
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, color:'rgba(201,168,76,.25)', marginBottom:12 }}>:</div>
              <CDBox label="Minutes" value={countdown.m} />
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, color:'rgba(201,168,76,.25)', marginBottom:12 }}>:</div>
              <CDBox label="Seconds" value={countdown.s} />
            </div>
            <button className="btn btn-gold" style={{ padding:'13px 32px', fontSize:12 }} onClick={() => nav(`/events/${nextEvent.slug || nextEvent.id}`)}>
              Book Before It Sells Out →
            </button>
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <div className="section" style={{ paddingTop:40, paddingBottom:40 }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Don't Miss</div>
              <h2 className="section-title serif">Upcoming Events</h2>
            </div>
            <button className="btn btn-dark" onClick={() => nav('/events?sort=soon')}>View All →</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border)' }}>
            {upcoming.map(e => {
              const pct = e.capacity > 0 ? Math.round(e.sold/e.capacity*100) : 0;
              return (
                <div key={e.id} onClick={() => nav(`/events/${e.slug||e.id}`)} style={{ background:'var(--bg3)', padding:'16px 20px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', transition:'background .2s' }}
                  onMouseOver={el => el.currentTarget.style.background='var(--bg2)'}
                  onMouseOut={el => el.currentTarget.style.background='var(--bg3)'}>
                  <div style={{ width:52, height:52, borderRadius:4, overflow:'hidden', flexShrink:0, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                    {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎫'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:700 }}>{e.title || e.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>📅 {new Date(e.start_date||e.date).toLocaleDateString('en-US')} · 📍 {e.venue_name||e.location||'Online'}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'var(--gold)' }}>{e.sold}/{e.capacity} tickets</div>
                    <div style={{ width:80, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden', marginTop:4 }}>
                      <div style={{ height:'100%', width:pct+'%', background:'var(--gold)', borderRadius:2 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRENDING */}
      {trending.length > 0 && (
        <div className="section" style={{ paddingTop:20, paddingBottom:48, background:'var(--bg2)' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Trending</div>
              <h2 className="section-title serif">🔥 Trending Now</h2>
            </div>
            <button className="btn btn-dark" onClick={() => nav('/events?sort=newest')}>View All →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {trending.map((e,i) => (
              <div key={e.id} onClick={() => nav(`/events/${e.slug||e.id}`)} style={{ display:'flex', gap:12, padding:'12px', background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border2)', cursor:'pointer', alignItems:'center', transition:'all .2s' }}
                onMouseOver={el => { el.currentTarget.style.borderColor='rgba(201,168,76,.3)'; el.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseOut={el => { el.currentTarget.style.borderColor='var(--border2)'; el.currentTarget.style.transform='none'; }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:i<3?'rgba(201,168,76,.15)':'var(--bg2)', border:`1px solid ${i<3?'rgba(201,168,76,.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:i<3?14:12, fontWeight:700, color:i<3?'var(--gold)':'var(--text3)', flexShrink:0 }}>
                  {i<3?['🥇','🥈','🥉'][i]:i+1}
                </div>
                <div style={{ width:44, height:44, borderRadius:3, overflow:'hidden', flexShrink:0, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  {e.thumbnail?<img src={e.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:'🎫'}
                </div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.title||e.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{e.sold} sold · {e.view_count||0} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURES */}
      <section style={{ background:'var(--dark)', padding:'72px 48px', borderTop:'1px solid rgba(201,168,76,.06)' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center', marginBottom:8 }}>Why Choose EventHub</div>
          <h2 className="section-title serif" style={{ color:'#faf7f2' }}>Unique Experience</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f,i) => (
            <div key={i} className="feature-card">
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, color:'#faf7f2', marginBottom:6, fontWeight:600 }}>{f.title}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background:'var(--bg2)', padding:'72px 48px', borderTop:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center', marginBottom:8 }}>User Reviews</div>
          <h2 className="section-title serif">What They Say About EventHub</h2>
        </div>
        {reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>💬</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, marginBottom:8 }}>No reviews yet</div>
            <button className="btn btn-dark" onClick={() => nav('/events')}>View Events Now</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, maxWidth:1100, margin:'0 auto' }}>
            {reviews.map((r,i) => (
              <div key={r.id||i} style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:4, padding:'22px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:3 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=r.rating?'#f59e0b':'var(--border)', fontSize:15 }}>★</span>)}
                  </div>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString('en-US')}</span>
                </div>
                <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.75, marginBottom:16, fontStyle:'italic' }}>"{r.comment||'Great event!'}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'var(--gold)', fontWeight:700 }}>{r.user_name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{r.user_name}</div>
                    <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase' }}>{r.user_role||'Member'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA ORGANIZER */}
      <section style={{ background:'var(--dark)', padding:'72px 48px', borderTop:'1px solid rgba(201,168,76,.08)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div className="section-eyebrow" style={{ justifyContent:'center', marginBottom:12 }}>For Organizers</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, color:'#faf7f2', fontWeight:700, marginBottom:14, lineHeight:1.2 }}>Want to organize an event?</h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', lineHeight:1.8, marginBottom:32 }}>
            Create and manage events today. Ticketing, QR check-in and revenue reports — completely free to try.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-gold" style={{ padding:'13px 36px', fontSize:12 }}>Create Account Now</Link>
            <Link to="/events" className="btn btn-outline" style={{ padding:'13px 28px', fontSize:12 }}>View Sample Events</Link>
          </div>
          <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:40, paddingTop:32, borderTop:'1px solid rgba(201,168,76,.08)', flexWrap:'wrap' }}>
            {['Free Registration','Instant Publishing','Report Dashboard','Support 24/7'].map(text => (
              <div key={text} style={{ fontSize:12, color:'rgba(255,255,255,.4)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--gold)' }}>✓</span>{text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background:'var(--bg)', padding:'72px 48px', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center', marginBottom:8 }}>FAQ</div>
            <h2 className="section-title serif">Frequently Asked Questions</h2>
          </div>
          {FAQS.map((f,i) => (
            <div key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
              <button onClick={() => setActiveFaq(activeFaq===i?null:i)}
                style={{ width:'100%', background:'none', border:'none', padding:'18px 0', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                <span style={{ fontSize:14, fontWeight:500, color:'var(--text)', paddingRight:16 }}>{f.q}</span>
                <span style={{ color:'var(--gold)', fontSize:20, flexShrink:0, transform:activeFaq===i?'rotate(45deg)':'none', transition:'transform .25s' }}>+</span>
              </button>
              {activeFaq===i && <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8, paddingBottom:18, paddingRight:32 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0d0a05', borderTop:'1px solid rgba(201,168,76,.12)', padding:'48px 48px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'#faf7f2', fontWeight:700, marginBottom:12 }}>Event<em style={{ color:'var(--gold)', fontStyle:'italic' }}>Hub</em></div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.35)', lineHeight:1.8, maxWidth:240 }}>Vietnam's leading event ticketing platform. Seamlessly connecting organizers and attendees.</p>
          </div>
          {[
            { title:'Users', links:[{label:'Home',to:'/'},{label:'Events',to:'/events'},{label:'My Tickets',to:'/my-tickets'},{label:'Profile',to:'/profile'},{label:'Register',to:'/register'}]},
            { title:'Support', links:[{label:'FAQ',action:'faq'},{label:'Refund Policy',action:'refund'},{label:'Contact Support',href:'mailto:admin@eventhub.vn'},{label:'Terms of Service',action:'terms'},{label:'Privacy Policy',action:'privacy'}]},
            { title:'Contact', links:[{label:'📧 admin@eventhub.vn',href:'mailto:admin@eventhub.vn'},{label:'📞 1900 1234',href:'tel:19001234'},{label:'📍 Ho Chi Minh City',href:null},{label:'⏰ 8:00 - 22:00 daily',href:null}]},
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:10, letterSpacing:3, color:'var(--gold)', textTransform:'uppercase', marginBottom:14, fontWeight:500 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label} onClick={() => { if(l.to) nav(l.to); else if(l.href) window.open(l.href,'_blank'); else if(l.action==='refund') alert('Refund Policy:\n\n100% refund if 3+ days before\n50% refund if 1-2 days before\nNo refund on the day\n\nContact: admin@eventhub.vn'); else if(l.action==='terms') alert('Terms of Service:\n\nUsers must be 18+\nTickets are non-transferable\nEventHub is not responsible for organizer cancellations\n\nContact: admin@eventhub.vn'); else if(l.action==='privacy') alert('Privacy Policy:\n\nPersonal data is encrypted\nNo data sharing with third parties\nUsers can delete account anytime\n\nContact: admin@eventhub.vn'); }}
                  style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:8, cursor:l.href||l.to||l.action?'pointer':'default', lineHeight:1.5 }}>
                  {l.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.2)' }}>© 2025 EventHub. All rights reserved.</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.2)' }}>Built with React + Node.js + MySQL 💛</div>
        </div>
      </footer>
    </div>
  );
}
