from src.data_generation import generate_data
from src.etl_pipeline import run_etl_pipeline

if __name__ == "__main__":
    print("Iniciando pipeline de dados...")

    # Passo 1: Gerar os dados (e salvá-los localmente)
    print("Gerando dados sintéticos...")
    materials, suppliers, usage, bom, criticality = generate_data()

    # Passo 2: Rodar o ETL
    print("Executando o pipeline ETL e carregando dados no SQL Server...")
    run_etl_pipeline()

    print("Pipeline concluído com sucesso!")