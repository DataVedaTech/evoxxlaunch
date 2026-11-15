import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  FolderDown,
  PackagePlus,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Send,
  AlertTriangle,
  FileSpreadsheet,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Search,
  ShieldCheck,
  ArrowRight,
  Download,
  Copy,
  Check,
  Eye,
  Edit3
} from 'lucide-react';

const STATUS_BADGES = {
  Live: 'bg-green-100 text-[#16A34A] border-green-200',
  Accepted: 'bg-green-100 text-[#16A34A] border-green-200',
  Ready: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
  Draft: 'bg-gray-100 text-gray-700 border-gray-200',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Error: 'bg-red-100 text-[#DC2626] border-red-200',
  Invalid: 'bg-red-100 text-[#DC2626] border-red-200',
  'Needs Review': 'bg-amber-100 text-[#F59E0B] border-amber-200',
};

const COLOURS = ['Black', 'White', 'Navy', 'Olive', 'Maroon', 'Grey', 'Charcoal', 'Mustard', 'Red', 'Blue', 'Beige'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FABRICS = ['Cotton', '100% Combed Cotton', 'Cotton Blend', 'Polyester', 'Pique Cotton', 'French Terry'];
const FITS = ['Regular', 'Slim', 'Oversized', 'Relaxed'];
const SLEEVES = ['Half Sleeve', 'Full Sleeve', 'Sleeveless'];
const NECKS = ['Round Neck', 'V-Neck', 'Polo Collar', 'Henley Neck', 'High Neck'];
const IMAGE_ROLES = ['Main', 'Front', 'Back', 'Fabric', 'Size Chart', 'Lifestyle', 'Detail'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [appSettings, setAppSettings] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [sumRes, prodRes, setRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/products'),
        fetch('/api/settings'),
      ]);
      const sumData = await sumRes.json();
      const prodData = await prodRes.json();
      const setData = await setRes.json();
      setSummary(sumData);
      setProducts(prodData);
      setAppSettings(setData);
      if (prodData.length > 0 && !selectedProduct) {
        setSelectedProduct(prodData[0]);
      } else if (selectedProduct) {
        const updated = prodData.find((p) => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, [selectedProduct]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const navigateWithProduct = (tab, product, filter = 'All') => {
    if (product) setSelectedProduct(product);
    setStatusFilter(filter);
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drive', label: 'Google Drive Import', icon: FolderDown },
    { id: 'products', label: 'Products & Editor', icon: PackagePlus },
    { id: 'ai', label: 'AI Content Studio', icon: Sparkles },
    { id: 'images', label: 'Image Manager', icon: ImageIcon },
    { id: 'variations', label: 'Variation Manager', icon: Layers },
    { id: 'amazon', label: 'Amazon Publish', icon: Send },
    { id: 'errors', label: 'Error Center', icon: AlertTriangle, badge: summary?.errors || 0 },
    { id: 'export', label: 'Bulk Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#111827]">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-[#101828] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center font-bold text-xl tracking-tight shadow-lg shadow-orange-500/20">
            E
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">EvoxxLaunch</h1>
            <span className="text-xs text-gray-400 font-medium">Amazon IN Automation</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-[#DC2626] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Marketplace & Test Mode Footer */}
        <div className="p-4 m-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Marketplace</span>
            <span className="font-mono-num text-gray-200 font-medium">Amazon.in</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">ID</span>
            <span className="font-mono-num text-gray-300">A21TJRUUN4KGV</span>
          </div>
          <div className="pt-1 border-t border-gray-800 flex items-center justify-between">
            <span className="text-gray-400">Safety Mode</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold ${
                appSettings.test_mode === 'true'
                  ? 'bg-amber-500/20 text-[#F59E0B]'
                  : 'bg-green-500/20 text-[#16A34A]'
              }`}
            >
              {appSettings.test_mode === 'true' ? 'Test Sandbox' : 'Live SP-API'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-gray-500">
              Google Drive images → SKU generation → product details → Amazon-ready listing → live Amazon product
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedProduct && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs">
                <span className="text-gray-500">Active SKU:</span>
                <span className="font-mono-num font-semibold text-[#111827]">{selectedProduct.sku}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    STATUS_BADGES[selectedProduct.status] || STATUS_BADGES.Draft
                  }`}
                >
                  {selectedProduct.status}
                </span>
              </div>
            )}
            <button
              onClick={() => setActiveTab('drive')}
              className="px-3.5 py-2 rounded-lg bg-[#101828] hover:bg-gray-800 text-white text-xs font-semibold flex items-center gap-2 transition"
            >
              <FolderDown className="w-3.5 h-3.5" />
              Import Drive
            </button>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setActiveTab('products');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white border-gray-200 max-w-md animate-bounce">
            {toast.type === 'error' ? (
              <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-800">{toast.message}</span>
          </div>
        )}

        {/* Screen Router */}
        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              summary={summary}
              products={products}
              onNavigate={(tab, filter = 'All') => {
                setStatusFilter(filter);
                setActiveTab(tab);
              }}
              onSelectProduct={navigateWithProduct}
              onRefresh={fetchAllData}
              showToast={showToast}
            />
          )}
          {activeTab === 'drive' && (
            <DriveImportScreen
              onImported={(newProds) => {
                fetchAllData();
                if (newProds.length > 0) setSelectedProduct(newProds[0]);
                showToast(`Imported ${newProds.length} Evoxx product drafts from Google Drive!`);
                setStatusFilter('All');
                setActiveTab('products');
              }}
              showToast={showToast}
            />
          )}
          {activeTab === 'products' && (
            <ProductsScreen
              products={products}
              selectedProduct={selectedProduct}
              statusFilter={statusFilter}
              onChangeStatusFilter={setStatusFilter}
              onSelectProduct={setSelectedProduct}
              onSaved={() => {
                fetchAllData();
              }}
              onNavigate={navigateWithProduct}
              showToast={showToast}
            />
          )}
          {activeTab === 'ai' && (
            <AIContentScreen
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onSaved={fetchAllData}
              showToast={showToast}
            />
          )}
          {activeTab === 'images' && (
            <ImageManagerScreen
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onSaved={fetchAllData}
              showToast={showToast}
            />
          )}
          {activeTab === 'variations' && (
            <VariationManagerScreen
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onSaved={fetchAllData}
              showToast={showToast}
            />
          )}
          {activeTab === 'amazon' && (
            <AmazonPublishScreen
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onPublished={fetchAllData}
              onNavigate={navigateWithProduct}
              appSettings={appSettings}
              showToast={showToast}
            />
          )}
          {activeTab === 'errors' && (
            <ErrorCenterScreen
              products={products}
              onFixProduct={(prod) => navigateWithProduct('products', prod)}
              showToast={showToast}
            />
          )}
          {activeTab === 'export' && (
            <BulkExportScreen products={products} showToast={showToast} />
          )}
          {activeTab === 'settings' && (
            <SettingsScreen
              appSettings={appSettings}
              onUpdated={(newSet) => {
                setAppSettings(newSet);
                showToast('Settings saved successfully');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================================
   6.1 DASHBOARD SCREEN
============================================================================ */
function DashboardScreen({ summary, products, onNavigate, onSelectProduct, onRefresh }) {
  const stats = [
    {
      label: 'Total Products',
      value: summary?.total_products ?? 0,
      color: 'text-[#111827]',
      sub: 'Click to view all products →',
      targetTab: 'products',
      filter: 'All',
    },
    {
      label: 'Live Listings',
      value: summary?.live_listings ?? 0,
      color: 'text-[#16A34A]',
      sub: 'Click to filter Live on Amazon.in →',
      targetTab: 'products',
      filter: 'Live',
    },
    {
      label: 'Drafts & Ready',
      value: summary?.drafts ?? 0,
      color: 'text-[#FF6B00]',
      sub: 'Click to filter Drafts awaiting publish →',
      targetTab: 'products',
      filter: 'Draft',
    },
    {
      label: 'Validation Errors',
      value: summary?.errors ?? 0,
      color: 'text-[#DC2626]',
      sub: 'Click to open Error Center →',
      targetTab: 'errors',
      filter: 'Error',
    },
    {
      label: 'Images Processed',
      value: summary?.images_processed ?? 0,
      color: 'text-[#101828]',
      sub: 'Click to open Image Manager →',
      targetTab: 'images',
      filter: 'All',
    },
    {
      label: 'Amazon Issues',
      value: summary?.amazon_issues ?? 0,
      color: 'text-[#F59E0B]',
      sub: 'Click to inspect SP-API submissions →',
      targetTab: 'amazon',
      filter: 'All',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Welcome back, Hrishi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your Evoxx T-shirt listings from one place — from Google Drive model shoots to live Amazon India products.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('drive')}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <FolderDown className="w-4 h-4" />
            Import Images from Google Drive
          </button>
          <button
            onClick={() => onNavigate('products', 'All')}
            className="px-4 py-2.5 rounded-xl bg-[#101828] hover:bg-gray-800 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <PackagePlus className="w-4 h-4" />
            Create New Product
          </button>
          <button
            onClick={() => onNavigate('export')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 text-sm font-semibold flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FF6B00]" />
            Export Amazon Template
          </button>
        </div>
      </div>

      {/* 6 Clickable Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(s.targetTab, s.filter)}
            className="text-left bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#FF6B00] hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-[#FF6B00] transition">
                {s.label}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition" />
            </div>
            <div className={`text-3xl font-bold font-mono-num mt-2 ${s.color}`}>{s.value}</div>
            <p className="text-xs text-gray-400 group-hover:text-gray-600 mt-1 transition">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Catalogue Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-base">Evoxx Product Catalogue</h3>
            <button
              onClick={() => onNavigate('products', 'All')}
              className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              View All ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {products.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct('products', p)}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-orange-50/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={p.main_image_url || 'https://via.placeholder.com/80'}
                    alt={p.sku}
                    className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-xs font-bold text-[#101828]">{p.sku}</span>
                      {p.parent_sku && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          Child of {p.parent_sku}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-md">{p.title}</p>
                    <span className="text-xs text-gray-500">
                      {p.colour} • Size {p.size} • {p.fabric || 'No fabric'} • Stock: {p.stock}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <div className="font-mono-num text-sm font-bold">₹{p.selling_price}</div>
                    <div className="font-mono-num text-[11px] text-gray-400 line-through">₹{p.mrp}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_BADGES[p.status] || STATUS_BADGES.Draft
                    }`}
                  >
                    {p.status}
                  </span>
                  <button
                    onClick={() => onSelectProduct('products', p)}
                    className="p-2 rounded-lg text-gray-500 hover:text-[#FF6B00] hover:bg-orange-50 transition"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectProduct('amazon', p)}
                    className="p-2 rounded-lg text-gray-500 hover:text-[#16A34A] hover:bg-green-50 transition"
                    title="Publish to Amazon"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Recent Activity</h3>
              <button
                onClick={onRefresh}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <div className="space-y-3">
              {(summary?.recent_activity || []).map((act, i) => {
                const matchedProd = products.find((p) => p.sku === act.sku);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (act.type === 'error') {
                        onSelectProduct('errors', matchedProd);
                      } else if (matchedProd) {
                        onSelectProduct('amazon', matchedProd);
                      } else {
                        onNavigate('amazon');
                      }
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-[#FF6B00] flex items-start justify-between gap-3 text-xs transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {act.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      ) : act.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{act.message}</p>
                        <span className="text-[11px] text-gray-400 font-mono-num">{act.sku} • Click to inspect →</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('errors')}
            className="mt-6 w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            Open Amazon Error Center
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6.2 GOOGLE DRIVE IMPORT SCREEN
============================================================================ */
function DriveImportScreen({ onImported, showToast }) {
  const [folderLink, setFolderLink] = useState('https://drive.google.com/drive/folders/Evoxx-TShirt-Models-2026');
  const [scanResult, setScanResult] = useState(null);
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/drive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_link: folderLink }),
      });
      const data = await res.json();
      setScanResult(data);
      setItems(data.images || []);
      showToast(`Scanned ${data.total_images} images in "${data.folder_name}"`);
    } catch (e) {
      showToast('Failed to scan Google Drive folder', 'error');
    } finally {
      setScanning(false);
    }
  };

  const toggleItem = (idx) => {
    const next = [...items];
    next[idx].selected = !next[idx].selected;
    setItems(next);
  };

  const updateItemField = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = value;
    setItems(next);
  };

  const handleImportSelected = async () => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      showToast('Please select at least one image to import', 'warning');
      return;
    }
    setImporting(true);
    try {
      const payload = {
        items: selected.map((i) => ({
          drive_file_id: i.drive_file_id,
          filename: i.filename,
          sku: i.sku,
          colour: i.detected_colour,
          width: i.width,
          height: i.height,
          file_size: i.file_size,
          image_url: i.image_url,
          checksum: i.checksum,
        })),
      };
      const res = await fetch('/api/drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onImported(data.products || []);
    } catch (e) {
      showToast('Failed to import selected images', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold">Import Evoxx Model Images from Google Drive</h3>
        <p className="text-xs text-gray-500">
          Paste a Google Drive folder link or select a connected folder. EvoxxLaunch automatically detects colours from filenames, checks image resolution (≥1000×1000 px), flags duplicates via MD5 checksum, and assigns unique SKUs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={folderLink}
            onChange={(e) => setFolderLink(e.target.value)}
            placeholder="Paste Google Drive folder link or ID..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Search className="w-4 h-4" />
            {scanning ? 'Scanning Drive...' : 'Scan Images'}
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="space-y-6">
          {/* Scan Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500">Total Images Found</span>
              <div className="text-2xl font-bold font-mono-num mt-1">{scanResult.total_images}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500">New Designs</span>
              <div className="text-2xl font-bold font-mono-num text-[#16A34A] mt-1">{scanResult.new_designs}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500">Duplicate Images</span>
              <div className="text-2xl font-bold font-mono-num text-[#DC2626] mt-1">{scanResult.duplicate_images}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500">Low-Res Warnings</span>
              <div className="text-2xl font-bold font-mono-num text-[#F59E0B] mt-1">{scanResult.low_res_warnings}</div>
            </div>
          </div>

          {/* Scanned Image Cards */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Scanned Model Images ({items.length})</h4>
                <p className="text-xs text-gray-500">Edit SKU or detected colour before importing into product drafts</p>
              </div>
              <button
                onClick={handleImportSelected}
                disabled={importing}
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <FolderDown className="w-4 h-4" />
                {importing
                  ? 'Importing...'
                  : `Import Selected Images (${items.filter((i) => i.selected).length})`}
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.drive_file_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItem(idx)}
                      className="w-4 h-4 accent-[#FF6B00] rounded cursor-pointer"
                    />
                    <img
                      src={item.image_url}
                      alt={item.filename}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-gray-100"
                    />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{item.filename}</div>
                      <div className="text-xs text-gray-500 font-mono-num mt-0.5">
                        Resolution: {item.resolution} px • {(item.file_size / 1024).toFixed(0)} KB
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {item.status === 'Ready' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-[#16A34A]">
                            Ready
                          </span>
                        )}
                        {item.status === 'Duplicate' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-[#DC2626]">
                            Duplicate Hash Detected
                          </span>
                        )}
                        {item.status === 'Low Resolution' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-[#F59E0B]">
                            Low Resolution (&lt;1000×1000)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 font-medium mb-1">Assigned SKU</label>
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => updateItemField(idx, 'sku', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 font-mono-num text-xs font-semibold w-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 font-medium mb-1">Detected Colour</label>
                      <select
                        value={item.detected_colour}
                        onChange={(e) => updateItemField(idx, 'detected_colour', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium bg-white"
                      >
                        {COLOURS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   6.3 PRODUCT CREATION & EDITOR SCREEN
============================================================================ */
function ProductsScreen({
  products,
  selectedProduct,
  statusFilter = 'All',
  onChangeStatusFilter,
  onSelectProduct,
  onSaved,
  onNavigate,
  showToast,
}) {
  const emptyForm = {
    sku: '',
    title: 'Evoxx Men’s Cotton Regular Fit Round Neck Half Sleeve T-Shirt',
    brand: 'Evoxx',
    product_type: 'T-Shirt',
    colour: 'Black',
    size: 'M',
    fabric: 'Cotton',
    fit: 'Regular',
    sleeve_type: 'Half Sleeve',
    neck_type: 'Round Neck',
    gender: 'Men',
    mrp: 999,
    selling_price: 499,
    stock: 50,
    barcode: '',
    fulfilment_channel: 'FBM',
    description: 'Evoxx brings you a comfortable everyday T-shirt designed with a clean, modern fit.',
    bullet_points: [
      'Premium breathable cotton fabric for all-day comfort',
      'Regular fit designed for a clean, modern look',
      'Soft round-neck collar with durable stitching',
      'Easy to pair with jeans, trousers, shorts, and casual wear',
      'Ideal for daily wear, college, office-casual, travel, and outings',
    ],
    backend_keywords: 'evoxx tshirt, men cotton t shirt, round neck half sleeve tshirt',
    main_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
  };

  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedProduct) {
      setForm({
        ...emptyForm,
        ...selectedProduct,
        barcode: selectedProduct.barcode || '',
        description: selectedProduct.description || '',
        backend_keywords: selectedProduct.backend_keywords || '',
        bullet_points:
          selectedProduct.bullet_points && selectedProduct.bullet_points.length > 0
            ? selectedProduct.bullet_points
            : emptyForm.bullet_points,
      });
    } else {
      fetch('/api/products/next-sku')
        .then((r) => r.json())
        .then((d) => setForm({ ...emptyForm, sku: d.sku }));
    }
  }, [selectedProduct]);

  const handleSave = async () => {
    try {
      const isEdit = Boolean(selectedProduct?.id);
      const url = isEdit ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || 'Error saving product', 'error');
        return;
      }
      const saved = await res.json();
      onSelectProduct(saved);
      onSaved();
      showToast(isEdit ? `Updated ${saved.sku}` : `Created product ${saved.sku}`);
    } catch (e) {
      showToast('Failed to save product', 'error');
    }
  };

  const handleValidate = async () => {
    if (!selectedProduct?.id) {
      showToast('Save the product draft first before validating', 'warning');
      return;
    }
    const res = await fetch(`/api/products/${selectedProduct.id}/validate`, { method: 'POST' });
    const data = await res.json();
    onSelectProduct(data.product);
    onSaved();
    if (data.valid) {
      showToast(`${data.product.sku} passed all Amazon India checks!`, 'success');
    } else {
      showToast(`${data.errors.length} validation error(s) found for ${data.product.sku}`, 'error');
    }
  };

  const handleQuickAI = async () => {
    if (!selectedProduct?.id) {
      showToast('Save the product draft first to run AI Content Generator', 'warning');
      return;
    }
    const res = await fetch(`/api/products/${selectedProduct.id}/generate-content?save_to_product=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tone: 'Premium',
        target_customer: 'Men aged 18–35',
        key_benefit: 'Comfort and everyday style',
      }),
    });
    const data = await res.json();
    onSelectProduct(data.product);
    onSaved();
    showToast(`Generated & applied Amazon-compliant AI content for ${data.product.sku}`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.colour.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (!statusFilter || statusFilter === 'All') return true;
    if (statusFilter === 'Draft') return p.status === 'Draft' || p.status === 'Ready';
    return p.status === statusFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Product List Selector */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col max-h-[82vh]">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Products ({filteredProducts.length})</h3>
            <button
              onClick={() => onSelectProduct(null)}
              className="px-2.5 py-1 rounded-lg bg-[#FF6B00] text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Draft
            </button>
          </div>
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Live', 'Draft', 'Error'].map((st) => (
              <button
                key={st}
                onClick={() => onChangeStatusFilter && onChangeStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  statusFilter === st
                    ? 'bg-[#101828] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'Draft' ? 'Drafts & Ready' : st}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, title, colour..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`w-full text-left p-3.5 flex items-center gap-3 transition ${
                  isSelected ? 'bg-orange-50/90 border-l-4 border-[#FF6B00]' : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={p.main_image_url || 'https://via.placeholder.com/60'}
                  alt={p.sku}
                  className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num text-xs font-bold text-[#101828]">{p.sku}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        STATUS_BADGES[p.status] || STATUS_BADGES.Draft
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-800 truncate mt-0.5">{p.title}</p>
                  <div className="text-[11px] text-gray-500 font-mono-num mt-0.5">
                    {p.colour} / {p.size} • ₹{p.selling_price} • Qty: {p.stock}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Product Creation / Editing Form */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF6B00]">
              {selectedProduct ? 'Edit Evoxx Product' : 'Create New Evoxx Product'}
            </span>
            <h3 className="text-lg font-bold font-mono-num mt-0.5">{form.sku || 'Generating SKU...'}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleQuickAI}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate AI Content
            </button>
            <button
              onClick={handleValidate}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Validate
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-semibold shadow-sm transition"
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* Top Preview & Title */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-32 h-32 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shrink-0 relative group">
            <img
              src={form.main_image_url || 'https://via.placeholder.com/200'}
              alt="Main Preview"
              className="w-full h-full object-cover"
            />
            {selectedProduct && (
              <button
                onClick={() => onNavigate('images', selectedProduct)}
                className="absolute inset-0 bg-black/50 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
              >
                Manage Images
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SKU *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono-num text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Brand *</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Product Type *</label>
                <select
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  <option>T-Shirt</option>
                  <option>Polo</option>
                  <option>Oversized T-Shirt</option>
                  <option>Hoodie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amazon Product Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Apparel Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Colour *</label>
            <select
              value={form.colour}
              onChange={(e) => setForm({ ...form, colour: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              {COLOURS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Size *</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fabric *</label>
            <select
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option value="">-- Select Fabric --</option>
              {FABRICS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fit Type *</label>
            <select
              value={form.fit}
              onChange={(e) => setForm({ ...form, fit: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              {FITS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sleeve Type *</label>
            <select
              value={form.sleeve_type}
              onChange={(e) => setForm({ ...form, sleeve_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              {SLEEVES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Neck Type *</label>
            <select
              value={form.neck_type}
              onChange={(e) => setForm({ ...form, neck_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              {NECKS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Gender *</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option>Men</option>
              <option>Women</option>
              <option>Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fulfilment</label>
            <select
              value={form.fulfilment_channel}
              onChange={(e) => setForm({ ...form, fulfilment_channel: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option value="FBM">Merchant Fulfilment (FBM)</option>
              <option value="FBA">Fulfilled by Amazon (FBA)</option>
            </select>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">MRP (₹) *</label>
            <input
              type="number"
              value={form.mrp}
              onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value || 0) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono-num text-sm font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              value={form.selling_price}
              onChange={(e) => setForm({ ...form, selling_price: parseFloat(e.target.value || 0) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono-num text-sm font-bold text-[#16A34A] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Quantity *</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || 0, 10) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono-num text-sm font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode / GTIN (Optional)</label>
            <input
              type="text"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder="EAN/UPC or Exemption"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono-num text-xs bg-white"
            />
          </div>
        </div>

        {/* Description & Bullets */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Key Feature Bullet Points (5 Amazon Bullets)
            </label>
            <div className="space-y-2">
              {(form.bullet_points || []).map((b, i) => (
                <input
                  key={i}
                  type="text"
                  value={b}
                  onChange={(e) => {
                    const next = [...form.bullet_points];
                    next[i] = e.target.value;
                    setForm({ ...form, bullet_points: next });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Backend Search Keywords</label>
            <input
              type="text"
              value={form.backend_keywords}
              onChange={(e) => setForm({ ...form, backend_keywords: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6.4 AI CONTENT GENERATOR SCREEN
============================================================================ */
function AIContentScreen({ products, selectedProduct, onSelectProduct, onSaved, showToast }) {
  const activeProd = selectedProduct || products[0];
  const [tone, setTone] = useState('Premium');
  const [targetCustomer, setTargetCustomer] = useState('Men aged 18–35');
  const [keyBenefit, setKeyBenefit] = useState('Comfort and everyday style');
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (saveNow = false) => {
    if (!activeProd) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/${activeProd.id}/generate-content?save_to_product=${saveNow}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tone,
            target_customer: targetCustomer,
            key_benefit: keyBenefit,
          }),
        }
      );
      const data = await res.json();
      setGenerated(data.generated);
      if (saveNow) {
        onSelectProduct(data.product);
        onSaved();
        showToast(`Saved AI generated content to ${activeProd.sku}`);
      } else {
        showToast('Generated policy-compliant Amazon content draft');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
              Generate Amazon India Listing Content
            </h3>
            <p className="text-xs text-gray-500">
              Creates policy-compliant titles, 5 feature bullets, descriptions, backend search terms, and size chart text.
            </p>
          </div>
          <select
            value={activeProd?.id || ''}
            onChange={(e) => {
              const p = products.find((x) => x.id === Number(e.target.value));
              if (p) onSelectProduct(p);
            }}
            className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.colour} ({p.size})
              </option>
            ))}
          </select>
        </div>

        {activeProd && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50 text-xs">
            <div>
              <span className="text-gray-400 block">Product</span>
              <span className="font-semibold">{activeProd.product_type}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Colour / Size</span>
              <span className="font-semibold">{activeProd.colour} / {activeProd.size}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Fabric</span>
              <span className="font-semibold">{activeProd.fabric || 'Cotton'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Fit & Neck</span>
              <span className="font-semibold">{activeProd.fit} • {activeProd.neck_type}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Brand Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option>Premium</option>
              <option>Casual & Everyday</option>
              <option>Streetwear & Modern</option>
              <option>Minimalist Essential</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Customer</label>
            <select
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option>Men aged 18–35</option>
              <option>College & Young Professionals</option>
              <option>Everyday Comfort Seekers</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Key Benefit</label>
            <select
              value={keyBenefit}
              onChange={(e) => setKeyBenefit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option>Comfort and everyday style</option>
              <option>Breathable all-day summer wear</option>
              <option>Durable stitching and colour retention</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => handleGenerate(false)}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {generated && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-[#F59E0B]">
              AI Draft — Policy & Compliance Verified
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerate(false)}
                className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"
              >
                Regenerate
              </button>
              <button
                onClick={() => handleGenerate(true)}
                className="px-4 py-1.5 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white text-xs font-semibold"
              >
                Save to Product ({activeProd?.sku})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Generated Title</label>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold">
              {generated.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Generated Bullet Points</label>
            <ul className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs list-disc list-inside">
              {generated.bullet_points.map((b, idx) => (
                <li key={idx} className="text-gray-800">{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Generated Description</label>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs leading-relaxed text-gray-800">
              {generated.description}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Backend Search Terms</label>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
                {generated.backend_keywords}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Size Chart Guide Text</label>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
                {generated.size_chart_text}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   6.5 IMAGE MANAGER SCREEN
============================================================================ */
function ImageManagerScreen({ products, selectedProduct, onSelectProduct, onSaved, showToast }) {
  const activeProd = selectedProduct || products[0];
  const [newUrl, setNewUrl] = useState('');
  const [newRole, setNewRole] = useState('Back');
  const [newWidth, setNewWidth] = useState(2000);
  const [newHeight, setNewHeight] = useState(2000);

  const handleAddImage = async () => {
    if (!activeProd || !newUrl.trim()) {
      showToast('Enter an image URL from Google Drive or CDN', 'warning');
      return;
    }
    const res = await fetch(`/api/products/${activeProd.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: newUrl.trim(),
        filename: `${activeProd.sku.toLowerCase()}-${newRole.toLowerCase()}.jpg`,
        image_role: newRole,
        is_main_image: newRole === 'Main',
        width: Number(newWidth) || 2000,
        height: Number(newHeight) || 2000,
      }),
    });
    const updated = await res.json();
    onSelectProduct(updated);
    onSaved();
    setNewUrl('');
    showToast(`Added ${newRole} image to ${activeProd.sku}`);
  };

  const handleSetMain = async (imgId) => {
    const res = await fetch(`/api/images/${imgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_main_image: true, image_role: 'Main' }),
    });
    const updated = await res.json();
    onSelectProduct(updated);
    onSaved();
    showToast('Updated Main Amazon image');
  };

  const handleChangeRole = async (imgId, role) => {
    const res = await fetch(`/api/images/${imgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_role: role, is_main_image: role === 'Main' }),
    });
    const updated = await res.json();
    onSelectProduct(updated);
    onSaved();
  };

  const handleDeleteImage = async (imgId) => {
    const res = await fetch(`/api/images/${imgId}`, { method: 'DELETE' });
    const updated = await res.json();
    if (updated?.id) onSelectProduct(updated);
    onSaved();
    showToast('Removed image');
  };

  const imgs = activeProd?.images || [];
  const mainImg = imgs.find((i) => i.is_main_image) || imgs[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Image Manager — {activeProd?.sku}</h3>
          <p className="text-xs text-gray-500">
            Verify Amazon India image requirements (Main, Front, Back, Fabric, Size Chart, ≥1000×1000 px, white background).
          </p>
        </div>
        <select
          value={activeProd?.id || ''}
          onChange={(e) => {
            const p = products.find((x) => x.id === Number(e.target.value));
            if (p) onSelectProduct(p);
          }}
          className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.title.slice(0, 40)}...
            </option>
          ))}
        </select>
      </div>

      {/* Image Readiness Summary */}
      {mainImg && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block">Main Image File</span>
            <span className="font-semibold">{mainImg.filename || 'main.jpg'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Resolution</span>
            <span
              className={`font-mono-num font-bold ${
                mainImg.width >= 1000 && mainImg.height >= 1000 ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {mainImg.width} × {mainImg.height} px
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Background Check</span>
            <span className="font-semibold text-[#16A34A]">
              {mainImg.white_bg_detected ? 'White background detected' : 'Lifestyle / Non-white'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Amazon Zoom Status</span>
            <span
              className={`font-semibold ${
                mainImg.width >= 1000 && mainImg.height >= 1000 ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {mainImg.width >= 1000 && mainImg.height >= 1000 ? 'Ready for Amazon' : 'Resolution Too Low (<1000px)'}
            </span>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {imgs.map((img) => (
          <div
            key={img.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between ${
              img.is_main_image ? 'border-2 border-[#FF6B00]' : 'border-gray-200'
            }`}
          >
            <div>
              <div className="relative h-48 bg-gray-100">
                <img src={img.image_url} alt={img.image_role} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold ${
                    img.is_main_image ? 'bg-[#FF6B00] text-white' : 'bg-[#101828]/80 text-white'
                  }`}
                >
                  {img.image_role}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs font-semibold truncate">{img.filename}</div>
                <div className="text-[11px] font-mono-num text-gray-500">
                  {img.width} × {img.height} px
                </div>
                <select
                  value={img.image_role}
                  onChange={(e) => handleChangeRole(img.id, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50"
                >
                  {IMAGE_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {!img.is_main_image ? (
                <button
                  onClick={() => handleSetMain(img.id)}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline"
                >
                  Set as Main
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#16A34A]">Primary Image</span>
              )}
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="text-gray-400 hover:text-[#DC2626] p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Attach New Image */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h4 className="font-bold text-sm">Add Image from Google Drive / URL</h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
          >
            {IMAGE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="number"
            value={newWidth}
            onChange={(e) => {
              setNewWidth(e.target.value);
              setNewHeight(e.target.value);
            }}
            placeholder="Resolution (2000)"
            className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num"
          />
          <button
            onClick={handleAddImage}
            className="px-4 py-2 rounded-xl bg-[#101828] hover:bg-gray-800 text-white text-xs font-semibold"
          >
            + Attach Image
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6.6 VARIATION MANAGER SCREEN
============================================================================ */
function VariationManagerScreen({ products, selectedProduct, onSelectProduct, onSaved, showToast }) {
  const parents = products.filter((p) => !p.parent_sku);
  const activeParent = (selectedProduct && !selectedProduct.parent_sku ? selectedProduct : parents[0]) || products[0];

  const [selectedColours, setSelectedColours] = useState(['Black', 'White', 'Navy']);
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [defaultStock, setDefaultStock] = useState(25);
  const [variations, setVariations] = useState([]);

  const loadVariations = useCallback(async () => {
    if (!activeParent) return;
    const res = await fetch(`/api/variations/${activeParent.id}`);
    if (res.ok) {
      const data = await res.json();
      setVariations(data.variations || []);
    }
  }, [activeParent]);

  useEffect(() => {
    loadVariations();
  }, [loadVariations]);

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleGenerateMatrix = async () => {
    if (!activeParent) return;
    if (selectedColours.length === 0 || selectedSizes.length === 0) {
      showToast('Select at least one colour and one size', 'warning');
      return;
    }
    const res = await fetch('/api/variations/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_product_id: activeParent.id,
        colours: selectedColours,
        sizes: selectedSizes,
        default_stock: Number(defaultStock) || 25,
      }),
    });
    const data = await res.json();
    setVariations(data.all_variations || []);
    onSaved();
    showToast(`Generated ${data.created_count} new child variations for ${activeParent.sku}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold">Variation Manager (Parent / Child SKUs)</h3>
            <p className="text-xs text-gray-500">
              Generate colour-size child SKUs (e.g., <code className="font-mono-num">EVOXX-TS-001-BLK-M</code>) linked to a parent design.
            </p>
          </div>
          <select
            value={activeParent?.id || ''}
            onChange={(e) => {
              const p = parents.find((x) => x.id === Number(e.target.value));
              if (p) onSelectProduct(p);
            }}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
          >
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                Parent SKU: {p.sku} — {p.title.slice(0, 38)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Select Colours</label>
            <div className="flex flex-wrap gap-2">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleItem(selectedColours, setSelectedColours, c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedColours.includes(c)
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Select Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleItem(selectedSizes, setSelectedSizes, s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-num font-bold border transition ${
                    selectedSizes.includes(s)
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Default Stock per Child SKU</label>
              <input
                type="number"
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 font-mono-num text-xs w-36"
              />
            </div>
            <button
              onClick={handleGenerateMatrix}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Layers className="w-4 h-4" />
              Generate All Variations ({selectedColours.length * selectedSizes.length} combinations)
            </button>
          </div>
        </div>
      </div>

      {/* Variations List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-bold text-sm">
            Child Variations for {activeParent?.sku} ({variations.length})
          </h4>
        </div>
        <div className="divide-y divide-gray-100">
          {variations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No child variations generated for {activeParent?.sku} yet. Select colours & sizes above and click Generate.
            </div>
          ) : (
            variations.map((v) => (
              <div key={v.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="font-mono-num text-xs font-bold text-[#101828] bg-gray-100 px-2.5 py-1 rounded-md">
                    {v.sku}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {v.colour} / {v.size}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-md">{v.title}</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-mono-num text-xs font-bold">₹{v.selling_price}</span>
                  <span className="font-mono-num text-xs text-gray-600">Stock: {v.stock}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      STATUS_BADGES[v.status] || STATUS_BADGES.Ready
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6.7 AMAZON PUBLISHING SCREEN
============================================================================ */
function AmazonPublishScreen({ products, selectedProduct, onSelectProduct, onPublished, onNavigate, appSettings, showToast }) {
  const activeProd = selectedProduct || products[0];
  const [previewData, setPreviewData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPayloadJson, setShowPayloadJson] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!activeProd) return;
    const [prevRes, subRes] = await Promise.all([
      fetch(`/api/products/${activeProd.id}/amazon-payload`),
      fetch('/api/submissions'),
    ]);
    if (prevRes.ok) setPreviewData(await prevRes.json());
    if (subRes.ok) setSubmissions(await subRes.json());
  }, [activeProd]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleConfirmPublish = async () => {
    if (!activeProd) return;
    setPublishing(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch(`/api/products/${activeProd.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true, mode: 'putListingsItem' }),
      });
      const data = await res.json();
      onSelectProduct(data.product);
      onPublished();
      loadPreview();
      if (data.status === 'accepted' || data.status === 'published_live') {
        showToast(`Successfully submitted ${activeProd.sku} to Amazon India (ASIN: ${data.amazon_asin})!`);
      } else {
        showToast(`Submission rejected for ${activeProd.sku} — check Error Center`, 'error');
      }
    } finally {
      setPublishing(false);
    }
  };

  const checklist = previewData?.validation?.checklist || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold">Publish to Amazon India (SP-API)</h3>
            <p className="text-xs text-gray-500">
              Marketplace ID: <code className="font-mono-num font-semibold">A21TJRUUN4KGV</code> • Operation:{' '}
              <code className="font-mono-num font-semibold">putListingsItem</code> (Product Type: <code className="font-mono-num">SHIRT</code>)
            </p>
          </div>
          <select
            value={activeProd?.id || ''}
            onChange={(e) => {
              const p = products.find((x) => x.id === Number(e.target.value));
              if (p) onSelectProduct(p);
            }}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.title.slice(0, 42)} ({p.status})
              </option>
            ))}
          </select>
        </div>

        {activeProd && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Summary Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <img
                src={activeProd.main_image_url || 'https://via.placeholder.com/200'}
                alt={activeProd.sku}
                className="w-full h-44 object-cover rounded-lg border border-gray-200 bg-white"
              />
              <div>
                <div className="font-mono-num text-xs font-bold text-[#FF6B00]">{activeProd.sku}</div>
                <div className="font-bold text-sm mt-0.5">{activeProd.title}</div>
              </div>
              <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Marketplace:</span>
                  <span className="font-semibold">Amazon India</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfilment:</span>
                  <span className="font-semibold">{activeProd.fulfilment_channel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price / MRP:</span>
                  <span className="font-mono-num font-bold">₹{activeProd.selling_price} / ₹{activeProd.mrp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amazon Status:</span>
                  <span className="font-bold">{activeProd.status}</span>
                </div>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Pre-Submission Validation Checklist</h4>
                <button
                  onClick={() => setShowPayloadJson(!showPayloadJson)}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline"
                >
                  {showPayloadJson ? 'Hide SP-API JSON Payload' : 'Inspect SP-API JSON Payload'}
                </button>
              </div>

              {showPayloadJson ? (
                <pre className="p-4 rounded-xl bg-[#101828] text-green-400 font-mono-num text-xs overflow-x-auto max-h-80">
                  {JSON.stringify(previewData?.payload, null, 2)}
                </pre>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {checklist.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                        item.status === 'pass'
                          ? 'bg-green-50/60 border-green-200'
                          : item.status === 'warn'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {item.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      ) : item.status === 'warn' ? (
                        <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        {item.message && <p className="text-[11px] text-gray-600 mt-0.5">{item.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('products', activeProd)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold"
                >
                  Fix Issues in Product Editor
                </button>
                <button
                  onClick={() => onNavigate('export', activeProd)}
                  className="px-4 py-2.5 rounded-xl bg-[#101828] hover:bg-gray-800 text-white text-xs font-semibold"
                >
                  Export Bulk File
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={publishing}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Send className="w-4 h-4" />
                  {publishing ? 'Submitting...' : 'Publish to Amazon India'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && activeProd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-[#FF6B00]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-base text-gray-900">Confirm Amazon India Publication</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Are you sure you want to publish <strong className="font-mono-num">{activeProd.sku}</strong> to{' '}
              <strong>Amazon India (A21TJRUUN4KGV)</strong>?
            </p>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <div>
                <strong>Title:</strong> {activeProd.title}
              </div>
              <div>
                <strong>Selling Price:</strong> ₹{activeProd.selling_price} (MRP ₹{activeProd.mrp})
              </div>
              <div>
                <strong>Mode:</strong>{' '}
                {appSettings.test_mode === 'true'
                  ? 'Test Sandbox Mode (Safe Validation & Log)'
                  : 'Live SP-API putListingsItem'}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-bold"
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission History Log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-bold text-sm">Immutable Amazon SP-API Submission Log ({submissions.length})</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {submissions.map((s) => (
            <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-num font-bold text-sm">{s.sku}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold border ${
                      STATUS_BADGES[s.status] || STATUS_BADGES.Draft
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-gray-400">{s.submission_type}</span>
                </div>
                {s.error_message && (
                  <p className="text-[#DC2626] font-medium">Error: {s.error_message}</p>
                )}
              </div>
              <div className="text-right font-mono-num text-gray-400">
                {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6.8 STATUS AND ERROR CENTER SCREEN
============================================================================ */
function ErrorCenterScreen({ products, onFixProduct }) {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetch('/api/errors')
      .then((r) => r.json())
      .then(setErrors);
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold">Amazon Error & Compliance Center</h3>
        <p className="text-xs text-gray-500 mt-1">
          Real-time diagnostic report of missing mandatory attributes, low-resolution images, and SP-API schema warnings across your catalogue.
        </p>
      </div>

      <div className="space-y-3">
        {errors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto mb-2" />
            <h4 className="font-bold text-base">Zero Active Errors!</h4>
            <p className="text-xs text-gray-500 mt-1">All Evoxx products meet Amazon India requirements.</p>
          </div>
        ) : (
          errors.map((err, idx) => {
            const prod = products.find((p) => p.id === err.product_id);
            const isErr = err.severity === 'error';
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {isErr ? (
                    <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-sm text-[#101828]">{err.sku}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isErr ? 'bg-red-100 text-[#DC2626]' : 'bg-amber-100 text-[#F59E0B]'
                        }`}
                      >
                        {err.error_code}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Error: {err.error_message}</p>
                    <p className="text-xs text-gray-500">Suggested Action: {err.suggested_action}</p>
                  </div>
                </div>

                {prod && (
                  <button
                    onClick={() => onFixProduct(prod)}
                    className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-semibold shrink-0 transition"
                  >
                    Fix Now
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   14. AMAZON BULK EXPORT SCREEN
============================================================================ */
function BulkExportScreen({ products, showToast }) {
  const [format, setFormat] = useState('xlsx');
  const [selectedIds, setSelectedIds] = useState(products.map((p) => p.id));
  const [exportResult, setExportResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      showToast('Select at least one product to export', 'warning');
      return;
    }
    setExporting(true);
    try {
      const res = await fetch('/api/export/amazon-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: selectedIds,
          export_format: format,
        }),
      });
      const data = await res.json();
      setExportResult(data);
      showToast(`Generated ${data.filename} (${data.product_count} products)`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold">Amazon India Bulk Upload Exporter</h3>
          <p className="text-xs text-gray-500 mt-1">
            Generate Seller Central compatible Excel (`.xlsx`), Tab-delimited inventory templates (`.txt`), or backup `.csv` files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {[
            { id: 'xlsx', label: 'Excel Workbook (.xlsx)', desc: 'Human-friendly review & Seller Central upload' },
            { id: 'txt', label: 'Tab-Delimited Flat File (.txt)', desc: 'Official Amazon Inventory Loader format' },
            { id: 'csv', label: 'CSV Backup (.csv)', desc: 'Catalogue backup & reporting' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`p-4 rounded-xl border text-left transition flex-1 min-w-[200px] ${
                format === opt.id ? 'border-2 border-[#FF6B00] bg-orange-50/40' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-xs text-gray-900">{opt.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setSelectedIds(products.map((p) => p.id))}
              className="text-[#FF6B00] font-semibold hover:underline"
            >
              Select All ({products.length})
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-500 font-semibold hover:underline"
            >
              Clear Selection
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? 'Generating File...' : `Generate Bulk File (${selectedIds.length} SKUs)`}
          </button>
        </div>

        {exportResult && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              <div className="text-xs">
                <div className="font-bold text-gray-900">{exportResult.filename} is ready</div>
                <div className="text-gray-600">{exportResult.product_count} Evoxx rows formatted for Amazon India</div>
              </div>
            </div>
            <a
              href={exportResult.download_url}
              download
              className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download File
            </a>
          </div>
        )}
      </div>

      {/* Product Selector Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {products.map((p) => (
            <label
              key={p.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="w-4 h-4 accent-[#FF6B00] rounded"
                />
                <span className="font-mono-num font-bold w-36">{p.sku}</span>
                <span className="font-medium text-gray-800">{p.title}</span>
              </div>
              <div className="flex items-center gap-4 font-mono-num">
                <span>{p.colour} / {p.size}</span>
                <span className="font-bold">₹{p.selling_price}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SETTINGS SCREEN
============================================================================ */
function SettingsScreen({ appSettings, onUpdated }) {
  const [form, setForm] = useState(appSettings || {});

  useEffect(() => {
    setForm(appSettings || {});
  }, [appSettings]);

  const handleSave = async () => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    onUpdated(data);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold">EvoxxLaunch Configuration & Safety Controls</h3>
        <p className="text-xs text-gray-500 mt-1">
          Configure smart defaults, SKU prefixes, Amazon India Marketplace settings, and Test Mode safety controls.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm text-gray-900">Test Mode (Safe Validation Sandbox)</div>
          <p className="text-xs text-gray-600 mt-0.5">
            When enabled, publishing validates against Amazon SHIRT schema and logs payloads locally without overwriting live Seller Central inventory.
          </p>
        </div>
        <input
          type="checkbox"
          checked={form.test_mode === 'true'}
          onChange={(e) => setForm({ ...form, test_mode: e.target.checked ? 'true' : 'false' })}
          className="w-5 h-5 accent-[#FF6B00] cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Default Brand Name</label>
          <input
            type="text"
            value={form.brand_name || 'Evoxx'}
            onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-600 mb-1">SKU Prefix</label>
          <input
            type="text"
            value={form.sku_prefix || 'EVOXX-TS-'}
            onChange={(e) => setForm({ ...form, sku_prefix: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono-num"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Amazon Marketplace ID</label>
          <input
            type="text"
            value={form.marketplace_id || 'A21TJRUUN4KGV'}
            onChange={(e) => setForm({ ...form, marketplace_id: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono-num"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Seller ID</label>
          <input
            type="text"
            value={form.seller_id || 'A3EVOXXINSELLER'}
            onChange={(e) => setForm({ ...form, seller_id: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono-num"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Default MRP (₹)</label>
          <input
            type="text"
            value={form.default_mrp || '999'}
            onChange={(e) => setForm({ ...form, default_mrp: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono-num"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Default Selling Price (₹)</label>
          <input
            type="text"
            value={form.default_selling_price || '499'}
            onChange={(e) => setForm({ ...form, default_selling_price: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono-num"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-bold shadow-sm transition"
      >
        Save Configuration
      </button>
    </div>
  );
}
