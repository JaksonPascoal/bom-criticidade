Data Warehouse: Otimização de Bill of Materials (BOM) na Indústria de Fertilizantes

Este projeto demonstra a construção de um pipeline de dados completo, aplicando minha experiência de 20 anos em Planejamento e Automação Industrial para otimizar a gestão do Bill of Materials (BOM) em uma indústria de fertilizantes. O objetivo é transformar dados brutos em insights estratégicos para a redução de custos e a otimização de processos de produção.

Contexto e Problema de Negócio:

Profissionais que trabalham na área sabem o quão ineficiente pode ser a gestão de materiais e inventário sem um sistema centralizado. Este projeto simula um cenário real onde dados de diferentes fontes são unificados em um Data Warehouse. A solução permite análises estratégicas que identificam gargalos, otimizam a cadeia de suprimentos e suportam a tomada de decisão.

Tecnologias e Ferramentas:

Python: Linguagem principal para a automação do pipeline de ETL (Extração, Transformação e Carga).

Pandas & NumPy: Manipulação e processamento de dados, garantindo a qualidade e integridade do dataset.

SQL Server: Banco de dados relacional para a modelagem do Data Warehouse (modelo estrela), centralizando os dados para análise.

Git & GitHub: Versionamento e controle de todo o projeto, mostrando um fluxo de trabalho profissional.

HTML, CSS & JavaScript (com Chart.js): Desenvolvimento de um dashboard interativo para visualizar os principais insights do negócio.

VS Code: Ambiente de desenvolvimento utilizado.

Fluxo do Projeto (Pipeline de ETL)
Geração de Dados: Um script Python (src/data_generation.py) cria dados sintéticos e realistas sobre materiais, fornecedores e histórico de uso.

Extração e Transformação: O script de ETL em Python (src/etl_pipeline.py) lê os dados, limpa valores ausentes, trata inconsistências e realiza as transformações necessárias.

Carga (Load): Os dados são automaticamente inseridos nas tabelas de dimensão e fato do SQL Server, construindo o Data Warehouse.

Análise e Dashboard: Consultas SQL são executadas no DW para obter insights, que são então visualizados em um dashboard interativo.

Como Rodar o Projeto
Este projeto foi construído para ser reprodutível e automatizado. Siga os passos abaixo para replicá-lo:

Clone o Repositório:

Bash

git clone [https://github.com/SeuUsuario/Projeto-data-warehouse-bom.git]
cd Projeto-data-warehouse-bom
Instale as Dependências:

Bash

pip install -r requirements.txt
Execute o Pipeline Completo:

Bash

python src/main.py
Obs: Certifique-se de configurar as credenciais do seu banco de dados no arquivo de configuração do projeto.
