import requests
from requests.auth import HTTPBasicAuth


def oauth_setup_headers():
    with open('auth.txt', 'r') as file:
        password = file.readline().strip('\n')
        secret = file.readline()
        file.close()

    client_id = "3nAxLGZKdvzg6Q64cCakoQ"

    auth = HTTPBasicAuth(client_id, secret)

    login_data = {
        'grant_type': 'password',
        'username': 'zevsky_',
        'password': password
    }

    headers = {'User-Agent': 'Thesis-API/0.0.1'}

    access_token_request = requests.post('https://www.reddit.com/api/v1/access_token',
                                         auth=auth, data=login_data, headers=headers)
    token = access_token_request.json()['access_token']
    print(token)

    with open('auth.txt', 'a') as file:
        file.write('\n' + token + '\n')
        file.close()

    headers['Authorization'] = f'bearer {token}'

    return headers


if __name__ == '__main__':
    headers = oauth_setup_headers()
    comment = requests.get('https://oauth.reddit.com/api/info?id=t3_6s6c1z', headers=headers)

    print(comment.json())



