# frechet webapp – DEPLOY

## frontend
1. build frontend
	* ```cd frontend```
	* ```yarn install```
	* ```yarn build```
2. copy contents of frechet_frontend/build folder
3. switch to gh-pages branch
4. paste build contents to root of gh-pages branch
5. commit
6. switch back to master branch

## backend
1. commit frechet_server folder
2. push subtree to heroku master: ```git subtree push --prefix frechet_server heroku master```
3. if you need to force: ```git push --force heroku `git subtree split --prefix frechet_server HEAD`:master```