interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Scryfall MCP — Magic: The Gathering card database.
 * Keyless. Scryfall requires a User-Agent and Accept: application/json header.
 */


const BASE = 'https://api.scryfall.com';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_cards',
    description:
      'Search Magic: The Gathering (MTG) cards using Scryfall\'s powerful query syntax (e.g. "c:red type:dragon", "set:neo rarity:mythic", "o:flying cmc<=3"). Returns matching MTG cards with names, types, oracle text, sets, rarities, and prices.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: "Scryfall search query, e.g. 'c:red type:dragon', 'set:neo rarity:mythic'. Uses Scryfall's full-text query syntax.",
        },
        order: {
          type: 'string',
          description: "Sort order, e.g. 'name', 'released', 'usd', 'edhrec'.",
        },
        unique: {
          type: 'string',
          enum: ['cards', 'prints', 'art'],
          description: "Rollup mode (default 'cards').",
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_card',
    description:
      'Look up a single Magic: The Gathering (MTG) card by name (fuzzy matching). Returns full card details including mana cost, oracle text, colors, prices, legalities, and image.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Card name (fuzzy matched), e.g. "black lotus".' },
        set: { type: 'string', description: 'Optional 3-letter set code to pin the printing, e.g. "neo".' },
      },
      required: ['name'],
    },
  },
  {
    name: 'random_card',
    description:
      'Get a random Magic: The Gathering (MTG) card, optionally filtered by a Scryfall query (e.g. "is:commander", "c:blue").',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Optional Scryfall filter query.' },
      },
    },
  },
  {
    name: 'list_sets',
    description: 'List all Magic: The Gathering (MTG) sets/expansions with codes, names, types, release dates, and card counts.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_cards': {
      const query = reqStr(args, 'query', "'c:red type:dragon'");
      const order = args.order as string | undefined;
      const unique = (args.unique as string | undefined) ?? 'cards';
      const params = new URLSearchParams({ q: query, unique });
      if (order) params.set('order', order);
      const res = await scryGet(`/cards/search?${params.toString()}`);
      if (isError(res)) return res;
      const r = res as { total_cards?: number; has_more?: boolean; data?: unknown[] };
      const data = (r.data || []) as Array<Record<string, unknown>>;
      return {
        total_cards: r.total_cards,
        has_more: r.has_more,
        cards: data.slice(0, 40).map((c) => ({
          id: c.id,
          name: c.name,
          mana_cost: c.mana_cost,
          type_line: c.type_line,
          oracle_text: c.oracle_text,
          set: c.set,
          set_name: c.set_name,
          rarity: c.rarity,
          prices: c.prices,
          image: (c.image_uris as Record<string, unknown> | undefined)?.normal,
          scryfall_uri: c.scryfall_uri,
        })),
      };
    }
    case 'get_card': {
      const name = reqStr(args, 'name', '"black lotus"');
      const set = args.set as string | undefined;
      const params = new URLSearchParams({ fuzzy: name });
      if (set) params.set('set', set);
      const res = await scryGet(`/cards/named?${params.toString()}`);
      if (isError(res)) return res;
      return mapCard(res as Record<string, unknown>);
    }
    case 'random_card': {
      const query = args.query as string | undefined;
      const path = query ? `/cards/random?${new URLSearchParams({ q: query }).toString()}` : '/cards/random';
      const res = await scryGet(path);
      if (isError(res)) return res;
      return mapCard(res as Record<string, unknown>);
    }
    case 'list_sets': {
      const res = await scryGet('/sets');
      if (isError(res)) return res;
      const data = ((res as { data?: unknown[] }).data || []) as Array<Record<string, unknown>>;
      return data.map((s) => ({
        code: s.code,
        name: s.name,
        set_type: s.set_type,
        released_at: s.released_at,
        card_count: s.card_count,
        icon: s.icon_svg_uri,
      }));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function mapCard(c: Record<string, unknown>): unknown {
  return {
    id: c.id,
    name: c.name,
    mana_cost: c.mana_cost,
    cmc: c.cmc,
    type_line: c.type_line,
    oracle_text: c.oracle_text,
    colors: c.colors,
    set: c.set,
    set_name: c.set_name,
    rarity: c.rarity,
    power: c.power,
    toughness: c.toughness,
    loyalty: c.loyalty,
    prices: c.prices,
    image: (c.image_uris as Record<string, unknown> | undefined)?.normal,
    legalities: c.legalities,
    scryfall_uri: c.scryfall_uri,
  };
}

async function scryGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text.slice(0, 300);
    try {
      const body = JSON.parse(text) as { details?: string };
      if (body.details) message = body.details;
    } catch {
      // non-JSON body; keep raw text slice
    }
    return { error: res.status, message };
  }
  return res.json();
}

function isError(res: unknown): boolean {
  return typeof res === 'object' && res !== null && 'error' in res;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
