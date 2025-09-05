import requests
from decouple import config

MAILTRAP_API_URL = "https://sandbox.api.mailtrap.io/api/send/4011941"


def send_mailtrap_mail(to_email, user_name, link, template_id):
    headers = {
        'Authorization' : f"Bearer {config('MAILTRAP_API_KEY')}",
        'Content-Type' : 'application/json'
    }

    payload = {
        "from" : {
            "email": config('DEFAULT_FROM_EMAIL'),
            "name": "LevelUpCode"
        },
        
        "to": [
            {
                "email": to_email,
                "name": user_name
            }
        ],
        "template_uuid": template_id,
        "template_variables": {
            "user_name": user_name,
            "link": link
        }
    }

    response = requests.post(
        MAILTRAP_API_URL,
        headers=headers,
        json=payload
    )

    # return response object for debugging
    return response