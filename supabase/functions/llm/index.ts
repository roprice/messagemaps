import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CreateCompletionRequest } from 'https://esm.sh/openai';
import { corsHeaders } from './cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { query } = await req.json()

  const completionConfig: CreateCompletionRequest = {
    model: 'text-davinci-003',
    prompt: query,
    max_tokens: 256,
    temperature: 0,
    stream: true,
  }

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('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')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionConfig),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
