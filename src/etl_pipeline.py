# src/etl_pipeline.py

import pandas as pd
import pyodbc
import os
from sqlalchemy import create_engine
import urllib

def run_etl_pipeline():
    """
    Orquestra o processo de extração, transformação e carga dos dados
    no Data Warehouse SQL Server.
    """
    # 1. Configurar a string de conexão com o banco de dados
    
    server = r'JAKSONPASCOAL\SQLEXPRESS'
    database = 'BOM_Fertilizantes'
    driver = '{ODBC Driver 17 for SQL Server}'
    cnxn_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

    try:
        cnxn = pyodbc.connect(cnxn_string, autocommit=True)
        print("Conexão com o SQL Server estabelecida.")

        # 2. Carregar os dados dos CSVs (Extração)
        print("Carregando dados dos arquivos CSV...")
        path_base = './data/raw/' # caminho para a sua pasta de dados brutos

        # Lendo cada arquivo CSV em um DataFrame do Pandas
        materials_df = pd.read_csv(os.path.join(path_base, 'materials.csv'))
        suppliers_df = pd.read_csv(os.path.join(path_base, 'suppliers_inventory.csv'))
        usage_df = pd.read_csv(os.path.join(path_base, 'usage_history.csv'))
        bom_df = pd.read_csv(os.path.join(path_base, 'bom_structure.csv'))
        criticality_df = pd.read_csv(os.path.join(path_base, 'material_criticality.csv'))

        # 3. Inserir os dados nas tabelas (Carga)
        print("Iniciando a carga de dados. Isso pode levar alguns segundos...")
        
        # Encodando a string de conexão para que o SQLAlchemy possa usá-la
        cnxn_quoted = urllib.parse.quote_plus(cnxn_string)
        engine = create_engine(f'mssql+pyodbc:///?odbc_connect={cnxn_quoted}')

        # Carrega cada DataFrame na sua respectiva tabela, substituindo a tabela se ela já existir
        materials_df.to_sql('materials', con=engine, if_exists='replace', index=False)
        suppliers_df.to_sql('suppliers_inventory', con=engine, if_exists='replace', index=False)
        usage_df.to_sql('usage_history', con=engine, if_exists='replace', index=False)
        bom_df.to_sql('bom_structure', con=engine, if_exists='replace', index=False)
        criticality_df.to_sql('material_criticality', con=engine, if_exists='replace', index=False)

        print("Dados carregados com sucesso no SQL Server.")

    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"Ocorreu um erro: {sqlstate}")
        # Lógica para tratar erros de conexão ou de inserção de dados
    finally:
        if 'cnxn' in locals() and cnxn:
            cnxn.close()
            print("Conexão com o banco de dados fechada.")

if __name__ == "__main__":
    run_etl_pipeline()