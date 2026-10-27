import { getDB } from '../config/db.js';

export const getAllMentors = async (req, res) => {
  try {
    const db = getDB();
    const mentors = db.getCollection('mentors').find({}).exec();
    return res.json({ success: true, count: mentors.length, mentors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMentorAllocations = async (req, res) => {
  try {
    const db = getDB();
    const allocations = db.getCollection('mentorAllocations').find({}).exec();
    return res.json({ success: true, count: allocations.length, allocations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const allocateMentor = async (req, res) => {
  try {
    const { studentId, mentorId, internshipId } = req.body;
    if (!studentId || !mentorId) {
      return res.status(400).json({ success: false, message: 'Student and mentor are required' });
    }

    const db = getDB();
    const student = db.getCollection('users').findById(studentId) || db.getCollection('students').findById(studentId);
    const mentor = db.getCollection('mentors').findById(mentorId) || db.getCollection('users').findById(mentorId);
    const internship = internshipId ? db.getCollection('internships').findById(internshipId) : null;

    if (!student || !mentor) {
      return res.status(404).json({ success: false, message: 'Student or mentor not found' });
    }

    // Check if allocation already exists
    const existing = db.getCollection('mentorAllocations').findOne({
      studentId: student._id,
      status: 'Active'
    });

    let allocation;
    if (existing) {
      allocation = db.getCollection('mentorAllocations').findByIdAndUpdate(existing._id, {
        mentorId: mentor._id,
        mentorName: mentor.name,
        internshipId: internship?._id || existing.internshipId,
        internshipTitle: internship?.title || existing.internshipTitle,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        method: 'Manual Allocation'
      });
    } else {
      allocation = db.getCollection('mentorAllocations').create({
        studentId: student._id,
        studentName: student.name,
        mentorId: mentor._id,
        mentorName: mentor.name,
        internshipId: internship?._id || 'int_1',
        internshipTitle: internship?.title || 'Full Stack Web Developer Intern',
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        method: 'Manual Allocation'
      });
    }

    // Update student's mentorId
    db.getCollection('students').updateOne(
      { userId: student._id },
      { mentorId: mentor._id }
    );

    // Notify student and mentor
    db.getCollection('notifications').create({
      userId: student._id,
      title: 'Mentor Allocated',
      message: `${mentor.name} has been assigned as your technical mentor.`,
      type: 'mentor',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/mentor'
    });

    return res.json({
      success: true,
      message: `Allocated mentor ${mentor.name} to ${student.name}`,
      allocation
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Automatic rule-based mentor allocation based on expertise and workload
export const autoAllocateMentor = async (req, res) => {
  try {
    const { studentId, internshipId } = req.body;
    const db = getDB();
    const student = db.getCollection('users').findById(studentId) || db.getCollection('students').findById(studentId);
    const internship = internshipId ? db.getCollection('internships').findById(internshipId) : null;

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const mentors = db.getCollection('mentors').find({}).exec();
    if (mentors.length === 0) {
      return res.status(404).json({ success: false, message: 'No mentors registered in system' });
    }

    const domainKeywords = internship ? [...(internship.requiredSkills || []), internship.title] : ['MERN', 'React', 'Web'];

    // Score mentors by: (1) expertise overlap, (2) available capacity (workload)
    const scoredMentors = mentors.map(m => {
      let expertiseScore = 0;
      const expertiseList = (m.expertise || []).map(e => e.toLowerCase());

      for (const kw of domainKeywords) {
        const lower = kw.toLowerCase();
        if (expertiseList.some(e => e.includes(lower) || lower.includes(e))) {
          expertiseScore += 10;
        }
      }

      const activeInterns = m.activeInternsCount || 0;
      const maxCap = m.maxCapacity || 5;
      const capacityScore = Math.max(0, (maxCap - activeInterns) * 5);

      return {
        mentor: m,
        totalScore: expertiseScore + capacityScore,
        activeInterns,
        maxCap
      };
    });

    scoredMentors.sort((a, b) => b.totalScore - a.totalScore);
    const bestMatch = scoredMentors[0];

    if (!bestMatch || bestMatch.activeInterns >= bestMatch.maxCap) {
      return res.status(400).json({ success: false, message: 'All mentors are currently at maximum capacity' });
    }

    const chosenMentor = bestMatch.mentor;

    const allocation = db.getCollection('mentorAllocations').create({
      studentId: student._id,
      studentName: student.name,
      mentorId: chosenMentor._id,
      mentorName: chosenMentor.name,
      internshipId: internship?._id || 'int_1',
      internshipTitle: internship?.title || 'General Engineering Track',
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      method: 'Rule-Based Automated Match'
    });

    // Increment mentor's active intern count
    db.getCollection('mentors').findByIdAndUpdate(chosenMentor._id, {
      activeInternsCount: (chosenMentor.activeInternsCount || 0) + 1
    });

    return res.json({
      success: true,
      message: `Automatically matched with ${chosenMentor.name} based on expertise and low workload!`,
      allocation
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
