import { Suspense } from "react";
import { IndianRupee, Users, AlertCircle } from "lucide-react";
import { getDashboardData, getDashboardMetrics, getRecentActivity, getAdmissionsChartData } from "@/actions/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DashboardSkeleton } from "@/components/ui/skeletons";

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
  const [families, metricsData, activityData, chartData] = await Promise.all([
    getDashboardData(),
    getDashboardMetrics(),
    getRecentActivity(),
    getAdmissionsChartData()
  ]);

  const metrics = metricsData as DashboardMetrics;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedActivity = activityData.map((item: any) => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
  })) as DashboardActivityItem[];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue (Monthly)"
          value={`₹${metrics.revenue.toLocaleString()}`}
          icon={<IndianRupee className="h-4 w-4 text-green-600" />}
          trend={metrics.revenueTrend}
          trendUp={metrics.revenueTrendUp}
        />
        <StatCard
          title="Active Students"
          value={metrics.activeStudents}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          trend={metrics.studentsTrend}
          trendUp={true}
        />
        <StatCard
          title="Pending Fees"
          value={`₹${metrics.pendingFees.toLocaleString()}`}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          description="Total outstanding from families"
          className="border-red-100 bg-red-50/10"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart data={chartData as ChartItem[]} />
        <RecentActivity data={formattedActivity} />
      </div>

      <DashboardClient initialFamilies={families} />
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h2>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
