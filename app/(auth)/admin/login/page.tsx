import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-5 py-16">
      <section className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-[#5f9500]">ZYRON CMS</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#0B0D10]">管理后台登录</h1>
        <p className="mb-8 mt-3 text-sm leading-6 text-neutral-600">请使用已授权的管理员账号继续。</p>
        <LoginForm />
      </section>
    </main>
  );
}
