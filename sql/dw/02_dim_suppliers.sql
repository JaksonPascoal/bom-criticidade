-- 02_dim_suppliers.sql

-- Tabela Dimensão de Fornecedores (dim_suppliers)
-- Cria uma tabela de dimensão a partir das informações de inventário de fornecedores.

SELECT
    supplier_id,
    GETDATE() AS load_date,
    'PascoalIA' AS load_by
INTO
    dim_suppliers
FROM
    suppliers_inventory
GROUP BY
    supplier_id;