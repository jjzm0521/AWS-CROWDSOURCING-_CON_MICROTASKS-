import boto3
from botocore.exceptions import ClientError
from typing import Any, Dict, List
import logging
from .config import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sqs = boto3.resource('sqs', region_name=config.AWS_REGION)

def get_queue(queue_url: str):
    # Extract queue name or just use url if resource allows?
    # boto3 resource Queue(...) takes url
    return sqs.Queue(queue_url)

def send_message(queue_url: str, message_body: str, message_attributes: Dict[str, Any] = None) -> bool:
    try:
        queue = get_queue(queue_url)
        kwargs = {'MessageBody': message_body}
        if message_attributes:
            kwargs['MessageAttributes'] = message_attributes
        queue.send_message(**kwargs)
        return True
    except ClientError as e:
        logger.error(f"Error sending message to {queue_url}: {e}")
        return False

def send_message_batch(queue_url: str, entries: List[Dict[str, Any]]) -> bool:
    try:
        queue = get_queue(queue_url)
        # SQS batch limit is 10.
        chunk_size = 10
        for i in range(0, len(entries), chunk_size):
            chunk = entries[i:i + chunk_size]
            queue.send_messages(Entries=chunk)
        return True
    except ClientError as e:
        logger.error(f"Error sending batch to {queue_url}: {e}")
        return False
