import dynamic from "next/dynamic";

const CreateMarketScreen = dynamic(() => import("@/screens/CreateMarketScreen"), { ssr: false });

export default function CreateMarketPage() {
  return <CreateMarketScreen />;
} 