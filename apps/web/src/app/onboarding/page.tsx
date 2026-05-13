"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight, ChevronLeft, MapPin, Sprout, PawPrint, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const CULTURAS_OPCOES = [
  "Soja", "Milho", "Café", "Cana-de-açúcar", "Algodão", "Arroz", "Feijão", "Trigo", 
  "Mandioca", "Sorgo", "Girassol", "Hortaliças", "Frutas", "Outros"
];

const ANIMAIS_OPCOES = [
  "Gado de corte", "Gado leiteiro", "Suínos", "Frangos de corte", 
  "Galinhas poedeiras", "Peixes (piscicultura)", "Caprinos/Ovinos", "Outros"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  
  const [formData, setFormData] = useState({
    municipio: null as any,
    culturas: [] as string[],
    animais: [] as string[]
  });

  // Busca municípios do IBGE
  useEffect(() => {
    if (search.length < 3) {
      setMunicipios([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingMunicipios(true);
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`);
        const all = await res.json();
        const filtered = all
          .filter((m: any) => m.nome.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 10);
        setMunicipios(filtered);
      } catch (e) {
        console.error("Erro IBGE", e);
      } finally {
        setLoadingMunicipios(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleItem = (list: "culturas" | "animais", item: string) => {
    setFormData(prev => {
      const current = prev[list];
      if (current.includes(item)) {
        return { ...prev, [list]: current.filter(i => i !== item) };
      }
      return { ...prev, [list]: [...current, item] };
    });
  };

  const handleFinish = async () => {
    const uuid = crypto.randomUUID();
    const payload = {
      uuid,
      municipio: formData.municipio,
      culturas: formData.culturas,
      animais: formData.animais,
      onboarding_concluido: true
    };

    // Salvar Localmente
    localStorage.setItem("agronexus_user", JSON.stringify(payload));

    // Sincronizar com o Banco (Assíncrono)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
    fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(e => console.error("Erro sincronia onboarding", e));

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-agro-light flex flex-col items-center p-6 pb-12">
      
      {/* Header / Logo */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
        </div>
        <h1 className="text-2xl font-black text-agro-blue tracking-tight">AgroNexus</h1>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-8 bg-agro-green' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-white relative overflow-hidden">
        
        {/* STEP 1: Município */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="bg-agro-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-agro-green" size={32} />
              </div>
              <h2 className="text-xl font-bold text-agro-black">Onde fica sua propriedade?</h2>
              <p className="text-sm text-gray-500 mt-1">Isso nos ajuda a buscar o clima da sua região.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Busque sua cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-agro-green/20 focus:border-agro-green transition-all"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {loadingMunicipios && <p className="text-center text-xs text-gray-400">Buscando...</p>}
              {municipios.map(m => (
                <button 
                  key={m.id}
                  onClick={() => {
                    setFormData({ ...formData, municipio: { id: m.id, nome: m.nome, uf: m['microrregiao']['mesorregiao']['UF']['sigla'] } });
                    setSearch(`${m.nome} - ${m['microrregiao']['mesorregiao']['UF']['sigla']}`);
                    setMunicipios([]);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${formData.municipio?.id === m.id ? 'border-agro-green bg-agro-green/5' : 'border-gray-100 hover:border-agro-green/30'}`}
                >
                  <span className="font-medium text-agro-black">{m.nome} - {m['microrregiao']['mesorregiao']['UF']['sigla']}</span>
                  {formData.municipio?.id === m.id && <CheckCircle2 className="text-agro-green" size={20} />}
                </button>
              ))}
            </div>

            <button 
              disabled={!formData.municipio}
              onClick={() => setStep(2)}
              className="w-full bg-agro-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-agro-blue/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 mt-8"
            >
              Próximo Passo <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Culturas */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="bg-agro-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="text-agro-green" size={32} />
              </div>
              <h2 className="text-xl font-bold text-agro-black">O que você planta?</h2>
              <p className="text-sm text-gray-500 mt-1">Selecione todas as culturas que você produz.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CULTURAS_OPCOES.map(item => (
                <button 
                  key={item}
                  onClick={() => toggleItem("culturas", item)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${formData.culturas.includes(item) ? 'border-agro-green bg-agro-green/5 text-agro-green' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.culturas.includes(item) ? 'bg-agro-green border-agro-green' : 'border-gray-300'}`}>
                    {formData.culturas.includes(item) && <Check className="text-white" size={12} />}
                  </div>
                  {item}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setStep(3)}
                className="w-2/3 bg-agro-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-agro-blue/20 flex items-center justify-center gap-2"
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Animais */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="bg-agro-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint className="text-agro-green" size={32} />
              </div>
              <h2 className="text-xl font-bold text-agro-black">E as criações animais?</h2>
              <p className="text-sm text-gray-500 mt-1">Selecione quais animais você cria.</p>
            </div>

            <div className="space-y-3">
              {ANIMAIS_OPCOES.map(item => (
                <button 
                  key={item}
                  onClick={() => toggleItem("animais", item)}
                  className={`w-full p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${formData.animais.includes(item) ? 'border-agro-green bg-agro-green/5 text-agro-green' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <span>{item}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.animais.includes(item) ? 'bg-agro-green border-agro-green' : 'border-gray-300'}`}>
                    {formData.animais.includes(item) && <Check className="text-white" size={14} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(2)}
                className="w-1/3 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleFinish}
                className="w-2/3 bg-agro-green text-white py-4 rounded-2xl font-bold shadow-lg shadow-agro-green/20 flex items-center justify-center gap-2"
              >
                Concluir Tudo <Check size={20} />
              </button>
            </div>
          </div>
        )}

      </div>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-[250px] leading-relaxed">
        Seus dados são protegidos e usados apenas para personalizar sua experiência no AgroNexus.
      </p>

    </div>
  );
}
