let devMode = false;

export default devMode;

/*

*** Non devmode

"scripts": {
    "start": "node index.js",
    "heroku-postbuild": "cd client && npm install && npm run build"
  },

*** devmode
 

"scripts":  {
    "start": "concurrently \"npm run server\" \"cd ./client && npm start\"",
    "server": "nodemon index.js"
},



  
change the access control origin to : * for non devmode / http://localhost:3000 for devmode  

  
  */
