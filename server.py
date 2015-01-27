import web
import view
from view import render
from lib import analyser as anal
import json

web.config.debug = False

urls = (
	'/', 'index',
	'/upload', 'upload',
	'/results', 'results',
)

render = web.template.render('templates/')

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

		# built information about the days where messages where exchanged
		session.overview = {}
		session.overview['days'] = []

		for day in sup_results['days'].keys():
			session.overview['days'].append({
				'date': day,
				'num_messages': sup_results['days'][day]
			})

		session.overview['days_by_user'] = json.dumps(sup_results['days']['users'])
		session.overview['num_days'] = sup_results['days']['overview']['num_days']
		session.overview['days'] = json.dumps(sup_results['days']['overview']['days'])

		session.messages_by_user = json.dumps(session.messages_by_user)
		raise web.seeother('/results')


class results:

	def GET(self):
		return render.base(view.results(session))


if __name__ == "__main__":
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	session = web.session.Session(app, web.session.DiskStore('sessions'))
	app.run()