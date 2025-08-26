    
# src/data_generation.py

import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta
import os

def generate_data(num_records=1000):
    """
    Gera dataframes com dados sintéticos realistas para o projeto BOM.
    """
    # Define a pasta de destino e cria-a se não existir
    output_folder = './data/raw/'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

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
    materials_df = pd.DataFrame({
        'material_id': range(1, num_materials + 1),
        'material_name': [f"{fake.word().capitalize()} - {fake.unique.ean8()}" for _ in range(num_materials)],
        'material_type': np.random.choice(material_types, num_materials)
    })
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
    bom_structure_df = pd.DataFrame(bom_data)
    print("Tabela 'bom_structure' gerada.")

    # --- 3. Gerar Tabela `suppliers_inventory` ---
    print("Gerando tabela 'suppliers_inventory'...")
    num_suppliers = 50
    suppliers_df = pd.DataFrame({
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
    suppliers_inventory_df = pd.DataFrame(inventory_data)
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

        if (material_id, usage_date) not in unique_usage_keys:
            unique_usage_keys.add((material_id, usage_date))
            used_quantity = round(random.uniform(1.0, 500.0), 2)
            usage_data.append({
                'material_id': material_id,
                'usage_date': usage_date.strftime('%Y-%m-%d'),
                'used_quantity': used_quantity
            })

    usage_history_df = pd.DataFrame(usage_data)
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
    criticality_df = pd.DataFrame(criticality_data)
    print("Tabela 'material_criticality' gerada.")

    # Salvando os arquivos CSVs dentro da função
    print("\nSalvando arquivos CSVs na pasta 'data/raw'...")
    materials_df.to_csv(os.path.join(output_folder, 'materials.csv'), index=False)
    suppliers_inventory_df.to_csv(os.path.join(output_folder, 'suppliers_inventory.csv'), index=False)
    usage_history_df.to_csv(os.path.join(output_folder, 'usage_history.csv'), index=False)
    bom_structure_df.to_csv(os.path.join(output_folder, 'bom_structure.csv'), index=False)
    criticality_df.to_csv(os.path.join(output_folder, 'material_criticality.csv'), index=False)
    print("Arquivos salvos com sucesso.")

    # Retorna os dataframes para que o main.py possa usá-los
    return materials_df, suppliers_df, usage_history_df, bom_structure_df, criticality_df

if __name__ == "__main__":
    generate_data()