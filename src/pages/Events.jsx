import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const fmt = n => n === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtD = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const SORTS = [
  { v: 'newest', l: 'Mới nhất' },
  { v: 'hot', l: 'Xem nhiều' },
  { v: 'soon', l: 'Sắp diễn ra' },
  { v: 'popular', l: 'Bán chạy' },
];

const PRICE_RANGES = [
  { v: '', l: 'Tất cả giá' },
  { v: 'free', l: 'Miễn phí' },
  { v: '0-100000', l: 'Dưới 100k' },
  { v: '100000-500000', l: '100k – 500k' },
  { v: '500000-1000000', l: '500k – 1 triệu' },
  { v: '1000000+', l: 'Trên 1 triệu' },
];

function EventCardGrid({ event: e, onClick }) {
  const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
  return (
    <div onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', transition: 'all .3s' }}
      onMouseOver={el => { el.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; el.currentTarget.style.transform = 'translateY(-4px)'; el.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)'; }}
      onMouseOut={el => { el.currentTarget.style.borderColor = 'var(--border2)'; el.currentTarget.style.transform = 'none'; el.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ height: 180, background: `linear-gradient(135deg,${e.category_color || '#1a1510'},#2a2018)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {e.thumbnail
          ? <img src={e.thumbnail} alt={e.title||e.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <div style={{ fontSize: 52 }}>{e.category_icon || '🎫'}</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,.7))' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
          {e.is_featured && <span style={{ background: 'var(--gold)', color: '#1a1510', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: '3px 8px', borderRadius: 2 }}>NỔI BẬT</span>}
          {pct >= 100 && <span style={{ background: 'rgba(139,26,26,.9)', color: '#fff', fontSize: 9, padding: '3px 8px', borderRadius: 2 }}>HẾT VÉ</span>}
          {e.is_online && <span style={{ background: 'rgba(37,99,235,.9)', color: '#fff', fontSize: 9, padding: '3px 8px', borderRadius: 2 }}>ONLINE</span>}
        </div>
        {e.category_name && <div style={{ position: 'absolute', bottom: 10, left: 10, background: e.category_color || '#7c3aed', color: '#fff', fontSize: 9, letterSpacing: 2, padding: '3px 10px', borderRadius: 2 }}>{e.category_name.toUpperCase()}</div>}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.title||e.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>📅 {fmtD(e.start_date)}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>📍 {e.venue_name || 'Trực tuyến'}</div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? '#8b1a1a' : pct >= 70 ? '#8b5e00' : 'var(--gold)', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 19, fontWeight: 300 }}>{fmt(e.min_price || 0)}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{e.sold}/{e.capacity} vé đã bán</div>
          </div>
          {e.avg_rating > 0 && <div style={{ fontSize: 11, color: 'var(--text3)' }}>⭐ {e.avg_rating}</div>}
        </div>
        <button style={{ width:'100%', marginTop:10, background:'var(--dark)', border:'1px solid rgba(201,168,76,.3)', color:'var(--gold)', padding:'8px', fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit', borderRadius:3, transition:'all .2s' }}
          onMouseOver={e2=>e2.currentTarget.style.background='var(--gold)' || (e2.currentTarget.style.color='#1a1510')}
          onMouseOut={e2=>e2.currentTarget.style.background='var(--dark)' || (e2.currentTarget.style.color='var(--gold)')}>
          Xem chi tiết →
        </button>
      </div>
    </div>
  );
}

function EventCardList({ event: e, onClick }) {
  const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
  return (
    <div onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: 0, transition: 'all .2s' }}
      onMouseOver={el => { el.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'; }}
      onMouseOut={el => { el.currentTarget.style.borderColor = 'var(--border2)'; }}>
      <div style={{ width: 160, flexShrink: 0, background: `linear-gradient(135deg,${e.category_color || '#1a1510'},#2a2018)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <div style={{ fontSize: 36 }}>{e.category_icon || '🎫'}</div>}
        {e.is_online && <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(37,99,235,.9)', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 2 }}>ONLINE</div>}
      </div>
      <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{e.title||e.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>📅 {fmtD(e.start_date)} · 📍 {e.venue_name || 'Trực tuyến'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>👤 {e.organizer_name}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 300, marginBottom: 4 }}>{fmt(e.min_price || 0)}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>{e.sold}/{e.capacity} vé</div>
          <div style={{ height: 3, width: 80, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? '#8b1a1a' : 'var(--gold)', borderRadius: 2 }} />
          </div>
        </div>
        {e.is_featured && <span style={{ background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', fontSize: 9, padding: '3px 8px', borderRadius: 2, fontWeight: 700 }}>NỔI BẬT</span>}
      </div>
    </div>
  );
}

export default function Events() {
  const [sp, setSp] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showFilter, setShowFilter] = useState(false);
  const nav = useNavigate();

  const search = sp.get('search') || '';
  const category = sp.get('category') || '';
  const sort = sp.get('sort') || 'newest';
  const priceRange = sp.get('price') || '';
  const typeFilter = sp.get('type') || ''; // online | offline

  const set = (k, v) => setSp(prev => {
    const n = new URLSearchParams(prev);
    if (v) n.set(k, v); else n.delete(k);
    return n;
  });

  const load = useCallback((p = 1) => {
    setLoading(true);
    const q = new URLSearchParams({ sort, page: p, limit: 12 });
    if (search) q.set('search', search);
    if (category) q.set('category', category);
    if (typeFilter) q.set('type', typeFilter);
    api.get('/events?' + q).then(r => {
      let data = r.data.data || [];
      // Filter giá phía client
      if (priceRange === 'free') data = data.filter(e => !e.min_price || e.min_price === 0);
      else if (priceRange === '0-100000') data = data.filter(e => (e.min_price || 0) <= 100000);
      else if (priceRange === '100000-500000') data = data.filter(e => (e.min_price || 0) > 100000 && (e.min_price || 0) <= 500000);
      else if (priceRange === '500000-1000000') data = data.filter(e => (e.min_price || 0) > 500000 && (e.min_price || 0) <= 1000000);
      else if (priceRange === '1000000+') data = data.filter(e => (e.min_price || 0) > 1000000);
      setEvents(data);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
      setPage(p);
    }).finally(() => setLoading(false));
  }, [search, category, sort, priceRange, typeFilter]);

  useEffect(() => { load(1); }, [load]);
  useEffect(() => { api.get('/events/categories').then(r => setCategories(r.data.data || [])).catch(() => {}); }, []);

  const activeFilters = [category, priceRange, typeFilter].filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '40px 48px 0', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(201,168,76,.6)', textTransform: 'uppercase', marginBottom: 8 }}>Danh sách sự kiện</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 36, fontWeight: 700, color: '#faf7f2', marginBottom: 20 }}>Khám phá sự kiện</h1>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 0, scrollbarWidth: 'none' }}>
          <button onClick={() => set('category', '')} style={{ background: 'none', border: 'none', padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 1, color: !category ? '#fff' : 'rgba(255,255,255,.45)', borderBottom: !category ? '2px solid var(--gold)' : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all .2s' }}>
            Tất cả
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => set('category', c.slug)} style={{ background: 'none', border: 'none', padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 1, color: category === c.slug ? '#fff' : 'rgba(255,255,255,.45)', borderBottom: category === c.slug ? '2px solid var(--gold)' : '2px solid transparent', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}>
              {c.icon} {c.name}
              {c.event_count > 0 && <span style={{ background: 'rgba(201,168,76,.15)', color: 'var(--gold)', fontSize: 9, padding: '1px 5px', borderRadius: 8 }}>{c.event_count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <input
            style={{ flex: 1, minWidth: 220, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', borderRadius: 4, transition: 'border-color .2s' }}
            placeholder="🔍 Tìm kiếm sự kiện, địa điểm..."
            defaultValue={search}
            onChange={e => set('search', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Filter toggle */}
          <button onClick={() => setShowFilter(s => !s)} className="btn btn-dark btn-sm" style={{ position: 'relative' }}>
            ⚙ Bộ lọc {activeFilters > 0 && <span style={{ background: 'var(--gold)', color: '#1a1510', width: 16, height: 16, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>{activeFilters}</span>}
          </button>

          {/* Sort */}
          <div style={{ display: 'flex', gap: 4 }}>
            {SORTS.map(s => (
              <button key={s.v} onClick={() => set('sort', s.v)} className="btn btn-sm"
                style={{ background: sort === s.v ? 'var(--dark)' : 'none', color: sort === s.v ? 'var(--gold)' : 'var(--text3)', border: '1px solid ' + (sort === s.v ? 'var(--gold)' : 'var(--border)') }}>
                {s.l}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {[['grid', '⊞'], ['list', '☰']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{ background: viewMode === mode ? 'var(--dark)' : 'none', border: 'none', color: viewMode === mode ? 'var(--gold)' : 'var(--text3)', padding: '7px 12px', cursor: 'pointer', fontSize: 16 }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Bộ lọc mở rộng */}
        {showFilter && (
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Khoảng giá</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PRICE_RANGES.map(pr => (
                  <button key={pr.v} onClick={() => set('price', pr.v)} className="btn btn-sm"
                    style={{ background: priceRange === pr.v ? 'var(--dark)' : 'none', color: priceRange === pr.v ? 'var(--gold)' : 'var(--text3)', border: '1px solid ' + (priceRange === pr.v ? 'var(--gold)' : 'var(--border)') }}>
                    {pr.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Hình thức</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['', 'Tất cả'], ['offline', '🏛 Trực tiếp'], ['online', '💻 Trực tuyến']].map(([v, l]) => (
                  <button key={v} onClick={() => set('type', v)} className="btn btn-sm"
                    style={{ background: typeFilter === v ? 'var(--dark)' : 'none', color: typeFilter === v ? 'var(--gold)' : 'var(--text3)', border: '1px solid ' + (typeFilter === v ? 'var(--gold)' : 'var(--border)') }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { set('price', ''); set('type', ''); set('category', ''); }} style={{ background: 'none', border: 'none', color: '#8b1a1a', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>
                × Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
          Tìm thấy <strong style={{ color: 'var(--text)' }}>{total}</strong> sự kiện
          {search && ` cho "${search}"`}
          {category && categories.find(c => c.slug === category) && ` trong "${categories.find(c => c.slug === category)?.name}"`}
        </div>

        {/* Event list */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(290px,1fr))' : '1fr', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 320 : 120, borderRadius: 4 }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, marginBottom: 6 }}>Không tìm thấy sự kiện nào</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
            <button className="btn btn-dark" onClick={() => { setSp({}); }}>Xóa tất cả bộ lọc</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(290px,1fr))' : '1fr', gap: 16 }}>
            {events.map(e => viewMode === 'grid'
              ? <EventCardGrid key={e.id} event={e} onClick={() => nav(`/events/${e.id}`)} />
              : <EventCardList key={e.id} event={e} onClick={() => nav(`/events/${e.id}`)} />
            )}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40, alignItems: 'center' }}>
            <button className="btn btn-dark btn-sm" disabled={page === 1} onClick={() => load(page - 1)}>← Trang trước</button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => load(i + 1)}
                style={{ width: 34, height: 34, border: '1px solid ' + (page === i + 1 ? 'var(--gold)' : 'var(--border)'), background: page === i + 1 ? 'var(--gold)' : 'none', color: page === i + 1 ? '#1a1510' : 'var(--text3)', cursor: 'pointer', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-dark btn-sm" disabled={page === pages} onClick={() => load(page + 1)}>Trang sau →</button>
          </div>
        )}
      </div>
    </div>
  );
}
