#!/usr/bin/python3
from wsgiref.handlers import CGIHandler
from frechet_api import app

CGIHandler().run(app)
