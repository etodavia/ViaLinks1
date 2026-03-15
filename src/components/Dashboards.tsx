import * as React from "react";
import { useState, useEffect, Component } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  LogOut, 
  CreditCard, 
  ClipboardList, 
  Users, 
  DollarSign, 
  ChevronRight,
  Zap,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Settings,
  Mail,
  Package,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Save,
  Eye,
  Printer,
  Download,
  Upload,
  Loader2,
  ImageIcon,
  Code,
  FileEdit,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  Search,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  Star,
  Truck
} from "lucide-react";
import { FirebaseImage } from "./FirebaseImage";
import { auth, db, storage } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/utils";

// Error Boundary Component
class ErrorBoundary extends Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-red-600 mb-4">Tivemos um problema ao carregar esta seção.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold"
          >
            Recarregar Página
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-4 p-4 bg-black/5 rounded-lg text-left text-xs overflow-auto max-h-40">
              {this.state.errorInfo}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const OnboardingTutorial = ({ user, onComplete }: { user: any, onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo à ViaLinks!",
      description: "Estamos muito felizes em ter você aqui. Vamos te mostrar rapidamente como funciona o seu novo painel.",
      icon: <Zap className="w-16 h-16 text-vialinks-orange" />,
      color: "bg-vialinks-orange/10"
    },
    {
      title: "Formulário de Briefing",
      description: "O primeiro passo é preencher o briefing. É aqui que você nos conta tudo sobre o seu negócio para criarmos o card perfeito.",
      icon: <ClipboardList className="w-16 h-16 text-vialinks-purple" />,
      color: "bg-vialinks-purple/10"
    },
    {
      title: "Acompanhe seus Pedidos",
      description: "Na aba 'Meus Pedidos', você pode ver o status de cada solicitação e o histórico de suas compras conosco.",
      icon: <ShoppingBag className="w-16 h-16 text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Entrega e Card Digital",
      description: "Quando seu card estiver pronto, ele aparecerá aqui. Você poderá visualizar, baixar e compartilhar com seus clientes.",
      icon: <Package className="w-16 h-16 text-blue-500" />,
      color: "bg-blue-50"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        <div className={`h-48 ${steps[step].color} flex items-center justify-center transition-colors duration-500`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", damping: 12 }}
            >
              {steps[step].icon}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex flex-col gap-4">
            <button 
              onClick={handleNext}
              className="w-full bg-vialinks-purple text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-vialinks-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {step === steps.length - 1 ? "Começar Agora!" : "Próximo Passo"}
            </button>
            
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-vialinks-purple' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TestimonialForm = ({ user }: { user: any }) => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [cardLink, setCardLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(collection(db, "testimonials")), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL || "",
        text,
        rating,
        cardLink,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setText("");
      setCardLink("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "testimonials");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center">
        <ThumbsUp className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Obrigado pelo seu comentário!</h3>
        <p className="text-slate-600 mb-6">Seu depoimento foi enviado para moderação e aparecerá na home em breve.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-vialinks-purple font-bold hover:underline"
        >
          Enviar outro comentário
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Deixe seu depoimento</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Sua Avaliação</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
              >
                <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Link do seu Card (Opcional)</label>
          <input
            type="url"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
            placeholder="https://cartao-digital-financeiro.vercel.app/ ou https://seudominio.com.br"
            value={cardLink}
            onChange={(e) => setCardLink(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">Cole o link do seu card digital para que outros vejam seu trabalho.</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Seu Comentário</label>
          <textarea
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none min-h-[120px]"
            placeholder="Conte-nos sua experiência com a ViaLinks..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-vialinks-purple text-white rounded-2xl font-bold hover:bg-vialinks-purple/90 transition-all disabled:opacity-50 shadow-lg shadow-vialinks-purple/20"
        >
          {loading ? "Enviando..." : "Enviar Depoimento"}
        </button>
      </form>
    </div>
  );
};

const TestimonialModeration = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "testimonials", id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este depoimento?")) {
      try {
        await deleteDoc(doc(db, "testimonials", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando depoimentos...</div>;

  return (
    <div className="space-y-4">
      {testimonials.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum depoimento encontrado.</p>
        </div>
      ) : (
        testimonials.map((t) => (
          <div key={t.id} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                  {t.userPhoto ? (
                    <img src={t.userPhoto} alt={t.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t.userName}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3 h-3 ${t.rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {t.status === 'approved' ? 'Aprovado' : t.status === 'rejected' ? 'Recusado' : 'Pendente'}
                </span>
                <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4 italic">"{t.text}"</p>
            {t.cardLink && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Link do Card:</p>
                <a href={t.cardLink} target="_blank" rel="noopener noreferrer" className="text-xs text-vialinks-purple hover:underline truncate block">
                  {t.cardLink}
                </a>
              </div>
            )}
            <div className="flex gap-2">
              {t.status !== 'approved' && (
                <button 
                  onClick={() => handleStatus(t.id, 'approved')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                >
                  Aprovar
                </button>
              )}
              {t.status !== 'rejected' && (
                <button 
                  onClick={() => handleStatus(t.id, 'rejected')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Recusar
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export const DashboardLayout = ({ user, setView, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(user?.hasSeenOnboarding === false);
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Admins always see everything
    if (user.role === 'admin') {
      setHasActiveOrders(true);
      return;
    }

    const q = query(
      collection(db, "sales"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const active = !snapshot.empty;
      setHasActiveOrders(active);
      // Force store tab if no orders
      if (!active) {
        setActiveTab('store');
      }
    });

    return () => unsubscribe();
  }, [user.uid, user.role]);

  const handleCompleteOnboarding = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        hasSeenOnboarding: true
      });
      setShowOnboarding(false);
    } catch (error) {
      console.error("Erro ao atualizar onboarding:", error);
      setShowOnboarding(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-white">
        {showOnboarding && <OnboardingTutorial user={user} onComplete={handleCompleteOnboarding} />}
        {/* Sidebar */}
        <div className="w-64 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0">
            <FirebaseImage 
              storagePath="189861.jpg" 
              alt="Sidebar Background" 
              className="w-full h-full object-cover"
              fallbackUrl="/input_file_2.png"
            />
            <div className="absolute inset-0 bg-vialinks-purple/90 backdrop-blur-sm" />
          </div>
          
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-12">
              <Zap className="text-vialinks-orange w-8 h-8" />
              <span className="text-2xl font-bold text-white">ViaLinks</span>
            </div>

            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => (hasActiveOrders || user.role === 'admin') && setActiveTab('overview')}
                disabled={!hasActiveOrders && user.role !== 'admin'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'} ${(!hasActiveOrders && user.role !== 'admin') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Visão Geral
              </button>
              <button 
                onClick={() => (hasActiveOrders || user.role === 'admin') && setActiveTab('briefing')}
                disabled={!hasActiveOrders && user.role !== 'admin'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'briefing' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'} ${(!hasActiveOrders && user.role !== 'admin') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ClipboardList className="w-5 h-5" /> Formulário Briefing
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <ShoppingBag className="w-5 h-5" /> {(!hasActiveOrders && user.role !== 'admin') ? 'Planos e Preços' : 'Meus Pedidos'}
              </button>
              <button 
                onClick={() => (hasActiveOrders || user.role === 'admin') && setActiveTab('delivery')}
                disabled={!hasActiveOrders && user.role !== 'admin'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'delivery' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'} ${(!hasActiveOrders && user.role !== 'admin') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <Package className="w-5 h-5" /> Entrega e Card
              </button>
              {(hasActiveOrders || user.role === 'admin') && (
                <button 
                  onClick={() => setActiveTab('testimonial')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'testimonial' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-5 h-5" /> Depoimento
                </button>
              )}
              <button 
                onClick={() => (hasActiveOrders || user.role === 'admin') && setActiveTab('config')}
                disabled={!hasActiveOrders && user.role !== 'admin'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'} ${(!hasActiveOrders && user.role !== 'admin') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <Settings className="w-5 h-5" /> Configurações
              </button>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-vialinks-orange/20 text-vialinks-orange hover:bg-vialinks-orange/30 mt-4"
                >
                  <ShieldCheck className="w-5 h-5" /> Painel Admin
                </button>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-vialinks-orange flex items-center justify-center text-white font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  <p className="text-xs text-white/40">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" /> Sair da Conta
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-12 overflow-y-auto">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {activeTab === 'overview' && "Bem-vindo de volta!"}
                {activeTab === 'briefing' && "Formulário de Briefing"}
                {activeTab === 'orders' && "Meus Pedidos"}
                {activeTab === 'delivery' && "Entrega e Card"}
                {activeTab === 'testimonial' && "Deixe seu Depoimento"}
                {activeTab === 'config' && "Configurações da Conta"}
                {activeTab === 'store' && "Loja ViaLinks"}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'store' ? "Adquira novos produtos e acessórios para seu card digital." : activeTab === 'config' ? "Gerencie seus dados pessoais e segurança." : "Gerencie sua conta e seus cards ViaLinks."}
              </p>
            </div>
            <button 
              onClick={() => setView('landing')}
              className="text-sm font-bold text-vialinks-purple hover:underline"
            >
              Voltar para o Site
            </button>
          </header>

          <div className="max-w-4xl">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-vialinks-purple/10 flex items-center justify-center mb-6">
                    <CreditCard className="text-vialinks-purple w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Status do Card</h3>
                  <p className="text-slate-500 mb-6">Seu card físico está em produção. Prazo estimado: 5 dias úteis.</p>
                  <div className="flex items-center gap-2 text-vialinks-purple font-bold">
                    Ver Detalhes <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-vialinks-orange/10 flex items-center justify-center mb-6">
                    <ClipboardList className="text-vialinks-orange w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Briefing Pendente</h3>
                  <p className="text-slate-500 mb-6">Preencha os dados do seu card para que possamos iniciar a criação.</p>
                  <button 
                    onClick={() => setActiveTab('briefing')}
                    className="flex items-center gap-2 text-vialinks-orange font-bold"
                  >
                    Preencher Agora <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'briefing' && <BriefingForm user={user} setView={setView} />}
            {activeTab === 'orders' && <OrdersList user={user} />}
            {activeTab === 'delivery' && <DeliverySection user={user} />}
            {activeTab === 'testimonial' && (hasActiveOrders || user.role === 'admin') && <TestimonialForm user={user} />}
            {activeTab === 'config' && <AccountSettings user={user} setView={setView} />}
            {activeTab === 'store' && <StoreTab user={user} />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const AccountSettings = ({ user, setView }: any) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    phone: user.phone || "",
    bio: user.bio || ""
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser!, {
        displayName: formData.displayName
      });
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    setPassLoading(true);
    try {
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(auth.currentUser!, passwords.newPassword);
      alert("Senha alterada com sucesso!");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("Para alterar a senha, você precisa ter feito login recentemente. Por favor, saia e entre novamente.");
      } else {
        alert("Erro ao alterar senha: " + error.message);
      }
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { deleteUser } = await import("firebase/auth");
      
      // Delete from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // Delete from Auth
      await deleteUser(auth.currentUser!);
      
      alert("Sua conta foi excluída com sucesso.");
      setView('landing');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("Para excluir sua conta, você precisa ter feito login recentemente. Por favor, saia e entre novamente.");
      } else {
        alert("Erro ao excluir conta: " + error.message);
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-vialinks-purple" /> Dados Pessoais
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Bio / Descrição Curta</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple h-24"
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Fale um pouco sobre você ou sua empresa..."
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-vialinks-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-vialinks-purple/90 transition-all disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-vialinks-orange" /> Segurança e Senha
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nova Senha</label>
              <input 
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nova Senha</label>
              <input 
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                minLength={6}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={passLoading}
            className="bg-vialinks-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-vialinks-orange/90 transition-all disabled:opacity-50"
          >
            {passLoading ? "Alterando..." : "Alterar Senha"}
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Dica: Use uma senha forte com pelo menos 6 caracteres.
          </p>
        </form>
      </div>

      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 shadow-sm">
        <h3 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" /> Zona de Perigo
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-red-900">Excluir Conta</p>
            <p className="text-sm text-red-700">Uma vez excluída, todos os seus dados, cards e pedidos serão removidos permanentemente. Esta ação não pode ser desfeita.</p>
          </div>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all whitespace-nowrap"
            >
              Cancelar Minha Conta
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-red-800 uppercase text-center">Tem certeza absoluta?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-white text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Não, manter conta
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Sim, excluir agora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrdersList = ({ user }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "sales"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "sales");
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando pedidos...</div>;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Você ainda não possui pedidos.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-slate-500">
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Data indisponível"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-vialinks-purple">R$ {order.amount}</p>
              <p className="text-xs text-green-600 font-bold uppercase">{order.status}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const DeliverySection = ({ user }: any) => {
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "deliveries", user.uid), (doc) => {
      if (doc.exists()) {
        setDelivery(doc.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando informações de entrega...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-vialinks-purple" /> Acompanhamento do Pedido
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Digital Card Link */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-vialinks-purple/10 flex items-center justify-center">
                <Globe className="text-vialinks-purple w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Link do seu Card</h4>
            </div>
            {delivery?.cardLink ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Seu card digital já está online!</p>
                <a 
                  href={delivery.cardLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-vialinks-purple font-bold text-sm hover:border-vialinks-purple transition-all"
                >
                  {delivery.cardLink.replace('https://', '')}
                  <Eye className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">O link do seu card será disponibilizado assim que a produção for concluída.</p>
            )}
          </div>

          {/* Physical Card Tracking */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-vialinks-orange/10 flex items-center justify-center">
                <Truck className="text-vialinks-orange w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Rastreio do Card Físico</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${delivery?.status === 'shipped' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                <p className="text-sm font-bold text-slate-700">
                  Status: {
                    delivery?.status === 'pending' ? 'Aguardando Briefing' :
                    delivery?.status === 'production' ? 'Em Produção' :
                    delivery?.status === 'shipped' ? 'Enviado' :
                    delivery?.status === 'delivered' ? 'Entregue' : 'Pendente'
                  }
                </p>
              </div>
              {delivery?.trackingCode ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Código de Rastreio:</p>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 font-mono text-sm">
                    {delivery.trackingCode}
                    {delivery.trackingUrl && (
                      <a 
                        href={delivery.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-vialinks-orange hover:underline font-bold text-xs"
                      >
                        RASTREAR
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">As informações de rastreio aparecerão aqui após o envio.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bonus PDF */}
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Download className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Seu Bônus Exclusivo</h4>
                <p className="text-xs text-slate-500">Baixe o PDF de bônus que preparamos para você.</p>
              </div>
            </div>
            {delivery?.bonusPdfUrl ? (
              <a 
                href={delivery.bonusPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Baixar PDF
              </a>
            ) : (
              <span className="text-xs font-bold text-emerald-600/50 uppercase">Disponível em breve</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoreTab = ({ user }: any) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (!response.ok) throw new Error("Falha ao carregar planos");
        const plansData = await response.json();
        const activePlans = plansData
          .filter((p: any) => p.active !== false)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setPlans(activePlans.length > 0 ? activePlans : [
          {
            id: 'default-1',
            name: "Plano Start",
            price: 97,
            numericPrice: 97,
            features: ["Card Digital Personalizado", "Link na Bio Profissional", "Suporte via E-mail", "Atualizações Ilimitadas"],
            active: true,
            order: 1,
            cta: "Começar Agora"
          },
          {
            id: 'default-2',
            name: "Plano Profissional + NFC",
            price: 297,
            numericPrice: 297,
            features: ["Tudo do Plano Start", "Cartão Físico NFC Incluso", "Envio Grátis para todo Brasil", "PDF Interativo de Bônus", "Suporte Prioritário WhatsApp"],
            active: true,
            order: 2,
            popular: true,
            cta: "Mais Vendido"
          },
          {
            id: 'default-3',
            name: "Plano Business",
            price: 497,
            numericPrice: 497,
            features: ["Tudo do Plano Profissional", "Domínio Próprio (.com.br)", "Consultoria de SEO", "2 Cartões NFC Inclusos", "Gestão de Leads no Painel"],
            active: true,
            order: 3,
            cta: "Falar com Consultor"
          }
        ]);
      } catch (error) {
        console.warn("Pricing fetch failed, using defaults");
        setPlans([
          {
            id: 'default-1',
            name: "Plano Start",
            price: 97,
            numericPrice: 97,
            features: ["Card Digital Personalizado", "Link na Bio Profissional", "Suporte via E-mail", "Atualizações Ilimitadas"],
            active: true,
            order: 1,
            cta: "Começar Agora"
          },
          {
            id: 'default-2',
            name: "Plano Profissional + NFC",
            price: 297,
            numericPrice: 297,
            features: ["Tudo do Plano Start", "Cartão Físico NFC Incluso", "Envio Grátis para todo Brasil", "PDF Interativo de Bônus", "Suporte Prioritário WhatsApp"],
            active: true,
            order: 2,
            popular: true,
            cta: "Mais Vendido"
          },
          {
            id: 'default-3',
            name: "Plano Business",
            price: 497,
            numericPrice: 497,
            features: ["Tudo do Plano Profissional", "Domínio Próprio (.com.br)", "Consultoria de SEO", "2 Cartões NFC Inclusos", "Gestão de Leads no Painel"],
            active: true,
            order: 3,
            cta: "Falar com Consultor"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleBuy = (plan: any) => {
    // We can't easily trigger the same checkout from here without more props,
    // so we redirect to the checkout view of the main app.
    // However, DashboardLayout doesn't have addToCart.
    // To make it simple, we redirect them to the landing page pricing
    window.location.href = '/#planos';
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-12 h-12 text-vialinks-purple" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-vialinks-purple/10 p-8 rounded-3xl border border-vialinks-purple/20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Seu painel está quase pronto!</h2>
        <p className="text-slate-600">Adquira um de nossos planos abaixo para liberar todas as funcionalidades e começar a usar seu card profissional.</p>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-8 rounded-3xl border ${plan.popular ? 'border-vialinks-purple ring-2 ring-vialinks-purple/20 bg-white' : 'border-slate-100 bg-slate-50'} flex flex-col`}>
             <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
             <p className="text-3xl font-extrabold text-vialinks-purple mb-6">
               {typeof plan.price === 'number' ? plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : plan.price}
             </p>
             <ul className="space-y-3 mb-8 flex-grow">
               {plan.features.map((f: string, i: number) => (
                 <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                   <Check className="w-4 h-4 text-green-500" /> {f}
                 </li>
               ))}
             </ul>
             <button 
               onClick={() => handleBuy(plan)}
               className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-vialinks-purple text-white hover:bg-vialinks-purple/90' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
             >
               {plan.cta || "Selecionar Plano"}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard = ({ user, setView, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState<any>(null);
  const [briefings, setBriefings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [selectedBriefing, setSelectedBriefing] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      // Stats from Sales
      const unsubscribeSales = onSnapshot(collection(db, "sales"), (snapshot) => {
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalRevenue = sales.reduce((acc, sale: any) => acc + (sale.amount || 0), 0);
        
        // Process chart data (sales per month)
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthlySales = months.map(month => ({ name: month, total: 0 }));
        
        sales.forEach((sale: any) => {
          if (sale.createdAt?.toDate) {
            const date = sale.createdAt.toDate();
            const monthIndex = date.getMonth();
            monthlySales[monthIndex].total += sale.amount || 0;
          }
        });
        
        setChartData(monthlySales);
        setStats((prev: any) => ({ ...prev, totalRevenue, salesCount: snapshot.docs.length }));
      }, (error) => handleFirestoreError(error, OperationType.LIST, "sales"));

      // Briefings
      const unsubscribeBriefings = onSnapshot(collection(db, "briefings"), (snapshot) => {
        const briefingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBriefings(briefingsData);
      }, (error) => handleFirestoreError(error, OperationType.LIST, "briefings"));

      // Users
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        setStats((prev: any) => ({ ...prev, usersCount: snapshot.docs.length }));
      }, (error) => handleFirestoreError(error, OperationType.LIST, "users"));

      return () => {
        unsubscribeSales();
        unsubscribeBriefings();
        unsubscribeUsers();
      };
    }
  }, [isAuthorized]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "vialinks2024") {
      setIsAuthorized(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-vialinks-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-500 mb-8">Digite a senha mestra para acessar o painel administrativo.</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Senha do Administrador" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange text-center text-lg text-slate-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full bg-vialinks-orange text-white py-4 rounded-xl font-bold shadow-lg shadow-vialinks-orange/20">
              Acessar Painel
            </button>
          </form>
          
          <button 
            onClick={() => setView('landing')}
            className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            Voltar para o Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <div className="w-80 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0">
            <FirebaseImage 
              storagePath="189861.jpg" 
              alt="Sidebar Background" 
              className="w-full h-full object-cover"
              fallbackUrl="/input_file_2.png"
            />
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm" />
          </div>
          
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-12">
              <Zap className="text-vialinks-orange w-8 h-8" />
              <span className="text-2xl font-bold text-white">Admin</span>
            </div>

            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <DollarSign className="w-5 h-5" /> Vendas e Stats
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Package className="w-5 h-5" /> Pedidos da Loja
              </button>
              <button 
                onClick={() => setActiveTab('briefings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'briefings' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <ClipboardList className="w-5 h-5" /> Briefings Recebidos
              </button>
              <button 
                onClick={() => setActiveTab('deliveries')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'deliveries' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Truck className="w-5 h-5" /> Entregas e Rastreio
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="w-5 h-5" /> Usuários
              </button>
              <button 
                onClick={() => setActiveTab('emails')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'emails' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Mail className="w-5 h-5" /> Campanhas e E-mails
              </button>
              <button 
                onClick={() => setActiveTab('abandoned')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'abandoned' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <ShoppingBag className="w-5 h-5" /> Carrinhos Abandonados
              </button>
              <button 
                onClick={() => setActiveTab('testimonials')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'testimonials' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <MessageSquare className="w-5 h-5" /> Depoimentos
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'plans' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Layers className="w-5 h-5" /> Planos e Preços
              </button>
              <button 
                onClick={() => setActiveTab('tags')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tags' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Code className="w-5 h-5" /> Tags e Pixels
              </button>
              <button 
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <FileEdit className="w-5 h-5" /> Conteúdo do Site
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Settings className="w-5 h-5" /> Configurações
              </button>

              <button 
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-vialinks-orange/20 text-vialinks-orange' : 'text-white/60 hover:text-white hover:bg-white/5'} mt-8 border border-vialinks-orange/20`}
              >
                <ShieldCheck className="w-5 h-5" /> Painel Admin
              </button>

              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-white/10 text-white mt-2 border border-white/20"
              >
                <LayoutDashboard className="w-5 h-5" /> Painel do Cliente
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" /> Sair Admin
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-12 overflow-y-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-extrabold text-slate-900">Painel de Controle</h1>
            <p className="text-slate-500">Gerenciamento total da plataforma ViaLinks.</p>
          </header>

          {activeTab === 'stats' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-8 rounded-3xl bg-vialinks-purple text-white shadow-xl shadow-vialinks-purple/20">
                  <p className="text-sm font-medium text-purple-200 mb-1 uppercase tracking-wider">Receita Total</p>
                  <h3 className="text-3xl font-extrabold">R$ {stats?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}</h3>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Total de Usuários</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{stats?.usersCount || 0}</h3>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Briefings Recebidos</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{briefings.length}</h3>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Vendas por Mês</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$${value}`} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#6366f1' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === 'briefings' && (
            <div className="space-y-4">
              {briefings.map((b: any) => (
                <div key={b.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{b.data?.name || b.userId}</p>
                    <p className="text-sm text-slate-500">
                      Recebido em: {b.updatedAt?.toDate ? b.updatedAt.toDate().toLocaleDateString() : "Data indisponível"}
                    </p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-2 inline-block ${b.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {b.status === 'approved' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedBriefing(b)}
                      className="bg-vialinks-purple text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      Ver Detalhes
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Deseja excluir este briefing permanentemente?")) {
                          await deleteDoc(doc(db, "briefings", b.id));
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'deliveries' && <DeliveryManagement />}

              {selectedBriefing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm no-print">
                  <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
                    <button 
                      onClick={() => setSelectedBriefing(null)}
                      className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full no-print"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div id="printable-briefing" className="bg-white" style={{fontFamily:"'Inter','Segoe UI',sans-serif",color:"#2d3748"}}>

                      {/* PDF Header */}
                      <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-vialinks-orange rounded-xl flex items-center justify-center text-white font-black italic text-2xl vialinks-orange-bg">V</div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">VIALINKS</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ficha de Produção de Card Digital</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Documento de Produção</p>
                          <p className="text-sm font-black text-slate-900">ID: {selectedBriefing.id.slice(0, 12)}</p>
                          <p className="text-[10px] text-slate-500">{new Date().toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-8">
                        {/* Main Info Column */}
                        <div className="col-span-8 space-y-8">
                          {/* Section: Cliente */}
                          <section className="print-break-inside-avoid">
                            <h3 className="text-xs font-black text-vialinks-purple uppercase tracking-widest mb-4 border-l-4 border-vialinks-purple pl-3">01. Dados do Cliente</h3>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 production-control-bg">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Nome Completo</p>
                                <p className="text-sm font-bold text-slate-800">{selectedBriefing.data?.name || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Cargo / Profissão</p>
                                <p className="text-sm font-bold text-slate-800">{selectedBriefing.data?.job || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp</p>
                                <p className="text-sm font-bold text-slate-800">{selectedBriefing.data?.phone || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">E-mail</p>
                                <p className="text-sm font-bold text-slate-800">{selectedBriefing.data?.email || "N/A"}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Slogan / Frase</p>
                                <p className="text-sm font-bold text-slate-800 italic">"{selectedBriefing.data?.slogan || "Sem slogan"}"</p>
                              </div>
                            </div>
                          </section>

                          {/* Section: Links */}
                          <section className="print-break-inside-avoid">
                            <h3 className="text-xs font-black text-vialinks-purple uppercase tracking-widest mb-4 border-l-4 border-vialinks-purple pl-3">02. Links e Redes Sociais</h3>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 production-control-bg">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Website</p>
                                <p className="text-xs text-slate-700 truncate">{selectedBriefing.data?.website || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Instagram</p>
                                <p className="text-xs text-slate-700">{selectedBriefing.data?.instagram || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">LinkedIn</p>
                                <p className="text-xs text-slate-700">{selectedBriefing.data?.linkedin || "N/A"}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Outros Links / Observações de Links</p>
                                <p className="text-xs text-slate-700 whitespace-pre-wrap">{selectedBriefing.data?.otherLinks || "Nenhum link adicional"}</p>
                              </div>
                            </div>
                          </section>

                          {/* Section: Design */}
                          <section className="print-break-inside-avoid">
                            <h3 className="text-xs font-black text-vialinks-purple uppercase tracking-widest mb-4 border-l-4 border-vialinks-purple pl-3">03. Design e Identidade</h3>
                            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 production-control-bg">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Cores Preferidas</p>
                                <p className="text-sm font-bold text-slate-800">{selectedBriefing.data?.colors || "Não especificado"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Observações de Design</p>
                                <p className="text-xs text-slate-700 whitespace-pre-wrap">{selectedBriefing.data?.notes || "Nenhuma observação"}</p>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar Column: Images & Control */}
                        <div className="col-span-4 space-y-8">
                          {/* Section: Fotos */}
                          <section className="print-break-inside-avoid">
                            <h3 className="text-xs font-black text-vialinks-purple uppercase tracking-widest mb-4 border-l-4 border-vialinks-purple pl-3">04. Ativos Visuais</h3>
                            <div className="space-y-4">
                              <div className="border border-slate-200 rounded-xl p-2 bg-white">
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 text-center">Logo / Marca</p>
                                {selectedBriefing.data?.logoUrl ? (
                                  <img src={selectedBriefing.data.logoUrl} alt="Logo" className="w-full h-24 object-contain" referrerPolicy="no-referrer" loading="lazy" />
                                ) : (
                                  <div className="h-24 bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">Sem Logo</div>
                                )}
                              </div>
                              <div className="border border-slate-200 rounded-xl p-2 bg-white">
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 text-center">Foto Pessoal</p>
                                {selectedBriefing.data?.personalPhotoUrl ? (
                                  <img src={selectedBriefing.data.personalPhotoUrl} alt="Foto Pessoal" className="w-full h-32 object-cover rounded-lg" referrerPolicy="no-referrer" loading="lazy" />
                                ) : (
                                  <div className="h-32 bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">Sem Foto</div>
                                )}
                              </div>
                            </div>
                          </section>

                          {/* Section: Controle de Produção */}
                          <section className="print-break-inside-avoid">
                            <div className="bg-vialinks-purple text-white p-5 rounded-2xl shadow-xl space-y-4">
                              <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-2">Controle de Produção</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] opacity-60 uppercase">Status</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 rounded-full">{selectedBriefing.status === 'approved' ? 'APROVADO' : 'PENDENTE'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] opacity-60 uppercase">Data Receb.</span>
                                  <span className="text-[10px] font-bold">{selectedBriefing.updatedAt?.toDate ? selectedBriefing.updatedAt.toDate().toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                  <p className="text-[8px] opacity-40 uppercase mb-8">Assinatura Responsável</p>
                                  <div className="h-px bg-white/30 w-full" />
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>

                      {/* Product Photos Section */}
                      {selectedBriefing.data?.productPhotos?.some((p: string) => p) && (
                        <section className="mt-8 print-break-inside-avoid">
                          <h3 className="text-xs font-black text-vialinks-purple uppercase tracking-widest mb-4 border-l-4 border-vialinks-purple pl-3">05. Fotos de Produtos / Portfólio</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {selectedBriefing.data.productPhotos.map((url: string, i: number) => url && (
                              <div key={i} className="border border-slate-200 rounded-xl p-2 bg-white">
                                <img src={url} alt={`Produto ${i+1}`} className="w-full h-40 object-cover rounded-lg" referrerPolicy="no-referrer" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Footer */}
                      <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400">
                        <p>© 2026 ViaLinks Tecnologia - agenciaetodavia.com.br</p>
                        <p>Página 1 de 1</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 no-print">
                      <button 
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
                      >
                        <Printer className="w-5 h-5" /> Imprimir Ficha de Produção
                      </button>
                      {selectedBriefing.status !== 'approved' && (
                        <button 
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, "briefings", selectedBriefing.id), { status: 'approved' });
                              setSelectedBriefing({...selectedBriefing, status: 'approved'});
                              alert("Briefing aprovado com sucesso!");
                            } catch (err) {
                              alert("Erro ao aprovar briefing.");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-vialinks-purple text-white py-4 rounded-xl font-bold shadow-lg shadow-vialinks-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Check className="w-5 h-5" /> Aprovar para Produção
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

          {activeTab === 'deliveries' && <DeliveryManagement />}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {users.map((u: any) => (
                <div key={u.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-vialinks-purple/10 flex items-center justify-center text-vialinks-purple font-bold">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.email}</p>
                      <p className="text-sm text-slate-500">Papel: {u.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-mono">UID: {u.id}</p>
                    </div>
                    <button 
                      onClick={async () => {
                        const newRole = u.role === 'admin' ? 'client' : 'admin';
                        if (confirm(`Deseja alterar o papel de ${u.email} para ${newRole}?`)) {
                          await setDoc(doc(db, "users", u.id), { role: newRole }, { merge: true });
                        }
                      }}
                      className="text-xs font-bold text-vialinks-purple hover:underline"
                    >
                      Alterar Permissão
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Deseja excluir o usuário ${u.email} permanentemente?`)) {
                          await deleteDoc(doc(db, "users", u.id));
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'plans' && <PlanManagement />}
          {activeTab === 'tags' && <TagManagement />}
          {activeTab === 'content' && <ContentManagement />}
          {activeTab === 'config' && <ConfigManagement />}
          {activeTab === 'orders' && <AdminOrderManagement />}
          {activeTab === 'testimonials' && <TestimonialModeration />}
          {activeTab === 'emails' && <AdminEmailManagement users={users} />}
          {activeTab === 'abandoned' && <AdminAbandonedCart />}
        </div>
      </div>
    </ErrorBoundary>
  );
};

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "sales"));
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "sales", id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sales/${id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    if (confirm("Deseja excluir este registro de venda permanentemente?")) {
      try {
        await deleteDoc(doc(db, "sales", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sales/${id}`);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando pedidos...</div>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-slate-500">{order.customerEmail}</p>
              <p className="text-xs text-slate-400">
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "Data indisponível"}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="text-xl font-extrabold text-vialinks-purple">R$ {order.totalAmount || order.amount}</p>
              <div className="flex items-center gap-2">
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="text-xs font-bold uppercase px-3 py-1 rounded-full border border-slate-200 outline-none"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <button 
                  onClick={() => deleteOrder(order.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Itens:</p>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>R$ {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              {order.zip && (
                <div className="bg-slate-100 p-3 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Endereço de Entrega:</p>
                  <p className="text-sm text-slate-700">
                    {order.street}, {order.number} {order.complement && `- ${order.complement}`}
                  </p>
                  <p className="text-sm text-slate-700">
                    {order.neighborhood} - {order.city}/{order.state}
                  </p>
                  <p className="text-sm text-slate-700 font-mono">CEP: {order.zip}</p>
                  {order.phone && <p className="text-sm text-vialinks-purple font-bold mt-1">Tel: {order.phone}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubDeliveries = onSnapshot(collection(db, "deliveries"), (snap) => {
      setDeliveries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubDeliveries();
    };
  }, []);

  const handleSave = async (userId: string) => {
    try {
      await setDoc(doc(db, "deliveries", userId), {
        ...editData,
        userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setEditingId(null);
      alert("Informações de entrega atualizadas!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `deliveries/${userId}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando entregas...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Gerenciamento de Entregas</h3>
        <p className="text-sm text-slate-500">Configure links, rastreio e bônus para cada cliente.</p>
      </div>

      {users.filter(u => u.role !== 'admin').map((u) => {
        const d = deliveries.find(del => del.userId === u.id);
        const isEditing = editingId === u.id;

        return (
          <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{u.displayName || u.email}</h4>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => handleSave(u.id)}
                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingId(u.id);
                      setEditData(d || { status: 'pending' });
                    }}
                    className="p-2 bg-vialinks-purple text-white rounded-lg hover:bg-vialinks-purple/90"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status da Entrega</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={editData.status}
                    onChange={e => setEditData({...editData, status: e.target.value})}
                  >
                    <option value="pending">Pendente</option>
                    <option value="production">Em Produção</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link do Card</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={editData.cardLink || ""}
                    onChange={e => setEditData({...editData, cardLink: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Código de Rastreio</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={editData.trackingCode || ""}
                    onChange={e => setEditData({...editData, trackingCode: e.target.value})}
                    placeholder="Ex: AA123456789BR"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL de Rastreio</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={editData.trackingUrl || ""}
                    onChange={e => setEditData({...editData, trackingUrl: e.target.value})}
                    placeholder="Link dos correios/transportadora"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL do PDF Bônus</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={editData.bonusPdfUrl || ""}
                    onChange={e => setEditData({...editData, bonusPdfUrl: e.target.value})}
                    placeholder="Link para download do PDF"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-xs font-bold text-slate-700">{d?.status || 'Pendente'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Link Card</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{d?.cardLink ? 'Configurado' : 'Não'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Rastreio</p>
                  <p className="text-xs font-bold text-slate-700">{d?.trackingCode || 'Não'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Bônus PDF</p>
                  <p className="text-xs font-bold text-slate-700">{d?.bonusPdfUrl ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TagManagement = () => {
  const [tags, setTags] = useState<any>({
    gtmHeader: "",
    gtmBody: "",
    metaPixel: "",
    pinterestPixel: "",
    linkedinPixel: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "tags"), (snapshot) => {
      if (snapshot.exists()) {
        setTags(snapshot.data().settings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Tags fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveTags = async () => {
    try {
      await setDoc(doc(db, "config", "tags"), {
        type: "tags",
        settings: tags,
        updatedAt: serverTimestamp()
      });
      alert("Tags e Pixels salvos com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "config/tags");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando tags...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Code className="text-vialinks-orange w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-900">Gerenciamento de Tags e Pixels</h2>
      </div>

      <div className="grid gap-6">
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800">Google Tag Manager</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Código Header (Head)</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange font-mono text-xs h-32"
              value={tags.gtmHeader}
              onChange={e => setTags({...tags, gtmHeader: e.target.value})}
              placeholder="<!-- Google Tag Manager --> ..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Código Body (Noscript)</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange font-mono text-xs h-32"
              value={tags.gtmBody}
              onChange={e => setTags({...tags, gtmBody: e.target.value})}
              placeholder="<!-- Google Tag Manager (noscript) --> ..."
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800">Pixels de Redes Sociais</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Meta Pixel (Facebook)</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange font-mono text-xs h-32"
                value={tags.metaPixel}
                onChange={e => setTags({...tags, metaPixel: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pinterest Pixel</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange font-mono text-xs h-32"
                value={tags.pinterestPixel}
                onChange={e => setTags({...tags, pinterestPixel: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">LinkedIn Pixel</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange font-mono text-xs h-32"
                value={tags.linkedinPixel}
                onChange={e => setTags({...tags, linkedinPixel: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={saveTags}
          className="bg-vialinks-purple text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-vialinks-purple/20 w-full"
        >
          Salvar Todas as Tags
        </button>
      </div>
    </div>
  );
};

const ContentManagement = () => {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "content"), (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.data().settings || {});
      }
      setLoading(false);
    }, (error) => {
      console.error("Content fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveContent = async () => {
    try {
      await setDoc(doc(db, "config", "content"), {
        type: "content",
        settings: content,
        updatedAt: serverTimestamp()
      });
      alert("Conteúdo do site salvo com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "config/content");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando conteúdo...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <FileEdit className="text-vialinks-orange w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-900">Gerenciamento de Conteúdo do Site</h2>
      </div>

      <div className="grid gap-8">
        {/* HERO SECTION */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Monitor className="w-5 h-5" /> Hero Section (Início)
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Badge (Texto Curto Superior)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                  value={content.heroBadge || ""}
                  onChange={e => setContent({...content, heroBadge: e.target.value})}
                  placeholder="Nova Tecnologia NFC"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Principal</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-32"
                  value={content.heroTitle || ""}
                  onChange={e => setContent({...content, heroTitle: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subtítulo / Descrição</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-32"
                  value={content.heroDesc || ""}
                  onChange={e => setContent({...content, heroDesc: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto Social Proof</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                  value={content.heroSocialProof || ""}
                  onChange={e => setContent({...content, heroSocialProof: e.target.value})}
                  placeholder="Faça parte da comunidade de profissionais que já usam ViaLinks"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <ImageUpload 
              label="Imagem Hero (Mockup Principal)" 
              path="site/hero"
              currentUrl={content.heroImageUrl || ""}
              onUpload={(url) => setContent({...content, heroImageUrl: url})}
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ou cole o link da imagem diretamente</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.heroImageUrl || ""}
                onChange={e => setContent({...content, heroImageUrl: e.target.value})}
                placeholder="https://exemplo.com/imagem.png"
              />
            </div>
          </div>
        </div>

        {/* CONCEITO SECTION */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Zap className="w-5 h-5" /> Seção Conceito
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Conceito</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.conceptTitle || ""}
                onChange={e => setContent({...content, conceptTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subtítulo Conceito</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.conceptSubtitle || ""}
                onChange={e => setContent({...content, conceptSubtitle: e.target.value})}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto 1</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-24"
                value={content.conceptText1 || ""}
                onChange={e => setContent({...content, conceptText1: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto 2</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-24"
                value={content.conceptText2 || ""}
                onChange={e => setContent({...content, conceptText2: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">Cards de Conceito (4 itens)</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <input 
                    type="text"
                    placeholder={`Título Card ${i}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={content[`conceptCard${i}Title`] || ""}
                    onChange={e => setContent({...content, [`conceptCard${i}Title`]: e.target.value})}
                  />
                  <input 
                    type="text"
                    placeholder={`Descrição Card ${i}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    value={content[`conceptCard${i}Desc`] || ""}
                    onChange={e => setContent({...content, [`conceptCard${i}Desc`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DIFERENCIAIS SECTION */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Shield className="w-5 h-5" /> Seção Diferenciais
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Diferenciais</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.diffsTitle || ""}
                onChange={e => setContent({...content, diffsTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subtítulo Diferenciais</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.diffsDesc || ""}
                onChange={e => setContent({...content, diffsDesc: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">Cards de Diferenciais (4 itens)</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <input 
                    type="text"
                    placeholder={`Título Item ${i+1}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={content[`diffTitle${i}`] || ""}
                    onChange={e => setContent({...content, [`diffTitle${i}`]: e.target.value})}
                  />
                  <textarea 
                    placeholder={`Descrição Item ${i+1}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs h-20"
                    value={content[`diffDesc${i}`] || ""}
                    onChange={e => setContent({...content, [`diffDesc${i}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CICLO SECTION */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Zap className="w-5 h-5" /> Seção Ciclo ViaLinks
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Ciclo</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.cycleTitle || ""}
                onChange={e => setContent({...content, cycleTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subtítulo Ciclo</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.cycleDesc || ""}
                onChange={e => setContent({...content, cycleDesc: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">Passos do Ciclo (4 passos)</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <input 
                    type="text"
                    placeholder={`Título Passo ${i+1}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    value={content[`cycleStepTitle${i}`] || ""}
                    onChange={e => setContent({...content, [`cycleStepTitle${i}`]: e.target.value})}
                  />
                  <input 
                    type="text"
                    placeholder={`Subtítulo Passo ${i+1}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    value={content[`cycleStepSub${i}`] || ""}
                    onChange={e => setContent({...content, [`cycleStepSub${i}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto Rodapé Ciclo</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-20"
                value={content.cycleFooterText || ""}
                onChange={e => setContent({...content, cycleFooterText: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto Botão Ciclo</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.cycleBtnText || ""}
                onChange={e => setContent({...content, cycleBtnText: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* PRICING HEADER */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Seção Planos (Cabeçalho)
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Planos</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.pricingTitle || ""}
                onChange={e => setContent({...content, pricingTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subtítulo Planos</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-20"
                value={content.pricingDesc || ""}
                onChange={e => setContent({...content, pricingDesc: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Rodapé (Footer)
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto de Descrição</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-20"
                value={content.footerDesc || ""}
                onChange={e => setContent({...content, footerDesc: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Copyright</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.footerCopyright || ""}
                onChange={e => setContent({...content, footerCopyright: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* THANK YOU PAGE */}
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vialinks-purple flex items-center gap-2">
            <Check className="w-5 h-5" /> Página de Agradecimento
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título Agradecimento</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={content.thankYouTitle || ""}
                onChange={e => setContent({...content, thankYouTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mensagem Agradecimento</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-24"
                value={content.thankYouDesc || ""}
                onChange={e => setContent({...content, thankYouDesc: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={saveContent}
          className="bg-vialinks-purple text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-vialinks-purple/20 w-full text-lg hover:scale-[1.01] transition-all"
        >
          Salvar Todas as Alterações de Conteúdo
        </button>
      </div>
    </div>
  );
};

const PlanManagement = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    features: "",
    excludedFeatures: "",
    active: true,
    order: 0,
    popular: false,
    cta: ""
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "plans"), (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(plansData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "plans"));
    return () => unsubscribe();
  }, []);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlanId) {
        await updateDoc(doc(db, "plans", editingPlanId), {
          ...newPlan,
          features: newPlan.features.split('\n').filter(f => f.trim() !== ''),
          excludedFeatures: newPlan.excludedFeatures.split('\n').filter(f => f.trim() !== '')
        });
        setEditingPlanId(null);
      } else {
        const planRef = doc(collection(db, "plans"));
        await setDoc(planRef, {
          ...newPlan,
          features: newPlan.features.split('\n').filter(f => f.trim() !== ''),
          excludedFeatures: newPlan.excludedFeatures.split('\n').filter(f => f.trim() !== '')
        });
      }
      setIsAdding(false);
      setNewPlan({ name: "", price: 0, features: "", excludedFeatures: "", active: true, order: 0, popular: false, cta: "" });
    } catch (error) {
      handleFirestoreError(error, editingPlanId ? OperationType.UPDATE : OperationType.CREATE, "plans");
    }
  };

  const bootstrapPlans = async () => {
    const defaultPlans = [
      {
        name: "Plano Start",
        price: 97,
        features: ["Card Digital Personalizado", "Link na Bio Profissional", "Suporte via E-mail", "Atualizações Ilimitadas"],
        excludedFeatures: ["Cartão Físico NFC", "Envio Grátis", "PDF Interativo de Bônus"],
        active: true,
        order: 1,
        popular: false,
        cta: "Começar Agora"
      },
      {
        name: "Plano Profissional + NFC",
        price: 297,
        features: ["Tudo do Plano Start", "Cartão Físico NFC Incluso", "Envio Grátis para todo Brasil", "PDF Interativo de Bônus", "Suporte Prioritário WhatsApp"],
        excludedFeatures: ["Domínio Próprio", "Consultoria de SEO"],
        active: true,
        order: 2,
        popular: true,
        cta: "Mais Vendido"
      },
      {
        name: "Plano Business",
        price: 497,
        features: ["Tudo do Plano Profissional", "Domínio Próprio (.com.br)", "Consultoria de SEO", "2 Cartões NFC Inclusos", "Gestão de Leads no Painel"],
        excludedFeatures: [],
        active: true,
        order: 3,
        popular: false,
        cta: "Falar com Consultor"
      }
    ];

    try {
      for (const plan of defaultPlans) {
        const planRef = doc(collection(db, "plans"));
        await setDoc(planRef, plan);
      }
      alert("Planos padrão carregados com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "plans");
    }
  };

  const startEdit = (p: any) => {
    setNewPlan({
      name: p.name,
      price: p.price,
      features: p.features?.join('\n') || "",
      excludedFeatures: p.excludedFeatures?.join('\n') || "",
      active: p.active,
      order: p.order || 0,
      popular: p.popular || false,
      cta: p.cta || ""
    });
    setEditingPlanId(p.id);
    setIsAdding(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando planos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Gerenciar Planos</h2>
        <div className="flex gap-3">
          {plans.length === 0 && (
            <button 
              onClick={bootstrapPlans}
              className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Carregar Planos Padrão
            </button>
          )}
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) {
                setEditingPlanId(null);
                setNewPlan({ name: "", price: 0, features: "", excludedFeatures: "", active: true, order: 0, popular: false, cta: "" });
              }
            }}
            className="bg-vialinks-orange text-white px-6 py-2 rounded-xl font-bold"
          >
            {isAdding ? "Cancelar" : "Novo Plano"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddPlan} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900">{editingPlanId ? "Editar Plano" : "Novo Plano"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Plano</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newPlan.name}
                onChange={e => setNewPlan({...newPlan, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preço (R$)</label>
              <input 
                type="number" 
                required
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newPlan.price}
                onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ordem</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newPlan.order}
                onChange={e => setNewPlan({...newPlan, order: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Texto do Botão (CTA)</label>
              <input 
                type="text" 
                placeholder="Ex: Começar Agora"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newPlan.cta}
                onChange={e => setNewPlan({...newPlan, cta: e.target.value})}
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-vialinks-orange focus:ring-vialinks-orange"
                  checked={newPlan.popular}
                  onChange={e => setNewPlan({...newPlan, popular: e.target.checked})}
                />
                <span className="text-xs font-bold text-slate-400 uppercase">Destaque (Popular)</span>
              </label>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vantagens (uma por linha)</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange h-32"
                value={newPlan.features}
                onChange={e => setNewPlan({...newPlan, features: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Não Incluso (uma por linha)</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 h-32"
                placeholder="Ex: Domínio Próprio"
                value={newPlan.excludedFeatures}
                onChange={e => setNewPlan({...newPlan, excludedFeatures: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-vialinks-purple text-white py-4 rounded-xl font-bold">
            {editingPlanId ? "Atualizar Plano" : "Salvar Plano"}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">{p.name}</p>
              <p className="text-sm text-slate-500">R$ {p.price}</p>
              <p className="text-[10px] text-slate-400 mt-1">{p.features?.length || 0} vantagens listadas</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  await updateDoc(doc(db, "plans", p.id), { active: !p.active });
                }}
                className={`text-xs font-bold px-3 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {p.active ? "Ativo" : "Inativo"}
              </button>
              <button 
                onClick={() => startEdit(p)}
                className="text-slate-400 hover:text-vialinks-purple"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm("Tem certeza que deseja excluir este plano permanentemente?")) {
                    await deleteDoc(doc(db, "plans", p.id));
                  }
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfigManagement = () => {
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [smtpConfig, setSmtpConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "config"), (snapshot) => {
      if (snapshot.empty) {
        setLoading(false);
        return;
      }
      snapshot.docs.forEach(doc => {
        if (doc.id === 'payment') setPaymentConfig(doc.data().settings);
        if (doc.id === 'smtp') setSmtpConfig(doc.data().settings);
      });
      setLoading(false);
    }, (error) => {
      console.error("Config fetch error:", error);
      setLoading(false);
      // We don't throw here to avoid getting stuck in loading, 
      // but the ErrorBoundary will still catch other errors.
    });
    return () => unsubscribe();
  }, []);

  const saveConfig = async (type: string, settings: any) => {
    if (type === 'payment') {
      if (settings.publicKey && !settings.publicKey.startsWith('pk_')) {
        alert("Erro: A 'Stripe Public Key' deve começar com 'pk_'.");
        return;
      }
      if (settings.secretKey && !settings.secretKey.startsWith('sk_')) {
        alert("Erro: A 'Stripe Secret Key' deve começar com 'sk_'. Por favor, não use a chave pública (pk_) neste campo.");
        return;
      }
    }
    try {
      await setDoc(doc(db, "config", type), {
        type,
        settings,
        updatedAt: Timestamp.now()
      });
      alert("Configuração salva com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `config/${type}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="space-y-12">
      {!paymentConfig?.secretKey && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold">Stripe não configurado!</p>
            <p className="text-sm opacity-80">As vendas não funcionarão até que você insira sua Secret Key do Stripe abaixo.</p>
          </div>
        </div>
      )}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="text-vialinks-orange w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-900">Configuração de Pagamento (Stripe)</h2>
        </div>
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Stripe Public Key (pk_...)
              {paymentConfig?.publicKey && (
                <span className="ml-2 text-emerald-500 normal-case font-normal">
                  (Salva: {paymentConfig.publicKey.substring(0, 8)}...)
                </span>
              )}
            </label>
            <input 
              type="text" 
              placeholder="pk_live_..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              value={paymentConfig?.publicKey || ""}
              onChange={e => setPaymentConfig({...paymentConfig, publicKey: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Stripe Secret Key (sk_...)
              {paymentConfig?.secretKey && (
                <span className="ml-2 text-emerald-500 normal-case font-normal">
                  (Salva: {paymentConfig.secretKey.substring(0, 8)}...)
                </span>
              )}
            </label>
            <input 
              type="password" 
              placeholder="sk_live_..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              value={paymentConfig?.secretKey || ""}
              onChange={e => setPaymentConfig({...paymentConfig, secretKey: e.target.value})}
            />
            <p className="mt-1 text-[10px] text-slate-400 italic">
              A chave secreta é protegida e não é exibida por completo por segurança.
            </p>
          </div>
          <button 
            onClick={() => saveConfig('payment', paymentConfig)}
            className="bg-vialinks-purple text-white px-8 py-3 rounded-xl font-bold"
          >
            Salvar Configuração Stripe
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Mail className="text-vialinks-orange w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-900">Configuração de E-mail (SMTP)</h2>
        </div>
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Servidor SMTP</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={smtpConfig?.host || ""}
                onChange={e => setSmtpConfig({...smtpConfig, host: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Porta</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={smtpConfig?.port || ""}
                onChange={e => setSmtpConfig({...smtpConfig, port: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Usuário/E-mail</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              value={smtpConfig?.user || ""}
              onChange={e => setSmtpConfig({...smtpConfig, user: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Senha</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              value={smtpConfig?.pass || ""}
              onChange={e => setSmtpConfig({...smtpConfig, pass: e.target.value})}
            />
          </div>
          <button 
            onClick={() => saveConfig('smtp', smtpConfig)}
            className="bg-vialinks-purple text-white px-8 py-3 rounded-xl font-bold"
          >
            Salvar Configuração SMTP
          </button>
        </div>
      </section>
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    active: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "products"));
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productRef = doc(collection(db, "products"));
      await setDoc(productRef, {
        ...newProduct,
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
      setNewProduct({ name: "", description: "", price: 0, imageUrl: "", active: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "products");
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      await setDoc(doc(db, "products", id), { active: !currentStatus }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando produtos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Catálogo de Produtos</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-vialinks-orange text-white px-6 py-2 rounded-xl font-bold"
        >
          {isAdding ? "Cancelar" : "Novo Produto"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProduct} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Produto</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preço (R$)</label>
              <input 
                type="number" 
                required
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              value={newProduct.description}
              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">URL da Imagem</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
              placeholder="https://exemplo.com/imagem.png"
              value={newProduct.imageUrl}
              onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-vialinks-purple text-white py-4 rounded-xl font-bold">
            Salvar Produto
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag /></div>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">R$ {p.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {p.active ? "Ativo" : "Inativo"}
              </span>
              <button 
                onClick={() => toggleProductStatus(p.id, p.active)}
                className="text-sm font-bold text-vialinks-purple hover:underline"
              >
                Alterar Status
              </button>
              <button 
                onClick={async () => {
                  if (confirm(`Deseja excluir o produto "${p.name}" permanentemente?`)) {
                    try {
                      await deleteDoc(doc(db, "products", p.id));
                    } catch (error) {
                      handleFirestoreError(error, OperationType.DELETE, `products/${p.id}`);
                    }
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StoreListing = ({ user }: { user: any }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "products"));
    return () => unsubscribe();
  }, []);

  const handleBuy = async (product: any) => {
    try {
      const saleRef = doc(collection(db, "sales"));
      await setDoc(saleRef, {
        userId: user.uid,
        customerEmail: user.email,
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }],
        amount: product.price,
        status: "pending",
        type: "product",
        createdAt: serverTimestamp()
      });
      alert("Pedido realizado com sucesso! Em breve entraremos em contato para o pagamento.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "sales");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando loja...</div>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.length === 0 ? (
        <div className="col-span-full p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        products.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square bg-slate-100 relative">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-vialinks-purple">R$ {p.price}</span>
                <button 
                  onClick={() => handleBuy(p)}
                  className="bg-vialinks-orange text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
                >
                  Comprar Agora
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const ImageUpload = ({ label, path, currentUrl, onUpload }: { label: string, path: string, currentUrl: string, onUpload: (url: string) => void, key?: any }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande! O limite é de 5MB.");
      return;
    }

    setUploading(true);
    try {
      // Use a unique filename to avoid cache/overwrite issues
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `${path}/${timestamp}-${cleanName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          console.error("Upload error:", error);
          alert("Erro no upload: " + error.message);
          setUploading(false);
        }, 
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onUpload(downloadURL);
            setUploading(false);
            setProgress(0);
          } catch (err: any) {
            console.error("Error getting download URL:", err);
            alert("Erro ao obter link da imagem.");
            setUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error("Storage error:", err);
      alert("Erro ao iniciar upload.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      <div className="relative group">
        {currentUrl ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={currentUrl} alt={label} className="w-full h-full object-contain" referrerPolicy="no-referrer" loading="lazy" />
            <button 
              onClick={() => onUpload("")}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-vialinks-purple animate-spin" />
                <span className="text-xs font-bold text-slate-500">{Math.round(progress)}%</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-500">Clique para enviar</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
};

const BriefingForm = ({ user, setView }: { user: any, setView: (v: any) => void }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    job: "",
    phone: "",
    email: user.email || "",
    slogan: "",
    website: "",
    instagram: "",
    linkedin: "",
    otherLinks: "",
    colors: "",
    notes: "",
    logoUrl: "",
    personalPhotoUrl: "",
    productPhotos: ["", "", ""],
    acceptedTerms: false
  });

  useEffect(() => {
    const checkStatusAndLoad = async () => {
      try {
        // Check for purchases
        const salesQuery = query(
          collection(db, "sales"), 
          where("userId", "==", user.uid)
        );
        const salesSnap = await getDocs(salesQuery);
        
        if (!salesSnap.empty) {
          setHasPurchase(true);
          // Check if any order is delivered
          const delivered = salesSnap.docs.some(doc => doc.data().status === "delivered");
          setIsDelivered(delivered);
        }

        // Load existing briefing
        const docRef = doc(db, "briefings", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(prev => ({...prev, ...docSnap.data().data}));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `briefings/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };
    checkStatusAndLoad();
  }, [user.uid]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, "briefings", user.uid), {
        userId: user.uid,
        data: formData,
        status: "pending",
        updatedAt: serverTimestamp()
      });
      alert("Briefing enviado com sucesso! Nossa equipe analisará os dados.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `briefings/${user.uid}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Verificando status...</div>;

  if (!hasPurchase) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
        <ShoppingBag className="w-16 h-16 text-vialinks-purple/20 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Briefing Indisponível</h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Para preencher o briefing e começar a criação do seu card, você precisa primeiro adquirir um de nossos planos.
        </p>
        <button 
          onClick={() => {
            setView('landing');
            setTimeout(() => {
              const el = document.getElementById('planos');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-8 py-4 bg-vialinks-purple text-white rounded-2xl font-bold hover:bg-vialinks-dark transition-all shadow-lg shadow-vialinks-purple/20"
        >
          Ver Planos Disponíveis
        </button>
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
        <ShieldCheck className="w-16 h-16 text-emerald-500/20 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Briefing Finalizado</h3>
        <p className="text-slate-600 mb-4 max-w-md mx-auto">
          Seu pedido já foi atendido e seu card entregue com sucesso!
        </p>
        <p className="text-slate-500 text-sm">
          O formulário de briefing foi fechado. Caso precise de alguma alteração, entre em contato com nosso suporte.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Informações do Card</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Como deve aparecer no card"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Cargo / Profissão</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.job}
              onChange={e => setFormData({...formData, job: e.target.value})}
              placeholder="Ex: Consultor Financeiro"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail de Contato</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Slogan / Frase de Impacto</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.slogan}
              onChange={e => setFormData({...formData, slogan: e.target.value})}
              placeholder="Ex: Transformando ideias em realidade"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Links e Redes Sociais</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
            <input 
              type="url" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              placeholder="https://seusite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.instagram}
              onChange={e => setFormData({...formData, instagram: e.target.value})}
              placeholder="@seuusuario"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.linkedin}
              onChange={e => setFormData({...formData, linkedin: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Outros Links</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none h-24"
              value={formData.otherLinks}
              onChange={e => setFormData({...formData, otherLinks: e.target.value})}
              placeholder="Liste outros links importantes"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8 border-t border-slate-100 pt-8">
        <h3 className="text-lg font-bold text-slate-900">Arquivos e Imagens</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ImageUpload 
            label="Sua Logo / Marca" 
            path={`briefings/${user.uid}/logo`}
            currentUrl={formData.logoUrl}
            onUpload={(url) => setFormData({...formData, logoUrl: url})}
          />
          <ImageUpload 
            label="Foto Pessoal" 
            path={`briefings/${user.uid}/personal`}
            currentUrl={formData.personalPhotoUrl}
            onUpload={(url) => setFormData({...formData, personalPhotoUrl: url})}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-700">Fotos de Produtos (Até 3)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((idx) => (
              <ImageUpload 
                key={idx}
                label={`Produto ${idx + 1}`} 
                path={`briefings/${user.uid}/products`}
                currentUrl={formData.productPhotos?.[idx]}
                onUpload={(url) => {
                  const newPhotos = [...(formData.productPhotos || ["", "", ""])];
                  newPhotos[idx] = url;
                  setFormData({...formData, productPhotos: newPhotos});
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Design e Preferências</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Cores de Preferência</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none"
              value={formData.colors}
              onChange={e => setFormData({...formData, colors: e.target.value})}
              placeholder="Ex: Azul e Branco, ou códigos hexadecimais"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Observações Adicionais</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-vialinks-purple outline-none h-32"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Algum detalhe especial que gostaria de incluir?"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            className="mt-1 w-5 h-5 rounded border-slate-300 text-vialinks-purple focus:ring-vialinks-purple"
            checked={formData.acceptedTerms}
            onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
            required
          />
          <span className="text-sm text-slate-600 leading-relaxed">
            Eu li e aceito os <button type="button" className="text-vialinks-purple font-bold hover:underline">Termos e Condições</button> e a <button type="button" className="text-vialinks-purple font-bold hover:underline">Política de Privacidade</button>.
          </span>
        </label>
      </div>

      <button 
        type="submit" 
        disabled={submitting || !formData.acceptedTerms}
        className="w-full mt-10 bg-vialinks-orange text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-vialinks-orange/20 disabled:opacity-50 hover:scale-[1.01] transition-all"
      >
        {submitting ? "Enviando Briefing..." : "Enviar Briefing para Produção"}
      </button>
    </form>
  );
};

export const LoginView = ({ setView, setUser }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAccessAndLogin = async (uid: string, email?: string | null) => {
    // Anyone who reaches this point (authenticated) can access
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Você deve aceitar os termos e políticas para continuar.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User state will be handled by App's onAuthStateChanged
      setView('dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      if (!error.message?.includes("Acesso")) {
        alert("Erro ao entrar. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        // Access check for redirect is handled after redirect completion in App's onAuthStateChanged
      } else {
        const result = await signInWithPopup(auth, provider);
        setView('dashboard');
      }
    } catch (error: any) {
      console.error("Google Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Este domínio não está autorizado no Firebase. Adicione '" + window.location.hostname + "' aos domínios autorizados no Console do Firebase.");
      } else if (!error.message?.includes("Acesso")) {
        alert("Erro ao entrar com Google: " + (error.message || "Erro desconhecido"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2d1b4d_0%,#000000_100%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.1] mix-blend-overlay" />
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-vialinks-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Bem-vindo de volta
          </h2>
          <p className="text-slate-500">Acesse seu painel ViaLinks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="E-mail" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple text-slate-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple text-slate-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-vialinks-purple text-white py-4 rounded-xl font-bold shadow-lg shadow-vialinks-purple/20 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 px-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 rounded border-slate-300 text-vialinks-purple focus:ring-vialinks-purple"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              required
            />
            <span className="text-[10px] text-slate-500 leading-tight">
              Eu li e aceito os <button type="button" className="text-vialinks-purple font-bold hover:underline">Termos e Condições</button> e a <button type="button" className="text-vialinks-purple font-bold hover:underline">Política de Privacidade</button>.
            </span>
          </label>
        </div>

        <div className="mt-4">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" loading="lazy" />
            Entrar com Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            O cadastro é realizado automaticamente após a compra do seu card.
          </p>
        </div>
        
        <button 
          onClick={() => setView('landing')}
          className="w-full mt-8 text-xs text-slate-400 hover:text-slate-600"
        >
          Voltar para o site
        </button>
      </div>
    </div>
  );
};

export const StoreView = ({ setView, user }: any) => {
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    taxId: "", // CPF or CNPJ
    zip: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!formData.name || !formData.email || !formData.taxId) {
      alert("Por favor, preencha pelo menos Nome, E-mail e CPF/CNPJ.");
      return;
    }

    setLoading(true);
    try {
      const priceInCents = 19700; // Fixed for this product
      const res = await fetch("/api/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: 'card-nfc', name: 'ViaLinks Card NFC Profissional', price: priceInCents, quantity: 1 }],
          email: formData.email,
          ...formData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar checkout");
      }
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      console.error("Store checkout error:", error);
      alert(`Erro no Checkout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Loja Virtual ViaLinks</h2>
          <p className="text-lg text-slate-600">Adquira seu card NFC e transforme sua presença profissional.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <FirebaseImage 
                  storagePath="11945874_Card_Phone2.png" 
                  alt="Card Product" 
                  className="w-full h-full object-cover"
                  fallbackUrl="/input_file_0.png"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Preço Único</p>
                <p className="text-3xl font-extrabold text-vialinks-purple">R$ 197,00</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ViaLinks Card NFC Profissional</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                O cartão de visitas do futuro. Com tecnologia NFC integrada, basta aproximar do celular do seu cliente para compartilhar seu mini-site profissional instantaneamente.
              </p>
              <ul className="space-y-3">
                {[
                  "Cartão Físico com acabamento Premium",
                  "Chip NFC de alta sensibilidade",
                  "Mini-site editável em tempo real",
                  "QR Code de backup no verso",
                  "Sem mensalidades ou taxas ocultas"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Check className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <User className="text-vialinks-orange" /> Dados de Entrega e Faturamento
            </h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.taxId}
                    onChange={e => setFormData({...formData, taxId: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">CEP</label>
                  <input 
                    type="text" 
                    placeholder="00000-000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.zip}
                    onChange={e => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rua / Logradouro</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Número</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Complemento</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.complement}
                    onChange={e => setFormData({...formData, complement: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bairro</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.neighborhood}
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estado (UF)</label>
                  <input 
                    type="text" 
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-orange"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full bg-vialinks-orange text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-vialinks-orange/30 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <ShoppingBag className="w-6 h-6" /> Finalizar Compra no Stripe
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  Ao clicar em finalizar, você será redirecionado para o ambiente seguro do Stripe para realizar o pagamento via Cartão, PIX ou Boleto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const AdminEmailManagement = ({ users }: { users: any[] }) => {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<'campaign' | 'templates'>('campaign');
  
  // Template editing states
  const [welcomeSubject, setWelcomeSubject] = useState("");
  const [welcomeHtml, setWelcomeHtml] = useState("");
  const [successSubject, setSuccessSubject] = useState("");
  const [successHtml, setSuccessHtml] = useState("");

  useEffect(() => {
    // Fetch current templates from Firestore
    const fetchTemplates = async () => {
      const docRef = doc(db, 'config', 'emailTemplates');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.welcome) {
          setWelcomeSubject(data.welcome.subject || "");
          setWelcomeHtml(data.welcome.html || "");
        }
        if (data.orderSuccess) {
          setSuccessSubject(data.orderSuccess.subject || "");
          setSuccessHtml(data.orderSuccess.html || "");
        }
      }
    };
    fetchTemplates();
  }, []);

  const handleSendEmail = async () => {
    if (!subject || !html || selectedUsers.length === 0) {
      alert("Preencha o assunto, conteúdo e selecione pelo menos um destinatário.");
      return;
    }

    setSending(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          recipients: selectedUsers,
          subject,
          html
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("Email enviado com sucesso!");
        setSubject("");
        setHtml("");
        setSelectedUsers([]);
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Erro ao enviar email.");
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplates = async () => {
    try {
      await setDoc(doc(db, 'config', 'emailTemplates'), {
        welcome: { subject: welcomeSubject, html: welcomeHtml },
        orderSuccess: { subject: successSubject, html: successHtml }
      }, { merge: true });
      alert("Modelos salvos com sucesso!");
    } catch (error) {
      console.error("Error saving templates:", error);
      alert("Erro ao salvar modelos.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.email).filter(Boolean));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 border-b border-slate-100 pb-4">
        <button 
          onClick={() => setTab('campaign')}
          className={`px-4 py-2 font-bold rounded-xl ${tab === 'campaign' ? 'bg-vialinks-purple text-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Nova Campanha
        </button>
        <button 
          onClick={() => setTab('templates')}
          className={`px-4 py-2 font-bold rounded-xl ${tab === 'templates' ? 'bg-vialinks-purple text-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Modelos Automáticos
        </button>
      </div>

      {tab === 'campaign' ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Compor E-mail</h3>
            <input 
              type="text" 
              placeholder="Assunto do E-mail"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple text-slate-600"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
            <textarea 
              placeholder="Conteúdo do E-mail (Aceita HTML)"
              className="w-full h-[300px] px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-vialinks-purple font-mono text-sm text-slate-600"
              value={html}
              onChange={e => setHtml(e.target.value)}
            />
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Dica:</p>
              <p className="text-xs text-slate-500">Você pode usar tags HTML como &lt;h1&gt;, &lt;p&gt;, &lt;a&gt; e &lt;img&gt; para criar campanhas ricas.</p>
            </div>
            <button 
              onClick={handleSendEmail}
              disabled={sending || selectedUsers.length === 0}
              className="w-full bg-vialinks-purple text-white py-4 rounded-xl font-bold shadow-lg shadow-vialinks-purple/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              Enviar para {selectedUsers.length} destinatário(s)
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Destinatários</h3>
              <button onClick={toggleSelectAll} className="text-xs font-bold text-vialinks-purple hover:underline">
                {selectedUsers.length === users.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded-lg text-vialinks-purple focus:ring-vialinks-purple border-slate-300"
                    checked={selectedUsers.includes(u.email)}
                    onChange={() => {
                      if (selectedUsers.includes(u.email)) {
                        setSelectedUsers(selectedUsers.filter(e => e !== u.email));
                      } else {
                        setSelectedUsers([...selectedUsers, u.email]);
                      }
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{u.displayName || "Sem Nome"}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">E-mail de Boas-vindas</h3>
            <p className="text-sm text-slate-500">Enviado logo após o primeiro pagamento. Use as tags <code>{"{{name}}"}</code>, <code>{"{{email}}"}</code> e <code>{"{{password}}"}</code>.</p>
            <input 
              type="text" 
              placeholder="Assunto de Boas-vindas"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-slate-600"
              value={welcomeSubject}
              onChange={e => setWelcomeSubject(e.target.value)}
            />
            <textarea 
              className="w-full h-48 px-4 py-3 rounded-xl border border-slate-200 outline-none font-mono text-sm text-slate-600"
              value={welcomeHtml}
              onChange={e => setWelcomeHtml(e.target.value)}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 opacity-50">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmação de Compra (Carrinho)</h3>
            <p className="text-sm text-slate-500">Em desenvolvimento...</p>
          </div>

          <button 
            onClick={handleSaveTemplates}
            className="bg-vialinks-orange text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-vialinks-orange/20"
          >
            <Save className="w-5 h-5" /> Salvar Alterações nos Modelos
          </button>
        </div>
      )}
    </div>
  );
};

const AdminAbandonedCart = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "abandoned_carts"), (snapshot) => {
      const cartsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by last attempt
      cartsData.sort((a: any, b: any) => {
        const dateA = a.lastAttempt?.toDate ? a.lastAttempt.toDate() : new Date(0);
        const dateB = b.lastAttempt?.toDate ? b.lastAttempt.toDate() : new Date(0);
        return dateB - dateA;
      });
      setCarts(cartsData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Checkouts Iniciados</h3>
          <p className="text-sm text-slate-500">Acompanhe quem começou a compra mas não finalizou o pagamento.</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl text-orange-600 font-bold border border-orange-100">
          {carts.filter(c => c.status === 'pending').length} Carrinhos Pendentes
        </div>
      </div>

      <div className="grid gap-4">
        {carts.map(cart => (
          <div key={cart.id} className={`p-6 rounded-3xl border ${cart.status === 'converted' ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-100'} shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cart.status === 'converted' ? 'bg-emerald-500' : 'bg-orange-100'}`}>
                {cart.status === 'converted' ? <Check className="text-white" /> : <ShoppingCartIcon className="w-6 h-6 text-orange-600" />}
              </div>
              <div>
                <p className="font-bold text-slate-900">{cart.name || "Visitante"}</p>
                <p className="text-sm text-slate-500">{cart.email}</p>
                <p className="text-xs text-slate-400">
                  Iniciado em: {cart.lastAttempt?.toDate ? cart.lastAttempt.toDate().toLocaleString() : "..."}
                </p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-8">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Valor do Carrinho</p>
                <p className={`text-xl font-black ${cart.status === 'converted' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  R$ {cart.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {cart.status === 'pending' && (
                <button 
                  onClick={() => {
                    const mailto = `mailto:${cart.email}?subject=Você esqueceu algo!&body=Olá ${cart.name}, vimos que você iniciou sua compra na ViaLinks mas não finalizou. Tem alguma dúvida? Posso te ajudar?`;
                    window.location.href = mailto;
                  }}
                  className="bg-vialinks-purple text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-vialinks-purple/20"
                >
                  Recuperar Manual
                </button>
              )}
              {cart.status === 'converted' && (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Venda Concluída</span>
              )}
            </div>
          </div>
        ))}

        {carts.length === 0 && (
          <div className="text-center p-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Nenhum carrinho registrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
