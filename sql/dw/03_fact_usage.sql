-- 03_fact_usage.sql

-- Tabela Fato de Uso (fact_usage)
-- Esta tabela combina o historico de uso com as dimensoes para analise.

SELECT
    uh.material_id,
    uh.usage_date AS date_key,
    uh.used_quantity,
    m.material_type,
    GETDATE() AS load_date,
    'PascoalIA' AS load_by
INTO
    fact_usage
FROM
    usage_history AS uh
LEFT JOIN
    materials AS m ON uh.material_id = m.material_id;