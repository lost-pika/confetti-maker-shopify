// app/routes/app._index.jsx
import ConfettiApp from "../../src/components/ConfettiApp";
import { ShopProvider } from "../../src/context/ShopContext";

export default function AppIndex() {
  return (
    <ShopProvider>
      <ConfettiApp />
    </ShopProvider>
  );
}
