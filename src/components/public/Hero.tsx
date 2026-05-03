
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#F5F5F0] overflow-hidden flex items-center justify-center pt-40 lg:pt-56 pb-12">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#E8E8DF] rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#E8E8DF] rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left Side - Pill Imagery */}
        <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-start">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main Pill Image */}
            <div className="w-[280px] md:w-[420px] aspect-[3/4] rounded-[10rem] overflow-hidden border-[12px] border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2000" 
                className="w-full h-full object-cover"
                alt="Luxury Gift"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Secondary Floating Circle - Matching the user's provided image style */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 md:-right-20 w-[200px] md:w-[280px] aspect-square rounded-full overflow-hidden border-[8px] border-white shadow-xl z-20"
            >
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000" 
                className="w-full h-full object-cover"
                alt="Luxury Detail"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Logo Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-6 -left-6 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg z-30"
            >
              <img src="/img/logo/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-right space-y-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-6"
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">Boutique Experience</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl text-primaryDark leading-[1.1] tracking-tight">
              يسلمو <br />
              <span className="font-light text-primary">عالم من</span> <br />
              الرقي
            </h1>

            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed max-w-lg lg:ml-auto">
              نصنع لكم ذكريات لا تُنسى من خلال قطعنا المختارة بعناية، حيث يلتقي الفن مع الفخامة في كل صندوق هدايا.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-8"
          >
            <Link 
              to="/shop"
              className="group relative px-12 py-5 bg-primaryDark text-white rounded-full font-bold text-xs tracking-[0.3em] uppercase overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-3">
                اكتشف الآن
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-primaryDark/20" />
              <span className="text-[10px] font-bold text-primaryDark/40 uppercase tracking-[0.5em]">Luxury Gifting</span>
            </div>
          </motion.div>

          {/* Bottom Accents */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-12 flex items-center justify-center lg:justify-end gap-12"
          >
            <div className="text-right">
              <span className="block text-xs font-bold text-primaryDark uppercase tracking-widest">الموقع</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">دمشق, سوريا</span>
            </div>
            <div className="w-px h-8 bg-primaryDark/10" />
            <div className="text-right">
              <span className="block text-xs font-bold text-primaryDark uppercase tracking-widest">التأسيس</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">عام 2024</span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Vertical Rail */}
      <div className="absolute left-10 bottom-10 hidden xl:block">
        <div className="writing-mode-vertical-rl text-[9px] font-bold text-primaryDark/10 uppercase tracking-[1.5em] transform rotate-180">
          YASLAMO • PREMIUM QUALITY • HANDCRAFTED
        </div>
      </div>
    </section>
  );
};

export default Hero;
