import time
import requests
from decouple import config 


JUDGE0_URL = config('JUDGE0_URL')
HEADERS = {"content-type": "application/json"}
TIMEOUT = 120  # seconds
RETRY_INTERVAL = 3  # seconds


"""
    In sumbit_batch function, we send a POST request to the Judge0 API with a list of submissions.
    Each submission contains the refrence code, language ID, and optional input.
    api returns a list of tokens, one for each submission.
    We extract these tokens and return them for later polling.
"""

def submit_batch(submissions):
    url = f"{JUDGE0_URL}/submissions/batch?base64_encoded=false"
    
    try:
        response = requests.post(url, json={"submissions": submissions}, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to submit batch: {e}")

    data = response.json()
    
    tokens = [item["token"] for item in data if "token" in item]
    
    if not tokens:
        raise ValueError("No tokens received from Judge0")

    return tokens


""" 
    In poll_batch_results function, we continuously poll the Judge0 API for the results of the submissions using their tokens.
    We check if all submissions are complete (status ID not in [1, 2]) and return the results.
    If the polling exceeds the TIMEOUT, we raise a TimeoutError.
"""

def poll_batch_results(tokens):
    url = f"{config('JUDGE0_URL')}/submissions/batch?tokens={','.join(tokens)}&base64_encoded=false"
    
    start_time = time.time()

    while True:
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            print(f"Error fetching results: {e}")
            time.sleep(RETRY_INTERVAL)
            continue
        
        
        submissions = data.get('submissions', [])
        if not submissions:
            print("No submissions found, retrying...")
            time.sleep(RETRY_INTERVAL)
            continue
        

        if all(sub['status']['id']not in [1,2] for sub in submissions):
            # print("all_done :", submissions)
            return submissions


        if time.time() - start_time > TIMEOUT:
            raise TimeoutError("Judge0 batch polling timed out")  
        
        time.sleep(1)
            
