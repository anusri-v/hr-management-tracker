import { GoogleLogin } from '@react-oauth/google';
import { Lock } from 'lucide-react';

type Props = {
    onCredential: (credential: string) => void;
    onError?: () => void;
    error?: string | null;
};

const LoginPage = ({ onCredential, onError, error }: Props) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="bg-teal-400 p-12 flex flex-col justify-between text-white min-h-[600px]">

                    <div className="my-12">
                        <h1 className="text-5xl font-bold leading-tight">
                            Shop
                            <span className="text-amber-300">Up</span>
                        </h1>
                        <p className="mt-6 text-white/90">
                            Employee Management Portal
                        </p>
                    </div>
                </div>

                <div className="p-12 flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-[0.2em] text-teal-700 font-semibold mb-3">
                        Sign in
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Welcome</h2>
                    <p className="mt-4 text-slate-600">
                        Use your{' '}
                        <span className="font-semibold text-slate-900">@shopup.org / @silq.net</span>{' '}
                        account to continue.
                    </p>

                    <div className="mt-8">
                        <GoogleLogin
                            hosted_domain="shopup.org"
                            text="continue_with"
                            theme="outline"
                            size="large"
                            width="400"
                            onSuccess={(res) => res.credential && onCredential(res.credential)}
                            onError={onError}
                        />
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5 text-sm text-slate-700">
                        <Lock className="w-4 h-4 text-teal-700 flex-shrink-0" />
                        <span>
                            Only <span className="font-semibold">@shopup.org / @silq.net</span> accounts can access this portal.
                        </span>
                    </div>

                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
