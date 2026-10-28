
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getDB } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'internovax_super_secure_jwt_secret_key_2026';

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:3000/api/auth/google/callback';

const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  'http://localhost:3000/api/auth/github/callback';

// --------------------------------------------------
// SHARED HELPERS
// --------------------------------------------------

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are missing from .env');
  }

  return new OAuth2Client(
    clientId,
    clientSecret,
    GOOGLE_CALLBACK_URL
  );
}

function getAvatar(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U'
  );
}

function createStudentProfile(db, user) {
  db.getCollection('students').create({
    userId: user._id,
    name: user.name,
    email: user.email,
    profileCompletion: 60,
    skills: ['JavaScript', 'React', 'HTML', 'CSS'],
    sections: {
      personalInfo: true,
      education: true,
      skills: true,
      resume: false
    }
  });
}

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://internova-x.vercel.app';

function redirectOAuthError(res, message) {
  return res.redirect(
    `${FRONTEND_URL}/#oauth_error=${encodeURIComponent(message)}`
  );
}

// --------------------------------------------------
// GOOGLE LOGIN
// --------------------------------------------------

export const googleLogin = async (req, res) => {
  try {
    const googleClient = getGoogleClient();

    const state = jwt.sign(
      { purpose: 'google-oauth-state' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const authorizationUrl = googleClient.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account'
    });

    return res.redirect(authorizationUrl);
  } catch (err) {
    console.error('Google login setup failed:', err.message);
    return res.status(500).send(
      'Google login could not be started. Check your server environment.'
    );
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return redirectOAuthError(
        res,
        'Google sign-in was cancelled or denied.'
      );
    }

    if (!code || !state) {
      return res.status(400).send(
        'Missing Google authorization code or state.'
      );
    }

    try {
      const decodedState = jwt.verify(state, JWT_SECRET);

      if (decodedState.purpose !== 'google-oauth-state') {
        throw new Error('Invalid OAuth state purpose');
      }
    } catch {
      return res.status(400).send(
        'Invalid or expired Google OAuth state. Please try again.'
      );
    }

    const googleClient = getGoogleClient();

    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: GOOGLE_CALLBACK_URL
    });

    if (!tokens.id_token) {
      throw new Error('Google did not return an ID token');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const profile = ticket.getPayload();

    if (
      !profile ||
      !profile.sub ||
      !profile.email ||
      profile.email_verified !== true
    ) {
      return res.status(401).send(
        'Google account email could not be verified.'
      );
    }

    const email = profile.email.toLowerCase();
    const googleId = profile.sub;
    const name = profile.name || email.split('@')[0];

    const db = getDB();
    const users = db.getCollection('users');

    let user =
      users.findOne({ googleId }) ||
      users.findOne({ email });

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).send(
          'This email is linked to another Google account.'
        );
      }

      if (!user.googleId) {
        user = users.findByIdAndUpdate(user._id, {
          googleId,
          name: user.name || name,
          avatar: user.avatar || getAvatar(name)
        });
      }
    } else {
      user = users.create({
        name,
        email,
        googleId,
        role: 'student',
        avatar: getAvatar(name),
        department: '',
        company: '',
        createdAt: new Date().toISOString()
      });

      createStudentProfile(db, user);
    }

    const token = generateToken(user);

    return res.redirect(
  `${FRONTEND_URL}/#oauth_token=${encodeURIComponent(token)}`
);
  } catch (err) {
    console.error('Google callback failed:', err.message);

    return redirectOAuthError(
      res,
      'Google sign-in failed. Please try again.'
    );
  }
};

// --------------------------------------------------
// GITHUB LOGIN
// --------------------------------------------------

export const githubLogin = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
      throw new Error('GitHub OAuth credentials are missing from .env');
    }

    const state = jwt.sign(
      { purpose: 'github-oauth-state' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: GITHUB_CALLBACK_URL,
      scope: 'read:user user:email',
      state
    });

    return res.redirect(
      'https://github.com/login/oauth/authorize?' + params.toString()
    );
  } catch (err) {
    console.error('GitHub login setup failed:', err.message);

    return res.status(500).send(
      'GitHub login could not be started. Check your server environment.'
    );
  }
};

export const githubCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return redirectOAuthError(
        res,
        'GitHub sign-in was cancelled or denied.'
      );
    }

    if (!code || !state) {
      return redirectOAuthError(
        res,
        'Missing GitHub authorization code or state.'
      );
    }

    // Validate the signed state before exchanging the code.
    try {
      const decodedState = jwt.verify(state, JWT_SECRET);

      if (decodedState.purpose !== 'github-oauth-state') {
        throw new Error('Invalid OAuth state purpose');
      }
    } catch {
      return redirectOAuthError(
        res,
        'Invalid or expired GitHub OAuth state. Please try again.'
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials are missing from .env');
    }

    // Exchange the authorization code for an access token.
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: GITHUB_CALLBACK_URL
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ||
        'GitHub did not return an access token.'
      );
    }

    const githubAccessToken = tokenData.access_token;

    const githubHeaders = {
      Authorization: `Bearer ${githubAccessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'InternovaX'
    };

    // Fetch the GitHub profile.
    const profileResponse = await fetch(
      'https://api.github.com/user',
      { headers: githubHeaders }
    );

    if (!profileResponse.ok) {
      throw new Error('Could not retrieve your GitHub profile.');
    }

    const githubProfile = await profileResponse.json();

    if (!githubProfile.id) {
      throw new Error('GitHub did not return a valid account ID.');
    }

    // Fetch emails because a GitHub profile may hide its public email.
    const emailResponse = await fetch(
      'https://api.github.com/user/emails',
      { headers: githubHeaders }
    );

    if (!emailResponse.ok) {
      throw new Error(
        'Could not retrieve your GitHub email. Please try again.'
      );
    }

    const emails = await emailResponse.json();

    const verifiedEmail = Array.isArray(emails)
      ? emails.find(item => item.primary && item.verified)
      : null;

    if (!verifiedEmail || !verifiedEmail.email) {
      return redirectOAuthError(
        res,
        'Your GitHub account needs a verified primary email to sign in.'
      );
    }

    const email = verifiedEmail.email.toLowerCase();
    const githubId = String(githubProfile.id);
    const name =
      githubProfile.name ||
      githubProfile.login ||
      email.split('@')[0];

    const db = getDB();
    const users = db.getCollection('users');

    let user =
      users.findOne({ githubId }) ||
      users.findOne({ email });

    if (user) {
      // Never silently link a different GitHub identity.
      if (user.githubId && String(user.githubId) !== githubId) {
        return redirectOAuthError(
          res,
          'This email is already linked to another GitHub account.'
        );
      }

      if (!user.githubId) {
        user = users.findByIdAndUpdate(user._id, {
          githubId,
          name: user.name || name,
          avatar: user.avatar || getAvatar(name)
        });
      }
    } else {
      user = users.create({
        name,
        email,
        githubId,
        role: 'student',
        avatar: getAvatar(name),
        department: '',
        company: '',
        createdAt: new Date().toISOString()
      });

      createStudentProfile(db, user);
    }

    const token = generateToken(user);

    // The frontend AuthContext reads this same token format for Google.
    return res.redirect(
      '/#oauth_token=' + encodeURIComponent(token)
    );
  } catch (err) {
    console.error('GitHub callback failed:', err.message);

    return redirectOAuthError(
      res,
      'GitHub sign-in failed. Please check your settings and try again.'
    );
  }
};

// --------------------------------------------------
// EMAIL/PASSWORD REGISTRATION
// --------------------------------------------------

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      department,
      company,
      skills
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const db = getDB();
    const users = db.getCollection('users');
    const normalizedEmail = email.toLowerCase();

    const existing = users.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const normalizedRole = role.toLowerCase();

    const newUser = users.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      avatar: getAvatar(name),
      department: department || '',
      company: company || '',
      createdAt: new Date().toISOString()
    });

    if (normalizedRole === 'student') {
      db.getCollection('students').create({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profileCompletion: 60,
        skills: Array.isArray(skills)
          ? skills
          : ['JavaScript', 'React', 'HTML', 'CSS'],
        sections: {
          personalInfo: true,
          education: true,
          skills: true,
          resume: false
        }
      });
    }

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Registration failed:', err.message);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// --------------------------------------------------
// EMAIL/PASSWORD LOGIN
// --------------------------------------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const db = getDB();

    const user = db.getCollection('users').findOne({
      email: email.toLowerCase()
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login failed:', err.message);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// --------------------------------------------------
// GET CURRENT USER
// --------------------------------------------------

export const getMe = async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let extra = {};

    if (user.role === 'student') {
      extra.studentProfile =
        db.getCollection('students').findOne({
          userId: user._id
        }) ||
        db.getCollection('students').findOne({
          email: user.email
        });
    } else if (user.role === 'mentor') {
      extra.mentorProfile =
        db.getCollection('mentors').findOne({
          userId: user._id
        }) ||
        db.getCollection('mentors').findOne({
          email: user.email
        });
    }

    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      user: { ...userSafe, ...extra }
    });
  } catch (err) {
    console.error('Get current user failed:', err.message);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// --------------------------------------------------
// SWITCH DEMO ROLE
// --------------------------------------------------

export const switchRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const db = getDB();

    const targetUser = db.getCollection('users').findOne({
      role: role.toLowerCase()
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `No demo user found for role ${role}`
      });
    }

    const token = generateToken(targetUser);
    const { password: _, ...userSafe } = targetUser;

    return res.json({
      success: true,
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Role switch failed:', err.message);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
