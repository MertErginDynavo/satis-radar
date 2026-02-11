// Rol bazlı yetkilendirme middleware'i

// Rol hiyerarşisi
const ROLES = {
  ADMIN: 'admin',      // Satış Direktörü
  MANAGER: 'manager',  // Satış Müdürü
  SALES: 'sales'       // Satış Temsilcisi
};

// Yetki kontrol fonksiyonları
const hasPermission = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
};

// Middleware: Belirli rollere izin ver
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    }

    if (!hasPermission(req.user.role, allowedRoles)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};

// Middleware: Sadece admin
export const requireAdmin = requireRole(ROLES.ADMIN);

// Middleware: Admin veya Satış Müdürü
export const requireManager = requireRole(ROLES.ADMIN, ROLES.MANAGER);

// Yetki kontrol fonksiyonları
export const canViewAllOffers = (role) => {
  return [ROLES.ADMIN, ROLES.MANAGER].includes(role);
};

export const canEditAllOffers = (role) => {
  return role === ROLES.ADMIN;
};

export const canDeleteOffer = (role) => {
  return role === ROLES.ADMIN;
};

export const canManageUsers = (role) => {
  return role === ROLES.ADMIN;
};

export const canManageSubscription = (role) => {
  return role === ROLES.ADMIN;
};

export const canViewReports = (role) => {
  return [ROLES.ADMIN, ROLES.MANAGER].includes(role);
};

export const canEditCompanies = (role) => {
  return role === ROLES.ADMIN;
};

export const canChangeOfferStatus = (role) => {
  return [ROLES.ADMIN, ROLES.MANAGER].includes(role);
};

// Teklif sahibi kontrolü
export const isOfferOwner = (userId, offer) => {
  return offer.agent_id === userId;
};

// Teklif erişim kontrolü
export const canAccessOffer = (user, offer) => {
  // Admin ve Satış Müdürü tüm teklifleri görebilir
  if (canViewAllOffers(user.role)) {
    return true;
  }
  
  // Satış Temsilcisi sadece kendi tekliflerini görebilir
  return isOfferOwner(user.id, offer);
};

// Teklif düzenleme kontrolü
export const canEditOffer = (user, offer) => {
  // Admin tüm teklifleri düzenleyebilir
  if (user.role === ROLES.ADMIN) {
    return true;
  }
  
  // Satış Müdürü durum değiştirebilir ve not ekleyebilir
  if (user.role === ROLES.MANAGER) {
    return true;
  }
  
  // Satış Temsilcisi sadece kendi tekliflerini düzenleyebilir
  return isOfferOwner(user.id, offer);
};

export { ROLES };
