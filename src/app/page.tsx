import fs from 'fs';
import path from 'path';

export default function Home() {
  // In a real application, you might want to use Next.js page/components
  // But for migration purposes, we'll serve the original HTML file
  const htmlFilePath = path.join(process.cwd(), 'public', 'index.html');
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}