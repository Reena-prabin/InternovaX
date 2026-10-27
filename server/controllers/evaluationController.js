import { getDB } from '../config/db.js';

export const getEvaluations = async (req, res) => {
  try {
    const db = getDB();
    const { studentId } = req.query;
    let evals = db.getCollection('evaluations').find({}).exec();

    if (req.user.role === 'student') {
      evals = evals.filter(e => e.studentId === req.user._id || e.studentName === req.user.name);
    } else if (studentId) {
      evals = evals.filter(e => e.studentId === studentId);
    }

    return res.json({ success: true, count: evals.length, evaluations: evals });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitEvaluation = async (req, res) => {
  try {
    const {
      studentId,
      internshipId,
      internshipTitle,
      scores,
      feedback,
      recommendationForCertificate
    } = req.body;

    if (!studentId || !scores) {
      return res.status(400).json({ success: false, message: 'Student and evaluation scores are required' });
    }

    const {
      technicalSkills = 80,
      communication = 80,
      workQuality = 80,
      punctuality = 80,
      overallPerformance = 80
    } = scores;

    // Automated final score calculation using weighted formula:
    // Technical Skills: 30%, Work Quality: 25%, Overall Performance: 20%, Communication: 15%, Punctuality: 10%
    const finalScore = Number((
      (Number(technicalSkills) * 0.30) +
      (Number(workQuality) * 0.25) +
      (Number(overallPerformance) * 0.20) +
      (Number(communication) * 0.15) +
      (Number(punctuality) * 0.10)
    ).toFixed(1));

    const db = getDB();
    const student = db.getCollection('users').findById(studentId) || db.getCollection('students').findById(studentId);

    const newEval = db.getCollection('evaluations').create({
      studentId,
      studentName: student?.name || 'Student',
      internshipId: internshipId || 'int_1',
      internshipTitle: internshipTitle || 'Full Stack Web Developer Intern',
      evaluatorId: req.user._id,
      evaluatorName: req.user.name,
      evaluatorRole: req.user.role,
      scores: {
        technicalSkills: Number(technicalSkills),
        communication: Number(communication),
        workQuality: Number(workQuality),
        punctuality: Number(punctuality),
        overallPerformance: Number(overallPerformance)
      },
      finalScore,
      feedback: feedback || 'Performance meets professional standards.',
      status: 'Completed',
      evaluatedDate: new Date().toISOString().split('T')[0],
      recommendationForCertificate: Boolean(recommendationForCertificate)
    });

    // Notify student
    db.getCollection('notifications').create({
      userId: studentId,
      title: 'Internship Evaluation Completed',
      message: `Your final evaluation has been submitted with an overall score of ${finalScore}/100.`,
      type: 'evaluation',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/progress'
    });

    // If recommended for certificate, generate certificate record automatically
    if (recommendationForCertificate && finalScore >= 70) {
      const certId = 'INX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const existingCert = db.getCollection('certificates').findOne({ studentId });
      if (!existingCert) {
        db.getCollection('certificates').create({
          certificateId: certId,
          studentId,
          studentName: student?.name || 'Student',
          internshipTitle: internshipTitle || 'Full Stack Web Developer Intern',
          company: req.user.company || req.user.name,
          duration: '12 Weeks',
          completionDate: new Date().toISOString().split('T')[0],
          finalScore,
          status: 'Issued',
          issuedBy: 'InternovaX Board',
          verificationUrl: `/verify/${certId}`,
          signatures: [
            { name: req.user.name, title: 'Lead Evaluator' },
            { name: 'InternovaX Directorate', title: 'Dean of Technology' }
          ]
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Evaluation submitted and final score calculated',
      evaluation: newEval,
      finalScore
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
