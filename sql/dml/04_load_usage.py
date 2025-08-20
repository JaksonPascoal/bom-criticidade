import pandas as pd
import pyodbc

# --- Configurações da Conexão ---
server = 'JAKSONPASCOAL\SQLEXPRESS'
database = 'BOM_Fertilizantes'
driver = '{ODBC Driver 17 for SQL Server}'
cnxn_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

# --- Carregar o Arquivo CSV ---
file_path = 'data/synthetic/usage_history.csv'
try:
    df = pd.read_csv(file_path, header=None)
    df.columns = ['material_id', 'usage_date', 'used_quantity']
    print(f"Arquivo CSV '{file_path}' lido com sucesso.")

except FileNotFoundError:
    print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
    exit()

# --- Conectar ao Banco de Dados e Carregar os Dados ---
try:
    cnxn = pyodbc.connect(cnxn_string)
    cursor = cnxn.cursor()

    cursor.execute("TRUNCATE TABLE usage_history;")
    cnxn.commit()
    print("Tabela 'usage_history' limpa.")

    data_to_insert = list(df.itertuples(index=False, name=None))

    cursor.executemany("INSERT INTO usage_history (material_id, usage_date, used_quantity) VALUES (?, ?, ?)", 
                       data_to_insert)

    cnxn.commit()
    print(f"{len(df)} linhas inseridas com sucesso na tabela 'usage_history'.")

except Exception as e:
    print(f"Erro ao conectar ou inserir dados: {e}")

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'cnxn' in locals():
        cnxn.close()
    print("Conexão com o banco de dados fechada.")