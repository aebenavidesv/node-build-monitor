FROM mhart/alpine-node

RUN npm install -g forever

WORKDIR /build-mon

ADD app /build-mon/app
ADD node_modules /build-mon/node_modules
ADD package.json /build-mon/package.json
ADD README.md /build-mon/README.md

#RUN npm install

ARG CONSUL_TEMPLATE_VERSION=0.19.4

RUN wget "https://releases.hashicorp.com/consul-template/${CONSUL_TEMPLATE_VERSION}/consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.tgz"
RUN tar zxfv consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.tgz


ADD /consul/config.tmpl /config/
ADD /consul/config.hcl /consul/entrypoint.sh /

EXPOSE 3000

CMD ["/entrypoint.sh"]
