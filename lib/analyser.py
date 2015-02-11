#!/usr/bin/env python
# -*- coding: utf-8 -*-

from datetime import datetime, date, timedelta
import re
import string
import os
from collections import OrderedDict
import string
import unicodedata


class Message:

    def __init__(self, sender, msg_date, content):
        self.sender = sender
        self.timestamp = msg_date
        self.content = content


    def __repr__(self):
        return self.content


    def get_number_words(self):
        words = self.content.split()
        return len(words) - (2 + len(self.sender.split()))


    def get_content(self):
        return self.content.split()[2 + len(self.sender.split()):]


    def get_date_str(self):
        return self.timestamp.strftime("%d/%m/%y")


def superficial_analysis(messages):
    messages_separated = {}
    days = {
        'overview': { 'num_days': 0, 'days': {} },
        'users': {}
    }

    for msg in messages:
        match = re.search(r'(?P<date>\d{2}/\d{2}/\d{2}), (?P<time>\d{2}:\d{2}:\d{2}): (?P<name>[^:]*):', msg)

        if match:
            name = match.group('name')
            msg_date = match.group('date')
            msg_time = match.group('time')
            msg_datetime = "{} {}".format(msg_date, msg_time)
            msg_timestamp = datetime.strptime(msg_datetime, "%d/%m/%y %H:%M:%S")

            msg_o = Message(name, msg_timestamp, msg)

            # add the day as key and increment the number of messages of that day
            key = msg_timestamp.isoformat()[:10]
            if days['overview']['days'].has_key(key):
                days['overview']['days'][key]['size'] += 1
                days['overview']['days'][key]['users'][name] = days['overview']['days'][key]['users'].get(name, 0) + 1
            else:
                days['overview']['days'][key] = {'size': 1, 'users': { name: 1 } }

            # days['overview']['days'][msg_timestamp.isoformat()[:10]] = days['overview']['days'].get(msg_timestamp.isoformat()[:10], 0) + 1

            # add message to the user
            if messages_separated.has_key(name):
                user_messages = messages_separated.get(name)
                user_messages.append(msg_o)
                messages_separated[name] = user_messages
            else:
                messages_separated[name] = [msg_o]

            # add date of message to user history
            if days['users'].has_key(name):
                user_days = days['users'].get(name)
                user_days.append(msg_timestamp.isoformat())
                days['users'][name] = user_days
            else:
                days['users'][name] = [msg_timestamp.isoformat()]

    days['overview']['num_days'] = len(days['overview']['days'].keys())
    
    days_a = []
    for date in days['overview']['days'].keys():
        user_messages = {}
        for user in days['overview']['days'][date]['users'].keys():
            user_messages[user] = days['overview']['days'][date]['users'][user]

        days_a.append({'date': date, 'num_messages': days['overview']['days'][date]['size'], 'mbu': user_messages })   # mbu = message by user

    days_a = sorted(days_a, key=lambda date: date['date'])

    days['overview']['days'] = days_a

    return { 'messages': messages_separated, 'days': days }


def get_word_hist(messages):
    word_hist = {}
    smile_hist = {}

    common_words = [
        'que', 'that', 'o', 'the', 'não', 'no', 'not', 'nao', 'de', 'of',
        'é', 'e', 'is', 'it', 'eu', 'tu', 'ele', 'ela', 'nós', 'nos', 'eles',
        'elas', 'me', 'you', 'her', 'him', 'we', 'them', 'and', 'i', 'um', 'a',
        'se', 'if', 'para', 'to', 'está', 'uma', 'me', 'me', 'com', 'with',
        'por', 'by', 'he', 'em', 'in', 'isso', 'that', 'do', 'of', 'como', 'as',
        'mas', 'but', 'bem', 'well', 'os', 'the', 'da', 'sim', 'yes', 'aqui', 'here',
        'no', 'on', 'mais', 'more', 'na', 'in', 'tem', 'has', 'meu', 'mine', 'muito',
        'much', 'very', 'she', 'as', 'seu', 'vamos', 'come', 'vai', 'go', 'sua', 'its',
        'estou', 'am', 'foi', 'was', 'tudo', 'everything', 'minha', 'ta', 'te', 'pk', 'vou', 'já'
    ]
    smiles = [
        ':-)', ':)', ':D', ':o)', ':]', ':3', ':c)', ':>', '=]', '8)', '=)', ':}', ':^)',
        ':-D', '8-D', '8D', 'x-D', 'xD', 'X-D', 'XD', '=-D', '=D', '=-3', '=3', 'B^D',
        '>:[', ':-(', ':(', ':-c', ':c', ':-<', ':<', ':-[', ':[', ':{',
        ';-)', ';)', '*-)', '*)', ';-]', ';]', ';D', ';^)', ':-,',
        '>:P', ':-P', ':P', 'X-P', 'x-p', 'xp', 'XP', ':-p', ':p', '=p',
        '>:\\', '>:/', ':-/', ':-.', ':/', ':\\', '=/', '=\\', ':L', '=L', ':S', '>.<',
        ':|', ':-|', '=|', ':$', '=$'
    ]
    ignore = ['image', 'omitted']

    for user in messages.keys():
        for msg in messages[user]:
            words = msg.get_content()

            for word in words:
                if word in smiles:
                    smile_hist[word] = smile_hist.get(word, 0) + 1
                    words.remove(word)

            words = map(string.lower, words)

            for word in words:
                word = word.translate(string.maketrans("",""), string.punctuation.replace("-", ""))

                if not word in common_words and not word in ignore and word != "":
                    word_hist[word] = word_hist.get(word, 0) + 1

    word_res = []
    for key in word_hist.keys():
        word_res.append({'text': key, 'size': word_hist[key]})

    smile_res = []
    for key in smile_hist.keys():
        smile_res.append({'text': key, 'size': smile_hist[key]})

    return {'words': word_res, 'smiles': smile_res}



def get_lines(text):
    return [line.strip() for line in text.split('\r\n')]


def parse_text(text):
    return [line for line in text if re.search(r'\d{2}/\d{2}/\d{2}, \d{2}:\d{2}:\d{2}', line)]


def process_messages(messages):
    history = OrderedDict()

    for msg in messages:
        msg_date = msg.get_date_str()

        if history.has_key(msg_date):
            day_messages = history.get(msg_date)
            day_messages.append(msg)
            history[msg_date] = day_messages
        else:
            history[msg_date] = [msg]

    return history


def lexical_diversity(text):
    return len(text) / float(len(set(text)))


def avg_word_length(text):
    return sum([len(word) for word in text]) / float(len(text))


def percentage(count, total):
    return 100 * count / float(total)


if __name__ == "__main__":
    main()