cd backend-fyp/angular
rm *
cd ..
git pull
cd angular
rm *

cd ../../angular-fyp
git pull

ng build --prod

cd ../backend-fyp/angular
rm *
cd ../../angular-fyp
cp -R dist/. ../backend-fyp/angular
cd ../backend-fyp
nohup node index &

echo 'app deployed'

