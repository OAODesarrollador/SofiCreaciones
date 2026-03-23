import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://local-okyformosa.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzAxNDYwOTcsImlkIjoiNTJmMzJmY2YtNjA1MC00MDgwLTg1ZTQtMzg0OGU3OWZkYjgyIiwicmlkIjoiY2RjZjhiNDAtNDk4NC00YWFlLTk0MmItYTgyNzA4OWNiYzM3In0.jySO1YtJqAXpggkRoYg5yvdaK9io6SzENplWAQQOMSLnJnSIXN-bBqnzrCJCKMNkiaAz2jbIv369p1jbwrsNCw'
});

try {
  const result = await client.execute('SELECT COUNT(*) as count FROM products');
  console.log('✓ Products count:', result.rows[0]);
  
  const products = await client.execute('SELECT * FROM products LIMIT 5');
  console.log('\n✓ Sample products:', products.rows);
} catch (err) {
  console.error('✗ Error:', err.message);
}
