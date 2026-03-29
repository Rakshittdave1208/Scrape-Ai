export const workflowNodes = [
  {
    id: "scraper-node",
    type: "scraperNode",
    position: { x: 80, y: 220 },
    data: {
      label: "Scrape Product Page",
      inputs: [],
      outputs: [
        {
          name: "rawHtml",
          type: "string",
        },
      ],
      config: {
        url: "https://shop.example.com/products/wireless-headphones",
        method: "GET",
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; WorkflowBot/1.0)",
          accept: "text/html,application/xhtml+xml",
        },
        timeoutMs: 15000,
      },
    },
  },
  {
    id: "parser-node",
    type: "transformNode",
    position: { x: 420, y: 220 },
    data: {
      label: "Parse Product Data",
      inputs: [
        {
          name: "rawHtml",
          type: "string",
        },
      ],
      outputs: [
        {
          name: "productData",
          type: "json",
        },
      ],
      config: {
        selectors: {
          title: "h1.product-title",
          price: ".product-price",
          currency: ".currency-symbol",
          sku: "[data-sku]",
          imageUrl: ".product-gallery img",
          availability: ".stock-status",
          rating: ".rating-value",
        },
        outputSchema: {
          title: "string",
          price: "string",
          currency: "string",
          sku: "string",
          imageUrl: "string",
          availability: "string",
          rating: "string",
        },
      },
    },
  },
  {
    id: "transform-node",
    type: "transformNode",
    position: { x: 760, y: 220 },
    data: {
      label: "Normalize Product Payload",
      inputs: [
        {
          name: "productData",
          type: "json",
        },
      ],
      outputs: [
        {
          name: "cleanedData",
          type: "json",
        },
      ],
      config: {
        transformations: [
          {
            field: "price",
            action: "parseFloat",
          },
          {
            field: "currency",
            action: "trim",
          },
          {
            field: "title",
            action: "trim",
          },
          {
            field: "availability",
            action: "toLowerCase",
          },
        ],
        mapping: {
          productTitle: "title",
          unitPrice: "price",
          currencyCode: "currency",
          productSku: "sku",
          image: "imageUrl",
          inStock: "availability",
          reviewRating: "rating",
        },
      },
    },
  },
  {
    id: "api-node",
    type: "apiNode",
    position: { x: 1100, y: 220 },
    data: {
      label: "Send Product To External API",
      inputs: [
        {
          name: "cleanedData",
          type: "json",
        },
      ],
      outputs: [
        {
          name: "response",
          type: "json",
        },
      ],
      config: {
        endpoint: "https://inventory-api.example.com/v1/products/import",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer {{INVENTORY_API_TOKEN}}",
        },
        retry: {
          attempts: 3,
          backoffMs: 1000,
        },
      },
    },
  },
] as const;

export const workflowEdges = [
  {
    id: "edge-scraper-parser",
    source: "scraper-node",
    target: "parser-node",
    sourceHandle: "rawHtml",
    targetHandle: "rawHtml",
  },
  {
    id: "edge-parser-transform",
    source: "parser-node",
    target: "transform-node",
    sourceHandle: "productData",
    targetHandle: "productData",
  },
  {
    id: "edge-transform-api",
    source: "transform-node",
    target: "api-node",
    sourceHandle: "cleanedData",
    targetHandle: "cleanedData",
  },
] as const;

export const sampleProductWorkflowDefinition = JSON.stringify({
  nodes: workflowNodes,
  edges: workflowEdges,
  viewport: {
    x: 0,
    y: 0,
    zoom: 0.85,
  },
});
