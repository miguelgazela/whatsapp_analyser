import web
import view
from view import render
from lib import analyser as anal
from config import default_config as config
import json
import os

web.config.debug = False

urls = (
	'/', 'index',
	'/upload', 'upload',
	'/results', 'results',
	'/results/words', 'words',
	'/example', 'example'
)

render = web.template.render('templates/')



def processAnalysis(text):
	# reading all lines from the text
	lines = anal.get_lines(text)
	session.num_messages = len(lines)

	# get different messages of users and days
	sup_results = anal.superficial_analysis(lines)

	# for each user, process messages
	session.users = []
	session.messages_by_user = []

	for user in sup_results['messages'].keys():
		session.users.append(user)
		session.messages_by_user.append({
			'name': user,
			'num_messages': len(sup_results['messages'][user])
		})

	# built information about the days where messages were exchanged
	session.overview = {}
	session.overview['days'] = []

	# for day in sup_results['days'].keys():
	# 	session.overview['days'].append({
	# 		'date': day,
	# 		'num_messages': sup_results['days'][day]
	# })

	# get word histogram and sort it
	hist = anal.get_word_hist(sup_results['messages'])

	word_hist = sorted(hist['words'], key=lambda word: word['size'], reverse=True)
	smile_hist = sorted(hist['smiles'], key=lambda word: word['size'], reverse=True)

	session.overview['word_hist'] = json.dumps(word_hist[:config['NUM_WORDS_HISTOGRAM']])
	session.overview['smile_hist'] = json.dumps(smile_hist[:config['NUM_SMILES_HISTOGRAM']])
	session.overview['days_by_user'] = json.dumps(sup_results['days']['users'])
	session.overview['num_days'] = sup_results['days']['overview']['num_days']
	session.overview['days'] = json.dumps(sup_results['days']['overview']['days'])

	session['complete_word_histogram'] = json.dumps(word_hist)
	session['complete_smile_histogram'] = json.dumps(smile_hist)

	session.messages_by_user = json.dumps(session.messages_by_user)



class index:

	def GET(self):
		return render.base(view.home(), title='WhatsApp Chat Analyzer')


class upload:

	def GET(self):
		return render.base(view.upload(), title='Upload Chat File')

	def POST(self):

		# getting file from input
		x = web.input(conversation={})
		text = x['conversation'].file.read()

		processAnalysis(text)
		raise web.seeother('/results')


class results:

	def GET(self):
		return render.base(view.results(session))


class example:

	def GET(self):

		with open("chat.txt") as fin:
			text = fin.read();

		processAnalysis(text)
		raise web.seeother('/results')


class words:

	def GET(self):
		return render.base(view.words(session))


class MyApplication(web.application):

	def run (self, port=8080, *middleware):
		func = self.wsgifunc(*middleware)
		return web.httpserver.runsimple(func, ('0.0.0.0', port))


if __name__ == "__main__":
	app = MyApplication(urls, globals())
	app.internalerror = web.debugerror
	session = web.session.Session(app, web.session.DiskStore('sessions'))
	port = int(os.environ.get('PORT', 8080))
	app.run(port=port)