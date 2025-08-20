import pandas as pd

# Carregue o arquivo CSV com o delimitador correto
df = pd.read_csv('dashboard/data/criticality_data.csv', header=None, delimiter=',')

# Adicione os nomes das colunas
df.columns = ['criticality_level', 'number_of_materials', 'total_quantity_in_stock']

# Converta o DataFrame para JSON e salve
df.to_json('dashboard/data/criticality_data.json', orient='records', indent=4)

print("Conversão de CSV para JSON concluída com sucesso.")