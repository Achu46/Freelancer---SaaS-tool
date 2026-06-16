import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { rolePermissions } from '../../middleware/rbac.js';

const demoUsers = {
  SUPER_ADMIN: {
    id: 'usr_super_admin',
    name: 'Platform Admin',
    email: 'admin@clinicos.test',
    role: 'SUPER_ADMIN',
    clinicId: 'platform',
    plan: 'ENTERPRISE',
  },
  CLINIC_OWNER: {
    id: 'usr_clinic_owner',
    name: 'Clinic Owner',
    email: 'owner@clinicos.test',
    role: 'CLINIC_OWNER',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
  DOCTOR: {
    id: 'usr_doctor',
    name: 'Dr. Meera Iyer',
    email: 'doctor@clinicos.test',
    role: 'DOCTOR',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
  RECEPTIONIST: {
    id: 'usr_receptionist',
    name: 'Reception Desk',
    email: 'reception@clinicos.test',
    role: 'RECEPTIONIST',
    clinicId: 'clinic_bluesky',
    plan: 'STARTER',
  },
  PATIENT: {
    id: 'usr_patient',
    name: 'Aarav Shah',
    email: 'patient@clinicos.test',
    role: 'PATIENT',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
};

export function listDemoUsers() {
  return Object.values(demoUsers).map((user) => ({
    ...user,
    permissions: rolePermissions[user.role] || [],
  }));
}

export function issueDemoSession({ email, role }) {
  const baseUser = demoUsers[role] || demoUsers.CLINIC_OWNER;
  const user = {
    ...baseUser,
    email: email || baseUser.email,
    permissions: rolePermissions[baseUser.role] || [],
  };
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    plan: user.plan,
    permissions: user.permissions,
  };

  return {
    user,
    accessToken: jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' }),
    refreshToken: jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' }),
    tokenType: 'Bearer',
    expiresIn: 900,
  };
}
