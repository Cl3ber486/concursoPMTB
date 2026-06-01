import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zwrdjzogecfabnwsolqu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cmRqem9nZWNmYWJud3NvbHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDk2NTUsImV4cCI6MjA5NTgyNTY1NX0.5tQFosJKLcq7W7l-8lYRGobq-4BuZFVkNstEoOm6qds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testando conexão com Supabase...');
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.log('Conexão realizada com o projeto Supabase, mas erro ao consultar a tabela "users" (pode não existir):', error.message || error.code);
    } else {
      console.log('Conexão com Supabase bem-sucedida! Tabela "users" retornou:', data);
    }
  } catch (err) {
    console.error('Falha geral de conexão:', err);
  }
}

testConnection();
