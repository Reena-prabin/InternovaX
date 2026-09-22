import {
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const stats = [
  {
    title: "Applications",
    value: "12",
    change: "+3 this week",
    icon: FileText,
  },
  {
    title: "Shortlisted",
    value: "4",
    change: "+1 this week",
    icon: CheckCircle2,
  },
  {
    title: "Active Internship",
    value: "1",
    change: "In progress",
    icon: Briefcase,
  },
  {
    title: "Profile Completion",
    value: "85%",
    change: "Almost complete",
    icon: User,
  },
];

const recommendedInternships = [
  {
    company: "TechNova Solutions",
    role: "Full Stack Developer Intern",
    location: "Chennai",
    mode: "Hybrid",
    stipend: "₹15,000/month",
    match: "92%",
  },
  {
    company: "CodeSphere Technologies",
    role: "MERN Stack Intern",
    location: "Bangalore",
    mode: "Remote",
    stipend: "₹12,000/month",
    match: "87%",
  },
  {
    company: "DataMind Labs",
    role: "Data Science Intern",
    location: "Chennai",
    mode: "On-site",
    stipend: "₹10,000/month",
    match: "81%",
  },
];

const applications = [
  {
    company: "TechNova Solutions",
    role: "Full Stack Developer Intern",
    date: "18 Sep 2026",
    status: "Shortlisted",
  },
  {
    company: "InnovateX Labs",
    role: "Frontend Developer Intern",
    date: "15 Sep 2026",
    status: "Under Review",
  },
  {
    company: "CloudCore",
    role: "Backend Developer Intern",
    date: "10 Sep 2026",
    status: "Applied",
  },
];

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Internships", icon: Briefcase },
  { name: "Applications", icon: FileText },
  { name: "Progress", icon: TrendingUp },
  { name: "Mentor", icon: Users },
  { name: "Messages", icon: MessageSquare },
  { name: "Profile", icon: User },
];

function StatusBadge({ status }) {
  const styles = {
    Shortlisted: "bg-emerald-50 text-emerald-700",
    "Under Review": "bg-amber-50 text-amber-700",
    Applied: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-600">
              InternovaX
            </h1>
            <p className="text-xs text-slate-400">
              Internship Management
            </p>
          </div>

          <button
            className="rounded-lg p-2 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;

              return (
                <button
                  key={item.name}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Settings size={19} />
            Settings
          </button>

          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
            <LogOut size={19} />
            Logout
          </button>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
              RP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Student</p>
              <p className="truncate text-xs text-slate-400">
                student@internovax.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Student Portal
              </p>
              <h2 className="text-lg font-bold">Dashboard</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={17} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search internships..."
                className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 sm:flex">
              RP
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5 md:p-8">
          <section className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-2 text-sm font-medium text-indigo-100">
                  Tuesday, September 22, 2026
                </p>

                <h1 className="text-2xl font-bold md:text-3xl">
                  Welcome back, Student! 👋
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100 md:text-base">
                  Track your internship applications, monitor your progress,
                  and discover opportunities matched to your skills.
                </p>
              </div>

              <button className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50">
                <Search size={18} />
                Find Internships
              </button>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                      <Icon size={21} />
                    </div>

                    <TrendingUp size={17} className="text-emerald-500" />
                  </div>

                  <p className="mt-4 text-sm text-slate-500">{stat.title}</p>

                  <div className="mt-1 flex items-end justify-between gap-2">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <span className="text-xs font-medium text-emerald-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Profile Completion</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete your profile to improve internship matches.
                  </p>
                </div>

                <span className="text-lg font-bold text-indigo-600">85%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[85%] rounded-full bg-indigo-600" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Personal Info", true],
                  ["Education", true],
                  ["Skills", true],
                  ["Resume", false],
                ].map(([item, complete]) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"
                  >
                    <CheckCircle2
                      size={17}
                      className={
                        complete ? "text-emerald-500" : "text-slate-300"
                      }
                    />
                    <span className="text-xs font-medium text-slate-600">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Complete profile →
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <Target size={21} />
                </div>
                <div>
                  <h2 className="font-bold">Weekly Progress</h2>
                  <p className="text-xs text-slate-400">Week 4</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-indigo-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-slate-400">Complete</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reports submitted</span>
                  <span className="font-semibold">4/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mentor reviews</span>
                  <span className="font-semibold">3/4</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  AI Skill Match
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Recommended Internships
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Opportunities matched with your skills and profile.
                </p>
              </div>

              <button className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 sm:flex">
                View all
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {recommendedInternships.map((internship) => (
                <div
                  key={internship.company}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600">
                      {internship.company.charAt(0)}
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                      {internship.match} Match
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-medium text-slate-400">
                    {internship.company}
                  </p>

                  <h3 className="mt-1 font-bold">{internship.role}</h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {internship.location}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {internship.mode}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm font-semibold text-slate-700">
                      {internship.stipend}
                    </span>

                    <button className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Recent Applications</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track your latest internship applications.
                  </p>
                </div>

                <button className="text-sm font-semibold text-indigo-600">
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-3 font-semibold">Company</th>
                      <th className="pb-3 font-semibold">Position</th>
                      <th className="pb-3 font-semibold">Applied</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => (
                      <tr
                        key={application.company}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                              {application.company.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold">
                              {application.company}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 text-sm text-slate-500">
                          {application.role}
                        </td>

                        <td className="py-4 text-sm text-slate-500">
                          {application.date}
                        </td>

                        <td className="py-4">
                          <StatusBadge status={application.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Upcoming</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your important internship activities.
                  </p>
                </div>

                <CalendarDays className="text-indigo-600" size={21} />
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-indigo-600">
                    SEP 24
                  </p>
                  <h3 className="mt-1 text-sm font-bold">
                    Weekly Progress Report
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Submit your Week 5 report.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-indigo-600">
                    SEP 26
                  </p>
                  <h3 className="mt-1 text-sm font-bold">
                    Mentor Review
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Review meeting with your assigned mentor.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-indigo-600">
                    SEP 30
                  </p>
                  <h3 className="mt-1 text-sm font-bold">
                    Internship Evaluation
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Monthly progress evaluation.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}