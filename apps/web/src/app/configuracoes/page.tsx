"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { MapPin, Sprout, PawPrint, Save, Loader2, ChevronRight } from "lucide-react";

const CULTURAS_OPCOES = ["Soja", "Milho", "Café", "Cana-de-açúcar", "Algodão", "Arroz", "Feijão", "Trigo", "Mandioca", "Sorgo", "Girassol", "Hortaliças", "Frutas", "Outros"];
const ANIMAIS_OPCOES = ["Gado de corte", "Gado leiteiro", "Suínos", "Frangos de corte", "Galinhas poedeiras", "Peixes (piscicultura)", "Caprinos/Ovinos", "Outros"];

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isChangingCity, setIsChangingCity] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem("agronexus_user");
    if (localUser) {
      setUser(JSON.parse(localUser));
    }
    setLoading(false);
  }, []);

  const toggleItem = (list: "culturas" | "animais", item: string) => {
    setUser((prev: any) => {
      const current = prev[list] || [];
      if (current.includes(item)) {
        return { ...prev, [list]: current.filter((i: string) => i !== item) };
      }
      return { ...prev, [list]: [...current, item] };
    });
  };

  const searchCities = async (query: string) => {
    if (query.length < 3) return;
    setLoadingCities(true);
    try {
      // Usando geocoding do Open-Meteo para pegar coordenadas
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`);
      const data = await res.json();
      setCityResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCities(false);
    }
  };

  const selectCity = (city: any) => {
    setUser((prev: any) => ({
      ...prev,
      municipio: {
        id: city.id,
        nome: city.name,
        uf: city.admin1_code || city.country_code?.toUpperCase(),
        lat: city.latitude,
        lon: city.longitude
      }
    }));
    setIsChangingCity(false);
    setCitySearch("");
    setCityResults([]);
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("agronexus_user", JSON.stringify(user));
    
    // Sync com banco
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
      await fetch(`${apiUrl}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      alert("Configurações salvas com sucesso!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-agro-blue" /></div>;

  return (
    <div className="min-h-screen bg-agro-light">
      <Header />
      
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-agro-black">Configurações</h2>
          <p className="text-sm text-gray-500 font-medium">Ajuste os detalhes da sua propriedade</p>
        </div>

        <section className="bg-white rounded-2xl p-5 shadow-sm border border-agro-gray space-y-4">
          <div className="flex items-center gap-2 text-agro-blue">
            <MapPin size={20} />
            <h3 className="font-bold text-sm uppercase">Localização</h3>
          </div>
          
          {isChangingCity ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (e.target.value.length >= 3) searchCities(e.target.value);
                  }}
                  placeholder="Digite o nome da cidade..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-blue/20"
                />
                <button onClick={() => setIsChangingCity(false)} className="text-xs font-bold text-gray-400 px-2">Cancelar</button>
              </div>
              
              <div className="space-y-2">
                {loadingCities && <p className="text-[10px] text-center text-gray-400">Buscando...</p>}
                {cityResults.map(city => (
                  <button 
                    key={city.id}
                    onClick={() => selectCity(city)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-agro-blue/30 hover:bg-blue-50 transition-all text-xs font-medium text-gray-700 flex justify-between items-center"
                  >
                    <span>{city.name}, {city.admin1} {city.country_code?.toUpperCase()}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 font-medium">Cidade Selecionada</p>
                <p className="font-bold text-agro-black">{user.municipio?.nome} - {user.municipio?.uf}</p>
              </div>
              <button onClick={() => setIsChangingCity(true)} className="text-agro-blue text-xs font-bold bg-white px-3 py-2 rounded-lg border border-agro-gray shadow-sm">Trocar</button>
            </div>
          )}
        </section>

        {/* Culturas */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-agro-gray space-y-4">
          <div className="flex items-center gap-2 text-agro-green">
            <Sprout size={20} />
            <h3 className="font-bold text-sm uppercase">Minhas Culturas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CULTURAS_OPCOES.map(item => (
              <button 
                key={item}
                onClick={() => toggleItem("culturas", item)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${user.culturas?.includes(item) ? 'bg-agro-green/10 border-agro-green text-agro-green' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Animais */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-agro-gray space-y-4">
          <div className="flex items-center gap-2 text-orange-600">
            <PawPrint size={20} />
            <h3 className="font-bold text-sm uppercase">Minhas Criações</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ANIMAIS_OPCOES.map(item => (
              <button 
                key={item}
                onClick={() => toggleItem("animais", item)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${user.animais?.includes(item) ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-agro-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-agro-blue/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Salvar Alterações
        </button>

        <div className="h-20"></div>
      </div>
    </div>
  );
}
