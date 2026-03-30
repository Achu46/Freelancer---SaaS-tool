import emailjs from 'emailjs-com';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

/**
 * Notify the freelancer when a client takes action on their project.
 * @param {Object} params
 * @param {string} params.toEmail - Freelancer's email
 * @param {string} params.toName - Freelancer's name
 * @param {string} params.clientName - Client's name
 * @param {string} params.projectName - Project name
 * @param {string} params.eventType - 'file_upload' | 'new_message'
 * @param {string} params.details - Extra info (filename or message preview)
 * @param {string} params.portalUrl - Public portal URL
 */
export async function notifyFreelancer({
  toEmail,
  toName,
  clientName,
  projectName,
  eventType,
  details,
  portalUrl,
}) {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      client_name: clientName,
      project_name: projectName,
      event_type: eventType === 'file_upload' ? 'uploaded a file' : 'sent a message',
      details,
      portal_url: portalUrl,
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    // Non-blocking — email failure shouldn't break the UX
    console.error('EmailJS notification failed:', error);
  }
}
