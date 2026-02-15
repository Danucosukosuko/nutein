# environment json files

* For persistent state
  * copy and paste the desired environment in packson.json script
  * e.i. 'cp env/local.json app/env.json'
  * properties get added to env.json to be accessed after build is complete
  * index.js accesses the env url value and adds it to the query for the index.html loader page
  * the renderer.js file then takes that value and window.location.search
  * removes the ?env= and uses it to set the src on the webview in the index.html