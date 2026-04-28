import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Instagram, Phone, MapPin, Send, ShoppingBag, 
  X, Plus, Minus, CheckCircle2, PartyPopper, Cake, Gift, CalendarCheck 
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Swal from 'sweetalert2';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PRODUCTS = {
  "Brownies": [
    { id: 1, name: "Brownie Clásico", price: 5.00, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&h=400&auto=format&fit=crop" },
    { id: 2, name: "Brownie de Snickers", price: 6.00, img: "assets/brownie-snicker.png" },
    { id: 10, name: "Mini Brownie", price: 7.50, img: "assets/minibrownie.png" },
  ],
  "Mini Dulces": [
    { id: 3, name: "Mini Chips", price: 5.00, img: "assets/coockie-chip.png" },
    { id: 4, name: "Cookie Cups", price: 7.50, img: "assets/cookie-cups.jpg" },
    { id: 12, name: "Mini Brownie Especial", price: 7.50, img: "assets/minibrownie.png" }, // ID único
  ],
  "Cakes": [
    { id: 5, name: "Cookie Monster Cake", price: 18.00, img: "assets/cake-c.png" },
    { id: 6, name: "Naranja Cake", price: 12.00, img: "assets/orange-cake.png" },
    { id: 11, name: "Chocolate Cake", price: 12.00, img: "assets/chocolate-cake.png" },
  ],
  "Galletas NY": [
    { id: 7, name: "Galletas NY Clásicas", price: 5.00, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&h=400&auto=format&fit=crop" },
    { id: 8, name: "Galletas Red Velvet", price: 5.50, img: "assets/redv.png" },
    { id: 9, name: "Galletas Triple Choco", price: 5.00, img: "assets/choco.png" },
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState("Brownies");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(null);

  // Carrito persistente
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('littleBitesCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('littleBitesCart', JSON.stringify(cart));
  }, [cart]);

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
        Swal.fire({
          title: '¡Mensaje Recibido!',
          text: `Gracias ${nombre}, revisaremos tu mensaje pronto. 🧁`,
          imageUrl: `${import.meta.env.BASE_URL}/assets/fav.png`, 
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
      Swal.fire({
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
    const message = encodeURIComponent(header + body + footer);
    window.open(`https://wa.me/541159056478?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bites-cream/80 backdrop-blur-md px-6 py-4 border-b border-bites-brown/5 flex justify-between items-center">
        <span className="text-xs font-bold text-bites-brown/40 uppercase tracking-tighter">Since 2025</span>
        <a href="#" className="text-2xl font-serif font-bold text-bites-brown">Little Bites</a>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-bites-brown text-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform">
          <ShoppingBag size={24} />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-bites-gold text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
        </button>
      </nav>

      {/* Hero */}
      <header className="pt-20 bg-bites-brown">
        <picture>
          <source media="(min-width: 768px)" srcSet={`${import.meta.env.BASE_URL}assets/banner.jpg`} />
          <img className="w-full h-auto object-cover" src={`${import.meta.env.BASE_URL}assets/banner-mb.png`} alt="Banner Little Bites" />
        </picture>
      </header>


      {/* Categorías (Sticky con Scroll Horizontal en Mobile) */}
      <div className="sticky top-[73px] z-40 bg-bites-cream/80 backdrop-blur-md border-b border-bites-brown/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto overflow-y-visible scrollbar-hide gap-4 px-6 py-4 md:justify-center items-center">
            {Object.keys(PRODUCTS).map((cat) => (
              <div key={cat} className="relative flex-shrink-0">
                <AnimatePresence>
                  {activeTab === cat && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: -22, rotate: 12 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-0 z-10 pointer-events-none text-2xl"
                    >
                      {cat === "Brownies" ? "🍫" : cat === "Mini Dulces" ? "🧁" : cat === "Cakes" ? "🎂" : "🍪"}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full border-2 transition-all font-bold text-sm shadow-sm ${
                    activeTab === cat 
                    ? 'bg-bites-brown border-bites-brown text-white shadow-lg' 
                    : 'bg-white/50 border-bites-brown/10 text-bites-brown hover:border-bites-brown'
                  }`}
                >
                  {cat}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <main className="relative py-16 px-6 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/littlebites/assets/banner-bg.png')" }}>
        <div className="absolute inset-0 bg-bites-cream/60 -z-10" />
        <div className="max-w-6xl mx-auto">
          <Swiper modules={[Navigation, Pagination]} spaceBetween={30} slidesPerView={1} navigation pagination={{ clickable: true }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="pb-16">
            {PRODUCTS[activeTab].map((product) => (
              <SwiperSlide key={product.id}>
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-bites-brown/5 transition-all hover:shadow-bites-gold/20">
                  <img src={product.img} alt={product.name} className="w-full h-72 object-cover" />
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-serif mb-2 text-bites-brown">{product.name}</h3>
                    <p className="text-bites-gold font-bold text-xl mb-6">${product.price.toFixed(2)}</p>
                    <button onClick={() => addToCart(product)} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold ${showAddFeedback === product.id ? 'bg-green-500 text-white' : 'bg-bites-brown text-white hover:opacity-90'}`}>
                      {showAddFeedback === product.id ? <CheckCircle2 size={20} /> : <Plus size={20} />}
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
            <img src="assets/fav.png" alt="Creador" className="w-full h-full object-cover" />
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
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">Llevamos la magia de **Little Bites** a tus fechas más importantes.</p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="flex items-center gap-3 text-bites-brown font-bold"><PartyPopper className="text-bites-gold" /> Cumpleaños</div>
              <div className="flex items-center gap-3 text-bites-brown font-bold"><Cake className="text-bites-gold" /> Tortas</div>
              <div className="flex items-center gap-3 text-bites-brown font-bold"><Gift className="text-bites-gold" /> Packs para Regalar </div>
              {/* <div className="flex items-center gap-3 text-bites-brown font-bold"><CalendarCheck className="text-bites-gold" /> Eventos</div> */}
            </div>
            <button onClick={() => window.open('https://wa.me/541159056478?text=Consulta sobre eventos', '_blank')} className="bg-bites-brown text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center"><MessageCircle size={30} className='px-1'/> Cotizar mi pedido</button>
          </motion.div>
          <div className="relative">
            <div className="absolute -inset-4 bg-bites-gold/20 rounded-[3rem] blur-2xl" />
            <img src="/littlebites/assets/surtidos.png" alt="Eventos" className="relative rounded-[3rem] shadow-2xl border-4 border-white w-full h-[450px] object-cover" />
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
              <a href="https://wa.me/584246055274" className="flex items-center gap-4 hover:text-bites-gold transition-colors"><Phone /> +58 04246055274</a>
              <a href="https://instagram.com/littlebites.ve" className="flex items-center gap-4 hover:text-bites-gold transition-colors"><Instagram /> @littlebites.ve</a>
              <p className="flex items-center gap-4"><MapPin /> Maracaibo, Venezuela</p>
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
              <input name="nombre" type="text" placeholder="Tu nombre" required className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold" />
              <input name="email" type="email" placeholder="Tu correo" className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold" />
              <textarea name="mensaje" placeholder="¿En qué podemos ayudarte?" rows="4" required className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-bites-gold resize-none" />
              <button type="submit" className="w-full bg-bites-gold text-bites-brown font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"><Send size={18} /> Enviar mensaje</button>
            </form>
          </div>
        </div>
      </footer>

      {/* Carrito Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bites-cream z-[70] shadow-2xl p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b pb-4"><h3 className="text-2xl font-serif text-bites-brown">Tu Pedido</h3><button onClick={() => setIsCartOpen(false)}><X /></button></div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? <div className="text-center py-20 opacity-40 italic">Tu carrito está vacío 🧁</div> : cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white/60 p-4 rounded-3xl"><img src={item.img} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-bites-brown">{item.name}</h4>
                      <p className="text-bites-gold font-bold">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border rounded-lg"><Minus size={14}/></button>
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border rounded-lg"><Plus size={14}/></button>
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