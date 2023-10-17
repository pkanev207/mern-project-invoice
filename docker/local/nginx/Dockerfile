FROM nginx:1.21.3-alpine

# we remove the default nginx conf file and replace it with our own custome default conf file
RUN rm /etc/nginx/conf.d/default.conf

COPY ./default.conf /etc/nginx/conf.d/default.conf
