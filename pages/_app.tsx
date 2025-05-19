import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex">
     
      <main className="flex-1 p-8">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
