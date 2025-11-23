import json
import boto3
import os
from decimal import Decimal
from shared.config import config
from shared.models import SubmissionStatus, TaskStatus

dynamodb = boto3.resource('dynamodb', region_name=config.AWS_REGION)

def handler(event, context):
    """
    Handler for executing QC logic.
    Triggered by DynamoDB Stream on Submissions table (INSERT) or invoked directly.
    """
    print("Received event:", json.dumps(event))

    # Handle DynamoDB Stream event
    if 'Records' in event:
        for record in event['Records']:
            if record['eventName'] == 'INSERT':
                process_stream_record(record)
        return {"message": "Stream processed"}

    # Handle direct invocation (for testing)
    return {"message": "Direct invocation not fully supported yet"}

def process_stream_record(record):
    new_image = record['dynamodb']['NewImage']

    submission_id = new_image['submissionId']['S']
    task_id = new_image['taskId']['S']
    worker_answer = new_image['answer']['S']

    # Clean up answer (remove quotes if it was JSON dumped string)
    try:
        parsed_answer = json.loads(worker_answer)
        # If simple string, use it, otherwise keep struct
        if isinstance(parsed_answer, str):
            worker_answer = parsed_answer
    except:
        pass # Keep original string

    evaluate_submission(submission_id, task_id, worker_answer)

def evaluate_submission(submission_id, task_id, worker_answer):
    tasks_table = dynamodb.Table(config.TASKS_TABLE)
    submissions_table = dynamodb.Table(config.SUBMISSIONS_TABLE)

    # 1. Fetch Task to check if it's Gold Standard
    task_resp = tasks_table.get_item(Key={'taskId': task_id})
    task = task_resp.get('Item')

    if not task:
        print(f"Task {task_id} not found")
        return

    # 2. Gold Standard Check
    if task.get('isGold'):
        gold_answer = task.get('goldAnswer')
        print(f"Evaluating Gold Task. Worker: {worker_answer} vs Gold: {gold_answer}")

        # Simple string comparison for MVP (can be enhanced for fuzzy match)
        is_correct = str(worker_answer).strip().lower() == str(gold_answer).strip().lower()

        new_status = SubmissionStatus.APPROVED if is_correct else SubmissionStatus.REJECTED
        reason = "Gold Standard Validation"

        # Update Submission Status
        submissions_table.update_item(
            Key={'submissionId': submission_id},
            UpdateExpression="SET #status = :s, qcReason = :r",
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':s': new_status,
                ':r': reason
            }
        )

        # TODO: Update Worker Score here
        print(f"Submission {submission_id} marked as {new_status}")

    else:
        # 3. Majority Voting / ML Placeholder
        # For now, if it's not gold, we leave it as PENDING for manual review
        # or implement a simple auto-approve rule for demo purposes.
        print(f"Task {task_id} is not gold. Leaving for consensus or manual review.")
