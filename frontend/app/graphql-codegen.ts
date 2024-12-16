import type { CodegenConfig } from "@graphql-codegen/cli";
import fs from "fs";
import path from "path";

function findSubgraphUrl(envFile: string): string | null {
  try {
    const envPath = path.resolve(process.cwd(), envFile);
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      if (line.trim().startsWith("NEXT_PUBLIC_SUBGRAPH_URL=")) {
        return line.slice("NEXT_PUBLIC_SUBGRAPH_URL=".length).trim();
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Try to get URL in this order:
// 1. Process environment (from Vercel)
// 2. .env.local file
// 3. .env file
const subgraphUrl = process.env.NEXT_PUBLIC_SUBGRAPH_URL
  || findSubgraphUrl(".env.local")
  || findSubgraphUrl(".env");

if (!subgraphUrl) {
  throw new Error(
    "Subgraph URL not found in environment or .env files. Please set NEXT_PUBLIC_SUBGRAPH_URL.",
  );
}

console.log("Using subgraph URL:", subgraphUrl, "\n");

const config: CodegenConfig = {
  schema: subgraphUrl,
  documents: "src/**/*.{ts,tsx}",
  ignoreNoDocuments: true,
  generates: {
    "./src/graphql/": {
      preset: "client",
      config: {
        dedupeFragments: true,
        documentMode: "string",
        strictScalars: true,
        scalars: {
          BigDecimal: "string",
          BigInt: "bigint",
          Bytes: "string",
          Int8: "number",
          Timestamp: "string",
        },
      },
    },
  },
};

export default config;
