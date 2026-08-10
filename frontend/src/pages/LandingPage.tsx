import { useNavigate } from 'react-router-dom';
import { Kanban, ArrowRight, Sparkles, Layout, Layers, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Layout,
      title: 'Visual Boards',
      description: 'Organize your tasks visually with intuitive Kanban-style columns. Move items dynamically as you progress.',
    },
    {
      icon: Sparkles,
      title: 'Easy Management',
      description: 'Prioritize tasks, add tags, and track your team’s progress in real-time without clutter or complexity.',
    },
    {
      icon: Layers,
      title: 'Clean Workspace',
      description: 'Minimize distractions. Our minimalist workspace helps you and your team stay focused on delivering value.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-primary-100 selection:text-primary-800">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-primary-600 rounded-lg text-white shadow-md shadow-primary-600/10">
              <Kanban className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              CollabBoard
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-primary-600 transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-primary-600 transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Login
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/register')}
              className="flex items-center gap-1.5 shadow-lg shadow-primary-600/15"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24 flex items-center justify-center">
          {/* Subtle decoration background grids/circles */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 right-0 -z-10 translate-x-[20%] -translate-y-[20%] w-[500px] h-[500px] rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-10 -translate-x-[20%] translate-y-[20%] w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-3xl" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100 mb-6 animate-fade-in shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              Meet the Next-Gen Task Management
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto">
              Collaborate, Manage, &{' '}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Deliver Projects
              </span>{' '}
              Fluidly
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The flexible and visual Kanban board system for teams to map custom workflows, track progress, tasks, and accomplish goals together.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3.5 text-base shadow-xl shadow-primary-600/25 flex items-center justify-center gap-2"
              >
                Get Started for Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const element = document.getElementById('about');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-8 py-3.5 text-base border-slate-200/80 hover:bg-slate-50 flex items-center justify-center"
              >
                Learn More
              </Button>
            </div>

            {/* Interactive Preview Container */}
            <div className="mt-16 sm:mt-20 border border-slate-200/80 rounded-2xl bg-white/60 backdrop-blur-sm p-4 sm:p-6 shadow-2xl relative">
              <div className="absolute inset-0 bg-slate-950/5 rounded-2xl -z-10 blur-xl translate-y-3" />
              {/* Dummy board layout to visualize the app */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none pointer-events-none">
                {/* To Do Column */}
                <div className="flex-1 min-w-[250px] bg-slate-50/50 rounded-xl p-3 border border-slate-200/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Do</span>
                    <span className="h-5 w-5 rounded-full bg-slate-200/60 text-slate-600 text-xs font-semibold flex items-center justify-center">2</span>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">Design</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 text-left">Create landing page design mockup</h4>
                    <p className="text-xs text-slate-500 text-left line-clamp-2">Outline key copy details and high-fidelity visuals.</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">Research</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 text-left">Analyze competitor landing pages</h4>
                    <p className="text-xs text-slate-500 text-left line-clamp-2">Gather patterns for hero copy and features grid navigation.</p>
                  </div>
                </div>

                {/* Doing Column */}
                <div className="flex-1 min-w-[250px] bg-slate-50/50 rounded-xl p-3 border border-slate-200/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Doing</span>
                    <span className="h-5 w-5 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold flex items-center justify-center">1</span>
                  </div>
                  <div className="bg-white border border-primary-200 rounded-lg p-3 shadow-sm ring-1 ring-primary-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-50 text-primary-700">Frontend</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 text-left">Implement React App routing config</h4>
                    <p className="text-xs text-slate-500 text-left line-clamp-2">Replace default route redirection and integrate LandingPage.</p>
                  </div>
                </div>

                {/* Done Column */}
                <div className="flex-1 min-w-[250px] bg-slate-50/50 rounded-xl p-3 border border-slate-200/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Done</span>
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center">1</span>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-lg p-3 shadow-sm opacity-75 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">Setup</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 text-left line-through">Configure project dependencies</h4>
                    <p className="text-xs text-slate-500 text-left line-clamp-2">Ensure Tailwind CSS and Lucide React packages are ready.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / About Section */}
        <section id="about" className="py-20 border-t border-b border-slate-200 bg-white/40 backdrop-blur-sm scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Supercharge Your Project Productivity
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                A simple Kanban tool designed to make collaboration direct, visual, and highly efficient. No long loading times or convoluted configuration.
              </p>
            </div>

            <div id="features" className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="relative group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="inline-flex p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-900 to-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 translate-x-[20%] -translate-y-[20%] w-[600px] h-[600px] rounded-full bg-primary-500/20 blur-3xl" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to streamline your workflow?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-primary-200 max-w-xl">
              Equip your remote or in-house team with the ultimate simple, responsive visual Board dashboard. Start managing tasks for free today.
            </p>
            <div className="mt-8 flex justify-center w-full">
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary-950 hover:bg-slate-100 shadow-xl shadow-white/10 hover:shadow-white/20 font-bold transition-all text-base border-none duration-150 flex items-center justify-center gap-2"
              >
                Sign Up & Create Your First Board
                <ArrowRight className="h-5 w-5 text-primary-950" />
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-primary-300 font-medium">
              <ShieldCheck className="h-4.5 w-4.5" />
              No credit card required • Instant dashboard setup
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Kanban className="h-5 w-5 text-primary-400" />
            <span className="font-bold text-white tracking-wide">CollabBoard</span>
          </div>
          <p>© {new Date().getFullYear()} CollabBoard. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}