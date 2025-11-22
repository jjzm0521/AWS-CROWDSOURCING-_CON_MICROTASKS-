# Instructions for Agents

This repository contains the code for Project 29: Crowdsourcing Platform.

## Architecture
- **Infrastructure**: AWS CDK (TypeScript). All infrastructure code resides in `infrastructure/`.
- **Backend**: AWS Lambda (Python). All backend logic resides in `backend/`.
- **Frontend**: React (TypeScript). Resides in `frontend/`.

## Conventions

### Infrastructure (CDK)
- Use standard AWS CDK constructs (L2 where possible).
- Define stacks in `infrastructure/lib/`.
- Group resources logically (e.g., `DatabaseStack`, `AuthStack`, `ApiStack`).

### Backend (Python)
- Use `boto3` for AWS SDK.
- Organize handlers by feature in `backend/src/handlers/`.
- Use `backend/src/shared/` for common utilities (e.g., DB access patterns, response formatting).
- Ensure all Lambda functions have proper error handling and logging.

### General
- Update `README.md` if the architecture changes significantly.
- Prefer small, atomic commits/changes.
- Always verify changes by checking file contents.
