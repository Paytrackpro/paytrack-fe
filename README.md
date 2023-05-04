# [Application Scope](https://code.cryptopower.dev/mgmt-ng/fe/-/wikis/home)

# Run Project

### Config ENV

add `.env` file and update `.env` file with BASE_URL=[server url]

### Run Project

**install dependencies:**

`npm install`

**run project:**

`npm run dev`

**Check lint errors:**

`npm run lint`

**Auto format code to with lint config:**

`npm run format`

### Deploy to test or product (with webserver)

- Run `npm run build` or `yarn build`
- After success you will see the path of output folder

  ```
    Build succeeded
    Build mode................ spa
    Pkg quasar................ v2.11.7
    Pkg @quasar/app-webpack... v3.7.2
    Pkg webpack............... v5
    Debugging................. no
    Publishing................ no
    Transpiled JS..... yes (Babel)
    ==========================
    Output folder............. D:\mgmt-fe\dist\spa  // This line
  ```

- copy that folder to your webserver
