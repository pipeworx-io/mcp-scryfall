# mcp-scryfall

Scryfall MCP — Magic: The Gathering card database.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 751+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_sets` | List all Magic: The Gathering (MTG) sets/expansions with codes, names, types, release dates, and card counts. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "scryfall": {
      "url": "https://gateway.pipeworx.io/scryfall/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 751+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Scryfall data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
