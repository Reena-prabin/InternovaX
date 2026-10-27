import { getDB } from '../config/db.js';

// Calculate skill-based matching percentage
export function calculateSkillMatch(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!studentSkills || studentSkills.length === 0) return 20;

  const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase().trim());
  let matches = 0;

  for (const reqSkill of requiredSkills) {
    const normalizedReq = reqSkill.toLowerCase().trim();
    const hasDirectMatch = normalizedStudentSkills.includes(normalizedReq);
    const hasPartialMatch = normalizedStudentSkills.some(s => s.includes(normalizedReq) || normalizedReq.includes(s));
    
    if (hasDirectMatch) {
      matches += 1;
    } else if (hasPartialMatch) {
      matches += 0.5;
    }
  }

  const score = Math.round((matches / requiredSkills.length) * 100);
  return Math.min(Math.max(score, 15), 100);
}

export const getAllInternships = async (req, res) => {
  try {
    const db = getDB();
    const { search, type, location, minMatch } = req.query;
    let internships = db.getCollection('internships').find({}).exec();

    // Get current student's skills if logged in
    let studentSkills = [];
    if (req.user && req.user.role === 'student') {
      const student = db.getCollection('students').findOne({ userId: req.user._id }) || 
                      db.getCollection('students').findOne({ email: req.user.email });
      if (student && student.skills) {
        studentSkills = student.skills;
      }
    }

    // Attach match score and recommendation flag
    internships = internships.map(item => {
      const matchScore = calculateSkillMatch(studentSkills, item.requiredSkills);
      return {
        ...item,
        matchScore,
        isRecommended: matchScore >= 75
      };
    });

    // Apply filtering
    if (search) {
      const q = search.toLowerCase();
      internships = internships.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.requiredSkills && item.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (type && type !== 'All') {
      internships = internships.filter(item => item.type.toLowerCase() === type.toLowerCase());
    }

    if (location && location !== 'All') {
      internships = internships.filter(item => item.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (minMatch) {
      internships = internships.filter(item => item.matchScore >= parseInt(minMatch, 10));
    }

    // Sort by match score descending if student
    if (studentSkills.length > 0) {
      internships.sort((a, b) => b.matchScore - a.matchScore);
    }

    return res.json({
      success: true,
      count: internships.length,
      internships
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const internship = db.getCollection('internships').findById(id);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    let matchScore = 0;
    if (req.user && req.user.role === 'student') {
      const student = db.getCollection('students').findOne({ userId: req.user._id }) || 
                      db.getCollection('students').findOne({ email: req.user.email });
      if (student && student.skills) {
        matchScore = calculateSkillMatch(student.skills, internship.requiredSkills);
      }
    }

    return res.json({
      success: true,
      internship: {
        ...internship,
        matchScore,
        isRecommended: matchScore >= 75
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createInternship = async (req, res) => {
  try {
    const db = getDB();
    const {
      title,
      company,
      location,
      type,
      stipend,
      duration,
      startDate,
      endDate,
      deadline,
      description,
      requiredSkills,
      eligibility,
      openings
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const newInternship = db.getCollection('internships').create({
      title,
      company: company || req.user.name,
      companyId: req.user._id,
      location: location || 'Remote',
      type: type || 'Full-time',
      stipend: stipend || 'Competitive',
      duration: duration || '12 Weeks',
      startDate: startDate || '',
      endDate: endDate || '',
      deadline: deadline || '',
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : ['React', 'JavaScript']),
      eligibility: eligibility || 'Open to qualified students',
      openings: openings ? parseInt(openings, 10) : 1,
      status: 'Active',
      featured: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Internship created successfully',
      internship: newInternship
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const updated = db.getCollection('internships').findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    return res.json({ success: true, message: 'Internship updated', internship: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const result = db.getCollection('internships').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    return res.json({ success: true, message: 'Internship deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
