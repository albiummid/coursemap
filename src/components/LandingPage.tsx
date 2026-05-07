import { type ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Rocket,
  Shield,
  Zap,
  ArrowRight,
  Github,
  Check,
  Globe,
  Users,
  Code2,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourseTree } from '@/utils/contentLoader';

export default function LandingPage(): ReactNode {
  const tree = useMemo(() => getCourseTree(), []);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f0f0f5] selection:bg-amber-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 z-[1000] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl font-heading">
            <BookOpen className="text-amber-500" size={24} />
            <span>CourseMap</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium text-[#a0a0b8] hover:text-amber-500 transition-colors">Features</a>
            <a href="#courses" className="text-sm font-medium text-[#a0a0b8] hover:text-amber-500 transition-colors">Courses</a>
            <a href="#pricing" className="text-sm font-medium text-[#a0a0b8] hover:text-amber-500 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to={tree.courses[0]?.modules[0]?.lessons[0]?.path ?? "/"} className="text-sm font-semibold hover:text-amber-500 transition-colors">
              Sign In
            </Link>
            <Link to={tree.courses[0]?.modules[0]?.lessons[0]?.path ?? "/"} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-amber-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-52 pb-20 px-6 text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium text-[#a0a0b8]">
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">New</span>
                <span>v2.0 with GitHub integration</span>
                <ArrowRight size={12} />
              </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              Build & Learn <br className="hidden md:block" />
              Technical Engineering.
            </h1>

            <p className="text-lg md:text-xl text-[#a0a0b8] max-w-2xl mx-auto mb-10 leading-relaxed">
              The professional framework for technical education. Scale your curriculum with code,
              git-sync your content, and provide a premium learning experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={tree.courses[0]?.modules[0]?.lessons[0]?.path ?? "/"} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group">
                Start Learning Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://github.com" className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2">
                <Github size={18} /> View Source
              </a>
            </div>
          </motion.div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full opacity-50"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center">
          <div>
            <div className="text-3xl font-black text-white mb-1">10k+</div>
            <div className="text-xs uppercase tracking-widest text-[#6b6b82] font-bold">Learners</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10 mx-auto"></div>
          <div>
            <div className="text-3xl font-black text-white mb-1">500+</div>
            <div className="text-xs uppercase tracking-widest text-[#6b6b82] font-bold">Lessons</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10 mx-auto"></div>
          <div>
            <div className="text-3xl font-black text-white mb-1">99.9%</div>
            <div className="text-xs uppercase tracking-widest text-[#6b6b82] font-bold">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-5xl font-black mt-4 tracking-tight">Scale your education.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Zap />, title: "Lazy Loading", desc: "Instantly load massive courses with our async architecture.", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: <Code2 />, title: "Playground", desc: "Native code execution in the browser with zero config.", color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: <Globe />, title: "Git-Sync", desc: "Sync your curriculum directly from GitHub repositories.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: <Cpu />, title: "SaaS Core", desc: "Enterprise-grade auth, progress, and team management.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((f, i) => (
            <div key={i} className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl hover:bg-white/[0.04] transition-all group">
              <div className={`${f.bg} ${f.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-[#a0a0b8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Library</span>
              <h2 className="text-3xl md:text-4xl font-black mt-4 tracking-tight">Hand-picked paths.</h2>
            </div>
            <Link to="/" className="text-sm font-bold text-amber-500 flex items-center gap-2 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tree.courses.map((course) => (
              <Link key={course.slug} to={course.modules[0]?.lessons[0]?.path ?? "/"} className="flex flex-col bg-[#111118] border border-white/5 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-all hover:-translate-y-2 shadow-2xl">
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <BookOpen size={48} className="text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-[#6b6b82] uppercase">{course.language}</span>
                    <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-[#6b6b82]">12h</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{course.title}</h3>
                  <p className="text-sm text-[#a0a0b8] mb-8 flex-1 line-clamp-3">{course.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">{course.author[0]}</div>
                      <span className="text-xs font-semibold text-[#a0a0b8]">{course.author}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pricing</span>
        <h2 className="text-3xl md:text-5xl font-black mt-12 mb-16 tracking-tight">Transparent plans.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Hobby", price: "$0", desc: "For individual developers.", features: ["All free courses", "Community support", "Basic playground"], popular: false },
            { title: "Pro", price: "$19", desc: "For career acceleration.", features: ["Everything in Hobby", "Certificates", "Priority Support", "Private Repos"], popular: true },
            { title: "Team", price: "$49", desc: "For small engineering teams.", features: ["Everything in Pro", "Team Analytics", "SSO & SAML", "Custom Branding"], popular: false }
          ].map((p, i) => (
            <div key={i} className={`p-10 rounded-[32px] text-left relative flex flex-col ${p.popular ? 'bg-white/[0.04] border-2 border-amber-500 shadow-2xl shadow-amber-500/10' : 'bg-white/[0.02] border border-white/5'}`}>
              {p.popular && <div className="absolute -top-3 right-8 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Most Popular</div>}
              <h3 className="text-lg font-bold mb-4">{p.title}</h3>
              <div className="text-4xl font-black mb-2">{p.price}<span className="text-sm font-medium text-[#6b6b82]">/mo</span></div>
              <p className="text-sm text-[#6b6b82] mb-8">{p.desc}</p>
              <ul className="space-y-4 mb-10 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-medium text-[#a0a0b8]">
                    <Check size={14} className="text-amber-500" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${p.popular ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 max-w-7xl mx-auto px-6 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-6">
              <BookOpen className="text-amber-500" size={24} />
              <span>CourseMap</span>
            </div>
            <p className="text-sm text-[#6b6b82] leading-relaxed">Scaling technical education with engineering principles.</p>
          </div>
          {["Product", "Company", "Resources"].map((title, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold mb-6">{title}</h4>
              <ul className="space-y-4">
                {["Links coming soon", "Terms of Service", "Privacy Policy"].map((l, j) => (
                  <li key={j}><a href="#" className="text-sm text-[#6b6b82] hover:text-amber-500 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:row justify-between items-center pt-8 border-t border-white/5 text-[11px] font-bold text-[#4a4a60] uppercase tracking-widest">
          <p>© 2026 ByteLab Inc.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Github size={18} />
            <Users size={18} />
            <Globe size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
}
