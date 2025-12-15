import React, { useState } from 'react';
import { Project, User, UserRole } from '../types';
import { Heart, MessageCircle, Eye, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { analyzeInvestmentMatch } from '../services/geminiService';

interface ProjectCardProps {
  project: Project;
  currentUser: User;
  onViewDetail: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUser, onViewDetail }) => {
  const [matchData, setMatchData] = useState<{ score: number; reasoning: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser.role !== UserRole.INVESTOR) return;
    
    setIsAnalyzing(true);
    const result = await analyzeInvestmentMatch(currentUser, project);
    setMatchData(result);
    setIsAnalyzing(false);
  };

  return (
    <div 
      onClick={() => onViewDetail(project)}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
           {project.tags.slice(0, 2).map(tag => (
             <span key={tag} className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
               {tag}
             </span>
           ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
            {project.currentFunding / project.fundingGoal >= 0.8 && (
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded flex items-center gap-1">
                    <TrendingUp size={12} /> Hot
                </span>
            )}
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
          {project.description}
        </p>

        {/* AI Matching Section for Investors */}
        {currentUser.role === UserRole.INVESTOR && (
          <div className="mb-4">
             {!matchData && !isAnalyzing && (
               <button 
                 onClick={handleAnalyze}
                 className="w-full py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 text-sm font-semibold rounded-lg border border-indigo-100 flex items-center justify-center gap-2 hover:from-indigo-100 hover:to-blue-100 transition-colors"
               >
                 <Zap size={16} className="fill-indigo-600" /> AI Match Analysis
               </button>
             )}
             
             {isAnalyzing && (
               <div className="w-full py-2 bg-slate-50 text-slate-400 text-sm font-medium rounded-lg border border-slate-100 flex items-center justify-center gap-2 animate-pulse">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div> Analyzing...
               </div>
             )}

             {matchData && (
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3 rounded-lg shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                    <span className={`text-lg font-bold ${matchData.score > 80 ? 'text-green-400' : matchData.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {matchData.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {matchData.reasoning}
                  </p>
               </div>
             )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <img src={project.authorAvatar} alt={project.authorName} className="w-6 h-6 rounded-full" />
            <span className="text-xs text-slate-600 font-medium">{project.authorName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span className="flex items-center gap-1"><Eye size={14} /> {project.views}</span>
            <span className="flex items-center gap-1"><Heart size={14} /> {project.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};