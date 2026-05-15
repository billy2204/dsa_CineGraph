import { useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { SearchPage } from "./components/SearchPage";

interface User {
  name: string;
  email: string;
}

const REVIEW_USER: User = {
  name: "Layout Review",
  email: "review@cinegraph.local",
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("auth") === "1" ? null : REVIEW_USER;
  });

  if (!user) {
    return <AuthPage onLogin={setUser} onPreview={() => setUser(REVIEW_USER)} />;
  }

  return (
    <SearchPage user={user} onLogout={() => setUser(null)} />
  );
}
