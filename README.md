## How To Run CollabBoard

`There are Two important folders in the full-stack application of CollabBoard-Group77`

* Frontend
* Backend

To run we need to run both files in order to work 

### Frontend
go inside the frontend dir and then open a terminal 
`cd fronend`

after that need to create a `.env` file to store important data which the frontend will use

create a new file called .env and add these inside: 

`VITE_BACKEND_URL=http://localhost:5000`

after the env file is ready run this in the terminal 

`npm i`
to install all the packages required to run the application (Frontend)

after run this >

`npm run dev`
##### This will automatically start the webserver and start running the application on the port : 5173 (def)

## Backend

Same as before go inside the backend dir and then open a terminal 
`cd backend`

after that need to create a `.env` file to store important data which the backend will use

create a new file called .env and add these inside: 

`NODE_ENV=development`

`PORT=5000`

`MONGODB_URI= { ADD A Mongo Db url to run the database services}`
* Because of the ODM it will automatically create all the tables needed just need to add a URI 

`JWT_ACCESS_SECRET=607cf41ffb9512e241bc089f79ce1f690112e6dc9cad1fcd4dd99c21e178869889938ea6cf7e39979f162e1b3e770c6deedd4d5b6301cae9c3cf77664c14e346`

`JWT_REFRESH_SECRET=f70a7ca35014942e65acd303a470d3f107c88a209d13f59ea5fe45a1730e8b6530f8b88389265e8bd4cc255a8b6f934679d05940d75eb1d004d4f9a2f3b1b846`

`JWT_ACCESS_EXPIRES_IN=15m`
`JWT_REFRESH_EXPIRES_IN=7d`

`CLIENT_URL=http://localhost:5173`
this client url also depends on the situation

`COOKIE_SECURE=false`
`COOKIE_SAME_SITE=lax`


`BACKEND_URL=http://localhost:5000`

!notice the both fronend and the backend has there own .env files 

after the env file is ready run this in the terminal 

`npm i`
to install all the packages required to run the application (backend)

after run this >

`npm run dev`
##### This will automatically start the backend server and start running the application on the port : 5000

# we are all good to go :)
#group77-CollabBoard

Server running on http://localhost:5000 (development)
API Docs (Scalar): http://localhost:5000/api/docs
