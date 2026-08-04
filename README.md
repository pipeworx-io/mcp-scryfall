# mcp-scryfall

Scryfall MCP — Magic: The Gathering card database.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_cards` | Search Magic: The Gathering (MTG) cards using Scryfall's powerful query syntax (e.g. "c:red type:dragon", "set:neo rarity:mythic", "o:flying cmc<=3"). Returns matching MTG cards with names, types, oracle text, sets, rarities, and prices. |
| `get_card` | Look up a single Magic: The Gathering (MTG) card by name (fuzzy matching). Returns full card details including mana cost, oracle text, colors, prices, legalities, and image. |
| `random_card` | Get a random Magic: The Gathering (MTG) card, optionally filtered by a Scryfall query (e.g. "is:commander", "c:blue"). |
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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
