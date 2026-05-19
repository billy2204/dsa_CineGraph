import { useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { SearchPage } from "./components/SearchPage";

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = window.localStorage.getItem("cinegraph:profile");
      if (!raw) return null;
      const savedUser = JSON.parse(raw) as User;
      return savedUser?.email ? savedUser : null;
    } catch {
      return null;
    }
  });

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <SearchPage user={user} onLogout={() => setUser(null)} />
  );
}
