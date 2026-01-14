import QuoteForm from "@/components/QuoteForm";

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <QuoteForm />
        <footer className="mt-10 text-center text-xs text-slate-500">
          <div>📞 01392 931035 &nbsp;|&nbsp; 📧 nick@signature-cleans.co.uk</div>
          <div className="mt-2">© {new Date().getFullYear()} Signature Cleans</div>
        </footer>
      </div>
    </main>
  );
}
