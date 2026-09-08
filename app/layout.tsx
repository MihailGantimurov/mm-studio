import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'M&M — реклама, клипы и анимационные истории',description:'Студия Миши Гантимурова и Миши Останина. Реклама для брендов, музыкальные клипы, анимационные и личные истории.',metadataBase:new URL('https://mm-studio-gantimurov-ostanin.apocritonsapeiens.chatgpt.site')};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
