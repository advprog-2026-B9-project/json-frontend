import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700', '800'],
    variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body
            className={`${poppins.variable} antialiased`}
            suppressHydrationWarning
        >
        {children}
        </body>
        </html>
    );
}