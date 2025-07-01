#!/bin/bash

cd frontend
npm run build
cd ..

# Prepare a temp deploy folder
rm -rf temp-deploy
mkdir temp-deploy
cp -r frontend/dist/* temp-deploy/

# Deploy from temp-deploy to gh-pages branch
cd temp-deploy
git init
git remote add origin https://github.com/qwer030413/NoteCast.git
git checkout -b gh-pages
git add .
git commit -m "Deploy frontend"
git push origin gh-pages --force
cd ..
rm -rf temp-deploy