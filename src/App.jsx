import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Instagram, Phone, MapPin, Send, ShoppingBag, 
  X, Plus, Minus, CheckCircle2, PartyPopper, Cake, Gift
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Rutas de imágenes según la base del sitio (funciona en /littlebites/ y en un dominio propio).
const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`;

// WhatsApp del negocio (pedidos, cotizaciones y contacto).
const WHATSAPP = "584246055274";
const WHATSAPP_LABEL = "+58 424 605 5274";
const waLink = (text) => `https://wa.me/${WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// SweetAlert2 se carga recién cuando se usa: no pesa en la carga inicial.
const showAlert = async (options) => {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire(options);
};

const PRODUCTS = {
  "Brownies": [
    { id: 1, name: "Brownie Clásico", price: 5.00, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&h=400&auto=format&fit=crop" },
    { id: 2, name: "Brownie de Snickers", price: 6.00, img: asset("brownie-snicker.webp") },
    { id: 10, name: "Mini Brownie", price: 7.50, img: asset("minibrownie.webp") },
  ],
  "Mini Dulces": [
    { id: 3, name: "Mini Chips", price: 5.00, img: asset("cookie-chip.webp") },
    { id: 4, name: "Cookie Cups", price: 7.50, img: asset("cookie-cups.webp") },
    { id: 12, name: "Mini Brownie Especial", price: 7.50, img: asset("minibrownie.webp") }, // ID único
  ],
  "Cakes": [
    { id: 5, name: "Cookie Monster Cake", price: 18.00, img: asset("cake-c.webp") },
    { id: 6, name: "Naranja Cake", price: 12.00, img: asset("orange-cake.webp") },
    { id: 11, name: "Chocolate Cake", price: 12.00, img: asset("chocolate-cake.webp") },
  ],
  "Galletas NY": [
    { id: 7, name: "Galletas NY Clásicas", price: 5.00, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&h=400&auto=format&fit=crop" },
    { id: 8, name: "Galletas Red Velvet", price: 5.50, img: asset("redv.webp") },
    { id: 9, name: "Galletas Triple Choco", price: 5.00, img: asset("choco.webp") },
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState("Brownies");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(null);

  // Carrito persistente
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('littleBitesCart') || '[]');
      // Precios, nombres e imágenes siempre del catálogo actual (por si cambiaron).
      const catalog = Object.values(PRODUCTS).flat();
      return saved
        .map(item => {
          const product = catalog.find(p => p.id === item.id);
          return product && item.quantity > 0 ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('littleBitesCart', JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity }))));
    } catch { /* modo privado o almacenamiento lleno */ }
  }, [cart]);

  // Cerrar el carrito con Escape
  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartOpen]);

  // Manejo de Formulario Formspree
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const nombre = formData.get('nombre');

    const FORMSPREE_ID = "xlgaqeww"; 

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showAlert({
          title: '¡Mensaje recibido!',
          text: `Gracias ${nombre}, revisaremos tu mensaje pronto. 🧁`,
          imageUrl: asset('fav.webp'),
          imageAlt: 'Logo de Little Bites',
          imageWidth: 100,
          imageHeight: 100,
          background: '#fdf5e6',
          color: '#4a2c2a',
          confirmButtonColor: '#d4af37',
        });
        form.reset();
      } else {
        throw new Error();
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        text: 'No pudimos enviar el mensaje. Inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonColor: '#4a2c2a',
      });
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowAddFeedback(product.id);
    setTimeout(() => setShowAddFeedback(null), 2000);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const sendOrder = () => {
    const header = "*Nuevo Pedido - Little Bites* 🧁\n----------------------------\n";
    const body = cart.map(item => `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const footer = `\n----------------------------\n*Total a pagar: $${cartTotal.toFixed(2)}*`;
    window.open(waLink(header + body + footer), '_blank', 'noopener');
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bites-cream/80 backdrop-blur-md px-6 py-4 border-b border-bites-brown/5 flex justify-between items-center">
        <span className="text-xs font-bold text-bites-brown/70 uppercase tracking-tighter">Since 2025</span>
        <a href="#" className="text-2xl font-serif font-bold text-bites-brown">Little Bites</a>
        <button onClick={() => setIsCartOpen(true)} aria-label={cartCount > 0 ? `Ver pedido (${cartCount} ${cartCount === 1 ? 'producto' : 'productos'})` : 'Ver pedido'} className="relative bg-bites-brown text-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform">
          <ShoppingBag size={24} aria-hidden="true" />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-bites-gold text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
        </button>
      </nav>

      {/* Hero */}
      <header className="pt-20 bg-bites-brown">
        <picture>
          <source media="(min-width: 768px)" srcSet={asset('banner.webp')} width="1717" height="830" />
          <img className="w-full h-auto object-cover" src={asset('banner-mb.webp')} width="853" height="1844" fetchpriority="high" alt="Little Bites: hecho con amor para endulzar tus mejores momentos. Brownies, mini dulces, cakes y galletas NY." />
        </picture>
      </header>

      {/* Categorías */}
      <div className="sticky top-[73px] z-40 bg-bites-cream/70 backdrop-blur-sm py-6 border-b border-bites-brown/5">
        <div className="flex flex-wrap justify-center gap-6 px-4 py-4">
          {Object.keys(PRODUCTS).map((cat) => (
            <div key={cat} className="relative">
              <AnimatePresence>
                {activeTab === cat && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: 10, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, y: -25, rotate: 10 }}
                    exit={{ opacity: 0, scale: 0, y: 10 }}
                    className="absolute right-0 z-10 pointer-events-none"
                    style={{ top: "-5px" }}
                  >
                    <span className="text-3xl filter drop-shadow-md" aria-hidden="true">
                      {cat === "Brownies" ? "🍫" : cat === "Mini Dulces" ? "🧁" : cat === "Cakes" ? "🎂" : "🍪"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setActiveTab(cat)}
                aria-pressed={activeTab === cat}
                className={`px-10 py-2 rounded-full border-2 transition-all font-bold text-base shadow-sm ${activeTab === cat ? 'bg-bites-brown border-bites-brown text-white shadow-xl scale-105' : 'bg-white/50 border-bites-brown/10 text-bites-brown hover:border-bites-brown'}`}
              >
                {cat}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Catálogo */}
      <main className="relative py-16 px-6 bg-cover bg-center bg-no-repeat md:bg-fixed" style={{ backgroundImage: `url('${asset('banner-bg.webp')}')` }}>
        <div className="absolute inset-0 bg-bites-cream/60 -z-10" />
        <div className="max-w-6xl mx-auto">
          <Swiper modules={[Navigation, Pagination]} spaceBetween={30} slidesPerView={1} navigation pagination={{ clickable: true }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="pb-16">
            {PRODUCTS[activeTab].map((product) => (
              <SwiperSlide key={product.id}>
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-bites-brown/5 transition-all hover:shadow-bites-gold/20">
                  <img src={product.img} alt={product.name} loading="lazy" decoding="async" width="400" height="288" className="w-full h-72 object-cover" />
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-serif mb-2 text-bites-brown">{product.name}</h3>
                    <p className="text-bites-gold font-bold text-xl mb-6">${product.price.toFixed(2)}</p>
                    <button onClick={() => addToCart(product)} aria-live="polite" className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold ${showAddFeedback === product.id ? 'bg-green-500 text-white' : 'bg-bites-brown text-white hover:opacity-90'}`}>
                      {showAddFeedback === product.id ? <CheckCircle2 size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
                      {showAddFeedback === product.id ? '¡Agregado!' : 'Agregar al pedido'}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </main>

      {/* Historia */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-bites-cream shadow-2xl shrink-0">
            <img src={asset('fav.webp')} alt="Logo de Little Bites" loading="lazy" decoding="async" width="320" height="320" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left text-bites-brown">
            <h2 className="text-4xl font-serif mb-6">Nuestra Historia</h2>
            <p className="text-xl leading-relaxed italic text-gray-600 font-serif">
              "Cada postre de Little Bites tiene una historia. Buscamos el equilibrio perfecto entre lo dulce y lo artesanal para que cada bocado sea un recuerdo feliz."
            </p>
          </div>
        </div>
      </section>

      {/* Eventos */}
      <section className="py-24 px-6 bg-bites-cream/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-serif text-bites-brown leading-tight mb-6">Eventos & <br /><span className="text-bites-gold italic">Celebraciones</span></h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">Llevamos la magia de <strong>Little Bites</strong> a tus fechas más importantes.</p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="flex items-center gap-3 text-bites-brown font-bold"><PartyPopper className="text-bites-gold" /> Cumpleaños</div>
              <div className="flex items-center gap-3 text-bites-brown font-bold"><Cake className="text-bites-gold" /> Tortas</div>
              <div className="flex items-center gap-3 text-bites-brown font-bold"><Gift className="text-bites-gold" /> Packs para Regalar </div>
              {/* <div className="flex items-center gap-3 text-bites-brown font-bold"><CalendarCheck className="text-bites-gold" /> Eventos</div> */}
            </div>
            <a href={waLink('Hola, quiero cotizar un pedido para un evento')} target="_blank" rel="noopener noreferrer" className="bg-bites-brown text-white px-10 py-4 rounded-2xl font-bold shadow-xl inline-flex items-center"><MessageCircle size={30} className='px-1' aria-hidden="true"/> Cotizar mi pedido</a>
          </motion.div>
          <div className="relative">
            <div className="absolute -inset-4 bg-bites-gold/20 rounded-[3rem] blur-2xl" />
            <img src={asset('surtidos.webp')} alt="Surtido de galletas y brownies para eventos" loading="lazy" decoding="async" width="786" height="791" className="relative rounded-[3rem] shadow-2xl border-4 border-white w-full h-[450px] object-cover" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bites-brown text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1),_transparent)] pointer-events-none" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-8">
            <h3 className="text-4xl font-serif text-bites-cream">Little Bites</h3>
            <div className="space-y-6">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-bites-gold transition-colors"><Phone aria-hidden="true" /> {WHATSAPP_LABEL}</a>
              <a href="https://instagram.com/littlebites.ve" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-bites-gold transition-colors"><Instagram aria-hidden="true" /> @littlebites.ve</a>
              <p className="flex items-center gap-4"><MapPin aria-hidden="true" /> Maracaibo, Venezuela</p>
            </div>
            
      <div className="mt-12 md:mt-0 pt-8 border-t border-white/10">
        <p className="text-xl italic text-bites-cream opacity-70">
          "Dulces momentos, grandes recuerdos."
        </p>
        <p className="pt-10">© 2026 Little Bites. Todos los derechos reservados.</p>
      </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <h4 className="text-2xl font-serif mb-6 text-bites-cream">Escríbenos</h4>
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <input name="nombre" type="text" placeholder="Tu nombre" aria-label="Tu nombre" autoComplete="name" required className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold" />
              <input name="email" type="email" placeholder="Tu correo" aria-label="Tu correo" autoComplete="email" className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold" />
              <textarea name="mensaje" placeholder="¿En qué podemos ayudarte?" aria-label="Tu mensaje" rows="4" required className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold resize-none" />
              <button type="submit" className="w-full bg-bites-gold text-bites-brown font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"><Send size={18} aria-hidden="true" /> Enviar mensaje</button>
            </form>
          </div>
        </div>
      </footer>

      {/* Carrito Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} role="dialog" aria-modal="true" aria-labelledby="cart-title" className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bites-cream z-[70] shadow-2xl p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b pb-4"><h3 id="cart-title" className="text-2xl font-serif text-bites-brown">Tu pedido</h3><button onClick={() => setIsCartOpen(false)} aria-label="Cerrar pedido" autoFocus><X aria-hidden="true" /></button></div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? <div className="text-center py-20 opacity-40 italic">Tu carrito está vacío 🧁</div> : cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white/60 p-4 rounded-3xl"><img src={item.img} alt="" width="80" height="80" className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-bites-brown">{item.name}</h4>
                      <p className="text-bites-gold font-bold">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => updateQuantity(item.id, -1)} aria-label={`Quitar un ${item.name}`} className="p-1 border rounded-lg"><Minus size={14} aria-hidden="true"/></button>
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} aria-label={`Agregar un ${item.name}`} className="p-1 border rounded-lg"><Plus size={14} aria-hidden="true"/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && <div className="pt-8 border-t mt-6"><div className="flex justify-between text-2xl font-serif mb-6"><span>Total:</span><span>${cartTotal.toFixed(2)}</span></div><button onClick={sendOrder} className="w-full bg-bites-brown text-white py-5 rounded-2xl font-bold flex justify-center gap-3">Confirmar por WhatsApp</button></div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;