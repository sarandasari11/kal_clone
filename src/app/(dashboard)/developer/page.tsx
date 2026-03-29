import { auth } from '@/lib/auth'
import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export default async function DeveloperPage() {
  await auth()
  const name = "Dasari Veera Venkata Nooka Surya Saran"
  const email = "dasarisaran2005@gmail.com"
  const phone = "+91-8985864150"
  const location = "Anakapalle, India"

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(125deg,#eef2ff_0%,#f8fafc_45%,#ecfeff_100%)] p-8 shadow-sm md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl opacity-60" />
        
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700 backdrop-blur-sm">
              <Sparkles size={14} className="animate-pulse" />
              AI/ML & Full-Stack Developer
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                {name}
              </h1>
              <p className="max-w-2xl text-lg font-semibold text-slate-600 leading-relaxed">
                Detail-oriented AI/ML and Data Science professional with hands-on experience in building and evaluating machine learning, 
                deep learning, NLP, and time-series models.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Mail size={18} className="text-blue-500" />
                {email}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Phone size={18} className="text-blue-500" />
                {phone}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <MapPin size={18} className="text-blue-500" />
                {location}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <a
                href="https://www.linkedin.com/in/saran-dasari-295812290"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
              >
                <LinkedinIcon size={18} />
                LinkedIn
              </a>
              <a
                href="https://github.com/sarandasari11"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
              >
                <GithubIcon size={18} />
                GitHub
              </a>
            </div>
          </div>

          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute -inset-4 animate-pulse rounded-[3rem] bg-gradient-to-tr from-blue-200 to-cyan-200 blur-2xl opacity-50" />
            <div className="relative h-72 w-60 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl">
              <Image
                src="/saran formal.jpg"
                alt="Saran's portrait"
                fill
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column: Skills & Education */}
        <div className="space-y-12 lg:col-span-1">
          {/* Skills Section */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Code2 size={24} />
              </div>
              Skills
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'C++', 'SQL', 'MongoDB', 'Flask', 'Git', 'VsCode', 'Postman', 'HTML', 'CSS', 'AI/ML'].map((skill) => (
                    <span key={skill} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-hover hover:border-blue-200 hover:text-blue-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['Adaptability', 'Creative Problem Solving', 'Teamwork', 'Time Management', 'Analytical thinking', 'Multitasking'].map((skill) => (
                    <span key={skill} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Education Section */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <GraduationCap size={24} />
              </div>
              Education
            </h2>
            <div className="space-y-8">
              <div className="relative border-l-2 border-emerald-100 pl-6">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                <p className="text-xs font-black uppercase text-emerald-600">2023 - Present</p>
                <h3 className="font-bold text-slate-900 leading-tight">Chandigarh University</h3>
                <p className="text-sm font-bold text-slate-500">B.E. in CS AI/ML</p>
                <span className="mt-2 inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">GPA: 8.00</span>
              </div>
              
              <div className="relative border-l-2 border-slate-100 pl-6">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-300 border-4 border-white shadow-sm" />
                <p className="text-xs font-black uppercase text-slate-400">2021 - 2023</p>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Sri Chaitanya Junior College</h3>
                <p className="text-xs font-bold text-slate-500">Board of Intermediate Ed.</p>
                <span className="mt-1 inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">80.5%</span>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Award size={24} />
              </div>
              Certificates
            </h2>
            <div className="space-y-4">
              <a
                href="https://drive.google.com/file/d/1thLMGCsFgUaOyDb9FBXAb_XmETnl2eFa/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Azure AI Fundamentals</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Microsoft • Nov 2025</p>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-amber-500" />
              </a>
              <a
                href="https://drive.google.com/file/d/1Opcj1B5JOTVcNHuNYKbGiJu1bst_mHuq/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Oracle Data Science</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Oracle • Nov 2025</p>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-amber-500" />
              </a>
            </div>
          </section>
        </div>

        {/* Right Column: Experience & Projects */}
        <div className="space-y-12 lg:col-span-2">
          {/* Experience Section */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Briefcase size={24} />
              </div>
              Experience
            </h2>
            <div className="space-y-8">
              {[
                {
                  company: "YHills",
                  role: "Artificial Intelligence Intern",
                  date: "Jun 2025 - Aug 2025",
                  desc: "Completed an industry-oriented AI internship covering machine learning, deep learning, and applied AI workflows."
                },
                {
                  company: "Placify",
                  role: "Full Stack Web Development Intern",
                  date: "Jun 2025 - Aug 2025",
                  desc: "Focused on both frontend and backend using HTML, CSS, JavaScript and backend integration concepts."
                }
              ].map((exp, i) => (
                <div key={i} className="group relative rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">{exp.role}</h3>
                      <p className="font-bold text-purple-600">{exp.company}</p>
                    </div>
                    <span className="inline-block rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      {exp.date}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {exp.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section className="space-y-8">
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BookOpen size={24} />
              </div>
              Projects & Research
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Sales Forecasting for Retail",
                  tech: "Python, XGBoost, Streamlit",
                  desc: "Demand forecasting model using time-series feature engineering to reduce understocking and overstocking risks."
                },
                {
                  title: "Sentiment Analysis on Social Media",
                  tech: "LSTM, TensorFlow, Keras",
                  desc: "NLP models for sentiment classification (positive, negative, neutral) on preprocessed tweets and reviews."
                },
                {
                  title: "Skin Cancer Detection",
                  tech: "CNN, DenseNet121, SVM",
                  desc: "Developing a hybrid CNN-ML ensemble for early skin cancer detection using the HAM10000 dataset. (Ongoing)"
                }
              ].map((project, i) => (
                <div key={i} className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50/30 p-6 transition-all hover:bg-white hover:shadow-lg">
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Code2 size={16} className="text-cyan-500" />
                  </div>
                  <h3 className="mb-1 text-base font-black text-slate-900">{project.title}</h3>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-cyan-600">{project.tech}</p>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {project.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}


