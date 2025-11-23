import logging
import os
import json

def get_logger():
    logger = logging.getLogger()
    if len(logger.handlers) > 0:
        # The Lambda environment pre-configures a handler logging to stderr. If a handler is already configured,
        # `.basicConfig` does not execute. Thus we set the level directly.
        logger.setLevel(logging.INFO)
    else:
        logging.basicConfig(level=logging.INFO)
    return logger

logger = get_logger()

def log_event(event):
    logger.info(json.dumps(event))
