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
		x = web.input(conversation={})
		web.debug(x['conversation'].filename)

		text = x['conversation'].file.read()

		print 'Loading messages from file'
		result = {}

		lines = anal.get_lines(text)
		results.num_messages = len(lines)
		session.num_messages = len(lines)

		messages_by_user = anal.get_messages_by_user(lines)

		# for each user, process messages
		session.users = []
		session.messages_by_user = []

		result['users'] = []

		for user in messages_by_user.keys():
			session.users.append(user)
			session.messages_by_user.append({
				'name': user,
				'num_messages': len(messages_by_user[user])
			})

			print "Processing messages from {}".format(user)

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