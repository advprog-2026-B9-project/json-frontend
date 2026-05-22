"use client";
import { useState, useEffect } from 'react';
import OrderCard from '@/components/OrderCard';

export default function JastiperDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('PAID');

  const fetchOrders = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const res = await fetch(`http://localhost:8080/api/orders/jastiper/${user.id}`);
      const data = await res.json();
      setOrders(data);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter((o: any) => o.status === activeTab);

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-black">Dashboard Jastiper</h1>
      
      {/* Navigasi Tab */}
      <div className="flex space-x-4 mb-6 border-b">
        {['PAID', 'SHIPPED', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-2 transition ${activeTab === tab ? 'border-b-4 border-blue-600 text-blue-600 font-bold' : 'text-gray-400'}`}
          >
            {tab === 'PAID' ? 'Perlu Diproses' : tab === 'SHIPPED' ? 'Dikirim' : 'Selesai'}
          </button>
        ))}
      </div>

      {/* List Order */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => (
            <OrderCard key={order.id} order={order} onRefresh={fetchOrders} />
          ))
        ) : (
          <p className="text-gray-400 text-center mt-10">Belum ada pesanan di kategori ini.</p>
        )}
      </div>
    </div>
  );
}