import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Area
} from 'recharts';
import {
  TrendingUp, Package, ShoppingCart, CheckCircle, XCircle, Clock, Percent,
  BarChart3, Calendar, Download, ChevronDown, DollarSign, Target, Layers,
  RefreshCw, AlertCircle, TrendingDown, Award, Filter
} from 'lucide-react';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
  Pending: '#eab308',
  Assigned: '#3b82f6',
  Dispatched: '#8b5cf6',
  Hold: '#f97316',
  Unassigned: '#6b7280',
  'Partial Delivered': '#10b981',
};

const SYNDICATE_COLOR = '#6366f1';
const TONG_COLOR = '#f59e0b';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  '৳' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtShort = (n) => {
  const v = Number(n || 0);
  if (v >= 100000) return '৳' + (v / 100000).toFixed(1) + 'L';
  if (v >= 1000) return '৳' + (v / 1000).toFixed(1) + 'k';
  return '৳' + v.toFixed(2);
};

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const getOrderDate = (o) => (o.created_at || '').split('T')[0];

const getProductLabel = (productId, products) => {
  const p = products.find(pr => pr.id === (productId || 1));
  return p ? p.title : 'Syndicate';
};

const getProductType = (productId, products) => {
  const name = getProductLabel(productId, products).toLowerCase();
  if (name.includes('bundle')) return 'bundle';
  if (name.includes('tong') || name.includes('টং')) return 'tong';
  return 'syndicate';
};

const isDelivered = (s) => s && s.toLowerCase().includes('delivered');
const isCancelled = (s) => s && s.toLowerCase().includes('cancelled');
const isPending = (s) => {
  if (!s) return true;
  const sl = s.toLowerCase();
  return sl === '' || sl === 'pending' || sl === 'pickup pending';
};

// ─── DATE FILTER PRESETS ──────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Today', key: 'today' },
  { label: 'Last 3 Days', key: '3d' },
  { label: 'Last 7 Days', key: '7d' },
  { label: 'Last Month', key: '30d' },
  { label: 'Custom', key: 'custom' },
];

// ─── SKELETON ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, icon: Icon, color = 'text-gray-900', bg = 'bg-white', loading }) => (
  <div className={`${bg} border-2 border-black p-4 shadow-md flex flex-col gap-1 min-w-0`}>
    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
      {Icon && <Icon size={13} />} {label}
    </div>
    {loading ? (
      <Skeleton className="h-8 w-24 mt-1" />
    ) : (
      <div className={`text-2xl font-black leading-tight ${color} truncate`}>{value}</div>
    )}
    {sub && !loading && <div className="text-[10px] text-gray-400 font-bold">{sub}</div>}
  </div>
);

// ─── DONUT CHART LABEL ────────────────────────────────────────────────────────

const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── MAIN ANALYTICS DASHBOARD ─────────────────────────────────────────────────

export default function AnalyticsDashboard({ orders, products }) {
  const [preset, setPreset] = useState('7d');
  const [customStart, setCustomStart] = useState(daysAgo(7));
  const [customEnd, setCustomEnd] = useState(today());
  const [cogsInput, setCogsInput] = useState({ syndicate: 0, tong: 0 }); // editable COGS per unit
  const [ordersPage, setOrdersPage] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderProductFilter, setOrderProductFilter] = useState('All');
  const [loading] = useState(false);

  const ORDERS_PER_PAGE = 15;

  // ─── DERIVED DATE RANGE ─────────────────────────────────────────────────────
  const { startDate, endDate } = useMemo(() => {
    if (preset === 'today') return { startDate: today(), endDate: today() };
    if (preset === '3d') return { startDate: daysAgo(2), endDate: today() };
    if (preset === '7d') return { startDate: daysAgo(6), endDate: today() };
    if (preset === '30d') return { startDate: daysAgo(29), endDate: today() };
    return { startDate: customStart, endDate: customEnd };
  }, [preset, customStart, customEnd]);

  // ─── FILTER ORDERS BY DATE ──────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = getOrderDate(o);
      return d >= startDate && d <= endDate;
    });
  }, [orders, startDate, endDate]);

  // ─── ANALYTICS CALCULATIONS ─────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const nonCancelled = filteredOrders.filter(o => !isCancelled(o.status));
    const delivered = filteredOrders.filter(o => isDelivered(o.status));
    const cancelled = filteredOrders.filter(o => isCancelled(o.status));
    const pending = filteredOrders.filter(o => isPending(o.status));
    const inTransit = filteredOrders.filter(o => {
      const s = (o.status || '').toLowerCase();
      return s === 'assigned' || s === 'dispatched' || s === 'unassigned' || s === 'hold';
    });

    const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total_price || 0), 0);
    const totalOrders = filteredOrders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Product splits
    let syndicateUnits = 0, tongUnits = 0, syndicateRevenue = 0, tongRevenue = 0;
    filteredOrders.forEach(o => {
      const type = getProductType(o.product_id, products);
      const qty = Number(o.quantity || 1);
      const rev = Number(o.total_price || 0);
      if (type === 'bundle') {
        syndicateUnits += qty;
        tongUnits += qty;
        syndicateRevenue += rev / 2;
        tongRevenue += rev / 2;
      } else if (type === 'tong') {
        tongUnits += qty;
        tongRevenue += rev;
      } else {
        syndicateUnits += qty;
        syndicateRevenue += rev;
      }
    });
    const totalUnits = syndicateUnits + tongUnits;

    // Profit: revenue - (total COGS per product)
    const totalCOGS = syndicateUnits * Number(cogsInput.syndicate || 0) + tongUnits * Number(cogsInput.tong || 0);
    const totalProfit = totalRevenue - totalCOGS;

    // Cancellation and delivery rates
    const cancellationRate = totalOrders > 0 ? (cancelled.length / totalOrders) * 100 : 0;
    const deliverySuccessRate = totalOrders > 0 ? (delivered.length / totalOrders) * 100 : 0;

    // Status breakdown for donut chart
    const statusMap = {};
    filteredOrders.forEach(o => {
      let s = o.status || 'Pending';
      if (isPending(o.status)) s = 'Pending';
      else if (isDelivered(o.status)) s = 'Delivered';
      else if (isCancelled(o.status)) s = 'Cancelled';
      else if (['Assigned', 'Dispatched', 'Unassigned', 'Hold'].includes(s)) { /* keep */ }
      else s = 'Other';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Daily trend data
    const dayCount = Math.min(
      Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1,
      60
    );
    const dailyMap = {};
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }
    filteredOrders.forEach(o => {
      const d = getOrderDate(o);
      if (dailyMap[d]) {
        dailyMap[d].revenue += Number(o.total_price || 0);
        dailyMap[d].orders += 1;
      }
    });
    const trendData = Object.values(dailyMap).map(d => ({
      ...d,
      dateLabel: d.date.slice(5), // MM-DD
    }));

    // Top 5 performing days by revenue
    const topDays = [...trendData]
      .filter(d => d.orders > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((d, i) => ({
        rank: i + 1,
        date: d.date,
        revenue: d.revenue,
        orders: d.orders,
        units: filteredOrders
          .filter(o => getOrderDate(o) === d.date)
          .reduce((s, o) => s + Number(o.quantity || 1), 0),
      }));

    return {
      totalRevenue, totalOrders, aov, totalUnits, totalProfit, totalCOGS,
      syndicateUnits, tongUnits, syndicateRevenue, tongRevenue,
      delivered, cancelled, pending, inTransit,
      cancellationRate, deliverySuccessRate,
      statusData, trendData, topDays,
    };
  }, [filteredOrders, products, cogsInput]);

  // ─── RECENT ORDERS TABLE ───────────────────────────────────────────────────
  const tableOrders = useMemo(() => {
    return filteredOrders
      .filter(o => {
        const productMatch = orderProductFilter === 'All' ||
          getProductType(o.product_id, products) === orderProductFilter.toLowerCase() ||
          (orderProductFilter === 'bundle' && getProductType(o.product_id, products) === 'bundle');
        const statusMatch = orderStatusFilter === 'All' ||
          (orderStatusFilter === 'Delivered' && isDelivered(o.status)) ||
          (orderStatusFilter === 'Cancelled' && isCancelled(o.status)) ||
          (orderStatusFilter === 'Pending' && isPending(o.status)) ||
          (o.status === orderStatusFilter);
        return productMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [filteredOrders, products, orderStatusFilter, orderProductFilter]);

  const totalPages = Math.ceil(tableOrders.length / ORDERS_PER_PAGE);
  const pagedOrders = tableOrders.slice(ordersPage * ORDERS_PER_PAGE, (ordersPage + 1) * ORDERS_PER_PAGE);

  // ─── CSV EXPORT ─────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ['Order ID', 'Customer Name', 'Product', 'Qty', 'Amount (BDT)', 'Status', 'Date'];
    const rows = tableOrders.map(o => [
      o.id,
      `"${o.customer_name}"`,
      `"${getProductLabel(o.product_id, products)}"`,
      o.quantity || 1,
      o.total_price,
      o.status || 'Pending',
      getOrderDate(o),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chokka-orders-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tableOrders, products, startDate, endDate]);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-mono text-sm">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-3xl font-black tracking-tight">ANALYTICS</h2>
        <div className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-300 px-3 py-1.5">
          Showing: <span className="text-black">{startDate}</span> → <span className="text-black">{endDate}</span>
        </div>
      </div>

      {/* ── STICKY DATE FILTER BAR ── */}
      <div className="sticky top-0 z-10 bg-gray-100 border-2 border-black shadow-md mb-8 p-3 flex flex-wrap gap-2 items-center">
        <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1 mr-2">
          <Calendar size={14} /> Filter
        </span>
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => { setPreset(p.key); setOrdersPage(0); }}
            className={`px-3 py-1.5 font-bold text-xs border-2 transition-all ${
              preset === p.key
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-300 hover:border-black'
            }`}
          >
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={e => { setCustomStart(e.target.value); setOrdersPage(0); }}
              className="border-2 border-black p-1.5 text-xs font-bold bg-white"
            />
            <span className="font-bold text-gray-400">→</span>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today()}
              onChange={e => { setCustomEnd(e.target.value); setOrdersPage(0); }}
              className="border-2 border-black p-1.5 text-xs font-bold bg-white"
            />
          </div>
        )}
      </div>

      {/* ── KPI CARDS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Total Revenue" value={fmt(analytics.totalRevenue)} icon={TrendingUp} color="text-green-700" bg="bg-green-50" loading={loading} />
        <KpiCard label="Total Profit" value={fmt(analytics.totalProfit)} sub={analytics.totalCOGS > 0 ? `COGS: ${fmt(analytics.totalCOGS)}` : 'Set COGS ↓'} icon={DollarSign} color={analytics.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-600'} loading={loading} />
        <KpiCard label="Total Orders" value={analytics.totalOrders} icon={ShoppingCart} color="text-blue-700" loading={loading} />
        <KpiCard label="Games Sold" value={analytics.totalUnits} sub={`Syn: ${analytics.syndicateUnits} · Tong: ${analytics.tongUnits}`} icon={Package} color="text-indigo-700" loading={loading} />
        <KpiCard label="Syndicate Units" value={analytics.syndicateUnits} icon={Layers} color="text-indigo-600" loading={loading} />
        <KpiCard label="Tong Units" value={analytics.tongUnits} icon={Layers} color="text-amber-600" loading={loading} />
        <KpiCard label="Avg. Order Value" value={fmt(analytics.aov)} icon={Target} color="text-purple-700" loading={loading} />
        <KpiCard label="Delivered" value={analytics.delivered.length} icon={CheckCircle} color="text-green-700" bg="bg-green-50" loading={loading} />
        <KpiCard label="Cancelled" value={analytics.cancelled.length} icon={XCircle} color="text-red-600" bg="bg-red-50" loading={loading} />
        <KpiCard label="Pending / Transit" value={`${analytics.pending.length + analytics.inTransit.length}`} sub={`Pending: ${analytics.pending.length} · Transit: ${analytics.inTransit.length}`} icon={Clock} color="text-yellow-700" loading={loading} />
        <KpiCard label="Cancellation Rate" value={`${analytics.cancellationRate.toFixed(2)}%`} icon={Percent} color={analytics.cancellationRate > 20 ? 'text-red-600' : 'text-gray-700'} loading={loading} />
        <KpiCard label="Delivery Rate" value={`${analytics.deliverySuccessRate.toFixed(2)}%`} icon={Award} color={analytics.deliverySuccessRate > 70 ? 'text-green-700' : 'text-orange-600'} loading={loading} />
      </div>

      {/* ── ROW: STATUS DONUT + PRODUCT PERFORMANCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Order Status Breakdown */}
        <div className="bg-white border-2 border-black shadow-md p-6">
          <h3 className="font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Order Status Breakdown
          </h3>
          {analytics.statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 font-bold text-sm">No orders in this period</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={DonutLabel}
                  >
                    {analytics.statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value, entry) => (
                      <span className="text-xs font-bold">{value} ({entry.payload.value})</span>
                    )}
                  />
                  <Tooltip formatter={(v) => [`${v} orders`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {analytics.statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.name] || '#9ca3af' }} />
                    <span className="truncate text-gray-600">{s.name}</span>
                    <span className="ml-auto font-black">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Performance */}
        <div className="bg-white border-2 border-black shadow-md p-6">
          <h3 className="font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
            <Layers size={16} /> Product Performance
          </h3>
          {analytics.totalUnits === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 font-bold text-sm">No sales in this period</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-50 border-2 border-indigo-300 p-4">
                  <div className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-1">Syndicate</div>
                  <div className="text-2xl font-black text-indigo-700">{analytics.syndicateUnits} <span className="text-sm font-bold">units</span></div>
                  <div className="text-sm font-bold text-indigo-500">{fmt(analytics.syndicateRevenue)}</div>
                  <div className="text-[10px] font-bold text-gray-500 mt-1">
                    {analytics.totalUnits > 0 ? ((analytics.syndicateUnits / analytics.totalUnits) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
                <div className="bg-amber-50 border-2 border-amber-300 p-4">
                  <div className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">Tong (টং)</div>
                  <div className="text-2xl font-black text-amber-700">{analytics.tongUnits} <span className="text-sm font-bold">units</span></div>
                  <div className="text-sm font-bold text-amber-500">{fmt(analytics.tongRevenue)}</div>
                  <div className="text-[10px] font-bold text-gray-500 mt-1">
                    {analytics.totalUnits > 0 ? ((analytics.tongUnits / analytics.totalUnits) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={[
                  { name: 'Units', Syndicate: analytics.syndicateUnits, 'Tong (টং)': analytics.tongUnits },
                  { name: 'Revenue (÷100)', Syndicate: analytics.syndicateRevenue / 100, 'Tong (টং)': analytics.tongRevenue / 100 },
                ]} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v, name) => name.includes('Revenue') ? [`${(v * 100).toFixed(0)}`, name] : [v, name]}
                  />
                  <Bar dataKey="Syndicate" fill={SYNDICATE_COLOR} radius={[2,2,0,0]} />
                  <Bar dataKey="Tong (টং)" fill={TONG_COLOR} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* ── REVENUE & ORDERS TREND CHART ── */}
      <div className="bg-white border-2 border-black shadow-md p-6 mb-8">
        <h3 className="font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Revenue & Orders Trend
        </h3>
        {analytics.trendData.every(d => d.orders === 0) ? (
          <div className="h-56 flex items-center justify-center text-gray-400 font-bold text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                interval={Math.max(0, Math.floor(analytics.trendData.length / 10) - 1)}
              />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fontSize: 10 }}
                tickFormatter={v => fmtShort(v)}
              />
              <YAxis
                yAxisId="ord"
                orientation="right"
                tick={{ fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === 'Revenue (৳)' ? [fmt(value), name] : [value, name]
                }
              />
              <Legend />
              <Area
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                name="Revenue (৳)"
                fill="#d1fae5"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="ord"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── ROW: TOP DAYS + PROFIT ANALYSIS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Top 5 Performing Days */}
        <div className="bg-white border-2 border-black shadow-md p-6">
          <h3 className="font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
            <Award size={16} /> Top 5 Performing Days
          </h3>
          {analytics.topDays.length === 0 ? (
            <div className="py-10 text-center text-gray-400 font-bold text-sm">No data in this period</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-gray-100">
                <tr>
                  <th className="p-2 text-[10px] font-black uppercase">#</th>
                  <th className="p-2 text-[10px] font-black uppercase">Date</th>
                  <th className="p-2 text-[10px] font-black uppercase">Revenue</th>
                  <th className="p-2 text-[10px] font-black uppercase">Orders</th>
                  <th className="p-2 text-[10px] font-black uppercase">Units</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topDays.map(d => (
                  <tr key={d.date} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-black text-gray-400">#{d.rank}</td>
                    <td className="p-2 font-bold text-sm">{d.date}</td>
                    <td className="p-2 font-black text-green-700">{fmt(d.revenue)}</td>
                    <td className="p-2 font-bold">{d.orders}</td>
                    <td className="p-2 font-bold">{d.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Profit Analysis */}
        <div className="bg-white border-2 border-black shadow-md p-6">
          <h3 className="font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
            <DollarSign size={16} /> Profit Analysis
          </h3>
          <div className="bg-yellow-50 border-2 border-yellow-300 p-3 mb-4">
            <div className="text-[10px] font-black uppercase text-yellow-700 mb-2">Set Cost Per Unit (COGS)</div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-[10px] font-black text-gray-500 block mb-1">Syndicate (৳/unit)</label>
                <input
                  type="number"
                  value={cogsInput.syndicate}
                  onChange={e => setCogsInput(v => ({ ...v, syndicate: e.target.value }))}
                  className="border-2 border-yellow-300 p-1.5 w-24 font-black text-sm focus:border-black outline-none bg-white"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 block mb-1">Tong (৳/unit)</label>
                <input
                  type="number"
                  value={cogsInput.tong}
                  onChange={e => setCogsInput(v => ({ ...v, tong: e.target.value }))}
                  className="border-2 border-yellow-300 p-1.5 w-24 font-black text-sm focus:border-black outline-none bg-white"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-gray-600 text-sm">Total Revenue</span>
              <span className="font-black text-green-700">{fmt(analytics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-gray-600 text-sm">Total COGS</span>
              <span className="font-black text-red-600">-{fmt(analytics.totalCOGS)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 border-2 border-black">
              <span className="font-black uppercase tracking-wider text-sm">Net Profit</span>
              <span className={`font-black text-xl ${analytics.totalProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {analytics.totalProfit >= 0 ? '+' : ''}{fmt(analytics.totalProfit)}
              </span>
            </div>
            {analytics.totalRevenue > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-500">Profit Margin</span>
                <span className="font-black">
                  {((analytics.totalProfit / analytics.totalRevenue) * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECENT ORDERS TABLE ── */}
      <div className="bg-white border-2 border-black shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h3 className="font-black text-base uppercase tracking-tight flex items-center gap-2">
            <Package size={16} /> Recent Orders
            <span className="text-gray-400 font-bold text-sm">({tableOrders.length})</span>
          </h3>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Status filter */}
            <div className="flex items-center gap-1">
              <Filter size={12} className="text-gray-400" />
              <select
                value={orderStatusFilter}
                onChange={e => { setOrderStatusFilter(e.target.value); setOrdersPage(0); }}
                className="border-2 border-gray-300 p-1.5 text-xs font-bold bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Assigned">Assigned</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Hold">Hold</option>
              </select>
            </div>
            <select
              value={orderProductFilter}
              onChange={e => { setOrderProductFilter(e.target.value); setOrdersPage(0); }}
              className="border-2 border-gray-300 p-1.5 text-xs font-bold bg-white"
            >
              <option value="All">All Products</option>
              <option value="syndicate">Syndicate</option>
              <option value="tong">Tong</option>
              <option value="bundle">Bundle</option>
            </select>
            <button
              onClick={exportCSV}
              className="bg-black text-white px-3 py-1.5 font-bold text-xs hover:bg-gray-800 flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 border-b-2 border-black text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400 font-bold">
                    No orders match this filter for the selected date range.
                  </td>
                </tr>
              ) : (
                pagedOrders.map(o => {
                  const type = getProductType(o.product_id, products);
                  return (
                    <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-400">#{o.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-sm">{o.customer_name}</div>
                        <div className="text-[10px] text-gray-400">{o.customer_phone}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                          type === 'tong' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          type === 'bundle' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {getProductLabel(o.product_id, products)}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{o.quantity || 1}</td>
                      <td className="p-3 font-black">{fmt(o.total_price)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${
                          isDelivered(o.status) ? 'bg-green-100 text-green-800' :
                          isCancelled(o.status) ? 'bg-red-100 text-red-800' :
                          isPending(o.status) ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3 text-xs font-bold text-gray-500">{getOrderDate(o)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 border-t pt-4">
            <span className="text-xs font-bold text-gray-500">
              Page {ordersPage + 1} of {totalPages} · {tableOrders.length} orders
            </span>
            <div className="flex gap-2">
              <button
                disabled={ordersPage === 0}
                onClick={() => setOrdersPage(p => p - 1)}
                className="px-3 py-1.5 border-2 border-gray-300 font-bold text-xs disabled:opacity-40 hover:border-black"
              >
                ← Prev
              </button>
              <button
                disabled={ordersPage >= totalPages - 1}
                onClick={() => setOrdersPage(p => p + 1)}
                className="px-3 py-1.5 border-2 border-gray-300 font-bold text-xs disabled:opacity-40 hover:border-black"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
