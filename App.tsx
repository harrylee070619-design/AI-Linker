import React, { useState, useEffect } from 'react';
import { User, Project, UserRole, ViewState } from './types';
import { ProjectCard } from './components/ProjectCard';
import { SimpleBarChart, ActivityLineChart } from './components/Charts';
import { 
  Layout, 
  Search, 
  Bell, 
  Menu, 
  Plus, 
  LogOut, 
  User as UserIcon, 
  Briefcase, 
  LayoutDashboard,
  Compass,
  X,
  UploadCloud,
  CheckCircle,
  MessageSquare,
  Heart
} from 'lucide-react';
import { generatePitchSummary } from './services/geminiService';

// --- MOCK DATA ---
const MOCK_USERS: Record<string, User> = {
  DEV: {
    id: 'u1',
    name: 'Alex Chen',
    role: UserRole.DEVELOPER,
    avatar: 'https://picsum.photos/id/1005/100/100',
    bio: 'AI Researcher specializing in Computer Vision and Edge Computing.',
    tags: ['Computer Vision', 'Edge AI', 'Python', 'PyTorch'],
    organization: 'Neural Edge Labs'
  },
  INV: {
    id: 'u2',
    name: 'Sarah Ventris',
    role: UserRole.INVESTOR,
    avatar: 'https://picsum.photos/id/1011/100/100',
    bio: 'Angel Investor focused on early-stage DeepTech and GenAI infrastructure.',
    tags: ['GenAI', 'SaaS', 'Infrastructure', 'Healthcare'],
    budgetRange: '$50k - $200k'
  }
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Alex Chen',
    authorAvatar: 'https://picsum.photos/id/1005/100/100',
    title: 'VisionGuard Edge',
    description: 'A low-latency computer vision system designed for manufacturing safety. Detects worker proximity to hazardous machinery in real-time using lightweight models deployed on edge devices.',
    tags: ['Computer Vision', 'IoT', 'Safety'],
    imageUrl: 'https://picsum.photos/id/180/800/600',
    fundingGoal: 150000,
    currentFunding: 45000,
    likes: 124,
    views: 3420,
    postedAt: '2023-10-15'
  },
  {
    id: 'p2',
    authorId: 'u3',
    authorName: 'Maria Rodriguez',
    authorAvatar: 'https://picsum.photos/id/1025/100/100',
    title: 'MediSynth AI',
    description: 'Generative AI platform for creating synthetic medical data to train diagnostic models without compromising patient privacy. Compliant with HIPAA and GDPR.',
    tags: ['GenAI', 'Healthcare', 'Privacy'],
    imageUrl: 'https://picsum.photos/id/2/800/600',
    fundingGoal: 500000,
    currentFunding: 480000,
    likes: 890,
    views: 12050,
    postedAt: '2023-10-20'
  },
  {
    id: 'p3',
    authorId: 'u4',
    authorName: 'David Kim',
    authorAvatar: 'https://picsum.photos/id/1012/100/100',
    title: 'AgriDrone Swarm',
    description: 'Autonomous drone swarms for precision agriculture. Uses spectral imaging to detect crop stress and optimize water usage.',
    tags: ['Robotics', 'Agriculture', 'Sustainability'],
    imageUrl: 'https://picsum.photos/id/212/800/600',
    fundingGoal: 200000,
    currentFunding: 25000,
    likes: 56,
    views: 890,
    postedAt: '2023-10-22'
  },
  {
    id: 'p4',
    authorId: 'u1',
    authorName: 'Alex Chen',
    authorAvatar: 'https://picsum.photos/id/1005/100/100',
    title: 'CodeWhisper Open',
    description: 'Open source code completion model specifically fine-tuned for legacy banking systems (COBOL/Fortran).',
    tags: ['NLP', 'FinTech', 'DevTools'],
    imageUrl: 'https://picsum.photos/id/60/800/600',
    fundingGoal: 75000,
    currentFunding: 10000,
    likes: 342,
    views: 5600,
    postedAt: '2023-10-25'
  }
];

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.DEV);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dev Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [newProject, setNewProject] = useState<Partial<Project>>({ title: '', description: '', tags: [] });
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Switch Role Helper
  const toggleRole = () => {
    setCurrentUser(prev => prev.role === UserRole.DEVELOPER ? MOCK_USERS.INV : MOCK_USERS.DEV);
    setCurrentView('HOME');
  };

  // --- VIEWS ---

  const renderHeader = () => (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('HOME')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">AL</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AI-Linker</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('HOME')}
              className={`text-sm font-medium transition-colors ${currentView === 'HOME' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setCurrentView('DASHBOARD')}
              className={`text-sm font-medium transition-colors ${currentView === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
              <button onClick={toggleRole} className="text-xs text-blue-600 font-medium hover:underline">
                Switch to {currentUser.role === UserRole.DEVELOPER ? 'Investor' : 'Developer'}
              </button>
            </div>
            <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );

  const renderExplore = () => {
    const filteredProjects = projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover Innovation</h1>
            <p className="text-slate-500">Connecting {currentUser.role === UserRole.INVESTOR ? 'visionary capital' : 'breakthrough technology'} with the future.</p>
          </div>
          {currentUser.role === UserRole.DEVELOPER && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
            >
              <Plus size={18} /> Publish Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              currentUser={currentUser}
              onViewDetail={(p) => { setSelectedProject(p); setCurrentView('PROJECT_DETAIL'); }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (currentUser.role === UserRole.DEVELOPER) {
      // Developer Dashboard
      const myProjects = projects.filter(p => p.authorId === currentUser.id);
      const viewsData = myProjects.map(p => ({ name: p.title.substring(0, 10), views: p.views, likes: p.likes }));
      
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Developer Analytics</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
               <ActivityLineChart data={viewsData} title="Project Engagement (Last 30 Days)" />
            </div>
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">Profile Strength</h3>
                  <div className="flex items-center justify-center py-4">
                     <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-blue-50">
                        <span className="text-3xl font-bold text-blue-600">85%</span>
                     </div>
                  </div>
                  <p className="text-center text-sm text-slate-500">Add more project demos to reach 100%</p>
               </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-4">My Projects</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Project</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Interest</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProjects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.title}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Active</span></td>
                    <td className="px-6 py-4 text-slate-600">{p.likes} Likes • {p.views} Views</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      // Investor Dashboard
      const interestDistribution = [
        { name: 'AI', value: 45 },
        { name: 'BioTech', value: 25 },
        { name: 'FinTech', value: 20 },
        { name: 'Robotics', value: 10 },
      ];

      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Investment Overview</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             {['Total Invested', 'Active Deals', 'Saved Projects', 'Matches'].map((label, idx) => (
               <div key={label} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                 <p className="text-slate-500 text-xs uppercase font-semibold mb-1">{label}</p>
                 <p className="text-2xl font-bold text-slate-900">{[ '$1.2M', '4', '12', '45' ][idx]}</p>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                <SimpleBarChart data={interestDistribution} title="Portfolio Distribution by Sector" color="#0ea5e9" />
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">AI Recommended</h3>
                <div className="space-y-4">
                   {projects.slice(0, 3).map(p => (
                     <div key={p.id} className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => {setSelectedProject(p); setCurrentView('PROJECT_DETAIL');}}>
                        <img src={p.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />
                        <div>
                          <p className="font-semibold text-sm text-slate-900 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                          <span className="text-xs text-green-600 font-bold mt-1 block">95% Match</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      );
    }
  };

  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    return (
      <div className="container mx-auto px-4 py-8 animate-in fade-in zoom-in duration-300">
        <button onClick={() => setCurrentView('HOME')} className="mb-6 flex items-center text-slate-500 hover:text-slate-900">
          <ChevronRight className="rotate-180 w-4 h-4 mr-1" /> Back to Explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-black aspect-video relative group">
               <img src={selectedProject.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="Video Thumb" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-slate-900">{selectedProject.title}</h1>
                  <div className="flex gap-2">
                     <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><Heart size={20}/></button>
                     <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><MessageSquare size={20}/></button>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">{tag}</span>
                  ))}
               </div>

               <h3 className="text-lg font-bold text-slate-900 mb-2">About the Project</h3>
               <p className="text-slate-600 leading-relaxed mb-6">{selectedProject.description}</p>
               
               <h3 className="text-lg font-bold text-slate-900 mb-2">Technical Highlights</h3>
               <ul className="list-disc pl-5 text-slate-600 space-y-2 mb-6">
                 <li>Leverages state-of-the-art transformer architecture.</li>
                 <li>Optimized for low-power edge devices (Raspberry Pi 4 compatible).</li>
                 <li>Real-time inference latency under 50ms.</li>
               </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-4 mb-6">
                  <img src={selectedProject.authorAvatar} className="w-14 h-14 rounded-full border-2 border-slate-100" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedProject.authorName}</h3>
                    <p className="text-xs text-slate-500">Developer @ {selectedProject.authorId === 'u1' ? 'Neural Edge Labs' : 'Independent'}</p>
                  </div>
               </div>
               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mb-3">
                 Contact Developer
               </button>
               <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-colors">
                 View Portfolio
               </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Funding Status</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">${selectedProject.currentFunding.toLocaleString()}</span>
                <span className="text-slate-500">of ${selectedProject.fundingGoal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                 <div 
                   className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                   style={{ width: `${Math.min(100, (selectedProject.currentFunding / selectedProject.fundingGoal) * 100)}%` }}
                 ></div>
              </div>
              <p className="text-xs text-slate-500">
                12 Investors interested in this round.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- UPLOAD MODAL LOGIC ---

  const handleGenerateSummary = async () => {
    if (!newProject.description || !newProject.tags) return;
    setIsGeneratingSummary(true);
    const summary = await generatePitchSummary(newProject.description, newProject.tags);
    setNewProject(prev => ({ ...prev, description: summary })); // In real app, might save to a different field
    setIsGeneratingSummary(false);
  };

  const handlePublish = () => {
    const p: Project = {
      id: `p${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      title: newProject.title || 'Untitled Project',
      description: newProject.description || '',
      tags: newProject.tags || [],
      imageUrl: 'https://picsum.photos/800/600',
      fundingGoal: 100000,
      currentFunding: 0,
      likes: 0,
      views: 0,
      postedAt: new Date().toISOString()
    };
    setProjects([p, ...projects]);
    setIsUploadModalOpen(false);
    setNewProject({ title: '', description: '', tags: [] });
    setUploadStep(1);
  };

  const renderUploadModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h2 className="text-xl font-bold text-slate-800">Publish New Project</h2>
           <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          {uploadStep === 1 && (
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
                 <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="e.g., Quantum Encryption for IoT"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Abstract</label>
                 <textarea 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all h-32 resize-none"
                    placeholder="Describe the technical innovation..."
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                 />
                 <div className="flex justify-end mt-2">
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary || !newProject.description}
                      className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50"
                    >
                      <Zap size={12} /> {isGeneratingSummary ? 'AI Optimizing...' : 'AI Polish Pitch'}
                    </button>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Tech Stack (Tags)</label>
                 <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="Comma separated (e.g., Python, React, NLP)"
                    onChange={e => setNewProject({...newProject, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                 />
               </div>
            </div>
          )}

          {uploadStep === 2 && (
             <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Upload Demo Video or PPT</h3>
                <p className="text-sm text-slate-500">Drag and drop or click to browse</p>
                <input type="file" className="hidden" />
             </div>
          )}

          {uploadStep === 3 && (
             <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                   <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Launch!</h3>
                <p className="text-slate-500 max-w-md mx-auto">Your project looks great. The AI recommendation engine will start matching it with investors immediately after publishing.</p>
             </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
           {uploadStep > 1 ? (
             <button onClick={() => setUploadStep(s => s - 1)} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900">Back</button>
           ) : <div></div>}
           
           {uploadStep < 3 ? (
             <button 
               onClick={() => setUploadStep(s => s + 1)} 
               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
             >
               Next Step
             </button>
           ) : (
             <button 
               onClick={handlePublish}
               className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/30"
             >
               Publish Now
             </button>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {renderHeader()}
      <main>
        {currentView === 'HOME' && renderExplore()}
        {currentView === 'DASHBOARD' && renderDashboard()}
        {currentView === 'PROJECT_DETAIL' && renderProjectDetail()}
      </main>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
         <button onClick={() => setIsUploadModalOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center">
            <Plus size={24} />
         </button>
      </div>

      {isUploadModalOpen && renderUploadModal()}
    </div>
  );
}

// Icons for use in JSX
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function Zap({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}