import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

export default function Reports() {
  const [reportType, setReportType] = useState('weekly'); // weekly, monthly, yearly
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch(`/api/reports/${reportType}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Load report error:', err);
        setLoading(false);
      });
  };

  const getDateRange = () => {
    const now = new Date();
    switch (reportType) {
      case 'weekly':
        return `${format(startOfWeek(now, { locale: tr }), 'dd MMM', { locale: tr })} - ${format(endOfWeek(now, { locale: tr }), 'dd MMM yyyy', { locale: tr })}`;
      case 'monthly':
        return format(now, 'MMMM yyyy', { locale: tr });
      case 'yearly':
        return format(now, 'yyyy', { locale: tr });
      default:
        return '';
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { TRY: '₺', EUR: '€', USD: '$' };
    return symbols[currency] || '₺';
  };

  // Prepare chart data
  const statusChartData = stats?.status_breakdown?.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: stats.total_offers > 0 ? Math.round((item.count / stats.total_offers) * 100) : 0
  })) || [];

  const COLORS = {
    'Sent': '#3b82f6',
    'Waiting': '#eab308',
    'Revised': '#a855f7',
    'Approved': '#22c55e',
    'Lost': '#ef4444'
  };

  const revenueChartData = stats?.revenue_by_currency?.map(item => ({
    currency: item.currency,
    revenue: item.total_revenue || 0
  })) || [];

  const agentPerformanceData = stats?.top_agents?.map(agent => ({
    name: agent.agent_name,
    onaylanan: agent.approved_count,
    toplam: agent.total_count
  })) || [];

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          🖨️ Yazdır
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setReportType('weekly')}
            className={`flex-1 px-6 py-4 text-center font-medium ${
              reportType === 'weekly'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📅 Haftalık Rapor
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex-1 px-6 py-4 text-center font-medium ${
              reportType === 'monthly'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Aylık Rapor
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`flex-1 px-6 py-4 text-center font-medium ${
              reportType === 'yearly'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📈 Yıllık Rapor
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Date Range */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {reportType === 'weekly' && '📅 Haftalık Rapor'}
              {reportType === 'monthly' && '📊 Aylık Rapor'}
              {reportType === 'yearly' && '📈 Yıllık Rapor'}
            </h2>
            <p className="text-gray-700 text-lg">{getDateRange()}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Toplam Teklif</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.total_offers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Onaylanan</h3>
              <p className="text-4xl font-bold text-green-600">{stats.approved_offers || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total_offers > 0 ? Math.round((stats.approved_offers / stats.total_offers) * 100) : 0}% başarı
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Bekleyen</h3>
              <p className="text-4xl font-bold text-yellow-600">{stats.pending_offers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Kaybedilen</h3>
              <p className="text-4xl font-bold text-red-600">{stats.lost_offers || 0}</p>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Toplam Gelir (Onaylanan)</h3>
              {stats.revenue_by_currency && stats.revenue_by_currency.length > 0 ? (
                <div className="space-y-3">
                  {stats.revenue_by_currency.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{item.currency}</span>
                      <span className="text-2xl font-bold text-green-600">
                        {getCurrencySymbol(item.currency)}{item.total_revenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Henüz onaylanan teklif yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Potansiyel Gelir (Bekleyen)</h3>
              {stats.potential_revenue_by_currency && stats.potential_revenue_by_currency.length > 0 ? (
                <div className="space-y-3">
                  {stats.potential_revenue_by_currency.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{item.currency}</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {getCurrencySymbol(item.currency)}{item.total_revenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Bekleyen teklif yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Ortalama Teklif Değeri</h3>
              {stats.avg_offer_value_by_currency && stats.avg_offer_value_by_currency.length > 0 ? (
                <div className="space-y-3">
                  {stats.avg_offer_value_by_currency.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{item.currency}</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {getCurrencySymbol(item.currency)}{Math.round(item.avg_value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Veri yok</p>
              )}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Durum Dağılımı</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.status_breakdown && stats.status_breakdown.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-600 mt-2 capitalize">{item.status}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total_offers > 0 ? Math.round((item.count / stats.total_offers) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart - Status Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Durum Dağılımı Grafiği</h3>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">Veri yok</p>
              )}
            </div>

            {/* Bar Chart - Revenue by Currency */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">💰 Para Birimi Bazında Gelir</h3>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="currency" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#22c55e" name="Gelir" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">Veri yok</p>
              )}
            </div>
          </div>

          {/* Agent Performance Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Temsilci Performans Grafiği</h3>
            {agentPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="toplam" fill="#3b82f6" name="Toplam Teklif" />
                  <Bar dataKey="onaylanan" fill="#22c55e" name="Onaylanan" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">Veri yok</p>
            )}
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 En Başarılı Temsilciler</h3>
              {stats.top_agents && stats.top_agents.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</span>
                        <span className="font-medium">{agent.agent_name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{agent.approved_count} onaylı</p>
                        <p className="text-sm text-gray-500">{agent.total_count} toplam</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Veri yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏢 En Çok Teklif Verilen Firmalar</h3>
              {stats.top_companies && stats.top_companies.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_companies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{company.company_name}</span>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{company.offer_count} teklif</p>
                        <p className="text-sm text-gray-500">{company.approved_count} onaylı</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Veri yok</p>
              )}
            </div>
          </div>

          {/* Guest & Room Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Toplam Misafir</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.total_guests?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Onaylanan tekliflerde</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏨 Toplam Oda</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.total_rooms?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Onaylanan tekliflerde</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Ortalama Grup Büyüklüğü</h3>
              <p className="text-4xl font-bold text-indigo-600">
                {stats.total_guests && stats.approved_offers 
                  ? Math.round(stats.total_guests / stats.approved_offers) 
                  : 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">Kişi/teklif</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
