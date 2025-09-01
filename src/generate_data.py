import os, random, csv
random.seed(42)

os.makedirs("data/raw", exist_ok=True)
path = "data/raw/bom.csv"

headers = [
    "material_id","descricao","criticidade_engenharia",
    "lead_time_dias","custo_unitario","consumo_mensal","estoque_atual"
]

# Catálogos do domínio
materias_primas = [
    ("URE", "Ureia (46% N)"),
    ("AMN", "Nitrato de amônio"),
    ("MAP", "Fosfato monoamônico (MAP)"),
    ("DAP", "Fosfato diamônico (DAP)"),
    ("KCL", "Cloreto de potássio (KCl)"),
    ("H2SO4", "Ácido sulfúrico (H₂SO₄)"),
    ("NH3", "Amônia anidra (NH₃)"),
]

insumos_processo = [
    ("ANT", "Antiespumante para reator"),
    ("CAT", "Catalisador linha amônia"),
    ("ADP", "Aditivo anti-empedrante granulação"),
    ("FLX", "Fluxo para granulação"),
]

sobressalentes = [
    ("BOM", "Bomba centrífuga aço inox 3”"),
    ("VAL", "Válvula esfera 2” PVDF"),
    ("MOT", "Motor 30 kW IP55"),
    ("ROL", "Rolamento 6205-2RS"),
    ("SEN", "Sensor de nível ultrassônico"),
    ("AGI", "Agitador tanque 5 m³"),
    ("COR", "Correia transportadora 800 mm"),
]

grupos = [
    ("MP", materias_primas, 0.3),      # probabilidade de aparecer
    ("IP", insumos_processo, 0.2),
    ("SB", sobressalentes, 0.5),
]

def amostra_grupo():
    r = random.random()
    cum = 0
    for codigo, itens, p in grupos:
        cum += p
        if r <= cum:
            return codigo, random.choice(itens)
    return "SB", random.choice(sobressalentes)

def sample_lead_time(grupo):
    # MPs costumam ter LT maior que sobressalentes locais
    if grupo == "MP":   return max(7, int(random.gauss(35, 12)))
    if grupo == "IP":   return max(5, int(random.gauss(25, 10)))
    return max(1, int(random.gauss(15, 8)))  # SB

def sample_custo(grupo):
    if grupo == "MP":   return round(max(100, random.gauss(220, 70)), 2)
    if grupo == "IP":   return round(max(50, random.gauss(150, 50)), 2)
    return round(max(10, random.gauss(90, 40)), 2)

def sample_consumo(grupo):
    if grupo == "MP":   return max(10, int(random.gauss(120, 40)))
    if grupo == "IP":   return max(5, int(random.gauss(60, 25)))
    return max(1, int(random.gauss(25, 15)))

def sample_estoque(grupo, consumo):
    # cobertura de estoque média por grupo
    alvo_meses = {"MP": 0.6, "IP": 1.0, "SB": 1.5}[grupo]
    base = max(0, int(consumo * alvo_meses + random.gauss(0, consumo*0.2)))
    return base

rows = []
for i in range(1, 401):
    g_cod, (prefixo, descricao) = amostra_grupo()
    mat_id = f"{g_cod}-{prefixo}-{i:04d}"
    lead = sample_lead_time(g_cod)
    custo = sample_custo(g_cod)
    consumo = sample_consumo(g_cod)
    estoque = sample_estoque(g_cod, consumo)
    crit_eng = random.choices([1,2,3,4,5], weights=[1,2,3,2,1])[0]  # moderado mais comum
    rows.append([mat_id, descricao, crit_eng, lead, custo, consumo, estoque])

with open(path, "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows([headers, *rows])

print(f"[OK] Gerado: {path} ({len(rows)} linhas)")
