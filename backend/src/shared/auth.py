from typing import Dict, Any, Optional

def get_user_sub(event: Dict[str, Any]) -> Optional[str]:
    try:
        # For Cognito Authorizer
        return event['requestContext']['authorizer']['claims']['sub']
    except (KeyError, TypeError):
        return None

def get_user_role(event: Dict[str, Any]) -> Optional[str]:
    # Depends on how custom attributes are set in Cognito
    try:
        return event['requestContext']['authorizer']['claims'].get('custom:role')
    except (KeyError, TypeError):
        return None
