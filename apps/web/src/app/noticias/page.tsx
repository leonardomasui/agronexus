"use client";

import Header from "@/components/Header";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

const NOTICIAS_MOCK = [
  {
    id: 1,
    titulo: "Safra de grãos deve atingir novo recorde em 2026, aponta CONAB",
    fonte: "Canal Rural",
    tempo: "2h atrás",
    imagem: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    titulo: "Novas tecnologias de irrigação reduzem custos em até 30%",
    fonte: "Globo Rural",
    tempo: "5h atrás",
    imagem: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=400&q=80"
  }
];

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-agro-black">Notícias do Agro</h2>
          <p className="text-sm text-gray-500 font-medium">As principais manchetes do setor</p>
        </div>

        <div className="space-y-4">
          {NOTICIAS_MOCK.map((noticia) => (
            <div key={noticia.id} className="bg-white rounded-3xl overflow-hidden border border-agro-gray shadow-sm">
              <div className="h-40 bg-gray-200 relative">
                <img src={noticia.imagem} alt={noticia.titulo} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-agro-blue text-white text-[10px] font-black px-2 py-1 rounded-lg">
                  DESTAQUE
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-agro-black leading-snug line-clamp-2">
                  {noticia.titulo}
                </h3>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                    <Clock size={12} />
                    {noticia.fonte} • {noticia.tempo}
                  </div>
                  <button className="text-agro-blue flex items-center gap-1 text-[10px] font-bold uppercase hover:underline">
                    Ler Mais <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-20"></div>
      </div>
    </div>
  );
}
