"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ButtonPrint() {
  return (
    <Button variant="outline" size="lg" onClick={() => window.print()}>
      <Printer />
      Imprimer
    </Button>
  );
}
