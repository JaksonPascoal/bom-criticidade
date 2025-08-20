-- 02_criticality_analysis.sql
-- Analise do nivel de criticidade dos materiais no inventario

SELECT
    mc.criticality_level,
    COUNT(si.material_id) AS number_of_materials,
    SUM(si.quantity_in_stock) AS total_quantity_in_stock
FROM
    material_criticality AS mc
JOIN
    suppliers_inventory AS si ON mc.material_id = si.material_id
GROUP BY
    mc.criticality_level
ORDER BY
    number_of_materials DESC;