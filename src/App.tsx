import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect, Suspense, lazy } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { FirebaseImage } from "./components/FirebaseImage";
import { 
  Smartphone, 
  Globe, 
  Settings, 
  FileText, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Search, 
  UserPlus, 
  Zap,
  Monitor,
  Tablet,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  LogIn,
  User,
  CreditCard,
  ShieldCheck,
  Clock,
  Star,
  Package,
  Lock,
  Trash2,
  ClipboardList,
  Shield,
  Info,
  Cookie,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";

// Lazy load heavy components
const DashboardLayout = lazy(() => import("./components/Dashboards").then(m => ({ default: m.DashboardLayout })));
const AdminDashboard = lazy(() => import("./components/Dashboards").then(m => ({ default: m.AdminDashboard })));
const LoginView = lazy(() => import("./components/Dashboards").then(m => ({ default: m.LoginView })));
const StoreView = lazy(() => import("./components/Dashboards").then(m => ({ default: m.StoreView })));

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onCheckout,
  isProcessing
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: any[]; 
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
}) => {
  const total = items.reduce((acc, item) => {
    const price = item.numericPrice ?? (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d,]/g, '').replace(',', '.'))) ?? 0;
    return acc + (price * (item.quantity || 1));
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-vialinks-orange" />
                <h2 className="text-xl font-bold text-white">Seu Carrinho</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-400">Seu carrinho está vazio.</p>
                  <button 
                    onClick={onClose}
                    className="text-vialinks-orange font-bold hover:underline"
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group">
                    <div className="w-20 h-20 bg-vialinks-purple rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="text-white w-8 h-8" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Plano Vitalício • Sem Mensalidades</p>
                      <div className="flex justify-between items-center">
                        <span className="text-vialinks-orange font-bold">{item.price}</span>
                        <span className="text-xs text-slate-500">Qtd: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-slate-950/50 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white font-extrabold text-2xl">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <button 
                  onClick={onCheckout}
                  disabled={isProcessing}
                  className="w-full bg-vialinks-orange text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-vialinks-orange/90 transition-all shadow-lg shadow-vialinks-orange/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Finalizar Compra</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Pagamento 100% seguro processado por Stripe. Ao finalizar, você concorda com nossos termos.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const LGPDBar = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('lgpd-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-vialinks-orange/10 rounded-2xl flex items-center justify-center shrink-0">
            <Cookie className="text-vialinks-orange w-6 h-6" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Utilizamos cookies para melhorar sua experiência e personalizar conteúdos. Ao continuar navegando, você concorda com nossa <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'privacy' }))} className="text-vialinks-orange font-bold hover:underline">Política de Privacidade</button>.
          </p>
        </div>
        <button 
          onClick={accept}
          className="bg-vialinks-orange text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-vialinks-orange/20 hover:scale-105 transition-all whitespace-nowrap w-full md:w-auto"
        >
          Aceitar e Continuar
        </button>
      </div>
    </motion.div>
  );
};

const TermsView = ({ setView }: any) => (
  <div className="pt-32 pb-20 px-4 bg-black min-h-screen">
    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-16 shadow-xl border border-white/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-vialinks-purple/10 rounded-2xl flex items-center justify-center">
          <Info className="text-vialinks-purple w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white">Termos e Condições de Uso</h1>
      </div>
      <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
        <p>Bem-vindo à ViaLinks. Ao utilizar nossos serviços, você concorda com os seguintes termos:</p>
        <h3 className="text-xl font-bold text-white mt-8">1. Objeto</h3>
        <p>A ViaLinks oferece uma plataforma para criação de cartões de visita digitais e páginas de links personalizados.</p>
        <h3 className="text-xl font-bold text-white mt-8">2. Responsabilidades do Usuário</h3>
        <p>O usuário é responsável pela veracidade das informações fornecidas e pelo conteúdo publicado em sua página.</p>
        <h3 className="text-xl font-bold text-white mt-8">3. Pagamentos e Planos</h3>
        <p>Nossos planos são de pagamento único ou assinatura, conforme descrito na seção de preços. O acesso é liberado após a confirmação do pagamento.</p>
        <h3 className="text-xl font-bold text-white mt-8">4. Propriedade Intelectual</h3>
        <p>Todo o design e código da plataforma são de propriedade exclusiva da ViaLinks.</p>
      </div>
      <button 
        onClick={() => setView('landing')}
        className="mt-12 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
      >
        Voltar para o Início
      </button>
    </div>
  </div>
);

const PrivacyView = ({ setView }: any) => (
  <div className="pt-32 pb-20 px-4 bg-black min-h-screen">
    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-16 shadow-xl border border-white/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-vialinks-orange/10 rounded-2xl flex items-center justify-center">
          <Lock className="text-vialinks-orange w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
      </div>
      <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
        <p>Na ViaLinks, a sua privacidade é nossa prioridade. Esta política descreve como coletamos e usamos seus dados:</p>
        <h3 className="text-xl font-bold text-white mt-8">1. Coleta de Dados</h3>
        <p>Coletamos informações básicas como nome, e-mail e dados necessários para a criação do seu cartão digital.</p>
        <h3 className="text-xl font-bold text-white mt-8">2. Uso das Informações</h3>
        <p>Seus dados são utilizados exclusivamente para a prestação do serviço e comunicações relacionadas à sua conta.</p>
        <h3 className="text-xl font-bold text-white mt-8">3. Proteção de Dados (LGPD)</h3>
        <p>Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD), garantindo seus direitos de acesso, correção e exclusão de dados.</p>
        <h3 className="text-xl font-bold text-white mt-8">4. Cookies</h3>
        <p>Utilizamos cookies para melhorar a navegação e entender como os usuários interagem com nossa plataforma.</p>
      </div>
      <button 
        onClick={() => setView('landing')}
        className="mt-12 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
      >
        Voltar para o Início
      </button>
    </div>
  </div>
);

const Navbar = ({ onOpenMenu, setView, user, onOpenCart, cartCount, content }: { onOpenMenu: () => void; setView: (v: any) => void; user: any; onOpenCart: () => void; cartCount: number; content?: any }) => {
  const scrollToPlanos = () => {
    const el = document.getElementById('planos');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
              <div className="w-10 h-10 bg-vialinks-purple rounded-lg flex items-center justify-center border border-white/10">
                <Zap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tighter text-white">{content?.navbarBrand || "ViaLinks"}</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => {
                  const el = document.getElementById('home');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('conceito');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                Sobre
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('diferenciais');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                Diferenciais
              </button>
              <button 
                onClick={scrollToPlanos}
                className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                Preços
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Icon - Visible on all screens */}
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-white hover:text-vialinks-orange transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-vialinks-orange text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-vialinks-purple">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop Login and CTA */}
            <div className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => setView(user ? 'dashboard' : 'login')}
                className="flex items-center gap-2 text-sm font-bold text-white hover:text-vialinks-orange transition-colors"
              >
                <span>Login</span>
                <LogIn className="w-5 h-5 text-vialinks-orange" />
              </button>
              
              <button 
                onClick={scrollToPlanos}
                className="bg-vialinks-orange text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-tight hover:bg-vialinks-orange/90 transition-all shadow-lg shadow-vialinks-orange/20"
              >
                Quero um Card
              </button>
            </div>

            <button 
              onClick={onOpenMenu}
              className="lg:hidden p-2 rounded-lg transition-colors text-white hover:bg-white/10"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Offcanvas = ({ 
  isOpen, 
  onClose, 
  setView, 
  user, 
  onLogout, 
  onOpenCart,
  cartCount 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  setView: (v: any) => void; 
  user: any; 
  onLogout: () => void; 
  onOpenCart: () => void;
  cartCount: number;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-full max-w-xs z-[70] overflow-hidden bg-slate-950"
        >
          {/* Noise Gradient Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,var(--color-vialinks-purple)_0%,#000000_100%)] opacity-80" />
            <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" />
          </div>

          <div className="relative z-10 h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <Zap className="text-vialinks-orange w-6 h-6" />
                <span className="text-xl font-bold text-white">Menu</span>
              </div>
              <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <button 
                onClick={() => { 
                  const el = document.getElementById('home');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onClose(); 
                }}
                className="flex items-center gap-3 text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <Globe className="w-5 h-5" /> Home
              </button>
              <button 
                onClick={() => { 
                  const el = document.getElementById('conceito');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onClose(); 
                }}
                className="flex items-center gap-3 text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <Info className="w-5 h-5" /> Sobre
              </button>
              <button 
                onClick={() => { 
                  const el = document.getElementById('diferenciais');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onClose(); 
                }}
                className="flex items-center gap-3 text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <Zap className="w-5 h-5" /> Diferenciais
              </button>
              <button 
                onClick={() => { 
                  const el = document.getElementById('planos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onClose(); 
                }}
                className="flex items-center gap-3 text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <CreditCard className="w-5 h-5" /> Preços
              </button>
              <button 
                onClick={() => { setView(user ? 'dashboard' : 'login'); onClose(); }}
                className="flex items-center gap-3 text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" /> Minha Conta
              </button>
              
              <button 
                onClick={() => { onOpenCart(); onClose(); }}
                className="flex items-center justify-between text-lg font-medium text-white hover:text-vialinks-orange transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" /> Carrinho
                </div>
                {cartCount > 0 && (
                  <span className="bg-vialinks-orange text-white text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-px bg-white/10 my-4" />
              {user ? (
                <button 
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex items-center gap-3 text-lg font-medium text-white/60 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              ) : (
                <button 
                  onClick={() => { setView('login'); onClose(); }}
                  className="flex items-center gap-3 text-lg font-medium text-white/60 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" /> Entrar / Cadastrar
                </button>
              )}
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => {
                  const el = document.getElementById('planos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onClose();
                }}
                className="w-full bg-vialinks-orange text-white py-4 rounded-xl font-bold shadow-lg shadow-vialinks-orange/20 uppercase tracking-tight"
              >
                Quero um Card
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Hero = ({ content }: { content?: any }) => {
  const container = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  const scrollToPlanos = () => {
    const el = document.getElementById('planos');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Entry animation for mockup
      gsap.from(".hero-mockup", {
        opacity: 0,
        scale: 0.8,
        x: 100,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3
      });

      // Floating animation
      gsap.to(".hero-mockup", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Text entry
      gsap.from(".hero-text > *", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
      });
    });

    mm.add("(max-width: 1023px)", () => {
      // Simplified animations for mobile
      gsap.from(".hero-text > *", {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out"
      });

      gsap.from(".hero-mockup", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        delay: 0.2
      });
    });

    return () => mm.revert();
  }, { scope: container });

  return (
    <section ref={container} id="home" className="relative pt-24 pb-0 lg:pt-20 lg:pb-0 overflow-hidden">
      {/* Seamless transition handled by main wrapper */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-20 lg:gap-32 items-center pt-4 lg:pt-12">
          <div className="hero-text text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vialinks-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vialinks-orange"></span>
              </span>
              {content?.heroBadge || "Nova Tecnologia NFC"}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-[1.1] mb-4">
              {content?.heroTitle || "Seu card digital profissional com NFC e painel para você editar quando quiser."}
            </h1>
            <p className="text-sm text-purple-100 mb-6 leading-relaxed max-w-2xl">
              {content?.heroDesc || "O ViaLinks une a tecnologia NFC física com mini-sites de alta performance em forma de CARD DIGITAL. Seja encontrado nas pesquisas, conecte seu próprio domínio e altere seus dados em segundos, sem depender de ninguém."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <button 
                onClick={scrollToPlanos}
                className="bg-vialinks-orange text-white px-8 py-4 rounded-xl text-base font-bold hover:shadow-xl hover:shadow-vialinks-orange/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                Criar meu ViaLinks Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="https://cartao-digital-financeiro.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
              >
                Ver Demonstração
              </a>
            </div>
            <div className="mt-8 flex flex-row items-center gap-2 text-xs text-purple-200">
              <div className="flex -space-x-2">
                <img 
                  src="https://picsum.photos/seed/user1/100/100" 
                  alt="Perfil de usuário ViaLinks" 
                  className="w-8 h-8 rounded-full border-2 border-vialinks-purple object-cover"
                  referrerPolicy="no-referrer"
                />
                {[2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="Profissional satisfeito com ViaLinks" 
                    className="w-8 h-8 rounded-full border-2 border-vialinks-purple"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p>{content?.heroSocialProof || <><strong>Faça parte</strong> da comunidade de profissionais que já usam ViaLinks</>}</p>
            </div>
          </div>

          <div className="hero-mockup relative flex justify-center lg:justify-end lg:-mr-32 mt-6 lg:mt-8">
            <div className="relative z-10 max-w-[800px] lg:max-w-none transform scale-110 sm:scale-125 lg:scale-150 origin-center lg:origin-right">
              <FirebaseImage 
                storagePath={content?.heroImageUrl || "11945874_Card_Phone2.png"} 
                fallbackUrl="https://ais-dev-g52kgdoyt4kbetthjleoif-84265199171.us-east1.run.app/input_file_0.png"
                alt="ViaLinks Mockup" 
                className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tools Marquee Section */}
      <div className="mt-8 lg:mt-12 relative z-10">
        <div className="bg-black/20 backdrop-blur-md border-t border-white/5 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
            <div className="flex items-center justify-center gap-2 text-purple-200/60 text-[10px] font-medium uppercase tracking-widest">
              <Zap className="w-3 h-3 text-vialinks-orange" />
              Conecte seu card às ferramentas que você já usa no dia a dia
            </div>
          </div>
          
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 lg:gap-20">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 lg:gap-20">
                  {[
                    "WhatsApp", "Instagram", "LinkedIn", "Site Próprio", 
                    "Catálogo Digital", "Localização", "Facebook", "YouTube", 
                    "TikTok", "Telegram", "Spotify", "E-mail", "Telefone"
                  ].map((tool) => (
                    <span key={tool} className="text-white/40 text-lg lg:text-xl font-black uppercase tracking-tighter italic hover:text-white/80 transition-colors cursor-default">
                      {tool}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const xPercent = (x / width - 0.5) * 2; // -1 to 1
    const yPercent = (y / height - 0.5) * 2; // -1 to 1
    
    gsap.to(cardRef.current, {
      rotateY: xPercent * 15,
      rotateX: -yPercent * 15,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

const Concept = ({ content }: { content?: any }) => {
  const container = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Timelines Basic for Concept
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 70%",
        }
      });

      tl.from(".concept-title", { opacity: 0, y: 30, duration: 0.8 })
        .from(".concept-text", { opacity: 0, y: 20, stagger: 0.2, duration: 0.8 }, "-=0.4")
        .from(".concept-card", { 
          opacity: 0, 
          scale: 0.8, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: "back.out(1.7)" 
        }, "-=0.6")
        .from(".concept-list-item", { opacity: 0, x: -20, stagger: 0.1, duration: 0.5 }, "-=0.4");

      // Parallax Scrolling Effect
      gsap.to(bgRef.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    mm.add("(max-width: 1023px)", () => {
      // Very simple fade in for mobile
      gsap.from(container.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        }
      });
    });

    return () => mm.revert();
  }, { scope: container });

  return (
    <section ref={container} id="conceito" className="py-24 relative overflow-hidden">
      {/* Seamless background */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <TiltCard className="concept-card">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 h-full">
                    <Search className="w-8 h-8 text-vialinks-orange mb-4" />
                    <h3 className="font-bold text-white mb-2">{content?.conceptCard1Title || "SEO Nativo"}</h3>
                    <p className="text-sm text-purple-100">{content?.conceptCard1Desc || "Estruturado para aparecer no topo das buscas do Google."}</p>
                  </div>
                </TiltCard>
                <TiltCard className="concept-card">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 h-full">
                    <Globe className="w-8 h-8 text-vialinks-orange mb-4" />
                    <h3 className="font-bold text-white mb-2">{content?.conceptCard2Title || "Domínio Próprio"}</h3>
                    <p className="text-sm text-purple-100">{content?.conceptCard2Desc || "Sua marca com seu próprio endereço .com.br"}</p>
                  </div>
                </TiltCard>
              </div>
              <div className="space-y-4">
                <TiltCard className="concept-card">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 h-full">
                    <Smartphone className="w-8 h-8 text-vialinks-orange mb-4" />
                    <h3 className="font-bold text-white mb-2">{content?.conceptCard3Title || "100% Mobile"}</h3>
                    <p className="text-sm text-purple-100">{content?.conceptCard3Desc || "Experiência fluida em qualquer dispositivo."}</p>
                  </div>
                </TiltCard>
                <TiltCard className="concept-card">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 h-full">
                    <Zap className="text-vialinks-orange w-8 h-8 mb-4" />
                    <h3 className="font-bold text-white mb-2">{content?.conceptCard4Title || "Alta Performance"}</h3>
                    <p className="text-sm text-purple-100">{content?.conceptCard4Desc || "Carregamento instantâneo para não perder leads."}</p>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="concept-title text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
              {content?.conceptTitle || "O conceito que está revolucionando o networking profissional."}
            </h2>
            <div className="space-y-6">
              <p className="concept-text text-lg text-purple-100 leading-relaxed">
                {content?.conceptText1 || "O ViaLinks não é apenas um link na bio. É uma plataforma de autoridade digital que une a praticidade do NFC físico com a potência de um mini-site otimizado para conversão."}
              </p>
              <p className="concept-text text-lg text-purple-100 leading-relaxed">
                {content?.conceptText2 || "Tenha todas as suas informações, catálogos, redes sociais e formas de pagamento em um só lugar, acessível com apenas um toque ou scan."}
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  "Sem mensalidades recorrentes",
                  "Edição ilimitada pelo painel",
                  "Compatível com iOS e Android",
                  "Relatórios de acessos em tempo real"
                ].map((item, i) => (
                  <li key={i} className="concept-list-item flex items-center gap-3 text-white font-medium">
                    <div className="w-6 h-6 rounded-full bg-vialinks-orange/20 flex items-center justify-center text-vialinks-orange">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Differentials = ({ content }: { content?: any }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      gsap.to(bgRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  const diffs = [
    {
      icon: <Settings className="w-10 h-10" />,
      title: content?.diffTitle0 || "Painel Administrativo",
      desc: content?.diffDesc0 || "Você no controle total. Altere links, fotos e informações em tempo real sem depender de suporte técnico.",
      color: "from-vialinks-orange to-orange-600"
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: content?.diffTitle1 || "Domínio Próprio",
      desc: content?.diffDesc1 || "Sua marca com endereço exclusivo. Use seunome.com.br diretamente no seu card digital ViaLinks.",
      color: "from-vialinks-purple to-purple-600"
    },
    {
      icon: <div className="flex gap-2"><Smartphone className="w-6 h-6" /><Tablet className="w-6 h-6" /><Monitor className="w-6 h-6" /></div>,
      title: content?.diffTitle2 || "Responsividade Total",
      desc: content?.diffDesc2 || "Adaptação cirúrgica às três telas: Celular, Tablet e Desktop para máxima acessibilidade e conversão.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: content?.diffTitle3 || "Bônus PDF Interativo",
      desc: content?.diffDesc3 || "Leve o seu mini-site no bolso. Geramos um PDF interativo idêntico ao seu site para envio rápido via WhatsApp.",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <section ref={containerRef} id="diferenciais" className="relative pt-24 pb-12 overflow-hidden">
      {/* Seamless background */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col items-center">
        {/* Header at the Top - More Compact */}
        <div className="text-center mb-16 max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-vialinks-orange/10 text-vialinks-orange text-xs font-bold mb-4"
          >
            {content?.heroBadge || "TECNOLOGIA DE PONTA"}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight"
          >
            {content?.diffsTitle || <>Diferenciais que <span className="text-vialinks-orange">Elevam seu Nível</span></>}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-400"
          >
            {content?.diffsDesc || "Não é apenas um cartão, é uma plataforma completa de networking digital desenhada para converter contatos em clientes."}
          </motion.p>
        </div>

        {/* Horizontal Overlapping Cards - Carousel on Mobile/Tablet */}
        <div className="relative w-full group/carousel">
          <div 
            ref={carouselRef}
            className="relative w-full overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-hide"
          >
            <div className="flex lg:justify-center items-center gap-6 lg:gap-0 lg:-space-x-36 px-8 lg:px-0 min-w-max lg:min-w-0 h-[450px]">
              {diffs.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const isAnyHovered = hoveredIndex !== null;
                
                return (
                  <motion.div
                    key={i}
                    className="snap-center relative w-[280px] md:w-[320px] lg:w-[360px] h-[380px] p-6 md:p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl cursor-pointer flex flex-col justify-between group overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }}
                    initial={{ 
                      y: 0,
                      rotate: 0,
                    }}
                    whileInView={{
                      rotate: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (i - 1.5) * 2 : 0,
                    }}
                    animate={{
                      y: isHovered ? -30 : 0,
                      rotate: isHovered ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? (i - 1.5) * 2 : 0),
                      scale: isHovered ? 1.05 : (isAnyHovered ? 0.95 : 1),
                      zIndex: isHovered ? 50 : 10 + i,
                      opacity: isAnyHovered && !isHovered ? 0.6 : 1,
                    }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    onHoverStart={() => setHoveredIndex(i)}
                    onHoverEnd={() => setHoveredIndex(null)}
                  >
                    {/* Gradient Accent */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${item.color}`} />
                    
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-vialinks-orange font-bold">
                      <span className="text-[10px] md:text-xs">Explorar Recurso</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows - Mobile/Tablet Only */}
          <div className="lg:hidden absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none z-20">
            <button 
              onClick={() => scrollCarousel('left')}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Indicators */}
          <div className="lg:hidden flex justify-center gap-2 mt-4">
            {diffs.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Cycle = ({ onAddToCart, content }: { onAddToCart: (item: any) => void; content?: any }) => {
  const container = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Timelines Basic for Flow Header/Footer
      const tlIntro = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      tlIntro.from(".cycle-header", { opacity: 0, y: 30, duration: 0.8 })
        .from(".cycle-step", { 
          opacity: 0, 
          y: 50, 
          stagger: 0.2, 
          duration: 0.8,
          ease: "back.out(1.7)"
        }, "-=0.4")
        .from(".cycle-footer", { opacity: 0, scale: 0.9, duration: 0.6 }, "-=0.2");

      // Continuous Repeating Timeline
      let tlLoop = gsap.timeline({delay: 1, repeat: -1, yoyo: true});
      tlLoop.to(".cycle-icon-1", {duration: 1, rotation: -360})
        .to(".cycle-icon-2", {duration: 2, x: -20, ease: 'elastic.out'})
        .to(".cycle-icon-3", {duration: 2, rotation: 360, x: 20, ease: 'expo.out'});

      // Parallax for background
      gsap.to(bgRef.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    mm.add("(max-width: 1023px)", () => {
      // Simple fade in for mobile
      gsap.from(".cycle-step", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        }
      });
    });

    return () => mm.revert();
  }, { scope: container });

  return (
    <section ref={container} className="pt-12 pb-24 text-white overflow-hidden relative">
      {/* Seamless background */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 cycle-header">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{content?.cycleTitle || "O Ciclo ViaLinks"}</h2>
          <p className="text-purple-200 text-lg">{content?.cycleDesc || "Entenda como funciona o ecossistema que vai escalar seu networking."}</p>
        </div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-vialinks-orange/30 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Smartphone />, label: content?.cycleStepTitle0 || "Cartão Físico NFC", sub: content?.cycleStepSub0 || "Toque no Celular", iconClass: "cycle-icon-1" },
              { icon: <Globe />, label: content?.cycleStepTitle1 || "Abre Mini-site ViaLinks", sub: content?.cycleStepSub1 || "Experiência Instantânea", iconClass: "cycle-icon-2" },
              { icon: <Search />, label: content?.cycleStepTitle2 || "Google Indexa seu Perfil", sub: content?.cycleStepSub2 || "Seja Encontrado", iconClass: "cycle-icon-3" },
              { icon: <UserPlus />, label: content?.cycleStepTitle3 || "Cliente Salva Contato", sub: content?.cycleStepSub3 || "Mais Vendas", iconClass: "cycle-icon-4" }
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group cycle-step">
                <div className={`w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 group-hover:bg-vialinks-orange group-hover:border-vialinks-orange transition-all duration-300 ${step.iconClass}`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.label}</h3>
                <p className="text-purple-200 text-sm">{step.sub}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-4 translate-x-1/2 text-vialinks-orange">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-center cycle-footer">
          <p className="text-xl font-medium mb-6">{content?.cycleFooterText || <>Tudo isso gerenciado por um <span className="text-vialinks-orange font-bold">Painel Admin</span> intuitivo.</>}</p>
          <button 
            onClick={() => {
              const el = document.getElementById('planos');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-vialinks-purple px-8 py-3 rounded-full font-bold hover:bg-vialinks-orange hover:text-white transition-all"
          >
            {content?.cycleBtnText || "Ver Planos e Preços"}
          </button>
        </div>
      </div>
    </section>
  );
};

const Pricing = ({ user, setView, onAddToCart, content }: { user: any; setView: (v: any) => void; onAddToCart: (item: any) => void; content?: any }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Read plans directly from Firestore 'plans' collection
    const unsubscribe = onSnapshot(collection(db, "plans"), (snapshot) => {
      if (!snapshot.empty) {
        const plansData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        
        const activePlans = plansData.filter((p: any) => p.active !== false);
        setPlans(activePlans);
      } else {
        setPlans([]);
      }
      setLoading(false);
    }, (error: any) => {
      console.error("Error fetching plans:", error);
      setPlans([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="planos" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{content?.pricingTitle || "Planos e Preços"}</h2>
          <p className="text-lg text-slate-400">{content?.pricingDesc || "Escolha o plano ideal para o seu momento profissional. Pagamento único, sem mensalidades."}</p>
        </div>


        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vialinks-orange"></div>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
            {plans.filter(p => !p.category || p.category === "direct").map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative p-8 rounded-3xl border ${
                  plan.popular 
                    ? 'border-vialinks-purple bg-vialinks-purple text-white shadow-2xl shadow-vialinks-purple/20 z-10' 
                    : 'border-white/10 bg-white/5 backdrop-blur-md text-white hover:border-white/20'
                } flex flex-col transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-vialinks-orange text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                    Mais Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">
                        {typeof plan.price === 'number' 
                          ? plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : plan.price}
                      </span>
                      <span className={plan.popular ? 'text-purple-200' : 'text-slate-400'}>{plan.category === 'resale' ? '/unid' : '/único'}</span>
                    </div>
                  </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {(plan.features || []).map((feature: any, idx: number) => {
                    const isObject = typeof feature === 'object' && feature !== null;
                    const included = isObject ? feature.included : true;
                    const text = isObject ? feature.text : feature;
                    
                    return (
                      <li key={idx} className={`flex items-center gap-3 text-sm ${!included && 'opacity-40'}`}>
                        {included ? (
                          <Check className={`w-5 h-5 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        {text}
                      </li>
                    );
                  })}
                  {plan.excludedFeatures && plan.excludedFeatures.map((feature: string, idx: number) => (
                    <li key={`ex-${idx}`} className="flex items-center gap-3 text-sm opacity-60">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-slate-400 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    const finalPrice = typeof plan.numericPrice === 'number' ? plan.numericPrice : (typeof plan.price === 'number' ? plan.price : parseFloat(String(plan.price || '0').replace(/[^\d.,]/g, '').replace(',', '.')));
                    const finalLink = plan.paymentLink;
                    
                    onAddToCart({ 
                      id: plan.id, 
                      name: plan.name, 
                      price: typeof plan.price === 'number' ? plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : plan.price, 
                      numericPrice: isNaN(finalPrice) ? 0 : finalPrice,
                      quantity: 1,
                      paymentLink: finalLink
                    });
                  }}
                  className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
                    plan.popular 
                      ? 'bg-vialinks-orange text-white hover:shadow-lg hover:shadow-vialinks-orange/40' 
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Comprar Agora
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum plano ativo encontrado.</p>
            <p className="text-xs text-slate-500 mt-2">Verifique o Painel Admin e certifique-se de que os planos estão marcados como 'Ativo'.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const Footer = ({ setView, content }: { setView: (v: any) => void; content?: any }) => {
  return (
    <footer className="text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-vialinks-purple rounded-lg flex items-center justify-center">
                <Zap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tighter">{content?.navbarBrand || "ViaLinks"}</span>
            </div>
            <p className="text-slate-400 max-w-md mb-6">
              A plataforma definitiva para networking profissional. Transforme seus contatos em oportunidades reais com tecnologia NFC e mini-sites de alta performance.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Site Seguro</span>
                </div>
                <div className="flex gap-2">
                  <img src="https://www.gstatic.com/images/branding/googlelogo/svg/google_logo.svg" alt="Google Safe Browsing" className="h-3 opacity-50 grayscale invert" />
                  <span className="text-[10px] text-slate-500">Google Safe Browsing</span>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-vialinks-orange">
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pagamento Seguro</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-70 grayscale invert" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Navegação</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><button onClick={() => setView('landing')} className="hover:text-vialinks-orange transition-colors">Home</button></li>

              <li><button onClick={() => setView('terms')} className="hover:text-vialinks-orange transition-colors">Termos de Uso</button></li>
              <li><button onClick={() => setView('privacy')} className="hover:text-vialinks-orange transition-colors">Privacidade</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Empresa</h4>
            <p className="text-sm text-slate-400 mb-2">CNPJ: 52.594.366/0001-30</p>
            <p className="text-sm text-slate-400 mb-4">E-TODAVIA Agência Criativa</p>
            <a href="https://agenciaetodavia.com.br" target="_blank" rel="noopener noreferrer" className="text-vialinks-orange hover:underline text-sm font-bold">
              agenciaetodavia.com.br
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 uppercase tracking-widest font-bold">
          <p>© 2026 ViaLinks Tecnologia - Todos os direitos reservados.</p>
          <p>Desenvolvido por E-TODAVIA Agência Criativa</p>
        </div>
      </div>
    </footer>
  );
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      where("status", "==", "approved")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  if (testimonials.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#2d1b4d_0%,transparent_70%)] opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            O que dizem nossos <span className="text-vialinks-orange">Clientes</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Confira o depoimento de quem já transformou seu networking com o ViaLinks.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-vialinks-purple/20 mb-6 overflow-hidden border-2 border-vialinks-purple/30">
                  {testimonials[currentIndex].userPhoto ? (
                    <img src={testimonials[currentIndex].userPhoto} alt={testimonials[currentIndex].userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-full h-full p-4 text-vialinks-purple" />
                  )}
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${testimonials[currentIndex].rating >= star ? 'text-yellow-400 fill-current' : 'text-white/10'}`} />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-white font-medium italic mb-8 leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>
                <div>
                  <p className="text-white font-bold text-lg">{testimonials[currentIndex].userName}</p>
                  <p className="text-vialinks-orange text-sm font-medium">Cliente ViaLinks</p>
                  {testimonials[currentIndex].cardLink && (
                    <a 
                      href={testimonials[currentIndex].cardLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-all"
                    >
                      <Eye className="w-3 h-3" /> Ver Card do Cliente
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {testimonials.length > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={prev} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-vialinks-purple transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-vialinks-purple transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const CheckoutView = ({ cart, user, isProcessing, onCheckout, setView, content }: { cart: any[]; user: any; isProcessing: boolean; onCheckout: (data?: any) => void; setView: (v: any) => void; content?: any }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isIntentLoading, setIsIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const total = cart.reduce((acc, item) => {
    const price = item.numericPrice || (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d,]/g, '').replace(',', '.'))) || 0;
    return acc + (price * item.quantity);
  }, 0);

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    taxId: "",
    zip: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed local PaymentIntent creation - we will use Hosted Checkout Session instead

  // Removed handleCreatePaymentIntent

  const checkServerHealth = async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('/api/ping', { signal: controller.signal });
      clearTimeout(id);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const onFinalizeClick = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    if (!formData.name || formData.name.length < 2) {
      alert("Por favor, insira seu nome.");
      return;
    }

    setIsIntentLoading(true);
    setIntentError(null);

    try {
      // 1. Save Lead/Abandoned Cart moved to backend to avoid Permission Denied on Frontend
      const total = cart.reduce((acc, item) => {
        const price = typeof item.numericPrice === 'number' ? item.numericPrice : (typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0').replace(/[^\d.,]/g, '').replace(',', '.'))) || 0;
        return acc + (price * item.quantity);
      }, 0);

      // 2. Attempt to create Checkout Session via backend API (Backend will handle saving to "sales")
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              numericPrice: item.numericPrice || item.price,
              targetClientId: item.targetClientId
            })),
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            taxId: formData.taxId
          })
        });

        if (response.ok) {
          const { url } = await response.json();
          if (url) {
            window.location.href = url;
            return;
          }
        } else {
          const errData = await response.json();
          console.warn("[Backend Checkout Error]:", errData);
        }
      } catch (err: any) {
        console.warn("[API Checkout Connection Failed]:", err.message);
      }

      // 3. Fallback: Determine Redirection URL from direct links
      // We look for a paymentLink in the first item of the cart (usually it's one main product)
      const mainProduct = cart[0];
      const redirectUrl = mainProduct?.paymentLink || mainProduct?.numericPrice_link; 

      if (redirectUrl) {
        // Append email to Stripe Payment Link for convenience if it's a Stripe link
        const finalUrl = redirectUrl.includes('buy.stripe.com') 
          ? `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(formData.email)}`
          : redirectUrl;
          
        window.location.href = finalUrl;
      } else {
        // Final Fallback: If no link is found, return to landing
        setIntentError("Link de pagamento indisponível para este plano no momento.");
      }
    } catch (err: any) {
      console.error("Checkout Capture Error:", err);
      setIntentError(`Erro ao processar seu pedido. Detalhes: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsIntentLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Seu carrinho está vazio</h2>
          <button onClick={() => setView('landing')} className="text-vialinks-purple font-bold hover:underline">
            Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-vialinks-orange rounded-lg flex items-center justify-center text-white font-black italic">V</div>
            <span className="font-black text-vialinks-purple text-xl tracking-tighter">VIALINKS</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span className="hidden sm:inline">Ambiente Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-orange-800">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Sua oferta expira em:</span>
              </div>
              <span className="text-xl font-black text-orange-600 tabular-nums">{formatTime(timeLeft)}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-vialinks-purple rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <h3 className="font-bold text-slate-800">Dados Pessoais</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      onBlur={() => { /* No-op: Hosted Checkout handles session on final click */ }}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp / Telefone</label>
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CPF ou CNPJ</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
                      value={formData.taxId}
                      onChange={e => setFormData({...formData, taxId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50 mt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CEP</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Endereço</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Número" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                  <input type="text" placeholder="Bairro" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Cidade" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input type="text" placeholder="UF" className="w-20 px-4 py-3 rounded-xl border border-slate-200 outline-none uppercase" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-vialinks-purple rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <h3 className="font-bold text-slate-800">Pagamento</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button 
                    onClick={onFinalizeClick}
                    disabled={isIntentLoading}
                    className="w-full bg-vialinks-orange text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-vialinks-orange/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isIntentLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>CONCLUIR PEDIDO <ArrowRight className="w-6 h-6" /></>}
                  </button>
                  {intentError && <p className="text-red-500 text-sm text-center font-bold font-mono p-4 bg-red-50 rounded-lg">{intentError}</p>}
                  <div className="flex justify-center items-center gap-4 opacity-70 grayscale-0 px-4 mt-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pagamento 100% Seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-vialinks-purple" /> Resumo do Pedido
              </h3>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="font-bold text-vialinks-purple">R$ {(item.numericPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 text-xl font-black flex justify-between">
                <span>Total</span>
                <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-4 text-center text-slate-400 text-xs space-y-4">
        <p>© 2026 ViaLinks Tecnologia.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => setView('terms')} className="hover:text-slate-600">Termos</button>
          <button onClick={() => setView('privacy')} className="hover:text-slate-600">Privacidade</button>
        </div>
      </footer>
    </div>
  );
};

const ThankYouView = ({ setView, content, purchaseEmail, purchaseStatus, user }: { 
  setView: (v: any) => void; 
  content?: any; 
  purchaseEmail: string | null; 
  purchaseStatus: string | null;
  user: any 
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseEmail || !password) return;
    setLoading(true);
    setError(null);
    try {
      try {
        // Try to create new user
        await createUserWithEmailAndPassword(auth, purchaseEmail, password);
        setRegistered(true);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          // If already exists, try to login
          await signInWithEmailAndPassword(auth, purchaseEmail, password);
          setRegistered(true);
        } else {
          throw err;
        }
      }
      setView('dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      setError("Erro ao finalizar cadastro. Se já tiver conta, tente entrar normalmente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4">
          {purchaseStatus === 'processing' ? "Pedido Recebido!" : "Tudo Pronto!"}
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          {purchaseStatus === 'processing' 
            ? "Estamos processando seu pagamento! Verifique seu e-mail para os dados de acesso em instantes."
            : "Sua compra foi aprovada! Enviamos um e-mail com seus dados de acesso (usuário e senha) para você entrar na plataforma."}
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => setView('login')}
            className="w-full bg-vialinks-orange text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-vialinks-orange/20 flex items-center justify-center gap-3"
          >
            Acessar Minha Conta
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-12">
          <button 
            onClick={() => setView('landing')}
            className="text-slate-500 hover:text-white text-sm transition-colors"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<any>('landing');
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [siteContent, setSiteContent] = useState<any>({});
  const [tags, setTags] = useState<any>({});
  const [purchaseEmail, setPurchaseEmail] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeContent = onSnapshot(doc(db, "config", "content"), (snapshot) => {
      if (snapshot.exists()) {
        setSiteContent(snapshot.data().settings);
      }
    });

    const unsubscribeTags = onSnapshot(doc(db, "config", "tags"), (snapshot) => {
      if (snapshot.exists()) {
        const tagData = snapshot.data().settings;
        setTags(tagData);
        
        // Inject tags
        if (tagData.gtmHeader) {
          const script = document.createElement('script');
          script.innerHTML = tagData.gtmHeader.replace(/<script>|<\/script>/g, '');
          document.head.appendChild(script);
        }
        if (tagData.gtmBody) {
          const div = document.createElement('div');
          div.innerHTML = tagData.gtmBody;
          document.body.appendChild(div);
        }

        // SEO and Meta Tags Injection
        if (tagData.seoTitle) document.title = tagData.seoTitle;
        
        const updateOrAddMeta = (name: string, content: string, isProperty = false) => {
          if (!content) return;
          const attr = isProperty ? 'property' : 'name';
          let meta = document.querySelector(`meta[${attr}="${name}"]`);
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        };

        updateOrAddMeta('description', tagData.seoDescription);
        updateOrAddMeta('keywords', tagData.seoKeywords);
        
        // OpenGraph
        updateOrAddMeta('og:title', tagData.seoTitle, true);
        updateOrAddMeta('og:description', tagData.seoDescription, true);
        updateOrAddMeta('og:image', tagData.seoImage, true);
        updateOrAddMeta('og:type', 'website', true);
        updateOrAddMeta('og:url', window.location.href, true);
        
        // Twitter
        updateOrAddMeta('twitter:card', 'summary_large_image');
        updateOrAddMeta('twitter:title', tagData.seoTitle);
        updateOrAddMeta('twitter:description', tagData.seoDescription);
        updateOrAddMeta('twitter:image', tagData.seoImage);
      }
    });

    const handleViewChange = (e: any) => {
      setView(e.detail);
      window.scrollTo(0, 0);
    };
    window.addEventListener('changeView', handleViewChange);

    return () => {
      unsubscribeContent();
      unsubscribeTags();
      window.removeEventListener('changeView', handleViewChange);
    };
  }, []);

  console.log("App rendering, isAuthReady:", isAuthReady, "user:", user?.uid);

  const addToCart = (item: any) => {
    // Replace the entire cart with the new item, ensuring only one product is present
    setCart([{ ...item, quantity: 1 }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          let userData: any = { ...firebaseUser };
          
          if (userDoc.exists()) {
            userData = { ...firebaseUser, ...userDoc.data() };
          } else {
            // Check if a pre-created account exists with this email
            const emailDoc = await getDoc(doc(db, "users", firebaseUser.email?.toLowerCase() || ""));
            
            if (emailDoc.exists() && emailDoc.data()?.isPreCreated) {
              // Found a pre-created doc by email! Move it to the UID doc.
              const preData = emailDoc.data();
              const newUserData = {
                ...preData,
                uid: firebaseUser.uid, // Add the actual UID
                isPreCreated: false, // Mark as no longer "pre-created" (active)
                updatedAt: serverTimestamp()
              };
              
              // Create the UID document
              await setDoc(doc(db, "users", firebaseUser.uid), newUserData);
              
              // Delete the old email-indexed document
              try {
                // Warning: This might require specific Firestore rules
                // Alternatively, just mark it as moved or keep it.
                // But for cleanliness, we try to move.
              } catch (e) {
                console.error("Erro ao limpar pre-cadastro:", e);
              }
              
              userData = { ...firebaseUser, ...newUserData };
            } else {
              // Create new user document if it doesn't exist
              const newUserData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'client',
                hasSeenOnboarding: false,
                createdAt: serverTimestamp()
              };
              await setDoc(doc(db, "users", firebaseUser.uid), newUserData);
              userData = { ...firebaseUser, ...newUserData };
            }
          }
          
          // Check if email is a hardcoded admin
          const adminEmails = ["equipeetodavia@gmail.com", "contato@agenciaetodavia.com.br"];
          if (adminEmails.includes(firebaseUser.email || "")) {
            userData.role = 'admin';
          }
          
          setUser(userData);
          
          // Redirect to admin if role is admin and currently on login or dashboard
          if (userData.role === 'admin' && (view === 'login' || view === 'dashboard')) {
            setView('admin');
          } else if (view === 'login') {
            setView('dashboard');
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          setUser(firebaseUser);
          if (view === 'login') setView('dashboard');
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentIntent = urlParams.get('payment_intent');
    
    if (urlParams.get('success') === 'true' && (sessionId || paymentIntent)) {
      setView('thank-you');
      // Verify and record sale in Firestore
      const verifyUrl = sessionId 
        ? `/api/checkout/verify?session_id=${sessionId}`
        : `/api/checkout/verify?payment_intent=${paymentIntent}`;

      fetch(verifyUrl)
        .then(res => res.json())
        .then(async (data) => {
          if (data.success) {
            setPurchaseEmail(data.email);
            setPurchaseStatus(data.status || 'succeeded');
            if (auth.currentUser) {
              const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
              try {
                await addDoc(collection(db, "sales"), {
                  userId: auth.currentUser.uid,
                  email: data.email,
                  amount: data.amount,
                  stripe_id: data.stripe_id,
                  status: 'paid',
                  createdAt: serverTimestamp()
                });
              } catch (err) {
                console.error("Error recording sale:", err);
              }
            }
          }
        });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView('landing');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // If not already on checkout view, go there first
    if (view !== 'checkout') {
      setView('checkout');
      setIsCartOpen(false);
      window.scrollTo(0, 0);
      return;
    }
  };

  if (!isAuthReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-vialinks-purple/20 blur-[100px] rounded-full animate-pulse" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-20 h-20 bg-vialinks-purple rounded-3xl flex items-center justify-center shadow-2xl shadow-vialinks-purple/40 mb-6"
        >
          <Zap className="text-white w-10 h-10" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-black text-white tracking-tighter mb-4"
        >
          ViaLinks
        </motion.h2>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-vialinks-orange rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-vialinks-orange rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-vialinks-orange rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-vialinks-purple/20 blur-[100px] rounded-full animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-16 bg-vialinks-purple rounded-2xl flex items-center justify-center shadow-xl shadow-vialinks-purple/30 mb-4"
          >
            <Zap className="text-white w-8 h-8" />
          </motion.div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-vialinks-orange rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-vialinks-orange rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-vialinks-orange rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    }>
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
        isProcessing={isProcessing}
      />
      
      {view === 'dashboard' && user && (
        <DashboardLayout 
          user={user} 
          setView={setView} 
          onLogout={handleLogout} 
          onAddToCart={addToCart} 
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}
      {view === 'admin' && user?.role === 'admin' && (
        <AdminDashboard 
          user={user} 
          setView={setView} 
          onLogout={handleLogout} 
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}
      {view === 'login' && <LoginView setView={setView} setUser={setUser} />}
      {view === 'checkout' && <CheckoutView cart={cart} user={user} isProcessing={isProcessing} onCheckout={handleCheckout} setView={setView} content={siteContent} />}

      {(view === 'landing' || view === 'terms' || view === 'privacy' || view === 'store' || view === 'thank-you') && (
        <div className="vialinks-main-bg min-h-screen w-full overflow-x-hidden selection:bg-vialinks-orange/30 selection:text-vialinks-orange">
          {/* Noise Overlay */}
          <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
          
          <div className="relative z-10">
            <Navbar 
              onOpenMenu={() => setIsMenuOpen(true)} 
              setView={setView} 
              user={user} 
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
              content={siteContent}
            />
            <Offcanvas 
              isOpen={isMenuOpen} 
              onClose={() => setIsMenuOpen(false)} 
              setView={setView} 
              user={user}
              onLogout={handleLogout}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            />
            <main>
              {view === 'thank-you' && (
                <ThankYouView 
                  setView={setView} 
                  content={siteContent} 
                  purchaseEmail={purchaseEmail} 
                  purchaseStatus={purchaseStatus}
                  user={user} 
                />
              )}
              {view === 'landing' && (
                <>
                  <Hero content={siteContent} />
                  <Concept content={siteContent} />
                  <Differentials content={siteContent} />
                  <TestimonialsSection />
                  <Cycle onAddToCart={addToCart} content={siteContent} />
                  <Pricing user={user} setView={setView} onAddToCart={addToCart} content={siteContent} />
                </>
              )}
              {view === 'terms' && <TermsView setView={setView} content={siteContent} />}
              {view === 'privacy' && <PrivacyView setView={setView} content={siteContent} />}
              {view === 'store' && <StoreView user={user} setView={setView} onAddToCart={addToCart} content={siteContent} />}
            </main>
            <Footer setView={setView} content={siteContent} />
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default App;
