# VisualShowerOTA

## Initial Setup

Make sure you have [Node.js](http://nodejs.org/) installed. Version 4.4.7

```sh
git clone http://git.vshower.com/spagetti/ota2_vshower.git # or clone your own fork
cd VisualShowerOTA
npm install
```

## Configurations

There are two parts to this application.

- REST webservice:
  express node module is used to build REST webservices and all files under `server` folder corresponds to REST webservices.
  To configure service update `./server/config.js` (create file if not exist)

  ```
  "use strict";

  var config = {};

  config.host = "localhost";
  config.user = "ota";
  config.password = "slk-ota-proj";
  config.database = "ota2-test_db";

  config.s3 = {
      bucket:"ota2-test",
      uploadWindow:1,
      accessKey: "AKIAJ6C3KQPBEGXFXQUQ",
      accessSecret:"BGr2v/o02X87WXLX//1SDweUxcVlrz9N8hKe2DI64uW0Zk",
      region:"us-west-1"
  }

  module.exports = config;
```

- UI:
  angular2 framework is used to build UI and all files under `client` folder corresponds to UI.
  To configure client update `./client/config.ts` (create file if not exist)

```
    import {Injectable} from "@angular/core";

    @Injectable()
    export class Config {
        public callback="http://localhost:3000/api/login";
        public downloadBaseUrl="http://localhost:3000/api/download/";
    }
```

## index.html
`index.html` is starting point for UI which is under `public` folder.
When in development mode uncomment following lines

```
   <script src="assets/js/systemjs.config.js"></script>
   <script>
       System.import('app').catch(function(err) { console.error(err); });
   </script>
```

when in production mode uncomment following lines
```
   <script src="assets/js/bundle.min.js"></script>
```

## Development mode

To run app in development mode, make necessary updates in configuration files and uncomment/comment mods in index.html then execute following commands in shell

```
    npm run develop
```
Your app should now be running on [localhost:3000](http://localhost:3000/).
This mode will track updates in project file and reload the changes on the fly


## Production mode

To run app in production mode, make necessary updates in configuration files and uncomment/comment mods in index.html then execute following commands in shell

```
    npm run build
    npm run prod
```
Your app should now be running on [localhost:3000](http://localhost:3000/).

To update the port on which application will run define environment variable `PORT` with the port number then start application
