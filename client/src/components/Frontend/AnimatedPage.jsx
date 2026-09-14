import { useLocation } from "react-router-dom";
import { usePageSeo } from "../../seo/usePageSeo";

export default function AnimatedPage({ children }) {
  const { pathname } = useLocation();
  usePageSeo(pathname);

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
