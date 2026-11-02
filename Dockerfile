# Same image on every machine — no more "works on mine" surprises.
FROM node:22-alpine

WORKDIR /app

# Install production deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run as non-root
RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "server.js"]
