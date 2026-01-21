import { getPublicBrowseInfo } from "@/actions/public";
import { auth } from "@/auth";
import {
    GraduationCap,
    Users,
    IndianRupee,
    Clock,
    BookOpen,
    AlertCircle,
    Phone
} from "lucide-react";

export default async function BrowsePage() {
    const session = await auth();
    const result = await getPublicBrowseInfo();

    const isLoggedIn = !!session?.user;
    const isPending = isLoggedIn && !session?.user?.isVerified;

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white">Unable to load information</h2>
                <p className="text-slate-400 mt-2">Please try again later</p>
            </div>
        );
    }

    const { batches, teachers, feeStructures, currentSession } = result.data;

    return (
        <div className="space-y-8">
            {/* Pending User Banner */}
            {isPending && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-amber-300 font-medium">Account Under Review</h3>
                        <p className="text-amber-200/80 text-sm mt-1">
                            Your account is pending verification. Browse our courses below and contact admin to complete enrollment.
                        </p>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-white mb-3">
                    Welcome to RK Institute
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Quality education and coaching for students of all classes.
                    Browse our available batches, teachers, and fee structure.
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                    <span className="text-indigo-300 text-sm">Academic Session: {currentSession}</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                    <BookOpen className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{batches.length}</div>
                    <div className="text-slate-400 text-sm">Active Batches</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                    <Users className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{teachers.length}</div>
                    <div className="text-slate-400 text-sm">Expert Teachers</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                    <GraduationCap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{feeStructures.length}</div>
                    <div className="text-slate-400 text-sm">Classes Offered</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                    <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">6+</div>
                    <div className="text-slate-400 text-sm">Years Experience</div>
                </div>
            </div>

            {/* Available Batches */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-400" />
                    Available Batches
                </h2>
                {batches.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <p className="text-slate-400">No batches available at the moment</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {batches.map((batch) => (
                            <div
                                key={batch.id}
                                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-white">{batch.name}</h3>
                                <p className="text-emerald-400 text-sm mt-1">₹{batch.fee?.toLocaleString('en-IN')}/month</p>
                                <div className="mt-3 space-y-2 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-500" />
                                        <span>Teacher: {batch.teacherName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-500" />
                                        <span>{batch.schedule || "Schedule TBA"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Fee Structure */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <IndianRupee className="h-6 w-6 text-emerald-400" />
                    Fee Structure
                </h2>
                {feeStructures.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <p className="text-slate-400">Fee structure will be updated soon</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Monthly Fee</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider hidden sm:table-cell">Admission Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {feeStructures.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-white font-medium">{fee.className}</td>
                                        <td className="px-6 py-4 text-right text-emerald-400 font-semibold">
                                            ₹{fee.monthlyFee.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-300 hidden sm:table-cell">
                                            ₹{fee.admissionFee.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Our Teachers */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-purple-400" />
                    Our Teachers
                </h2>
                {teachers.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <p className="text-slate-400">Teacher information will be updated soon</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-xl font-bold">
                                        {teacher.name.charAt(0)}
                                    </span>
                                </div>
                                <h3 className="text-white font-medium">{teacher.name}</h3>
                                <p className="text-slate-400 text-sm">Teacher</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Contact CTA */}
            <section className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Enroll?</h2>
                <p className="text-slate-300 mb-6">
                    Contact our admin to complete your admission process.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="tel:+919876543210"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Phone className="h-5 w-5" />
                        Call Now
                    </a>
                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Login to Account
                    </a>
                </div>
            </section>
        </div>
    );
}
