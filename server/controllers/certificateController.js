import { getDB } from '../config/db.js';

export const getStudentCertificates = async (req, res) => {
  try {
    const db = getDB();
    const { studentId } = req.query;
    let certs = db.getCollection('certificates').find({}).exec();

    if (req.user.role === 'student') {
      certs = certs.filter(c => c.studentId === req.user._id || c.studentName === req.user.name);
    } else if (studentId) {
      certs = certs.filter(c => c.studentId === studentId);
    }

    return res.json({ success: true, count: certs.length, certificates: certs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      internshipTitle,
      company,
      duration,
      completionDate,
      finalScore
    } = req.body;

    if (!studentId || !internshipTitle) {
      return res.status(400).json({ success: false, message: 'Student and internship details are required' });
    }

    const db = getDB();
    const certId = 'INX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newCert = db.getCollection('certificates').create({
      certificateId: certId,
      studentId,
      studentName: studentName || 'Student',
      internshipTitle,
      company: company || 'InternovaX Partner Organization',
      duration: duration || '12 Weeks',
      completionDate: completionDate || new Date().toISOString().split('T')[0],
      finalScore: Number(finalScore) || 92.5,
      status: 'Issued',
      issuedBy: 'InternovaX Academic & Industry Board',
      verificationUrl: `/verify/${certId}`,
      signatures: [
        { name: req.user.name, title: 'Authorized Signatory' },
        { name: 'Dr. Sarah Jenkins', title: 'Technical Mentor' }
      ]
    });

    // Notify student
    db.getCollection('notifications').create({
      userId: studentId,
      title: 'Certificate of Completion Issued!',
      message: `Congratulations! Your certificate ${certId} for ${internshipTitle} is ready to view.`,
      type: 'certificate',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/certificates'
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: newCert
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Public certificate verification endpoint
export const verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Certificate ID is required' });
    }

    const db = getDB();
    const cleanId = id.trim().toUpperCase();
    const cert = db.getCollection('certificates').findOne({ certificateId: cleanId });

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Certificate with ID "${id}" could not be verified in the InternovaX registry.`
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Certificate verified successfully and authenticated.',
      certificate: cert
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
