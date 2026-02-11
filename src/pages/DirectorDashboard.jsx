import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function DirectorDashboard() {
  const [kpi, setKpi] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [agents, setAgents] = useState([]);
  const [lostReasons, setLostReasons] = useState([]);
  const [discipline, setDiscipline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [kpiRes, pipelineRes, revenueRes, agentsRes, lostRes, disciplineRes] = await Promise.all([
        fetch('/api/dashboard/director/kpi', { headers }),
        fetch('/api/dashboard/director/pipeline', { headers }),
        fetch('/api/dashboard/director/revenue?year=2025', { headers }),
        fetch('/api/dashboard/director/agents', { headers }),
        fetch('/api/dashboard/director/lost-reasons', { headers }),
        fetch('/api/dashboard/director/followup-discipline', { headers })
      ]);

      setKpi(await kpiRes.json());
      setPipeline(await pipelineRes.json());
      setRevenue(await revenueRes.json());
      setAgents(await agentsRes.json());
      setLostReasons(await lostRes.json());
      setDiscipline(await disciplineRes.json());
    } catch (err) {
      console.error('Load director dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
  }

  const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#ef4444'];
  
  const pipelineData = pipeline ? [
    { name: 'Gönderildi', value: pipeline.sent, color: '#3b82f6' },
    { name: 'Bekliyor', value: pipeline.waiting, color: '#eab308' },
    { name: 'Revize', value: pipeline.revised, color: '#a855f7' },
    { name: 'Onaylandı', value: pipeline.approved, color: '#22c55e' },
    { name: 'Kaybedildi', value: pipeline.lost, color: '#ef4444' }
  ] : [];

  const disciplineData = discipline ? [
    { name: 'Zamanında', value: discipline.onTime, color: '#22c55e' },
    { name: 'Geç', value: discipline.late, color: '#ef4444' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎯 Satış Direktörü Dashboard</h1>
        <button
          onClick={loadAllData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          🔄 Yenile
        </button>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <p className="text-sm opacity-90">Toplam Pipeline</p>
          <p className="text-3xl font-bold mt-2">₺{kpi?.totalPipelineValue?.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">Potansiyel gelir</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <p className="text-sm opacity-90">Onaylanan Gelir</p>
          <p className="text-3xl font-bold mt-2">₺{kpi?.approvedRevenue?.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">Gerçekleşen</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <p className="text-sm opacity-90">Kazanma Oranı</p>
          <p className="text-3xl font-bold mt-2">%{kpi?.winRate}</p>
          <p className="text-xs opacity-75 mt-1">Win rate</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <p className="text-sm opacity-90">Geciken Follow-up</p>
          <p className="text-3xl font-bold mt-2">{kpi?.overdueFollowUps}</p>
          <p className="text-xs opacity-75 mt-1">Acil aksiyon</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
          <p className="text-sm opacity-90">Ort. Kapanma</p>
          <p className="text-3xl font-bold mt-2">{kpi?.averageClosingDays} gün</p>
          <p className="text-xs opacity-75 mt-1">Ortalama süre</p>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Dağılımı */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">📊 Pipeline Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Follow-up Disiplin */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">⏰ Follow-up Disiplin Skoru</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={disciplineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: %${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {disciplineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Ekip disiplini: <span className="font-bold text-green-600">%{discipline?.onTime}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Aylık Gelir Trendi */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">📈 Aylık Gelir Trendi (2025)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Gelir" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Satış Temsilcisi Performansı */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">👥 Satış Temsilcisi Performansı</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temsilci</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teklif</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Onaylanan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kazanma %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gelir</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ort. Kapanma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agents.map(agent => (
                <tr key={agent.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{agent.name}</td>
                  <td className="px-4 py-3">{agent.offers}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{agent.approved}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.winRate >= 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      %{agent.winRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">₺{agent.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">{agent.avgCloseDays} gün</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kayıp Teklif Analizi */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">❌ Kayıp Teklif Sebep Analizi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lostReasons}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="reason" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ef4444" name="Adet" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
