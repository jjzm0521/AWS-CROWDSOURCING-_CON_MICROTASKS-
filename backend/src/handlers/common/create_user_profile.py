import json
import boto3
import datetime
from shared.config import config
from shared.logging import logger, log_event

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    log_event(event)

    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON'})}

    user_id = body.get('userId')
    role = body.get('role') # 'Requester' or 'Worker'
    name = body.get('name', 'Anonymous')
    email = body.get('email')

    if not user_id or not role:
        return {'statusCode': 400, 'body': json.dumps({'error': 'userId and role are required'})}

    if role not in ['Requester', 'Worker']:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid role'})}

    table_name = config.REQUESTERS_TABLE if role == 'Requester' else config.WORKERS_TABLE
    table = dynamodb.Table(table_name)

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    item = {
        'requesterId' if role == 'Requester' else 'workerId': user_id,
        'name': name,
        'email': email,
        'lastLogin': timestamp,
        'updatedAt': timestamp
    }

    # We might want to keep existing fields if updating
    # For now, simplistic PutItem (upsert)

    try:
        table.put_item(Item=item)

        return {
            'statusCode': 200,
             'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Profile updated', 'userId': user_id, 'role': role})
        }
    except Exception as e:
        logger.error(f"Error creating user profile: {e}")
        return {
            'statusCode': 500,
             'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'error': str(e)})
        }
