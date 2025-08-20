import pandas as pd
import pyodbc

# --- Configurações da Conexão ---
server = 'JAKSONPASCOAL\SQLEXPRESS'
database = 'BOM_Fertilizantes'
driver = '{ODBC Driver 17 for SQL Server}'
cnxn_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

# --- Carregar o Arquivo CSV ---
file_path = 'data/synthetic/material_criticality.csv'
try:
    df = pd.read_csv(file_path, header=None)
    df.columns = ['material_id', 'criticality_level']
    print(f"Arquivo CSV '{file_path}' lido com sucesso.")

except FileNotFoundError:
    print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
    exit()

# --- Conectar ao Banco de Dados e Carregar os Dados ---
try:
    cnxn = pyodbc.connect(cnxn_string)
    cursor = cnxn.cursor()

    cursor.execute("TRUNCATE TABLE material_criticality;")
    cnxn.commit()
    print("Tabela 'material_criticality' limpa.")

    data_to_insert = list(df.itertuples(index=False, name=None))

    cursor.executemany("INSERT INTO material_criticality (material_id, criticality_level) VALUES (?, ?)", 
                       data_to_insert)

    cnxn.commit()
    print(f"{len(df)} linhas inseridas com sucesso na tabela 'material_criticality'.")

except Exception as e:
    print(f"Erro ao conectar ou inserir dados: {e}")

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'cnxn' in locals():
        cnxn.close()
    print("Conexão com o banco de dados fechada.")