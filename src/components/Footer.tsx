import { Link } from 'react-router-dom';
import { Heart, Globe, MessageSquare, Share2, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-400">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">Dala</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              "Rewrite Your Story, Thrive With Your Chosen Family." Dala is a platform for finding
              your chosen family and building deep, authentic connections.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold uppercase text-[10px] tracking-widest text-slate-400">Explore</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/discover" className="hover:text-orange-500">
                  Find Connections
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-orange-500">
                  Community Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-500">
                  About DALA
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-orange-500">
                  Our Mission
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold uppercase text-[10px] tracking-widest text-slate-400">Support</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/faq" className="hover:text-orange-500">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-orange-500">
                  Safety Guidelines
                </Link>
              </li>
              <li className="flex flex-col items-center md:items-start">
                <a href="mailto:carasunbrany@gmail.com" className="hover:text-orange-500 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Email
                </a>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold uppercase text-[10px] tracking-widest text-slate-400">Social</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="rounded-2xl bg-white p-3 text-slate-600 shadow-sm hover:text-orange-500 border border-slate-100">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-2xl bg-white p-3 text-slate-600 shadow-sm hover:text-orange-500 border border-slate-100">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-2xl bg-white p-3 text-slate-600 shadow-sm hover:text-orange-500 border border-slate-100">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            © {new Date().getFullYear()} Dala Platforms Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}