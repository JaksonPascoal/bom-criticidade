-- 01_top_materials_by_quantity.sql
-- Resposta a pergunta de negocio: Quais os 10 materiais mais utilizados por quantidade?

SELECT
    material_type,
    SUM(used_quantity) AS total_used_quantity
FROM
    fact_usage
GROUP BY
    material_type
ORDER BY
    total_used_quantity DESC;