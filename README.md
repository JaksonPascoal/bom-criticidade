🔧 BOM Criticidade — Otimização de Materiais na Indústria

Este projeto demonstra a construção de um pipeline de dados completo para análise de criticidade do Bill of Materials (BOM), aplicando minha experiência de 20 anos em Planejamento e Automação Industrial. O objetivo é transformar dados brutos em insights estratégicos que apoiem a redução de custos, a priorização de compras e a otimização de processos produtivos.

🎯 Contexto e Problema de Negócio

Na indústria, a gestão de materiais e inventário sem um sistema centralizado leva a:

Estoques mal dimensionados

Capital imobilizado em itens de baixa prioridade

Risco de paradas por falta de peças críticas

Este projeto simula um cenário real de Data Warehouse de Materiais, unificando dados de diferentes fontes e permitindo análises estratégicas que identificam gargalos, otimizam a cadeia de suprimentos e suportam a tomada de decisão baseada em dados.

🛠️ Tecnologias e Ferramentas

Python — Automação do pipeline de ETL

Pandas & NumPy — Manipulação e limpeza de dados

SQL Server — Data Warehouse (modelo estrela)

HTML, CSS & JavaScript (Chart.js) — Dashboard interativo

Git & GitHub — Versionamento e fluxo profissional

VS Code — Ambiente de desenvolvimento

🔄 Fluxo do Projeto (ETL + Análise)

Geração de Dados — src/data_generation.py cria dados sintéticos realistas sobre materiais, fornecedores e consumo.

Extração e Transformação (ETL) — src/etl_pipeline.py limpa valores nulos, trata inconsistências e transforma os dados.

Carga (Load) — Dados inseridos em tabelas fato e dimensão no SQL Server.

Score de Criticidade — Combina variáveis de engenharia, lead time, custo e cobertura de estoque.

Dashboard Interativo — Insights visualizados via Chart.js (Top materiais críticos, correlações, distribuições).

📊 Exemplos de Insights

Apenas 5% dos itens respondem por mais de 40% do risco de parada.

Itens com alto lead time e baixo estoque concentram o maior impacto.

O cruzamento de criticidade de engenharia + custo revela oportunidades de otimização financeira.

▶️ Como Rodar o Projeto

Clone o repositório:

git clone https://github.com/JaksonPascoal/bom-criticidade.git
cd bom-criticidade


Instale as dependências:

pip install -r requirements.txt


Execute o pipeline completo:

python src/main.py


Obs: Configure as credenciais do banco de dados no arquivo config.json.

🚀 Próximos Passos

Ajustar pesos do score de criticidade via AHP ou modelos de ML

Integração com SAP para uso em ambiente real

Deploy do dashboard em GitHub Pages

✨ Diferencial: Este projeto une vivência prática industrial + ciência de dados aplicada, mostrando como decisões de negócio podem ser priorizadas com algoritmos interpretáveis.
