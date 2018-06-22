# Frechet Webapp – DEPLOY

## Frontend
1. Navigate to frechet_frontend: ```cd ./frechet_frontend```
2. Use scripts to deploy to gh-pages: ```yarn run deploy``` or ```npm run deploy```

## Backend
1. Commit frechet_server folder
2. Navigate to root
3. Push subtree to heroku master: ```git subtree push --prefix frechet_backend heroku master```
4. If you need to force: ```git push --force heroku `git subtree split --prefix frechet_backend HEAD`:master```