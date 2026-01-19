import { tusServer } from "@/lib/upload/tus-server";

export async function OPTIONS(request: Request) {
  return (tusServer as any).handle(request);
}

export async function POST(request: Request) {
  return (tusServer as any).handle(request);
}

export async function PATCH(request: Request) {
  return (tusServer as any).handle(request);
}

export async function HEAD(request: Request) {
  return (tusServer as any).handle(request);
}

export async function DELETE(request: Request) {
  return (tusServer as any).handle(request);
}
