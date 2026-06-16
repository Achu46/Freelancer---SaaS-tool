import { describe, it, expect } from 'vitest';
import { isAdminUser } from '../../components/AdminRoute';

describe('isAdminUser', () => {
  it('returns true when profile.role is "admin"', () => {
    expect(isAdminUser({ email: 'any@x.com' }, { role: 'admin' })).toBe(true);
  });

  it('returns true when profile.isAdmin is true (legacy)', () => {
    expect(isAdminUser({ email: 'any@x.com' }, { role: 'freelancer', isAdmin: true })).toBe(true);
  });

  it('returns true when user email matches ADMIN_EMAIL fallback', () => {
    // Default ADMIN_EMAIL is admin@queflow.com when env var is unset
    expect(isAdminUser({ email: 'admin@queflow.com' }, null)).toBe(true);
  });

  it('returns false for a regular freelancer user', () => {
    expect(isAdminUser({ email: 'user@test.com' }, { role: 'freelancer' })).toBe(false);
  });

  it('returns false when user and profile are null', () => {
    expect(isAdminUser(null, null)).toBe(false);
  });

  it('returns true for admin email even with a non-admin profile (email fallback always checked)', () => {
    // isAdminUser checks email regardless of profile, so admin email always grants access
    expect(isAdminUser({ email: 'admin@queflow.com' }, { role: 'freelancer' })).toBe(true);
  });
});
