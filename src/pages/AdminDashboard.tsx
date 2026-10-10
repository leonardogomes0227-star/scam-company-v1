import { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ShoppingBag, Tag, Settings, Trash2, Plus, TrendingUp, CheckCircle2, BarChart3, DollarSign, Edit3, Copy, Video, Play, Square, Lock, AlertTriangle, MessageSquare, X, ImagePlus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatBRL, formatDate, generateId, whatsappLink } from '../lib/format';
import { ORDER_STATUSES, type Coupon, type Order, type Product, type Tenant } from '../types';

type Tab = 'products' | 'orders' | 'coupons' | 'analytics' | 'videos' | 'settings';
type VideoGoal = 'urgencia' | 'desejo' | 'dor';

interface Script {
  title: string;
  hook: string;
  body: string;
  cta: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80';
const MAX_IMAGE_BYTES = 700 * 1024;
const LOW_STOCK_THRESHOLD = 3;
const SUBSCRIPTION_CHECKOUT_URL = import.meta.env.VITE_SUBSCRIPTION_CHECKOUT_URL || '';

const inputClass = 'w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-600';
const labelClass = 'text-[11px] font-bold text-zinc-300 uppercase';

function buildScript(product: Product, goal: VideoGoal): Script {
  const price = formatBRL(product.price);
  const scripts: Record<VideoGoal, Omit<Script, 'title'>> = {
    urgencia: {
      hook: `Últimas unidades de ${product.name}! Olha só isso.`,
      body: `Separei as últimas peças para quem estava esperando: ${product.name} por ${price}. Quando acabar, não sei quando volta.`,
      cta: 'Clica no link da vitrine, coloca no carrinho e me chama no WhatsApp para garantir o seu.',
    },
    desejo: {
      hook: `Chegou novidade: ${product.name}!`,
      body: `${product.description || 'Acabou de chegar e já é um dos mais procurados da loja.'} E sai por apenas ${price}.`,
      cta: 'Corre no link da vitrine e garante o seu antes de todo mundo.',
    },
    dor: {
      hook: `Cansado de procurar uma solução que funcione de verdade?`,
      body: `O ${product.name} resolve isso no seu dia a dia. ${product.description || ''} Tudo por ${price}.`.replace(/\s+/g, ' '),
      cta: 'O link está na bio: escolhe, finaliza pelo WhatsApp e recebe rapidinho.',
    },
  };
  return { title: `Vídeo para ${product.name}`, ...scripts[goal] };
}

export default function AdminDashboard({ tenantId }: { tenantId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storePixKey, setStorePixKey] = useState('');
  const [storeColor, setStoreColor] = useState('#f59e0b');
  const [shippingLocal, setShippingLocal] = useState('10');
  const [shippingFar, setShippingFar] = useState('18');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');

  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const toastTimer = useRef<number>();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');
  const [description, setDescription] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Vídeos & Teleprompter
  const [selectedProductId, setSelectedProductId] = useState('');
  const [videoGoal, setVideoGoal] = useState<VideoGoal>('urgencia');
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, error = false) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Carregar dados da Nuvem (Supabase)
  useEffect(() => {
    let cancelled = false;

    async function loadTenantData() {
      setLoading(true);
      const [tenantRes, productsRes, ordersRes, couponsRes] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle(),
        supabase.from('products').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;

      const tenant = tenantRes.data as Tenant | null;
      if (tenant) {
        setStoreName(tenant.name);
        setStoreAbout(tenant.about || '');
        setStoreWhatsapp(tenant.whatsapp || '');
        setStorePixKey(tenant.pix_key || '');
        setStoreColor(tenant.color || '#f59e0b');
        setShippingLocal(String(tenant.shipping_local ?? 10));
        setShippingFar(String(tenant.shipping_far ?? 18));
        setSubscriptionStatus(tenant.subscription_status || 'active');
      }

      const loadedProducts = ((productsRes.data as Product[]) || []).map((p) => ({ ...p, price: Number(p.price), stock: Number(p.stock) || 0 }));
      setProducts(loadedProducts);
      setSelectedProductId(loadedProducts[0]?.id ?? '');
      setOrders(((ordersRes.data as Order[]) || []).map((o) => ({ ...o, total: Number(o.total) })));
      setCoupons(((couponsRes.data as Coupon[]) || []).map((c) => ({ ...c, discount: Number(c.discount) })));

      const failed = [tenantRes, productsRes, ordersRes, couponsRes].find((r) => r.error);
      if (failed?.error) showToast('Erro ao carregar dados: ' + failed.error.message, true);
      setLoading(false);
    }

    loadTenantData();
    return () => {
      cancelled = true;
    };
  }, [tenantId, showToast]);

  // Rolagem do Teleprompter
  useEffect(() => {
    if (!isScrolling || !isTeleprompterOpen) return;
    const interval = window.setInterval(() => {
      const el = teleprompterRef.current;
      if (!el) return;
      el.scrollTop += teleprompterSpeed * 1.5;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) setIsScrolling(false);
    }, 30);
    return () => window.clearInterval(interval);
  }, [isScrolling, isTeleprompterOpen, teleprompterSpeed]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      showToast('O nome da loja é obrigatório.', true);
      return;
    }
    const { error } = await supabase
      .from('tenants')
      .update({
        name: storeName.trim(),
        about: storeAbout.trim(),
        whatsapp: storeWhatsapp.replace(/\D/g, ''),
        pix_key: storePixKey.trim(),
        color: storeColor,
        shipping_local: Math.max(0, parseFloat(shippingLocal) || 0),
        shipping_far: Math.max(0, parseFloat(shippingFar) || 0),
      })
      .eq('id', tenantId);
    if (error) showToast('Erro ao salvar: ' + error.message, true);
    else showToast('Configurações salvas na nuvem com sucesso!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      showToast('Imagem muito grande (máx. 700 KB). Comprima a foto ou use um link.', true);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || !(parsedPrice > 0)) {
      showToast('Informe nome e um preço válido.', true);
      return;
    }

    const newProd: Product = {
      id: generateId(),
      tenant_id: tenantId,
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      stock: Math.max(0, parseInt(stock) || 0),
      image: image.trim() || DEFAULT_IMAGE,
      category: category.trim() || 'Geral',
    };

    setSavingProduct(true);
    const { error } = await supabase.from('products').insert([newProd]);
    setSavingProduct(false);
    if (error) {
      showToast('Erro ao cadastrar produto: ' + error.message, true);
      return;
    }
    setProducts((prev) => [newProd, ...prev]);
    if (!selectedProductId) setSelectedProductId(newProd.id);
    setName('');
    setPrice('');
    setStock('');
    setImage('');
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Produto cadastrado na nuvem!');
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Excluir "${product.name}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      showToast('Erro ao remover produto: ' + error.message, true);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    if (selectedProductId === product.id) setSelectedProductId('');
    showToast('Produto removido!');
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(String(prod.price));
    setEditStock(String(prod.stock ?? 0));
    setEditCategory(prod.category || 'Geral');
    setEditDescription(prod.description || '');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const newPrice = parseFloat(editPrice);
    if (!editName.trim() || !(newPrice > 0)) {
      showToast('Informe nome e um preço válido.', true);
      return;
    }
    const patch = {
      name: editName.trim(),
      price: newPrice,
      stock: Math.max(0, parseInt(editStock) || 0),
      category: editCategory.trim() || 'Geral',
      description: editDescription.trim() || null,
    };
    const { error } = await supabase.from('products').update(patch).eq('id', editingProduct.id);
    if (error) {
      showToast('Erro ao atualizar produto: ' + error.message, true);
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...patch } : p)));
    setEditingProduct(null);
    showToast('Produto atualizado na nuvem!');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      showToast('Erro ao atualizar pedido: ' + error.message, true);
      return;
    }
    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord)));
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
    showToast('Status atualizado!');
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase().replace(/\s+/g, '');
    const discount = parseFloat(couponDiscount);
    if (!code || !(discount > 0 && discount <= 100)) {
      showToast('Informe um código e um desconto entre 1% e 100%.', true);
      return;
    }
    if (coupons.some((c) => c.code === code)) {
      showToast('Já existe um cupom com esse código.', true);
      return;
    }
    const newCoupon: Coupon = { id: generateId(), tenant_id: tenantId, code, discount };
    const { error } = await supabase.from('coupons').insert([newCoupon]);
    if (error) {
      showToast('Erro ao criar cupom: ' + error.message, true);
      return;
    }
    setCoupons((prev) => [newCoupon, ...prev]);
    setCouponCode('');
    setCouponDiscount('');
    showToast('Cupom criado!');
  };

  const handleDeleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      showToast('Erro ao remover cupom: ' + error.message, true);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Cupom removido!');
  };

  const handleCopyStoreLink = async () => {
    const storeUrl = `${window.location.origin}${window.location.pathname}#/loja/${tenantId}`;
    try {
      await navigator.clipboard.writeText(storeUrl);
      showToast('Link da vitrine copiado!');
    } catch {
      prompt('Copie o link da sua vitrine:', storeUrl);
    }
  };

  const handleGenerateScript = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      showToast('Cadastre e selecione um produto primeiro.', true);
      return;
    }
    setGeneratedScript(buildScript(prod, videoGoal));
  };

  const validOrders = orders.filter((o) => o.status !== 'Cancelado');
  const paidOrders = validOrders.filter((o) => o.status !== 'Aguardando Pagamento');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const pendingRevenue = validOrders.filter((o) => o.status === 'Aguardando Pagamento').reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= LOW_STOCK_THRESHOLD);
  const filteredOrders = orderFilter === 'Todos' ? orders : orders.filter((o) => o.status === orderFilter);

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items || []) {
      const current = productSales.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      productSales.set(item.id, current);
    }
  }
  const topProducts = Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-black flex items-center justify-center">
        <p className="text-zinc-400 text-xs">Carregando sua loja...</p>
      </div>
    );
  }

  // TELA DE BLOQUEIO CASO A ASSINATURA ESTEJA PENDENTE
  if (subscriptionStatus !== 'active') {
    return (
      <div className="min-h-[80vh] bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-black">{subscriptionStatus === 'blocked' ? 'Loja Bloqueada' : 'Assinatura Pendente'}</h1>
          <p className="text-xs text-zinc-400">Para liberar o acesso ao painel gerencial, à vitrine online e à fábrica de vídeos, conclua o pagamento da sua assinatura ou fale com o suporte.</p>
        </div>
        {SUBSCRIPTION_CHECKOUT_URL && (
          <a
            href={SUBSCRIPTION_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl shadow-xl transition-all"
          >
            Regularizar Assinatura
          </a>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'coupons', label: 'Cupons', icon: Tag },
    { id: 'analytics', label: 'Relatórios & Estoque', icon: BarChart3 },
    { id: 'videos', label: 'Fábrica de Vídeos', icon: Video },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-amber-500 selection:text-black">

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 max-w-sm"
          style={toast.error ? { backgroundColor: '#ef4444', color: '#fff' } : { backgroundColor: storeColor, color: '#000' }}
        >
          {toast.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />} {toast.message}
        </div>
      )}

      {/* TELEPROMPTER FULLSCREEN */}
      {isTeleprompterOpen && generatedScript && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-4 sm:p-12">
          <div className="flex flex-wrap gap-3 justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black" style={{ color: storeColor }}>TELEPROMPTER ATIVO</span>
              <label className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Velocidade:</span>
                <input
                  type="range" min="1" max="5" value={teleprompterSpeed}
                  onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                  className="cursor-pointer" style={{ accentColor: storeColor }}
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!isScrolling && teleprompterRef.current) {
                    const el = teleprompterRef.current;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight) el.scrollTop = 0;
                  }
                  setIsScrolling(!isScrolling);
                }}
                className="px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 text-black transition-all"
                style={{ backgroundColor: isScrolling ? '#ef4444' : storeColor }}
              >
                {isScrolling ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isScrolling ? 'Pausar' : 'Iniciar'}
              </button>
              <button onClick={() => { setIsTeleprompterOpen(false); setIsScrolling(false); }} className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-xl">✕ Fechar</button>
            </div>
          </div>
          <div ref={teleprompterRef} className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto text-center space-y-12 px-6 py-[40vh]">
            <h2 className="text-3xl sm:text-5xl font-black" style={{ color: storeColor }}>{generatedScript.title}</h2>
            <div className="text-2xl sm:text-4xl font-bold text-white leading-relaxed space-y-8">
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ GANCHO ]</span> {generatedScript.hook}</p>
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ CORPO ]</span> {generatedScript.body}</p>
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ CTA ]</span> {generatedScript.cta}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUTO */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingProduct(null)}>
          <form onSubmit={handleSaveEditProduct} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white">Editar Produto</h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nome</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Preço (R$)</label>
                <input type="number" step="0.01" min="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Estoque</label>
                <input type="number" min="0" value={editStock} onChange={(e) => setEditStock(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Categoria</label>
              <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Descrição</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`${inputClass} h-20 resize-none`} />
            </div>
            <button type="submit" className="w-full py-3 text-black font-black text-xs rounded-xl" style={{ backgroundColor: storeColor }}>Salvar Alterações</button>
          </form>
        </div>
      )}

      {/* MODAL DETALHES DO PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black" style={{ color: storeColor }}>{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs space-y-1.5 text-zinc-300">
              <p><span className="text-zinc-500">Data:</span> {formatDate(selectedOrder.date)}</p>
              <p><span className="text-zinc-500">Cliente:</span> {selectedOrder.customer}</p>
              {selectedOrder.whatsapp && <p><span className="text-zinc-500">WhatsApp:</span> {selectedOrder.whatsapp}</p>}
              {selectedOrder.address && <p><span className="text-zinc-500">Endereço:</span> {selectedOrder.address}</p>}
              {selectedOrder.payment && <p><span className="text-zinc-500">Pagamento:</span> {selectedOrder.payment}</p>}
            </div>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="text-zinc-300">{item.quantity}× {item.name}</span>
                    <span className="text-white font-bold">{formatBRL(item.price * item.quantity)}</span>
                  </div>
                ))}
                {!!selectedOrder.discount && <div className="flex justify-between text-zinc-400"><span>Desconto {selectedOrder.coupon ? `(${selectedOrder.coupon})` : ''}</span><span>-{formatBRL(selectedOrder.discount)}</span></div>}
                {selectedOrder.shipping != null && <div className="flex justify-between text-zinc-400"><span>Frete</span><span>{formatBRL(selectedOrder.shipping)}</span></div>}
                <div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800"><span>Total</span><span>{formatBRL(selectedOrder.total)}</span></div>
              </div>
            )}
            <select
              value={selectedOrder.status}
              onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer"
              style={{ color: storeColor }}
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {selectedOrder.whatsapp && (
              <a
                href={whatsappLink(selectedOrder.whatsapp, `Olá, ${selectedOrder.customer}! Aqui é da ${storeName}. Atualização do seu pedido ${selectedOrder.id}: *${selectedOrder.status}*.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Avisar cliente no WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-zinc-400">Banco de Dados em Nuvem Ativo. <span className="italic" style={{ color: storeColor }}>"The World Is Yours"</span></p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleCopyStoreLink} className="flex-1 sm:flex-none px-4 py-2.5 bg-black border border-zinc-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5">
              <Copy className="w-3.5 h-3.5" style={{ color: storeColor }} /> Copiar Link
            </button>
            <a href={`#/loja/${tenantId}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-4 py-2.5 font-black text-xs rounded-xl text-center" style={{ backgroundColor: `${storeColor}15`, color: storeColor, border: `1px solid ${storeColor}30` }}>
              Ver Vitrine ↗
            </a>
          </div>
        </div>

        {(!storeWhatsapp || !storePixKey) && (
          <button onClick={() => setActiveTab('settings')} className="w-full text-left bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Complete as configurações: {[!storeWhatsapp && 'WhatsApp da loja', !storePixKey && 'chave Pix'].filter(Boolean).join(' e ')} — sem isso os pedidos não chegam corretamente.
          </button>
        )}

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                style={isActive ? { backgroundColor: storeColor, color: '#000' } : { backgroundColor: '#18181b', color: '#a1a1aa' }}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4" style={{ color: storeColor }} /> Cadastrar Produto na Nuvem</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                <input type="number" step="0.01" min="0.01" placeholder="Preço (R$)" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
                <input type="number" min="0" placeholder="Estoque" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
                <input type="text" placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
              </div>
              <textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-16 resize-none`} />
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 bg-black border border-zinc-800 rounded-xl px-3 py-2.5 cursor-pointer hover:border-zinc-600">
                  <ImagePlus className="w-4 h-4" /> {image.startsWith('data:') ? 'Imagem selecionada ✔' : 'Enviar foto'}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <input type="url" placeholder="...ou cole o link da imagem" value={image.startsWith('data:') ? '' : image} onChange={(e) => setImage(e.target.value)} className={`${inputClass} sm:flex-1`} />
                {image && <img src={image} alt="Prévia" className="w-12 h-12 object-cover rounded-xl border border-zinc-800" />}
              </div>
              <button type="submit" disabled={savingProduct} className="px-6 py-3 text-black font-black text-xs rounded-xl shadow-lg disabled:opacity-60" style={{ backgroundColor: storeColor }}>
                {savingProduct ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </form>
            {products.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-10 bg-zinc-900 border border-zinc-800 rounded-3xl">Nenhum produto cadastrado ainda. Cadastre o primeiro acima!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center justify-between">
                    <img src={p.image || DEFAULT_IMAGE} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-black shrink-0 border border-zinc-800" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                      <span className="text-xs font-black" style={{ color: storeColor }}>{formatBRL(p.price)}</span>
                      <span className={`block text-[11px] font-bold ${p.stock <= 0 ? 'text-red-400' : p.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-400' : 'text-zinc-400'}`}>
                        {p.stock <= 0 ? 'Esgotado' : `Estoque: ${p.stock}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditModal(p)} className="p-2 text-zinc-400 hover:text-white" title="Editar"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProduct(p)} className="p-2 text-zinc-500 hover:text-red-400" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-white">Pedidos em Nuvem</h3>
                <p className="text-xs text-zinc-400">Gerencie os pedidos que chegam da sua vitrine.</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none">
                  <option value="Todos">Todos os status</option>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0" style={{ backgroundColor: `${storeColor}15`, color: storeColor }}>{filteredOrders.length} Pedido(s)</span>
              </div>
            </div>
            {filteredOrders.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-10 bg-zinc-900 border border-zinc-800 rounded-3xl">Nenhum pedido por aqui ainda. Divulgue o link da sua vitrine!</p>
            )}
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <button onClick={() => setSelectedOrder(order)} className="text-left space-y-0.5">
                    <span className="text-xs font-black" style={{ color: storeColor }}>{order.id} · {formatDate(order.date)}</span>
                    <h4 className="text-sm font-bold text-white">Cliente: {order.customer}</h4>
                    <span className="text-xs text-zinc-300 font-bold">Total: {formatBRL(order.total)} {order.payment ? `· ${order.payment}` : ''}</span>
                    <span className="block text-[11px] text-zinc-500 underline">Ver detalhes</span>
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                    style={{ color: order.status === 'Cancelado' ? '#f87171' : storeColor }}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 max-w-3xl">
            <form onSubmit={handleAddCoupon} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Tag className="w-4 h-4" style={{ color: storeColor }} /> Criar Cupom de Desconto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Código (ex: BEMVINDO10)" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className={`${inputClass} uppercase`} required />
                <input type="number" min="1" max="100" step="0.5" placeholder="Desconto (%)" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} className={inputClass} required />
                <button type="submit" className="py-3 text-black font-black text-xs rounded-xl" style={{ backgroundColor: storeColor }}>Criar Cupom</button>
              </div>
            </form>
            {coupons.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-10 bg-zinc-900 border border-zinc-800 rounded-3xl">Nenhum cupom ativo.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map((c) => (
                  <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-mono font-black text-sm text-white">{c.code}</span>
                      <span className="block text-xs font-bold" style={{ color: storeColor }}>-{c.discount}% no subtotal</span>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-zinc-500 hover:text-red-400" title="Remover"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RELATÓRIOS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Faturamento confirmado', value: formatBRL(totalRevenue), icon: DollarSign },
                { label: 'Aguardando pagamento', value: formatBRL(pendingRevenue), icon: ShoppingBag },
                { label: 'Ticket médio', value: formatBRL(averageTicket), icon: TrendingUp },
                { label: 'Pedidos pagos', value: `${paidOrders.length} / ${orders.length}`, icon: CheckCircle2 },
              ].map((card) => (
                <div key={card.label} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">{card.label}</span>
                    <card.icon className="w-4 h-4" style={{ color: storeColor }} />
                  </div>
                  <div className="text-2xl font-black text-white">{card.value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Estoque baixo (≤ {LOW_STOCK_THRESHOLD})</h3>
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-zinc-500">Tudo certo com o estoque.</p>
                ) : (
                  lowStockProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs bg-black border border-zinc-800 p-3 rounded-xl">
                      <span className="text-white font-bold truncate">{p.name}</span>
                      <span className={p.stock <= 0 ? 'text-red-400 font-black' : 'text-amber-400 font-black'}>{p.stock <= 0 ? 'Esgotado' : `${p.stock} un.`}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><TrendingUp className="w-4 h-4" style={{ color: storeColor }} /> Mais vendidos</h3>
                {topProducts.length === 0 ? (
                  <p className="text-xs text-zinc-500">Ainda não há vendas confirmadas.</p>
                ) : (
                  topProducts.map((p) => (
                    <div key={p.name} className="flex justify-between items-center text-xs bg-black border border-zinc-800 p-3 rounded-xl">
                      <span className="text-white font-bold truncate">{p.name}</span>
                      <span className="text-zinc-400 shrink-0">{p.quantity} un. · <span className="font-black" style={{ color: storeColor }}>{formatBRL(p.revenue)}</span></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* FÁBRICA DE VÍDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Video className="w-5 h-5" style={{ color: storeColor }} /> Fábrica de Vídeos & Teleprompter</h3>
              {products.length === 0 ? (
                <p className="text-xs text-zinc-500">Cadastre um produto para gerar roteiros.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className={inputClass}>
                    {!selectedProductId && <option value="">Selecione um produto</option>}
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.price)})</option>)}
                  </select>
                  <select value={videoGoal} onChange={(e) => setVideoGoal(e.target.value as VideoGoal)} className={inputClass}>
                    <option value="urgencia">🔥 Queima de Estoque</option>
                    <option value="desejo">✨ Lançamento / Desejo</option>
                    <option value="dor">💡 Resolução de Dor</option>
                  </select>
                </div>
              )}
              <button onClick={handleGenerateScript} disabled={products.length === 0} className="w-full py-3.5 text-black font-black text-xs rounded-xl shadow-lg disabled:opacity-50" style={{ backgroundColor: storeColor }}>
                Gerar Roteiro Personalizado
              </button>
            </div>
            {generatedScript && (
              <div className="bg-zinc-900 border p-8 rounded-3xl space-y-4" style={{ borderColor: `${storeColor}40` }}>
                <div className="flex flex-wrap gap-3 justify-between items-center border-b border-zinc-800 pb-4">
                  <h4 className="text-sm font-black" style={{ color: storeColor }}>{generatedScript.title}</h4>
                  <button onClick={() => setIsTeleprompterOpen(true)} className="px-4 py-2 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>
                    <Play className="w-3.5 h-3.5 fill-black inline mr-1" /> Abrir Teleprompter
                  </button>
                </div>
                <p className="text-xs text-white"><span className="font-black text-zinc-500">GANCHO:</span> {generatedScript.hook}</p>
                <p className="text-xs text-white"><span className="font-black text-zinc-500">CORPO:</span> {generatedScript.body}</p>
                <p className="text-xs text-white"><span className="font-black text-zinc-500">CTA:</span> {generatedScript.cta}</p>
              </div>
            )}
          </div>
        )}

        {/* CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-2xl space-y-4">
            <h3 className="text-base font-black text-white">Configurações da Loja</h3>
            <div className="space-y-2">
              <label className={labelClass}>Nome da Loja</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Sobre a Loja</label>
              <textarea value={storeAbout} onChange={(e) => setStoreAbout(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Uma frase curta que aparece no topo da vitrine" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>WhatsApp que recebe os pedidos</label>
                <input type="tel" value={storeWhatsapp} onChange={(e) => setStoreWhatsapp(e.target.value)} className={inputClass} placeholder="Ex: 67999998888 (com DDD)" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Chave Pix</label>
                <input type="text" value={storePixKey} onChange={(e) => setStorePixKey(e.target.value)} className={inputClass} placeholder="CPF, CNPJ, e-mail, +55... ou aleatória" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Frete local (R$)</label>
                <input type="number" min="0" step="0.01" value={shippingLocal} onChange={(e) => setShippingLocal(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Frete bairros distantes (R$)</label>
                <input type="number" min="0" step="0.01" value={shippingFar} onChange={(e) => setShippingFar(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Cor da Loja</label>
              <input type="color" value={storeColor} onChange={(e) => setStoreColor(e.target.value)} className="block w-12 h-10 bg-black border border-zinc-800 rounded-xl cursor-pointer" />
            </div>
            <button type="submit" className="w-full py-3.5 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>Salvar Configurações</button>
          </form>
        )}
      </div>
    </div>
  );
}
