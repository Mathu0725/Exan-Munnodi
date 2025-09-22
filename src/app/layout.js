import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Exam Munnodi - Admin',
  description: 'Admin panel for Exam Munnodi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
        </div>
      </body>
    </html>
  );
}
