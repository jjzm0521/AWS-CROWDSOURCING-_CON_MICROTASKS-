import json
import uuid
import boto3
from shared.config import config
from shared.logging import logger, log_event

s3_client = boto3.client('s3')

def handler(event, context):
    log_event(event)

    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON'})}

    file_name = body.get('fileName')
    file_type = body.get('fileType')

    if not file_name or not file_type:
        return {'statusCode': 400, 'body': json.dumps({'error': 'fileName and fileType are required'})}

    # Generate unique key
    key = f"assets/{uuid.uuid4()}-{file_name}"

    try:
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': config.TASK_ASSETS_BUCKET,
                'Key': key,
                'ContentType': file_type
            },
            ExpiresIn=3600
        )

        # Construct public URL (CloudFront or S3 directly if public)
        # Note: In StorageStack we set up CloudFront. Ideally we return the CloudFront URL for reading
        # but the client needs the S3 URL for uploading (which is the presigned one).
        # We also want to return the final "public" URL that the task payload should use.
        # However, backend doesn't know CloudFront domain easily unless we pass it.
        # For now, let's construct the S3 URL or just return the key and let frontend decide/prefix.
        # Actually, let's just return the key, and the frontend or backend task creation can prefix it.
        # Or even better, if we have the Bucket Name, we can construct the Virtual Host URL if direct access is allowed
        # But we want CloudFront.
        # Let's assume the frontend knows the base URL or we assume the backend configures it.
        # For MVP, let's return the key.

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({
                'uploadUrl': presigned_url,
                'key': key,
                # 'publicUrl': f"https://{config.CLOUDFRONT_DOMAIN}/{key}" # If we had it
            })
        }

    except Exception as e:
        logger.error(f"Error generating upload URL: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'error': str(e)})
        }
