import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "browser-with-cors" up and running!`);

function normalizeUrl(input: string): string {
  try {
    // Add protocol if missing
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      input = 'https://' + input;
    }
    
    const url = new URL(input);
    // Get base domain without path/params
    return url.protocol + '//' + url.hostname;
  } catch (e) {
    throw new Error('Invalid URL format');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const urlInput = url.searchParams.get('domain');

  if (!urlInput) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const normalizedUrl = normalizeUrl(urlInput);
    const response = await fetch(normalizedUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const metadata = {
      name:
        doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
        doc.querySelector('title')?.textContent ||
        '',
      description:
        doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        '',
      icons: Array.from(doc.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]'))
        .map((el) => {
          const href = el.getAttribute('href');
          return href ? new URL(href, normalizedUrl).href : null;
        })
        .filter(Boolean),
    };

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch metadata: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});