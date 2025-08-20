-- 01_dim_materials.sql

-- Tabela Dimensão de Materiais (dim_materials)
-- Cria uma tabela de dimensao a partir da tabela de materiais

SELECT
    material_id,
    material_name,
    material_type,
    GETDATE() AS load_date, -- Adiciona uma coluna para rastrear a data de carga (prática de DW)
    'PascoalIA' AS load_by -- Adiciona o nome do agente que fez a carga
INTO
    dim_materials
FROM
    materials;