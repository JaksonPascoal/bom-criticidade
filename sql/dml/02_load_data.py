import pandas as pd
import pyodbc

# --- Configurações da Conexão ---
server = 'JAKSONPASCOAL\SQLEXPRESS'
database = 'BOM_Fertilizantes'
driver = '{ODBC Driver 17 for SQL Server}'
cnxn_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

# --- Carregar o Arquivo CSV ---
file_path = 'data/synthetic/bom_structure.csv'
try:
    df = pd.read_csv(file_path, header=None)
    df.columns = ['product_id', 'component_id', 'required_quantity']
    print(f"Arquivo CSV '{file_path}' lido com sucesso.")

except FileNotFoundError:
    print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
    exit()

# --- Conectar ao Banco de Dados e Carregar os Dados ---
try:
    cnxn = pyodbc.connect(cnxn_string)
    cursor = cnxn.cursor()

    cursor.execute("TRUNCATE TABLE bom_structure;")
    cnxn.commit()
    print("Tabela 'bom_structure' limpa.")

    for index, row in df.iterrows():
        cursor.execute("INSERT INTO bom_structure (product_id, component_id, required_quantity) VALUES (?, ?, ?)", 
                       row['product_id'], 
                       row['component_id'], 
                       row['required_quantity'])

    cnxn.commit()
    print(f"{len(df)} linhas inseridas com sucesso na tabela 'bom_structure'.")

except Exception as e:
    print(f"Erro ao conectar ou inserir dados: {e}")

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'cnxn' in locals():
        cnxn.close()
    print("Conexão com o banco de dados fechada.")