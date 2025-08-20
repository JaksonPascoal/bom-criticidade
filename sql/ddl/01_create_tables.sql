-- 01_create_tables.sql

-- Tabela de Materiais
CREATE TABLE materials (
    material_id INT PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(50)
);

-- Tabela de Estrutura de Produção (Bill of Materials)
CREATE TABLE bom_structure (
    product_id INT,
    component_id INT,
    required_quantity DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (product_id, component_id)
);

-- Tabela de Inventário dos Fornecedores
CREATE TABLE suppliers_inventory (
    material_id INT,
    supplier_id INT,
    quantity_in_stock INT NOT NULL,
    PRIMARY KEY (material_id, supplier_id)
);

-- Tabela de Histórico de Uso
CREATE TABLE usage_history (
    material_id INT,
    usage_date DATE,
    used_quantity DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (material_id, usage_date)
);

-- Tabela de Criticidade dos Materiais
CREATE TABLE material_criticality (
    material_id INT PRIMARY KEY,
    criticality_level VARCHAR(50) NOT NULL
);