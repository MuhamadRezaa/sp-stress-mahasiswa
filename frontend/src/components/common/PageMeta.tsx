import { useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

const appName = import.meta.env.VITE_APP_NAME || "Stresspresso";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const fullTitle = `${title} | ${appName}`;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
