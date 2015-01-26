import web

import view
from view import render

urls = (
	'/', 'index',
)

render = web.template.render('templates/')

class index:

	def GET(self):
		return render.base(view.home())


if __name__ == "__main__":
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()