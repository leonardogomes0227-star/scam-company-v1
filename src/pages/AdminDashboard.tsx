import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, TrendingUp, CheckCircle2, BarChart3, DollarSign, HelpCircle, ChevronDown, Download, Eye, MapPin, CreditCard, AlertTriangle, Edit3, Copy, Video, Play, Square, RefreshCcw, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'coupons' | 'orders' | 'analytics' | 'help' | 'videos' | 'settings'>('products');

  const { user, loading: authLoading } = useAuth();
  const tenantId = user?.tenantId;

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#f59e0b');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active'); // 'active' ou 'pending'
  
  const [toastMessage, setToastMessage] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any>(null);
  // Vídeos & Teleprompter
  const [selectedProductId, setSelectedProductId] = useState('');
  const [videoGoal, setVideoGoal] = useState<'urgencia' | 'desejo' | 'dor'>('urgencia');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const showToast = (msg: string) => {
