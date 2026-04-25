import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "Smart CV Dashboard",
  description: "نظام ذكاء اصطناعي لإدارة المتقدمين — الإمارات العربية المتحدة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={cairo.className}
        style={{ margin: 0, padding: 0, background: "#0a0a0f" }}
      >
        {children}
      </body>
    </html>
  );
}
