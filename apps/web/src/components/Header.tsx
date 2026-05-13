import { BellRing, User, Tractor, Leaf, PawPrint, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  // Ícones para o padrão de fundo
  const Icons = [Tractor, Leaf, PawPrint, Sprout];
  const patternArray = Array.from({ length: 30 }); // Criar 30 slots para preencher bem o cabeçalho

  return (
    <header className="bg-agro-blue text-white pt-10 pb-6 px-6 rounded-b-3xl shadow-md relative overflow-hidden z-10">
      
      {/* Agro Pattern Background (Tom azul escuro, 50% opacidade) */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none flex flex-wrap justify-between items-center gap-4 p-4 overflow-hidden text-[#022c5e]">
        {patternArray.map((_, idx) => {
          const Icon = Icons[idx % Icons.length];
          // Pequena rotação para dar um aspecto mais orgânico de "padrão (pattern)"
          const rotation = idx % 2 === 0 ? 'rotate-12' : '-rotate-12';
          return (
            <div key={idx} className={`transform ${rotation}`}>
              <Icon size={24} strokeWidth={2} />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-1.5 shadow-inner flex items-center justify-center w-16 h-16 relative z-20">
            <Image 
              src="/logo.png" 
              alt="AgroNexus Logo" 
              width={56} 
              height={56}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium">Bem-vindo(a),</p>
            <h1 className="text-xl font-bold tracking-tight">João Produtor</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/avisos"
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <BellRing size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-agro-blue"></span>
          </Link>
          <Link 
            href="/configuracoes"
            className="p-2 rounded-full bg-agro-green/80 border border-white/20 shadow-sm hover:bg-agro-green transition-colors"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
