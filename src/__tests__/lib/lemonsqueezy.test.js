import { describe, it, expect, beforeEach } from 'vitest';
import { PLANS, redirectToLemonSqueezy } from '../../lib/lemonsqueezy';

describe('PLANS', () => {
  it('defines free, starter, and pro plans', () => {
    expect(Object.keys(PLANS)).toEqual(['free', 'starter', 'pro']);
  });

  it('free plan has correct defaults', () => {
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.free.projectLimit).toBe(1);
    expect(PLANS.free.checkoutUrl).toBeNull();
    expect(PLANS.free.features).toContain('1 project');
  });

  it('starter plan allows up to 10 projects', () => {
    expect(PLANS.starter.price).toBe(5);
    expect(PLANS.starter.projectLimit).toBe(10);
    expect(PLANS.starter.features).toContain('Up to 10 projects');
    expect(PLANS.starter.features).toContain('Email notifications');
  });

  it('pro plan allows unlimited projects', () => {
    expect(PLANS.pro.price).toBe(9.99);
    expect(PLANS.pro.projectLimit).toBe(Infinity);
    expect(PLANS.pro.features).toContain('Unlimited projects');
    expect(PLANS.pro.features).toContain('Priority support');
  });

  it('all plans include base features', () => {
    const basePlans = ['Client portal', 'File uploads', 'Messages'];
    Object.values(PLANS).forEach((plan) => {
      basePlans.forEach((feature) => {
        expect(plan.features).toContain(feature);
      });
    });
  });
});

describe('redirectToLemonSqueezy', () => {
  let assignedUrl;

  beforeEach(() => {
    assignedUrl = undefined;
    // Mock window.location
    delete window.location;
    window.location = {
      origin: 'https://queflow.test',
      href: '',
    };
    Object.defineProperty(window.location, 'href', {
      set(val) { assignedUrl = val; },
      get() { return assignedUrl || ''; },
    });
  });

  it('throws when checkoutUrl is falsy', () => {
    expect(() => redirectToLemonSqueezy(null, 'a@b.com', 'u1'))
      .toThrow('Checkout URL is not configured');
    expect(() => redirectToLemonSqueezy('', 'a@b.com', 'u1'))
      .toThrow('Checkout URL is not configured');
  });

  it('builds URL with email, userId, success and cancel URLs', () => {
    redirectToLemonSqueezy('https://store.lemonsqueezy.com/checkout/buy/123', 'user@test.com', 'uid-42');

    const url = new URL(assignedUrl);
    expect(url.searchParams.get('checkout[email]')).toBe('user@test.com');
    expect(url.searchParams.get('checkout[custom][user_id]')).toBe('uid-42');
    expect(url.searchParams.get('checkout[success_url]')).toBe('https://queflow.test/dashboard?payment=success');
    expect(url.searchParams.get('checkout[cancel_url]')).toBe('https://queflow.test/pricing');
  });

  it('omits email param when userEmail is falsy', () => {
    redirectToLemonSqueezy('https://store.lemonsqueezy.com/checkout/buy/123', null, 'uid-42');

    const url = new URL(assignedUrl);
    expect(url.searchParams.has('checkout[email]')).toBe(false);
    expect(url.searchParams.get('checkout[custom][user_id]')).toBe('uid-42');
  });

  it('omits userId param when userId is falsy', () => {
    redirectToLemonSqueezy('https://store.lemonsqueezy.com/checkout/buy/123', 'a@b.com', '');

    const url = new URL(assignedUrl);
    expect(url.searchParams.get('checkout[email]')).toBe('a@b.com');
    expect(url.searchParams.has('checkout[custom][user_id]')).toBe(false);
  });
});
