import MUIProvider from '../../../components/MUIProvider';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MUIProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </MUIProvider>
  );
}
