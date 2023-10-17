ARG NODE_VERSION=16-alpine3.12

FROM node:${NODE_VERSION}

LABEL name="mern-invoice"
LABEL license="MIT"
LABEL description="MERN invoice image"

ENV NODE_ENV=development

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

# Doicker as default runs as the root user with all the priviliges
# This is not a good prictise, so to run the container as no root users,
# we add a group and a user invoice, we can call them whatever we want

RUN addgroup --system invoice \
    && adduser --system --ingroup invoice invoice

COPY package*.json ./

RUN npm install

# to change ownership of the user within group invoice:invoice to our working directory
# changeownership user-invoice within the group-invoice from current dir to working dir:
COPY --chown=invoice:invoice . ${APP_HOME}

# actually change the ownership:
RUN chown invoice:invoice ${APP_HOME}

# swithcing to our newly created user:
USER invoice

CMD [ "npm", "run", "dev" ]
