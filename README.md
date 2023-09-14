# HANSCA

Hand scanner for engineers, scientists and medics.

## Tech

* Node v18.14.0
* Vue v2.6.14

## Local setup

### Environment file
Copy `.env.example` file to a file named `.env` and changle the default environmental variables as following:

```
VUE_APP_BACKEND_URL=http://localhost:8888/
VUE_APP_BACKEND_USER=
VUE_APP_BACKEND_PASS=
```

### Install dependencies
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

## Local setup in VSCode dev container

You can also run the app using [VSCode dev containers](https://code.visualstudio.com/docs/devcontainers/containers). Create/update your .env file like in the local setup instructions.

### Requirements

- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/) with [Dev Containers](https://code.visualstudio.com/docs/devcontainers/tutorial#_install-the-extension) extension
- [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend)

### Setup

* **`NOTE!`** Make sure you are running `Odysseus Backend`!
* Check you have your .env file copied as instructed above in [Environment file](#environment-file)
* Open new window in VSCode
* File --> Open Folder... --> `odysseus-admin-story-tool`
* VSCode will ask do you want to `Reopen in Container` --> Click it
    * If you are too slow --> Click the button in left bottom corner (looks like two L:s or disjointed ><) and choose `Reopen in Container` from the menu.
* VSCode will then build and start up the dev container, installs npm packages and starts the service.

### Problems?

* Try to rebuild the container: Click the button in left bottom corner (looks like two L:s or disjointed >< with the container name) and choose `Rebuild Container` from the menu.
* You might run into [this issue](https://github.com/microsoft/vscode-remote-release/issues/7305) on ARM processors, see the issue for potential workarounds.

## Test Bio ID:s

* Medic: `bio3` (in a NFC tag `bio:bio3`)
* Engineer: `bio78` (in a NFC tag `bio:bio78`)
* Scientist: `bio11` (in a NFC tag `bio:bio11`)

## Other Available Scripts

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Deploy to S3
```
npm run deploy
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
