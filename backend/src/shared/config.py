import os

class Config:
    TASKS_TABLE = os.environ.get('TASKS_TABLE')
    SUBMISSIONS_TABLE = os.environ.get('SUBMISSIONS_TABLE')
    ASSIGNMENTS_TABLE = os.environ.get('ASSIGNMENTS_TABLE')
    WALLETS_TABLE = os.environ.get('WALLETS_TABLE')
    WORKERS_TABLE = os.environ.get('WORKERS_TABLE')
    DISPUTES_TABLE = os.environ.get('DISPUTES_TABLE')
    TRANSACTIONS_TABLE = os.environ.get('TRANSACTIONS_TABLE')

    AVAILABLE_TASKS_QUEUE_URL = os.environ.get('AVAILABLE_TASKS_QUEUE_URL')

    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

config = Config()
