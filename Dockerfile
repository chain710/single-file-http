FROM zenika/alpine-chrome:with-node as builder

COPY --chown=chrome:chrome . /src
RUN cd /src && npm pack .

FROM zenika/alpine-chrome:with-node

COPY --from=builder /src/single-file-cli-1.0.12.tgz /tmp/install.tgz

RUN npm install --registry=https://registry.npmmirror.com/ --production -g --prefix=/usr/src/app /tmp/install.tgz && rm -f /tmp/install.tgz

WORKDIR /usr/src/app/
ENV PORT=8881
ENTRYPOINT exec /usr/src/app/bin/single-file --http-port $PORT --browser-executable-path /usr/bin/chromium-browser --browser-args [\"--no-sandbox\"]
