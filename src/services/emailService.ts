import { ReviewSubmission } from '../types';
import { User } from '../auth';

export interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
  notifyOnRevisionRequest: boolean;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailService {
  private config: EmailConfig;
  private settings: EmailNotificationSettings;

  constructor(config: EmailConfig, settings: EmailNotificationSettings) {
    this.config = config;
    this.settings = settings;
  }

  /**
   * Send email notification to reviewers when a new submission is created
   */
  async notifyReviewersOfNewSubmission(
    submission: ReviewSubmission, 
    reviewers: User[],
    submitterName: string
  ): Promise<boolean> {
    if (!this.settings.enabled || !this.settings.notifyOnSubmission) {
      console.log('Email notifications disabled or submission notifications disabled');
      return false;
    }

    const reviewerEmails = reviewers
      .filter(user => user.email && user.roles.includes('reviewer'))
      .map(user => user.email!);

    if (reviewerEmails.length === 0) {
      console.warn('No reviewers with email addresses found');
      return false;
    }

    const template = this.getNewSubmissionTemplate(submission, submitterName);

    try {
      // In a real implementation, this would use a proper email service
      // For now, we'll simulate the email and log it
      await this.sendEmail(reviewerEmails, template);
      console.log(`✅ Email notification sent to ${reviewerEmails.length} reviewers`);
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  /**
   * Send email notification when a submission status changes
   */
  async notifySubmitterOfStatusChange(
    submission: ReviewSubmission,
    submitterEmail: string,
    submitterName: string,
    reviewerName: string
  ): Promise<boolean> {
    if (!this.settings.enabled) {
      return false;
    }

    let shouldNotify = false;
    if (submission.status === 'approved' && this.settings.notifyOnApproval) shouldNotify = true;
    if (submission.status === 'rejected' && this.settings.notifyOnRejection) shouldNotify = true;
    if (submission.status === 'needs_revision' && this.settings.notifyOnRevisionRequest) shouldNotify = true;

    if (!shouldNotify) {
      return false;
    }

    const template = this.getStatusChangeTemplate(submission, submitterName, reviewerName);

    try {
      await this.sendEmail([submitterEmail], template);
      console.log(`✅ Status change notification sent to ${submitterEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send status change notification:', error);
      return false;
    }
  }

  private getNewSubmissionTemplate(submission: ReviewSubmission, submitterName: string): EmailTemplate {
    const readingCount = submission.readings.length;
    
    return {
      subject: `🔍 New Reading Submission for Review - ${readingCount} readings`,
      body: `
        <h2>📊 New Building Readings Submission</h2>
        
        <p>A new submission has been received and requires your review:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Submission Details:</strong><br>
          📋 <strong>Submitted by:</strong> ${submitterName}<br>
          📅 <strong>Submitted at:</strong> ${new Date(submission.submittedAt).toLocaleString()}<br>
          📊 <strong>Number of readings:</strong> ${readingCount}<br>
          ${submission.listName ? `📝 <strong>Reading list:</strong> ${submission.listName}<br>` : ''}
          ${submission.submissionNotes ? `💬 <strong>Notes:</strong> ${submission.submissionNotes}<br>` : ''}
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Reading Summary:</strong><br>
          ${this.generateReadingSummary(submission.readings)}
        </div>

        <p>Please log into the Building Readings App to review this submission.</p>
        
        <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border-radius: 5px;">
          <strong>⚡ Quick Actions Needed:</strong><br>
          • Review the submitted readings for accuracy<br>
          • Check values against expected ranges<br>
          • Verify all required measurements are included<br>
          • Approve, reject, or request revisions as needed
        </div>

        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated notification from the Building Readings Management System.<br>
          You received this because you are registered as a reviewer.
        </p>
      `
    };
  }

  private getStatusChangeTemplate(
    submission: ReviewSubmission, 
    submitterName: string, 
    reviewerName: string
  ): EmailTemplate {
    const statusMap: Record<string, { emoji: string; text: string; color: string }> = {
      approved: { emoji: '✅', text: 'Approved', color: '#d4edda' },
      rejected: { emoji: '❌', text: 'Rejected', color: '#f8d7da' },
      needs_revision: { emoji: '🔄', text: 'Needs Revision', color: '#fff3cd' },
      pending: { emoji: '⏳', text: 'Pending', color: '#e2e3e5' }
    };

    const status = statusMap[submission.status] || { emoji: '📋', text: submission.status, color: '#e2e3e5' };

    return {
      subject: `${status.emoji} Submission ${status.text} - ${submission.readings.length} readings`,
      body: `
        <h2>${status.emoji} Submission Status Update</h2>
        
        <p>Dear ${submitterName},</p>
        <p>Your building readings submission has been reviewed:</p>
        
        <div style="background: ${status.color}; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Status:</strong> ${status.emoji} ${status.text}<br>
          <strong>Reviewed by:</strong> ${reviewerName}<br>
          <strong>Reviewed at:</strong> ${submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleString() : 'Just now'}
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Original Submission:</strong><br>
          📅 <strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}<br>
          📊 <strong>Readings:</strong> ${submission.readings.length}<br>
          ${submission.listName ? `📝 <strong>List:</strong> ${submission.listName}<br>` : ''}
        </div>

        ${submission.reviewComments ? `
        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>💬 Reviewer Comments:</strong><br>
          ${submission.reviewComments}
        </div>
        ` : ''}

        ${submission.status === 'approved' ? `
        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>✅ Next Steps:</strong><br>
          Your readings have been approved and added to the system. No further action is required.
        </div>
        ` : ''}

        ${submission.status === 'needs_revision' ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>🔄 Next Steps:</strong><br>
          Please review the comments above and resubmit your readings with the requested corrections.
        </div>
        ` : ''}

        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated notification from the Building Readings Management System.
        </p>
      `
    };
  }

  private generateReadingSummary(readings: any[]): string {
    // Group readings by type for summary
    const groupedByType: Record<string, any[]> = {};
    
    readings.forEach(reading => {
      const type = reading.readingType;
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(reading);
    });

    return Object.entries(groupedByType)
      .map(([type, typeReadings]) => {
        const count = typeReadings.length;
        const typeDisplay = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `• ${typeDisplay}: ${count} reading${count !== 1 ? 's' : ''}`;
      })
      .join('<br>');
  }

  private async sendEmail(recipients: string[], template: EmailTemplate): Promise<void> {
    // Simulate email sending with console logging for development
    // In production, this would integrate with a real email service like:
    // - SendGrid
    // - Amazon SES
    // - Mailgun
    // - SMTP server
    
    console.log('\n📧 EMAIL NOTIFICATION SENT');
    console.log('==========================');
    console.log(`📩 To: ${recipients.join(', ')}`);
    console.log(`📩 From: ${this.config.fromName || 'Building Readings System'} <${this.config.fromEmail}>`);
    console.log(`📩 Subject: ${template.subject}`);
    console.log('\n📝 Email Body:');
    console.log(template.body.replace(/<[^>]*>/g, '').trim()); // Strip HTML for console
    console.log('==========================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Update email configuration
   */
  updateConfig(config: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<EmailNotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current email configuration (excluding sensitive data)
   */
  getConfig(): Omit<EmailConfig, 'password'> {
    const { password, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Get current notification settings
   */
  getSettings(): EmailNotificationSettings {
    return { ...this.settings };
  }
}

// Default email configuration
export const defaultEmailConfig: EmailConfig = {
  fromEmail: 'noreply@buildingreadings.app',
  fromName: 'Building Readings System'
};

// Default notification settings
export const defaultEmailSettings: EmailNotificationSettings = {
  enabled: true,
  notifyOnSubmission: true,
  notifyOnApproval: true,
  notifyOnRejection: true,
  notifyOnRevisionRequest: true
};

// Create default email service instance
export const emailService = new EmailService(defaultEmailConfig, defaultEmailSettings);