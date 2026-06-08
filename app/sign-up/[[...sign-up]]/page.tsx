import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-2xl w-full",
              headerTitle: "text-white font-bold text-2xl tracking-tight",
              headerSubtitle: "text-white/60 text-sm",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40 text-xs font-medium",
              formFieldLabel: "text-white/80 font-medium",
              formFieldInput: "bg-[#111] border border-white/10 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3",
              formButtonPrimary: "bg-white text-black hover:bg-white/90 font-bold rounded-xl py-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all",
              footerActionText: "text-white/60",
              footerActionLink: "text-blue-400 hover:text-blue-300 font-medium",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white/60",
            }
          }}
        />
      </div>
    </div>
  );
}
