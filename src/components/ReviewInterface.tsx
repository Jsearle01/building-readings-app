import React, { useState } from 'react';
import { ReviewSubmission, ReviewAction, ReviewStatus, BuildingReading } from '../types';
import './ReviewInterface.css';

interface ReviewInterfaceProps {
  submissions: ReviewSubmission[];
  onReviewSubmission: (submissionId: string, action: ReviewAction) => void;
  currentUserId: string;
}

const ReviewInterface: React.FC<ReviewInterfaceProps> = ({
  submissions,
  onReviewSubmission,
  currentUserId
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null);
  const [reviewComments, setReviewComments] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' || submission.status === filterStatus
  );

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

  return (
    <div className="review-interface">
      <div className="review-header">
        <h2>Data Review Interface</h2>
        <p>Review and approve submitted reading data for accuracy and completeness.</p>
      </div>

      <div className="review-filters">
        <label>
          Filter by Status:
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as ReviewStatus | 'all')}
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
          </select>
        </label>
      </div>

      <div className="review-content">
        <div className="submissions-list">
          <h3>Submissions ({filteredSubmissions.length})</h3>
          {filteredSubmissions.length === 0 ? (
            <p className="no-submissions">No submissions found for the selected filter.</p>
          ) : (
            <div className="submissions-grid">
              {filteredSubmissions.map(submission => (
                <div 
                  key={submission.id} 
                  className={`submission-card ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="submission-header">
                    <span className={`status-badge ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="submission-date">
                      {formatTimestamp(submission.submittedAt)}
                    </span>
                  </div>
                  
                  <div className="submission-info">
                    <p><strong>Submitted by:</strong> {submission.submittedBy}</p>
                    {submission.listName && (
                      <p><strong>Reading List:</strong> {submission.listName}</p>
                    )}
                    <p><strong>Data Points:</strong> {submission.readings.length}</p>
                  </div>

                  {submission.submissionNotes && (
                    <div className="submission-notes">
                      <p><strong>Notes:</strong> {submission.submissionNotes}</p>
                    </div>
                  )}

                  {submission.reviewComments && (
                    <div className="review-feedback">
                      <p><strong>Review Comments:</strong> {submission.reviewComments}</p>
                      <p><small>Reviewed by: {submission.reviewedBy} on {submission.reviewedAt && formatTimestamp(submission.reviewedAt)}</small></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="submission-details">
            <div className="details-header">
              <h3>Submission Details</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>

            <div className="submission-meta">
              <div className="meta-row">
                <span><strong>ID:</strong> {selectedSubmission.id}</span>
                <span><strong>Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(selectedSubmission.status)}`}>
                    {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="meta-row">
                <span><strong>Submitted:</strong> {formatTimestamp(selectedSubmission.submittedAt)}</span>
                <span><strong>By:</strong> {selectedSubmission.submittedBy}</span>
              </div>
              {selectedSubmission.listName && (
                <div className="meta-row">
                  <span><strong>Reading List:</strong> {selectedSubmission.listName}</span>
                </div>
              )}
            </div>

            <div className="readings-data">
              <h4>Reading Data ({selectedSubmission.readings.length} points)</h4>
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
                        <th>Timestamp</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map(reading => (
                        <tr key={reading.id}>
                          <td>{reading.readingType}</td>
                          <td>{reading.buildingName} - {reading.floor} - {reading.room}</td>
                          <td>{reading.value}</td>
                          <td>{reading.unit}</td>
                          <td>{formatTimestamp(reading.timestamp)}</td>
                          <td>{reading.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {selectedSubmission.status === 'pending' && (
              <div className="review-actions">
                <div className="review-comments-section">
                  <label>
                    Review Comments:
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add comments about the data quality, accuracy, or any issues found..."
                      rows={4}
                    />
                  </label>
                </div>

                <div className="action-buttons">
                  <button 
                    className="approve-button"
                    onClick={() => handleReview('approve')}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    className="revision-button"
                    onClick={() => handleReview('request_revision')}
                  >
                    ↻ Request Revision
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => handleReview('reject')}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewInterface;