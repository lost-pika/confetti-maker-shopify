import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  ArrowLeft,
  Zap,
  Ticket,
  Edit2,
  Trash2,
  Circle,
  Square,
  Heart,
  Star,
  Sparkles,
} from 'lucide-react';

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
    if (!activeConfig) return;

    const burstType = activeConfig.burstType || 'cannon';
    const colors = activeConfig.colors || ['#FFB396'];
    const shapes = activeConfig.shapes || ['circle'];

    switch (burstType) {
      case 'fireworks':
        // Multiple bursts in different directions
        const end = Date.now() + 500;
        const interval = setInterval(() => {
          if (Date.now() > end) clearInterval(interval);
          confetti({
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
        confetti({
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
        confetti({
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
        confetti({
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
    <div className="min-h-screen bg-white text-gray-900">
      <div className="px-12 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Confetti Maker
              </h1>
              <p className="text-sm text-gray-500 mt-1">Create magical moment triggers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drafts..."
                className="pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              JD
            </div>
          </div>
        </div>

        {/* Launch Section */}
        <section className="relative mb-12 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-10 overflow-hidden">
          <div className="flex items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">Ready to Launch?</h2>
              <p className="text-gray-600 text-sm max-w-md leading-relaxed">
                Deploy your confetti effects and voucher triggers across your storefront with beautiful precision.
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <button className="px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Launch Now
              </button>
              <div className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status: Ready
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { value: '247', label: 'Confetti Launches', icon: '⚡' },
            { value: '18', label: 'Total Vouchers', icon: '🎫' },
            { value: '5', label: 'Templates Available', icon: '📋' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-orange-600 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Drafts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Saved Drafts</h3>
              <div className="inline-flex rounded-lg bg-gray-100 border border-gray-200 p-1 gap-1">
                {['confetti', 'voucher'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveDraftTab(tab);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all capitalize ${
                      activeDraftTab === tab
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="inline-flex rounded-lg bg-gray-100 border border-gray-200 p-1 gap-1">
                {['saved', 'predefined'].map((source) => (
                  <button
                    key={source}
                    onClick={() => setContentSource(source)}
                    className={`px-4 py-2 rounded-md text-[11px] font-bold transition-all capitalize ${
                      contentSource === source
                        ? 'bg-white text-orange-600 border border-orange-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {source === 'saved' ? 'Saved' : 'Templates'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateNew}
                className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-orange-300"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                      {activeDraftTab === 'confetti' ? '⚡' : '🎫'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">
                        {item.isPredefined ? 'Template' : item.createdAt}
                      </p>
                    </div>
                  </div>

                  {!item.isPredefined && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEditDraft(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-orange-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          deleteDraft(item.id, activeDraftTab === 'confetti')
                        }
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {item.isPredefined && (
                    <button
                      onClick={() => handleEditDraft(item)}
                      className="text-xs font-bold text-white px-3 py-1.5 hover:bg-orange-600 rounded-lg transition-colors flex-shrink-0 bg-orange-500"
                    >
                      Use Template
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No {activeDraftTab}s found</p>
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
    <div className="flex h-screen w-full bg-white text-gray-900 overflow-hidden">
      {/* Settings Panel */}
      <aside className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 bg-white">
          <button
            onClick={() => setView('dashboard')}
            className="p-1.5 rounded-lg text-orange-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-sm text-gray-900">Settings</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* General Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
              General
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600">Name</label>
              <input
                type="text"
                value={activeConfig.title}
                onChange={(e) =>
                  setActiveConfig({ ...activeConfig, title: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            {isVoucher && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600">
                  Voucher Code
                </label>
                <input
                  type="text"
                  value={activeConfig.code}
                  onChange={(e) =>
                    setActiveConfig({ ...activeConfig, code: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-mono font-bold tracking-[0.15em] uppercase text-orange-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
            )}
          </section>

          {/* Burst Type */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
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
                  className={`p-3 rounded-lg text-xs font-bold transition-all border ${
                    activeConfig.burstType === burst.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
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
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
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
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
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
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
              Physics
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600">
                    Gravity
                  </label>
                  <span className="text-xs font-bold text-orange-600">
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
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600">
                    Spread
                  </label>
                  <span className="text-xs font-bold text-orange-600">
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
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600">
                    Particle Count
                  </label>
                  <span className="text-xs font-bold text-orange-600">
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
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
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
                    className="w-full aspect-square rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-500 transition-all shadow-sm"
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
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg"
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
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-xl flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-all"
              >
                +
              </button>
            </div>
          </section>

          <button
            onClick={fire}
            className="w-full py-3 rounded-lg font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Test Confetti
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-200 bg-white space-y-3">
          <button
            onClick={saveDraft}
            className="w-full py-2.5 rounded-lg font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all"
          >
            Save Draft
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="w-full py-2.5 rounded-lg font-bold text-sm border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white shadow-sm">
          <h3 className="font-bold text-sm text-gray-900">Live Preview</h3>
          <button className="px-5 py-2 rounded-lg font-bold text-xs bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all">
            Deploy to Shopify
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">

          <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-md">
            {isVoucher && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-3xl border-2 border-orange-200 group-hover:border-orange-400 shadow-xl px-10 py-12 w-full transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white mx-auto mb-4 text-3xl shadow-lg">
                    🎫
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    {activeConfig.title}
                  </h4>
                  <div className="bg-gray-100 border border-gray-300 rounded-xl py-3 px-6 font-mono text-2xl font-bold tracking-[0.25em] text-orange-600">
                    {activeConfig.code}
                  </div>
                </div>
              </div>
            )}

            {!isVoucher && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl border-2 border-gray-200 group-hover:border-orange-400 h-64 w-full flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute inset-0 opacity-40">
                    {activeConfig.colors?.map((color, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full animate-pulse"
                        style={{
                          width: Math.random() * 80 + 30 + 'px',
                          height: Math.random() * 80 + 30 + 'px',
                          left: Math.random() * 100 + '%',
                          top: Math.random() * 100 + '%',
                          backgroundColor: color,
                          filter: 'blur(2px)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 font-bold text-sm relative z-10">
                    Preview your confetti
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                onClick={fire}
                className="px-10 py-4 rounded-2xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isVoucher ? 'Reveal Voucher' : 'Launch Confetti'}
                </span>
              </button>
              <div className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Click to burst
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}