import { Clock, LogOut } from 'lucide-react';

type Props = {
    email?: string;
    onSignOut?: () => void;
};

const AccessPendingPage = ({
    email = 'hr@shopup.org',
    onSignOut,
}: Props) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <Clock className="w-7 h-7 text-amber-700" strokeWidth={2} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 text-center mb-4">
                    Waiting for approval
                </h1>

                <p className="text-slate-600 text-center leading-relaxed mb-8">
                    Your request to access the HR portal has been sent to{' '}
                    <span className="font-semibold text-slate-900">{email}</span>. You'll
                    be able to access the application once an admin approves it.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Request status</span>
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                            Pending
                        </span>
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:bg-slate-50 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </div>

            <p className="mt-6 text-slate-500 text-sm">
                Questions? Write to{' '}
                <a href={`mailto:${email}`} className="text-teal-700 hover:underline">
                    {email}
                </a>
            </p>
        </div>
    );
};

export default AccessPendingPage;
