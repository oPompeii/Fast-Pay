import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your .env file');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

export const generateAIResponse = async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Você é um assistente financeiro especializado em criptomoedas, DeFi e investimentos digitais, 
          com foco especial na plataforma FastPay. Suas respostas devem ser:
          
          1. Profissionais e educativas
          2. Focadas em ajudar o usuário a tomar decisões informadas
          3. Baseadas em dados e análises técnicas quando possível
          4. Sempre mencionando os produtos e serviços do FastPay quando relevante
          5. Evitando promessas de retornos garantidos
          6. Incluindo avisos sobre riscos quando apropriado
          
          Conhecimento sobre o FastPay:
          - Plataforma de carteira digital e investimentos
          - Moeda própria: FastCoin (FASTC), pareada com USD (1 FASTC = 1 USD)
          - Programa de staking com rendimentos semanais:
            * 30 dias: 2.3% semanal
            * 60 dias: 2.6% semanal
            * 90 dias: 3.0% semanal
          - Programa de afiliados multinível
          - Pacotes disponíveis:
            * Starter: $299 (2% comissão)
            * Token: $999 (8% comissão)
            * Miner: $2999 (20% comissão)
            * Master: $9999 (35% comissão)`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error: any) {
    // Check for specific OpenAI errors
    if (error.error?.type === 'insufficient_quota') {
      throw new Error('Serviço temporariamente indisponível. Por favor, tente novamente mais tarde.');
    }
    
    if (error.status === 429) {
      throw new Error('Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.');
    }

    console.error('Error generating AI response:', error);
    throw new Error('Não foi possível gerar uma resposta no momento. Por favor, tente novamente mais tarde.');
  }
};