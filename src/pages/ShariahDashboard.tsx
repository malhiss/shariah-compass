import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { ScreeningTable } from "@/components/dashboard/ScreeningTable";
import { getClientFacingRecords } from "@/lib/shariah-api";
import { AppSidebar } from "@/components/AppSidebar";
import { Scale, Coins, ChevronLeft, ChevronRight, Loader2, Globe, MapPin } from "lucide-react";
import type { ScreeningFilters, ViewMode, PaginatedResponse, Universe } from "@/types/mongodb";
import type { ScreeningRecord } from "@/types/screening-record";

export default function ShariahDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("shariah");
  const [universe, setUniverse] = useState<Universe>("global");
  const [filters, setFilters] = useState<ScreeningFilters>({
    page: 1,
    pageSize: 50,
  });
  const [data, setData] = useState<PaginatedResponse<ScreeningRecord> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, universe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getClientFacingRecords({ ...filters, universe });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ScreeningFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
      pageSize: prev.pageSize ?? 50,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleUniverseChange = (newUniverse: Universe) => {
    setUniverse(newUniverse);
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            Screening Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive Shariah compliance and Zakat screening for {universe === "gcc" ? "GCC" : "global"} equities.
          </p>
        </div>

        {/* Universe Toggle */}
        <div className="mb-4 sm:mb-6">
          <Tabs value={universe} onValueChange={(v) => handleUniverseChange(v as Universe)}>
            <TabsList className="bg-muted/30">
              <TabsTrigger
                value="global"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global
              </TabsTrigger>
              <TabsTrigger
                value="gcc"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MapPin className="w-4 h-4 mr-2" />
                GCC
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* View Toggle */}
        <div className="mb-4 sm:mb-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="bg-muted/30">
              <TabsTrigger
                value="shariah"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scale className="w-4 h-4 mr-2" />
                Shariah
              </TabsTrigger>
              <TabsTrigger
                value="zakat"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Coins className="w-4 h-4 mr-2" />
                Zakat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4">
            <DashboardFilters filters={filters} onFiltersChange={handleFiltersChange} viewMode={viewMode} />
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${data?.data.length || 0} of ${data?.total || 0} records`
            )}
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <ScreeningTable
              data={data?.data || []}
              loading={loading}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </AppSidebar>
  );
}
