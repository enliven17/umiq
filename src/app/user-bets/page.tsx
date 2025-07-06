import dynamic from "next/dynamic";

const UserBetsScreen = dynamic(() => import("@/screens/UserBetsScreen"), { ssr: false });

export default function UserBetsPage() {
  return <UserBetsScreen />;
} 