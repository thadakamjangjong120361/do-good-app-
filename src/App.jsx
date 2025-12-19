import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Gift, LogOut, ShoppingBag, User } from 'lucide-react';

const supabase = createClient(
  'https://bwqcofvnzphstcgjtyee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWNvZnZuenBoc3RjZ2p0eWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTYzMDMsImV4cCI6MjA1MDE5MjMwM30.KLcbVgknSXqcFHafSRE8LHMIR7F6vxWknp3_QVFQLAQ'
);

export default function App() {
  const [view, setView] = useState('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [plzCity, setPlzCity] = useState('');
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('do_good_customer');
    if (saved) {
      setCustomer(JSON.parse(saved));
      setView('products');
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true);
    if (data) setProducts(data);
  };

  const handleLogin = async () => {
    if (!phone) return;
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').eq('phone', phone).single();
    if (data) {
      setCustomer(data);
      localStorage.setItem('do_good_customer', JSON.stringify(data));
      setView('products');
    } else {
      alert('Telefonnummer nicht gefunden. Bitte registrieren.');
      setView('register');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!phone || !name || !address || !plzCity) return;
    setLoading(true);
    const { data, error } = await supabase.from('customers').insert([
      { phone, name, email, address, plz_city: plzCity }
    ]).select().single();
    if (data) {
      setCustomer(data);
      localStorage.setItem('do_good_customer', JSON.stringify(data));
      setView('products');
    } else if (error) {
      alert('Fehler: ' + error.message);
    }
    setLoading(false);
  };

  const handleOrder = async (product) => {
    setLoading(true);
    await supabase.from('orders').insert([
      { customer_id: customer.id, product_id: product.id }
    ]);
    setOrderedProduct(product);
    setOrderSuccess(true);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('do_good_customer');
    setCustomer(null);
    setView('login');
    setOrderSuccess(false);
  };

  if (orderSuccess) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div style={{background:'white',borderRadius:'1.5rem',padding:'2rem',maxWidth:'24rem',width:'100%',textAlign:'center'}}>
          <div style={{width:'5rem',height:'5rem',background:'#22c55e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem'}}>
            <Check style={{width:'2.5rem',height:'2.5rem',color:'white'}}/>
          </div>
          <h2 style={{fontSize:'1.5rem',fontWeight:'bold',marginBottom:'0.5rem'}}>Bestellung erfolgreich!</h2>
          <p style={{color:'#666',marginBottom:'1rem'}}>{orderedProduct?.emoji} {orderedProduct?.name}</p>
          <div style={{background:'#fef3c7',borderRadius:'1rem',padding:'1rem',marginBottom:'1rem',textAlign:'left'}}>
            <p style={{fontWeight:'600',marginBottom:'0.5rem'}}>📍 Lieferadresse:</p>
            <p style={{color:'#666',fontSize:'0.9rem'}}>{customer?.name}</p>
            <p style={{color:'#666',fontSize:'0.9rem'}}>{customer?.address}</p>
            <p style={{color:'#666',fontSize:'0.9rem'}}>{customer?.plz_city}</p>
          </div>
          <button onClick={()=>setOrderSuccess(false)} style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',cursor:'pointer'}}>
            Weitere Produkte
          </button>
        </div>
      </div>
    );
  }

  if (view === 'products' && customer) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f59e0b,#f97316)',padding:'1rem'}}>
        <div style={{maxWidth:'24rem',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <div style={{color:'white'}}>
              <p style={{opacity:0.8,fontSize:'0.9rem'}}>Hallo!</p>
              <p style={{fontWeight:'bold',fontSize:'1.2rem'}}>{customer.name} 👋</p>
            </div>
            <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',padding:'0.75rem',cursor:'pointer'}}>
              <LogOut style={{width:'1.25rem',height:'1.25rem',color:'white'}}/>
            </button>
          </div>

          <div style={{background:'rgba(255,255,255,0.2)',borderRadius:'1rem',padding:'1rem',marginBottom:'1.5rem',color:'white',textAlign:'center'}}>
            <Gift style={{width:'2rem',height:'2rem',margin:'0 auto 0.5rem'}}/>
            <h1 style={{fontSize:'1.5rem',fontWeight:'bold'}}>Do Good 🎁</h1>
            <p style={{opacity:0.9}}>Heute GRATIS für dich!</p>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {products.map(product => (
              <div key={product.id} style={{background:'white',borderRadius:'1.5rem',padding:'1.5rem',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem'}}>
                  <span style={{fontSize:'3rem'}}>{product.emoji}</span>
                  <div>
                    <p style={{fontWeight:'bold',fontSize:'1.1rem'}}>{product.name}</p>
                    <p style={{color:'#666',fontSize:'0.9rem'}}>{product.description}</p>
                    <p style={{color:'#22c55e',fontWeight:'bold'}}>GRATIS</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOrder(product)}
                  disabled={loading}
                  style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}
                >
                  <ShoppingBag style={{width:'1.25rem',height:'1.25rem'}}/>
                  {loading ? 'Bestellen...' : '1-Klick Bestellen'}
                </button>
              </div>
            ))}
          </div>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.7)',marginTop:'1.5rem',fontSize:'0.9rem'}}>
            🇨🇭 Gratis für alle in der Schweiz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f59e0b,#f97316)',padding:'1rem'}}>
      <div style={{maxWidth:'24rem',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'2rem',color:'white'}}>
          <div style={{background:'rgba(255,255,255,0.2)',display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 1rem',borderRadius:'2rem',marginBottom:'1rem'}}>
            <Gift style={{width:'1.25rem',height:'1.25rem'}}/>
            <span style={{fontWeight:'600'}}>GRATIS PRODUKTE</span>
          </div>
          <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:'0.5rem'}}>Do Good 🎁</h1>
          <p style={{opacity:0.9}}>Jeden Tag neue Gratis-Produkte!</p>
        </div>

        <div style={{background:'white',borderRadius:'1.5rem',padding:'1.5rem',marginBottom:'1rem'}}>
          {view === 'login' ? (
            <>
              <h2 style={{fontWeight:'bold',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <User style={{width:'1.25rem',height:'1.25rem'}}/> Login
              </h2>
              <div style={{marginBottom:'1rem'}}>
                <label style={{fontSize:'0.9rem',color:'#666',display:'block',marginBottom:'0.25rem'}}>Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="079 123 45 67"
                  style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',fontSize:'1rem',boxSizing:'border-box'}}
                />
              </div>
              <button 
                onClick={handleLogin}
                disabled={loading || !phone}
                style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',cursor:'pointer',opacity:(!phone||loading)?0.5:1}}
              >
                {loading ? 'Laden...' : 'Einloggen'}
              </button>
              <p style={{textAlign:'center',marginTop:'1rem',color:'#666'}}>
                Noch kein Konto? <button onClick={()=>setView('register')} style={{color:'#f59e0b',fontWeight:'bold',background:'none',border:'none',cursor:'pointer'}}>Registrieren</button>
              </p>
            </>
          ) : (
            <>
              <h2 style={{fontWeight:'bold',marginBottom:'1rem'}}>📝 Registrieren</h2>
              <p style={{color:'#666',marginBottom:'1rem',fontSize:'0.9rem'}}>Einmal registrieren, immer 1-Klick bestellen!</p>
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                <div>
                  <label style={{fontSize:'0.9rem',color:'#666'}}>Telefon *</label>
                  <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="079 123 45 67" style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'0.9rem',color:'#666'}}>Name *</label>
                  <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Max Muster" style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'0.9rem',color:'#666'}}>Email</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="max@beispiel.ch" style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'0.9rem',color:'#666'}}>Adresse *</label>
                  <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Musterstrasse 1" style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'0.9rem',color:'#666'}}>PLZ & Ort *</label>
                  <input type="text" value={plzCity} onChange={(e)=>setPlzCity(e.target.value)} placeholder="8000 Zürich" style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'0.75rem',boxSizing:'border-box'}}/>
                </div>
              </div>
              <button 
                onClick={handleRegister}
                disabled={loading || !phone || !name || !address || !plzCity}
                style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',marginTop:'1rem',cursor:'pointer',opacity:(!phone||!name||!address||!plzCity||loading)?0.5:1}}
              >
                {loading ? 'Registrieren...' : 'Registrieren & Loslegen 🚀'}
              </button>
              <p style={{textAlign:'center',marginTop:'1rem',color:'#666'}}>
                Schon registriert? <button onClick={()=>setView('login')} style={{color:'#f59e0b',fontWeight:'bold',background:'none',border:'none',cursor:'pointer'}}>Einloggen</button>
              </p>
            </>
          )}
        </div>

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'}}>
          🇨🇭 Für alle in der Schweiz
        </p>
      </div>
    </div>
  );
}
