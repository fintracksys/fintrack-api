# 🚀 Roadmap de Engenharia de Dados - Fintrack

## 📊 Análise do Sistema Atual

### Contexto do Fintrack
Sistema de controle financeiro pessoal que:
- **Fonte de dados**: Web scraping de NFes (Notas Fiscais Eletrônicas) brasileiras
- **Armazenamento atual**: MySQL (Prisma ORM)
- **Processamento**: Síncrono via API REST
- **Dados coletados**: Transações, produtos, lojas, métodos de pagamento

### Estrutura de Dados Identificada
```
Users → Accounts → Transactions → Tickets
         ↓           ↓
    Categories    TransactionTypes
    Subcategories
```

### Oportunidades de Melhoria
1. ❌ Sem pipeline de dados estruturado
2. ❌ Sem data warehouse para análises
3. ❌ Processamento síncrono (sem batch/streaming)
4. ❌ Sem observabilidade/monitoramento
5. ❌ Sem qualidade de dados automatizada
6. ❌ Sem histórico/versionamento de dados

---

## 🎯 Roadmap por Níveis

### **NÍVEL 1: FUNDAMENTOS - Pipeline ETL Básico**
*Duração: 2-3 meses | Foco: Automatizar coleta e transformação*

#### Objetivos
- Criar pipeline ETL automatizado para NFes
- Implementar data quality básico
- Versionamento de código (Git)

#### Tecnologias
- **Python**: Pandas, Requests, BeautifulSoup/Cheerio
- **SQL**: MySQL (atual) + PostgreSQL (para staging)
- **Git/GitHub**: Controle de versão
- **Docker**: Containerização do pipeline

#### Projeto Prático: Pipeline ETL de NFes

**1. Extração (Extract)**
```python
# scripts/extract/nfe_scraper.py
- Scraping de URLs de NFe
- Extração de dados brutos (raw)
- Salvamento em formato parquet/JSON
- Tratamento de erros e retry logic
```

**2. Transformação (Transform)**
```python
# scripts/transform/data_cleaner.py
- Limpeza de dados (CNPJ, preços, quantidades)
- Validação de campos obrigatórios
- Normalização de formatos
- Enriquecimento (geocodificação de endereços)
```

**3. Carga (Load)**
```python
# scripts/load/data_loader.py
- Carga incremental no MySQL
- Detecção de duplicatas
- Logging de erros
- Notificações de falhas
```

**4. Orquestração Básica**
```python
# scripts/orchestrator.py
- Script Python com schedule (cron)
- Execução diária/horária
- Logs estruturados
```

#### Entregas
- ✅ Pipeline ETL funcional
- ✅ Scripts versionados no GitHub
- ✅ Documentação do pipeline
- ✅ Testes unitários básicos

#### Métricas de Sucesso
- Pipeline roda sem intervenção manual
- Taxa de sucesso > 95%
- Tempo de processamento < 5min para 100 NFes

---

### **NÍVEL 2: INTERMEDIÁRIO - Data Warehouse e Orquestração**
*Duração: 3-4 meses | Foco: Analytics e automação*

#### Objetivos
- Criar Data Warehouse para análises
- Implementar orquestração com Airflow/Prefect
- Data quality avançado
- Observabilidade básica

#### Tecnologias
- **Airflow/Prefect**: Orquestração de pipelines
- **PostgreSQL/BigQuery**: Data Warehouse
- **dbt**: Transformação de dados
- **Great Expectations**: Data quality
- **Docker Compose**: Ambiente local

#### Projeto Prático: Data Warehouse Fintrack

**1. Arquitetura Medallion (Bronze → Silver → Gold)**

```
Bronze Layer (Raw Data)
├── nfe_raw/
│   ├── date=2024-01-01/
│   │   └── nfe_12345.parquet
│   └── date=2024-01-02/
│       └── nfe_12346.parquet

Silver Layer (Cleaned Data)
├── transactions_cleaned/
│   ├── date=2024-01-01/
│   └── date=2024-01-02/

Gold Layer (Analytics Ready)
├── fact_transactions/
├── dim_users/
├── dim_categories/
├── dim_stores/
└── dim_time/
```

**2. Modelagem Dimensional (Star Schema)**

```sql
-- Fact Table
fact_transactions
├── transaction_id (PK)
├── user_id (FK)
├── account_id (FK)
├── category_id (FK)
├── store_id (FK)
├── date_id (FK)
├── transaction_type_id (FK)
├── amount (medida)
├── quantity_items (medida)
└── payment_method

-- Dimension Tables
dim_users
├── user_id (PK)
├── name
├── email
└── created_at

dim_stores
├── store_id (PK)
├── store_name
├── cnpj
├── address
└── city

dim_time
├── date_id (PK)
├── date
├── day_of_week
├── month
├── quarter
└── year

dim_categories
├── category_id (PK)
├── category_name
├── subcategory_name
└── hierarchy_level
```

**3. Pipeline com Airflow**

```python
# dags/fintrack_etl_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator

dag = DAG(
    'fintrack_nfe_etl',
    schedule_interval='@daily',
    catchup=False
)

extract_task = PythonOperator(
    task_id='extract_nfes',
    python_callable=extract_nfes,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_bronze_task = PythonOperator(
    task_id='load_bronze',
    python_callable=load_to_bronze,
    dag=dag
)

load_silver_task = PythonOperator(
    task_id='load_silver',
    python_callable=load_to_silver,
    dag=dag
)

load_gold_task = PythonOperator(
    task_id='load_gold',
    python_callable=load_to_gold,
    dag=dag
)

extract_task >> transform_task >> load_bronze_task >> load_silver_task >> load_gold_task
```

**4. Transformações com dbt**

```sql
-- models/silver/stg_transactions.sql
{{ config(materialized='view') }}

SELECT
    transaction_id,
    user_id,
    store_name,
    cnpj,
    date_ticket,
    payment_method,
    total_value
FROM {{ source('bronze', 'nfe_raw') }}
WHERE date_ticket IS NOT NULL
  AND total_value > 0

-- models/gold/fact_transactions.sql
{{ config(materialized='table') }}

SELECT
    t.transaction_id,
    u.user_id,
    s.store_id,
    c.category_id,
    d.date_id,
    t.total_value AS amount,
    COUNT(ti.ticket_id) AS quantity_items,
    t.payment_method
FROM {{ ref('stg_transactions') }} t
JOIN {{ ref('dim_users') }} u ON t.user_id = u.user_id
JOIN {{ ref('dim_stores') }} s ON t.cnpj = s.cnpj
JOIN {{ ref('dim_categories') }} c ON t.category_id = c.category_id
JOIN {{ ref('dim_time') }} d ON DATE(t.date_ticket) = d.date
LEFT JOIN {{ source('bronze', 'tickets') }} ti ON t.transaction_id = ti.transaction_id
GROUP BY 1, 2, 3, 4, 5, 7, 8
```

**5. Data Quality com Great Expectations**

```python
# expectations/transactions_expectations.py
from great_expectations.dataset import PandasDataset

expectations = [
    {
        "expectation_type": "expect_column_values_to_not_be_null",
        "kwargs": {"column": "transaction_id"}
    },
    {
        "expectation_type": "expect_column_values_to_be_between",
        "kwargs": {"column": "total_value", "min_value": 0}
    },
    {
        "expectation_type": "expect_column_values_to_match_regex",
        "kwargs": {"column": "cnpj", "regex": r"^\d{14}$"}
    }
]
```

**6. Observabilidade Básica**

```python
# monitoring/metrics.py
import logging
from prometheus_client import Counter, Histogram

nfe_processed = Counter('nfe_processed_total', 'Total NFes processed')
pipeline_duration = Histogram('pipeline_duration_seconds', 'Pipeline execution time')
errors_total = Counter('pipeline_errors_total', 'Total pipeline errors')
```

#### Entregas
- ✅ Data Warehouse com star schema
- ✅ Pipeline orquestrado com Airflow
- ✅ Transformações com dbt
- ✅ Data quality automatizado
- ✅ Dashboard básico de métricas

#### Métricas de Sucesso
- Pipeline roda diariamente sem falhas
- Data quality score > 98%
- Queries analíticas < 2s
- Cobertura de testes > 80%

---

### **NÍVEL 3: AVANÇADO - Cloud e Streaming**
*Duração: 4-6 meses | Foco: Escalabilidade e tempo real*

#### Objetivos
- Migrar para cloud (AWS/GCP/Azure)
- Implementar processamento streaming
- Data Lake com particionamento
- Observabilidade completa

#### Tecnologias
- **Cloud**: AWS (S3, Glue, Redshift) ou GCP (BigQuery, Dataflow)
- **Streaming**: Kafka/Kinesis + Spark Streaming
- **Storage**: S3/GCS (Data Lake)
- **Compute**: EMR/Databricks ou Dataflow
- **Monitoring**: CloudWatch/Stackdriver, Grafana

#### Projeto Prático: Arquitetura Cloud Fintrack

**1. Arquitetura Lambda (Batch + Streaming)**

```
┌─────────────────┐
│   API Gateway   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda (API)   │──┐
└────────┬────────┘  │
         │           │
         ▼           │
┌─────────────────┐ │
│   Kinesis/Kafka │◄─┘
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Batch  │ │ Streaming│
│ (Glue) │ │ (Spark)  │
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌─────────────────┐
│   S3 Data Lake  │
│  (Bronze/Silver)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redshift/BQ    │
│  (Gold Layer)   │
└─────────────────┘
```

**2. Data Lake no S3**

```
s3://fintrack-data-lake/
├── bronze/
│   ├── nfe/
│   │   ├── year=2024/
│   │   │   ├── month=01/
│   │   │   │   ├── day=01/
│   │   │   │   │   └── nfe_data.parquet
│   │   │   │   └── day=02/
│   │   │   └── month=02/
│   │   └── year=2025/
│   └── transactions/
├── silver/
│   ├── transactions_cleaned/
│   └── stores_enriched/
└── gold/
    ├── analytics/
    └── marts/
```

**3. Pipeline Streaming com Kinesis + Spark**

```python
# streaming/nfe_stream_processor.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = SparkSession.builder \
    .appName("FintrackStreaming") \
    .getOrCreate()

# Lê do Kinesis
df = spark.readStream \
    .format("kinesis") \
    .option("streamName", "fintrack-nfe-stream") \
    .option("region", "us-east-1") \
    .load()

# Transforma
processed_df = df \
    .withColumn("parsed_data", from_json(col("data"), schema)) \
    .select(
        col("parsed_data.transaction_id"),
        col("parsed_data.store_name"),
        col("parsed_data.total_value"),
        current_timestamp().alias("processed_at")
    )

# Escreve no S3
query = processed_df.writeStream \
    .format("parquet") \
    .option("path", "s3://fintrack-data-lake/silver/transactions/") \
    .option("checkpointLocation", "s3://fintrack-checkpoints/") \
    .partitionBy("year", "month", "day") \
    .trigger(processingTime='1 minute') \
    .start()
```

**4. Pipeline Batch com AWS Glue**

```python
# glue_scripts/nfe_etl.py
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext

args = getResolvedOptions(sys.argv, ['JOB_NAME', 'S3_SOURCE', 'S3_TARGET'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session

# Lê do S3 Bronze
datasource = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [args['S3_SOURCE']]},
    format="parquet"
)

# Transforma
transformed = ApplyMapping.apply(
    frame=datasource,
    mappings=[
        ("store_name", "string", "store_name", "string"),
        ("cnpj", "string", "cnpj", "string"),
        ("total_value", "decimal", "amount", "decimal")
    ]
)

# Escreve no S3 Silver
glueContext.write_dynamic_frame.from_options(
    frame=transformed,
    connection_type="s3",
    connection_options={"path": args['S3_TARGET']},
    format="parquet",
    format_options={"compression": "snappy"}
)
```

**5. Observabilidade Completa**

```python
# monitoring/observability.py
import boto3
from prometheus_client import push_to_gateway

cloudwatch = boto3.client('cloudwatch')

def log_metric(metric_name, value, unit='Count'):
    cloudwatch.put_metric_data(
        Namespace='Fintrack/Pipeline',
        MetricData=[{
            'MetricName': metric_name,
            'Value': value,
            'Unit': unit,
            'Timestamp': datetime.utcnow()
        }]
    )

# Métricas
log_metric('NFesProcessed', nfe_count)
log_metric('PipelineDuration', duration, 'Seconds')
log_metric('Errors', error_count)
```

#### Entregas
- ✅ Arquitetura cloud completa
- ✅ Pipeline streaming funcional
- ✅ Data Lake particionado
- ✅ Observabilidade com métricas
- ✅ Documentação de arquitetura

#### Métricas de Sucesso
- Latência de streaming < 1 minuto
- Escalabilidade para 1M+ transações/dia
- Uptime > 99.9%
- Custo otimizado (reserved instances)

---

### **NÍVEL 4: ESPECIALIZAÇÃO - Otimização e ML**
*Duração: 6+ meses | Foco: Performance e inteligência*

#### Objetivos
- Otimização avançada de queries
- Machine Learning para classificação automática
- Data governance e compliance
- Feature store

#### Tecnologias
- **ML**: Scikit-learn, XGBoost, ou MLflow
- **Feature Store**: Feast ou Tecton
- **Governance**: Apache Atlas, DataHub
- **Optimization**: Query optimization, caching (Redis)

#### Projetos Práticos

**1. ML para Classificação Automática de Transações**

```python
# ml/transaction_classifier.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Features
features = [
    'store_name',
    'cnpj',
    'total_value',
    'quantity_items',
    'payment_method',
    'day_of_week',
    'hour'
]

# Treina modelo
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Predição em batch
predictions = model.predict(X_new)
```

**2. Feature Store com Feast**

```python
# features/transaction_features.py
from feast import Entity, Feature, FeatureView, ValueType
from feast.data_source import FileSource

transaction_entity = Entity(
    name="transaction_id",
    value_type=ValueType.STRING,
    description="Transaction identifier"
)

transaction_features = FeatureView(
    name="transaction_features",
    entities=["transaction_id"],
    features=[
        Feature(name="total_value", dtype=ValueType.FLOAT),
        Feature(name="store_category", dtype=ValueType.STRING),
        Feature(name="avg_monthly_spend", dtype=ValueType.FLOAT)
    ],
    source=FileSource(path="s3://fintrack-features/")
)
```

**3. Otimização de Queries**

```sql
-- Índices otimizados
CREATE INDEX idx_transactions_user_date 
ON fact_transactions(user_id, date_id);

CREATE INDEX idx_transactions_store 
ON fact_transactions(store_id) 
INCLUDE (amount, date_id);

-- Materialized views
CREATE MATERIALIZED VIEW mv_monthly_summary AS
SELECT
    user_id,
    DATE_TRUNC('month', date) AS month,
    SUM(amount) AS total_spent,
    COUNT(*) AS transaction_count
FROM fact_transactions
GROUP BY 1, 2;
```

#### Entregas
- ✅ Modelo ML em produção
- ✅ Feature store implementado
- ✅ Queries otimizadas
- ✅ Data governance policies

---

## 📚 Recursos de Aprendizado por Nível

### Nível 1
- **Cursos**: Python for Data Engineering (DataCamp)
- **Livros**: "Python for Data Analysis" - Wes McKinney
- **Projetos**: Replicar pipeline ETL do Fintrack

### Nível 2
- **Cursos**: Data Engineering Zoomcamp (DataTalks.Club) - **GRATUITO**
- **Documentação**: Airflow docs, dbt docs
- **Projetos**: Construir DW completo do Fintrack

### Nível 3
- **Cursos**: AWS/GCP Data Engineering paths
- **Certificações**: AWS Certified Data Analytics
- **Projetos**: Migrar Fintrack para cloud

### Nível 4
- **Cursos**: ML Engineering (MLOps)
- **Livros**: "Designing Data-Intensive Applications"
- **Projetos**: Sistema completo de ML no Fintrack

---

## 🎯 Projetos Práticos por Nível

### Projeto 1: Pipeline ETL Básico (Nível 1)
**Objetivo**: Automatizar coleta de NFes

**Stack**:
- Python + Pandas
- MySQL/PostgreSQL
- Docker

**Entregas**:
- Script de scraping
- Pipeline de transformação
- Carga no banco
- Documentação

### Projeto 2: Data Warehouse (Nível 2)
**Objetivo**: Criar DW para análises financeiras

**Stack**:
- Airflow
- PostgreSQL/BigQuery
- dbt
- Great Expectations

**Entregas**:
- Star schema
- Pipelines orquestrados
- Data quality
- Dashboard básico

### Projeto 3: Cloud Migration (Nível 3)
**Objetivo**: Migrar para cloud com streaming

**Stack**:
- AWS/GCP
- Kinesis/Kafka
- Spark Streaming
- S3/GCS

**Entregas**:
- Arquitetura cloud
- Pipeline streaming
- Data Lake
- Observabilidade

### Projeto 4: ML Pipeline (Nível 4)
**Objetivo**: Classificação automática de transações

**Stack**:
- Scikit-learn/XGBoost
- MLflow
- Feature Store
- API de predição

**Entregas**:
- Modelo treinado
- Pipeline de ML
- API de predição
- Monitoramento de modelo

---

## 📊 Métricas de Progresso

### Por Nível
- **Nível 1**: Pipeline roda sem intervenção
- **Nível 2**: DW com queries < 2s
- **Nível 3**: Streaming com latência < 1min
- **Nível 4**: ML em produção com > 90% accuracy

### Gerais
- ✅ Código versionado no GitHub
- ✅ Documentação completa
- ✅ Testes com cobertura > 80%
- ✅ Pipeline em produção
- ✅ Observabilidade implementada

---

## 🚀 Próximos Passos Imediatos

1. **Começar Nível 1**:
   - Criar repositório `fintrack-data-engineering`
   - Implementar script de scraping
   - Criar pipeline ETL básico
   - Documentar processo

2. **Preparar Ambiente**:
   - Instalar Python 3.9+
   - Configurar Docker
   - Criar conta GitHub
   - Setup MySQL/PostgreSQL local

3. **Primeiro Projeto**:
   - Extrair 10 NFes manualmente
   - Transformar dados
   - Carregar no banco
   - Validar resultados

---

## 💡 Dicas Finais

1. **Foque em profundidade antes de amplitude**
2. **Construa projetos reais, não tutoriais**
3. **Documente tudo que você aprende**
4. **Participe de comunidades (r/dataengineering)**
5. **Contribua para projetos open source**
6. **Use o Fintrack como laboratório contínuo**

---

**Boa sorte na jornada de Engenharia de Dados! 🎉**

