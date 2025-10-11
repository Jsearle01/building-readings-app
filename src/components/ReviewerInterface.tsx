import React, { useState } from 'react';
import { ReviewSubmission, ReviewAction, ReviewStatus, BuildingReading } from '../types';
import { getUserById } from '../auth';
import './ReviewerInterface.css';

interface ReviewerInterfaceProps {
  submissions: ReviewSubmission[];
  onReviewSubmission: (submissionId: string, action: ReviewAction) => void;
  currentUserId: string;
}

const ReviewerInterface: React.FC<ReviewerInterfaceProps> = ({
  submissions,
  onReviewSubmission,
  currentUserId
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null);
  const [reviewComments, setReviewComments] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('pending');

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' || submission.status === filterStatus
  );

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
  const revisionCount = submissions.filter(s => s.status === 'needs_revision').length;

  // Helper function to get user display name
  const getUserDisplayName = (userId: string): string => {
    const user = getUserById(userId);
    return user?.fullName || user?.username || userId;
  };

  // Reset selected submission when filter changes
  React.useEffect(() => {
    // If we have a selected submission, check if it's still in the filtered list
    if (selectedSubmission) {
      const isStillVisible = filteredSubmissions.some(submission => submission.id === selectedSubmission.id);
      if (!isStillVisible) {
        setSelectedSubmission(null);
        setReviewComments(''); // Also clear any review comments
      }
    }
  }, [filterStatus, selectedSubmission, filteredSubmissions]);

  // Debug logging for filtering (remove in production)
  React.useEffect(() => {
    console.log('=== REVIEWER FILTER DEBUG ===');
    console.log('Current filterStatus:', filterStatus);
    console.log('Total submissions:', submissions.length);
    console.log('Submissions by status:', {
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      needs_revision: submissions.filter(s => s.status === 'needs_revision').length
    });
    console.log('All submissions:', submissions.map(s => ({ id: s.id, status: s.status, submittedBy: s.submittedBy })));
    console.log('Filtered submissions:', filteredSubmissions.map(s => ({ id: s.id, status: s.status })));
    console.log('=============================');
    
    // Make submissions available for console debugging
    (window as any).debugSubmissions = {
      all: submissions,
      filtered: filteredSubmissions,
      filterStatus,
      counts: {
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        needs_revision: submissions.filter(s => s.status === 'needs_revision').length
      }
    };
  }, [filterStatus, submissions, filteredSubmissions]);

  const handleReview = (action: 'approve' | 'reject' | 'request_revision') => {
    if (!selectedSubmission) return;

    const reviewAction: ReviewAction = {
      action,
      comments: reviewComments,
      reviewedBy: currentUserId
    };

    onReviewSubmission(selectedSubmission.id, reviewAction);
    setSelectedSubmission(null);
    setReviewComments('');
  };

  const getStatusBadgeClass = (status: ReviewStatus) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'needs_revision': return 'status-revision';
      default: return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const groupReadingsByComponent = (readings: BuildingReading[]) => {
    const grouped = readings.reduce((acc, reading) => {
      const key = reading.pointId ? 
        `${reading.buildingName} - ${reading.floor} - ${reading.room}` : 
        reading.readingType;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reading);
      return acc;
    }, {} as Record<string, BuildingReading[]>);

    return grouped;
  };

  const getPriorityColor = (submission: ReviewSubmission) => {
    const hoursOld = (Date.now() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld > 48) return 'priority-high';
    if (hoursOld > 24) return 'priority-medium';
    return 'priority-normal';
  };

  return (
    <div className="reviewer-interface">
      <header className="reviewer-header">
        <div className="header-content">
          <h1>🔍 Data Quality Review Dashboard</h1>
          <p>Review and approve submitted building readings for data integrity</p>
        </div>

        <div className="review-stats">
          <div className="stat-card pending">
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{approvedCount}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{rejectedCount}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card revision">
            <div className="stat-number">{revisionCount}</div>
            <div className="stat-label">Need Revision</div>
          </div>
        </div>
      </header>

      <div className="reviewer-controls">
        <div className="filter-section">
          <label>
            View Status:
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as ReviewStatus | 'all')}
            >
              <option value="pending">⏳ Pending Review ({pendingCount})</option>
              <option value="approved">✅ Approved ({approvedCount})</option>
              <option value="rejected">❌ Rejected ({rejectedCount})</option>
              <option value="needs_revision">🔄 Needs Revision ({revisionCount})</option>
              <option value="all">📋 All Submissions ({submissions.length})</option>
            </select>
          </label>
        </div>

        {pendingCount > 0 && filterStatus === 'pending' && (
          <div className="priority-notice">
            <span className="priority-icon">⚡</span>
            <span>You have {pendingCount} submission{pendingCount !== 1 ? 's' : ''} waiting for review</span>
          </div>
        )}
      </div>

      <div className="reviewer-content">
        <div className="submissions-queue">
          <h3>
            {filterStatus === 'all' ? 'All Submissions' : 
             filterStatus === 'pending' ? 'Review Queue' :
             filterStatus === 'approved' ? 'Approved Submissions' :
             filterStatus === 'rejected' ? 'Rejected Submissions' :
             'Revision Requests'} 
            ({filteredSubmissions.length})
          </h3>
          
          {filteredSubmissions.length === 0 ? (
            <div className="empty-queue">
              <div className="empty-icon">📭</div>
              <h4>No submissions found</h4>
              <p>
                {filterStatus === 'pending' 
                  ? 'Great job! No submissions are currently waiting for review.'
                  : filterStatus === 'approved'
                  ? 'No submissions have been approved yet. Review and approve some pending submissions to see them here.'
                  : filterStatus === 'rejected'  
                  ? 'No submissions have been rejected yet.'
                  : filterStatus === 'needs_revision'
                  ? 'No submissions are currently awaiting revision.'
                  : `No submissions with "${filterStatus}" status found.`
                }
              </p>
              <div style={{ fontSize: '0.8rem', color: '#495057', marginTop: '8px' }}>
                Total submissions in system: {submissions.length} | 
                Current filter: {filterStatus} | 
                Filtered results: {filteredSubmissions.length}
              </div>
            </div>
          ) : (
            <div className="submissions-list">
              {filteredSubmissions.map(submission => (
                <div 
                  key={submission.id} 
                  className={`submission-item ${selectedSubmission?.id === submission.id ? 'selected' : ''} ${getPriorityColor(submission)}`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="submission-main">
                    <div className="submission-header">
                      <div className="submission-title">
                        <strong>{submission.listName || 'Custom Entry'}</strong>
                        <span className={`status-badge ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="submission-time">
                        {formatTimestamp(submission.submittedAt)}
                      </div>
                    </div>
                    
                    <div className="submission-details">
                      <div className="detail-item">
                        <span className="detail-label">Submitted by:</span>
                        <span className="detail-value">{getUserDisplayName(submission.submittedBy)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Data points:</span>
                        <span className="detail-value">{submission.readings.length}</span>
                      </div>
                      {submission.submissionNotes && (
                        <div className="submission-note">
                          <span className="note-icon">💬</span>
                          <span>{submission.submissionNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {submission.status !== 'pending' && submission.reviewComments && (
                    <div className="review-history">
                      <div className="review-comment">
                        <strong>Review:</strong> {submission.reviewComments}
                      </div>
                      <div className="review-meta">
                        By {submission.reviewerName || (submission.reviewedBy ? getUserDisplayName(submission.reviewedBy) : 'Unknown')} on {submission.reviewedAt && formatTimestamp(submission.reviewedAt)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="submission-review-panel">
            <div className="panel-header">
              <h3>Review Details</h3>
              <button 
                className="close-panel"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>

            <div className="submission-metadata">
              <div className="meta-grid">
                <div className="meta-item">
                  <label>Submission ID:</label>
                  <span>{selectedSubmission.id}</span>
                </div>
                <div className="meta-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusBadgeClass(selectedSubmission.status)}`}>
                    {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="meta-item">
                  <label>Submitted By:</label>
                  <span>{getUserDisplayName(selectedSubmission.submittedBy)}</span>
                </div>
                <div className="meta-item">
                  <label>Submission Time:</label>
                  <span>{formatTimestamp(selectedSubmission.submittedAt)}</span>
                </div>
                {selectedSubmission.listName && (
                  <div className="meta-item">
                    <label>Reading List:</label>
                    <span>{selectedSubmission.listName}</span>
                  </div>
                )}
                <div className="meta-item">
                  <label>Total Readings:</label>
                  <span>{selectedSubmission.readings.length}</span>
                </div>
              </div>

              {selectedSubmission.submissionNotes && (
                <div className="submission-notes">
                  <label>Submitter Notes:</label>
                  <div className="notes-content">{selectedSubmission.submissionNotes}</div>
                </div>
              )}

              {/* Review Information Section */}
              {selectedSubmission.status !== 'pending' && selectedSubmission.reviewedAt && (
                <div className="review-information">
                  <h4>Review Information</h4>
                  <div className="review-meta-grid">
                    <div className="meta-item">
                      <label>Review Status:</label>
                      <span className={`status-badge ${getStatusBadgeClass(selectedSubmission.status)}`}>
                        {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="meta-item">
                      <label>Reviewed By:</label>
                      <span>{selectedSubmission.reviewerName || (selectedSubmission.reviewedBy ? getUserDisplayName(selectedSubmission.reviewedBy) : 'Unknown')}</span>
                    </div>
                    <div className="meta-item">
                      <label>Review Date:</label>
                      <span>{formatTimestamp(selectedSubmission.reviewedAt)}</span>
                    </div>
                    {selectedSubmission.reviewComments && (
                      <div className="meta-item full-width">
                        <label>Review Comments:</label>
                        <div className="review-comments-display">{selectedSubmission.reviewComments}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="readings-review">
              <h4>Data for Review</h4>
              {Object.entries(groupReadingsByComponent(selectedSubmission.readings)).map(([group, readings]) => (
                <div key={group} className="reading-group">
                  <h5>{group}</h5>
                  <table className="readings-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Value</th>
                        <th>Unit</th>
                        <th>Time</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map(reading => (
                        <tr key={reading.id}>
                          <td>{reading.readingType}</td>
                          <td>{reading.buildingName} - {reading.floor} - {reading.room}</td>
                          <td className="value-cell">{reading.value}</td>
                          <td>{reading.unit}</td>
                          <td>{formatTimestamp(reading.timestamp)}</td>
                          <td>{reading.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {selectedSubmission.status === 'pending' && (
              <div className="review-actions">
                <div className="comments-section">
                  <label htmlFor="reviewComments">Review Comments:</label>
                  <textarea
                    id="reviewComments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add comments about data quality, accuracy, or any issues found..."
                    rows={4}
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className="action-approve"
                    onClick={() => handleReview('approve')}
                    title="Approve this submission"
                  >
                    ✅ Approve Data
                  </button>
                  <button 
                    className="action-revision"
                    onClick={() => handleReview('request_revision')}
                    title="Request corrections"
                  >
                    🔄 Request Revision
                  </button>
                  <button 
                    className="action-reject"
                    onClick={() => handleReview('reject')}
                    title="Reject this submission"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}

            {selectedSubmission.status !== 'pending' && selectedSubmission.reviewComments && (
              <div className="previous-review">
                <h4>Previous Review</h4>
                <div className="review-details">
                  <div className="review-comment">
                    <strong>Comments:</strong> {selectedSubmission.reviewComments}
                  </div>
                  <div className="review-signature">
                    <strong>Reviewed by:</strong> {selectedSubmission.reviewerName || (selectedSubmission.reviewedBy ? getUserDisplayName(selectedSubmission.reviewedBy) : 'Unknown')} on {selectedSubmission.reviewedAt && formatTimestamp(selectedSubmission.reviewedAt)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerInterface;