from typing import TypedDict, Optional, Any, List

class Task(TypedDict):
    taskId: str
    requesterId: str
    status: str  # Created, Published, Completed
    type: str
    payload: Any
    goldAnswer: Optional[Any]
    isGold: bool
    createdAt: str
    batchId: Optional[str]

class Submission(TypedDict):
    submissionId: str
    taskId: str
    workerId: str
    assignmentId: str
    status: str # Pending, Approved, Rejected
    answer: Any
    createdAt: str

class Assignment(TypedDict):
    assignmentId: str
    taskId: str
    workerId: str
    expiresAt: int
    status: str # Assigned, Submitted, Expired

class TaskStatus:
    CREATED = "Created"
    PUBLISHED = "Published"
    COMPLETED = "Completed"

class SubmissionStatus:
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
