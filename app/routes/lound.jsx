import React, { useState, useCallback, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  Edit2,
  Trash2,
  Circle,
  Square,
  Heart,
  Star,
  Sparkles,
  Plus
} from 'lucide-react';

// --- Loader for environment compatibility ---
const loadConfetti = () => {
  if (window.confetti) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const SHAPE_OPTIONS = [
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'square', label: 'Square', icon: Square },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'star', label: 'Star', icon: Star },
];

const BURST_TYPES = [
  { id: 'cannon', label: '🎯 Cannon', value: 'cannon' },
  { id: 'fireworks', label: '✨ Fireworks', value: 'fireworks' },
  { id: 'pride', label: '🌈 Pride', value: 'pride' },
  { id: 'snow', label: '❄️ Snow', value: 'snow' },
];

const PREDEFINED_CONFETTI = [
  {
    id: 'p1',
    title: 'Midnight Stars',
    particleCount: 200,
    shapes: ['star'],
    colors: ['#2c3e50', '#f1c40f'],
    burstType: 'fireworks',
    isPredefined: true,
    gravity: 1.0,
    spread: 90,
  },
  {
    id: 'p2',
    title: 'Rainbow Splash',
    particleCount: 300,
    shapes: ['circle', 'square'],
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFD700', '#FF69B4'],
    burstType: 'pride',
    isPredefined: true,
    gravity: 0.8,
    spread: 120,
  },
  {
    id: 'p3',
    title: 'Celebration Gold',
    particleCount: 250,
    shapes: ['circle'],
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4'],
    burstType: 'cannon',
    isPredefined: true,
    gravity: 1.2,
    spread: 80,
  },
];

const PREDEFINED_VOUCHERS = [
  {
    id: 'v1',
    title: '10% Welcome Discount',
    code: 'WELCOME10',
    particleCount: 150,
    isPredefined: true,
    colors: ['#FFB396'],
    burstType: 'fireworks',
    gravity: 1.0,
    spread: 70,
  },
  {
    id: 'v2',
    title: 'Free Shipping Voucher',
    code: 'FREESHIP',
    particleCount: 180,
    isPredefined: true,
    colors: ['#FF6B9D', '#C44569'],
    burstType: 'cannon',
    gravity: 1.1,
    spread: 75,
  },
];

export default function ConfettiApp() {
  const [view, setView] = useState('dashboard');
  const [activeDraftTab, setActiveDraftTab] = useState('confetti');
  const [contentSource, setContentSource] = useState('saved');
  const [searchQuery, setSearchQuery] = useState('');

  // Load confetti on mount
  useEffect(() => {
    loadConfetti();
  }, []);

  const [savedConfetti, setSavedConfetti] = useState([
    {
      id: 1,
      title: 'Summer Sale Blast',
      particleCount: 150,
      createdAt: '2 days ago',
      shapes: ['circle'],
      colors: ['#FFB396', '#FFD1BA'],
      spread: 70,
      gravity: 1.0,
      burstType: 'cannon',
    },
    {
      id: 2,
      title: 'Checkout Success',
      particleCount: 250,
      createdAt: '1 week ago',
      shapes: ['square', 'circle'],
      colors: ['#FFB396', '#FFA07A'],
      spread: 90,
      gravity: 0.8,
      burstType: 'fireworks',
    },
  ]);

  const [savedVouchers, setSavedVouchers] = useState([
    {
      id: 101,
      title: 'Black Friday Voucher',
      code: 'BF2024',
      particleCount: 200,
      createdAt: '1 week ago',
      colors: ['#FFB396'],
      spread: 70,
      gravity: 1.0,
      burstType: 'cannon',
    },
  ]);

  const [activeConfig, setActiveConfig] = useState(null);

  const currentList =
    activeDraftTab === 'confetti'
      ? contentSource === 'predefined'
        ? PREDEFINED_CONFETTI
        : savedConfetti
      : contentSource === 'predefined'
      ? PREDEFINED_VOUCHERS
      : savedVouchers;

  const filteredList = currentList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setActiveConfig({
      id: Date.now(),
      type: activeDraftTab,
      title:
        activeDraftTab === 'confetti'
          ? 'New Confetti Blast'
          : 'New Voucher',
      particleCount: 150,
      spread: 70,
      shapes: ['circle'],
      gravity: 1.0,
      drift: 0,
      startVelocity: 45,
      decay: 0.9,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFB396', '#FFD1BA'],
      code: activeDraftTab === 'voucher' ? 'SAVE20' : '',
      burstType: 'cannon',
    });
    setView('editor');
  };

  const handleEditDraft = (item) => {
    if (item.isPredefined) {
      setActiveConfig({
        ...item,
        id: Date.now(),
        type: activeDraftTab,
        isPredefined: false,
      });
    } else {
      setActiveConfig({ ...item, type: activeDraftTab });
    }
    setView('editor');
  };

  const saveDraft = () => {
    if (!activeConfig) return;
    const isConfetti = activeConfig.type === 'confetti';
    const listToUpdate = isConfetti ? savedConfetti : savedVouchers;
    const listSetter = isConfetti ? setSavedConfetti : setSavedVouchers;

    const existingIndex = listToUpdate.findIndex(
      (item) => item.id === activeConfig.id
    );

    let newList;
    if (existingIndex > -1) {
      newList = [...listToUpdate];
      newList[existingIndex] = {
        ...activeConfig,
        createdAt: 'Just now',
        isPredefined: false,
      };
    } else {
      newList = [
        {
          ...activeConfig,
          createdAt: 'Just now',
          isPredefined: false,
        },
        ...listToUpdate,
      ];
    }
    listSetter(newList);
    setView('dashboard');
    setActiveConfig(null);
  };

  const deleteDraft = (id, isConfetti) => {
    if (isConfetti) {
      setSavedConfetti(savedConfetti.filter((item) => item.id !== id));
    } else {
      setSavedVouchers(savedVouchers.filter((item) => item.id !== id));
    }
  };

  const fire = useCallback(() => {
    if (!activeConfig || !window.confetti) return;

    const burstType = activeConfig.burstType || 'cannon';
    const colors = activeConfig.colors || ['#FFB396'];
    const shapes = activeConfig.shapes || ['circle'];

    switch (burstType) {
      case 'fireworks':
        // Multiple bursts in different directions
        const end = Date.now() + 500;
        const interval = setInterval(() => {
          if (Date.now() > end) clearInterval(interval);
          window.confetti({
            particleCount: activeConfig.particleCount / 5,
            spread: activeConfig.spread || 70,
            origin: {
              x: Math.random(),
              y: Math.random() * 0.5,
            },
            colors,
            shapes,
            gravity: activeConfig.gravity || 1,
            drift: Math.random() - 0.5,
            startVelocity: activeConfig.startVelocity || 45,
          });
        }, 100);
        break;

      case 'pride':
        // Burst with rainbow colors
        window.confetti({
          particleCount: activeConfig.particleCount,
          spread: activeConfig.spread || 90,
          origin: activeConfig.origin || { x: 0.5, y: 0.6 },
          colors: [
            '#FF0000',
            '#FF7F00',
            '#FFFF00',
            '#00FF00',
            '#0000FF',
            '#4B0082',
            '#9400D3',
          ],
          shapes,
          gravity: activeConfig.gravity || 1,
          startVelocity: activeConfig.startVelocity || 50,
        });
        break;

      case 'snow':
        // Gentle downward confetti
        window.confetti({
          particleCount: activeConfig.particleCount,
          spread: activeConfig.spread || 180,
          origin: { x: 0.5, y: -0.1 },
          colors: ['#FFFFFF', '#E0F6FF', '#D4EDFF'],
          shapes: ['circle'],
          gravity: 0.3,
          drift: Math.random() - 0.5,
          startVelocity: 10,
        });
        break;

      case 'cannon':
      default:
        // Classic cannon burst
        window.confetti({
          particleCount: activeConfig.particleCount,
          spread: activeConfig.spread || 70,
          origin: activeConfig.origin || { x: 0.5, y: 0.6 },
          colors,
          shapes,
          gravity: activeConfig.gravity || 1,
          drift: activeConfig.drift || 0,
          startVelocity: activeConfig.startVelocity || 45,
        });
        break;
    }
  }, [activeConfig]);

  if (view === 'dashboard') {
    return (
      <DashboardView
        {...{
          activeDraftTab,
          setActiveDraftTab,
          contentSource,
          setContentSource,
          searchQuery,
          setSearchQuery,
          filteredList,
          handleCreateNew,
          handleEditDraft,
          deleteDraft,
          savedConfetti,
          savedVouchers,
        }}
      />
    );
  }

  return (
    <EditorView
      {...{
        activeConfig,
        setActiveConfig,
        fire,
        saveDraft,
        setView,
      }}
    />
  );
}

function DashboardView({
  activeDraftTab,
  setActiveDraftTab,
  contentSource,
  setContentSource,
  searchQuery,
  setSearchQuery,
  filteredList,
  handleCreateNew,
  handleEditDraft,
  deleteDraft,
  savedConfetti,
  savedVouchers,
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Confetti Maker
              </h1>
              <p className="text-sm text-slate-500 mt-1">Create magical moment triggers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border border-slate-300">
              JD
            </div>
          </div>
        </div>

        {/* Launch Section - Cleaned up */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-between gap-8 shadow-sm mb-10">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Ready to Launch?</h2>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
              Deploy your confetti effects and voucher triggers across your storefront.
            </p>
          </div>
          <div className="text-center flex-shrink-0 flex flex-col items-center">
            <button className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
              Launch App
            </button>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Status: Offline
            </div>
          </div>
        </div>

        {/* Stats - Simplified */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { value: '247', label: 'Confetti Launches' },
            { value: '18', label: 'Total Vouchers' },
            { value: '5', label: 'Templates Available' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-center shadow-sm"
            >
              <div className="text-3xl font-black text-slate-900">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 font-semibold uppercase mt-1 tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Drafts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Saved Drafts</h3>
              <div className="inline-flex rounded-lg bg-white border border-slate-200 p-1 gap-1 shadow-sm">
                {['confetti', 'voucher'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveDraftTab(tab);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${
                      activeDraftTab === tab
                        ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg bg-white border border-slate-200 p-1 gap-1 shadow-sm">
                {['saved', 'predefined'].map((source) => (
                  <button
                    key={source}
                    onClick={() => setContentSource(source)}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all capitalize ${
                      contentSource === source
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {source === 'saved' ? 'Saved' : 'Templates'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateNew}
                className="w-9 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${activeDraftTab === 'confetti' ? 'bg-orange-50 text-orange-600' : 'bg-pink-50 text-pink-600'}`}>
                      {activeDraftTab === 'confetti' ? '⚡' : '🎫'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">
                        {item.isPredefined ? 'Template' : item.createdAt}
                      </p>
                    </div>
                  </div>

                  {!item.isPredefined && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEditDraft(item)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          deleteDraft(item.id, activeDraftTab === 'confetti')
                        }
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {item.isPredefined && (
                    <button
                      onClick={() => handleEditDraft(item)}
                      className="text-xs font-bold text-orange-600 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      Use Template
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No {activeDraftTab}s found</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EditorView({ activeConfig, setActiveConfig, fire, saveDraft, setView }) {
  if (!activeConfig) return null;

  const isVoucher = activeConfig.type === 'voucher';

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* Settings Panel */}
      <aside className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden z-10 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <button
            onClick={() => setView('dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-sm text-slate-900">Configuration</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* General Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              General
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Name</label>
              <input
                type="text"
                value={activeConfig.title}
                onChange={(e) =>
                  setActiveConfig({ ...activeConfig, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            {isVoucher && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">
                  Voucher Code
                </label>
                <input
                  type="text"
                  value={activeConfig.code}
                  onChange={(e) =>
                    setActiveConfig({ ...activeConfig, code: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-mono font-bold tracking-[0.1em] uppercase text-orange-600 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            )}
          </section>

          {/* Burst Type */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Burst Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {BURST_TYPES.map((burst) => (
                <button
                  key={burst.id}
                  onClick={() =>
                    setActiveConfig({
                      ...activeConfig,
                      burstType: burst.value,
                    })
                  }
                  className={`p-2.5 rounded-lg text-xs font-bold transition-all border ${
                    activeConfig.burstType === burst.value
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {burst.label}
                </button>
              ))}
            </div>
          </section>

          {/* Shapes */}
          {!isVoucher && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Shapes
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {SHAPE_OPTIONS.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      const shapes = activeConfig.shapes || [];
                      const newShapes = shapes.includes(shape.id)
                        ? shapes.filter((s) => s !== shape.id)
                        : [...shapes, shape.id];
                      setActiveConfig({
                        ...activeConfig,
                        shapes: newShapes.length > 0 ? newShapes : ['circle'],
                      });
                    }}
                    className={`p-3 rounded-lg transition-all border aspect-square flex items-center justify-center ${
                      (activeConfig.shapes || []).includes(shape.id)
                        ? 'bg-pink-50 border-pink-500 text-pink-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400'
                    }`}
                    title={shape.label}
                  >
                    <shape.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Physics Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Physics
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">
                    Gravity
                  </label>
                  <span className="text-xs font-bold text-orange-500">
                    {activeConfig.gravity.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={activeConfig.gravity}
                  onChange={(e) =>
                    setActiveConfig({
                      ...activeConfig,
                      gravity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-orange-500 cursor-pointer bg-slate-200 rounded-lg h-1.5 appearance-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">
                    Spread
                  </label>
                  <span className="text-xs font-bold text-orange-500">
                    {activeConfig.spread}°
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={360}
                  value={activeConfig.spread}
                  onChange={(e) =>
                    setActiveConfig({
                      ...activeConfig,
                      spread: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-orange-500 cursor-pointer bg-slate-200 rounded-lg h-1.5 appearance-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">
                    Particle Count
                  </label>
                  <span className="text-xs font-bold text-orange-500">
                    {activeConfig.particleCount}
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={activeConfig.particleCount}
                  onChange={(e) =>
                    setActiveConfig({
                      ...activeConfig,
                      particleCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-orange-500 cursor-pointer bg-slate-200 rounded-lg h-1.5 appearance-none"
                />
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Colors
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {(activeConfig.colors || []).map((color, i) => (
                <div key={i} className="relative group">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const next = [...(activeConfig.colors || [])];
                      next[i] = e.target.value;
                      setActiveConfig({ ...activeConfig, colors: next });
                    }}
                    className="w-full aspect-square rounded-lg border border-slate-200 cursor-pointer shadow-sm"
                  />
                  <button
                    onClick={() => {
                      const next = activeConfig.colors.filter(
                        (_, idx) => idx !== i
                      );
                      setActiveConfig({
                        ...activeConfig,
                        colors: next.length > 0 ? next : ['#FFB396'],
                      });
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-200 hover:bg-red-500 text-slate-600 hover:text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setActiveConfig({
                    ...activeConfig,
                    colors: [...(activeConfig.colors || []), '#FFB396'],
                  })
                }
                className="aspect-square border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          <button
            onClick={fire}
            className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2"
          >
             <Sparkles className="w-4 h-4" />
             Test Confetti
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-3 bg-white">
          <button
            onClick={saveDraft}
            className="w-full py-2.5 rounded-lg font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="w-full py-2.5 rounded-lg font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9]">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-slate-900">Live Preview</h3>
          <button className="px-4 py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Deploy to Shopify
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

          <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-md w-full">
            {isVoucher && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl px-10 py-12 w-full">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mx-auto mb-4">
                   <Ticket className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">
                  {activeConfig.title}
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-6 font-mono text-2xl font-bold tracking-[0.1em] text-slate-800">
                  {activeConfig.code}
                </div>
              </div>
            )}

            {!isVoucher && (
              <div className="relative bg-white rounded-2xl border border-slate-200 h-64 w-full flex items-center justify-center overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-40">
                  {activeConfig.colors?.map((color, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: Math.random() * 80 + 30 + 'px',
                        height: Math.random() * 80 + 30 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        backgroundColor: color,
                        filter: 'blur(20px)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-slate-400 font-medium text-sm relative z-10 flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  Preview Area
                </p>
              </div>
            )}

            <div>
              <button
                onClick={fire}
                className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isVoucher ? 'Reveal Voucher' : 'Launch Confetti'}
              </button>
              <div className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Click to test
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}