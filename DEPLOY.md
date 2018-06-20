# Frechet Webapp – DEPLOY

## Frontend
1. Use scripts to deploy to gh-pages: ```yarn run deploy``` or ```npm run deploy```

## Backend
1. Commit frechet_server folder
2. Push subtree to heroku master: ```git subtree push --prefix frechet_server heroku master```
3. If you need to force: ```git push --force heroku `git subtree split --prefix frechet_server HEAD`:master```