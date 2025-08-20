import pandas as pd
import pyodbc

# --- Configurações da Conexão ---
# O nome do seu servidor pode ser diferente. Verifique no SSMS.
server = 'JAKSONPASCOAL\SQLEXPRESS'
database = 'BOM_Fertilizantes'
driver = '{ODBC Driver 17 for SQL Server}'
cnxn_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

# --- Carregar o Arquivo CSV ---
file_path = 'data/synthetic/suppliers_inventory.csv'
try:
    # Lendo o arquivo sem o cabeçalho
    df = pd.read_csv(file_path, header=None)
    # Definindo os nomes das colunas
    df.columns = ['material_id', 'supplier_id', 'quantity_in_stock']
    print(f"Arquivo CSV '{file_path}' lido com sucesso.")

except FileNotFoundError:
    print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
    exit()

# --- Conectar ao Banco de Dados e Carregar os Dados ---
try:
    cnxn = pyodbc.connect(cnxn_string)
    cursor = cnxn.cursor()

    # Limpar a tabela antes de inserir novos dados
    cursor.execute("TRUNCATE TABLE suppliers_inventory;")
    cnxn.commit()
    print("Tabela 'suppliers_inventory' limpa.")

    # Convertendo o DataFrame para uma lista de tuplas para evitar erros de tipo
    # O comando itertuples é mais eficiente que iterrows
    data_to_insert = list(df.itertuples(index=False, name=None))
    
    # Inserindo os dados de forma otimizada com executemany
    cursor.executemany("INSERT INTO suppliers_inventory (material_id, supplier_id, quantity_in_stock) VALUES (?, ?, ?)", 
                       data_to_insert)
    
    cnxn.commit()
    print(f"{len(df)} linhas inseridas com sucesso na tabela 'suppliers_inventory'.")

except Exception as e:
    print(f"Erro ao conectar ou inserir dados: {e}")

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'cnxn' in locals():
        cnxn.close()
    print("Conexão com o banco de dados fechada.")