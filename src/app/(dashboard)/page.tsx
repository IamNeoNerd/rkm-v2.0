import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { IndianRupee, Users, AlertCircle, Plus } from "lucide-react";
import { getDashboardData, getDashboardMetrics, getRecentActivity, getAdmissionsChartData, getRevenueChartData, getTeacherLoadData, getBatchActivityData, getSettlementModeData, getAttendanceLeaderboard } from "@/actions/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TeacherLoadChart, BatchActivityChart, SettlementMaturityChart, EngagementLeaderboard } from "@/components/dashboard/InstitutionalCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/modern/Button";

interface DashboardMetrics {
  revenue: number;
  activeStudents: number;
  pendingFees: number;
  revenueTrend?: string;
  revenueTrendUp?: boolean;
  studentsTrend?: string;
}

interface DashboardActivityItem {
  id: number;
  name: string;
  type: string;
  amount: number;
  createdAt: Date;
}

interface ChartItem {
  name: string;
  total: number;
}

async function DashboardContent() {
  // Fetch all data in parallel on the server
  const [, metricsData, activityData, admissionChartData, revenueChartData, teacherLoadData, batchActivityData, settlementModeData, leaderboardData] = await Promise.all([
    getDashboardData(),
    getDashboardMetrics(),
    getRecentActivity(),
    getAdmissionsChartData(),
    getRevenueChartData(),
    getTeacherLoadData(),
    getBatchActivityData(),
    getSettlementModeData(),
    getAttendanceLeaderboard()
  ]);

  const metrics = metricsData as DashboardMetrics;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedActivity = activityData.map((item: any) => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
  })) as DashboardActivityItem[];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue (Monthly)"
          value={`₹${metrics.revenue.toLocaleString()}`}
          icon={<IndianRupee className="h-5 w-5 text-primary" />}
          trend={metrics.revenueTrend}
          trendUp={metrics.revenueTrendUp}
          href="/reports/transactions"
        />
        <StatCard
          title="Active Students"
          value={metrics.activeStudents}
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={metrics.studentsTrend}
          trendUp={true}
          href="/students"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${metrics.pendingFees.toLocaleString()}`}
          icon={<AlertCircle className="h-5 w-5 text-cta" />}
          description="Total outstanding from families"
          className="bg-cta/5 border-cta/10"
          href="/reports/dues"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <OverviewChart data={admissionChartData as ChartItem[]} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity data={formattedActivity} />
        </div>
        <div className="lg:col-span-7">
          <RevenueChart data={revenueChartData as ChartItem[]} />
        </div>

        {/* Institutional Intelligence Layer */}
        <div className="lg:col-span-4">
          <TeacherLoadChart data={teacherLoadData} />
        </div>
        <div className="lg:col-span-3">
          <SettlementMaturityChart data={settlementModeData} />
        </div>
        <div className="lg:col-span-7">
          <BatchActivityChart data={batchActivityData} />
        </div>
        <div className="lg:col-span-7">
          <EngagementLeaderboard data={leaderboardData} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.user.role === "student") {
    redirect("/student/portal");
  }

  if (session.user.role === "parent") {
    redirect("/parent");
  }

  // Redirect staff members (teacher, cashier, etc) to their simplified dashboard
  // Only admin and super-admin see the main command center
  if (session.user.role !== "admin" && session.user.role !== "super-admin") {
    redirect("/staff/dashboard");
  }

  return (
    <div className="flex-1 space-y-10 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60"> System Overview </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground italic">
            COMMAND <span className="text-primary not-italic">CENTER</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="glass" size="lg" className="rounded-2xl border-white/40"> Download Reports </Button>
          <Button variant="primary" size="lg" className="rounded-2xl shadow-primary/20 shadow-xl">
            <Plus className="mr-2 h-5 w-5" />
            New Admission
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
