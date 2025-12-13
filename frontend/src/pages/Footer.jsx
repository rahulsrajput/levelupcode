import React from 'react';
import { Code2, Github, Linkedin, Heart } from 'lucide-react';

function Footer() {
  return (
    // We use max-w-5xl to align perfectly with your ProblemDetail and SubmissionDetail containers
    <footer className="w-full max-w-5xl mx-auto mt-auto pt-16 pb-12 px-4">
      
      {/* Top Border line - subtle and clean */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-base-300 to-transparent mb-12"></div>

      <div className="flex flex-col items-center space-y-8">
        
        {/* Navigation Links - Small, uppercase, and widely spaced */}
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          <a className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 hover:text-violet-600 transition-colors duration-300 cursor-pointer">
            About Us
          </a>
          <a className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 hover:text-violet-600 transition-colors duration-300 cursor-pointer">
            Contact
          </a>
          <a className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 hover:text-violet-600 transition-colors duration-300 cursor-pointer">
            Terms
          </a>
          <a className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 hover:text-violet-600 transition-colors duration-300 cursor-pointer">
            Privacy
          </a>
        </nav>

        {/* Social Icons - Focused on Violet hover state */}
        <div className="flex items-center gap-8">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-base-content/30 hover:text-violet-600 hover:-translate-y-1 transition-all duration-300"
          >
            <Github className="w-5 h-5" />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-base-content/30 hover:text-violet-600 hover:-translate-y-1 transition-all duration-300"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-base-content/30 hover:text-violet-600 hover:-translate-y-1 transition-all duration-300"
          >
            <Code2 className="w-5 h-5" />
          </a>
        </div>

      

      </div>
    </footer>
  );
}

export default Footer;