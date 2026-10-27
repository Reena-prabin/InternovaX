import { getDB } from '../config/db.js';

export const getReports = async (req, res) => {
  try {
    const db = getDB();
    const { studentId, internshipId } = req.query;
    let reports = db.getCollection('reports').find({}).exec();

    if (req.user.role === 'student') {
      reports = reports.filter(r => r.studentId === req.user._id || r.studentEmail === req.user.email || r.studentName === req.user.name);
    } else if (req.user.role === 'mentor') {
      // Find assigned students for this mentor
      const mentorProfile = db.getCollection('mentors').findOne({ userId: req.user._id }) || 
                            db.getCollection('mentors').findOne({ email: req.user.email });
      const assigned = mentorProfile ? mentorProfile.assignedStudents : [];
      if (assigned && assigned.length > 0) {
        reports = reports.filter(r => assigned.includes(r.studentId) || r.mentorReview?.mentorId === req.user._id);
      }
    }

    if (studentId) {
      reports = reports.filter(r => r.studentId === studentId);
    }

    if (internshipId) {
      reports = reports.filter(r => r.internshipId === internshipId);
    }

    // Sort by week ascending
    reports.sort((a, b) => (a.week || 0) - (b.week || 0));

    return res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitReport = async (req, res) => {
  try {
    const { week, title, tasksCompleted, challenges, learning, nextWeekPlan, documentName, internshipId } = req.body;

    if (!week || !title || !tasksCompleted) {
      return res.status(400).json({ success: false, message: 'Week, title, and completed tasks are required' });
    }

    const db = getDB();
    const weekNum = parseInt(week, 10);

    // Check if report for this week already exists
    const existing = db.getCollection('reports').findOne({
      studentId: req.user._id,
      week: weekNum
    });

    let report;
    if (existing) {
      report = db.getCollection('reports').findByIdAndUpdate(existing._id, {
        title,
        tasksCompleted,
        challenges: challenges || '',
        learning: learning || '',
        nextWeekPlan: nextWeekPlan || '',
        documentName: documentName || existing.documentName || '',
        status: 'Submitted',
        submittedDate: new Date().toISOString().split('T')[0]
      });
    } else {
      report = db.getCollection('reports').create({
        studentId: req.user._id,
        studentName: req.user.name,
        internshipId: internshipId || 'int_1',
        week: weekNum,
        title,
        tasksCompleted,
        challenges: challenges || '',
        learning: learning || '',
        nextWeekPlan: nextWeekPlan || '',
        documentName: documentName || '',
        status: 'Submitted',
        mentorReview: null,
        submittedDate: new Date().toISOString().split('T')[0]
      });
    }

    // Notify mentor
    db.getCollection('notifications').create({
      userId: 'usr_mentor_1',
      title: 'New Progress Report Submitted',
      message: `${req.user.name} submitted their Week ${weekNum} report: "${title}".`,
      type: 'report_submission',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/mentor'
    });

    return res.status(201).json({
      success: true,
      message: `Week ${weekNum} report submitted successfully`,
      report
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback, status = 'Approved' } = req.body;

    if (score === undefined || !feedback) {
      return res.status(400).json({ success: false, message: 'Review score and feedback are required' });
    }

    const db = getDB();
    const report = db.getCollection('reports').findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const mentorReview = {
      mentorId: req.user._id,
      mentorName: req.user.name,
      reviewedDate: new Date().toISOString().split('T')[0],
      score: Number(score),
      feedback
    };

    const updated = db.getCollection('reports').findByIdAndUpdate(id, {
      status,
      mentorReview
    });

    // Notify student
    db.getCollection('notifications').create({
      userId: report.studentId,
      title: `Week ${report.week} Report Reviewed`,
      message: `${req.user.name} reviewed your Week ${report.week} report with score ${score}/100.`,
      type: 'feedback',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/progress'
    });

    return res.json({
      success: true,
      message: 'Report review saved successfully',
      report: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
