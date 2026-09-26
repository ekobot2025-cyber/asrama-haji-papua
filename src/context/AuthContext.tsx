import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../db/database';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: string) => boolean;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      return db.getUsers();
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const allUsers = db.getUsers();
      const savedUserId = localStorage.getItem('sipah_auth_user_id');
      if (savedUserId) {
        const found = allUsers.find(u => u.id === savedUserId);
        if (found) return found;
      }
      return allUsers[0] || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const allUsers = db.getUsers();
    setUsers(allUsers);
    const savedUserId = localStorage.getItem('sipah_auth_user_id');
    if (savedUserId) {
      const found = allUsers.find(u => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      }
    }
  }, []);

  const login = (username: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('sipah_auth_user_id', user.id);
      db.logAudit(user.name, user.role, 'USER_LOGIN', 'Otentikasi', `Pengguna ${user.name} berhasil masuk.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      db.logAudit(currentUser.name, currentUser.role, 'USER_LOGOUT', 'Otentikasi', `Pengguna ${currentUser.name} keluar dari sistem.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('sipah_auth_user_id');
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('sipah_auth_user_id', target.id);
      db.logAudit(target.name, target.role, 'ROLE_SWITCH', 'Otentikasi', `Beralih peran ke ${target.role} (${target.name})`);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;

    switch (permission) {
      case 'reservation.manage':
        return ['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'PETUGAS'].includes(currentUser.role);
      case 'reservation.verify':
        return ['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'PIMPINAN'].includes(currentUser.role);
      case 'checkin.manage':
      case 'checkout.manage':
      case 'room.assign':
        return ['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'PETUGAS'].includes(currentUser.role);
      case 'room.manage':
        return ['SUPER_ADMIN', 'ADMIN_PENGINAPAN'].includes(currentUser.role);
      case 'housekeeping.manage':
        return ['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'HOUSEKEEPING'].includes(currentUser.role);
      case 'finance.manage':
        return ['SUPER_ADMIN', 'KEUANGAN'].includes(currentUser.role);
      case 'reports.view':
        return true; // All authenticated users can view appropriate reports
      case 'executive.view':
        return ['SUPER_ADMIN', 'PIMPINAN', 'ADMIN_PENGINAPAN'].includes(currentUser.role);
      case 'system.manage':
        return ['SUPER_ADMIN'].includes(currentUser.role);
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'PETUGAS',
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUser,
        hasPermission,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
