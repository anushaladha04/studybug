import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function TabOneScreen() {
  const [status, setStatus] = useState<string>("Checking Supabase...");

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus(`Supabase error: ${error.message}`);
        return;
      }
      const sessionState = data.session ? "session found" : "no session (anon)";
      setStatus(`Supabase connected: ${sessionState}`);
    });
  }, []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text>hello studybug baddie devs 🐞</Text>
      <Text style={{ marginTop: 12 }}>{status}</Text>
    </View>
  );
}
