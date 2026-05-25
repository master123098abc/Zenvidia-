import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display font-black text-3xl md:text-4xl tracking-tighter text-cyan-500 mb-10 uppercase">
              ZENVIDIA
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-orange-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-cyan-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-cyan-500 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 px-2">Platform</h4>
            <ul className="space-y-1 font-medium text-neutral-400">
              <li><a href="#" className="block py-2 px-2 hover:text-cyan-400 transition-colors hover:bg-neutral-900 rounded-lg">Browse Creators</a></li>
              <li><a href="#" className="block py-2 px-2 hover:text-cyan-400 transition-colors hover:bg-neutral-900 rounded-lg">For Brands</a></li>
              <li><a href="#" className="block py-2 px-2 hover:text-cyan-400 transition-colors hover:bg-neutral-900 rounded-lg">Pricing</a></li>
              <li><a href="#" className="block py-2 px-2 hover:text-cyan-400 transition-colors hover:bg-neutral-900 rounded-lg">Case Studies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 px-2">Company</h4>
            <ul className="space-y-1 font-medium text-neutral-400">
              <li><a href="#" className="block py-2 px-2 hover:text-orange-400 transition-colors hover:bg-neutral-900 rounded-lg">About Us</a></li>
              <li><a href="#" className="block py-2 px-2 hover:text-orange-400 transition-colors hover:bg-neutral-900 rounded-lg">Careers</a></li>
              <li><a href="#" className="block py-2 px-2 hover:text-orange-400 transition-colors hover:bg-neutral-900 rounded-lg flex items-center">Contact <Mail className="w-4 h-4 ml-2" /></a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-neutral-500">
          <p>© {new Date().getFullYear()} Zenvidia. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
