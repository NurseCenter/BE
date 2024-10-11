const devAllowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
    'http://127.0.0.1:3001'
  ];
  
  const prodAllowedOrigins = [
    'http://localhost:5173', // 임시
    'http://localhost:3000', // 임시
    'http://localhost:3000', // 임시
    'https://localhost:3001', // 임시
    'https://api.caugannie.com',
    'https://www.caugannies.com',
    'https://cauganies.com',
  ];
  
  export const getAllowedOrigins = (env: string) => {
    return env === 'development' ? devAllowedOrigins : prodAllowedOrigins;
  };