# INTERNOVAX: Internship Management & Monitoring Platform

**InternovaX** is a centralized full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to manage and monitor the complete internship lifecycle connecting **Students**, **Companies**, **Mentors**, and **Administrators**.

---

## 1. Technology Stack (Pure MERN)

- **Frontend**: React.js (JavaScript, JSX, Component Architecture)
- **Styling**: Pure CSS (`src/index.css`) with bespoke dark aesthetic (`#0D0D0D` base, `#151515` cards, `#B7FF3C` neon lime accent)
- **Icons**: Hand-crafted inline SVG icons (Zero external icon library dependencies)
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB (Mongoose driver + auto-embedded document store with JSON persistence)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing & Role-Based Access Control (RBAC)

---

## 2. Key Modules & Features

1. **Student Portal & Dashboard**:
   - Matches the reference design with 4 core statistics: Applications (12), Shortlisted (4), Active Internship (1), Profile Completion (85%).
   - Dynamic Profile Completion checklist (Personal Info, Education, Skills, Resume).
   - Circular Weekly Milestone progress ring (78% Complete, 4/5 reports, 3/4 reviews).
   - Real-time skill-based recommendation engine calculating overlap percentages (e.g. 95% Match).
2. **Internship Discovery & Applications**:
   - Filter, search, and 1-click apply with personalized cover letter.
   - Status tracking pipeline: `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Selected` ➔ `Rejected`.
3. **Weekly Progress Reports**:
   - Comprehensive weekly submission form (Tasks completed, challenges, learnings, next week plan, documents).
   - Mentor feedback review cards with grading scores (e.g. 96/100).
4. **Mentor Supervision & Evaluations**:
   - Supervise assigned student interns.
   - Grade and approve weekly reports with written feedback.
   - Conduct 5-dimensional weighted evaluations (Technical 30%, Quality 25%, Overall 20%, Communication 15%, Punctuality 10%).
5. **Administrator Governance & Mentor Allocation**:
   - Manage user registries (Students, Mentors, Companies, Admins).
   - Rule-based automated mentor matching engine factoring in technical domain expertise and workload capacity.
   - Manual override mentor assignment.
6. **Certificate Generation & Verification**:
   - Automated certificate generation for evaluated interns with score ≥ 70.
   - Official Certificate Viewer with print/PDF preview and signatures.
   - Public Certificate Verification page (`/verify/:id`) to check authenticity via Certificate ID (e.g. `INX-2026-8842`).
7. **Internal Messaging & Notifications**:
   - Direct REST messaging between Student, Mentor, Company, and Admin.
   - Interactive notification center in the top navigation.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Local server port | `3000` |
| `MONGODB_URI` | MongoDB connection string (leave empty for built-in embedded store) | *(Optional)* |
| `JWT_SECRET` | Secret key for JWT session tokens | `internovax_production_secret_key_2026` |

---

## 4. Local Installation & Startup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
The full-stack application will launch at `http://localhost:3000`.

### Step 3: Production Build
```bash
npm run build
npm start
```

---

## 5. Sample Login Credentials

All demo accounts are pre-seeded with password: `password123`.

You can also use the live **ROLE** switcher pill in the top navigation bar to test all views instantly!

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Student** | `student@internovax.com` | `password123` | Dashboard, Apply, Weekly Reports, Mentorship, Profile |
| **Company** | `company@internovax.com` | `password123` | Post Internships, Screen Candidates, Shortlist, Select |
| **Mentor** | `mentor@internovax.com` | `password123` | Supervise Interns, Grade Weekly Reports, Final Evaluation |
| **Admin** | `admin@internovax.com` | `password123` | Mentor Allocation, User Directory, Certificate Issuance |

---

## 6. Certificate Verification Example

- Sample Certificate ID: `INX-2026-8842`
- Go to the **Verify Certificate** tab in the sidebar and enter the ID to verify student credentials, final evaluation score (93.8/100), and issuing board authorization.
