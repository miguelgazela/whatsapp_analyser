import web
import view
from view import render

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
		web.debug(x['conversation'].value)

		text = web.debug(x['conversation'].file.read())
		raise web.seeother('/results')

class results:

	def GET(self):
		return render.base(view.results())


if __name__ == "__main__":
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()