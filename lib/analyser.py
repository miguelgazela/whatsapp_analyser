#!/usr/bin/env python
# -*- coding: utf-8 -*-

from datetime import datetime, date, timedelta
import re
import string
import os
from collections import OrderedDict
import string
import unicodedata

# import matplotlib.pyplot as plt
# import matplotlib.cbook as cbook
# import matplotlib.ticker as ticker
# import matplotlib.mlab as mlab
# import numpy as np
# from nltk import FreqDist, bigrams
# import networkx as nx

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
        'estou', 'am', 'foi', 'was', 'tudo', 'everything', 'minha',
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

# def get_messages_from_file(filename):
#     with open(filename) as fin:
#         return [line.strip() for line in fin]

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


def save_day(name, date, messages):
    if not os.path.exists(os.path.join(os.getcwd(), "Messages of {}".format(name))):
        os.mkdir(os.path.join(os.getcwd(), "Messages of {}".format(name)))

    day = datetime.strptime(date, '%d/%m/%y').date()
    filename = "{}.txt".format(day.strftime("%d %B %Y (%A)"))

    with open("Messages of {}/".format(name)+filename, 'w') as fout:
        for message in messages:
            fout.write("{}\n".format(message))


def lexical_diversity(text):
    return len(text) / float(len(set(text)))


def avg_word_length(text):
    return sum([len(word) for word in text]) / float(len(text))


def percentage(count, total):
    return 100 * count / float(total)


def plot_graph(fig_num, data_x, data_y, label, label_y, name, path, fig_size_x=24, fig_size_y=8):
    plt.figure(fig_num, figsize=(fig_size_x, fig_size_y))
    plt.plot(data_x, data_y, '^:', label=unicode(label, 'utf-8'))
    plt.ylabel(label_y)
    plt.grid(True)
    plt.legend()
    plt.savefig(os.path.join(path, name))


def main():

    print "Loading messages from file"
    result = {}

    for entry in os.listdir('.'):
        if entry.endswith('.txt') and not entry.startswith("requirements"):
            messages = get_messages_from_file(entry)

    # messages = parse_text(text)
    result['messages'] = messages

    print "Separating users messages"
    messages_by_user = get_messages_by_user(messages)

    # for each user, process messages
    result['users'] = []

    for name in messages_by_user.keys():
        print "Processing messages from {}".format(name)

        user_payload = {}
        user_payload['name'] = name
        history = process_messages(messages_by_user[name])
        user_payload['history'] = history

        # word_freq_distribution = {}
        all_words = []
        workbook_data = []
        graph_dates = []
        graph_number_messages = []
        graph_lexical_diversity = []
        graph_number_words = []
        graph_avg_words = []
        graph_avg_word_length = []
        graph_times_hist = {}

        # word_graph = nx.Graph()

        # for every day of messages

        for date in history.keys():

            number_msgs = len(history[date])
            total_words = 0
            all_daily_words = []

            # save daily messages in separate files
            save_day(name, date, history[date])
            messages_day = datetime.strptime(date, "%d/%m/%y")

            last_message_time = None
            max_time_between = timedelta()
            total_time = timedelta()

            for message in history[date]:
                words = message.get_content()
                all_daily_words.extend(map(string.lower, words))

                # word_graph.add_nodes_from(map(string.lower, words))

                # make hourly distribution
                hour = message.timestamp.hour
                hour += round(message.timestamp.minute / 60.0, 1)
                graph_times_hist[hour] = graph_times_hist.get(hour, 0) + 1

                # calculate times between messages (not working)
                # if last_message_time:
                #     diff = msg_time - last_message_time
                #     total_time += diff

                #     if diff.seconds < 18000 and diff > max_time_between:
                #         max_time_between = diff

                # last_message_time = msg_time

                # build word histogram
                # for word in words:
                #     word = string.lower(word)
                #     word_freq_distribution[word] = word_freq_distribution.get(word, 0) + 1

                total_words += message.get_number_words()

            if number_msgs > 3:
                graph_dates.append(messages_day)
                graph_number_messages.append(number_msgs)
                graph_number_words.append(total_words)
                graph_avg_words.append(total_words / float(number_msgs))
                graph_avg_word_length.append(sum([len(word) for word in words]) / float(len(words)))
                graph_lexical_diversity.append(lexical_diversity(all_daily_words))

            # print "Biggest interval between messages: {}".format(max_time_between)
            # if number_msgs > 1:
            #     print "Average interval between messages: {}".format(total_time / (number_msgs - 1))

            all_words.extend(all_daily_words)

            workbook_data.append({
                'date': date, 'num_msgs': number_msgs,
                'total_words': total_words,
                'avg': total_words / float(number_msgs)
            })

        # print word_graph.nodes()
        # nx.draw_networkx(word_graph)
        # plt.show()

        user_payload['dates'] = graph_dates
        user_payload['words'] = all_words
        user_payload['distinct_words'] = set(all_words)
        user_payload['number_messages'] = graph_number_messages
        user_payload['lexical_diversity'] = graph_lexical_diversity
        user_payload['number_words'] = graph_number_words
        user_payload['avg_words'] = graph_avg_words
        user_payload['avg_word_length'] = graph_avg_word_length
        user_payload['times_hist'] = graph_times_hist

        result['users'].append(user_payload)

        # save_workbook(workbook_data, name)

        # fdist = FreqDist(all_words)

        # print sorted([w for w in set(all_words) if len(w) > 4 and fdist[w] > 7])

        # graph it
        
        # plt.subplot(4, 1, 1)´

        plot_graph(1, graph_dates, graph_number_messages, name, "# Messages", "num_messages.png", "")

        # plt.subplot(4, 1, 2)
        plt.figure(2, figsize= (24, 8))
        plt.subplot(2, 1, 1)
        plt.plot(graph_dates, graph_number_words, '^:', label=unicode(name, 'utf-8'))
        plt.grid(True)
        plt.ylabel("# Words")
        plt.legend()
        plt.savefig("num_words")

        plt.subplot(2, 1, 2)
        plt.plot(graph_dates, graph_lexical_diversity, '^:', label=unicode(name, 'utf-8'))
        plt.grid(True)
        plt.ylabel("Lexical Diversity")
        plt.legend()
        plt.savefig("lexical_div")

        # plt.subplot(4, 1, 3)
        plt.figure(3, figsize= (24, 8))
        plt.subplot(2, 1, 1)
        plt.plot(graph_dates, graph_avg_words, '^:', label=unicode(name, 'utf-8'))
        plt.grid(True)
        plt.ylabel("Avg # Words")
        plt.legend()
        plt.savefig("avg_num_words")

        plt.subplot(2, 1, 2)
        plt.plot(graph_dates, graph_avg_word_length, '^:', label=unicode(name, 'utf-8'))
        plt.grid(True)
        plt.ylabel("Average Word Length")
        plt.legend()
        plt.savefig("avg_word_length")

        graph_times_x = [hour for hour in sorted(graph_times_hist.keys())]
        graph_times_y = [graph_times_hist[key] for key in graph_times_x]
        
        # # plt.subplot(4, 1, 4)
        plt.figure(4, figsize= (24, 8))

        # if other_name:
        #     plt.scatter(graph_times_x, graph_times_y, color='r', s=20, alpha=0.5)
        # else:
        #     plt.scatter(graph_times_x, graph_times_y, s=20, alpha=0.5)

        plt.plot(graph_times_x, graph_times_y, '-', label=unicode(name, 'utf-8'))
        plt.grid(True)
        plt.xlim([0, 24])
        plt.xticks(np.arange(0, 24, 1.0))
        plt.yticks(np.arange(0, max(graph_times_y) + 40, 10))
        plt.xlabel("Hour (24h)")
        plt.ylabel("Combined # Messages")
        plt.savefig("combined_num_messages.png")

        # with open("word_hist_{}.txt".format(name), 'w') as fout:
        #     for key, value in sorted(word_freq_distribution.iteritems(), key=lambda (k, v): v, reverse=True):
        #         fout.write("{} {}\n".format(key, value))

    # plt.show()
    return result

if __name__ == "__main__":
    main()