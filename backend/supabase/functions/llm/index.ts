import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CreateCompletionRequest } from 'https://esm.sh/openai';
import { corsHeaders } from './cors.js';

const openaiToken = Deno.env.get('OPENAI_SECRET_KEY')


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
        Authorization: `Bearer ${openaiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionConfig),
    })

    const data = await response.json()


    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));  // Log the complete response from OpenAI



    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})


// npx supabase env pull --project wogivjshqopegucducyz --key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODQ3NTgzNSwiZXhwIjoxOTk0MDUxODM1fQ.fSYxm3nQe-pnl8rfL2ppLOtl9_4y2gNgRI0IZrIjLRs .env

// project id : wogivjshqopegucducyz

// private role key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODQ3NTgzNSwiZXhwIjoxOTk0MDUxODM1fQ.fSYxm3nQe-pnl8rfL2ppLOtl9_4y2gNgRI0IZrIjLRs
