
"use client";

import { useState, useEffect, useCallback } from "react"
import { FamilyCard } from "@/components/dashboard/FamilyCard"
import { FeeCollectionModal } from "@/components/modals/FeeCollectionModal"
import { Family } from "@/types"
import { Input } from "@/components/ui/input"
import { Search, IndianRupee, Users, AlertCircle, TrendingUp } from "lucide-react"
import { getDashboardData, getDashboardMetrics, getRecentActivity, getAdmissionsChartData } from "@/actions/dashboard"
import { processPayment } from "@/actions/billing"
import { toast } from "sonner"
// import { SummaryCards } from "@/components/dashboard/SummaryCards" // Replacing this with StatCards
import { StatCard } from "@/components/dashboard/StatCard"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function DashboardPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({ revenue: 0, activeStudents: 0, pendingFees: 0 })
  const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>([])
  const [chartData, setChartData] = useState<ChartItem[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [data, metricsData, activityData, chartD] = await Promise.all([
        getDashboardData(),
        getDashboardMetrics(),
        getRecentActivity(),
        getAdmissionsChartData()
      ]);

      setFamilies(data);
      setMetrics(metricsData as DashboardMetrics);

      const formattedActivity = activityData.map((item: { createdAt?: string | Date | null }) => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
      }));
      setRecentActivity(formattedActivity as DashboardActivityItem[]);
      setChartData(chartD as ChartItem[]);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, [loadData]);

  const handleCollectFee = (family: Family) => {
    setSelectedFamily(family)
    setModalOpen(true)
  }

  const handlePaymentSubmit = async (amount: number, mode: "CASH" | "UPI") => {
    if (!selectedFamily) return;

    try {
      const result = await processPayment({
        familyId: selectedFamily.id,
        amount: amount,
        mode: mode
      });

      if (result && "error" in result) {
        toast.error(`Error: ${result.error}`);
      } else {
        toast.success("Payment Successful!");
        setModalOpen(false);
        loadData(); // Reload data
      }
    } catch (e) {
      toast.error("System error during payment.");
    }
  }

  const filteredFamilies = families.filter(family =>
    family.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.children.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <div className="p-8">Loading Command Center...</div>

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h2>
      </div>

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
        <OverviewChart data={chartData} />
        <RecentActivity data={recentActivity} />
      </div>

      <Tabs defaultValue="families" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="families">All Families</TabsTrigger>
            {/* <TabsTrigger value="defaulters">Defaulters</TabsTrigger> */}
          </TabsList>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by father or child..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="families" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFamilies.map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
                onCollectFee={handleCollectFee}
              />
            ))}
            {filteredFamilies.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No families found matching your search.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedFamily && (
        <FeeCollectionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          totalDue={selectedFamily.total_due}
          studentName={selectedFamily.children.map(c => c.name).join(", ")}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  )
}
