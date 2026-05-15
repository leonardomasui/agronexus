import { Request, Response } from 'express';
import Parser from 'rss-parser';

// Configurando o parser com User-Agent para evitar bloqueios de bots
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  customFields: {
    item: [['media:content', 'media'], ['image', 'image'], ['enclosure', 'enclosure']],
  }
});

const FONTES_RSS = [
  { nome: 'Canal Rural', url: 'https://www.canalrural.com.br/feed/' },
  { nome: 'Agrolink', url: 'https://www.agrolink.com.br/rss/noticias.xml' },
  { nome: 'Notícias Agrícolas', url: 'https://www.noticiasagricolas.com.br/rss/noticias.xml' },
  { nome: 'Portal do Agronegócio', url: 'https://www.portaldoagronegocio.com.br/feed/' },
  { nome: 'CNA Brasil', url: 'https://www.cnabrasil.org.br/rss.xml' }
];

export const getNoticiasPersonalizadas = async (req: Request, res: Response) => {
  const { usuario } = req.body;
  const { nome, culturas = [], criacoes = [] } = usuario || {};

  console.log(`🔎 Buscando notícias para ${nome} (${culturas.join(', ')} / ${criacoes.join(', ')})`);

  try {
    // 1. Buscar notícias de todas as fontes em paralelo
    const feedPromises = FONTES_RSS.map(async (fonte) => {
      try {
        const feed = await parser.parseURL(fonte.url);
        console.log(`✅ Sucesso: ${fonte.nome} (${feed.items.length} itens)`);
        return feed.items.map(item => ({
          titulo: item.title,
          link: item.link,
          resumo: item.contentSnippet || item.content || '',
          data: item.pubDate || item.isoDate || new Date().toISOString(),
          fonte: fonte.nome,
          imagem: (item as any).media?.$.url || (item as any).enclosure?.url || (item as any).image || null
        }));
      } catch (err: any) {
        console.error(`❌ Falha: ${fonte.nome} - ${err.message}`);
        // Tentar URL alternativa se falhar (ex: remover .xml ou adicionar /feed)
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const todasNoticias = results.flat().sort((a, b) => 
      new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()
    );

    console.log(`📊 Total de notícias consolidadas: ${todasNoticias.length}`);

    // 2. MODO 1 - Notícias do Dia (Geral)
    // Garantir que pegamos notícias de fontes variadas se possível
    const noticiasGerais = todasNoticias.slice(0, 10); // Aumentamos para 10 para garantir variedade

    // 3. MODO 2 - Notícias da Sua Propriedade
    const interesses = [...culturas, ...criacoes].filter(Boolean);
    const noticiasPersonalizadas: any = {};

    const sinonimos: Record<string, string[]> = {
      "Gado de corte": ["gado", "boi", "bezerro", "pecuária", "carne bovina", "nelore", "vaca", "curral"],
      "Gado leiteiro": ["leite", "vaca", "laticínios", "ordenha", "leiteiro", "bezerra"],
      "Suínos": ["suíno", "porco", "suinocultura", "carne suína", "leitão"],
      "Frangos de corte": ["frango", "avicultura", "aves", "aviário", "galinha"],
      "Galinhas poedeiras": ["ovo", "galinha", "poedeira", "avicultura"],
      "Peixes (piscicultura)": ["peixe", "piscicultura", "tilápia", "tanque"],
      "Caprinos/Ovinos": ["ovelha", "cabra", "caprino", "ovino", "cordeiro"],
      "Soja": ["soja", "grãos", "oleaginosas", "safra"],
      "Milho": ["milho", "safrinha", "grãos", "safra"],
      "Café": ["café", "cafeeiro", "sacas", "cafeicultura"],
      "Cana-de-açúcar": ["cana", "açúcar", "etanol", "sucroenergético", "usina"],
      "Algodão": ["algodão", "fibra", "pluma", "fio"],
      "Arroz": ["arroz", "grãos", "irrigado"],
      "Feijão": ["feijão", "pulso", "leguminosa"],
      "Trigo": ["trigo", "farinha", "pão", "moinho"],
      "Mandioca": ["mandioca", "aipim", "macaxeira", "farinha", "raiz"],
      "Sorgo": ["sorgo", "forragem", "silagem"],
      "Girassol": ["girassol", "óleo"],
      "Hortaliças": ["verdura", "legume", "hortaliça", "alface", "tomate"],
      "Frutas": ["fruta", "citros", "laranja", "limão", "uva", "fruticultura"]
    };

    if (interesses.length > 0) {
      interesses.forEach(interesse => {
        const keywords = sinonimos[interesse] || [interesse.toLowerCase()];
        
        const filtradas = todasNoticias.filter(n => {
          const texto = (n.titulo + ' ' + n.resumo).toLowerCase();
          return keywords.some(k => texto.includes(k.toLowerCase()));
        }).slice(0, 5);

        if (filtradas.length > 0) {
          noticiasPersonalizadas[interesse.toUpperCase()] = filtradas;
        }
      });
    }

    res.json({
      usuario: { nome, culturas, criacoes },
      modo_geral: noticiasGerais,
      modo_personalizado: noticiasPersonalizadas,
      timestamp: new Date().toISOString(),
      fontes_consultadas: FONTES_RSS.map(f => f.nome)
    });

  } catch (error) {
    console.error('Erro crítico ao processar notícias:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
};
