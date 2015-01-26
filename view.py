import web

t_globals = dict(
	datestr=web.datestr,
)

render = web.template.render('templates/', globals=t_globals)
render._keywords['globals']['render'] = render

def home():
	return render.index()

def upload():
	return render.upload()

def results():
	return render.results()