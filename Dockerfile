#Building frontends
FROM node:20 AS build

WORKDIR /build-dir

COPY . .

# environment variables for building
ARG IS_PRODUCTION=true
ARG PARSE_SERVER_URL=https://api.spitbat75.ch/parse
ARG PARSE_APP_ID=spitbat75-attendence-list
ARG ATTENDANCE_LIST_URL=https://spitbat75.ch
ARG BFA_AUTH_URL=https://bfa.spitbat75.ch/login?token=
ARG FISCHMARKT_AUTH_URL=https://fischmarkt.spitbat75.ch/login?token=
ARG ATTENDANCE_LIST_BASE_PATH=
ARG FISCHMARKT_BASE_PATH=

RUN cd fischmarkt && npm install && npm run build-prod-dockerfile
RUN cd bfa && npm install && npm run build-prod-dockerfile
RUN cd attendance-list && npm install && npm run build-prod-dockerfile

# Creating final image
FROM node:20-slim
WORKDIR /app
COPY --from=build /build-dir/parse-server .

RUN npm install

CMD ["node", "index.js"]
