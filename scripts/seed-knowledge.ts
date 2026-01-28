import axios from 'axios';
import 'dotenv/config';

// Configuração
const BACKEND_URL = process.env.API_URL || 'http://localhost:3000';
const ENDPOINT = `${BACKEND_URL}/ai/knowledge/index`;

// Token de Nutricionista (MOCKADO - Você precisaria de um token real aqui)
// Para o teste funcionar, o AuthGuard deve estar desabilitado ou você 
// deve pegar um token válido via login. 
// AQUI VOU SUPOR QUE VOCÊ TEM UM TOKEN VÁLIDO NO .env, SE NÃO TIVER,
// O SCRIPT VAI FALHAR COM 401.
const TOKEN = process.env.TEST_AUTH_TOKEN || '';

const knowledgeBase = [
  // --- Macronutrientes ---
  {
    text: "Proteínas são macromoléculas essenciais formadas por cadeias de aminoácidos, fundamentais para a construção e reparação de tecidos musculares, produção de enzimas e hormônios.",
    metadata: { source: "Nutrição Básica", category: "Macronutrientes" }
  },
  {
    text: "Carboidratos são a principal fonte de energia do corpo humano. Podem ser simples (açúcares, digestão rápida) ou complexos (fibras e amidos, digestão lenta).",
    metadata: { source: "Nutrição Básica", category: "Macronutrientes" }
  },
  {
    text: "Gorduras (lipídios) são vitais para absorção de vitaminas lipossolúveis (A, D, E, K), produção hormonal e isolamento térmico. Devem-se priorizar gorduras insaturadas.",
    metadata: { source: "Nutrição Básica", category: "Macronutrientes" }
  },

  // --- Hidratação ---
  {
    text: "A ingestão recomendada de água varia entre 35ml a 40ml por kg de peso corporal para adultos saudáveis, podendo aumentar com atividade física e calor.",
    metadata: { source: "Diretrizes de Hidratação", category: "Hidratação" }
  },
  {
    text: "Sinais de desidratação leve incluem: boca seca, urina escura, fadiga, dor de cabeça e tontura.",
    metadata: { source: "Clínica Geral", category: "Hidratação" }
  },

  // --- Alimentos Específicos (Tabela TACO/Outros) ---
  {
    text: "O ovo é considerado um dos alimentos mais completos, contendo proteínas de alto valor biológico, colina, albumina e vitaminas do complexo B.",
    metadata: { source: "Tabela Nutricional", category: "Alimentos" }
  },
  {
    text: "A aveia é rica em beta-glucana, uma fibra solúvel que auxilia na redução do colesterol LDL e no controle da glicemia.",
    metadata: { source: "Estudos Funcionais", category: "Alimentos" }
  },
  {
    text: "100g de peito de frango grelhado contém aproximadamente 31g de proteína e baixo teor de gordura, sendo ideal para dietas de hipertrofia e emagrecimento.",
    metadata: { source: "Tabela TACO", category: "Alimentos" }
  },
  {
    text: "O azeite de oliva extra virgem é rico em gorduras monoinsaturadas e compostos fenólicos com ação antioxidante e anti-inflamatória.",
    metadata: { source: "Dieta Mediterrânea", category: "Alimentos" }
  },
  {
    text: "Feijões e leguminosas são excelentes fontes de ferro vegetal e fibras. Para melhor absorção do ferro, recomenda-se consumir com fonte de Vitamina C (ex: laranja, limão).",
    metadata: { source: "Nutrição Vegetariana", category: "Dicas" }
  },

  // --- Dietas e Estratégias ---
  {
    text: "O Jejum Intermitente (Intermittent Fasting) é uma estratégia alimentar que intercala períodos de jejum com janelas de alimentação, podendo auxiliar na sensibilidade à insulina.",
    metadata: { source: "Estratégias Nutricionais", category: "Dietas" }
  },
  {
    text: "A Dieta Low Carb baseia-se na redução do consumo de carboidratos, priorizando proteínas e gorduras naturais, eficaz para controle de diabetes tipo 2 e perda de peso rápida inicial.",
    metadata: { source: "Diretrizes Low Carb", category: "Dietas" }
  },
  {
    text: "Na dieta Vegana, excluem-se todos os produtos de origem animal. É crucial monitorar a Vitamina B12, Ferro, Cálcio e Ômega-3.",
    metadata: { source: "Guia Vegano", category: "Dietas" }
  },

  // --- Perda de Peso e Saúde ---
  {
    text: "Déficit calórico é o princípio fundamental para o emagrecimento: consumir menos calorias do que o corpo gasta no total do dia.",
    metadata: { source: "Fisiologia do Emagrecimento", category: "Emagrecimento" }
  },
  {
    text: "O consumo excessivo de açúcar refinado e alimentos ultraprocessados está ligado ao aumento de inflamação crônica e resistência à insulina.",
    metadata: { source: "Saúde Metabólica", category: "Saúde" }
  },
  {
    text: "O sono inadequado (menos de 7h) pode desregular os hormônios da fome (grelina aumenta, leptina diminui), dificultando a perda de peso.",
    metadata: { source: "Endocrinologia", category: "Saúde" }
  },
  {
    text: "Creatina é um dos suplementos mais estudados, auxiliando no ganho de força, potência muscular e recuperação, sem causar danos renais em indivíduos saudáveis.",
    metadata: { source: "Suplementação Esportiva", category: "Suplementos" }
  },
  {
    text: "Whey Protein é a proteína do soro do leite, de rápida absorção, útil para atingir a meta proteica diária e estimular a síntese muscular pós-treino.",
    metadata: { source: "Suplementação Esportiva", category: "Suplementos" }
  }
];

async function seed() {
  if (!TOKEN) {
    console.error('ERRO: Você precisa definir TEST_AUTH_TOKEN no .env para rodar este script.');
    console.log('Faça login na plataforma e copie o Bearer Token.');
    return;
  }

  console.log(`Iniciando carga de conhecimento em ${ENDPOINT}...`);

  for (const item of knowledgeBase) {
    try {
      console.log(`Indexando: "${item.text.substring(0, 50)}..."`);
      await axios.post(ENDPOINT, item, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Sucesso!');
    } catch (error) {
      console.error(`❌ Erro ao indexar:`, error.response?.data || error.message);
    }
  }

  console.log('--- Carga Finalizada ---');
}

seed();
