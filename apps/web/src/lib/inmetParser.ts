import { Alerta } from "@agronexus/shared/types";

export function parseInmetXML(xmlString: string): Alerta[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Pegar todos os itens do RSS
    const items = xmlDoc.querySelectorAll("item");
    const alertas: Alerta[] = [];

    items.forEach((item, index) => {
      const title = item.querySelector("title")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
      const link = item.querySelector("link")?.textContent || "";
      
      // Extrair severidade pelo título
      const titleLower = title.toLowerCase();
      let severidade: 'info' | 'aviso' | 'critico' = 'info';
      
      if (titleLower.includes('grande perigo') || titleLower.includes('vermelho')) {
        severidade = 'critico';
      } else if (titleLower.includes('perigo') || titleLower.includes('laranja')) {
        // "perigo potencial" é amarelo, "perigo" é laranja
        severidade = titleLower.includes('potencial') ? 'aviso' : 'critico';
      } else if (titleLower.includes('amarelo')) {
        severidade = 'aviso';
      }

      // Como o RSS da INMET é gigante e engloba o Brasil todo, 
      // para o MVP nós vamos simplesmente converter os itens.
      
      alertas.push({
        id: `inmet-${index}-${Date.now()}`,
        propriedade_id: 'geral', // Alerta geral do sistema para o MVP
        tipo: 'clima',
        mensagem: title, // O título já contém "Aviso de X. Severidade: Y"
        severidade,
        fonte: 'INMET',
        lido: false,
        created_at: new Date(pubDate).toISOString(),
      });
    });

    return alertas;
  } catch (err) {
    console.error("Erro ao fazer parse do XML do INMET", err);
    return [];
  }
}
