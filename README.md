

> 🚧 This CLI tool is still a work-in-progress.

##### cube-ts-gen: generate strongly typed cube definitions for your typescript project

This project connects to a [cube.js](https://cube.dev/docs/product/introduction) deployment and creates a cube definition, as defined in [cube-ts](https://github.com/benhall-7/cube-ts).

Todo:
- Specific unit tests for the `/utils` would be useful. An e2e test to run docker and use the meta api to generate cubes exists but requires an update to find the cube-types
- A custom logger with a LogLevel
- GitHub Action to run the code `npm run test`
- Mayve should output individual files so you can customise one file to add more specific typing/validation, and gen new ones?

### CLI Options 🔧

| Option                        | Description                                           | Default                     |
| ----------------------------- | ----------------------------------------------------- | --------------------------- |
| `-c, --config <path>`         | Path to `cubetypes.config.json` file                  | `./cubetypes.config.json`   |
| `-u, --url <url>`             | Base URL of the Cube API                              | *Required if not in config or env as CUBE_API_URL |
| `--secret <secret>`           | Cube API secret used for signing the security context | *Optional*                  |
| `-o, --output <path>`         | Output file path for generated TypeScript definitions | `./cubes.generated.ts`      |
| `--cube <name>`               | Generate types for a specific cube only               | *Optional* as can be defined as CUBE_API_SECRET in env                  |
| `-z, --zod-schema <path>`     | Output path for generated Zod validation schema       | *Optional*                  |
| `-d, --delimiter <delimiter>` | Delimiter to group cube names into a nested structure | *Optional*                  |

### cubetypes.config.json

You can use a `cubetypes.config.json` to define what the CLI does instead of supplying as CLI arguments
```JSON
  {
    "apiUrl": "http://localhost:4000",
    "securityContext": {
      "organisation_slug": "test",
      "schemas": {
        "google_ads": ["test"]
      }
    }
  }
```

Notes:
- The `/cube/.env/` should only be used for local testing purposes. Don't include genuine secrets