import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Icon } from "@/components/Icon"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full text-center">
            {/* Branding */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <Icon name="spa" filled className="text-3xl text-primary" />
                <span className="text-2xl font-bold tracking-tight text-primary font-heading">FloraFile</span>
            </div>

            <h1 className="text-3xl font-extrabold font-heading text-on-surface mb-2">Welcome back</h1>
            <p className="text-on-surface-variant mb-8">Sign in to manage your garden.</p>

            {/* OAuth provider buttons */}
            <div className="space-y-4">
                {/* Google */}
                <form
                    action={async () => {
                        "use server"
                        await signIn("google")
                    }}
                >
                    <button
                        type="submit"
                        id="login-google"
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-6 py-4 rounded-full font-bold shadow-sm hover:bg-surface-container hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
                        Continue with Google
                    </button>
                </form>

                {/* GitHub */}
                <form
                    action={async () => {
                        "use server"
                        await signIn("github")
                    }}
                >
                    <button
                        type="submit"
                        id="login-github"
                        className="w-full bg-[#24292e] text-white px-6 py-4 rounded-full font-bold shadow-sm hover:bg-[#2c3238] hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="w-6 h-6 invert" />
                        Continue with GitHub
                    </button>
                </form>
            </div>
        </div>
    )
}
