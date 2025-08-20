import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta

# Inicializa o gerador de dados sintéticos
fake = Faker('pt_BR')

# Define a semente para garantir que os dados sejam sempre os mesmos a cada execução
Faker.seed(42)
np.random.seed(42)
random.seed(42)

# --- 1. Gerar Tabela `materials` ---
print("Gerando tabela 'materials'...")
num_materials = 1000
material_types = ['Fertilizante', 'Aditivo', 'Embalagem', 'Insumo Químico', 'Catalisador']
materials = pd.DataFrame({
    'material_id': range(1, num_materials + 1),
    'material_name': [f"{fake.word().capitalize()} - {fake.unique.ean8()}" for _ in range(num_materials)],
    'material_type': np.random.choice(material_types, num_materials)
})
materials.to_csv('data/synthetic/materials.csv', index=False)
print("Tabela 'materials' gerada.")

# --- 2. Gerar Tabela `bom_structure` (Bill of Materials) ---
print("Gerando tabela 'bom_structure'...")
num_products = 500
bom_data = []
for product_id in range(1, num_products + 1):
    num_components = random.randint(2, 5)
    components = random.sample(range(1, num_materials + 1), num_components)
    for component_id in components:
        bom_data.append({
            'product_id': product_id,
            'component_id': component_id,
            'required_quantity': round(random.uniform(0.1, 100.0), 2)
        })
bom_structure = pd.DataFrame(bom_data)
bom_structure.to_csv('data/synthetic/bom_structure.csv', index=False)
print("Tabela 'bom_structure' gerada.")

# --- 3. Gerar Tabela `suppliers_inventory` ---
print("Gerando tabela 'suppliers_inventory'...")
num_suppliers = 50
suppliers = pd.DataFrame({
    'supplier_id': range(1, num_suppliers + 1),
    'supplier_name': [fake.unique.company() for _ in range(num_suppliers)]
})

inventory_data = []
for material_id in range(1, num_materials + 1):
    num_suppliers_for_material = random.randint(1, 3)
    suppliers_for_material = random.sample(range(1, num_suppliers + 1), num_suppliers_for_material)
    for supplier_id in suppliers_for_material:
        inventory_data.append({
            'material_id': material_id,
            'supplier_id': supplier_id,
            'quantity_in_stock': random.randint(100, 50000)
        })
suppliers_inventory = pd.DataFrame(inventory_data)
suppliers_inventory.to_csv('data/synthetic/suppliers_inventory.csv', index=False)
print("Tabela 'suppliers_inventory' gerada.")

# --- 4. Gerar Tabela `usage_history` ---
print("Gerando tabela 'usage_history'...")
start_date = datetime(2023, 1, 1)
end_date = datetime(2024, 8, 20)
time_delta = end_date - start_date
num_days = time_delta.days
num_usages = 50000

usage_data = []
unique_usage_keys = set()

while len(unique_usage_keys) < num_usages:
    random_days = random.randint(0, num_days)
    usage_date = start_date + timedelta(days=random_days)
    material_id = random.randint(1, num_materials)

    # Garante a unicidade da combinacao de material_id e usage_date
    if (material_id, usage_date) not in unique_usage_keys:
        unique_usage_keys.add((material_id, usage_date))
        used_quantity = round(random.uniform(1.0, 500.0), 2)
        usage_data.append({
            'material_id': material_id,
            'usage_date': usage_date.strftime('%Y-%m-%d'),
            'used_quantity': used_quantity
        })

usage_history = pd.DataFrame(usage_data)
usage_history.to_csv('data/synthetic/usage_history.csv', index=False)
print("Tabela 'usage_history' gerada.")

# --- 5. Gerar Tabela `material_criticality` ---
print("Gerando tabela 'material_criticality'...")
criticality_levels = ['Baixa', 'Média', 'Alta']
criticality_data = []
for material_id in range(1, num_materials + 1):
    criticality_data.append({
        'material_id': material_id,
        'criticality_level': random.choice(criticality_levels)
    })
material_criticality = pd.DataFrame(criticality_data)
material_criticality.to_csv('data/synthetic/material_criticality.csv', index=False)
print("Tabela 'material_criticality' gerada.")

print("\nTodos os arquivos CSV foram gerados com sucesso na pasta 'data/synthetic'.")