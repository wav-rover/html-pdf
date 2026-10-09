import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Alert as AlertBase, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Centered card shell shared by all auth pages. */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

export function Field({ label, name, ...props }: { label: string; name: string } & ComponentProps<"input">) {
  return (
    <div className="mb-4 grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="h-10" {...props} />
    </div>
  );
}

export function SubmitButton({ children, ...props }: ComponentProps<"button">) {
  return (
    <Button {...props} type="submit" className="h-10 w-full">
      {children}
    </Button>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  return (
    <AlertBase
      variant={kind === "error" ? "destructive" : "default"}
      className={kind === "success" ? "mb-4 border-primary/30 text-primary" : "mb-4"}
    >
      <AlertDescription className={kind === "success" ? "text-primary" : undefined}>{children}</AlertDescription>
    </AlertBase>
  );
}

export function FooterLinks({ children }: { children: ReactNode }) {
  return <div className="mt-6 space-y-1 text-center text-sm text-muted-foreground">{children}</div>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-foreground underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
