import { getDB } from '../config/db.js';
import { calculateSkillMatch } from './internshipController.js';

export const getApplications = async (req, res) => {
  try {
    const db = getDB();
    const { status, studentId, internshipId } = req.query;
    let applications = db.getCollection('applications').find({}).exec();

    // If student, only their applications
    if (req.user.role === 'student') {
      applications = applications.filter(a => a.studentId === req.user._id || a.studentEmail === req.user.email);
    } else if (req.user.role === 'company') {
      // Find internships posted by this company
      const companyInternships = db.getCollection('internships').find({ companyId: req.user._id }).exec();
      const companyInternshipIds = companyInternships.map(i => i._id);
      applications = applications.filter(a => 
        companyInternshipIds.includes(a.internshipId) || 
        a.company.toLowerCase() === req.user.name.toLowerCase()
      );
    }

    if (studentId) {
      applications = applications.filter(a => a.studentId === studentId);
    }

    if (internshipId) {
      applications = applications.filter(a => a.internshipId === internshipId);
    }

    if (status && status !== 'All') {
      applications = applications.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }

    return res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const applyInternship = async (req, res) => {
  try {
    const { internshipId, coverLetter } = req.body;
    if (!internshipId) {
      return res.status(400).json({ success: false, message: 'internshipId is required' });
    }

    const db = getDB();
    const internship = db.getCollection('internships').findById(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Check if already applied
    const existing = db.getCollection('applications').findOne({
      $or: [
        { studentId: req.user._id, internshipId },
        { studentEmail: req.user.email, internshipId }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this internship' });
    }

    const student = db.getCollection('students').findOne({ userId: req.user._id }) || 
                    db.getCollection('students').findOne({ email: req.user.email });

    const studentSkills = student ? student.skills : [];
    const matchScore = calculateSkillMatch(studentSkills, internship.requiredSkills);

    const newApp = db.getCollection('applications').create({
      studentId: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      internshipId,
      internshipTitle: internship.title,
      company: internship.company,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      matchScore,
      coverLetter: coverLetter || '',
      notes: 'Application received and queued for review.',
      createdAt: new Date().toISOString()
    });

    // Create a notification for student
    db.getCollection('notifications').create({
      userId: req.user._id,
      title: 'Application Submitted',
      message: `Your application for ${internship.title} at ${internship.company} was submitted successfully!`,
      type: 'application',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/applications'
    });

    return res.status(201).json({
      success: true,
      message: 'Applied successfully!',
      application: newApp
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const db = getDB();
    const app = db.getCollection('applications').findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updated = db.getCollection('applications').findByIdAndUpdate(id, {
      status,
      notes: notes !== undefined ? notes : app.notes
    });

    // Notify student
    db.getCollection('notifications').create({
      userId: app.studentId,
      title: `Application Status: ${status}`,
      message: `Your application for ${app.internshipTitle} at ${app.company} has been updated to "${status}".`,
      type: 'status_change',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/applications'
    });

    return res.json({
      success: true,
      message: `Application marked as ${status}`,
      application: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const app = db.getCollection('applications').findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (app.studentId !== req.user._id && app.studentEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to withdraw this application' });
    }

    db.getCollection('applications').deleteOne({ _id: id });
    return res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
