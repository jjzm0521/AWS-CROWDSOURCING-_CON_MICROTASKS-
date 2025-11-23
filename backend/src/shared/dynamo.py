import boto3
from botocore.exceptions import ClientError
from typing import Any, Dict, List, Optional
import logging

from .config import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb', region_name=config.AWS_REGION)

def get_table(table_name: str):
    return dynamodb.Table(table_name)

def put_item(table_name: str, item: Dict[str, Any]) -> bool:
    table = get_table(table_name)
    try:
        table.put_item(Item=item)
        return True
    except ClientError as e:
        logger.error(f"Error putting item to {table_name}: {e}")
        return False

def get_item(table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    table = get_table(table_name)
    try:
        response = table.get_item(Key=key)
        return response.get('Item')
    except ClientError as e:
        logger.error(f"Error getting item from {table_name}: {e}")
        return None

def query(table_name: str, **kwargs) -> List[Dict[str, Any]]:
    table = get_table(table_name)
    try:
        response = table.query(**kwargs)
        return response.get('Items', [])
    except ClientError as e:
        logger.error(f"Error querying {table_name}: {e}")
        return []

def batch_write_items(table_name: str, items: List[Dict[str, Any]]) -> bool:
    table = get_table(table_name)
    try:
        with table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
        return True
    except ClientError as e:
        logger.error(f"Error batch writing to {table_name}: {e}")
        return False
