import praw
from datetime import datetime
from dateutil import tz


def auth_dict():
    with open('auth.txt', 'r') as file:
        password = file.readline().strip('\n')
        secret = file.readline().strip('\n')
        access_token = file.readline()
        file.close()

    return {'password': password, 'secret': secret, 'access_token': access_token}


if __name__ == '__main__':
    auth = auth_dict()
    client_id = "3nAxLGZKdvzg6Q64cCakoQ"

    reddit_instance = praw.Reddit(
        client_id=client_id,
        client_secret=auth['secret'],
        password=auth['password'],
        access_token=auth['access_token'],
        user_agent='testscript by u/zevsky_',
        username='zevsky_'
    )

    subreddit = reddit_instance.subreddit('changemyview')
    print(reddit_instance.submission(id='12zz5og').url)

    created_time_utc = reddit_instance.submission(id='6s6c1z').comments[0].created_utc
    print(created_time_utc)



