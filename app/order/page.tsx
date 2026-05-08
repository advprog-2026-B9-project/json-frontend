"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. TAMPILIN PRODUCT DARI DB
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/products');
                setProducts(response.data);
            } catch (error) {
                console.error("Gagal ambil produk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleCheckout = async (product: { id: any; ownerId: any; price: any; }) => {
        const orderData = {
            productId: product.id,
            titiperId: "ISI_UUID_SULTAN_KAMU", // UUID User yang lagi login
            jastiperId: product.ownerId, // UUID Penjual
            quantity: 1,
            totalPrice: product.price,
            shippingAddress: "Depok, Jawa Barat"
        };

        try {
            const res = await axios.post('http://localhost:8080/api/orders/checkout', orderData);
            alert("Checkout Berhasil! Saldo & Stok otomatis terpotong.");
            // Refresh data produk supaya stok terbaru kelihatan
            window.location.reload(); 
        } catch (err) {
            alert("Checkout Gagal: " + (err.response?.data?.message || "Cek saldo atau stok!"));
        }
    };

    if (loading) return <p>Loading barang-barang kece...</p>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Katalog Produk JSON Platform</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div key={product.id} className="border p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">{product.name}</h2>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="font-bold text-blue-600">Rp {product.price}</p>
                        <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                        
                        <button 
                            onClick={() => handleCheckout(product)}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                        >
                            Beli Sekarang
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}