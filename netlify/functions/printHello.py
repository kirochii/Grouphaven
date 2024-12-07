import json
from supabase import create_client, Client

# Initialize the Supabase client (replace with your Supabase URL and API key)
url = "https://lrryxyalvumuuvefxhrg.supabase.co"  # Replace with your Supabase URL
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c"  # Replace with your Supabase API key
supabase: Client = create_client(url, key)

def handler(event, context):
    try:
        # Update the name where id = 1 in the "test" table
        response = supabase.table('test').update({"name": "Testing123"}).eq('id', 1).execute()

        if response.status_code == 200:
            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Record updated successfully"})
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Failed to update record", "error": response.json()})
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "An error occurred", "error": str(e)})
        }
