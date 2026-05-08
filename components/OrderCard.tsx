"use client";

interface OrderProps {
  order: {
    id: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    status: string;
  };
  onRefresh: () => void; // Fungsi buat manggil ulang data setelah action
}

export default function OrderCard({ order, onRefresh }: OrderProps) {
  
  const handleCancel = async () => {
    if (confirm("Yakin ingin membatalkan? Saldo pembeli akan di-refund otomatis.")) {
      const res = await fetch(`http://localhost:8080/api/orders/${order.id}/cancel`, {
        method: 'PATCH',
      });
      if (res.ok) {
        alert("Refund Berhasil!");
        onRefresh();
      }
    }
  };

  return (
    <div className="flex justify-between items-center p-4 mb-4 bg-white border rounded-xl shadow-sm">
      <div>
        <h3 className="font-bold text-lg text-black">{order.productName || "Barang Jastip"}</h3>
        <p className="text-gray-600">Jumlah: {order.quantity} | Total: Rp{order.totalPrice.toLocaleString()}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
      </div>
      
      {order.status === 'PAID' && (
        <button 
          onClick={handleCancel}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
        >
          Cancel & Refund
        </button>
      )}
    </div>
  );
}