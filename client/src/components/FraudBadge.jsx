import React, { useState } from 'react';

const API_URL = 'https://chokka-server.onrender.com';
const FRAUDBD_KEY = 'bb9499e03e7630a475de667b83b8b4ef1850c6b325bb0f757826d3d5ee73d6df';

const adminFetch = (url, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  const { headers: existingHeaders, ...restOpts } = opts;
  return fetch(url, {
    ...restOpts,
    headers: { 'Authorization': `Bearer ${token}`, ...(existingHeaders || {}) }
  });
};

const normalizePhone = (phone) => {
  let cleaned = String(phone || '').replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+880')) cleaned = '0' + cleaned.slice(4);
  else if (cleaned.startsWith('880') && cleaned.length === 13) cleaned = '0' + cleaned.slice(3);
  return cleaned;
};

export default function FraudBadge({ order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const fraudData = order.fraud_data;

  const handleCheck = async () => {
    setLoading(true);
    try {
      const phone = normalizePhone(order.customer_phone);

      // Call FraudBD directly from the browser — avoids server-IP blocking
      const fraudRes = await fetch('https://fraudbd.com/api/check-courier-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api_key': FRAUDBD_KEY },
        body: JSON.stringify({ phone_number: phone })
      });
      const fraudJson = await fraudRes.json();
      console.log('[FraudBadge] FraudBD raw response:', fraudJson);

      let result;
      if (fraudJson.status && fraudJson.data?.totalSummary) {
        result = fraudJson.data.totalSummary;
      } else {
        console.warn('[FraudBadge] FraudBD error:', fraudJson.message);
        result = { total: 0, success: 0, successRate: null };
      }

      // Save to DB via our server
      await adminFetch(`${API_URL}/api/orders/${order.id}/fraud`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fraud_data: result })
      });

      onUpdate(order.id, result);
    } catch (e) {
      console.error('[FraudBadge] Error:', e);
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
