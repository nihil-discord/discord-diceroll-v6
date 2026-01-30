# syntax = docker/dockerfile:1
# Discord bot (Node.js) – 멀티스테이지, 비 root, 최소 이미지

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV=production

# pnpm
ARG PNPM_VERSION=10.28.2
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# 비 root 사용자 (보안) – node 이미지에 이미 1000 사용 중이므로 1001 사용
RUN groupadd --gid 1001 app && \
    useradd --uid 1001 --gid app --shell /bin/bash --create-home app

# -----------------------------------------------------------------------------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

COPY . .
RUN pnpm run build && pnpm prune --prod

# -----------------------------------------------------------------------------
FROM base AS run

COPY --from=build --chown=app:app /app /app

USER app

CMD ["pnpm", "run", "start"]
