/**
 * Lemon Squeezy payment integration for QueFlow.
 *
 * How it works:
 * 1. You create products + variants in the Lemon Squeezy dashboard (test mode)
 * 2. Each variant has a unique checkout URL
 * 3. We redirect the user to that URL with their email pre-filled
 * 4. After payment, Lemon Squeezy redirects back to our success URL
 *
 * NOTE: The API key is for server-side use only.
 * Frontend checkout uses simple URL redirects — no API key needed here.
 */

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    projectLimit: 1,
    checkoutUrl: null,
    features: [
      '1 project',
      'Client portal',
      'File uploads',
      'Messages',
    ],
  },
  starter: {
    name: 'Starter',
    price: 5,
    projectLimit: 10,
    // Format: https://yourstore.lemonsqueezy.com/checkout/buy/{variant_id}
    checkoutUrl: import.meta.env.VITE_LS_STARTER_CHECKOUT_URL || null,
    features: [
      'Up to 10 projects',
      'Client portal',
      'File uploads',
      'Messages',
      'Email notifications',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    projectLimit: Infinity,
    checkoutUrl: import.meta.env.VITE_LS_PRO_CHECKOUT_URL || null,
    features: [
      'Unlimited projects',
      'Client portal',
      'File uploads',
      'Messages',
      'Email notifications',
      'Priority support',
    ],
  },
};

/**
 * Redirects the user to the Lemon Squeezy hosted checkout page.
 *
 * @param {string} checkoutUrl - The base checkout URL from your LS dashboard
 * @param {string} userEmail   - Pre-fill the checkout email field
 * @param {string} userId      - Passed as custom data to identify user after payment
 */
export function redirectToLemonSqueezy(checkoutUrl, userEmail, userId) {
  if (!checkoutUrl) {
    throw new Error('Checkout URL is not configured. Add VITE_LS_STARTER_CHECKOUT_URL or VITE_LS_PRO_CHECKOUT_URL to your .env file.');
  }

  // Build the URL with pre-filled customer data
  const url = new URL(checkoutUrl);

  // Pre-fill email so the customer doesn't have to type it
  if (userEmail) {
    url.searchParams.set('checkout[email]', userEmail);
  }

  // Pass user ID as custom data — useful for webhooks later
  if (userId) {
    url.searchParams.set('checkout[custom][user_id]', userId);
  }

  // Redirect back to dashboard on success
  url.searchParams.set(
    'checkout[success_url]',
    `${window.location.origin}/dashboard?payment=success`
  );

  // Redirect to pricing page on cancel
  url.searchParams.set(
    'checkout[cancel_url]',
    `${window.location.origin}/pricing`
  );

  // Redirect user to Lemon Squeezy checkout
  window.location.href = url.toString();
}
