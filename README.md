# Projeto BOM - Data Warehouse para Indústria de Fertilizantes

## 💡 Visão Geral do Projeto

Este projeto tem como objetivo principal a construção de um Data Warehouse para gerenciar o *Bill of Materials* (BOM) e o inventário de uma indústria de fertilizantes. O objetivo é transformar dados brutos em informações estruturadas e visualizações que auxiliem a tomada de decisão, otimizando a cadeia de suprimentos e identificando gargalos na produção.

## ⚙️ Tecnologias Utilizadas

* **SQL:** Criação do banco de dados, modelagem do Data Warehouse (modelo estrela), e consultas analíticas.
* **Python:** Geração de dados sintéticos realistas e automatização de tarefas.
* **Git & GitHub:** Versionamento e colaboração.
* **HTML, CSS & JavaScript (com Chart.js):** Construção de um dashboard interativo para visualização dos dados.
* **VS Code:** Ambiente de desenvolvimento integrado.

## 📂 Estrutura do Projeto

Projeto_BOM_Datawarehouse
├── README.md               (Este arquivo)
├── .gitignore              (Arquivos a serem ignorados pelo Git)
├── data/                   (Armazena os dados do projeto)
│   └── synthetic/          (Arquivos CSV com dados gerados)
├── sql/                    (Scripts SQL para o banco de dados)
│   ├── ddl/                (Scripts para criação de tabelas)
│   ├── dml/                (Scripts para carga e manipulação de dados)
│   ├── dw/                 (Scripts para a modelagem do Data Warehouse)
│   └── queries/            (Consultas analíticas)
├── dashboard/              (Arquivos para o dashboard HTML)
│   └── data/               (Arquivos JSON para o dashboard)
└── notebooks/              (Notebooks para exploração de dados e geração de dados)


## 📝 Como Rodar o Projeto

Este projeto foi desenvolvido com o objetivo de ser **reprodutível**. Siga os passos abaixo para replicá-lo em sua máquina:

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/SeuUsuario/Projeto-data-warehouse-bom.git](https://github.com/SeuUsuario/Projeto-data-warehouse-bom.git)
    cd Projeto-data-warehouse-bom
    ```
    *(Substitua "SeuUsuario" pelo seu nome de usuário do GitHub).*

2.  **Crie e Ative o Ambiente Virtual:**
    ```bash
    python -m venv venv
    source venv/Scripts/activate
    ```

3.  **Instale as Dependências:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Nota: O arquivo `requirements.txt` será gerado após o download do projeto.)*

4.  **Gere os Dados Sintéticos:**
    * Abra um terminal e rode o script de geração de dados.
    ```bash
    python notebooks/data_generation.py
    ```

5.  **Crie a Estrutura do Banco de Dados:**
    * Abra o SQL Server Management Studio (SSMS).
    * Crie um novo banco de dados chamado `BOM_Fertilizantes`.
    * Execute o script `sql/ddl/01_create_tables.sql` para criar as tabelas.

6.  **Carregue os Dados:**
    * Use o assistente de importação do SSMS para os arquivos `materials.csv`, `suppliers_inventory.csv`, `usage_history.csv` e `material_criticality.csv`.
    * Para o arquivo `bom_structure.csv`, utilize o script Python para evitar erros de importação.
    ```bash
    python sql/dml/02_load_data.py
    ```
