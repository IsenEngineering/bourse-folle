FROM oven/bun:latest AS web
WORKDIR /bourse-folle

COPY ./web/package.json ./web/bun.lock ./
RUN bun i

COPY types.d.ts ..
COPY ./web ./

RUN bun run build

FROM rust:alpine AS build
WORKDIR /app
COPY Cargo.* .
COPY src src

# OpenSSL linking
RUN apk add --no-cache pkgconfig openssl-dev openssl-libs-static
ENV OPENSSL_STATIC=1
ENV OPENSSL_LIB_DIR=/usr/lib
ENV OPENSSL_INCLUDE_DIR=/usr/include

RUN cargo build --release

FROM alpine AS runtime
WORKDIR /bourse-folle

COPY --from=build /app/target/release/bourse_folle /usr/local/bin/
COPY --from=web /bourse-folle/dist/ /bourse-folle/dist/

ENV DIST_PATH="/bourse-folle/dist"
EXPOSE 80
CMD ["/usr/local/bin/bourse_folle"]

LABEL org.opencontainers.image.source=https://github.com/isenengineering/bourse-folle
