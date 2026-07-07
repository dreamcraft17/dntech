import { FaqJsonLd } from './FaqJsonLd';

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd />
      {children}
    </>
  );
}
