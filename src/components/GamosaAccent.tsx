export default function GamosaAccent() {
  return (
    <div className="w-full h-14 bg-[#FAFAFA] relative overflow-hidden flex items-center justify-center border-y border-white/50 shadow-sm z-20 backdrop-blur-sm">
      {/* Subtle fade on edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />
      
      <div 
        className="absolute inset-0 opacity-[0.9]"
        style={{
          // A refined woven SVF pattern reproducing traditional Assamese motifs
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 5L35 20L20 35L5 20L20 5ZM20 9.24L9.24 20L20 30.76L30.76 20L20 9.24Z' fill='%23dc2626' fill-opacity='0.8' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          height: '32px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
      {/* Red woven border lines */}
      <div className="absolute top-2 left-0 right-0 h-[2px] bg-[#dc2626] opacity-80" />
      <div className="absolute top-[12px] left-0 right-0 h-[1px] bg-[#dc2626] opacity-40" />
      <div className="absolute bottom-2 left-0 right-0 h-[2px] bg-[#dc2626] opacity-80" />
      <div className="absolute bottom-[12px] left-0 right-0 h-[1px] bg-[#dc2626] opacity-40" />
    </div>
  );
}
