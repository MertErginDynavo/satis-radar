// Rol etiketleri - Backend'de basit, UI'da Türkçe

export const ROLE_LABELS = {
  admin: 'Satış Direktörü',
  manager: 'Satış Müdürü',
  sales: 'Satış Temsilcisi'
};

export const ROLE_ICONS = {
  admin: '🎯',
  manager: '📊',
  sales: '👤'
};

export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  sales: 'bg-green-100 text-green-800'
};

export const ROLE_DESCRIPTIONS = {
  admin: '✓ Tüm yetkilere sahip',
  manager: '✓ Tüm teklifleri görüntüleyebilir',
  sales: '✓ Sadece kendi tekliflerini görür'
};

export const ROLE_TOOLTIPS = {
  admin: 'Satış Direktörü tüm yetkilere sahiptir: Kullanıcı yönetimi, tüm teklifler, raporlar, abonelik',
  manager: 'Satış Müdürü tüm teklifleri görüntüleyebilir ve raporlara erişebilir',
  sales: 'Satış Temsilcisi sadece kendi tekliflerini görüntüleyebilir ve düzenleyebilir'
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;
export const getRoleIcon = (role) => ROLE_ICONS[role] || '👤';
export const getRoleColor = (role) => ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
export const getRoleDescription = (role) => ROLE_DESCRIPTIONS[role] || '';
export const getRoleTooltip = (role) => ROLE_TOOLTIPS[role] || '';
