import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Gift } from 'lucide-react';

const supabase = createClient(
  'https://bwqcofvnzphstcgjtyee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWNvZnZuenBoc3RjZ2p0eWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTYzMDMsImV4cCI6MjA1MDE5MjMwM30.KLcbVgknSXqcFHafSRE8LHMIR7F6vxWknp3_QVFQLAQ'
);

export default function App() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selected, setSelected] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    const { data } = await supabase.from('products').select('*').eq('active', true);
    if (data) setProducts(data);
  };

  const handleOrder = async () => {
    if (!phone || !email || !address || !selected) return;
    setLoading(true);
    
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

    if (cust) {
      await supabase.from('orders').insert([{ customer_id: cust.id, product_id: selected.id }]);
    }
    
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div style={{background:'white',borderRadius:'1.5rem',padding:'2rem',maxWidth:'20rem',width:'100%',textAlign:'center'}}>
          <div style={{width:'4rem',height:'4rem',background:'#22c55e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
            <Check style={{width:'2rem',height:'2rem',color:'white'}}/>
          </div>
          <h2 style={{fontSize:'1.3rem',fontWeight:'bold',marginBottom:'0.5rem'}}>Bestellt! 🎉</h2>
          <p style={{color:'#666',marginBottom:'0.5rem'}}>{selected?.emoji} {selected?.name}</p>
          <p style={{color:'#888',fontSize:'0.85rem',marginBottom:'1rem'}}>📍 {address}</p>
          <button onClick={()=>{setSuccess(false);setSelected(null);}} style={{padding:'0.75rem 2rem',background:'#22c55e',color:'white',border:'none',borderRadius:'1rem',fontWeight:'bold',cursor:'pointer'}}>
            Nochmal bestellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f59e0b,#f97316)',padding:'1rem'}}>
      <div style={{maxWidth:'22rem',margin:'0 auto'}}>
        <div style={{textAlign:'center',color:'white',marginBottom:'1rem'}}>
          <Gift style={{width:'2rem',height:'2rem',margin:'0 auto'}}/>
          <h1 style={{fontSize:'1.5rem',fontWeight:'bold',margin:'0.5rem 0'}}>Do Good 🎁</h1>
          <p style={{opacity:0.9,fontSize:'0.9rem'}}>Gratis für dich!</p>
        </div>

        <div style={{background:'white',borderRadius:'1.5rem',padding:'1.25rem'}}>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem'}}>
            <input
              type="tel"
