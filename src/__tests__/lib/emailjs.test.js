import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock emailjs-com before importing the module under test
const sendMock = vi.fn().mockResolvedValue({ status: 200 });
const initMock = vi.fn();
vi.mock('emailjs-com', () => ({
  default: { init: initMock, send: sendMock },
}));

// Now import the module under test
const { notifyFreelancer } = await import('../../lib/emailjs');

describe('notifyFreelancer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls emailjs.send with correct template params for file_upload', async () => {
    await notifyFreelancer({
      toEmail: 'dev@test.com',
      toName: 'Dev',
      clientName: 'Client',
      projectName: 'Project X',
      eventType: 'file_upload',
      details: 'design.png',
      portalUrl: 'https://queflow.test/p/abc',
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const templateParams = sendMock.mock.calls[0][2];
    expect(templateParams.to_email).toBe('dev@test.com');
    expect(templateParams.to_name).toBe('Dev');
    expect(templateParams.client_name).toBe('Client');
    expect(templateParams.project_name).toBe('Project X');
    expect(templateParams.event_type).toBe('uploaded a file');
    expect(templateParams.details).toBe('design.png');
    expect(templateParams.portal_url).toBe('https://queflow.test/p/abc');
  });

  it('maps new_message eventType to "sent a message"', async () => {
    await notifyFreelancer({
      toEmail: 'dev@test.com',
      toName: 'Dev',
      clientName: 'Client',
      projectName: 'Project X',
      eventType: 'new_message',
      details: 'Hello!',
      portalUrl: 'https://queflow.test/p/abc',
    });

    const templateParams = sendMock.mock.calls[0][2];
    expect(templateParams.event_type).toBe('sent a message');
  });

  it('does not throw when emailjs.send rejects', async () => {
    sendMock.mockRejectedValueOnce(new Error('EmailJS down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      notifyFreelancer({
        toEmail: 'dev@test.com',
        toName: 'Dev',
        clientName: 'Client',
        projectName: 'P',
        eventType: 'file_upload',
        details: '',
        portalUrl: '',
      })
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      'EmailJS notification failed:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
