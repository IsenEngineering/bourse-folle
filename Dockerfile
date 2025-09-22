FROM denoland/deno:alpine AS build
WORKDIR /app

COPY . .

RUN apk add build-base && deno task build-static

FROM denoland/deno:alpine
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY src src
COPY deno.json deno.lock types.ts /app/
RUN mkdir data && deno cache ./src/main.ts

EXPOSE 80

ENTRYPOINT [ "deno", "run", "-P=production", "/app/src/main.ts" ]
