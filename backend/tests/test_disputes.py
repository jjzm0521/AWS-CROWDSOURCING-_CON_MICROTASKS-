import boto3
import json
import pytest
from unittest.mock import MagicMock
from shared.models import SubmissionStatus
from handlers.disputes import start_dispute, resolve_dispute

SUBMISSIONS_TABLE = "Submissions"
DISPUTES_TABLE = "Disputes"

@pytest.fixture
def setup_tables(mock_aws_fixture):
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")

    # Create Submissions Table
    dynamodb.create_table(
        TableName=SUBMISSIONS_TABLE,
        KeySchema=[{'AttributeName': 'submissionId', 'KeyType': 'HASH'}],
        AttributeDefinitions=[{'AttributeName': 'submissionId', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )

    # Create Disputes Table
    dynamodb.create_table(
        TableName=DISPUTES_TABLE,
        KeySchema=[{'AttributeName': 'disputeId', 'KeyType': 'HASH'}],
        AttributeDefinitions=[{'AttributeName': 'disputeId', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )

    return dynamodb

def test_start_dispute_success(setup_tables, monkeypatch):
    monkeypatch.setattr(start_dispute.config, "SUBMISSIONS_TABLE", SUBMISSIONS_TABLE)
    monkeypatch.setattr(start_dispute.config, "DISPUTES_TABLE", DISPUTES_TABLE)
    monkeypatch.setattr(start_dispute, "dynamodb", setup_tables)

    dynamodb = setup_tables
    # Mock transact_write_items to avoid moto TypeError
    dynamodb.meta.client.transact_write_items = MagicMock()

    submissions_table = dynamodb.Table(SUBMISSIONS_TABLE)

    # Create a rejected submission
    submission_id = "sub-123"
    worker_id = "worker-123"
    submissions_table.put_item(Item={
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": SubmissionStatus.REJECTED
    })

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": worker_id
                }
            }
        },
        "body": json.dumps({
            "submissionId": submission_id,
            "reason": "I did the work correctly!"
        })
    }

    response = start_dispute.handler(event, None)

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert "disputeId" in body

    # Verify TransactWriteItems called
    dynamodb.meta.client.transact_write_items.assert_called_once()
    call_args = dynamodb.meta.client.transact_write_items.call_args[1]['TransactItems']
    assert len(call_args) == 2
    assert 'Put' in call_args[0]
    assert 'Update' in call_args[1]

def test_start_dispute_not_rejected(setup_tables, monkeypatch):
    monkeypatch.setattr(start_dispute.config, "SUBMISSIONS_TABLE", SUBMISSIONS_TABLE)
    monkeypatch.setattr(start_dispute.config, "DISPUTES_TABLE", DISPUTES_TABLE)
    monkeypatch.setattr(start_dispute, "dynamodb", setup_tables)

    dynamodb = setup_tables
    submissions_table = dynamodb.Table(SUBMISSIONS_TABLE)

    # Create an approved submission
    submission_id = "sub-123"
    worker_id = "worker-123"
    submissions_table.put_item(Item={
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": SubmissionStatus.APPROVED
    })

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": worker_id
                }
            }
        },
        "body": json.dumps({
            "submissionId": submission_id,
            "reason": "Complaint"
        })
    }

    response = start_dispute.handler(event, None)
    assert response["statusCode"] == 400
    assert "Can only dispute rejected submissions" in response["body"]

def test_resolve_dispute_approve(setup_tables, monkeypatch):
    monkeypatch.setattr(resolve_dispute.config, "SUBMISSIONS_TABLE", SUBMISSIONS_TABLE)
    monkeypatch.setattr(resolve_dispute.config, "DISPUTES_TABLE", DISPUTES_TABLE)
    monkeypatch.setattr(resolve_dispute, "dynamodb", setup_tables)

    dynamodb = setup_tables
    # Mock transact_write_items
    dynamodb.meta.client.transact_write_items = MagicMock()

    submissions_table = dynamodb.Table(SUBMISSIONS_TABLE)
    disputes_table = dynamodb.Table(DISPUTES_TABLE)

    submission_id = "sub-123"
    dispute_id = "disp-123"
    worker_id = "worker-123"

    submissions_table.put_item(Item={
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": SubmissionStatus.DISPUTED
    })

    disputes_table.put_item(Item={
        "disputeId": dispute_id,
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": "Open",
        "reason": "Pls fix"
    })

    event = {
        "pathParameters": {
            "disputeId": dispute_id
        },
        "body": json.dumps({
            "resolution": "Approve",
            "adminNote": "Fair point."
        })
    }

    response = resolve_dispute.handler(event, None)

    assert response["statusCode"] == 200
    dynamodb.meta.client.transact_write_items.assert_called_once()

def test_resolve_dispute_reject(setup_tables, monkeypatch):
    monkeypatch.setattr(resolve_dispute.config, "SUBMISSIONS_TABLE", SUBMISSIONS_TABLE)
    monkeypatch.setattr(resolve_dispute.config, "DISPUTES_TABLE", DISPUTES_TABLE)
    monkeypatch.setattr(resolve_dispute, "dynamodb", setup_tables)

    dynamodb = setup_tables
    # Mock transact_write_items
    dynamodb.meta.client.transact_write_items = MagicMock()

    submissions_table = dynamodb.Table(SUBMISSIONS_TABLE)
    disputes_table = dynamodb.Table(DISPUTES_TABLE)

    submission_id = "sub-123"
    dispute_id = "disp-123"
    worker_id = "worker-123"

    submissions_table.put_item(Item={
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": SubmissionStatus.DISPUTED
    })

    disputes_table.put_item(Item={
        "disputeId": dispute_id,
        "submissionId": submission_id,
        "workerId": worker_id,
        "status": "Open",
        "reason": "Pls fix"
    })

    event = {
        "pathParameters": {
            "disputeId": dispute_id
        },
        "body": json.dumps({
            "resolution": "Reject",
            "adminNote": "Nah."
        })
    }

    response = resolve_dispute.handler(event, None)

    assert response["statusCode"] == 200
    dynamodb.meta.client.transact_write_items.assert_called_once()
