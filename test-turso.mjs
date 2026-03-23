import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Testing Turso connection...');
console.log('URL:', url);
console.log('Has Auth Token:', !!authToken);

try {
  const client = createClient({
    url: url,
    authToken: authToken,
  });

  console.log('Client created. Attempting to execute query...');
  
  const result = await client.execute('SELECT 1 as test');
  console.log('✓ Turso connection successful!', result);
  
} catch (error) {
  console.error('✗ Turso connection failed:', error.message);
  console.error('Full error:', error);
}
