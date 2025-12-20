import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Gift, ShoppingBag } from 'lucide-react';

const supabase = createClient(
  'https://bwqcofvnzphstcgjtyee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWNvZnZuenBoc3RjZ2p0eWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTYzMDMsImV4cCI6MjA1MDE5MjMwM30.KLcbVgknSXqcFHafSRE8LHMIR7F6vxWknp3_QVFQLAQ'
);

const STRIPE_LINKS = {
  'Yoga Kurs': 'https://buy.stripe.com/test_xxx',
  'Pro Coaching': 'https://buy.stripe.com/test_xxx',
  'Meditation App': 'https://buy.stripe.com/test_xxx'
};

export default function App() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('dg_phone');
    if (saved) setPhone(saved);
    const savedEmail = localStorage.getItem('dg_email');
    if (savedEmail) setEmail(savedEmail);
    const savedAddr = localStorage.getItem('dg_address');
    if (savedAddr) setAddress(savedAddr);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true).order('price');
    if (data) setProducts(data);
  };

  const saveCustomer = async () => {
    localStorage.setItem('dg_phone', phone);
    localStorage.setItem('dg_email', email);
    localStorage.setItem('dg_address', address);

    let cust = customer;
    if (!cust) {
      const { data: existing } = await supabase.from('customers').select('*').eq('phone', phone).single();
      if (existing) {
        cust = existing;
        await supabase.from('customers').update({ email, address }).eq('id', existing.id);
      } else {
        const { data: newCust } = await supabase.from('customers').insert([
          { phone, email, address, plz_city: '', name: phone }
        ]).select().single();
        cust = newCust;
      }
      setCustomer(cust);
    }
    return cust;
  };

  const handleFreeOrder = async (product) => {
    if (!phone || !email || !address) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }
    setLoading(true);
    const cust = await saveCustomer();
    if (cust) {
      await supabase.from('orders').insert([{ customer_id: cust.id, product_id: product.id }]);
    }
    setOrderedProduct(product);
    setSuccess(true);
    setLoading(false);
  };

  const handlePaidOrder = async (product) => {
    if (!phone || !email || !address) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }
    await saveCustomer();
    const link = STRIPE_LINKS[product.name];
    if (link && link !== 'https://buy.stripe.com/test_xxx') {
      window.location.href = link + '?prefilled_email=' + encodeURIComponent(email);
    } else {
      alert('Zahlung wird bald verfügbar sein!');
    }
  };

  if (success) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div style={{background:'white',borderRadius:'1.5rem',padding:'2rem',maxWidth:'20rem',width:'100%',textAlign:'center'}}>
          <div style={{width:'4rem',height:'4rem',background:'#22c55e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
            <Check style={{width:'2rem',height:'2rem',color:'white'}}/>
          </div>
          <h2 style={{fontSize:'1.3rem',fontWeight:'bold',marginBottom:'0.5rem'}}>Bestellt! 🎉</h2>
          <p style={{color:'#666',marginBottom:'0.5rem'}}>{orderedProduct?.emoji} {orderedProduct?.name}</p>
          <p style={{color:'#888',fontSize:'0.85rem',marginBottom:'1rem'}}>📍 {address}</p>
          <button onClick={()=>{setSuccess(false);setOrderedProduct(null);}} style={{padding:'0.75rem 2rem',background:'#22c55e',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',cursor:'pointer'}}>
            Weitere Produkte
          </button>
        </div>
      </div>
    );
  }

  const freeProducts = products.filter(p => !p.price || p.price === 0);
  const paidProducts = products.filter(p => p.price && p.price > 0);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f59e0b,#f97316)',padding:'1rem'}}>
      <div style={{maxWidth:'24rem',margin:'0 auto'}}>
        <div style={{textAlign:'center',color:'white',marginBottom:'1rem'}}>
          <Gift style={{width:'2rem',height:'2rem',margin:'0 auto'}}/>
          <h1 style={{fontSize:'1.5rem',fontWeight:'bold',margin:'0.5rem 0'}}>Do Good 🎁</h1>
          <p style={{opacity:0.9,fontSize:'0.9rem'}}>Gratis & Premium Produkte</p>
        </div>

        <div style={{background:'white',borderRadius:'1.5rem',padding:'1.25rem',marginBottom:'1rem'}}>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem'}}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="📱 Telefon"
              style={{flex:1,padding:'0.7rem',border:'2px solid #eee',borderRadius:'0.75rem',fontSize:'0.9rem',boxSizing:'border-box'}}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="✉️ Email"
              style={{flex:1,padding:'0.7rem',border:'2px solid #eee',borderRadius:'0.75rem',fontSize:'0.9rem',boxSizing:'border-box'}}
            />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="📍 Strasse Nr, PLZ Ort"
            style={{width:'100%',padding:'0.7rem',border:'2px solid #eee',borderRadius:'0.75rem',fontSize:'0.9rem',boxSizing:'border-box'}}
          />
        </div>

        {freeProducts.length > 0 && (
          <div style={{background:'white',borderRadius:'1.5rem',padding:'1.25rem',marginBottom:'1rem'}}>
            <h2 style={{fontSize:'1rem',fontWeight:'bold',marginBottom:'0.75rem',color:'#22c55e'}}>🆓 GRATIS</h2>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {freeProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleFreeOrder(p)}
                  disabled={loading}
                  style={{
                    flex:'1 1 45%',padding:'0.75rem',border:'2px solid #22c55e',
                    borderRadius:'1rem',background:'#f0fdf4',cursor:'pointer',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem'
                  }}
                >
                  <span style={{fontSize:'2rem'}}>{p.emoji}</span>
                  <span style={{fontSize:'0.8rem',fontWeight:'600'}}>{p.name}</span>
                  <span style={{fontSize:'0.75rem',color:'#22c55e',fontWeight:'bold'}}>GRATIS ✓</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {paidProducts.length > 0 && (
          <div style={{background:'white',borderRadius:'1.5rem',padding:'1.25rem'}}>
            <h2 style={{fontSize:'1rem',fontWeight:'bold',marginBottom:'0.75rem',color:'#f59e0b'}}>⭐ PREMIUM</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {paidProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePaidOrder(p)}
                  style={{
                    width:'100%',padding:'0.75rem',border:'2px solid #f59e0b',
                    borderRadius:'1rem',background:'#fffbeb',cursor:'pointer',
                    display:'flex',alignItems:'center',gap:'0.75rem'
                  }}
                >
                  <span style={{fontSize:'1.75rem'}}>{p.emoji}</span>
                  <div style={{flex:1,textAlign:'left'}}>
                    <p style={{fontWeight:'600',fontSize:'0.9rem'}}>{p.name}</p>
                    <p style={{fontSize:'0.75rem',color:'#666'}}>{p.description}</p>
                  </div>
                  <div style={{background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',padding:'0.4rem 0.75rem',borderRadius:'0.5rem',fontWeight:'bold',fontSize:'0.85rem'}}>
                    CHF {p.price}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.8)',marginTop:'1rem',fontSize:'0.75rem'}}>
          🇨🇭 Schweiz · Sichere Zahlung via Stripe
        </p>
      </div>
    </div>
  );
}
