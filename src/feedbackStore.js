const feedbackRecords = [];

export function getCourseFeedback(learnerId, courseSlug) {
  return feedbackRecords.find((record) => record.learnerId === learnerId && record.courseSlug === courseSlug) || null;
}

export function saveCourseFeedback({ learnerId, learnerName, courseSlug, courseTitle, comment }) {
  const normalizedComment = comment.trim();
  if (!normalizedComment) return null;

  const record = {
    id: `feedback-${learnerId}-${courseSlug}`,
    learnerId,
    learnerName,
    courseSlug,
    courseTitle,
    comment: normalizedComment,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };

  const existingIndex = feedbackRecords.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) feedbackRecords[existingIndex] = record;
  else feedbackRecords.push(record);

  return record;
}

export function getAllFeedbackRecords() {
  return [...feedbackRecords];
}
