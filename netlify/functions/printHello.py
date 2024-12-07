import json

def handler(event, context):
    # This function returns a simple "Hello World" message
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Hello World!"}),
    }
