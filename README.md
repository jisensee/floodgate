# Getting Started

```bash
# Don't forget to fill in missing values in .env
cp template.env .env
bun i
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build contract and regenerate ABI

```bash
bun contract:build
```

## Required binaries

- bun
- scarb
- jq
