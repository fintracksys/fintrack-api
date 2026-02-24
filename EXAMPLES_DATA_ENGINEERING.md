# 💻 Exemplos Práticos - Engenharia de Dados Fintrack

Este documento contém exemplos de código práticos para cada nível do roadmap, usando o sistema Fintrack como base.

---

## 📦 NÍVEL 1: Pipeline ETL Básico

### 1.1. Script de Extração (Extract)

```python
# scripts/extract/nfe_scraper.py
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NFEScraper:
    def __init__(self, output_dir: str = "data/raw"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def scrape_nfe(self, url: str) -> dict:
        """Extrai dados de uma NFe via web scraping"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extrai dados (baseado no código atual do Fintrack)
            data = {
                'url': url,
                'store_name': self._extract_store_name(soup),
                'cnpj': self._extract_cnpj(soup),
                'store_address': self._extract_address(soup),
                'date_ticket': self._extract_date(soup),
                'time_ticket': self._extract_time(soup),
                'payment_method': self._extract_payment_method(soup),
                'items': self._extract_items(soup),
                'scraped_at': datetime.now().isoformat()
            }
            
            return data
        except Exception as e:
            logger.error(f"Erro ao fazer scraping de {url}: {e}")
            raise
    
    def _extract_store_name(self, soup):
        element = soup.select_one('#u20')
        return element.text.strip() if element else None
    
    def _extract_cnpj(self, soup):
        element = soup.select_one('#conteudo > div:nth-child(2) > div:nth-child(2)')
        if element:
            cnpj = element.text.strip()
            # Remove caracteres não numéricos
            return ''.join(filter(str.isdigit, cnpj))
        return None
    
    def _extract_address(self, soup):
        element = soup.select_one('#conteudo > div:nth-child(2) > div:nth-child(3)')
        return element.text.strip() if element else None
    
    def _extract_date(self, soup):
        # Implementar lógica de extração de data
        # Similar ao extractDateTimeFromElement do código atual
        return None
    
    def _extract_time(self, soup):
        # Implementar lógica de extração de hora
        return None
    
    def _extract_payment_method(self, soup):
        element = soup.select_one('#linhaTotal label')
        if element:
            text = element.text.strip()
            # Mapeia texto para enum (similar ao getPaymentMethodFromText)
            return self._map_payment_method(text)
        return None
    
    def _map_payment_method(self, text: str) -> str:
        mapping = {
            'cartão de crédito': 'CREDIT_CARD',
            'cartão de débito': 'DEBIT_CARD',
            'dinheiro': 'CASH',
            'pix': 'PIX'
        }
        text_lower = text.lower()
        for key, value in mapping.items():
            if key in text_lower:
                return value
        return 'OTHER'
    
    def _extract_items(self, soup):
        items = []
        item_elements = soup.select('[id^="Item"]')
        
        for element in item_elements:
            item = {
                'name_product': self._extract_item_name(element),
                'cod_product': self._extract_item_code(element),
                'quantity': self._extract_quantity(element),
                'measure': self._extract_measure(element),
                'price': self._extract_price(element),
                'total_value': self._extract_total_value(element)
            }
            items.append(item)
        
        return items
    
    def _extract_item_name(self, element):
        spans = element.select('td:first-child span')
        return spans[0].text.strip() if spans else None
    
    def _extract_item_code(self, element):
        spans = element.select('td:first-child span')
        if len(spans) > 1:
            code = spans[1].text.strip()
            return ''.join(filter(str.isdigit, code))
        return None
    
    def _extract_quantity(self, element):
        spans = element.select('td:first-child span')
        if len(spans) > 2:
            quantity = spans[2].text.strip()
            # Remove caracteres não numéricos exceto ponto
            return ''.join(c for c in quantity if c.isdigit() or c == '.')
        return None
    
    def _extract_measure(self, element):
        spans = element.select('td:first-child span')
        if len(spans) > 3:
            measure = spans[3].text.strip()
            # Extrai após "UN:"
            if 'UN:' in measure:
                return measure.split('UN:')[1].strip()
            return measure
        return None
    
    def _extract_price(self, element):
        spans = element.select('td:first-child span')
        if len(spans) > 4:
            price = spans[4].text.strip()
            # Remove caracteres não numéricos exceto ponto
            return ''.join(c for c in price if c.isdigit() or c == '.')
        return None
    
    def _extract_total_value(self, element):
        element_total = element.select_one('td:nth-child(2) span')
        if element_total:
            total = element_total.text.strip()
            return ''.join(c for c in total if c.isdigit() or c == '.')
        return None
    
    def save_raw_data(self, data: dict, filename: str = None):
        """Salva dados brutos em JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"nfe_{timestamp}.json"
        
        filepath = self.output_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Dados salvos em {filepath}")
        return filepath

# Uso
if __name__ == "__main__":
    scraper = NFEScraper()
    url = "https://nfe.sefaz.gov.br/.../nfe.html"
    data = scraper.scrape_nfe(url)
    scraper.save_raw_data(data)
```

### 1.2. Script de Transformação (Transform)

```python
# scripts/transform/data_cleaner.py
import pandas as pd
import re
from decimal import Decimal
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class DataCleaner:
    """Limpa e valida dados extraídos das NFes"""
    
    def __init__(self):
        self.validation_errors = []
    
    def clean_transaction(self, raw_data: dict) -> dict:
        """Limpa dados de uma transação"""
        cleaned = {
            'transaction_id': self._generate_id(),
            'store_name': self._clean_text(raw_data.get('store_name')),
            'store_address': self._clean_address(raw_data.get('store_address')),
            'cnpj': self._clean_cnpj(raw_data.get('cnpj')),
            'date_ticket': self._parse_date(raw_data.get('date_ticket')),
            'time_ticket': self._clean_time(raw_data.get('time_ticket')),
            'payment_method': raw_data.get('payment_method', 'OTHER'),
            'url_nfe': raw_data.get('url'),
            'items': self._clean_items(raw_data.get('items', []))
        }
        
        # Calcula total da transação
        cleaned['total_value'] = sum(
            float(item.get('total_value', 0)) 
            for item in cleaned['items']
        )
        
        # Validação
        self._validate_transaction(cleaned)
        
        return cleaned
    
    def _clean_text(self, text: str) -> str:
        """Remove espaços extras e caracteres especiais"""
        if not text:
            return None
        return ' '.join(text.split())
    
    def _clean_cnpj(self, cnpj: str) -> str:
        """Valida e formata CNPJ"""
        if not cnpj:
            return None
        
        # Remove caracteres não numéricos
        cnpj_clean = ''.join(filter(str.isdigit, cnpj))
        
        # Valida tamanho (14 dígitos)
        if len(cnpj_clean) != 14:
            self.validation_errors.append(f"CNPJ inválido: {cnpj}")
            return None
        
        return cnpj_clean
    
    def _clean_address(self, address: str) -> str:
        """Limpa endereço"""
        if not address:
            return None
        # Remove múltiplos espaços
        return ' '.join(address.split())
    
    def _parse_date(self, date_str: str):
        """Converte string de data para datetime"""
        if not date_str:
            return None
        
        try:
            # Tenta diferentes formatos
            formats = ['%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']
            for fmt in formats:
                try:
                    return pd.to_datetime(date_str, format=fmt)
                except:
                    continue
            return pd.to_datetime(date_str)
        except:
            logger.warning(f"Erro ao parsear data: {date_str}")
            return None
    
    def _clean_time(self, time_str: str) -> str:
        """Limpa hora"""
        if not time_str:
            return None
        # Formato HH:MM:SS
        match = re.match(r'(\d{2}):(\d{2})', time_str)
        if match:
            return f"{match.group(1)}:{match.group(2)}:00"
        return time_str
    
    def _clean_items(self, items: List[dict]) -> List[dict]:
        """Limpa lista de itens"""
        cleaned_items = []
        for item in items:
            cleaned_item = {
                'cod_product': self._clean_cod_product(item.get('cod_product')),
                'name_product': self._clean_text(item.get('name_product')),
                'quantity': self._clean_decimal(item.get('quantity')),
                'measure': self._clean_measure(item.get('measure')),
                'price': self._clean_decimal(item.get('price')),
                'total_value': self._clean_decimal(item.get('total_value'))
            }
            cleaned_items.append(cleaned_item)
        return cleaned_items
    
    def _clean_cod_product(self, cod: str) -> str:
        """Limpa código do produto"""
        if not cod:
            return None
        return ''.join(filter(str.isdigit, cod))
    
    def _clean_decimal(self, value: str) -> float:
        """Converte string para decimal"""
        if not value:
            return 0.0
        
        # Remove caracteres não numéricos exceto ponto
        clean_value = re.sub(r'[^\d.]', '', str(value))
        
        try:
            return float(clean_value)
        except:
            logger.warning(f"Erro ao converter decimal: {value}")
            return 0.0
    
    def _clean_measure(self, measure: str) -> str:
        """Limpa unidade de medida"""
        if not measure:
            return 'UN'
        
        # Padroniza unidades comuns
        measure_upper = measure.upper()
        if 'UN' in measure_upper or 'UNID' in measure_upper:
            return 'UN'
        elif 'KG' in measure_upper:
            return 'KG'
        elif 'L' in measure_upper or 'LITRO' in measure_upper:
            return 'L'
        return measure[:2]  # Retorna primeiros 2 caracteres
    
    def _validate_transaction(self, transaction: dict):
        """Valida transação"""
        errors = []
        
        if not transaction.get('store_name'):
            errors.append("store_name é obrigatório")
        
        if not transaction.get('cnpj'):
            errors.append("cnpj é obrigatório")
        
        if not transaction.get('date_ticket'):
            errors.append("date_ticket é obrigatório")
        
        if transaction.get('total_value', 0) <= 0:
            errors.append("total_value deve ser maior que zero")
        
        if errors:
            self.validation_errors.extend(errors)
            logger.warning(f"Erros de validação: {errors}")
    
    def _generate_id(self) -> str:
        """Gera ID único (similar ao nanoid do código atual)"""
        import uuid
        return str(uuid.uuid4())[:16]

# Uso
if __name__ == "__main__":
    cleaner = DataCleaner()
    
    # Lê dados brutos
    import json
    with open('data/raw/nfe_20240101_120000.json', 'r') as f:
        raw_data = json.load(f)
    
    # Limpa dados
    cleaned_data = cleaner.clean_transaction(raw_data)
    
    # Salva dados limpos
    with open('data/cleaned/transaction_cleaned.json', 'w') as f:
        json.dump(cleaned_data, f, indent=2, default=str)
```

### 1.3. Script de Carga (Load)

```python
# scripts/load/data_loader.py
import mysql.connector
from mysql.connector import Error
import pandas as pd
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class DataLoader:
    """Carrega dados limpos no banco de dados"""
    
    def __init__(self, db_config: dict):
        self.db_config = db_config
        self.connection = None
    
    def connect(self):
        """Conecta ao banco de dados"""
        try:
            self.connection = mysql.connector.connect(**self.db_config)
            logger.info("Conectado ao MySQL")
        except Error as e:
            logger.error(f"Erro ao conectar: {e}")
            raise
    
    def disconnect(self):
        """Desconecta do banco"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Desconectado do MySQL")
    
    def load_transaction(self, transaction_data: dict, user_id: str) -> str:
        """Carrega uma transação no banco"""
        cursor = self.connection.cursor()
        
        try:
            # Insere transação
            transaction_query = """
                INSERT INTO transaction (
                    id, store_name, store_address, date_ticket, time_ticket,
                    payment_method, cnpj, url_nfe, user_id, account_id,
                    category_id, subcategory_id, transaction_type_id,
                    created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                )
            """
            
            transaction_id = transaction_data.get('transaction_id')
            values = (
                transaction_id,
                transaction_data.get('store_name'),
                transaction_data.get('store_address'),
                transaction_data.get('date_ticket'),
                transaction_data.get('time_ticket'),
                transaction_data.get('payment_method'),
                transaction_data.get('cnpj'),
                transaction_data.get('url_nfe'),
                user_id,
                transaction_data.get('account_id'),
                transaction_data.get('category_id'),
                transaction_data.get('subcategory_id'),
                transaction_data.get('transaction_type_id')
            )
            
            cursor.execute(transaction_query, values)
            
            # Insere tickets (itens)
            if transaction_data.get('items'):
                self._load_tickets(cursor, transaction_id, transaction_data['items'])
            
            self.connection.commit()
            logger.info(f"Transação {transaction_id} carregada com sucesso")
            return transaction_id
            
        except Error as e:
            self.connection.rollback()
            logger.error(f"Erro ao carregar transação: {e}")
            raise
        finally:
            cursor.close()
    
    def _load_tickets(self, cursor, transaction_id: str, items: List[dict]):
        """Carrega tickets (itens) da transação"""
        ticket_query = """
            INSERT INTO ticket (
                id, cod_product, name_product, quantity, measure,
                price, total_value, transaction_id, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, NOW()
            )
        """
        
        for item in items:
            import uuid
            ticket_id = str(uuid.uuid4())[:16]
            values = (
                ticket_id,
                item.get('cod_product'),
                item.get('name_product'),
                item.get('quantity'),
                item.get('measure'),
                item.get('price'),
                item.get('total_value'),
                transaction_id
            )
            cursor.execute(ticket_query, values)
    
    def check_duplicate(self, url_nfe: str) -> bool:
        """Verifica se NFe já foi processada"""
        cursor = self.connection.cursor()
        try:
            query = "SELECT COUNT(*) FROM transaction WHERE url_nfe = %s"
            cursor.execute(query, (url_nfe,))
            count = cursor.fetchone()[0]
            return count > 0
        finally:
            cursor.close()

# Uso
if __name__ == "__main__":
    db_config = {
        'host': 'localhost',
        'database': 'fintrack',
        'user': 'root',
        'password': 'password'
    }
    
    loader = DataLoader(db_config)
    loader.connect()
    
    # Carrega transação
    transaction_data = {
        'transaction_id': 'abc123',
        'store_name': 'Loja Exemplo',
        # ... outros campos
    }
    
    try:
        transaction_id = loader.load_transaction(transaction_data, user_id='user123')
        print(f"Transação {transaction_id} carregada!")
    finally:
        loader.disconnect()
```

### 1.4. Orquestrador Básico

```python
# scripts/orchestrator.py
import schedule
import time
import logging
from extract.nfe_scraper import NFEScraper
from transform.data_cleaner import DataCleaner
from load.data_loader import DataLoader

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PipelineOrchestrator:
    """Orquestra o pipeline ETL"""
    
    def __init__(self, db_config: dict):
        self.scraper = NFEScraper()
        self.cleaner = DataCleaner()
        self.loader = DataLoader(db_config)
        self.loader.connect()
    
    def run_pipeline(self, nfe_urls: list, user_id: str):
        """Executa pipeline completo para lista de URLs"""
        logger.info(f"Iniciando pipeline para {len(nfe_urls)} NFes")
        
        success_count = 0
        error_count = 0
        
        for url in nfe_urls:
            try:
                # Extract
                logger.info(f"Extraindo dados de {url}")
                raw_data = self.scraper.scrape_nfe(url)
                self.scraper.save_raw_data(raw_data)
                
                # Verifica duplicata
                if self.loader.check_duplicate(url):
                    logger.warning(f"NFe já processada: {url}")
                    continue
                
                # Transform
                logger.info("Limpando dados")
                cleaned_data = self.cleaner.clean_transaction(raw_data)
                
                # Validação
                if self.cleaner.validation_errors:
                    logger.error(f"Erros de validação: {self.cleaner.validation_errors}")
                    error_count += 1
                    continue
                
                # Load
                logger.info("Carregando no banco")
                transaction_id = self.loader.load_transaction(cleaned_data, user_id)
                
                success_count += 1
                logger.info(f"Pipeline concluído para {url}")
                
            except Exception as e:
                error_count += 1
                logger.error(f"Erro no pipeline para {url}: {e}")
        
        logger.info(f"Pipeline finalizado: {success_count} sucessos, {error_count} erros")
        return success_count, error_count
    
    def run_daily(self):
        """Executa pipeline diariamente"""
        # Em produção, isso viria de uma fila ou banco de dados
        nfe_urls = self._get_pending_nfes()
        user_id = "default_user"
        self.run_pipeline(nfe_urls, user_id)
    
    def _get_pending_nfes(self) -> list:
        """Obtém lista de NFes pendentes (mock)"""
        # Em produção, consultaria banco de dados ou fila
        return []

# Agendamento
if __name__ == "__main__":
    db_config = {
        'host': 'localhost',
        'database': 'fintrack',
        'user': 'root',
        'password': 'password'
    }
    
    orchestrator = PipelineOrchestrator(db_config)
    
    # Agenda execução diária às 2h da manhã
    schedule.every().day.at("02:00").do(orchestrator.run_daily)
    
    logger.info("Pipeline agendado. Executando diariamente às 02:00")
    
    while True:
        schedule.run_pending()
        time.sleep(60)
```

---

## 📊 NÍVEL 2: Data Warehouse e Orquestração

### 2.1. DAG do Airflow

```python
# dags/fintrack_etl_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta
import sys
sys.path.append('/opt/airflow/scripts')

from extract.nfe_scraper import NFEScraper
from transform.data_cleaner import DataCleaner
from load.data_loader import DataLoader

default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'fintrack_nfe_etl',
    default_args=default_args,
    description='ETL pipeline para NFes do Fintrack',
    schedule_interval='@daily',
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['fintrack', 'etl', 'nfe']
)

def extract_nfes(**context):
    """Task de extração"""
    scraper = NFEScraper(output_dir='/data/bronze/nfe')
    urls = context['dag_run'].conf.get('nfe_urls', [])
    
    extracted_files = []
    for url in urls:
        data = scraper.scrape_nfe(url)
        filepath = scraper.save_raw_data(data)
        extracted_files.append(filepath)
    
    return extracted_files

def transform_data(**context):
    """Task de transformação"""
    ti = context['ti']
    extracted_files = ti.xcom_pull(task_ids='extract_nfes')
    
    cleaner = DataCleaner()
    cleaned_files = []
    
    for filepath in extracted_files:
        import json
        with open(filepath, 'r') as f:
            raw_data = json.load(f)
        
        cleaned_data = cleaner.clean_transaction(raw_data)
        
        # Salva dados limpos
        cleaned_filepath = filepath.replace('/bronze/', '/silver/')
        import os
        os.makedirs(os.path.dirname(cleaned_filepath), exist_ok=True)
        
        with open(cleaned_filepath, 'w') as f:
            json.dump(cleaned_data, f, indent=2, default=str)
        
        cleaned_files.append(cleaned_filepath)
    
    return cleaned_files

def load_to_warehouse(**context):
    """Task de carga no data warehouse"""
    ti = context['ti']
    cleaned_files = ti.xcom_pull(task_ids='transform_data')
    
    db_config = {
        'host': 'postgres',
        'database': 'fintrack_dw',
        'user': 'airflow',
        'password': 'airflow'
    }
    
    loader = DataLoader(db_config)
    loader.connect()
    
    for filepath in cleaned_files:
        import json
        with open(filepath, 'r') as f:
            cleaned_data = json.load(f)
        
        loader.load_transaction(cleaned_data, user_id='default')
    
    loader.disconnect()

# Tasks
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

load_task = PythonOperator(
    task_id='load_to_warehouse',
    python_callable=load_to_warehouse,
    dag=dag
)

# Dependências
extract_task >> transform_task >> load_task
```

### 2.2. Modelos dbt

```sql
-- models/silver/stg_transactions.sql
{{ config(materialized='view') }}

WITH raw_transactions AS (
    SELECT * FROM {{ source('bronze', 'nfe_raw') }}
)

SELECT
    transaction_id,
    store_name,
    cnpj,
    store_address,
    date_ticket,
    time_ticket,
    payment_method,
    url_nfe,
    total_value,
    user_id,
    account_id,
    category_id,
    subcategory_id,
    transaction_type_id
FROM raw_transactions
WHERE date_ticket IS NOT NULL
  AND total_value > 0
  AND cnpj IS NOT NULL

-- models/gold/fact_transactions.sql
{{ config(materialized='table') }}

SELECT
    t.transaction_id,
    u.user_id,
    s.store_id,
    c.category_id,
    d.date_id,
    tt.transaction_type_id,
    t.total_value AS amount,
    COUNT(ti.ticket_id) AS quantity_items,
    t.payment_method,
    t.url_nfe
FROM {{ ref('stg_transactions') }} t
JOIN {{ ref('dim_users') }} u ON t.user_id = u.user_id
JOIN {{ ref('dim_stores') }} s ON t.cnpj = s.cnpj
JOIN {{ ref('dim_categories') }} c ON t.category_id = c.category_id
JOIN {{ ref('dim_time') }} d ON DATE(t.date_ticket) = d.date
JOIN {{ ref('dim_transaction_types') }} tt ON t.transaction_type_id = tt.transaction_type_id
LEFT JOIN {{ source('bronze', 'tickets') }} ti ON t.transaction_id = ti.transaction_id
GROUP BY 1, 2, 3, 4, 5, 6, 7, 9, 10

-- models/gold/dim_stores.sql
{{ config(materialized='table') }}

SELECT DISTINCT
    cnpj AS store_id,
    store_name,
    store_address,
    -- Geocodificação (se disponível)
    city,
    state,
    country
FROM {{ ref('stg_transactions') }}
WHERE cnpj IS NOT NULL
```

---

## ☁️ NÍVEL 3: Cloud e Streaming

### 3.1. Lambda Function para API

```python
# lambda/api_handler.py
import json
import boto3
import os

kinesis = boto3.client('kinesis')
STREAM_NAME = os.environ['KINESIS_STREAM_NAME']

def lambda_handler(event, context):
    """Lambda que recebe requisições da API e envia para Kinesis"""
    
    try:
        # Extrai dados da requisição
        body = json.loads(event['body'])
        nfe_url = body.get('nfe_url')
        user_id = body.get('user_id')
        
        # Cria mensagem para Kinesis
        message = {
            'nfe_url': nfe_url,
            'user_id': user_id,
            'timestamp': context.aws_request_id,
            'source': 'api'
        }
        
        # Envia para Kinesis
        response = kinesis.put_record(
            StreamName=STREAM_NAME,
            Data=json.dumps(message),
            PartitionKey=user_id
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'NFe enviada para processamento',
                'sequence_number': response['SequenceNumber']
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### 3.2. Spark Streaming

```python
# streaming/nfe_stream_processor.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

spark = SparkSession.builder \
    .appName("FintrackStreaming") \
    .config("spark.sql.adaptive.enabled", "true") \
    .getOrCreate()

# Schema da mensagem
schema = StructType([
    StructField("nfe_url", StringType(), True),
    StructField("user_id", StringType(), True),
    StructField("timestamp", StringType(), True),
    StructField("source", StringType(), True)
])

# Lê do Kinesis
df = spark.readStream \
    .format("kinesis") \
    .option("streamName", "fintrack-nfe-stream") \
    .option("region", "us-east-1") \
    .option("initialPosition", "latest") \
    .load()

# Parse JSON
parsed_df = df.select(
    from_json(col("data").cast("string"), schema).alias("parsed_data")
).select("parsed_data.*")

# Adiciona timestamp de processamento
processed_df = parsed_df \
    .withColumn("processed_at", current_timestamp()) \
    .withColumn("year", year(col("processed_at"))) \
    .withColumn("month", month(col("processed_at"))) \
    .withColumn("day", dayofmonth(col("processed_at")))

# Escreve no S3
query = processed_df.writeStream \
    .format("parquet") \
    .option("path", "s3://fintrack-data-lake/silver/nfe_streaming/") \
    .option("checkpointLocation", "s3://fintrack-checkpoints/streaming/") \
    .partitionBy("year", "month", "day") \
    .trigger(processingTime='1 minute') \
    .outputMode("append") \
    .start()

query.awaitTermination()
```

---

## 🤖 NÍVEL 4: Machine Learning

### 4.1. Modelo de Classificação

```python
# ml/transaction_classifier.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import boto3

class TransactionClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.feature_columns = [
            'store_name_length',
            'total_value',
            'quantity_items',
            'payment_method_encoded',
            'day_of_week',
            'hour',
            'month'
        ]
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepara features para o modelo"""
        features = df.copy()
        
        # Feature engineering
        features['store_name_length'] = features['store_name'].str.len()
        features['payment_method_encoded'] = pd.Categorical(
            features['payment_method']
        ).codes
        features['day_of_week'] = pd.to_datetime(
            features['date_ticket']
        ).dt.dayofweek
        features['hour'] = pd.to_datetime(
            features['time_ticket']
        ).dt.hour
        features['month'] = pd.to_datetime(
            features['date_ticket']
        ).dt.month
        
        return features[self.feature_columns]
    
    def train(self, X_train, y_train):
        """Treina o modelo"""
        self.model.fit(X_train, y_train)
    
    def predict(self, X):
        """Faz predições"""
        return self.model.predict(X)
    
    def save_model(self, filepath: str):
        """Salva modelo"""
        joblib.dump(self.model, filepath)
    
    def load_model(self, filepath: str):
        """Carrega modelo"""
        self.model = joblib.load(filepath)

# Uso
if __name__ == "__main__":
    # Carrega dados
    df = pd.read_sql("""
        SELECT 
            t.*,
            c.name as category_name
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
    """, connection_string)
    
    # Prepara features
    classifier = TransactionClassifier()
    X = classifier.prepare_features(df)
    y = df['category_id']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Treina
    classifier.train(X_train, y_train)
    
    # Avalia
    predictions = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Accuracy: {accuracy}")
    print(classification_report(y_test, predictions))
    
    # Salva modelo
    classifier.save_model('models/transaction_classifier.pkl')
```

---

Estes exemplos fornecem uma base sólida para começar a implementar cada nível do roadmap usando o Fintrack como projeto prático! 🚀

