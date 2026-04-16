'use client';

import React, { useState } from 'react';
import styles from './order.module.css';

export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setStatusMsg('Processing payment...');
    setIsSuccess(false);

    const orderPayload = {
      titiperId: 2,     
      jastiperId: 14,
      productId: "5ef0aa65-bebf-4280-a307-972b900dcc64",
      quantity: 1,
      totalPrice: 25000,
      shippingAddress: "Fasilkom UI"
    };

    try {
      const response = await fetch('https://json-backend-b09.taila1e039.ts.net/api/orders/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        setIsSuccess(true);
        setStatusMsg('✅ Payment successfully processed!');
      } else {
        const errorData = await response.text();
        setIsSuccess(false);
        setStatusMsg(`❌ Payment failed: ${errorData || 'Unknown error'}`);
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMsg('⚠️ Connection error. Server might be down or unreachable.');
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orderBox}>
        
        {}
        <div className={styles.logoContainer}>
          <h1 className={styles.logoText}>json</h1>
        </div>
        
        <h2 className={styles.titleText}>Order Confirmation</h2>

        <div className={styles.detailsContainer}>
          <div className={styles.detailRow}>
            <span>Item</span>
            <span>Jastip Cargo Service</span>
          </div>
          <div className={styles.detailRow}>
            <span>Quantity</span>
            <span>1 unit</span>
          </div>
          <div className={`${styles.detailRow} ${styles.totalPrice}`}>
            <span>Total</span>
            <span>Rp 25.000</span>
          </div>
        </div>

        <button 
          className={styles.paymentButton}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        {statusMsg && (
          <div 
            className={styles.statusMsg}
            style={{ color: isSuccess ? '#059669' : '#dc2626' }}
          >
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}