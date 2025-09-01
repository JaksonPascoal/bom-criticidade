# BOM Criticidade — MVP em reconstrução

🚧 Projeto refeito do zero para entregar um MVP simples e fiel:
- Input: `data/raw/bom.csv`
- Pipeline: limpeza + cálculo de **score de criticidade**
- Output: `data/processed/criticidade.csv` e `dashboard` com gráfico Top 20

## Como rodar
```powershell
# 1) (Opcional) Gerar um CSV de exemplo
python src/generate_data.py

# 2) Rodar o ETL (+ score)
python src/etl.py

# 3) Servir o dashboard (abra http://localhost:8000/dashboard/)
python -m http.server 8000

data/
  raw/bom.csv
  processed/criticidade.csv
src/
  generate_data.py
  etl.py
dashboard/
  index.html
  script.js
  styles.css


## `.gitignore`
```gitignore
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.venv/
.env
.ipynb_checkpoints/

# OS
.DS_Store
Thumbs.db

# Data (mantenha raw/ e processed/ versionados se quiser)
*.tmp
