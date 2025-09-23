import { auth } from '@/auth';

export default auth((req) => {
  // Middleware apenas com autenticação, sem internacionalização
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};