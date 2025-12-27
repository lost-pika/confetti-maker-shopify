import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export const loader = async () => {
  // DO NOTHING
  // No auth
  // No prisma
  // No crash possible
  return null;
};

export default function AppIndex() {
  return (
    <ShopProvider>
      <ConfettiApp />
    </ShopProvider>
  );
}
