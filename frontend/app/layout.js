import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'Internship Catalog',
  description: 'Find internships that match your interests',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
