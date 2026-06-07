import React, { useState } from 'react';

const API_URL = 'https://chokka-server.onrender.com';

const adminFetch = (url, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  const { headers: existingHeaders, ...restOpts } = opts;
  return fetch(url, {
    ...restOpts,
    headers: { 'Authorization': `Bearer ${token}`, ...(existingHeaders || {}) }
  });
};

export default function FraudBadge({ order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const fraudData = order.fraud_data;

  const handleCheck = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/fraud-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: order.customer_phone })
      });
      const result = await res.json();

      await adminFetch(`${API_URL}/api/orders/${order.id}/fraud`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fraud_data: result })
      });

      onUpdate(order.id, result);
    } catch (e) {
      console.error('Fraud check error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!fraudData) {
    return (
      <button
        onClick={handleCheck}
        disabled={loading}
        title="Fraud Check"
        className="mt-1 text-[9px] font-black bg-gray-100 text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 leading-tight"
      >
        {loading ? (
          <span className="inline-block animate-spin">↻</span>
        ) : 'FC'}
      </button>
    );
  }

  const rate = (fraudData.successRate !== null && fraudData.successRate !== undefined)
    ? Math.round(fraudData.successRate)
    : null;

  if (rate === null) {
    return (
      <div className="mt-1 text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded inline-block leading-tight">
        No Data
      </div>
    );
  }

  const colorClass = rate >= 80
    ? 'text-green-700 bg-green-50 border-green-200'
    : rate >= 50
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className={`mt-1 inline-flex items-center gap-1 text-[9px] border px-1.5 py-0.5 rounded leading-tight ${colorClass}`}>
      <span><span className="opacity-50 font-normal">O-</span><span className="font-black">{fraudData.total}</span></span>
      <span className="opacity-30">|</span>
      <span><span className="opacity-50 font-normal">R-</span><span className="font-black">{fraudData.success}</span></span>
      <span className="opacity-30">|</span>
      <span><span className="opacity-50 font-normal">%-</span><span className="font-black">{rate}%</span></span>
    </div>
  );
}
