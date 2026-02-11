import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoleLabel, getRoleColor, getRoleDescription, getRoleIcon, getRoleTooltip } from '../utils/roleLabels';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [extraUsersToAdd, setExtraUsersToAdd] = useState(1);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'sales' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const token = localStorage.getItem('token');
    
    // Load users
    fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error('Load users error:', err));

    // Load hotel info
    fetch('/api/auth/hotel-info', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHotelInfo)
      .catch(err => console.error('Hotel info error:', err));
  };

  const maxUsers = hotelInfo ? hotelInfo.included_users + hotelInfo.extra_users : 4;
  const currentUsers = users.length;
  const canAddUser = currentUsers < maxUsers;
  const extraUserPrice = 350;
  const totalExtraPrice = extraUsersToAdd * extraUserPrice;

  const handleAddUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        alert('🎉 Kullanıcı davet edildi! E-posta gönderildi.');
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'sales' });
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Kullanıcı eklenemedi');
      }
    } catch (err) {
      console.error('Add user error:', err);
      alert('Bir hata oluştu');
    }
  };

  const handleEditUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingUser)
      });

      if (res.ok) {
        alert('✅ Kullanıcı güncellendi');
        setShowEditModal(false);
        setEditingUser(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Kullanıcı güncellenemedi');
      }
    } catch (err) {
      console.error('Edit user error:', err);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('✅ Kullanıcı silindi');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Kullanıcı silinemedi');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Bir hata oluştu');
    }
  };

  const handlePurchaseExtraUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/auth/purchase-extra-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ extra_users: extraUsersToAdd })
      });

      if (res.ok) {
        alert(`🎉 Ek kullanıcılar başarıyla eklendi. Artık ${maxUsers + extraUsersToAdd} kullanıcı tanımlayabilirsiniz.`);
        setShowUpgradeModal(false);
        loadData();
      } else {
        alert('Ödeme işlemi başarısız');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Bir hata oluştu');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
      </div>

      {/* User Stats Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Kullanıcılar</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {currentUsers} / {maxUsers}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {hotelInfo?.included_users || 4} dahil + {hotelInfo?.extra_users || 0} ek kullanıcı
            </p>
          </div>
          {!canAddUser && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Ek Kullanıcı Ekle
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span 
                    className={`px-3 py-1 text-xs rounded-full ${getRoleColor(user.role)} cursor-help inline-flex items-center space-x-1`}
                    title={getRoleTooltip(user.role)}
                  >
                    <span>{getRoleIcon(user.role)}</span>
                    <span>{getRoleLabel(user.role)}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-600 text-sm">✓ Aktif</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Button */}
      <div className="text-center">
        {canAddUser ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
          >
            🔘 + Yeni Kullanıcı Ekle
          </button>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 inline-block">
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-8 py-3 rounded-lg font-semibold text-lg cursor-not-allowed mb-3"
            >
              🔒 + Yeni Kullanıcı Ekle
            </button>
            <p className="text-gray-700 mb-3">
              Kullanıcı limitine ulaştınız. Ekibiniz büyüdükçe genişletin.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              🔵 Ek Kullanıcı Satın Al
            </button>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Yeni Kullanıcı Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="sales">{getRoleIcon('sales')} Satış Temsilcisi</option>
                  <option value="manager">{getRoleIcon('manager')} Satış Müdürü</option>
                  <option value="admin">{getRoleIcon('admin')} Satış Direktörü</option>
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{getRoleIcon(newUser.role)} {getRoleLabel(newUser.role)}:</span>
                    <br />
                    {getRoleTooltip(newUser.role)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                🔵 Davet Gönder
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Kullanıcıyı Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="sales">{getRoleIcon('sales')} Satış Temsilcisi</option>
                  <option value="manager">{getRoleIcon('manager')} Satış Müdürü</option>
                  <option value="admin">{getRoleIcon('admin')} Satış Direktörü</option>
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{getRoleIcon(editingUser.role)} {getRoleLabel(editingUser.role)}:</span>
                    <br />
                    {getRoleTooltip(editingUser.role)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                💾 Kaydet
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Ek Kullanıcı Ekle</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Mevcut Paket:</span> ✔ {hotelInfo?.included_users || 4} kullanıcı dahil
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Ek kullanıcı ücreti:</span> +350 TL / yıl / kişi
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Eklemek istediğiniz kullanıcı sayısı:</label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setExtraUsersToAdd(Math.max(1, extraUsersToAdd - 1))}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-xl"
                >
                  –
                </button>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{extraUsersToAdd}</p>
                </div>
                <button
                  onClick={() => setExtraUsersToAdd(extraUsersToAdd + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Ek kullanıcı:</span>
                  <span className="font-semibold">{extraUsersToAdd} kişi</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Toplam ek ücret:</span>
                  <span className="text-green-600">{totalExtraPrice.toLocaleString()} TL / yıl</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePurchaseExtraUsers}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                🔵 Ödemeye Geç
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-400"
              >
                ⚪ Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
